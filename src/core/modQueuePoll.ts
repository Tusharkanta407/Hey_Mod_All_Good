import { context, reddit } from '@devvit/web/server';
import { isPostAlreadyScanned, scanPost } from './scanPost';
import { normalizePostId } from '../lib/redisQueue';

const MAX_SCANS_PER_RUN = 5;

/**
 * Poll native mod queue and Gemini-scan posts we have not seen yet.
 * Catches items that entered the queue without firing onPostReport.
 */
export async function pollModQueueAndScan(): Promise<void> {
  const subName = context.subredditName;
  if (!subName) {
    console.warn('ModShield mod queue poll: no subreddit in context');
    return;
  }

  let sub;
  try {
    sub = await reddit.getSubredditByName(subName);
  } catch (err) {
    console.error('ModShield mod queue poll: subreddit lookup failed', err);
    return;
  }

  const listing = sub.getModQueue({ type: 'post' });
  const posts = await listing.get(25);

  let scanned = 0;
  for (const post of posts) {
    if (scanned >= MAX_SCANS_PER_RUN) break;
    const postId = normalizePostId(post.id);
    if (await isPostAlreadyScanned(postId)) continue;
    await scanPost(postId, 'modqueue');
    scanned += 1;
  }

  console.log(
    `ModShield mod queue poll: ${scanned} new scan(s) (${posts.length} posts checked)`
  );
}
