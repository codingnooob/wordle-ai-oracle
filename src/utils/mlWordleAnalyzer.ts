
import { GuessData } from './constraints/types';
import { MLWordleSolution } from './ml/types';
import { WordGenerator } from './ml/wordGenerator';
import { ConstraintValidator } from './ml/constraintValidator';
import { ProbabilityCalculator } from './ml/probabilityCalculator';

class MLWordleAnalyzer {
  private wordGenerator = new WordGenerator();
  private constraintValidator = new ConstraintValidator();
  private probabilityCalculator = new ProbabilityCalculator();

  async analyzeGuess(guessData: GuessData[], wordLength: number): Promise<MLWordleSolution[]> {
    console.log('Starting ML analysis for guess:', guessData);
    
    // Get all possible words for the given length
    const candidateWords = this.wordGenerator.getAllCandidateWords(wordLength);
    
    // Filter words based on constraints
    const validWords = candidateWords.filter(word => 
      this.constraintValidator.satisfiesConstraints(word, guessData)
    );
    
    // Score and rank the valid words
    const scoredWords = validWords.map(word => ({
      word: word.toUpperCase(),
      probability: this.probabilityCalculator.calculateProbability(
        word, 
        guessData, 
        wordLength,
        this.isCommonWord(word, wordLength)
      )
    }));
    
    // Sort by probability (highest first) and take top 15
    scoredWords.sort((a, b) => b.probability - a.probability);
    
    console.log('ML Analysis complete:', scoredWords.slice(0, 15));
    return scoredWords.slice(0, 15);
  }

  private isCommonWord(word: string, wordLength: number): boolean {
    // This logic was moved from the original common words check
    const commonWords = this.wordGenerator['commonWords'];
    return commonWords[wordLength]?.includes(word.toUpperCase()) || false;
  }
}

// Export singleton instance
export const mlWordleAnalyzer = new MLWordleAnalyzer();
