/**
 * Copies GEMINI_API_KEY from .env into Devvit encrypted app settings.
 * Usage: node scripts/sync-gemini-secret.mjs
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(repoRoot, '.env');

if (!existsSync(envPath)) {
  console.error('Missing .env — add GEMINI_API_KEY=... first.');
  process.exit(1);
}

let apiKey;
for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  if (key !== 'GEMINI_API_KEY') continue;
  apiKey = trimmed
    .slice(eq + 1)
    .trim()
    .replace(/^["']|["']$/g, '');
  break;
}

if (!apiKey) {
  console.error('.env has no GEMINI_API_KEY value.');
  process.exit(1);
}

console.log('Syncing geminiApiKey to Devvit app settings...');
const result = spawnSync('devvit', ['settings', 'set', 'geminiApiKey'], {
  cwd: repoRoot,
  input: apiKey,
  encoding: 'utf8',
  shell: true,
});

if (result.status !== 0) {
  console.error(result.stderr || result.stdout || 'devvit settings set failed');
  process.exit(result.status ?? 1);
}

console.log('Done. Restart npm run dev and create a test post.');
