import { Hono } from 'hono';
import type { MenuItemRequest, UiResponse } from '@devvit/web/shared';
import { getPostSummary } from '../core/modshield';

export const menu = new Hono();

menu.post('/view-post-summary', async (c) => {
  const request = await c.req.json<MenuItemRequest>();
  const postId = request.targetId;

  if (!postId) {
    return c.json<UiResponse>(
      { showToast: 'No post selected.' },
      200
    );
  }

  const summary = await getPostSummary(postId);
  return c.json<UiResponse>(
    {
      showToast: summary ?? 'Not screened yet — create a post or wait for PostCreate.',
    },
    200
  );
});
