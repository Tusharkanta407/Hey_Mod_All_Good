/** Shared product branding — keep in sync with client header and devvit.json. */
export const BRAND = {
  name: 'Hey mod, all good',
  tagline: 'Protected Review',
  /** Shown in Devvit simulator / custom-post webview chrome (post title). */
  quarantineTitle: 'Hey mod, all good — Protected Review',
  menuAction: 'Open Protected Review',
  /** Bump when quarantine post title/splash/icon changes (forces new dashboard post). */
  brandVersion: '4',
} as const;
