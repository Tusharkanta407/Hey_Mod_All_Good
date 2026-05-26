export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type EmotionalLoad = 'Calm' | 'Elevated' | 'Tense' | 'Harmful' | 'Critical';
export type ItemType = 'Appeal' | 'Graphic' | 'Harassment';
export type ItemSource = 'post' | 'mail';

export interface ModerationItem {
  id: string;
  source: ItemSource;
  type: ItemType;
  title: string;
  priority: PriorityLevel;
  emotionalLoad: EmotionalLoad;
  summary?: string;
  confidence?: number;
  originalContent?: string;
  imageUrl?: string;
  intercepted?: boolean;
  timestamp: string;
  handled?: boolean;
}
