import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { settings } from '@devvit/web/server';
import { isCurrentUserModerator } from '../lib/moderatorAuth';
import { applyModerationAction } from '../lib/moderationActions';
import { loadQuarantine, loadStats } from '../lib/queue';
import type { ModerationAction } from '../lib/moderationActions';
import type { InterceptMode, ShieldSettingsDto } from '../lib/types';

export const api = new Hono();

const requireModerator: MiddlewareHandler = async (c, next) => {
  const allowed = await isCurrentUserModerator();
  if (!allowed) {
    return c.json(
      {
        error: 'forbidden',
        message: 'Protected Review is for subreddit moderators only.',
      },
      403
    );
  }
  await next();
};

/** Public check — webview calls this before loading sensitive data */
api.get('/shield/access', async (c) => {
  const allowed = await isCurrentUserModerator();
  return c.json({ allowed });
});

const shield = new Hono();
shield.use('*', requireModerator);

shield.get('/quarantine', async (c) => {
  const data = await loadQuarantine();
  return c.json(data);
});

shield.get('/queue', async (c) => {
  const data = await loadQuarantine();
  return c.json({ items: data.items });
});

shield.get('/stats', async (c) => {
  const stats = await loadStats();
  const interceptMode =
    (await settings.get<InterceptMode>('interceptMode')) ?? 'audit';
  return c.json({ ...stats, interceptMode });
});

shield.get('/settings', async (c) => {
  const interceptMode =
    (await settings.get<InterceptMode>('interceptMode')) ?? 'audit';
  return c.json<ShieldSettingsDto>({ interceptMode });
});

shield.post('/action', async (c) => {
  const body = await c.req.json<{ id?: string; action?: ModerationAction }>();
  if (!body.id || !body.action) {
    return c.json({ ok: false, error: 'Missing id or action' }, 400);
  }
  if (body.action !== 'approve' && body.action !== 'remove') {
    return c.json({ ok: false, error: 'Invalid action' }, 400);
  }
  const result = await applyModerationAction(body.id, body.action);
  if (!result.ok) {
    return c.json({ ok: false, error: result.error ?? 'Action failed' }, 500);
  }
  return c.json({ ok: true });
});

/** @deprecated use POST /shield/action */
shield.post('/handled', async (c) => {
  const body = await c.req.json<{ id?: string }>();
  if (!body.id) {
    return c.json({ ok: false, error: 'Missing id' }, 400);
  }
  const result = await applyModerationAction(body.id, 'approve');
  return c.json({ ok: result.ok });
});

api.route('/shield', shield);
