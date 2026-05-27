import { normalizePostId } from './redisQueue';

export const redisKeys = {
  post: (postId: string) => `post:${normalizePostId(postId)}`,
  mail: (conversationId: string) => `mail:${conversationId}`,
  statsScreened: (date: string) => `stats:${date}:screened`,
  statsShielded: (date: string) => `stats:${date}:shielded`,
  statsSafe: (date: string) => `stats:${date}:safe`,
  recentPosts: 'shield:posts:recent',
  recentMail: 'shield:mail:recent',
  dashboardPostId: 'shield:dashboard:postId',
  dashboardBrandVersion: 'shield:dashboard:brandVersion',
} as const;

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
