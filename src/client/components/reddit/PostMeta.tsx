import RedditMark from '../RedditMark';
import { IconOverflow, IconShield } from './Icons';

type PostMetaProps = {
  subreddit?: string;
  author?: string;
  meta: string;
  showShield?: boolean;
};

/** Reddit-style post header: avatar, r/sub, author · time, overflow menu */
export default function PostMeta({
  subreddit = 'modtools',
  author = 'auto-mod',
  meta,
  showShield = true,
}: PostMetaProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {showShield ? (
          <div className="w-8 h-8 rounded-full bg-reddit-orange/15 flex items-center justify-center shrink-0 ring-1 ring-reddit-orange/30">
            <IconShield className="w-4 h-4 text-reddit-orange" />
          </div>
        ) : (
          <RedditMark size="sm" />
        )}
        <div className="min-w-0 text-xs leading-tight">
          <p className="truncate">
            <span className="font-bold text-white">r/{subreddit}</span>
            <span className="text-reddit-text-muted"> · </span>
            <span className="text-reddit-text-muted">u/{author}</span>
            <span className="text-reddit-text-muted"> · {meta}</span>
          </p>
        </div>
      </div>
      <button
        type="button"
        className="p-1 text-reddit-text-muted hover:text-white rounded-full shrink-0"
        aria-label="More options"
      >
        <IconOverflow className="w-5 h-5" />
      </button>
    </div>
  );
}
