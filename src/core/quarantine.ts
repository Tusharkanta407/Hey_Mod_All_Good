import { context, reddit, redis } from '@devvit/web/server';
import { BRAND } from '../lib/brand';
import { redisKeys } from '../lib/redisKeys';

export async function ensureQuarantinePost(
  subredditName: string
): Promise<string | undefined> {
  const existing = await redis.get(redisKeys.dashboardPostId);
  const version = await redis.get(redisKeys.dashboardBrandVersion);

  if (existing && version === BRAND.brandVersion) {
    return existing;
  }

  if (existing && version !== BRAND.brandVersion) {
    console.log(
      `[${BRAND.name}] Refreshing dashboard post (brand v${version ?? '?'} → v${BRAND.brandVersion})`
    );
  }

  try {
    const post = await reddit.submitCustomPost({
      subredditName,
      title: BRAND.quarantineTitle,
      entry: 'default',
      splash: {
        appDisplayName: BRAND.name,
        appIconUri: 'reddit_logo.png',
        description:
          'Moderators only — protected review dashboard for this subreddit.',
        buttonLabel: 'Open dashboard',
        heading: `${BRAND.name} (mods only)`,
      },
      styles: {
        backgroundColor: '#000000FF',
        backgroundColorDark: '#000000FF',
        height: 'TALL',
      },
    });

    const id = post.id.replace(/^t3_/, '');
    await redis.set(redisKeys.dashboardPostId, id);
    await redis.set(redisKeys.dashboardBrandVersion, BRAND.brandVersion);
    return id;
  } catch (err) {
    console.error('Failed to create quarantine post:', err);
    return existing ?? undefined;
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
