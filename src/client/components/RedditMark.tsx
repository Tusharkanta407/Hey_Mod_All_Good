import redditLogo from '../assets/reddit_logo.png';

type RedditMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClass = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
} as const;

/** Official Reddit Snoo mark for dashboard chrome. */
export default function RedditMark({ size = 'md', className = '' }: RedditMarkProps) {
  return (
    <img
      src={redditLogo}
      alt="Reddit"
      className={`${sizeClass[size]} rounded-xl object-cover shrink-0 ring-1 ring-reddit-border ${className}`}
    />
  );
}
