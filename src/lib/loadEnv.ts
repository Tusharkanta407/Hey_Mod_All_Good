import { existsSync } from 'node:fs';
import path from 'node:path';
import { config } from 'dotenv';

function findEnvFile(startDir: string, maxDepth = 5): string | undefined {
  let dir = startDir;
  for (let i = 0; i < maxDepth; i += 1) {
    const candidate = path.join(dir, '.env');
    if (existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}

const REPO_MARKERS = ['devvit.json', 'package.json'];

function findRepoRoot(startDir: string): string | undefined {
  let dir = startDir;
  for (let i = 0; i < 8; i += 1) {
    if (REPO_MARKERS.some((name) => existsSync(path.join(dir, name)))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return undefined;
}

/** Load `.env` for local `devvit playtest` (Webbit server on :5678). */
export function loadLocalEnv(): void {
  const roots = new Set<string>([process.cwd()]);
  const repo = findRepoRoot(process.cwd());
  if (repo) roots.add(repo);

  for (const root of roots) {
    const envPath = findEnvFile(root);
    if (envPath) {
      config({ path: envPath, override: false });
      if (process.env.GEMINI_API_KEY?.trim()) {
        console.log(`[ModShield] Loaded .env from ${envPath}`);
      }
      return;
    }
  }
}
