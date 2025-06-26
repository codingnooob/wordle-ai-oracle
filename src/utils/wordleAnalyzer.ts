import { getWordsForLength } from './wordDatabase';
import { 
  analyzeConstraints, 
  validateWordAgainstConstraints, 
  calculateWordScore,
  GuessData,
  GuessHistory 
} from './constraintAnalyzer';

export interface WordleSolution {
  word: string;
  probability: number;
}

class WordleAnalyzer {
  private guessHistory: GuessHistory[] = [];
  private persistentMode: boolean = false;

  setPersistentMode(enabled: boolean) {
    this.persistentMode = enabled;
    if (!enabled) {
      this.clearHistory();
    }
  }

  addGuess(guessData: GuessData[]) {
    if (this.persistentMode) {
      this.guessHistory.push({
        guess: guessData,
        timestamp: Date.now()
      });
    } else {
      // In non-persistent mode, only keep the current guess
      this.guessHistory = [{
        guess: guessData,
        timestamp: Date.now()
      }];
    }
  }

  clearHistory() {
    this.guessHistory = [];
  }

  getHistory(): GuessHistory[] {
    return [...this.guessHistory];
  }

  analyzeCurrentState(wordLength: number): WordleSolution[] {
    if (this.guessHistory.length === 0) {
      return [];
    }

    console.log('Analyzing word constraints with history:', this.guessHistory);

    // Analyze all constraints from history
    const constraints = analyzeConstraints(this.guessHistory);
    console.log('Generated constraints:', constraints);

    // Get word database for the specified length
    const wordDatabase = getWordsForLength(wordLength);
    if (wordDatabase.length === 0) {
      console.warn(`No words found for length ${wordLength}`);
      return [];
    }

    // Filter and score words
    const validWords: WordleSolution[] = [];

    for (const { word, frequency } of wordDatabase) {
      if (validateWordAgainstConstraints(word, constraints)) {
        const score = calculateWordScore(word, constraints, frequency);
        const probability = Math.min(95, Math.max(5, score));
        
        validWords.push({
          word: word,
          probability: probability
        });
      }
    }

    // Sort by probability (highest first) and limit results
    validWords.sort((a, b) => b.probability - a.probability);
    
    console.log(`Found ${validWords.length} valid words`);
    return validWords.slice(0, 15);
  }
}

// Export singleton instance
export const wordleAnalyzer = new WordleAnalyzer();

// Legacy function for backward compatibility
export async function analyzeGuess(guessData: GuessData[], wordLength: number): Promise<WordleSolution[]> {
  wordleAnalyzer.addGuess(guessData);
  return wordleAnalyzer.analyzeCurrentState(wordLength);
}
