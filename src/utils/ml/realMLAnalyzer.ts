
import { GuessData } from '../constraints/types';
import { ModelInitializer } from './models/modelInitializer';
import { WordGenerator } from './generators/wordGenerator';
import { WordValidator } from './validators/wordValidator';
import { WordScorer } from './scorers/wordScorer';
import { analyzeConstraints, validateWordAgainstConstraints } from '../constraintAnalyzer';

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
    // This will be populated by the ML training service with real corpus data
    const webScrapedData: string[] = [];
    this.wordGenerator.setWebScrapedData(webScrapedData);
    console.log(`Initialized word generator with empty corpus (will be populated by training service)`);
  }

  // Method to update the corpus when training service provides it
  updateCorpus(corpusWords: string[]): void {
    this.wordGenerator.setWebScrapedData(corpusWords);
    console.log(`📚 Updated ML analyzer with corpus of ${corpusWords.length} real words`);
  }

  async analyzeGuess(
    guessData: GuessData[], 
    wordLength: number, 
    excludedLetters: Set<string>
  ): Promise<MLWordleSolution[]> {
    if (!this.modelInitializer.isModelInitialized()) {
      await this.initialize();
    }

    console.log('🔍 Starting corpus-based ML analysis with real words...');
    console.log('Input constraints:', { guessData, wordLength, excludedLetters: Array.from(excludedLetters) });

    // Step 1: Analyze constraints from guess data
    const guessHistory = [{ guess: guessData, timestamp: Date.now() }];
    const constraints = analyzeConstraints(guessHistory);
    console.log('📋 Analyzed constraints:', {
      correctPositions: Array.from(constraints.correctPositions.entries()),
      presentLetters: Array.from(constraints.presentLetters),
      absentLetters: Array.from(constraints.absentLetters),
      positionExclusions: Array.from(constraints.positionExclusions.entries()).map(([pos, letters]) => [pos, Array.from(letters)])
    });

    // Step 2: Get real words from corpus that match constraints
    const realWordCandidates = await this.wordGenerator.generateConstraintAwareCandidates(
      guessData, 
      wordLength, 
      constraints,
      this.modelInitializer.getTextGenerator()
    );
    console.log(`📚 Found ${realWordCandidates.length} real words from corpus that match constraints`);

    if (realWordCandidates.length === 0) {
      console.warn('⚠️ No real words found matching constraints - returning empty results');
      return [];
    }

    // Step 3: Apply additional excluded letter filtering
    let validWords = realWordCandidates.filter(word => {
      const wordUpper = word.toUpperCase();
      
      // Check excluded letters
      for (const excluded of excludedLetters) {
        if (wordUpper.includes(excluded)) {
          return false;
        }
      }
      
      // Double-check constraint validation
      const isValid = validateWordAgainstConstraints(wordUpper, constraints);
      if (!isValid) {
        console.log(`❌ Double-check failed for "${wordUpper}"`);
      }
      return isValid;
    });

    console.log(`✅ ${validWords.length} real words passed all validations`);

    if (validWords.length === 0) {
      console.warn('⚠️ No words passed final validation - returning empty results');
      return [];
    }

    // Step 4: ML validation (ensure they're recognizable English words)
    const mlValidatedWords = await this.wordValidator.validateWords(
      validWords, 
      this.modelInitializer.getWordValidator()
    );

    console.log(`🤖 ${mlValidatedWords.length} words passed ML validation`);

    // Step 5: Score the real words based on how well they fit constraints
    const scoredWords = await this.wordScorer.scoreWordsWithConstraints(
      mlValidatedWords, 
      guessData, 
      constraints,
      wordLength,
      validWords // Pass the corpus words for frequency scoring
    );

    const finalResults = scoredWords.slice(0, 15);
    console.log('🏆 Final real word results:', finalResults.map(r => `${r.word}: ${(r.probability * 100).toFixed(1)}%`));

    return finalResults;
  }
}

export const realMLAnalyzer = new RealMLAnalyzer();
