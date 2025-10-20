import { GuessData } from './constraints/types';
import { MLWordleSolution } from './ml/types';
import { realMLAnalyzer } from './ml/realMLAnalyzer';
import { mlTrainingService } from './ml/mlTrainingService';

class MLWordleAnalyzer {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('Initializing Enhanced ML Wordle Analyzer...');
    
    // Start background training service
    await mlTrainingService.startBackgroundTraining();
    
    this.isInitialized = true;
    console.log('Enhanced ML Wordle Analyzer initialized successfully');
  }

  async analyzeGuess(guessData: GuessData[], wordLength: number, excludedLetters: Set<string> = new Set(), positionExclusions: Map<string, Set<number>> = new Map()): Promise<MLWordleSolution[]> {
    console.log('=== Starting Unified ML Analysis ===');
    console.log('Input guess data:', guessData);
    console.log('Word length:', wordLength);
    console.log('Excluded letters:', Array.from(excludedLetters));
    console.log('Position exclusions:', positionExclusions);
    
    // Check for duplicate letters in input for debugging
    this.debugDuplicateLetterInput(guessData);
    
    // Ensure ML system is initialized
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // First, try the unified analysis edge function
      const unifiedResult = await this.callUnifiedAnalysis(guessData, wordLength, excludedLetters, positionExclusions);
      
      if (unifiedResult && unifiedResult.length > 0) {
        console.log('✅ Unified analysis successful:', unifiedResult.slice(0, 5));
        return unifiedResult;
      }
      
      console.log('⚠️ Unified analysis returned no results, falling back to local ML analyzer...');
      
      // Fallback to existing ML analyzer
      const solutions = await realMLAnalyzer.analyzeGuess(guessData, wordLength, excludedLetters, positionExclusions);
      
      if (solutions.length === 0) {
        console.log('⚠️ Local ML analyzer also found no solutions - using enhanced fallback...');
        return this.enhancedFallbackAnalysis(guessData, wordLength, excludedLetters, positionExclusions);
      }
      
      // Convert raw ML probabilities (0-1) to percentage for display
      const solutionsWithPercentage = solutions.map(solution => ({
        word: solution.word,
        probability: Math.round(solution.probability * 100 * 10) / 10
      }));
      
      console.log('Local ML Analysis complete:', solutionsWithPercentage);
      return solutionsWithPercentage;
    } catch (error) {
      console.error('All analysis methods failed:', error);
      return this.enhancedFallbackAnalysis(guessData, wordLength, excludedLetters, positionExclusions);
    }
  }

  private async callUnifiedAnalysis(guessData: GuessData[], wordLength: number, excludedLetters: Set<string>, positionExclusions: Map<string, Set<number>>): Promise<MLWordleSolution[]> {
    try {
      console.log('Calling unified wordle analysis edge function...');
      
      // Convert position exclusions map to plain object for JSON serialization
      const positionExclusionsObj: { [key: string]: number[] } = {};
      for (const [letter, positions] of positionExclusions) {
        positionExclusionsObj[letter] = Array.from(positions);
      }
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      const response = await supabase.functions.invoke('unified-wordle-analysis', {
        body: {
          guessData,
          wordLength,
          excludedLetters: Array.from(excludedLetters),
          positionExclusions: positionExclusionsObj,
          maxResults: 0 // Get all available results, let frontend handle pagination
        }
      });

      if (response.error) {
        console.error('Unified analysis error:', response.error);
        return [];
      }

      if (response.data && response.data.solutions) {
        console.log(`✅ Unified analysis returned ${response.data.solutions.length} solutions`);
        return response.data.solutions;
      }

      console.log('⚠️ Unified analysis returned no solutions');
      return [];
    } catch (error) {
      console.error('Failed to call unified analysis:', error);
      return [];
    }
  }

  private debugDuplicateLetterInput(guessData: GuessData[]): void {
    console.log('\n--- Duplicate Letter Input Analysis ---');
    const letterStateMap = new Map<string, string[]>();
    
    guessData.forEach((tile, index) => {
      if (tile.letter) {
        const letter = tile.letter.toUpperCase();
        if (!letterStateMap.has(letter)) {
          letterStateMap.set(letter, []);
        }
        letterStateMap.get(letter)!.push(`pos${index}:${tile.state}`);
      }
    });
    
    for (const [letter, states] of letterStateMap) {
      if (states.length > 1) {
        console.log(`🔍 Duplicate letter detected: ${letter} -> [${states.join(', ')}]`);
        
        const hasGreen = states.some(s => s.includes('correct'));
        const hasYellow = states.some(s => s.includes('present'));
        const hasGrey = states.some(s => s.includes('absent'));
        
        if ((hasGreen || hasYellow) && hasGrey) {
          console.log(`  ⚠️ CRITICAL: ${letter} has mixed states (green/yellow + grey) - exact count case!`);
        }
      }
    }
  }

  private enhancedFallbackAnalysis(guessData: GuessData[], wordLength: number, excludedLetters: Set<string>, positionExclusions: Map<string, Set<number>> = new Map()): MLWordleSolution[] {
    console.log('=== Enhanced Fallback Analysis ===');
    console.log('Using enhanced constraint analysis for duplicate letters...');
    
    // Use the enhanced constraint analyzer
    const { analyzeConstraints, validateWordAgainstConstraints } = require('./constraintAnalyzer');
    const guessHistory = [{ guess: guessData, timestamp: Date.now() }];
    const constraints = analyzeConstraints(guessHistory);
    
    // Merge manual position exclusions with constraint-derived exclusions
    for (const [letter, positions] of positionExclusions) {
      for (const position of positions) {
        if (!constraints.positionExclusions.has(position)) {
          constraints.positionExclusions.set(position, new Set());
        }
        constraints.positionExclusions.get(position)!.add(letter);
      }
    }
    
    console.log('Enhanced constraints generated:', constraints);
    
    // Get common words and validate against enhanced constraints
    const commonWords = this.getCommonWords(wordLength);
    
    const validWords = commonWords.filter(word => {
      const wordUpper = word.toUpperCase();
      
      // Check excluded letters
      for (const excluded of excludedLetters) {
        if (wordUpper.includes(excluded)) return false;
      }
      
      // Enhanced constraint validation
      return validateWordAgainstConstraints(word, constraints);
    });

    console.log(`Enhanced fallback found ${validWords.length} valid words`);

    // If no words match, return empty array instead of unfiltered words
    if (validWords.length === 0) {
      console.log('No words satisfy constraints in enhanced fallback - returning empty results');
      return [];
    }

    // Calculate enhanced probabilities
    const scoredWords = validWords.map(word => {
      const probability = this.calculateEnhancedProbability(word, constraints, guessData);
      
      return {
        word: word,
        probability: Math.round(probability * 100 * 10) / 10
      };
    });

    // Sort by probability
    const sortedWords = scoredWords.sort((a, b) => b.probability - a.probability);
    
    console.log('Enhanced fallback results:', sortedWords.slice(0, 5));
    return sortedWords.slice(0, 15);
  }

  private calculateEnhancedProbability(word: string, constraints: any, guessData: GuessData[]): number {
    let probability = 0.1; // Base probability
    
    // Enhanced constraint fitness
    const constraintFitness = this.calculateEnhancedConstraintFitness(word, constraints);
    probability += constraintFitness * 0.7; // Higher weight for constraint satisfaction
    
    // Word quality
    const wordQuality = this.calculateWordQuality(word);
    probability += wordQuality * 0.2;
    
    console.log(`Enhanced probability for ${word}: ${(probability * 100).toFixed(1)}% (constraint: ${(constraintFitness * 70).toFixed(1)}%, quality: ${(wordQuality * 20).toFixed(1)}%)`);
    
    return Math.max(0.01, Math.min(0.99, probability));
  }

  private calculateEnhancedConstraintFitness(word: string, constraints: any): number {
    let fitness = 0.2; // Base fitness
    const wordUpper = word.toUpperCase();
    
    // Perfect position matches
    let correctMatches = 0;
    for (const [position, letter] of constraints.correctPositions) {
      if (wordUpper[position] === letter) {
        correctMatches++;
        fitness += 0.25;
      }
    }
    
    // Enhanced letter count satisfaction
    for (const [letter, countConstraint] of constraints.letterCounts) {
      const actualCount = wordUpper.split('').filter(l => l === letter).length;
      
      // Perfect count match gets highest score
      if (countConstraint.max !== undefined && actualCount === countConstraint.max) {
        fitness += 0.3; // High bonus for exact count match
      } else if (actualCount >= countConstraint.min) {
        fitness += 0.15; // Good bonus for meeting minimum
      }
    }
    
    // Position exclusion compliance
    let exclusionCompliance = 0;
    for (const [position, excludedLetters] of constraints.positionExclusions) {
      const letterAtPosition = wordUpper[position];
      if (!excludedLetters.has(letterAtPosition)) {
        exclusionCompliance += 0.1;
      }
    }
    fitness += exclusionCompliance;
    
    return Math.min(1.0, fitness);
  }

  private calculateWordQuality(word: string): number {
    let quality = 0.4; // Base quality
    
    // Vowel distribution
    const vowels = 'AEIOU';
    const vowelCount = word.split('').filter(letter => vowels.includes(letter.toUpperCase())).length;
    if (vowelCount >= 1 && vowelCount <= 3) {
      quality += 0.3;
    }
    
    // Letter diversity
    const uniqueLetters = new Set(word.toUpperCase().split('')).size;
    if (uniqueLetters >= 4) {
      quality += 0.2;
    }
    
    // Common letter patterns
    const commonLetters = 'ETAOINSHRDLU';
    let patternScore = 0;
    for (const letter of word.toUpperCase()) {
      const frequency = commonLetters.indexOf(letter);
      if (frequency !== -1) {
        patternScore += (commonLetters.length - frequency) / (commonLetters.length * word.length);
      }
    }
    quality += patternScore * 0.1;
    
    return Math.min(1.0, quality);
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
      5: ['ABOUT', 'WOULD', 'THERE', 'THEIR', 'COULD', 'OTHER', 'AFTER', 'FIRST', 'NEVER', 'THESE', 'LOOSE', 'GOOSE', 'BLOOD', 'FLOOR', 'ALLEY', 'HELLO', 'BALLS', 'HALLS', 'CALLS'],
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
