
import { GuessData } from '../constraints/types';
import { ModelInitializer } from './models/modelInitializer';
import { WordGenerator } from './generators/wordGenerator';
import { WordValidator } from './validators/wordValidator';
import { WordScorer } from './scorers/wordScorer';
import { analyzeConstraints, validateWordAgainstConstraints } from '../constraintAnalyzer';
import { SecurityUtils } from '../security/securityUtils';

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
    SecurityUtils.secureLog('Initialized word generator with empty corpus (will be populated by training service)');
  }

  // Method to update the corpus when training service provides it
  updateCorpus(corpusWords: string[]): void {
    // Security: Validate corpus size to prevent memory issues
    if (corpusWords.length > 500000) {
      SecurityUtils.secureLog('Corpus size exceeds safe limits, truncating', null, 'warn');
      corpusWords = corpusWords.slice(0, 500000);
    }
    
    this.wordGenerator.setWebScrapedData(corpusWords);
    SecurityUtils.secureLog(`Updated ML analyzer with corpus of ${corpusWords.length} real words`);
  }

  async analyzeGuess(
    guessData: GuessData[], 
    wordLength: number, 
    excludedLetters: Set<string>,
    positionExclusions: Map<string, Set<number>> = new Map()
  ): Promise<MLWordleSolution[]> {
    if (!this.modelInitializer.isModelInitialized()) {
      await this.initialize();
    }

    try {
      // Security: Validate inputs
      if (!Array.isArray(guessData) || wordLength < 3 || wordLength > 15) {
        throw new Error('Invalid input parameters');
      }

      SecurityUtils.secureLog('Starting corpus-based ML analysis with real words...');
      SecurityUtils.secureLog('Input constraints:', { 
        guessDataLength: guessData.length, 
        wordLength, 
        excludedLettersCount: excludedLetters.size,
        positionExclusionsCount: positionExclusions.size
      });

      // Step 1: Analyze constraints from guess data
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
      
      SecurityUtils.secureLog('Analyzed constraints:', {
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
      
      SecurityUtils.secureLog(`Found ${realWordCandidates.length} real words from corpus that match constraints`);

      if (realWordCandidates.length === 0) {
        SecurityUtils.secureLog('No real words found matching constraints - returning empty results', null, 'warn');
        return [];
      }

      // Step 3: Apply additional excluded letter filtering with security validation
      let validWords = realWordCandidates.filter(word => {
        const wordUpper = word.toUpperCase();
        
        // Security: Additional validation
        const validation = SecurityUtils.validateWordInput(wordUpper);
        if (!validation.isValid) {
          return false;
        }
        
        // Check excluded letters
        for (const excluded of excludedLetters) {
          if (wordUpper.includes(excluded)) {
            return false;
          }
        }
        
        // Double-check constraint validation
        const isValid = validateWordAgainstConstraints(wordUpper, constraints);
        if (!isValid) {
          SecurityUtils.secureLog(`Double-check failed for word`, null, 'warn');
        }
        return isValid;
      });

      SecurityUtils.secureLog(`${validWords.length} real words passed all validations`);

      if (validWords.length === 0) {
        SecurityUtils.secureLog('No words passed final validation - returning empty results', null, 'warn');
        return [];
      }

      // Step 4: ML validation (ensure they're recognizable English words)
      const mlValidatedWords = await this.wordValidator.validateWords(
        validWords, 
        this.modelInitializer.getWordValidator()
      );

      SecurityUtils.secureLog(`${mlValidatedWords.length} words passed ML validation`);

      // Step 5: Score the real words based on how well they fit constraints
      const scoredWords = await this.wordScorer.scoreWordsWithConstraints(
        mlValidatedWords, 
        guessData, 
        constraints,
        wordLength,
        validWords // Pass the corpus words for frequency scoring
      );

      const finalResults = scoredWords.slice(0, 50);
      SecurityUtils.secureLog('Final real word results:', finalResults.map(r => `${r.word}: ${(r.probability * 100).toFixed(1)}%`));

      return finalResults;

    } catch (error) {
      const safeError = SecurityUtils.getSafeErrorMessage(error as Error, 'analysis');
      SecurityUtils.secureLog(safeError, error, 'error');
      return [];
    }
  }
}

export const realMLAnalyzer = new RealMLAnalyzer();
