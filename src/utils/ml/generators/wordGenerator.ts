
import { GuessData, WordConstraints } from '../../constraints/types';
import { validateWordAgainstConstraints } from '../../constraints/validator';

export class WordGenerator {
  private webScrapedData: string[] = [];

  setWebScrapedData(data: string[]): void {
    this.webScrapedData = data;
    console.log(`📚 Set web scraped corpus: ${data.length} real words available`);
  }

  async generateConstraintAwareCandidates(
    guessData: GuessData[], 
    wordLength: number, 
    constraints: WordConstraints,
    textGenerator: any
  ): Promise<string[]> {
    console.log(`🎯 Finding real words from corpus that match constraints for ${wordLength}-letter words`);

    if (this.webScrapedData.length === 0) {
      console.warn('⚠️ No web scraped corpus available, falling back to common words');
      return this.getCommonWords(wordLength)
        .filter(word => validateWordAgainstConstraints(word, constraints));
    }

    // Filter the real word corpus by word length and constraints
    const corpusWords = this.webScrapedData
      .filter(word => word.length === wordLength)
      .map(word => word.toUpperCase())
      .filter(word => {
        // Only include words that pass constraint validation
        const isValid = validateWordAgainstConstraints(word, constraints);
        if (!isValid) {
          console.log(`🚫 Filtered out "${word}" - failed constraint validation`);
        }
        return isValid;
      });

    console.log(`✅ Found ${corpusWords.length} real words from corpus that satisfy constraints`);

    // If we have too few matches, also include common words that fit
    if (corpusWords.length < 20) {
      const commonWords = this.getCommonWords(wordLength)
        .filter(word => validateWordAgainstConstraints(word, constraints))
        .filter(word => !corpusWords.includes(word)); // Avoid duplicates
      
      corpusWords.push(...commonWords);
      console.log(`📖 Added ${commonWords.length} common words, total: ${corpusWords.length}`);
    }

    return corpusWords;
  }

  // Legacy method for backward compatibility
  async generateCandidateWords(
    guessData: Array<{letter: string, state: string}>, 
    wordLength: number, 
    textGenerator: any
  ): Promise<string[]> {
    // Convert to new format and use corpus-based generation
    const convertedGuessData: GuessData[] = guessData.map(tile => ({
      letter: tile.letter,
      state: tile.state as 'unknown' | 'absent' | 'present' | 'correct'
    }));

    // Create mock constraints for legacy compatibility
    const mockConstraints: WordConstraints = {
      correctPositions: new Map(),
      presentLetters: new Set(),
      absentLetters: new Set(),
      positionExclusions: new Map(),
      letterCounts: new Map()
    };

    return this.generateConstraintAwareCandidates(convertedGuessData, wordLength, mockConstraints, textGenerator);
  }

  private getCommonWords(wordLength: number): string[] {
    const commonWordSets: { [key: number]: string[] } = {
      3: ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER'],
      4: ['THAT', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM', 'THEY', 'KNOW', 'WANT'],
      5: ['ABOUT', 'WOULD', 'THERE', 'THEIR', 'COULD', 'OTHER', 'AFTER', 'FIRST', 'NEVER', 'THESE', 'WORDS', 'WORLD', 'HOUSE', 'GREAT', 'STILL', 'EVERY', 'PLACE', 'RIGHT', 'THINK', 'WHILE'],
      6: ['SHOULD', 'AROUND', 'LITTLE', 'PEOPLE', 'BEFORE', 'MOTHER', 'THOUGH', 'SCHOOL', 'ALWAYS', 'REALLY'],
      7: ['THROUGH', 'BETWEEN', 'ANOTHER', 'WITHOUT', 'BECAUSE', 'AGAINST', 'NOTHING', 'SOMEONE', 'TOWARDS', 'SEVERAL'],
      8: ['BUSINESS', 'TOGETHER', 'CHILDREN', 'QUESTION', 'COMPLETE', 'YOURSELF', 'REMEMBER', 'ALTHOUGH', 'CONTINUE', 'POSSIBLE']
    };

    return commonWordSets[wordLength] || [];
  }
}
