import { Hono } from 'hono';
import type {
  OnAppInstallRequest,
  OnModMailRequest,
  OnPostCreateRequest,
  TriggerResponse,
} from '@devvit/web/shared';
import { handleModMail, handlePostCreate } from '../core/modshield';

export const triggers = new Hono();

triggers.post('/on-app-install', async (c) => {
  const input = await c.req.json<OnAppInstallRequest>();
  console.log('ModShield installed on r/' + input.subreddit?.name);
  return c.json<TriggerResponse>({ status: 'success' }, 200);
});

triggers.post('/post-create', async (c) => {
  const event = await c.req.json<OnPostCreateRequest>();
  try {
    await handlePostCreate(event);
  } catch (err) {
    console.error('post-create trigger error:', err);
  }
  return c.json<TriggerResponse>({ status: 'success' }, 200);
});

triggers.post('/mod-mail', async (c) => {
  const event = await c.req.json<OnModMailRequest>();
  try {
    await handleModMail(event);
  } catch (err) {
    console.error('mod-mail trigger error:', err);
  }
  return c.json<TriggerResponse>({ status: 'success' }, 200);
});
