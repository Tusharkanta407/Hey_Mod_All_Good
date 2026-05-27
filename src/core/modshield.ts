import { reddit, redis, settings } from '@devvit/web/server';
import type {
  OnAutomoderatorFilterPostRequest,
  OnModMailRequest,
  OnPostReportRequest,
} from '@devvit/web/shared';
import { classifyModmailLocal, parseCustomBuzzWords } from '../lib/modmailClassifier';
import {
  analyzeModmailWithGpt,
  getGeminiApiKey,
  moderateContent,
} from '../lib/ai';
import { redisKeys, todayKey } from '../lib/redisKeys';
import { trimRecentZSet } from '../lib/redisQueue';
import { scanPost } from './scanPost';
import type {
  ModmailShieldResult,
  PostShieldResult,
  ShieldMode,
  InterceptMode,
} from '../lib/types';

async function bumpStats(flagged: boolean): Promise<void> {
  const day = todayKey();
  await redis.incrBy(redisKeys.statsScreened(day), 1);
  if (flagged) {
    await redis.incrBy(redisKeys.statsShielded(day), 1);
  } else {
    await redis.incrBy(redisKeys.statsSafe(day), 1);
  }
}

/** User reported → post is in mod queue → scan once with Gemini */
export async function handlePostReport(event: OnPostReportRequest): Promise<void> {
  const postId = event.post?.id;
  if (!postId) {
    console.warn('PostReport: missing post id');
    return;
  }
  await scanPost(postId, 'report', { reportReason: event.reason });
}

/** Automod filtered to mod queue → scan once */
export async function handleAutomoderatorFilterPost(
  event: OnAutomoderatorFilterPostRequest
): Promise<void> {
  const postId = event.post?.id;
  if (!postId) {
    console.warn('AutomoderatorFilterPost: missing post id');
    return;
  }
  await scanPost(postId, 'automod', { automodReason: event.reason });
}

export async function handleModMail(event: OnModMailRequest): Promise<void> {
  const { conversationId, messageId } = event;
  if (!conversationId || !messageId) {
    console.warn('ModMail: missing conversationId or messageId');
    return;
  }

  let body = '';
  try {
    const conv = await reddit.modMail.getConversation({
      conversationId,
      markRead: false,
    });
    const msgKey = messageId.includes('_')
      ? messageId.split('_').slice(1).join('_')
      : messageId;
    const message =
      conv.conversation?.messages?.[msgKey] ??
      Object.values(conv.conversation?.messages ?? {}).at(-1);
    body = message?.body ?? '';
  } catch (err) {
    console.error('ModMail getConversation error:', err);
    return;
  }

  if (!body.trim()) {
    console.warn('ModMail: empty message body');
    return;
  }

  const customRaw = await settings.get<string>('customBuzzWords');
  const local = classifyModmailLocal(body, parseCustomBuzzWords(customRaw));

  let summary = `Local scan: ${local.tags.join(', ') || 'no tags'} (risk ${local.riskScore})`;
  let priority = local.priority;
  let intent: string | undefined;
  let tone: string | undefined;
  let rule: string | undefined;
  let action: string | undefined;
  let replyMessage: string | undefined;

  const apiKey = await getGeminiApiKey();
  const rules =
    (await settings.get<string>('subredditRules')) ??
    'Rule 1: No spam\nRule 2: No off-topic\nRule 3: No harassment\nRule 4: No NSFW';

  if (apiKey && local.needsGPT) {
    try {
      if (local.riskScore >= 45) {
        await moderateContent(apiKey, body);
      }
      const gpt = await analyzeModmailWithGpt(apiKey, body, rules, local.tags);
      summary = gpt.mod_summary;
      priority = gpt.priority ?? priority;
      intent = gpt.intent;
      tone = gpt.tone;
      rule = gpt.rule_broken;
      action = gpt.action;
      replyMessage = gpt.reply_message;
    } catch (err) {
      console.error('ModMail Gemini error:', err);
      summary = `Local: ${local.tags.join(', ') || 'flagged'} — AI summary unavailable.`;
      action = 'escalate_to_mod';
    }
  }

  const mode = (await settings.get<ShieldMode>('shieldMode')) ?? 'escalate_only';
  const interceptMode =
    (await settings.get<InterceptMode>('interceptMode')) ?? 'audit';
  let intercepted = false;

  if (interceptMode === 'intercept' && priority === 'critical' && local.riskScore >= 45) {
    try {
      await reddit.modMail.archiveConversation(conversationId);
      await reddit.modMail.reply({
        conversationId,
        body: `Hey mod, all good intercepted: ${summary}\n\n[Thread archived — open Protected Review to handle safely.]`,
        isInternal: true,
      });
      intercepted = true;
      console.log(`ModShield intercepted and archived modmail ${conversationId}`);
    } catch (err) {
      console.error('Failed to auto-archive modmail:', err);
    }
  }

  const stored: ModmailShieldResult = {
    conversationId,
    summary,
    tags: local.tags,
    priority,
    localRiskScore: local.riskScore,
    intercepted,
    originalContent: body,
    handled: false,
    at: Date.now(),
    ...(intent !== undefined && { intent }),
    ...(tone !== undefined && { tone }),
    ...(rule !== undefined && { rule }),
    ...(action !== undefined && { action }),
  };

  await redis.set(redisKeys.mail(conversationId), JSON.stringify(stored));

  if (local.riskScore >= 20 || priority !== 'low' || intercepted) {
    await redis.zAdd(redisKeys.recentMail, {
      score: Date.now(),
      member: conversationId,
    });
    await trimRecentZSet(redisKeys.recentMail);
  }

  await bumpStats(local.riskScore >= 20);

  if (
    mode === 'full_auto' &&
    action === 'auto_reply' &&
    replyMessage?.trim()
  ) {
    try {
      await reddit.modMail.reply({
        conversationId,
        body: replyMessage.trim(),
      });
      console.log(`ModShield auto-replied to ${conversationId}`);
    } catch (err) {
      console.error('ModMail reply error:', err);
    }
  }

  console.log(`ModShield mail ${conversationId}: ${priority} — ${summary}`);
}

export async function getPostSummary(postId: string): Promise<string | null> {
  const raw = await redis.get(redisKeys.post(postId));
  if (!raw) return null;
  const data = JSON.parse(raw) as PostShieldResult;
  return `[${data.priority.toUpperCase()}] ${data.summary}`;
}
