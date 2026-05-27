import { Hono } from 'hono';
import { pollModQueueAndScan } from '../core/modQueuePoll';

export const scheduler = new Hono();

scheduler.post('/scan-mod-queue', async (c) => {
  try {
    await c.req.json();
    await pollModQueueAndScan();
  } catch (err) {
    console.error('scheduler scan-mod-queue error:', err);
  }
  return c.json({}, 200);
});
