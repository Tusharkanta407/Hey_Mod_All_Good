import { motion } from 'motion/react';
import { IconComment } from './reddit/Icons';
import { BRAND } from '@shared/brand';

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border border-dashed border-reddit-border rounded-2xl flex flex-col items-center justify-center p-10 sm:p-12 text-center min-h-[280px] bg-reddit-card"
    >
      <div className="w-12 h-12 rounded-full border border-reddit-border flex items-center justify-center mb-4">
        <IconComment className="w-5 h-5 text-reddit-text-muted" />
      </div>
      <p className="text-sm font-bold text-white mb-2">Queue is clear</p>
      <p className="text-xs text-reddit-text-muted max-w-sm leading-relaxed">
        Items appear when they hit the mod queue (report, automod, or poll). Open via{' '}
        <span className="text-white font-semibold">Mod tools → {BRAND.menuAction}</span>.
      </p>
    </motion.div>
  );
}
