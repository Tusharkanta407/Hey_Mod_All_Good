import { settings } from '@devvit/web/server';
import type { GptModmailAnalysis, GptPostAnalysis } from './types';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-2.5-flash';

export async function getGeminiApiKey(): Promise<string | undefined> {
  const fromEnv = process.env.GEMINI_API_KEY?.trim();
  if (fromEnv) return fromEnv;

  const fromSettings = await settings.get<string>('geminiApiKey');
  if (fromSettings?.trim()) return fromSettings.trim();

  return undefined;
}

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  error?: { message?: string };
};

async function geminiGenerate(
  apiKey: string,
  system: string,
  user: string,
  jsonMode = true
): Promise<string> {
  const url = `${GEMINI_BASE}/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ parts: [{ text: user }] }],
      generationConfig: {
        maxOutputTokens: 512,
        temperature: 0.2,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    }),
  });

  const data = (await res.json()) as GeminiResponse;

  if (!res.ok) {
    const msg = data.error?.message ?? res.statusText;
    throw new Error(`Gemini API ${res.status}: ${msg}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty content');
  return text;
}

async function chatJson<T>(
  apiKey: string,
  system: string,
  user: string
): Promise<T> {
  const text = await geminiGenerate(apiKey, system, user, true);
  return JSON.parse(text) as T;
}

type SafetyScan = {
  flagged: boolean;
  topCategory: string;
  topScore: number;
};

export type ModerationResult = {
  flagged: boolean;
  topCategory: string;
  topScore: number;
};

export async function moderateContent(
  apiKey: string,
  text: string,
  imageUrl?: string
): Promise<ModerationResult> {
  const scan = await chatJson<SafetyScan>(
    apiKey,
    `You are a content safety classifier for Reddit moderators. Return ONLY JSON:
{ "flagged": boolean, "topCategory": "safe|harassment|violence|sexual|self-harm|spam|hate", "topScore": 0.0-1.0 }`,
    imageUrl
      ? `Post text:\n${text.slice(0, 6000)}\n\nImage URL: ${imageUrl}`
      : text.slice(0, 6000)
  );

  return {
    flagged: Boolean(scan.flagged),
    topCategory: scan.topCategory ?? 'safe',
    topScore: typeof scan.topScore === 'number' ? scan.topScore : 0,
  };
}

export async function analyzePostWithGpt(
  apiKey: string,
  title: string,
  body: string,
  moderationHint: string
): Promise<GptPostAnalysis> {
  return chatJson<GptPostAnalysis>(
    apiKey,
    `You are ModShield AI for Reddit mods. Return ONLY JSON with keys: category, priority, confidence, summary.
category: safe|violence|nsfw|selfharm|harassment|spam
priority: critical|important|review|low|spam
summary: one neutral sentence for mods (no graphic detail).`,
    `Moderation signal: ${moderationHint}
Title: ${title}
Body: ${body.slice(0, 500)}`
  );
}

export async function analyzeModmailWithGpt(
  apiKey: string,
  body: string,
  subredditRules: string,
  localTags: string[]
): Promise<GptModmailAnalysis> {
  return chatJson<GptModmailAnalysis>(
    apiKey,
    `You are ModShield AI, a Reddit mod assistant. Return ONLY JSON.
${subredditRules}

Keys: intent, tone, priority, action, rule_broken, mod_summary, reply_message
action: auto_reply|escalate_to_mod|auto_remove (prefer escalate_to_mod when unsure)
mod_summary: one safe sentence; never quote slurs.`,
    `Local tags: ${localTags.join(', ') || 'none'}
Modmail message:
${body.slice(0, 1500)}`
  );
}
