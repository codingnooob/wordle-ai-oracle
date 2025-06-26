
import { pipeline } from '@huggingface/transformers';
import { GuessData } from './constraints/types';

export interface MLWordleSolution {
  word: string;
  probability: number;
}

class MLWordleAnalyzer {
  private textGenerator: any = null;
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    
    try {
      console.log('Initializing ML text generator...');
      this.textGenerator = await pipeline(
        'text-generation',
        'microsoft/DialoGPT-medium',
        { device: 'webgpu' }
      );
      this.initialized = true;
      console.log('ML text generator initialized successfully');
    } catch (error) {
      console.warn('WebGPU not available, falling back to CPU:', error);
      try {
        this.textGenerator = await pipeline(
          'text-generation',
          'microsoft/DialoGPT-medium'
        );
        this.initialized = true;
        console.log('ML text generator initialized on CPU');
      } catch (cpuError) {
        console.error('Failed to initialize text generator:', cpuError);
        throw cpuError;
      }
    }
  }

  async analyzeGuess(guessData: GuessData[], wordLength: number): Promise<MLWordleSolution[]> {
    await this.initialize();

    // Build constraint description for the ML model
    const constraints = this.buildConstraintDescription(guessData, wordLength);
    
    console.log('ML Analysis - Constraints:', constraints);

    // Generate multiple word candidates using the ML model
    const candidates = await this.generateWordCandidates(constraints, wordLength);
    
    // Score and rank the candidates
    const scoredCandidates = this.scoreAndRankCandidates(candidates, guessData);
    
    return scoredCandidates.slice(0, 15);
  }

  private buildConstraintDescription(guessData: GuessData[], wordLength: number): string {
    const correctLetters: string[] = [];
    const presentLetters: string[] = [];
    const absentLetters: string[] = [];
    const positionConstraints: string[] = [];

    guessData.forEach((tile, index) => {
      if (!tile.letter) return;
      
      const letter = tile.letter.toUpperCase();
      
      switch (tile.state) {
        case 'correct':
          correctLetters.push(`${letter} at position ${index + 1}`);
          break;
        case 'present':
          presentLetters.push(letter);
          positionConstraints.push(`${letter} not at position ${index + 1}`);
          break;
        case 'absent':
          absentLetters.push(letter);
          break;
      }
    });

    let description = `Find ${wordLength}-letter English words where: `;
    
    if (correctLetters.length > 0) {
      description += `Letters in correct positions: ${correctLetters.join(', ')}. `;
    }
    
    if (presentLetters.length > 0) {
      description += `Letters in word but wrong position: ${presentLetters.join(', ')}. `;
    }
    
    if (positionConstraints.length > 0) {
      description += `Position constraints: ${positionConstraints.join(', ')}. `;
    }
    
    if (absentLetters.length > 0) {
      description += `Letters not in word: ${absentLetters.join(', ')}. `;
    }

    return description;
  }

  private async generateWordCandidates(constraints: string, wordLength: number): Promise<string[]> {
    const prompts = [
      `${constraints} Common words:`,
      `${constraints} Possible solutions:`,
      `${constraints} Valid answers:`,
      `${constraints} Dictionary words:`
    ];

    const allCandidates = new Set<string>();

    for (const prompt of prompts) {
      try {
        const result = await this.textGenerator(prompt, {
          max_length: 50,
          num_return_sequences: 3,
          temperature: 0.7,
          do_sample: true
        });

        // Extract words from generated text
        const words = this.extractWordsFromText(result[0].generated_text, wordLength);
        words.forEach(word => allCandidates.add(word));
      } catch (error) {
        console.warn('Error generating candidates with prompt:', prompt, error);
      }
    }

    // Add some common word patterns based on constraints
    const patternWords = this.generatePatternWords(wordLength);
    patternWords.forEach(word => allCandidates.add(word));

    return Array.from(allCandidates);
  }

  private extractWordsFromText(text: string, wordLength: number): string[] {
    const words: string[] = [];
    const regex = new RegExp(`\\b[A-Za-z]{${wordLength}}\\b`, 'g');
    const matches = text.match(regex);
    
    if (matches) {
      matches.forEach(word => {
        const upperWord = word.toUpperCase();
        if (this.isValidEnglishWord(upperWord)) {
          words.push(upperWord);
        }
      });
    }
    
    return [...new Set(words)]; // Remove duplicates
  }

  private generatePatternWords(wordLength: number): string[] {
    // Generate common word patterns based on typical English letter frequencies
    const commonWords: { [key: number]: string[] } = {
      3: ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW'],
      4: ['THAT', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM', 'THEY', 'KNOW', 'WANT', 'BEEN', 'GOOD', 'MUCH', 'SOME', 'TIME', 'VERY', 'WHEN', 'COME', 'HERE', 'JUST'],
      5: ['WHICH', 'THEIR', 'WOULD', 'THERE', 'COULD', 'OTHER', 'AFTER', 'FIRST', 'NEVER', 'THESE', 'THINK', 'WHERE', 'BEING', 'EVERY', 'GREAT', 'MIGHT', 'SHALL', 'STILL', 'THOSE', 'UNDER'],
      6: ['SHOULD', 'AROUND', 'LITTLE', 'PEOPLE', 'BEFORE', 'MOTHER', 'THOUGH', 'SCHOOL', 'ALWAYS', 'REALLY', 'FATHER', 'FRIEND', 'HAVING', 'LETTER', 'MAKING', 'NUMBER', 'OFFICE', 'PERSON', 'PUBLIC', 'SECOND'],
      7: ['THROUGH', 'BETWEEN', 'ANOTHER', 'WITHOUT', 'BECAUSE', 'AGAINST', 'NOTHING', 'SOMEONE', 'TOWARDS', 'SEVERAL', 'ALREADY', 'ARTICLE', 'COMPANY', 'CONTENT', 'COUNTRY', 'EVENING', 'EXAMPLE', 'GENERAL', 'HOWEVER', 'INCLUDE'],
      8: ['BUSINESS', 'TOGETHER', 'CHILDREN', 'QUESTION', 'COMPLETE', 'YOURSELF', 'REMEMBER', 'ALTHOUGH', 'CONTINUE', 'POSSIBLE', 'ACTUALLY', 'BUILDING', 'CONSIDER', 'DECISION', 'EVERYONE', 'FEBRUARY', 'GREATEST', 'HAPPENED', 'INCREASE', 'LANGUAGE']
    };

    return commonWords[wordLength] || [];
  }

  private isValidEnglishWord(word: string): boolean {
    // Basic validation - only letters, reasonable length
    return /^[A-Z]+$/.test(word) && word.length >= 3 && word.length <= 8;
  }

  private scoreAndRankCandidates(candidates: string[], guessData: GuessData[]): MLWordleSolution[] {
    const scoredWords: MLWordleSolution[] = [];

    for (const word of candidates) {
      const score = this.calculateMLScore(word, guessData);
      if (score > 0) {
        // Convert score to probability (0-1 range)
        const probability = Math.min(0.95, Math.max(0.05, score / 100));
        scoredWords.push({
          word: word.toUpperCase(),
          probability: probability
        });
      }
    }

    // Sort by probability (highest first)
    scoredWords.sort((a, b) => b.probability - a.probability);

    // Ensure realistic probability distribution
    return scoredWords.map((solution, index) => ({
      ...solution,
      probability: Math.max(0.05, solution.probability * Math.pow(0.9, index))
    }));
  }

  private calculateMLScore(word: string, guessData: GuessData[]): number {
    let score = 50; // Base score
    const wordUpper = word.toUpperCase();

    // Check constraints compliance
    for (let i = 0; i < guessData.length; i++) {
      const tile = guessData[i];
      if (!tile.letter) continue;

      const letter = tile.letter.toUpperCase();
      const wordLetter = wordUpper[i];

      switch (tile.state) {
        case 'correct':
          if (wordLetter === letter) {
            score += 25; // Strong bonus for correct position
          } else {
            return 0; // Invalid word
          }
          break;
        case 'present':
          if (wordUpper.includes(letter)) {
            if (wordLetter !== letter) {
              score += 15; // Bonus for letter in word but different position
            } else {
              return 0; // Letter shouldn't be in this position
            }
          } else {
            return 0; // Letter must be in word
          }
          break;
        case 'absent':
          if (wordUpper.includes(letter)) {
            return 0; // Letter shouldn't be in word
          }
          score += 5; // Small bonus for respecting absent constraint
          break;
      }
    }

    // Bonus for common letters in good positions
    const commonLetters = 'ETAOINSHRDLU';
    for (let i = 0; i < wordUpper.length; i++) {
      if (commonLetters.includes(wordUpper[i])) {
        score += 2;
      }
    }

    // Bonus for vowel distribution
    const vowels = 'AEIOU';
    const vowelCount = wordUpper.split('').filter(l => vowels.includes(l)).length;
    if (vowelCount >= 1 && vowelCount <= 3) {
      score += 5;
    }

    return score;
  }
}

// Export singleton instance
export const mlWordleAnalyzer = new MLWordleAnalyzer();
