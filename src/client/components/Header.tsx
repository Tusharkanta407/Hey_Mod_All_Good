import RedditMark from './RedditMark';
import { IconShield } from './reddit/Icons';
import type { ShieldStats } from '../api';

type HeaderProps = {
  interceptMode: 'audit' | 'intercept';
  stats?: ShieldStats | null;
};

export default function Header({ interceptMode, stats }: HeaderProps) {
  const isIntercept = interceptMode === 'intercept';

  return (
    <header className="sticky top-0 z-10 border-b border-reddit-border bg-black/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <RedditMark />
          <div className="min-w-0">
            <div className="flex items-baseline flex-wrap gap-x-2 gap-y-0.5">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-none">
                <span className="font-medium text-reddit-text-muted">Hey</span>{' '}
                <span>mod,</span>{' '}
                <span className="text-reddit-orange">all good</span>
              </h1>
              <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-widest text-reddit-text-muted border border-reddit-border rounded px-1.5 py-0.5 self-center">
                Mod tools
              </span>
            </div>
            <p className="text-[11px] text-reddit-text-muted truncate mt-1">
              Protected Review · companion to mod queue
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div
            className="hidden sm:flex items-center gap-1.5 border border-reddit-border rounded-full px-2.5 py-1"
            title="Set in subreddit app settings"
          >
            <IconShield className="w-3.5 h-3.5 text-reddit-orange" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-white">
              {isIntercept ? 'Intercept' : 'Audit'}
            </span>
          </div>

          <StatChip label="Shielded" value={stats?.shielded} />
          <StatChip label="Screened" value={stats?.screened} />
        </div>
      </div>
    </header>
  );
}

function StatChip({
  label,
  value,
}: {
  label: string;
  value: number | undefined;
}) {
  return (
    <div className="border border-reddit-border rounded-lg px-2.5 py-1.5 text-center min-w-[4.5rem]">
      <div className="text-[9px] font-bold uppercase tracking-wider text-reddit-text-muted">
        {label}
      </div>
      <div className="text-sm font-bold text-white tabular-nums">
        {value ?? '—'}
      </div>
    </div>
  );
}
