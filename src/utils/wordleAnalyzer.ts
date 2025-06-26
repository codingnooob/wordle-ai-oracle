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
    const newGuess = {
      guess: [...guessData], // Create a deep copy to avoid circular references
      timestamp: Date.now()
    };

    if (this.persistentMode) {
      this.guessHistory.push(newGuess);
    } else {
      // In non-persistent mode, only keep the current guess
      this.guessHistory = [newGuess];
    }
    
    console.log('Added guess to history:', newGuess);
    console.log('Total history length:', this.guessHistory.length);
  }

  clearHistory() {
    this.guessHistory = [];
  }

  getHistory(): GuessHistory[] {
    return this.guessHistory.map(h => ({
      guess: [...h.guess], // Return copies to avoid mutations
      timestamp: h.timestamp
    }));
  }

  analyzeCurrentState(wordLength: number): WordleSolution[] {
    if (this.guessHistory.length === 0) {
      console.log('No guess history available');
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

    console.log(`Checking ${wordDatabase.length} words against constraints`);

    // Filter and score words
    const validWords: WordleSolution[] = [];
    let checkedCount = 0;

    for (const { word, frequency } of wordDatabase) {
      checkedCount++;
      const isValid = validateWordAgainstConstraints(word, constraints);
      
      if (checkedCount <= 5) { // Log first few checks for debugging
        console.log(`Checking word "${word}":`, isValid);
      }
      
      if (isValid) {
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
    
    console.log(`Found ${validWords.length} valid words out of ${checkedCount} checked`);
    if (validWords.length > 0) {
      console.log('Top solutions:', validWords.slice(0, 5));
    }
    
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
