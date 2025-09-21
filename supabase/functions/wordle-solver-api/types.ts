
export interface WordleAPIRequest {
  guessData: Array<{letter: string, state: 'correct' | 'present' | 'absent'}>;
  wordLength: number;
  excludedLetters?: string[];
  positionExclusions?: Record<string, number[]>;
  responseMode?: 'immediate' | 'async' | 'auto';
  apiKey?: string;
}

export interface WordleSolution {
  word: string;
  probability: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface RateLimitResult {
  valid: boolean;
  error?: string;
}

export interface AnalysisResult {
  solutions: WordleSolution[];
  status: string;
  confidence: number;
}
