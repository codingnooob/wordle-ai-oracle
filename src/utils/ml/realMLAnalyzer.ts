
import { GuessData } from '../constraints/types';
import { ModelInitializer } from './models/modelInitializer';
import { WordGenerator } from './generators/wordGenerator';
import { WordValidator } from './validators/wordValidator';
import { WordScorer } from './scorers/wordScorer';

interface MLWordleSolution {
  word: string;
  probability: number;
}

export class RealMLAnalyzer {
  private modelInitializer = new ModelInitializer();
  private wordGenerator = new WordGenerator();
  private wordValidator = new WordValidator();
  private wordScorer = new WordScorer();

  async initialize(): Promise<void> {
    await this.modelInitializer.initialize();
    this.startBackgroundScraping();
  }

  private async startBackgroundScraping(): Promise<void> {
    const commonTexts = [
      "The quick brown fox jumps over the lazy dog",
      "English words are derived from various languages including Latin Greek and Germanic roots",
      "Common five letter words include about house world after every right think great where",
      "Wordle game uses common English words that people recognize and use frequently",
      "Letter frequency analysis shows that E T A O I N S H R are most common in English"
    ];

    const webScrapedData = commonTexts
      .join(' ')
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length >= 3 && word.length <= 8)
      .filter(word => /^[a-z]+$/.test(word));

    this.wordGenerator.setWebScrapedData(webScrapedData);
    console.log(`Scraped ${webScrapedData.length} words from web data`);
  }

  async analyzeGuess(
    guessData: GuessData[], 
    wordLength: number, 
    excludedLetters: Set<string>
  ): Promise<MLWordleSolution[]> {
    if (!this.modelInitializer.isModelInitialized()) {
      await this.initialize();
    }

    console.log('Starting real ML analysis...');

    const candidateWords = await this.wordGenerator.generateCandidateWords(
      guessData, 
      wordLength, 
      this.modelInitializer.getTextGenerator()
    );
    
    const filteredWords = candidateWords.filter(word => {
      const wordUpper = word.toUpperCase();
      for (const excluded of excludedLetters) {
        if (wordUpper.includes(excluded)) return false;
      }
      return true;
    });

    const validatedWords = await this.wordValidator.validateWords(
      filteredWords, 
      this.modelInitializer.getWordValidator()
    );

    const scoredWords = await this.wordScorer.scoreWords(
      validatedWords, 
      guessData, 
      wordLength,
      []
    );

    return scoredWords.slice(0, 15);
  }
}

export const realMLAnalyzer = new RealMLAnalyzer();
