import { motion } from 'motion/react';

export default function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border-2 border-dashed border-reddit-border rounded-2xl flex flex-col items-center justify-center p-12 text-center shadow-xl min-h-[300px]"
    >
      <div className="text-3xl mb-2">🍃</div>
      <p className="text-sm font-bold text-reddit-text mb-1">No items in quarantine</p>
      <p className="text-[11px] text-reddit-text-muted max-w-md">
        Flagged posts and modmail appear here — not on the normal subreddit feed.
        Use the mod menu <strong>Open ModShield Quarantine</strong>, then create a test
        post or modmail. The list refreshes every few seconds.
      </p>
    </motion.div>
  );
}
