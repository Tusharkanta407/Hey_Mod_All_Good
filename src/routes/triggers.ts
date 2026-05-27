import { Hono } from 'hono';
import type {
  OnAppInstallRequest,
  OnAutomoderatorFilterPostRequest,
  OnModMailRequest,
  OnPostReportRequest,
  TriggerResponse,
} from '@devvit/web/shared';
import {
  handleAutomoderatorFilterPost,
  handleModMail,
  handlePostReport,
} from '../core/modshield';
import { BRAND } from '../lib/brand';

export const triggers = new Hono();

triggers.post('/on-app-install', async (c) => {
  const input = await c.req.json<OnAppInstallRequest>();
  const subName = input.subreddit?.name;
  console.log(
    'ModShield installed on r/' +
      subName +
      ` — mods: use Mod tools → ${BRAND.menuAction}`
  );

  return c.json<TriggerResponse>({ status: 'success' }, 200);
});

triggers.post('/post-report', async (c) => {
  const event = await c.req.json<OnPostReportRequest>();
  try {
    await handlePostReport(event);
  } catch (err) {
    console.error('post-report trigger error:', err);
  }
  return c.json<TriggerResponse>({ status: 'success' }, 200);
});

triggers.post('/automod-filter-post', async (c) => {
  const event = await c.req.json<OnAutomoderatorFilterPostRequest>();
  try {
    await handleAutomoderatorFilterPost(event);
  } catch (err) {
    console.error('automod-filter-post trigger error:', err);
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
