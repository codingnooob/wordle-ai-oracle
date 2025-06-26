
import { getWordsForLength } from './wordDatabase';
import { 
  analyzeConstraints, 
  validateWordAgainstConstraints, 
  calculateWordScore,
  findPotentialMatches,
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
    // Create a proper deep copy to prevent circular references
    const deepCopyGuess = guessData.map(tile => ({
      letter: tile.letter,
      state: tile.state
    }));

    const newGuess = {
      guess: deepCopyGuess,
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
    // Return proper deep copies to avoid mutations
    return this.guessHistory.map(h => ({
      guess: h.guess.map(tile => ({
        letter: tile.letter,
        state: tile.state
      })),
      timestamp: h.timestamp
    }));
  }

  async analyzeCurrentState(wordLength: number): Promise<WordleSolution[]> {
    if (this.guessHistory.length === 0) {
      console.log('No guess history available');
      return [];
    }

    console.log('Analyzing word constraints with history:', this.guessHistory);

    // Analyze all constraints from history
    const constraints = analyzeConstraints(this.guessHistory);
    console.log('Generated constraints:', constraints);

    // Find potential matches for debugging
    const potentialMatches = findPotentialMatches(constraints);
    console.log('Potential matches to look for:', potentialMatches);

    // Get word database for the specified length (now async)
    const wordDatabase = await getWordsForLength(wordLength);
    if (wordDatabase.length === 0) {
      console.warn(`No words found for length ${wordLength}`);
      return [];
    }

    console.log(`Checking ${wordDatabase.length} words against constraints`);
    
    // Log first few words in database for debugging
    console.log('First 10 words in database:', wordDatabase.slice(0, 10).map(w => w.word));

    // Filter and score words
    const validWords: WordleSolution[] = [];
    let checkedCount = 0;

    for (const { word, frequency } of wordDatabase) {
      checkedCount++;
      const isValid = validateWordAgainstConstraints(word, constraints);
      
      if (checkedCount <= 10 || potentialMatches.includes(word.toUpperCase())) { 
        console.log(`Checking word "${word}":`, isValid);
      }
      
      if (isValid) {
        const score = calculateWordScore(word, constraints, frequency);
        const probability = Math.min(95, Math.max(5, score));
        
        validWords.push({
          word: word,
          probability: probability
        });
        
        console.log(`✅ Found valid word: ${word} with probability ${probability}%`);
      }
    }

    // Sort by probability (highest first) and limit results
    validWords.sort((a, b) => b.probability - a.probability);
    
    console.log(`Found ${validWords.length} valid words out of ${checkedCount} checked`);
    if (validWords.length > 0) {
      console.log('Top solutions:', validWords.slice(0, 5));
    } else {
      console.log('❌ No valid words found! This might indicate:');
      console.log('1. The constraints are too restrictive');
      console.log('2. The word database might not contain the target word');
      console.log('3. There might be a logic error in constraint validation');
    }
    
    return validWords.slice(0, 15);
  }
}

// Export singleton instance
export const wordleAnalyzer = new WordleAnalyzer();

// Legacy function for backward compatibility - now async
export async function analyzeGuess(guessData: GuessData[], wordLength: number): Promise<WordleSolution[]> {
  wordleAnalyzer.addGuess(guessData);
  return await wordleAnalyzer.analyzeCurrentState(wordLength);
}
