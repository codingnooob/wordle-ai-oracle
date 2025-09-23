
export interface WordleAPIRequest {
  guessData: Array<{letter: string, state: 'correct' | 'present' | 'absent'}>;
  wordLength: number;
  excludedLetters?: string[];
  positionExclusions?: Record<string, number[]>;
  responseMode?: 'immediate' | 'async' | 'auto';
  apiKey?: string;
  maxResults?: number; // Number of results to return. Default: 15. Use 0 for unlimited (up to 1000).
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
  error?: string;
  fallback?: boolean;
}
