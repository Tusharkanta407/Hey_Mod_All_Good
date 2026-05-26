import { Heart, ToggleRight } from 'lucide-react';
import type { ShieldStats } from '../api';

type HeaderProps = {
  interceptMode: 'audit' | 'intercept';
  stats?: ShieldStats | null;
};

export default function Header({ interceptMode, stats }: HeaderProps) {
  const isIntercept = interceptMode === 'intercept';

  return (
    <header className="flex items-center justify-between mb-6 px-6 py-4 bg-reddit-bg border-b border-reddit-border sticky top-0 z-10">
      <div className="w-full flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-reddit-orange flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-reddit-orange">
              Hey_Mod_all_Good
            </h1>
          </div>
          <p className="text-xs text-reddit-text-muted mt-1 uppercase tracking-widest font-semibold flex items-center gap-1.5">
            Protecting the people who protect communities{' '}
            <Heart className="w-3.5 h-3.5 text-reddit-orange fill-reddit-orange/20" />
          </p>
        </div>

        <div className="flex items-center space-x-6">
          <div
            className="flex items-center space-x-2 bg-reddit-card border border-reddit-border px-3 py-1.5 rounded-full"
            title="Change in subreddit app settings"
          >
            <div
              className={`w-2 h-2 rounded-full ${isIntercept ? 'bg-mod-safe-text' : 'bg-reddit-text-muted'}`}
            ></div>
            <span className="text-xs font-bold text-reddit-text uppercase tracking-wider">
              {isIntercept ? 'Intercept' : 'Audit'} mode
            </span>
            <ToggleRight
              className={`w-5 h-5 ${isIntercept ? 'text-mod-safe-text' : 'text-reddit-text-muted rotate-180'}`}
            />
          </div>

          <div className="flex space-x-4">
            <div className="bg-reddit-card border border-reddit-border px-4 py-2 rounded-xl flex flex-col justify-center items-center shadow-lg">
              <span className="text-[10px] text-reddit-text-muted uppercase font-bold tracking-tighter">
                Shielded Today
              </span>
              <span className="text-lg font-bold text-mod-safe-text">
                {stats?.shielded ?? '—'}
              </span>
            </div>
            <div className="bg-reddit-card border border-reddit-border px-4 py-2 rounded-xl flex flex-col justify-center items-center shadow-lg">
              <span className="text-[10px] text-reddit-text-muted uppercase font-bold tracking-tighter">
                Screened Today
              </span>
              <span className="text-lg font-bold text-mod-harmful-text">
                {stats?.screened ?? '—'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
