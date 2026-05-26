import { Hono } from 'hono';
import type { MenuItemRequest, UiResponse } from '@devvit/web/shared';
import { context } from '@devvit/web/server';
import { getPostSummary } from '../core/modshield';
import { ensureQuarantinePost, getQuarantinePostUrl } from '../core/quarantine';

export const menu = new Hono();

menu.post('/view-post-summary', async (c) => {
  const request = await c.req.json<MenuItemRequest>();
  const postId = request.targetId;

  if (!postId) {
    return c.json<UiResponse>({ showToast: 'No post selected.' }, 200);
  }

  const summary = await getPostSummary(postId);
  return c.json<UiResponse>(
    {
      showToast:
        summary ?? 'Not screened yet — create a post or wait for PostCreate.',
    },
    200
  );
});

menu.post('/open-quarantine', async (c) => {
  const subName = context.subredditName;
  if (!subName) {
    return c.json<UiResponse>(
      { showToast: 'Could not resolve subreddit.' },
      200
    );
  }

  await ensureQuarantinePost(subName);
  const url = await getQuarantinePostUrl();

  if (url) {
    return c.json<UiResponse>({
      navigateTo: url,
    });
  }

  return c.json<UiResponse>(
    { showToast: 'Failed to open Protected Review Quarantine.' },
    200
  );
});
