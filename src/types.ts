export type Difficulty = 'easy' | 'medium' | 'hard';
export type Duration = 15 | 30 | 60 | 120;
export type TestMode = 'words' | 'sentences';
export type ScriptType = 'latin' | 'cyrillic';
export type ThemeColor = 'blue' | 'emerald' | 'violet' | 'rose' | 'amber' | 'cyan';

export interface TestResult {
  id: string;
  userId?: string;
  wpm: number;
  cpm: number;
  accuracy: number;
  errors: number;
  correctChars: number;
  incorrectChars: number;
  difficulty: Difficulty;
  duration: Duration;
  date: string;
  language?: string;
  mode?: TestMode;
  isDaily?: boolean;
  createdAt?: any;
  charErrors?: Record<string, number>;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: any;
  averageWpm: number;
  bestWpm: number;
  totalTests: number;
  totalCorrectChars: number;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  ownerId: string;
  ownerName: string;
  memberIds: string[];
  memberCount: number;
  createdAt: any;
}

export interface GroupMember {
  userId: string;
  displayName: string;
  photoURL: string;
  averageWpm: number;
  bestWpm: number;
  totalTests: number;
  lastTestDate?: any;
}

export interface WpmDataPoint {
  second: number;
  wpm: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (stats: { totalTests: number; bestWpm: number; averageWpm: number; totalCorrectChars: number; streak: number }) => boolean;
}
