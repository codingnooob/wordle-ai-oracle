
export interface GuessData {
  letter: string;
  state: 'unknown' | 'absent' | 'present' | 'correct';
}

export interface WordConstraints {
  correctPositions: Map<number, string>; // position -> letter
  presentLetters: Set<string>; // letters that are in the word but wrong position
  absentLetters: Set<string>; // letters definitely not in the word
  positionExclusions: Map<number, Set<string>>; // position -> excluded letters
  letterCounts: Map<string, { min: number; max?: number }>; // letter -> count constraints
}

export interface GuessHistory {
  guess: GuessData[];
  timestamp: number;
}
