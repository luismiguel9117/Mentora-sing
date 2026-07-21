export type NavTab = 'home' | 'discover' | 'practice' | 'community' | 'profile' | 'now_playing';

export type CEFRLevel = 'A1 Beginner' | 'A2 Elementary' | 'B1 Intermediate' | 'B2 Upper Int' | 'C1 Advanced';

export interface WordAnnotation {
  word: string;
  phonetic: string;
  translation: string;
  definition: string;
  example: string;
}

export interface LyricLine {
  id: number;
  timeSeconds: number;
  text: string;
  spanishTranslation: string;
  grammarNote?: string;
  words?: WordAnnotation[];
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  level: CEFRLevel;
  genre: string;
  durationSeconds: number;
  progressPercent?: number;
  practicedCount: string;
  videoUrl?: string;
  videoImage: string;
  coverImage: string;
  featured?: boolean;
  upNext?: boolean;
  lyrics: LyricLine[];
}

export type PracticeMode = 'karaoke' | 'listening' | 'pronunciation' | 'lyrics' | 'ai_coach' | 'vocabulary';

export interface AchievementBadge {
  id: string;
  name: string;
  icon: string;
  colorGradient: string;
  unlocked: boolean;
  description: string;
}

export interface UserStats {
  weeklyXp: number;
  newWords: number;
  songsDone: number;
  pronunciationPercent: number;
  streakDays: number;
  dailyGoalProgress: number;
}
