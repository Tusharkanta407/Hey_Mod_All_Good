import type { LocalModmailResult, ShieldPriority } from './types';

const HOSTILE_KEYWORDS = [
  'trash mod',
  'biased',
  'idiot',
  'corrupt',
  'unban',
  'kill yourself',
  'kys',
];

const APPEAL_KEYWORDS = ['appeal', 'wrongfully', 'mistake', 'ban was', 'banned'];

const SPAM_PATTERNS = [/discord\.gg/i, /telegram\.me/i, /(.)\1{4,}/];

function priorityFromRisk(risk: number): ShieldPriority {
  if (risk >= 70) return 'critical';
  if (risk >= 45) return 'important';
  if (risk >= 20) return 'review';
  return 'low';
}

export function classifyModmailLocal(
  text: string,
  customBuzzWords: string[] = []
): LocalModmailResult {
  const lower = text.toLowerCase();
  const tags: string[] = [];
  let risk = 0;

  for (const word of [...HOSTILE_KEYWORDS, ...customBuzzWords]) {
    const w = word.trim().toLowerCase();
    if (!w) continue;
    if (lower.includes(w)) {
      if (w.includes('kill') || w === 'kys') {
        if (!tags.includes('threat')) tags.push('threat');
        risk += 40;
      } else if (!tags.includes('hostile')) {
        tags.push('hostile');
      }
      risk += 25;
    }
  }

  for (const word of APPEAL_KEYWORDS) {
    if (lower.includes(word)) {
      if (!tags.includes('ban_appeal')) tags.push('ban_appeal');
      risk += 10;
    }
  }

  if (text.length > 20 && text === text.toUpperCase()) {
    tags.push('all_caps');
    risk += 15;
  }

  const exclam = (text.match(/!/g) || []).length;
  if (exclam >= 3) {
    tags.push('rage_punctuation');
    risk += 10;
  }

  for (const re of SPAM_PATTERNS) {
    if (re.test(text)) {
      tags.push('spam_pattern');
      risk += 30;
    }
  }

  const priority = priorityFromRisk(Math.min(100, risk));
  const needsGPT =
    risk >= 20 || tags.includes('ban_appeal') || tags.includes('threat');

  return {
    riskScore: Math.min(100, risk),
    tags,
    priority,
    needsGPT,
  };
}

export function parseCustomBuzzWords(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
