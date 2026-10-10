export type SkillType = 'listening' | 'speaking' | 'writing' | 'reading' | 'grammar';

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface Activity {
  id: string;
  userId: string;
  skill: SkillType;
  activityType: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  title: string;
  url?: string;
  notes?: string;
  createdAt: string;
}

export type VocabularyStatus = 'review' | 'learning' | 'learned';

export interface VocabularyWord {
  id: string;
  userId: string;
  word: string;
  phonetic?: string;
  category?: string; // e.g., 'Conjunction', 'Phrasal Verb', 'Noun', 'Adjective'
  translation: string;
  exampleEn?: string;
  examplePt?: string;
  contextSource?: string;
  status: VocabularyStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface GrammarItem {
  id: string;
  userId: string;
  topic: string;
  level: CEFRLevel;
  ruleExplanation: string;
  examples: { en: string; pt: string }[];
  notes?: string;
  mastered: boolean;
  createdAt: string;
}

export interface UserGoals {
  dailyGoalMinutes: number; // e.g., 30 min
  weeklyGoalHours: number; // e.g., 5h
  targetDaysPerWeek: number; // e.g., 5 days
}

export interface UserProfile {
  userId: string;
  displayName: string;
  currentLevel: CEFRLevel; // 'A1'
  targetLevel: CEFRLevel; // 'A2'
  targetHours: number; // recommended hours for level progression, e.g. 100
  goals: UserGoals;
}
