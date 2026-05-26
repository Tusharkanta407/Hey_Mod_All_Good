import { useState } from 'react';
import { ModerationItem } from '../types';
import { MessageSquareWarning, Sparkles, Flag, Inbox, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ModmailCardProps {
  key?: string | number;
  item: ModerationItem;
  onHandled: (id: string) => void;
}

export default function ModmailCard({ item, onHandled }: ModmailCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [drafting, setDrafting] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-reddit-card border border-reddit-border rounded-xl p-4 sm:p-5 shadow-sm mb-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-mod-tense-text/10 border border-mod-tense-text/20 flex items-center justify-center text-mod-tense-text">
            <Flag className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs text-reddit-text-muted">
            <span className="font-bold text-reddit-text">Modmail</span>
            {item.intercepted ? ' • intercepted' : ' • flagged'}
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-reddit-text-muted uppercase tracking-wider">
          <Activity className="w-3 h-3" /> LOAD: {item.emotionalLoad}
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-3 mb-4">
        <div className="px-2 py-0.5 rounded-full bg-mod-tense-text/10 border border-mod-tense-text/20 text-mod-tense-text text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5">
          <MessageSquareWarning className="w-3 h-3" />
          {item.intercepted ? 'HOSTILE APPEAL INTERCEPTED' : 'MODMAIL NEEDS REVIEW'}
        </div>
        <span className="text-xs text-reddit-text-muted">Priority <span className="font-bold text-reddit-text">{item.priority}</span></span>
      </div>

      {/* Protected Summary */}
      <div className="bg-reddit-bg border border-reddit-border rounded-xl p-4 mb-5">
        <span className="text-[10px] font-bold text-reddit-text-muted uppercase tracking-widest block mb-2">PROTECTED SUMMARY</span>
        <p className="text-[15px] font-medium text-reddit-text antialiased">
          {item.summary}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {revealed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <div className="bg-[#1A1A1B]/50 border border-mod-harmful-text/20 p-4 rounded-xl border-l-[3px] border-l-mod-harmful-text">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-bold text-mod-harmful-text uppercase tracking-wider flex items-center gap-2">
                  Original Message <span className="opacity-50 font-normal normal-case">(hidden by default)</span>
                </h4>
              </div>
              <p className="text-sm text-reddit-text">{item.originalContent}</p>
            </div>
          </motion.div>
        )}

        {drafting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <div className="bg-reddit-bg border border-reddit-border p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2 text-mod-safe-text">
                <Sparkles className="w-4 h-4" />
                <h4 className="text-[10px] font-bold uppercase tracking-wider">Suggested Calm Response</h4>
              </div>
              <textarea 
                className="w-full text-sm p-3 border border-reddit-border rounded-lg bg-[#111] text-reddit-text focus:outline-none focus:border-mod-safe-text min-h-[100px] resize-none mb-3"
                defaultValue="Hello, I understand this decision was frustrating. Our community guidelines are in place to ensure a safe environment for everyone. After reviewing the appeal, the original decision stands. We appreciate your understanding."
              />
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => setDrafting(false)}
                  className="text-xs font-bold text-reddit-text-muted px-4 py-2 hover:bg-[#222] rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => onHandled(item.id)}
                  className="text-xs font-bold text-[#030303] bg-reddit-text px-4 py-2 rounded-full hover:bg-white transition-colors"
                >
                  Send Reply
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!drafting && (
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => onHandled(item.id)}
            className="flex items-center gap-2 px-4 py-2 border border-reddit-border bg-reddit-bg text-reddit-text text-xs sm:text-sm font-bold rounded-full hover:bg-reddit-border/30 transition-colors"
          >
            <Inbox className="w-4 h-4" /> Open archived thread
          </button>
          
          <button 
            onClick={() => setDrafting(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#EA4335] text-white text-xs sm:text-sm font-bold rounded-full hover:bg-[#D93025] transition-colors border border-transparent"
          >
            <Sparkles className="w-4 h-4" /> Generate calm reply
          </button>

          <button 
            onClick={() => setRevealed(!revealed)}
            className="ml-auto text-xs text-reddit-text-muted hover:text-reddit-text hover:underline transition-colors mt-2 sm:mt-0"
          >
            {revealed ? 'Hide original content' : 'View original intent'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
