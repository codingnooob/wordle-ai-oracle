
import { GuessData, WordConstraints } from '../../constraints/types';

interface MLWordleSolution {
  word: string;
  probability: number;
}

export class WordScorer {
  async scoreWords(
    words: string[], 
    guessData: GuessData[], 
    wordLength: number,
    webScrapedData: string[]
  ): Promise<MLWordleSolution[]> {
    // Legacy method - delegate to constraint-aware version
    const mockConstraints: WordConstraints = {
      correctPositions: new Map(),
      presentLetters: new Set(),
      absentLetters: new Set(),
      positionExclusions: new Map(),
      letterCounts: new Map()
    };
    
    return this.scoreWordsWithConstraints(words, guessData, mockConstraints, wordLength, webScrapedData);
  }

  async scoreWordsWithConstraints(
    words: string[], 
    guessData: GuessData[], 
    constraints: WordConstraints,
    wordLength: number,
    webScrapedData: string[]
  ): Promise<MLWordleSolution[]> {
    const scoredWords: MLWordleSolution[] = [];
    console.log(`🎯 Scoring ${words.length} constraint-validated words`);

    for (const word of words) {
      let score = 0.5; // Base score

      // Constraint satisfaction bonus (high weight since these are already validated)
      let constraintScore = 0.6; // High base for passing validation

      // Perfect position matches get maximum bonus
      for (const [position, letter] of constraints.correctPositions) {
        if (word[position] === letter) {
          constraintScore += 0.3;
        }
      }

      // Present letters in correct (non-excluded) positions
      for (const letter of constraints.presentLetters) {
        if (word.includes(letter)) {
          constraintScore += 0.2;
          
          // Extra bonus if letter is in a position that wasn't excluded
          for (let i = 0; i < word.length; i++) {
            if (word[i] === letter) {
              const excludedAtPosition = constraints.positionExclusions.get(i);
              if (!excludedAtPosition || !excludedAtPosition.has(letter)) {
                constraintScore += 0.1;
              }
            }
          }
        }
      }

      score += constraintScore;

      // Web corpus frequency bonus
      if (webScrapedData.includes(word.toLowerCase())) {
        score += 0.15;
      }

      // Letter frequency and common patterns
      const letterFrequencyScore = this.calculateLetterFrequencyScore(word);
      score += letterFrequencyScore * 0.1;

      // Word commonality bonus
      const commonalityScore = this.calculateCommonalityScore(word, wordLength);
      score += commonalityScore * 0.1;

      const probability = Math.max(0.05, Math.min(0.95, score));
      
      scoredWords.push({
        word: word,
        probability: probability
      });
    }

    // Sort by probability (highest first)
    const sortedWords = scoredWords.sort((a, b) => b.probability - a.probability);
    
    console.log(`🏆 Top 10 scored words:`, sortedWords.slice(0, 10).map(w => `${w.word}: ${(w.probability * 100).toFixed(1)}%`));
    
    return sortedWords;
  }

  private calculateLetterFrequencyScore(word: string): number {
    const commonLetters = 'ETAOINSHRDLUCMFWYPVBGKJQXZ';
    let score = 0;
    
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      const frequency = commonLetters.indexOf(letter);
      if (frequency !== -1) {
        score += (commonLetters.length - frequency) / commonLetters.length;
      }
    }
    
    return score / word.length;
  }

  private calculateCommonalityScore(word: string, wordLength: number): number {
    const commonWords: { [key: number]: string[] } = {
      3: ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER'],
      4: ['THAT', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM', 'THEY', 'KNOW', 'WANT'],
      5: ['ABOUT', 'WOULD', 'THERE', 'THEIR', 'COULD', 'OTHER', 'AFTER', 'FIRST', 'NEVER', 'THESE', 'WORDS', 'WORLD'],
      6: ['SHOULD', 'AROUND', 'LITTLE', 'PEOPLE', 'BEFORE', 'MOTHER'],
      7: ['THROUGH', 'BETWEEN', 'ANOTHER', 'WITHOUT', 'BECAUSE'],
      8: ['BUSINESS', 'TOGETHER', 'CHILDREN', 'QUESTION']
    };

    const wordsForLength = commonWords[wordLength] || [];
    const index = wordsForLength.indexOf(word.toUpperCase());
    
    if (index !== -1) {
      return (wordsForLength.length - index) / wordsForLength.length;
    }
    
    return 0;
  }
}
