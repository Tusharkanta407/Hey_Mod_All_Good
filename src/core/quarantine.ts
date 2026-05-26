import { context, reddit, redis } from '@devvit/web/server';
import { redisKeys } from '../lib/redisKeys';

const QUARANTINE_TITLE = '🛡️ Hey_Mod_all_Good — Protected Review Quarantine';

export async function ensureQuarantinePost(
  subredditName: string
): Promise<string | undefined> {
  const existing = await redis.get(redisKeys.dashboardPostId);
  if (existing) {
    return existing;
  }

  try {
    const post = await reddit.submitCustomPost({
      subredditName,
      title: QUARANTINE_TITLE,
      entry: 'default',
      splash: {
        appDisplayName: 'ModShield',
        description: 'Protected Review Mode — content intercepted before it reached you.',
        buttonLabel: 'Open quarantine',
        heading: 'ModShield Quarantine',
      },
    });

    const id = post.id.replace(/^t3_/, '');
    await redis.set(redisKeys.dashboardPostId, id);
    return id;
  } catch (err) {
    console.error('Failed to create quarantine post:', err);
    return undefined;
  }
}

export async function getQuarantinePostUrl(): Promise<string | undefined> {
  const id = await redis.get(redisKeys.dashboardPostId);
  if (!id) return undefined;
  const sub = context.subredditName;
  if (sub) {
    return `https://www.reddit.com/r/${sub}/comments/${id}`;
  }
  return `https://www.reddit.com/comments/${id}`;
}
