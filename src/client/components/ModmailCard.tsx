import { useState, type ReactNode } from 'react';
import { ModerationItem } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import PostMeta from './reddit/PostMeta';
import { IconComment, IconEyeOff, RedditPostActions } from './reddit/Icons';

type ModerationAction = 'approve' | 'remove';

interface ModmailCardProps {
  item: ModerationItem;
  onModeration: (id: string, action: ModerationAction) => void;
}

export default function ModmailCard({ item, onModeration }: ModmailCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const meta = `${item.priority} · ${item.emotionalLoad}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="border border-reddit-border rounded-2xl bg-reddit-card overflow-hidden"
    >
      <div className="px-4 sm:px-5 py-3 border-b border-reddit-border">
        <PostMeta subreddit="modmail" author="shield" meta={meta} showShield={false} />
      </div>

      <div className="px-4 sm:px-5 py-4">
        <div className="border border-reddit-border rounded-xl bg-black/50 p-4 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-reddit-text-muted block mb-2">
            Protected summary
          </span>
          <p className="text-sm text-white leading-relaxed">{item.summary}</p>
        </div>

        <AnimatePresence mode="wait">
          {revealed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="border border-reddit-border border-l-2 border-l-white rounded-xl bg-black p-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-reddit-text-muted block mb-2">
                  Original message
                </span>
                <p className="text-sm text-white/85">{item.originalContent}</p>
              </div>
            </motion.div>
          )}

          {drafting && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="border border-reddit-border rounded-xl bg-black p-4">
                <div className="flex items-center gap-2 mb-2">
                  <IconComment className="w-4 h-4 text-white" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-reddit-text-muted">
                    Suggested calm reply
                  </span>
                </div>
                <textarea
                  className="w-full text-sm p-3 border border-reddit-border rounded-lg bg-reddit-elevated text-white focus:outline-none focus:border-white min-h-[100px] resize-none mb-3"
                  defaultValue="Hello, I understand this decision was frustrating. Our community guidelines are in place to ensure a safe environment for everyone. After reviewing the appeal, the original decision stands. We appreciate your understanding."
                />
                <div className="flex justify-end gap-2">
                  <BtnGhost onClick={() => setDrafting(false)}>Cancel</BtnGhost>
                  <BtnApprove onClick={() => onModeration(item.id, 'approve')}>
                    Send reply
                  </BtnApprove>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!drafting && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <BtnGhost onClick={() => onModeration(item.id, 'approve')}>
                Mark resolved
              </BtnGhost>
              <BtnGhost onClick={() => onModeration(item.id, 'remove')}>
                Archive thread
              </BtnGhost>
              <BtnApprove onClick={() => setDrafting(true)}>Draft reply</BtnApprove>
              <button
                type="button"
                onClick={() => setRevealed(!revealed)}
                className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-reddit-text-muted hover:text-white transition-colors"
              >
                <IconEyeOff className="w-3.5 h-3.5" />
                {revealed ? 'Hide original' : 'View original'}
              </button>
            </div>
            <RedditPostActions voteCount="—" />
          </>
        )}
      </div>
    </motion.article>
  );
}

function BtnGhost({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-reddit-border bg-reddit-elevated text-xs font-bold text-white hover:border-reddit-border-hover transition-colors"
    >
      {children}
    </button>
  );
}

function BtnApprove({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-reddit-border bg-black text-xs font-bold text-white hover:border-white/50 transition-colors"
    >
      {children}
    </button>
  );
}
