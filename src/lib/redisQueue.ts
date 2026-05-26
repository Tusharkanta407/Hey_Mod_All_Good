import { redis } from '@devvit/web/server';

/** Keep the N newest members (highest scores) in a sorted set. */
export async function trimRecentZSet(key: string, maxSize = 100): Promise<void> {
  const count = await redis.zCard(key);
  if (count > maxSize) {
    await redis.zRemRangeByRank(key, 0, count - maxSize - 1);
  }
}

export function normalizePostId(postId: string): string {
  return postId.replace(/^t3_/, '');
}
