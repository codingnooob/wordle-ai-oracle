
import { GuessData } from './constraints/types';
import { MLWordleSolution } from './ml/types';
import { realMLAnalyzer } from './ml/realMLAnalyzer';
import { mlTrainingService } from './ml/mlTrainingService';

class MLWordleAnalyzer {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('Initializing ML Wordle Analyzer...');
    
    // Start background training service
    await mlTrainingService.startBackgroundTraining();
    
    this.isInitialized = true;
    console.log('ML Wordle Analyzer initialized successfully');
  }

  async analyzeGuess(guessData: GuessData[], wordLength: number, excludedLetters: Set<string> = new Set()): Promise<MLWordleSolution[]> {
    console.log('Starting real ML analysis for guess:', guessData);
    console.log('Excluded letters:', Array.from(excludedLetters));
    
    // Ensure ML system is initialized
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Use real ML analyzer
      const solutions = await realMLAnalyzer.analyzeGuess(guessData, wordLength, excludedLetters);
      
      // Convert probability (0-1) to percentage for display
      const solutionsWithPercentage = solutions.map(solution => ({
        word: solution.word,
        probability: Math.round(solution.probability * 100 * 10) / 10
      }));
      
      console.log('Real ML Analysis complete:', solutionsWithPercentage);
      return solutionsWithPercentage;
    } catch (error) {
      console.error('Real ML Analysis failed:', error);
      
      // Fallback to basic analysis if ML fails
      return this.fallbackAnalysis(guessData, wordLength, excludedLetters);
    }
  }

  private fallbackAnalysis(guessData: GuessData[], wordLength: number, excludedLetters: Set<string>): MLWordleSolution[] {
    console.log('Using fallback analysis...');
    
    // Simple constraint-based analysis as fallback
    const commonWords = this.getCommonWords(wordLength);
    
    const validWords = commonWords.filter(word => {
      // Check excluded letters
      const wordUpper = word.toUpperCase();
      for (const excluded of excludedLetters) {
        if (wordUpper.includes(excluded)) return false;
      }
      
      // Basic constraint checking
      return this.satisfiesBasicConstraints(word, guessData);
    });

    return validWords.map((word, index) => ({
      word: word,
      probability: Math.max(10, 80 - (index * 5)) // Decreasing probability
    })).slice(0, 15);
  }

  private satisfiesBasicConstraints(word: string, guessData: GuessData[]): boolean {
    const wordUpper = word.toUpperCase();
    
    for (let i = 0; i < guessData.length; i++) {
      const tile = guessData[i];
      if (!tile.letter) continue;
      
      const letter = tile.letter.toUpperCase();
      const wordLetter = wordUpper[i];
      
      switch (tile.state) {
        case 'correct':
          if (wordLetter !== letter) return false;
          break;
        case 'present':
          if (!wordUpper.includes(letter) || wordLetter === letter) return false;
          break;
        case 'absent':
          if (wordUpper.includes(letter)) return false;
          break;
      }
    }
    
    return true;
  }

  private getCommonWords(wordLength: number): string[] {
    const commonWordSets: { [key: number]: string[] } = {
      3: ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER'],
      4: ['THAT', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM', 'THEY', 'KNOW', 'WANT'],
      5: ['ABOUT', 'WOULD', 'THERE', 'THEIR', 'COULD', 'OTHER', 'AFTER', 'FIRST', 'NEVER', 'THESE'],
      6: ['SHOULD', 'AROUND', 'LITTLE', 'PEOPLE', 'BEFORE', 'MOTHER', 'THOUGH', 'SCHOOL', 'ALWAYS', 'REALLY'],
      7: ['THROUGH', 'BETWEEN', 'ANOTHER', 'WITHOUT', 'BECAUSE', 'AGAINST', 'NOTHING', 'SOMEONE', 'TOWARDS', 'SEVERAL'],
      8: ['BUSINESS', 'TOGETHER', 'CHILDREN', 'QUESTION', 'COMPLETE', 'YOURSELF', 'REMEMBER', 'ALTHOUGH', 'CONTINUE', 'POSSIBLE']
    };

    return commonWordSets[wordLength] || [];
  }

  getTrainingStatus(): { isTraining: boolean; dataSize: number } {
    return {
      isTraining: this.isInitialized,
      dataSize: mlTrainingService.getTrainingDataSize()
    };
  }
}

// Export singleton instance
export const mlWordleAnalyzer = new MLWordleAnalyzer();
