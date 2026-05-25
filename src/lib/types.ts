export type ShieldPriority = 'critical' | 'important' | 'review' | 'low' | 'spam';

export type ShieldMode = 'escalate_only' | 'draft' | 'full_auto';

export type LocalModmailResult = {
  riskScore: number;
  tags: string[];
  priority: ShieldPriority;
  needsGPT: boolean;
};

export type PostShieldResult = {
  postId: string;
  category: string;
  priority: ShieldPriority;
  confidence: number;
  summary: string;
  flagged: boolean;
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
