import { Hono } from 'hono';
import { settings } from '@devvit/web/server';
import { loadQuarantine, loadStats, markHandled } from '../lib/queue';
import type { InterceptMode, ShieldSettingsDto } from '../lib/types';

export const api = new Hono();

/** Primary webview endpoint — recent posts + modmail from Redis */
api.get('/shield/quarantine', async (c) => {
  const data = await loadQuarantine();
  return c.json(data);
});

/** Alias for older clients */
api.get('/shield/queue', async (c) => {
  const data = await loadQuarantine();
  return c.json({ items: data.items });
});

api.get('/shield/stats', async (c) => {
  const stats = await loadStats();
  const interceptMode =
    (await settings.get<InterceptMode>('interceptMode')) ?? 'audit';
  return c.json({ ...stats, interceptMode });
});

api.get('/shield/settings', async (c) => {
  const interceptMode =
    (await settings.get<InterceptMode>('interceptMode')) ?? 'audit';
  return c.json<ShieldSettingsDto>({ interceptMode });
});

api.post('/shield/handled', async (c) => {
  const body = await c.req.json<{ id?: string }>();
  if (!body.id) {
    return c.json({ ok: false, error: 'Missing id' }, 400);
  }
  const ok = await markHandled(body.id);
  return c.json({ ok });
});
