import { IconShield } from './reddit/Icons';
import { BRAND } from '@shared/brand';
import RedditMark from './RedditMark';

export default function ModeratorGate() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md text-center border border-reddit-border rounded-2xl p-8 bg-reddit-card">
        <div className="flex justify-center mb-4">
          <RedditMark size="lg" />
        </div>
        <div className="w-10 h-10 rounded-full border border-reddit-border flex items-center justify-center mx-auto mb-4">
          <IconShield className="w-4 h-4 text-reddit-orange" />
        </div>
        <p className="text-sm font-bold mb-1">
          <span className="text-reddit-text-muted font-medium">Hey</span> mod,{' '}
          <span className="text-reddit-orange">all good</span>
        </p>
        <h1 className="text-lg font-bold mb-2">Moderators only</h1>
        <p className="text-sm text-reddit-text-muted leading-relaxed">
          Protected Review is a mod companion tool. Flagged summaries are not visible to
          regular subscribers.
        </p>
        <p className="text-xs text-reddit-text-muted mt-4">
          Use{' '}
          <span className="text-white font-semibold">Mod tools → {BRAND.menuAction}</span>
        </p>
      </div>
    </div>
  );
}
