import { reddit } from '@devvit/web/server';
import { normalizePostId } from './redisQueue';
import { markHandled } from './queue';

export type ModerationAction = 'approve' | 'remove';

function postFullId(postId: string): `t3_${string}` {
  const bare = normalizePostId(postId);
  return (bare.startsWith('t3_') ? bare : `t3_${bare}`) as `t3_${string}`;
}

export type ActionResult = {
  ok: boolean;
  error?: string;
};

/** Approve or remove on Reddit, then clear from Protected Review queue. */
export async function applyModerationAction(
  itemId: string,
  action: ModerationAction
): Promise<ActionResult> {
  try {
    if (itemId.startsWith('post:')) {
      const postId = itemId.slice(5);
      const fullId = postFullId(postId);

      if (action === 'approve') {
        await reddit.approve(fullId);
        console.log(`ModShield approved post ${postId} on Reddit`);
      } else {
        await reddit.remove(fullId, false);
        console.log(`ModShield removed post ${postId} from subreddit`);
      }
    } else if (itemId.startsWith('mail:')) {
      const convId = itemId.slice(5);
      if (action === 'remove') {
        await reddit.modMail.archiveConversation(convId);
        console.log(`ModShield archived modmail ${convId}`);
      }
      // approve = leave thread open; mod resolved in Protected Review only
    } else {
      return { ok: false, error: 'Unknown queue item' };
    }

    await markHandled(itemId);
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`ModShield action ${action} failed for ${itemId}:`, err);
    return { ok: false, error: message };
  }
}
