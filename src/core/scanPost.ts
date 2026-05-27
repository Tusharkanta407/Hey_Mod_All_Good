import { reddit, redis, settings } from '@devvit/web/server';
import {
  analyzePostWithGpt,
  getGeminiApiKey,
  moderateContent,
} from '../lib/ai';
import { redisKeys, todayKey } from '../lib/redisKeys';
import { normalizePostId, trimRecentZSet } from '../lib/redisQueue';
import type { InterceptMode, PostShieldResult, ShieldPriority } from '../lib/types';

export type ScanSource = 'report' | 'modqueue' | 'automod';

function postFullId(postId: string): `t3_${string}` {
  const bare = normalizePostId(postId);
  return (bare.startsWith('t3_') ? bare : `t3_${bare}`) as `t3_${string}`;
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

async function bumpStats(flagged: boolean): Promise<void> {
  const day = todayKey();
  await redis.incrBy(redisKeys.statsScreened(day), 1);
  if (flagged) {
    await redis.incrBy(redisKeys.statsShielded(day), 1);
  } else {
    await redis.incrBy(redisKeys.statsSafe(day), 1);
  }
}

export async function isPostAlreadyScanned(postId: string): Promise<boolean> {
  const raw = await redis.get(redisKeys.post(normalizePostId(postId)));
  return Boolean(raw);
}

function imageUrlFromPost(post: {
  url?: string;
  gallery?: { url?: string }[];
}): string | undefined {
  const galleryUrl = post.gallery?.[0]?.url;
  if (galleryUrl) return galleryUrl;
  const url = post.url ?? '';
  if (/\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url) || url.includes('i.redd.it')) {
    return url;
  }
  return undefined;
}

/**
 * Scan one post with Gemini — only call when it is in / heading to mod queue.
 * Skips if we already scanned this post id (saves API cost on re-reports).
 */
export async function scanPost(
  postIdRaw: string,
  source: ScanSource,
  options?: { reportReason?: string; automodReason?: string }
): Promise<void> {
  const postId = normalizePostId(postIdRaw);
  if (await isPostAlreadyScanned(postId)) {
    console.log(`ModShield skip ${postId} — already scanned`);
    return;
  }

  let post;
  try {
    post = await reddit.getPostById(postFullId(postId));
  } catch (err) {
    console.error(`ModShield could not load post ${postId}:`, err);
    return;
  }

  const title = post.title ?? '';
  const body = post.body ?? '';
  const text = `${title}\n${body}`.trim();
  const imageUrl = imageUrlFromPost(post);

  let category = 'mod_queue';
  let priority: ShieldPriority = 'review';
  let confidence = 0;
  let summary =
    source === 'report'
      ? `Reported: ${options?.reportReason || 'community report'}`
      : source === 'automod'
        ? `Automod: ${options?.automodReason || 'filtered to mod queue'}`
        : 'In mod queue — needs protected review.';
  let flagged = true;

  const apiKey = await getGeminiApiKey();

  if (apiKey && text) {
    try {
      const mod = await moderateContent(apiKey, text, imageUrl);
      flagged = mod.flagged || mod.topScore >= 0.5;
      category = mod.topCategory;
      confidence = Math.round(mod.topScore * 100);
      priority = mapModerationToPriority(mod.topCategory, mod.topScore, mod.flagged);

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
    } catch (err) {
      console.error('ModShield Gemini scan error:', err);
      summary = 'Shield scan failed — review manually in Protected Review.';
      priority = 'review';
    }
  } else if (!apiKey) {
    console.warn('ModShield: geminiApiKey not set');
    summary = 'AI not configured — set Gemini key in app settings.';
  } else {
    summary = 'Media-only post in mod queue — review manually.';
  }

  const interceptMode =
    (await settings.get<InterceptMode>('interceptMode')) ?? 'audit';
  let intercepted = false;

  if (interceptMode === 'intercept' && priority === 'critical' && confidence >= 70) {
    try {
      await reddit.remove(postFullId(postId), false);
      intercepted = true;
      console.log(`ModShield intercepted critical post ${postId}`);
    } catch (err) {
      console.error('Failed to auto-remove post:', err);
    }
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
    scanSource: source,
    ...(options?.reportReason && { reportReason: options.reportReason }),
  };
  if (imageUrl) result.imageUrl = imageUrl;
  if (body.trim()) result.originalContent = body.trim().slice(0, 4000);

  await redis.set(redisKeys.post(postId), JSON.stringify(result));

  await redis.zAdd(redisKeys.recentPosts, {
    score: Date.now(),
    member: postId,
  });
  await trimRecentZSet(redisKeys.recentPosts);

  await bumpStats(flagged);
  console.log(
    `ModShield scanned (${source}) ${postId}: ${priority} — ${summary.slice(0, 80)}`
  );
}
