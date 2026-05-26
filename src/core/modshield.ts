import { reddit, redis, settings } from '@devvit/web/server';
import type { OnModMailRequest, OnPostCreateRequest } from '@devvit/web/shared';
import { classifyModmailLocal, parseCustomBuzzWords } from '../lib/modmailClassifier';
import {
  analyzeModmailWithGpt,
  analyzePostWithGpt,
  getGeminiApiKey,
  moderateContent,
} from '../lib/ai';
import { redisKeys, todayKey } from '../lib/redisKeys';
import { normalizePostId, trimRecentZSet } from '../lib/redisQueue';
import type {
  ModmailShieldResult,
  PostShieldResult,
  ShieldMode,
  ShieldPriority,
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

function mapModerationToPriority(
  topCategory: string,
  topScore: number,
  flagged: boolean
): ShieldPriority {
  if (!flagged && topScore < 0.3) return 'low';
  const cat = topCategory.toLowerCase();
  if (cat.includes('self-harm') || cat.includes('self_harm')) return 'critical';
  if (cat.includes('violence') && cat.includes('graphic')) return 'critical';
  if (cat.includes('harassment') || cat.includes('violence')) return 'important';
  if (cat.includes('sexual') || cat.includes('hate')) return 'review';
  if (topScore > 0.7) return 'important';
  return 'review';
}

export async function handlePostCreate(
  event: OnPostCreateRequest
): Promise<void> {
  const post = event.post;
  if (!post?.id) {
    console.warn('PostCreate: missing post id');
    return;
  }

  const postId = normalizePostId(post.id);
  const title = post.title ?? '';
  const body = post.selftext ?? '';
  const text = `${title}\n${body}`.trim();
  const imageUrl =
    post.isImage && post.url ? post.url : post.mediaUrls?.[0];

  let category = 'safe';
  let priority: ShieldPriority = 'low';
  let confidence = 0;
  let summary = 'No flags — safe content.';
  let flagged = false;

  const apiKey = await getGeminiApiKey();

  if (apiKey && text) {
    try {
      const mod = await moderateContent(apiKey, text, imageUrl);
      flagged = mod.flagged || mod.topScore >= 0.5;
      category = mod.topCategory;
      confidence = Math.round(mod.topScore * 100);
      priority = mapModerationToPriority(mod.topCategory, mod.topScore, mod.flagged);

      if (flagged) {
        const gpt = await analyzePostWithGpt(
          apiKey,
          title,
          body,
          `${mod.topCategory} (${mod.topScore})`
        );
        category = gpt.category ?? category;
        priority = gpt.priority ?? priority;
        confidence = gpt.confidence ?? confidence;
        summary = gpt.summary ?? summary;
      }
    } catch (err) {
      console.error('PostCreate Gemini error:', err);
      summary = 'Shield scan failed — review manually.';
      priority = 'review';
    }
  } else if (!apiKey) {
    console.warn('PostCreate: GEMINI_API_KEY / geminiApiKey not set');
    summary = 'AI not configured — set Gemini key in .env or app settings.';
    priority = 'review';
  }

  const interceptMode =
    (await settings.get<InterceptMode>('interceptMode')) ?? 'audit';
  let intercepted = false;

  if (interceptMode === 'intercept' && priority === 'critical' && confidence >= 70) {
    try {
      const postFullId = (
        post.id.startsWith('t3_') ? post.id : `t3_${post.id}`
      ) as `t3_${string}`;
      await reddit.remove(postFullId, false);
      intercepted = true;
      console.log(`ModShield intercepted and removed critical post ${post.id}`);
    } catch (err) {
      console.error('Failed to auto-remove post:', err);
    }
  }

  if (priority !== 'low' || intercepted) {
    flagged = true;
  }

  const result: PostShieldResult = {
    postId,
    title,
    category,
    priority,
    confidence,
    summary,
    flagged,
    intercepted,
    handled: false,
    at: Date.now(),
  };
  if (imageUrl) result.imageUrl = imageUrl;
  if (body.trim()) result.originalContent = body.trim().slice(0, 4000);

  await redis.set(redisKeys.post(postId), JSON.stringify(result));

  if (flagged || priority !== 'low' || intercepted) {
    await redis.zAdd(redisKeys.recentPosts, {
      score: Date.now(),
      member: postId,
    });
    await trimRecentZSet(redisKeys.recentPosts);
    console.log(`ModShield queued post ${postId} for Protected Review`);
  }

  await bumpStats(flagged);
  console.log(`ModShield post ${postId}: ${priority} — ${summary}`);
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
        body: `ModShield intercepted: ${summary}\n\n[Thread archived — open Protected Review Quarantine to handle safely.]`,
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
