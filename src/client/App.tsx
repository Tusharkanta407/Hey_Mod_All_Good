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
import { ModerationItem } from './types';
import { AnimatePresence } from 'motion/react';
import {
  fetchQuarantine,
  fetchStats,
  markItemHandled,
  type ShieldStats,
} from './api';

const POLL_MS = 5_000;

export default function App() {
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [stats, setStats] = useState<ShieldStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [{ items: queue }, s] = await Promise.all([
        fetchQuarantine(),
        fetchStats(),
      ]);
      setItems(queue);
      setStats(s);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load quarantine data. Is the app running?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(id);
  }, [refresh]);

  const handleItem = async (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, handled: true } : item))
    );
    try {
      await markItemHandled(id);
      void refresh();
    } catch (err) {
      console.error('mark handled failed', err);
    }
  };

  const activeItems = items.filter((i) => !i.handled);

  return (
    <div className="min-h-screen bg-reddit-bg text-reddit-text font-sans selection:bg-reddit-orange/20 overflow-x-hidden flex flex-col">
      <Header
        interceptMode={stats?.interceptMode ?? 'audit'}
        stats={stats}
      />

      <main className="max-w-5xl w-full mx-auto px-4 py-8 flex-1">
        <ModLoadMeter stats={stats} pending={activeItems.length} />

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-reddit-text tracking-tight">
              Protected Review Queue
            </h2>
            <p className="text-sm text-reddit-text-muted mt-1">
              Content intercepted before it reached your normal workflow.
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-reddit-card border border-reddit-border px-3 py-1.5 rounded-full shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-mod-harmful-text animate-pulse"></div>
            <span className="text-xs font-bold text-reddit-text">
              {loading ? '…' : `${activeItems.length} pending`}
            </span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-mod-harmful-text mb-4">{error}</p>
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
                    onHandled={handleItem}
                  />
                ) : (
                  <ModmailCard
                    key={item.id}
                    item={item}
                    onHandled={handleItem}
                  />
                )
              )
            ) : (
              <EmptyState />
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="mt-auto px-6 py-4 border-t border-reddit-border hidden md:flex justify-between items-center text-[10px] text-reddit-text-muted font-medium w-full max-w-7xl mx-auto">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-1.5 h-1.5 rounded-full bg-mod-safe-text mr-2 animate-pulse"></div>
            <span>Protective Shield: ACTIVE</span>
          </div>
          {stats && (
            <span className="opacity-50">
              Screened today: {stats.screened} · Shielded: {stats.shielded}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span>Hacking with love for Reddit Moderators</span>
          <span className="text-reddit-orange">❤</span>
        </div>
      </footer>
    </div>
  );
}
