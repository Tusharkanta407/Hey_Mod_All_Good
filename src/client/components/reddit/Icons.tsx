import type { ReactNode } from 'react';

/** Reddit-native style icons (filled / rounded, matching feed UI). */

type IconProps = {
  className?: string;
  filled?: boolean;
};

export function IconUpvote({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10 3.5 4.5 10.5h3.5V16h4V10.5h3.5L10 3.5Z" />
    </svg>
  );
}

export function IconCheck({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M7.5 13.2 4.3 10l1.4-1.4 1.8 1.8 6.8-6.8 1.4 1.4-8.2 8.2Z" />
    </svg>
  );
}

export function IconDownvote({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10 16.5 15.5 9.5H12V4H8v5.5H4.5L10 16.5Z" />
    </svg>
  );
}

export function IconComment({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10 2a8 8 0 0 0-8 8c0 1.85.63 3.55 1.69 4.9L2 18l3.35-1.04A7.96 7.96 0 0 0 10 18a8 8 0 1 0 0-16Zm0 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z" />
    </svg>
  );
}

export function IconShare({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M12.5 3.5 17 8l-4.5 4.5V9.5H8v-2h4.5V3.5ZM6 7v2H4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2h2v2a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4v-5a4 4 0 0 1 4-4h2Z" />
    </svg>
  );
}

export function IconBookmark({ className = 'w-5 h-5', filled }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M5 3.5h10v13l-5-3.5-5 3.5v-13Z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconOverflow({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <circle cx="4" cy="10" r="1.5" />
      <circle cx="10" cy="10" r="1.5" />
      <circle cx="16" cy="10" r="1.5" />
    </svg>
  );
}

export function IconShield({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10 2 4 4.5v5.2c0 3.4 2.6 6.5 6 8.3 3.4-1.8 6-5 6-8.3V4.5L10 2Zm0 1.6 4 1.8v4.3c0 2.6-1.9 5-4 6.5-2.1-1.5-4-3.9-4-6.5V5.4l4-1.8Z" />
      <path d="M9 9.5 7.5 11l1 1 3.5-3.5L11 7.5 9 9.5Z" />
    </svg>
  );
}

export function IconAlert({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10 2 2 17h16L10 2Zm0 4.2.9 4.5H9.1l.9-4.5Zm0 6.3a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z" />
    </svg>
  );
}

export function IconEyeOff({ className = 'w-6 h-6' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" />
      <circle cx="12" cy="12" r="2.5" />
      <path strokeLinecap="round" d="m4 4 16 16" />
    </svg>
  );
}

export function IconTrendUp({ className = 'w-3.5 h-3.5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M4 14h12l-5-6-3 3-2-2-2 5Z" />
    </svg>
  );
}

export function IconPulse({ className = 'w-4 h-4' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h2l2-6 3 12 2-8h5" />
    </svg>
  );
}

/** Post action row — vote pill + comment + share + save */
export function RedditPostActions({
  className = '',
  voteCount = '—',
}: {
  className?: string;
  voteCount?: string;
}) {
  return (
    <div
      className={`flex items-center gap-1 sm:gap-2 pt-3 mt-4 border-t border-reddit-border ${className}`}
    >
      <div className="inline-flex items-center rounded-full border border-reddit-border bg-black/50 overflow-hidden">
        <button
          type="button"
          className="p-1.5 text-reddit-text-muted hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Upvote"
        >
          <IconUpvote className="w-[18px] h-[18px]" />
        </button>
        <span className="px-1 text-xs font-bold text-white tabular-nums min-w-[2rem] text-center">
          {voteCount}
        </span>
        <button
          type="button"
          className="p-1.5 text-reddit-text-muted hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Downvote"
        >
          <IconDownvote className="w-[18px] h-[18px]" />
        </button>
      </div>
      <ActionChip icon={<IconComment className="w-[18px] h-[18px]" />} label="Review" />
      <ActionChip icon={<IconShare className="w-[18px] h-[18px]" />} label="Share" />
      <button
        type="button"
        className="ml-auto p-2 text-reddit-text-muted hover:text-white transition-colors rounded-full"
        aria-label="Save"
      >
        <IconBookmark className="w-[18px] h-[18px]" />
      </button>
    </div>
  );
}

function ActionChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-reddit-text-muted hover:bg-reddit-elevated hover:text-white transition-colors text-xs font-bold"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
