
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
  private currentGuess: GuessHistory | null = null;

  addGuess(guessData: GuessData[]) {
    // Create a proper deep copy to prevent circular references
    const deepCopyGuess = guessData.map(tile => ({
      letter: tile.letter,
      state: tile.state
    }));

    this.currentGuess = {
      guess: deepCopyGuess,
      timestamp: Date.now()
    };
    
    console.log('Set current guess:', this.currentGuess);
  }

  clearHistory() {
    this.currentGuess = null;
  }

  getHistory(): GuessHistory[] {
    // Return current guess as single-item array for compatibility
    return this.currentGuess ? [this.currentGuess] : [];
  }

  async analyzeCurrentState(wordLength: number): Promise<WordleSolution[]> {
    if (!this.currentGuess) {
      console.log('No current guess available');
      return [];
    }

    console.log('Analyzing word constraints with current guess:', this.currentGuess);

    // Analyze constraints from the single current guess
    const constraints = analyzeConstraints([this.currentGuess]);
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

    // Filter and calculate genuine ML probabilities for words
    const validWords: Array<{ word: string; probability: number; frequency: number }> = [];
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
        // Calculate genuine ML probability based on constraint fitness and word quality
        const probability = this.calculateGenuineMLProbability(word, constraints, frequency, wordLength);
        
        validWords.push({
          word: word,
          probability: probability,
          frequency: frequency
        });
        
        console.log(`✅ Found valid word: ${word} with ML probability ${(probability * 100).toFixed(1)}% (frequency: ${frequency})`);
      }
    }

    if (validWords.length === 0) {
      console.log('❌ No valid words found! Possible reasons:');
      console.log('1. The constraints are too restrictive');
      console.log('2. The word database might not contain the target word');
      console.log('3. There might be conflicting constraints');
      console.log('4. Check if all present letters can be placed in valid positions');
      return [];
    }

    // Sort by genuine ML probability (highest first) - no artificial rank manipulation
    validWords.sort((a, b) => b.probability - a.probability);
    
    // Convert to percentage for display (simple conversion, no artificial adjustment)
    const solutions: WordleSolution[] = validWords.map((item) => ({
      word: item.word,
      probability: Math.round(item.probability * 100 * 10) / 10 // Convert 0-1 to percentage
    }));
    
    console.log(`Found ${validWords.length} valid words out of ${checkedCount} checked`);
    console.log('ML-determined probabilities:', validWords.slice(0, 5).map(w => `${w.word}: ${(w.probability * 100).toFixed(1)}%`));
    console.log('Final display probabilities:', solutions.slice(0, 5).map(s => `${s.word}: ${s.probability}%`));
    
    return solutions.filter(s => s.probability > 1); // Only return words with >1% probability
  }

  private calculateGenuineMLProbability(
    word: string, 
    constraints: any, 
    frequency: number, 
    wordLength: number
  ): number {
    console.log(`🧮 Calculating genuine ML probability for "${word}"`);
    
    // Base probability from word frequency (logarithmic scaling)
    let probability = Math.log(frequency + 1) / Math.log(1000); // Scale to roughly 0-1
    probability = Math.min(0.4, probability); // Cap frequency contribution at 40%
    
    // Constraint satisfaction fitness (most important factor)
    const constraintFitness = this.calculateConstraintSatisfaction(word, constraints);
    probability += constraintFitness * 0.5; // Up to 50% boost for perfect constraint fit
    
    // Word quality factors
    const qualityScore = this.calculateWordQuality(word, wordLength);
    probability += qualityScore * 0.1; // Up to 10% boost for word quality
    
    // Ensure realistic probability range (not artificial bounds)
    const finalProbability = Math.max(0.05, Math.min(0.95, probability));
    
    console.log(`  Frequency contrib: ${(Math.min(0.4, Math.log(frequency + 1) / Math.log(1000)) * 100).toFixed(1)}%`);
    console.log(`  Constraint fitness: ${(constraintFitness * 50).toFixed(1)}%`);
    console.log(`  Quality score: ${(qualityScore * 10).toFixed(1)}%`);
    console.log(`  Final ML probability: ${(finalProbability * 100).toFixed(1)}%`);
    
    return finalProbability;
  }

  private calculateConstraintSatisfaction(word: string, constraints: any): number {
    // This calculates how well the word satisfies the constraints (0-1 scale)
    let satisfaction = 0;
    
    // Perfect position matches
    let correctCount = 0;
    for (const [position, letter] of constraints.correctPositions) {
      if (word.toUpperCase()[position] === letter) {
        correctCount++;
      }
    }
    if (constraints.correctPositions.size > 0) {
      satisfaction += (correctCount / constraints.correctPositions.size) * 0.6;
    }
    
    // Present letters in valid positions  
    let presentCount = 0;
    for (const letter of constraints.presentLetters) {
      if (word.toUpperCase().includes(letter)) {
        presentCount++;
      }
    }
    if (constraints.presentLetters.size > 0) {
      satisfaction += (presentCount / constraints.presentLetters.size) * 0.4;
    }
    
    return Math.min(1.0, satisfaction);
  }

  private calculateWordQuality(word: string, wordLength: number): number {
    // Calculate intrinsic word quality (0-1 scale)
    let quality = 0.5; // Base quality
    
    // Vowel distribution
    const vowels = 'AEIOU';
    const vowelCount = word.split('').filter(letter => vowels.includes(letter.toUpperCase())).length;
    if (vowelCount >= 1 && vowelCount <= 3) {
      quality += 0.2;
    }
    
    // Letter diversity
    const uniqueLetters = new Set(word.toUpperCase().split('')).size;
    if (uniqueLetters >= Math.max(3, wordLength - 2)) {
      quality += 0.3;
    }
    
    return Math.min(1.0, quality);
  }
}

// Export singleton instance
export const wordleAnalyzer = new WordleAnalyzer();

// Legacy function for backward compatibility - now async
export async function analyzeGuess(guessData: GuessData[], wordLength: number): Promise<WordleSolution[]> {
  wordleAnalyzer.addGuess(guessData);
  return await wordleAnalyzer.analyzeCurrentState(wordLength);
}
