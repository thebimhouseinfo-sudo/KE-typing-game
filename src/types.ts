export type InputMethod = 'telex' | 'vni';

export interface UserProfile {
  name: string;
  avatar: string; // emoji or designator
  inputMethod: InputMethod;
  score: number;
  completedLevels: {
    [levelId: string]: {
      stars: number;
      highScore: number;
      wpm: number;
      accuracy: number;
    };
  };
  badges: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  condition: string;
}

export interface Level {
  id: string;
  name: string;
  description: string;
  category: 'home-row' | 'all-rows' | 'vi-letters' | 'vi-words' | 'vi-sentences' | 'bubble-race';
  targetItems: string[];
  helperTips?: {
    [key: string]: string; // e.g. a -> "Telex: gõ 'as' để thành 'á'"
  };
  icon: string;
  bgGradient: string;
  badgeToUnlock?: string;
}

export interface KeyboardKey {
  key: string;
  display: string;
  finger: 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' | 'thumb' | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky';
  row: 'number' | 'top' | 'home' | 'bottom' | 'space';
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  score: number;
  wpm: number;
  accuracy: number;
  isNpc?: boolean;
}

export interface PlaySession {
  levelId: string;
  startTime: number | null;
  items: string[];
  currentIndex: number;
  typedString: string; // what was typed for current item
  errors: number;
  keystrokes: number;
  score: number;
}
