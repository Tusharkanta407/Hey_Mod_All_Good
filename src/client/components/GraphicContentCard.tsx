import { useState, type ReactNode } from 'react';
import { ModerationItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import PostMeta from './reddit/PostMeta';
import {
  IconAlert,
  IconEyeOff,
  IconCheck,
  RedditPostActions,
} from './reddit/Icons';

function formatAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  return `${Math.floor(hr / 24)}d`;
}

type ModerationAction = 'approve' | 'remove';

interface GraphicContentCardProps {
  item: ModerationItem;
  onModeration: (id: string, action: ModerationAction) => void;
}

export default function GraphicContentCard({
  item,
  onModeration,
}: GraphicContentCardProps) {
  const [revealed, setRevealed] = useState(false);
  const hasImage = Boolean(item.imageUrl);
  const meta = item.intercepted ? `intercepted · ${formatAgo(item.timestamp)}` : formatAgo(item.timestamp);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="border border-reddit-border rounded-2xl bg-reddit-card overflow-hidden"
    >
      <div className="px-4 sm:px-5 py-3 border-b border-reddit-border">
        <PostMeta
          subreddit="ProtectedReview"
          author="auto-mod"
          meta={meta}
          showShield
        />
      </div>

      <div className="px-4 sm:px-5 py-4">
        <div className="flex items-center gap-2 mb-4 flex-wrap rounded-lg bg-black/40 border border-reddit-border px-3 py-2">
          <IconAlert className="w-4 h-4 text-white shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white">
            {item.type} imagery intercepted
          </span>
          {item.confidence != null && (
            <span className="text-[10px] text-reddit-text-muted ml-auto">
              Confidence <span className="font-bold text-white">{item.confidence}%</span>
            </span>
          )}
        </div>

        <div className="mb-4">
          <h3
            className="text-[15px] font-semibold text-white leading-snug mb-2 transition-[filter] duration-300"
            style={{ filter: revealed ? 'none' : 'blur(6px)' }}
          >
            {item.title}
          </h3>
          <p className="text-xs text-reddit-text-muted mb-3">
            Preview hidden automatically to reduce sudden harmful exposure.
          </p>
          {item.summary && (
            <div className="border-l-2 border-white pl-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-reddit-text-muted block mb-1">
                Safe summary
              </span>
              <p className="text-sm text-white/90 leading-relaxed">{item.summary}</p>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {hasImage ? (
            <motion.div
              key={revealed ? 'img-on' : 'img-off'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-dashed border-reddit-border mb-4 bg-black"
            >
              <img
                src={item.imageUrl}
                alt=""
                className="w-full h-full object-cover transition-[filter] duration-500"
                style={{
                  filter: revealed ? 'none' : 'blur(10px)',
                  transform: revealed ? 'none' : 'scale(1.04)',
                }}
              />
              {!revealed && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/55">
                  <IconEyeOff className="w-7 h-7 text-reddit-text-muted mb-2" />
                  <span className="text-xs font-semibold text-reddit-text-muted uppercase tracking-wide">
                    Preview blurred
                  </span>
                </div>
              )}
            </motion.div>
          ) : !revealed ? (
            <div className="w-full h-28 rounded-xl border border-dashed border-reddit-border bg-black/60 flex flex-col items-center justify-center mb-4">
              <IconEyeOff className="w-6 h-6 text-reddit-text-muted mb-1.5" />
              <span className="text-xs text-reddit-text-muted">Preview blurred</span>
            </div>
          ) : (
            <motion.div
              key="text-on"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-h-56 overflow-auto rounded-xl border border-reddit-border bg-black p-4 text-sm text-white/90 mb-4"
            >
              {item.originalContent || 'No body text stored.'}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap items-center gap-2">
          <ModActionButton variant="ghost" onClick={() => setRevealed(!revealed)}>
            <IconEyeOff className="w-4 h-4" />
            {revealed ? 'Hide preview' : 'Reveal carefully'}
          </ModActionButton>
          <ModActionButton variant="approve" onClick={() => onModeration(item.id, 'approve')}>
            <IconCheck className="w-4 h-4" />
            Approve
          </ModActionButton>
          <ModActionButton variant="remove" onClick={() => onModeration(item.id, 'remove')}>
            <span className="font-bold text-sm leading-none">×</span>
            Keep removed
          </ModActionButton>
        </div>

        <RedditPostActions voteCount="—" />
      </div>
    </motion.article>
  );
}

function ModActionButton({
  children,
  onClick,
  variant,
}: {
  children: ReactNode;
  onClick: () => void;
  variant: 'ghost' | 'approve' | 'remove';
}) {
  const styles = {
    ghost:
      'border-reddit-border bg-reddit-elevated text-white hover:border-reddit-border-hover',
    approve:
      'border-reddit-border bg-black text-white hover:border-white/50',
    remove:
      'border-reddit-border bg-black text-white hover:border-white/50',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-colors ${styles[variant]}`}
    >
      {children}
    </button>
  );
}
