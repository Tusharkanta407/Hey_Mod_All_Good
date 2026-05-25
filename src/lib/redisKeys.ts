export const redisKeys = {
  post: (postId: string) => `post:${postId}`,
  mail: (conversationId: string) => `mail:${conversationId}`,
  statsScreened: (date: string) => `stats:${date}:screened`,
  statsShielded: (date: string) => `stats:${date}:shielded`,
  statsSafe: (date: string) => `stats:${date}:safe`,
} as const;

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}
