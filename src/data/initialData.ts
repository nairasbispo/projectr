import { Activity, VocabularyWord, UserProfile, GrammarItem } from '../types';

export const defaultProfile: UserProfile = {
  userId: 'user_active',
  displayName: 'Reinan',
  currentLevel: 'A1',
  targetLevel: 'A2',
  targetHours: 100,
  goals: {
    dailyGoalMinutes: 30,
    weeklyGoalHours: 5,
    targetDaysPerWeek: 5,
  },
};

// Clean zeroed dataset so user starts fresh to input their own learning data
export const initialActivities: Activity[] = [];

export const initialVocabulary: VocabularyWord[] = [];

export const initialGrammar: GrammarItem[] = [];

// Sample starter data that user can optionally load if desired
export const sampleStarterActivities: Activity[] = [
  {
    id: 'sample-act-1',
    userId: 'user_active',
    skill: 'listening',
    activityType: 'YouTube',
    durationMinutes: 25,
    date: new Date().toISOString().slice(0, 10),
    time: '08:30',
    title: 'BBC Learning English - 6 Minute English',
    url: 'https://youtube.com',
    notes: 'Anotações sobre vocabulário de trabalho e rotina.',
    createdAt: new Date().toISOString(),
  },
];

export const sampleStarterVocabulary: VocabularyWord[] = [
  {
    id: 'sample-vocab-1',
    userId: 'user_active',
    word: 'Although',
    phonetic: '/ɔːlˈðəʊ/',
    category: 'Conjunction',
    translation: 'Embora / Apesar de que',
    exampleEn: 'Although it was raining, we went outside.',
    examplePt: 'Embora estivesse chovendo, saímos para fora.',
    contextSource: 'Listening Podcast',
    status: 'review',
    createdAt: new Date().toISOString(),
  },
];
