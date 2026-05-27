import {
  Activity,
  Shield,
  TrendingUp,
  MessageCircle,
  Share,
  Bookmark,
  MoreHorizontal,
  ArrowBigUp,
  ArrowBigDown,
} from 'lucide-react';
import type { ShieldStats } from '../api';

type ModLoadMeterProps = {
  stats: ShieldStats | null;
  pending: number;
};

const TOKENS = [
  { key: 'calm', label: 'Calm' as const },
  { key: 'tense', label: 'Tense' as const },
  { key: 'harmful', label: 'Harmful' as const },
] as const;

export default function ModLoadMeter({ stats, pending }: ModLoadMeterProps) {
  const calm = stats?.calm ?? 0;
  const tense = stats?.tense ?? 0;
  const harmful = stats?.harmful ?? 0;
  const total = Math.max(calm + tense + harmful, 1);

  const calmPct = Math.round((calm / total) * 100);
  const tensePct = Math.round((tense / total) * 100);
  const harmfulPct = Math.round((harmful / total) * 100);

  const healthLabel =
    harmful > 2 ? 'Elevated load' : harmful > 0 ? 'Manageable' : 'Overall healthy';

  const voteDisplay = stats ? `${stats.screened ?? 0}` : '—';

  return (
    <article className="border border-reddit-border rounded-2xl bg-reddit-card overflow-hidden mb-6">
      <header className="flex items-center gap-2 px-4 pt-3 pb-2 text-sm">
        <div className="h-8 w-8 rounded-full bg-reddit-orange/15 flex items-center justify-center">
          <Shield className="h-4 w-4 text-reddit-orange" />
        </div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="font-semibold text-white">r/ModTools</span>
          <span className="text-reddit-text-muted text-xs">•</span>
          <span className="text-reddit-text-muted text-xs">
            u/auto-mod · {stats ? '5m' : '—'}
          </span>
        </div>
        <button className="ml-auto p-1.5 rounded-full hover:bg-reddit-elevated text-reddit-text-muted">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </header>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 text-[11px] font-medium text-reddit-text-muted uppercase tracking-wide mb-2">
          <Activity className="h-3.5 w-3.5" />
          Moderator emotional load
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-xl font-bold text-white leading-tight">
            {healthLabel}
          </h2>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-white">
            <TrendingUp className="h-3 w-3" />
            Mostly calm
          </span>
        </div>
        <p className="text-xs text-reddit-text-muted mt-1">
          {pending} item{pending === 1 ? '' : 's'} awaiting protected review
        </p>
      </div>

      <div className="px-4 pb-4">
        <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-black border border-reddit-border">
          <div
            className="bg-[#46d160]"
            style={{ width: `${calmPct}%` }}
          />
          <div
            className="bg-[#ffb000]"
            style={{ width: `${tensePct}%` }}
          />
          <div
            className="bg-[#ff4500]"
            style={{ width: `${harmfulPct}%` }}
          />
        </div>
      </div>

      <div className="px-4 pb-4 grid grid-cols-3 gap-2">
        {TOKENS.map((token) => {
          const value =
            token.key === 'calm' ? calm : token.key === 'tense' ? tense : harmful;
          const pct =
            token.key === 'calm'
              ? calmPct
              : token.key === 'tense'
                ? tensePct
                : harmfulPct;
          const color =
            token.key === 'calm'
              ? '#46d160'
              : token.key === 'tense'
                ? '#ffb000'
                : '#ff4500';
          return (
            <div
              key={token.key}
              className="rounded-xl border border-reddit-border bg-black/60 p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-reddit-text-muted">
                  {token.label}
                </span>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white tabular-nums">
                  {value}
                </span>
                <span
                  className="text-xs font-semibold tabular-nums"
                  style={{ color }}
                >
                  {pct}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <footer className="flex items-center gap-1 px-2 pb-2 text-reddit-text-muted">
        <div className="flex items-center bg-reddit-elevated rounded-full">
          <button className="p-2 rounded-full hover:text-white transition-colors">
            <ArrowBigUp className="h-5 w-5" />
          </button>
          <span className="text-sm font-semibold text-white tabular-nums px-1">
            {voteDisplay}
          </span>
          <button className="p-2 rounded-full hover:text-white transition-colors">
            <ArrowBigDown className="h-5 w-5" />
          </button>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-reddit-elevated text-xs sm:text-sm font-medium">
          <MessageCircle className="h-4 w-4" />
          84
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-reddit-elevated text-xs sm:text-sm font-medium">
          <Share className="h-4 w-4" />
          Share
        </button>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-reddit-elevated text-xs sm:text-sm font-medium ml-auto">
          <Bookmark className="h-4 w-4" />
        </button>
      </footer>
    </article>
  );
}
