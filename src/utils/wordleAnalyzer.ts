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
    const validWords: Array<{ word: string; score: number; frequency: number }> = [];
    let checkedCount = 0;
    let debugCount = 0;

    for (const { word, frequency } of wordDatabase) {
      checkedCount++;
      const isValid = validateWordAgainstConstraints(word, constraints);
      
      // Show detailed debugging for potential matches or first few words
      if (debugCount < 5 || potentialMatches.includes(word.toUpperCase())) { 
        console.log(`Checking word "${word}":`, isValid);
        debugCount++;
      }
      
      if (isValid) {
        const score = calculateWordScore(word, constraints, frequency);
        
        validWords.push({
          word: word,
          score: score,
          frequency: frequency
        });
        
        console.log(`✅ Found valid word: ${word} with score ${score} (frequency: ${frequency})`);
      }
    }

    if (validWords.length === 0) {
      console.log('❌ No valid words found! Possible reasons:');
      console.log('1. The constraints are too restrictive');
      console.log('2. The word database might not contain the target word');
      console.log('3. There might be conflicting constraints from multiple guesses');
      console.log('4. Check if all present letters can be placed in valid positions');
      return [];
    }

    // Sort by score (highest first)
    validWords.sort((a, b) => b.score - a.score);
    
    // Enhanced probability calculation to avoid all 95% results
    const totalScore = validWords.reduce((sum, word) => sum + word.score, 0);
    
    const solutions: WordleSolution[] = validWords.map((item, index) => {
      // Calculate probability based on score proportion and position
      const scoreRatio = item.score / totalScore;
      const positionPenalty = Math.pow(0.85, index); // Exponential decay by position
      const baseProbability = (scoreRatio * 100 * positionPenalty);
      
      // Ensure realistic distribution: top word gets highest, others diminish
      let probability: number;
      if (index === 0) {
        probability = Math.min(85, Math.max(45, baseProbability * 100));
      } else {
        probability = Math.min(75, Math.max(5, baseProbability * 80));
      }
      
      return {
        word: item.word,
        probability: Math.round(probability * 10) / 10 // Round to 1 decimal
      };
    });
    
    console.log(`Found ${validWords.length} valid words out of ${checkedCount} checked`);
    console.log('Top solutions with scores:', validWords.slice(0, 5).map(w => `${w.word}: ${w.score}`));
    console.log('Final probabilities:', solutions.slice(0, 5).map(s => `${s.word}: ${s.probability}%`));
    
    return solutions.slice(0, 15);
  }
}

// Export singleton instance
export const wordleAnalyzer = new WordleAnalyzer();

// Legacy function for backward compatibility - now async
export async function analyzeGuess(guessData: GuessData[], wordLength: number): Promise<WordleSolution[]> {
  wordleAnalyzer.addGuess(guessData);
  return await wordleAnalyzer.analyzeCurrentState(wordLength);
}
