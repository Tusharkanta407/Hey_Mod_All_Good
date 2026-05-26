import { useState } from 'react';
import { ModerationItem } from '../types';
import {
  AlertOctagon,
  EyeOff,
  Shield,
  MoreHorizontal,
  Check,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function formatAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

interface GraphicContentCardProps {
  item: ModerationItem;
  onHandled: (id: string) => void;
}

export default function GraphicContentCard({
  item,
  onHandled,
}: GraphicContentCardProps) {
  const [revealed, setRevealed] = useState(false);
  const hasImage = Boolean(item.imageUrl);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-reddit-card border border-reddit-border rounded-xl p-4 sm:p-5 shadow-sm mb-4"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-mod-harmful-text/20 border border-mod-harmful-text/30 flex items-center justify-center text-mod-harmful-text">
            <Shield className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs text-reddit-text-muted">
            <span className="font-bold text-reddit-text">
              {item.source === 'post' ? 'Post' : 'Mail'}
            </span>
            {item.intercepted ? ' • intercepted' : ' • flagged'}
            {' • '}
            {formatAgo(item.timestamp)}
          </div>
        </div>
        <button
          type="button"
          className="text-reddit-text-muted hover:text-reddit-text"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="px-2 py-0.5 rounded-full bg-mod-harmful-text/10 border border-mod-harmful-text/20 text-mod-harmful-text text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5">
          <AlertOctagon className="w-3 h-3" />
          {item.intercepted ? 'INTERCEPTED' : 'FLAGGED'} — {item.type}
        </div>
        {item.confidence != null && (
          <span className="text-xs text-reddit-text-muted">
            Confidence{' '}
            <span className="font-bold text-reddit-text">{item.confidence}%</span>
          </span>
        )}
      </div>

      <div className="mb-4">
        <h3
          className="text-[15px] font-bold text-reddit-text leading-snug mb-1 transition-[filter] duration-300"
          style={{ filter: revealed ? 'none' : 'blur(6px)' }}
        >
          {item.title}
        </h3>
        {item.summary && (
          <p className="text-sm text-reddit-text leading-relaxed border-l-2 border-mod-safe-text/40 pl-3">
            <span className="text-[10px] font-bold text-mod-safe-text uppercase tracking-wider block mb-1">
              Safe summary
            </span>
            {item.summary}
          </p>
        )}
        <p className="text-xs text-reddit-text-muted mt-2">
          Safe summary shown first. Title and media stay blurred until you reveal.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {hasImage ? (
          <motion.div
            key={revealed ? 'revealed-img' : 'blurred-img'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-64 rounded-xl overflow-hidden border border-reddit-border mb-5 bg-reddit-bg"
          >
            <img
              src={item.imageUrl}
              alt=""
              className="w-full h-full object-cover transition-[filter] duration-500"
              style={{
                filter: revealed ? 'none' : 'blur(8px)',
                transform: revealed ? 'none' : 'scale(1.05)',
              }}
            />
            {!revealed && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 pointer-events-none">
                <EyeOff className="w-8 h-8 text-white/80 mb-2" />
                <span className="text-sm font-bold text-white/90">
                  Preview blurred (8px)
                </span>
              </div>
            )}
          </motion.div>
        ) : !revealed ? (
          <motion.div
            key="shielded-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full min-h-[8rem] rounded-xl border border-reddit-border border-dashed bg-reddit-bg/50 flex flex-col items-center justify-center mb-5 p-4"
          >
            <EyeOff className="w-8 h-8 text-reddit-text-muted mb-2" />
            <span className="text-sm font-medium text-reddit-text-muted">
              Original text hidden
            </span>
          </motion.div>
        ) : (
          <motion.div
            key="revealed-text"
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.4 }}
            className="w-full min-h-[8rem] rounded-xl border border-reddit-border bg-[#030303] flex items-start justify-start p-4 text-sm text-reddit-text mb-5 overflow-auto max-h-64"
          >
            {item.originalContent || 'No body text stored for this item.'}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setRevealed(!revealed)}
          className="flex items-center gap-2 px-4 py-2 border border-reddit-border bg-reddit-bg text-reddit-text text-xs sm:text-sm font-bold rounded-full hover:bg-reddit-border/30 transition-colors"
        >
          <EyeOff className="w-4 h-4" />
          {revealed ? 'Hide visually' : 'Reveal carefully'}
        </button>
        <button
          type="button"
          onClick={() => onHandled(item.id)}
          className="flex items-center gap-1.5 px-4 py-2 bg-mod-safe-text/10 border border-mod-safe-text/20 text-mod-safe-text text-xs sm:text-sm font-bold rounded-full hover:bg-mod-safe-text/20 transition-colors"
        >
          <Check className="w-4 h-4" /> Approve
        </button>
        <button
          type="button"
          onClick={() => onHandled(item.id)}
          className="flex items-center gap-1.5 px-4 py-2 bg-mod-harmful-text/10 border border-mod-harmful-text/20 text-mod-harmful-text text-xs sm:text-sm font-bold rounded-full hover:bg-mod-harmful-text/20 transition-colors"
        >
          <X className="w-4 h-4" /> Keep removed
        </button>
      </div>
    </motion.div>
  );
}
