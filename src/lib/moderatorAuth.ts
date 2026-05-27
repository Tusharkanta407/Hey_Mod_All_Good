import { context, reddit } from '@devvit/web/server';

/** True if the current user moderates this subreddit (playtest + production). */
export async function isCurrentUserModerator(): Promise<boolean> {
  try {
    const subredditName = context.subredditName;
    if (!subredditName) {
      console.warn('[ModShield] No subredditName in context');
      return false;
    }

    const username = await reddit.getCurrentUsername();
    if (!username) {
      return false;
    }

    const listing = reddit.getModerators({
      subredditName,
      username,
      pageSize: 1,
    });
    const mods = await listing.all();
    return mods.length > 0;
  } catch (err) {
    console.error('[ModShield] moderator check failed:', err);
    return false;
  }
}
