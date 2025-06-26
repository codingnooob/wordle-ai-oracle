
import { GuessData } from '../constraints/types';

export interface MLWordleSolution {
  word: string;
  probability: number;
}

export interface LetterFrequencies {
  [key: string]: number;
}

export interface WordGenerationOptions {
  wordLength: number;
  maxWords: number;
}
