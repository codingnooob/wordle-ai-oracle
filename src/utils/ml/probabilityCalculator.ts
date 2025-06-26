
import { GuessData } from '../constraints/types';
import { LetterFrequencies } from './types';

export class ProbabilityCalculator {
  private getLetterFrequencies(): LetterFrequencies {
    return {
      'E': 0.12, 'T': 0.09, 'A': 0.08, 'O': 0.08, 'I': 0.07, 'N': 0.07,
      'S': 0.06, 'H': 0.06, 'R': 0.06, 'D': 0.04, 'L': 0.04, 'C': 0.03,
      'U': 0.03, 'M': 0.02, 'W': 0.02, 'F': 0.02, 'G': 0.02, 'Y': 0.02,
      'P': 0.02, 'B': 0.01, 'V': 0.01, 'K': 0.01, 'J': 0.001, 'X': 0.001,
      'Q': 0.001, 'Z': 0.001
    };
  }

  calculateProbability(word: string, guessData: GuessData[], wordLength: number, isCommonWord: boolean): number {
    let score = 0.5; // Base probability
    
    const wordUpper = word.toUpperCase();
    const letterFreq = this.getLetterFrequencies();
    
    // Bonus for common letters
    for (const letter of wordUpper) {
      score += (letterFreq[letter] || 0) * 0.1;
    }
    
    // Bonus for common word patterns
    if (isCommonWord) {
      score += 0.3;
    }
    
    // Bonus for satisfying more constraints
    let constraintsSatisfied = 0;
    let totalConstraints = 0;
    
    for (const tile of guessData) {
      if (!tile.letter) continue;
      totalConstraints++;
      
      const letter = tile.letter.toUpperCase();
      switch (tile.state) {
        case 'correct':
        case 'present':
        case 'absent':
          constraintsSatisfied++;
          break;
      }
    }
    
    if (totalConstraints > 0) {
      score += (constraintsSatisfied / totalConstraints) * 0.2;
    }
    
    // Normalize to 0-1 range
    return Math.min(0.95, Math.max(0.05, score));
  }
}
