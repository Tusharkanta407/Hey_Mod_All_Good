import { motion } from 'motion/react';
import {
  Activity,
  MoreHorizontal,
  Shield,
  TrendingUp,
  MessageSquare,
  Share,
  Bookmark,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import type { ShieldStats } from '../api';

type ModLoadMeterProps = {
  stats: ShieldStats | null;
  pending: number;
};

export default function ModLoadMeter({ stats, pending }: ModLoadMeterProps) {
  const calm = stats?.calm ?? 0;
  const tense = stats?.tense ?? 0;
  const harmful = stats?.harmful ?? 0;
  const total = Math.max(calm + tense + harmful, 1);

  const calmPct = Math.round((calm / total) * 100);
  const tensePct = Math.round((tense / total) * 100);
  const harmfulPct = Math.round((harmful / total) * 100);

  const healthLabel =
    harmful > 2 ? 'Elevated load' : harmful > 0 ? 'Manageable' : 'Overall Healthy';
  const trendLabel =
    harmful > tense ? 'Watch harmful queue' : tense > calm ? 'Some tension' : 'Mostly Calm';

  return (
    <div className="bg-reddit-card border border-reddit-border rounded-xl p-4 sm:p-5 mb-6 shadow-xl text-reddit-text font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-mod-harmful-text/20 border border-mod-harmful-text/30 flex items-center justify-center text-mod-harmful-text">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs text-reddit-text-muted">
            <span className="font-bold text-reddit-text">ModShield</span> • live •{' '}
            {pending} pending
          </div>
        </div>
        <button type="button" className="text-reddit-text-muted hover:text-reddit-text">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Activity className="w-3.5 h-3.5 text-reddit-text-muted" />
          <h3 className="text-[11px] font-medium text-reddit-text-muted uppercase tracking-wider">
            Moderator Emotional Load
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">{healthLabel}</h2>
          <div className="flex items-center gap-1 text-[11px] font-bold text-mod-safe-text bg-mod-safe-text/10 px-2.5 py-0.5 rounded-full">
            <TrendingUp className="w-3.5 h-3.5" /> {trendLabel}
          </div>
        </div>
      </div>

      <div className="flex w-full h-3.5 rounded-full overflow-hidden mb-6 bg-reddit-bg">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${calmPct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="bg-mod-safe-text h-full"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${tensePct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className="bg-mod-tense-text h-full"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${harmfulPct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
          className="bg-mod-harmful-text h-full"
        />
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
        <div className="bg-reddit-bg/30 border border-reddit-border rounded-xl p-3.5 flex flex-col items-start justify-between h-[96px]">
          <div className="flex w-full justify-between items-center mb-1">
            <span className="text-[11px] uppercase font-bold text-reddit-text-muted tracking-wide">
              Calm
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-mod-safe-text"></div>
          </div>
          <div className="w-full flex items-end justify-between mt-auto">
            <span className="text-3xl font-bold text-reddit-text leading-none">{calm}</span>
            <span className="text-xs text-mod-safe-text font-medium mb-0.5">{calmPct}%</span>
          </div>
        </div>

        <div className="bg-reddit-bg/30 border border-reddit-border rounded-xl p-3.5 flex flex-col items-start justify-between h-[96px]">
          <div className="flex w-full justify-between items-center mb-1">
            <span className="text-[11px] uppercase font-bold text-reddit-text-muted tracking-wide">
              Tense
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-mod-tense-text"></div>
          </div>
          <div className="w-full flex items-end justify-between mt-auto">
            <span className="text-3xl font-bold text-reddit-text leading-none">{tense}</span>
            <span className="text-xs text-mod-tense-text font-medium mb-0.5">{tensePct}%</span>
          </div>
        </div>

        <div className="bg-reddit-bg/30 border border-reddit-border rounded-xl p-3.5 flex flex-col items-start justify-between h-[96px]">
          <div className="flex w-full justify-between items-center mb-1">
            <span className="text-[11px] uppercase font-bold text-reddit-text-muted tracking-wide">
              Harmful
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-mod-harmful-text animate-pulse"></div>
          </div>
          <div className="w-full flex items-end justify-between mt-auto">
            <span className="text-3xl font-bold text-reddit-text leading-none">{harmful}</span>
            <span className="text-xs text-mod-harmful-text font-medium mb-0.5">
              {harmfulPct}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center text-reddit-text-muted text-xs font-bold pt-1 gap-2 sm:gap-4">
        <div className="flex items-center gap-1.5 bg-reddit-bg hover:bg-[#222] px-3 py-1.5 rounded-full transition-colors">
          <ArrowUp className="w-4 h-4" />
          <span className="text-reddit-text">{stats?.safe ?? 0}</span>
          <span className="text-[10px] font-normal opacity-60">safe</span>
          <ArrowDown className="w-4 h-4" />
        </div>

        <div className="flex items-center gap-2 hover:bg-[#222] px-3 py-1.5 rounded-full cursor-pointer transition-colors">
          <MessageSquare className="w-4 h-4" />
          <span>{pending}</span>
        </div>

        <div className="flex items-center gap-2 hover:bg-[#222] px-3 py-1.5 rounded-full cursor-pointer transition-colors">
          <Share className="w-4 h-4" />
          <span>Share</span>
        </div>

        <div className="flex-1 flex justify-end">
          <div className="hover:bg-[#222] p-1.5 rounded cursor-pointer transition-colors">
            <Bookmark className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
