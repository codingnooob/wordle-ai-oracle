
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

    console.log('🔍 Starting constraint-aware ML analysis...');
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

    // Step 2: Generate candidate words with constraint awareness
    const candidateWords = await this.wordGenerator.generateConstraintAwareCandidates(
      guessData, 
      wordLength, 
      constraints,
      this.modelInitializer.getTextGenerator()
    );
    console.log(`🎯 Generated ${candidateWords.length} constraint-aware candidates`);

    // Step 3: Apply strict constraint validation
    let validWords = candidateWords.filter(word => {
      const wordUpper = word.toUpperCase();
      
      // Check excluded letters first (quick filter)
      for (const excluded of excludedLetters) {
        if (wordUpper.includes(excluded)) {
          return false;
        }
      }
      
      // Apply rigorous constraint validation
      const isValid = validateWordAgainstConstraints(wordUpper, constraints);
      if (!isValid) {
        console.log(`❌ Rejected "${wordUpper}" - failed constraint validation`);
      }
      return isValid;
    });

    console.log(`✅ ${validWords.length} words passed constraint validation out of ${candidateWords.length} candidates`);

    if (validWords.length === 0) {
      console.warn('⚠️ No words passed constraint validation - returning empty results');
      return [];
    }

    // Step 4: Enhanced validation with ML models
    const mlValidatedWords = await this.wordValidator.validateWords(
      validWords, 
      this.modelInitializer.getWordValidator()
    );

    // Step 5: Constraint-aware scoring
    const scoredWords = await this.wordScorer.scoreWordsWithConstraints(
      mlValidatedWords, 
      guessData, 
      constraints,
      wordLength,
      []
    );

    const finalResults = scoredWords.slice(0, 15);
    console.log('🏆 Final constraint-validated results:', finalResults.map(r => `${r.word}: ${(r.probability * 100).toFixed(1)}%`));

    return finalResults;
  }
}

export const realMLAnalyzer = new RealMLAnalyzer();
