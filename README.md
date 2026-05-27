# Hey mod, all good

AI-assisted protected review for Reddit moderators.

`Hey mod, all good` is a Devvit moderation companion that lets mods review risky content in a safer workflow before taking final moderation actions. It does not replace Reddit mod queue; it adds a protected review layer on top.

## The problem

Reddit moderators regularly deal with harassment, disturbing imagery, aggressive modmail, and emotionally difficult moderation queues. In high-volume communities, moderators often must make fast decisions while being repeatedly exposed to harmful content.

Most workflows show the raw content first and context second. This increases emotional strain, slows decision quality, and raises moderation burnout risk over time.

`Hey mod, all good` solves this by putting a protected review layer in front of sensitive items: safe summary first, blurred preview by default, and clear moderator actions.

## What it does

- Ingests moderation signals from reports, automod filter events, modmail, and periodic mod-queue polling
- Generates concise AI summaries for flagged items (one scan per item via Redis dedupe)
- Shows items in a protected dashboard with blurred previews and explicit reveal controls
- Lets mods approve or remove directly from the dashboard, synced back to Reddit
- Restricts access to subreddit moderators only

## Why this exists

Moderators often have to review distressing content quickly. This app reduces sudden exposure by defaulting to safe summaries and blurred previews, while keeping the final decision in mod hands.

## Core workflow

1. A post or conversation enters moderation flow (report, automod, modmail, or queue poll).
2. The app scans once, classifies risk, and stores structured review data.
3. Moderator opens **Mod tools -> Open Protected Review**.
4. Dashboard shows protected cards with summary first, reveal optional.
5. Moderator chooses **Approve** or **Keep removed / Archive**, action is applied to Reddit.

## Key features

- **Protected Review Queue**: Summary-first queue for sensitive content
- **Blur-first UX**: Reveal content only when needed
- **Moderator Emotional Load panel**: live calm/tense/harmful distribution
- **Action sync**: approve/remove/archive operations applied on Reddit
- **Modes**:
  - `audit` (default): review-only flow
  - `intercept`: auto-remove critical items before review
- **Moderator gate**: API + UI access checks for mods only

## Tech stack

- Devvit (`@devvit/web`, `@devvit/start`)
- TypeScript + Hono
- React + Vite + Tailwind CSS
- Devvit Redis for queue/state storage
- Gemini API for risk/safety summaries

## Project structure

```text
src/
  client/                # dashboard web UI
  core/                  # scanning, quarantine post, mod queue polling
  lib/                   # AI integration, queue, redis keys, auth, brand
  routes/                # api, menu, triggers, scheduler routes
```

## Local development

### Prerequisites

- Node.js `>=22.2.0`
- Devvit CLI authenticated (`devvit login`)
- Moderator permissions in your dev subreddit

### Setup

```bash
npm install
npm run setup:secrets
```

Set app secret on Reddit if needed:

```bash
devvit settings set geminiApiKey "<YOUR_GEMINI_KEY>"
```

### Run

```bash
npm run dev
```

If local playtest runs out of memory:

```bash
npm run dev:8gb
```

Open your dev subreddit and use:

- **Mod tools -> Open Protected Review**
- **Post menu -> Protected Review: View summary**

## Configuration (subreddit settings)

- `interceptMode`: `audit` or `intercept`
- `shieldMode`: modmail automation mode
- `subredditRules`: rule text used for AI context
- `customBuzzWords`: additional risk keywords

## Scheduler

- `scan-mod-queue` runs every 3 minutes in `devvit.json`:
  - `"cron": "*/3 * * * *"`

## Commands

- `npm run dev` - start local playtest (4GB heap)
- `npm run dev:8gb` - playtest with 8GB heap
- `npm run build` - production build
- `npm run deploy` - type-check + lint + upload
- `npx devvit publish --public` - publish app listing

## Security and privacy notes

- Designed for moderation use by subreddit mods only
- Sensitive content is hidden by default in UI
- API keys are stored as Devvit secret settings (`isSecret: true`)
- No direct public endpoint for moderation actions

## Publish checklist

1. Ensure `assets/app_icon_1024.png` exists and is 1024x1024.
2. Verify `devvit.json` settings and permissions.
3. Run:
   - `npm run deploy`
   - `npx devvit publish --public`
4. Confirm app page on `developers.reddit.com/apps/<app-id>`.

## Positioning

This project is built as a moderation companion for the Reddit Mod Tools hackathon: safer triage, faster decisions, and less exposure burden for moderators.
