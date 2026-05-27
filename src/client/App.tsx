/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header';
import ModLoadMeter from './components/ModLoadMeter';
import GraphicContentCard from './components/GraphicContentCard';
import ModmailCard from './components/ModmailCard';
import EmptyState from './components/EmptyState';
import ModeratorGate from './components/ModeratorGate';
import { ModerationItem } from './types';
import { AnimatePresence } from 'motion/react';
import {
  ApiForbiddenError,
  fetchAccess,
  fetchQuarantine,
  fetchStats,
  applyModerationAction,
  type ModerationAction,
  type ShieldStats,
} from './api';

const POLL_MS = 5_000;

export default function App() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [stats, setStats] = useState<ShieldStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modAllowed, setModAllowed] = useState<boolean | null>(null);

  const refresh = useCallback(async () => {
    if (modAllowed === false) return;

    try {
      const [{ items: queue }, s] = await Promise.all([
        fetchQuarantine(),
        fetchStats(),
      ]);
      setItems(queue);
      setStats(s);
      setError(null);
    } catch (err) {
      if (err instanceof ApiForbiddenError) {
        setModAllowed(false);
        return;
      }
      console.error(err);
      setError('Could not load quarantine data. Is the app running?');
    } finally {
      setLoading(false);
    }
  }, [modAllowed]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const { allowed } = await fetchAccess();
        if (cancelled) return;
        setModAllowed(allowed);
        if (!allowed) {
          setLoading(false);
          return;
        }
        await refresh();
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setError('Could not verify moderator access.');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    if (modAllowed !== true) return;
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [modAllowed, refresh]);

  const handleModeration = async (id: string, action: ModerationAction) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, handled: true } : item))
    );
    try {
      await applyModerationAction(id, action);
      void refresh();
    } catch (err) {
      if (err instanceof ApiForbiddenError) {
        setModAllowed(false);
        return;
      }
      console.error('moderation action failed', err);
      setError(
        action === 'approve'
          ? 'Approve failed — check playtest logs.'
          : 'Remove failed — check playtest logs.'
      );
      void refresh();
    }
  };

  if (modAllowed === false) {
    return <ModeratorGate />;
  }

  const activeItems = items.filter((i) => !i.handled);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white/20 overflow-x-hidden flex flex-col">
      <Header
        interceptMode={stats?.interceptMode ?? 'audit'}
        stats={stats}
      />

      <main className="max-w-5xl w-full mx-auto px-4 py-6 flex-1">
        <ModLoadMeter stats={stats} pending={activeItems.length} />

        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Protected review queue
            </h2>
            <p className="text-xs text-reddit-text-muted mt-1">
              Safe summaries before you open raw mod queue content.
            </p>
          </div>
          <div className="flex items-center gap-2 border border-reddit-border rounded-full px-3 py-1.5 shrink-0 bg-reddit-elevated">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-[11px] font-bold text-white tabular-nums">
              {loading ? '…' : `${activeItems.length} pending`}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-white border border-reddit-border rounded-lg px-3 py-2 mb-4 bg-reddit-card">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <p className="text-sm text-reddit-text-muted">Loading shield data…</p>
            ) : activeItems.length > 0 ? (
              activeItems.map((item) =>
                item.type === 'Graphic' || item.type === 'Harassment' ? (
                  <GraphicContentCard
                    key={item.id}
                    item={item}
                    onModeration={handleModeration}
                  />
                ) : (
                  <ModmailCard
                    key={item.id}
                    item={item}
                    onModeration={handleModeration}
                  />
                )
              )
            ) : (
              <EmptyState />
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="mt-auto px-4 py-4 border-t border-reddit-border hidden md:flex justify-between items-center text-[10px] text-reddit-text-muted font-medium w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            Hey mod, all good · active
          </span>
          {stats && (
            <span>
              Screened {stats.screened} · Shielded {stats.shielded}
            </span>
          )}
        </div>
        <span>Built for Reddit moderators</span>
      </footer>
    </div>
  );
}
