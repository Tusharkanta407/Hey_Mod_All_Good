export type ShieldPriority = 'critical' | 'important' | 'review' | 'low' | 'spam';

export type ShieldMode = 'escalate_only' | 'draft' | 'full_auto';

export type InterceptMode = 'audit' | 'intercept';

export type LocalModmailResult = {
  riskScore: number;
  tags: string[];
  priority: ShieldPriority;
  needsGPT: boolean;
};

export type PostShieldResult = {
  postId: string;
  title?: string;
  imageUrl?: string;
  originalContent?: string;
  category: string;
  priority: ShieldPriority;
  confidence: number;
  summary: string;
  flagged: boolean;
  intercepted?: boolean;
  handled?: boolean;
  scanSource?: 'report' | 'modqueue' | 'automod';
  reportReason?: string;
  at: number;
};

export type ModmailShieldResult = {
  conversationId: string;
  summary: string;
  tags: string[];
  priority: ShieldPriority;
  intent?: string;
  tone?: string;
  rule?: string;
  action?: string;
  localRiskScore: number;
  intercepted?: boolean;
  handled?: boolean;
  originalContent?: string;
  at: number;
};

export type GptModmailAnalysis = {
  intent: string;
  tone: string;
  priority: ShieldPriority;
  action: 'auto_reply' | 'escalate_to_mod' | 'auto_remove';
  rule_broken: string;
  mod_summary: string;
  reply_message?: string;
};

export type GptPostAnalysis = {
  category: string;
  priority: ShieldPriority;
  confidence: number;
  summary: string;
};

/** API payload for webview dashboard */
export type QueueItemDto = {
  id: string;
  source: 'post' | 'mail';
  type: 'Graphic' | 'Appeal' | 'Harassment';
  title: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  emotionalLoad: 'Calm' | 'Elevated' | 'Tense' | 'Harmful' | 'Critical';
  summary?: string;
  confidence?: number;
  originalContent?: string;
  imageUrl?: string;
  intercepted?: boolean;
  timestamp: string;
  handled: boolean;
};

export type ShieldStatsDto = {
  screened: number;
  shielded: number;
  safe: number;
  pending: number;
  calm: number;
  tense: number;
  harmful: number;
  interceptMode?: InterceptMode;
};

export type ShieldSettingsDto = {
  interceptMode: InterceptMode;
};

/** GET /api/shield/quarantine — webview payload */
export type QuarantineResponseDto = {
  items: QueueItemDto[];
  posts: QueueItemDto[];
  mail: QueueItemDto[];
};
