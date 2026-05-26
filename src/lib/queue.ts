import { redis } from '@devvit/web/server';
import { redisKeys, todayKey } from './redisKeys';
import type {
  ModmailShieldResult,
  PostShieldResult,
  QuarantineResponseDto,
  QueueItemDto,
  ShieldPriority,
  ShieldStatsDto,
} from './types';

function priorityLabel(p: ShieldPriority): QueueItemDto['priority'] {
  switch (p) {
    case 'critical':
      return 'Critical';
    case 'important':
      return 'High';
    case 'review':
      return 'Medium';
    case 'spam':
    case 'low':
    default:
      return 'Low';
  }
}

function emotionalLoad(
  priority: ShieldPriority,
  tags: string[] = []
): QueueItemDto['emotionalLoad'] {
  if (priority === 'critical') return 'Critical';
  if (tags.includes('hostile') || tags.includes('threat')) return 'Harmful';
  if (priority === 'important') return 'Elevated';
  if (priority === 'review') return 'Tense';
  return 'Calm';
}

function postItemType(category: string): QueueItemDto['type'] {
  const c = category.toLowerCase();
  if (c.includes('harass')) return 'Harassment';
  if (
    c.includes('violence') ||
    c.includes('nsfw') ||
    c.includes('self') ||
    c.includes('sexual')
  ) {
    return 'Graphic';
  }
  return 'Graphic';
}

function postTitle(result: PostShieldResult): string {
  if (result.intercepted) {
    return 'Graphic content intercepted';
  }
  const cat = result.category.replace(/_/g, ' ');
  return `${cat} flagged — review safely`;
}

/** Newest-first members (scores are Date.now() timestamps, not 0–49). */
async function recentIds(key: string, limit = 50): Promise<string[]> {
  const rows = await redis.zRange(key, '-inf', '+inf', {
    by: 'score',
    reverse: true,
    limit: { offset: 0, count: limit },
  });
  if (!rows?.length) return [];
  return rows.map((r) => r.member).filter(Boolean);
}

function mapPost(result: PostShieldResult): QueueItemDto {
  const item: QueueItemDto = {
    id: `post:${result.postId}`,
    source: 'post',
    type: postItemType(result.category),
    title: postTitle(result),
    priority: priorityLabel(result.priority),
    emotionalLoad: emotionalLoad(result.priority),
    summary: result.summary,
    confidence: result.confidence,
    intercepted: result.intercepted ?? false,
    timestamp: new Date(result.at).toISOString(),
    handled: result.handled ?? false,
  };
  if (result.imageUrl) item.imageUrl = result.imageUrl;
  if (result.originalContent) item.originalContent = result.originalContent;
  return item;
}

function mapMail(result: ModmailShieldResult): QueueItemDto {
  const tags = result.tags ?? [];
  const item: QueueItemDto = {
    id: `mail:${result.conversationId}`,
    source: 'mail',
    type: 'Appeal',
    title: result.intercepted
      ? 'Hostile modmail intercepted'
      : 'Modmail needs review',
    priority: priorityLabel(result.priority),
    emotionalLoad: emotionalLoad(result.priority, tags),
    summary: result.summary,
    intercepted: result.intercepted ?? false,
    timestamp: new Date(result.at).toISOString(),
    handled: result.handled ?? false,
  };
  if (result.originalContent) item.originalContent = result.originalContent;
  return item;
}

export async function loadQuarantine(): Promise<QuarantineResponseDto> {
  const items = await loadQueue();
  return {
    items,
    posts: items.filter((i) => i.source === 'post'),
    mail: items.filter((i) => i.source === 'mail'),
  };
}

export async function loadQueue(): Promise<QueueItemDto[]> {
  const [postIds, mailIds] = await Promise.all([
    recentIds(redisKeys.recentPosts),
    recentIds(redisKeys.recentMail),
  ]);

  const items: QueueItemDto[] = [];

  for (const id of postIds) {
    const raw = await redis.get(redisKeys.post(id));
    if (!raw) continue;
    const parsed = JSON.parse(raw) as PostShieldResult;
    items.push(mapPost(parsed));
  }

  for (const convId of mailIds) {
    const raw = await redis.get(redisKeys.mail(convId));
    if (!raw) continue;
    const parsed = JSON.parse(raw) as ModmailShieldResult;
    items.push(mapMail(parsed));
  }

  const rank: Record<string, number> = {
    Critical: 0,
    High: 1,
    Medium: 2,
    Low: 3,
  };

  const pending = items.filter((i) => !i.handled);
  console.log(
    `[ModShield] Quarantine load: ${pending.length} pending (${postIds.length} posts, ${mailIds.length} mail in redis)`
  );

  return pending.sort((a, b) => {
      const pr = (rank[a.priority] ?? 9) - (rank[b.priority] ?? 9);
      if (pr !== 0) return pr;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
}

export async function loadStats(): Promise<ShieldStatsDto> {
  const day = todayKey();
  const [screened, shielded, safe, queue] = await Promise.all([
    redis.get(redisKeys.statsScreened(day)),
    redis.get(redisKeys.statsShielded(day)),
    redis.get(redisKeys.statsSafe(day)),
    loadQueue(),
  ]);

  let calm = 0;
  let tense = 0;
  let harmful = 0;
  for (const item of queue) {
    const load = item.emotionalLoad;
    if (load === 'Critical' || load === 'Harmful') harmful += 1;
    else if (load === 'Elevated' || load === 'Tense') tense += 1;
    else calm += 1;
  }

  return {
    screened: Number(screened ?? 0),
    shielded: Number(shielded ?? 0),
    safe: Number(safe ?? 0),
    pending: queue.length,
    calm,
    tense,
    harmful,
  };
}

export async function markHandled(itemId: string): Promise<boolean> {
  if (itemId.startsWith('post:')) {
    const postId = itemId.slice(5);
    const raw = await redis.get(redisKeys.post(postId));
    if (!raw) return false;
    const data = JSON.parse(raw) as PostShieldResult;
    data.handled = true;
    await redis.set(redisKeys.post(postId), JSON.stringify(data));
    return true;
  }

  if (itemId.startsWith('mail:')) {
    const convId = itemId.slice(5);
    const raw = await redis.get(redisKeys.mail(convId));
    if (!raw) return false;
    const data = JSON.parse(raw) as ModmailShieldResult;
    data.handled = true;
    await redis.set(redisKeys.mail(convId), JSON.stringify(data));
    return true;
  }

  return false;
}
