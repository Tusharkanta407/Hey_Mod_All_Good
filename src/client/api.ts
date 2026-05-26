import type { ModerationItem } from './types';

export type ShieldStats = {
  screened: number;
  shielded: number;
  safe: number;
  pending: number;
  calm: number;
  tense: number;
  harmful: number;
  interceptMode: 'audit' | 'intercept';
};

type QueueItemDto = {
  id: string;
  source: 'post' | 'mail';
  type: 'Graphic' | 'Appeal' | 'Harassment';
  title: string;
  priority: ModerationItem['priority'];
  emotionalLoad: ModerationItem['emotionalLoad'];
  summary?: string;
  confidence?: number;
  originalContent?: string;
  imageUrl?: string;
  intercepted?: boolean;
  timestamp: string;
  handled: boolean;
};

type QuarantineResponse = {
  items: QueueItemDto[];
  posts: QueueItemDto[];
  mail: QueueItemDto[];
};

function toModerationItem(dto: QueueItemDto): ModerationItem {
  const item: ModerationItem = {
    id: dto.id,
    source: dto.source,
    type: dto.type,
    title: dto.title,
    priority: dto.priority,
    emotionalLoad: dto.emotionalLoad,
    timestamp: dto.timestamp,
    handled: dto.handled,
  };
  if (dto.summary) item.summary = dto.summary;
  if (dto.confidence != null) item.confidence = dto.confidence;
  if (dto.originalContent) item.originalContent = dto.originalContent;
  if (dto.imageUrl) item.imageUrl = dto.imageUrl;
  if (dto.intercepted) item.intercepted = dto.intercepted;
  return item;
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Loads recentPosts + recentMail from Redis via server */
export async function fetchQuarantine(): Promise<{
  items: ModerationItem[];
  posts: ModerationItem[];
  mail: ModerationItem[];
}> {
  const data = await fetchJson<QuarantineResponse>('/api/shield/quarantine');
  return {
    items: data.items.map(toModerationItem),
    posts: data.posts.map(toModerationItem),
    mail: data.mail.map(toModerationItem),
  };
}

/** @deprecated use fetchQuarantine */
export async function fetchQueue(): Promise<ModerationItem[]> {
  const { items } = await fetchQuarantine();
  return items;
}

export async function fetchStats(): Promise<ShieldStats> {
  return fetchJson<ShieldStats>('/api/shield/stats');
}

export async function markItemHandled(id: string): Promise<void> {
  await fetchJson<{ ok: boolean }>('/api/shield/handled', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
}
