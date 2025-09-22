
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { WordleSolution, AnalysisResult } from './types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Constraint types (copied from src/utils/constraints/types.ts)
interface GuessData {
  letter: string;
  state: 'unknown' | 'absent' | 'present' | 'correct';
}

interface WordConstraints {
  correctPositions: Map<number, string>;
  presentLetters: Set<string>;
  absentLetters: Set<string>;
  positionExclusions: Map<number, Set<string>>;
  letterCounts: Map<string, { min: number; max?: number }>;
}

interface GuessHistory {
  guess: GuessData[];
  timestamp: number;
}

// Constraint analysis logic (copied from src/utils/constraints/analyzer.ts)
function analyzeConstraints(guessHistory: GuessHistory[]): WordConstraints {
  const constraints: WordConstraints = {
    correctPositions: new Map(),
    presentLetters: new Set(),
    absentLetters: new Set(),
    positionExclusions: new Map(),
    letterCounts: new Map()
  };

  for (const history of guessHistory) {
    const duplicateLetterAnalysis = analyzeDuplicateLettersInGuess(history.guess);
    applyConstraintsFromAnalysis(constraints, duplicateLetterAnalysis, history.guess);
  }

  return constraints;
}

function analyzeDuplicateLettersInGuess(guess: Array<{letter: string, state: string}>): Map<string, any> {
  const letterAnalysis = new Map();

  for (let i = 0; i < guess.length; i++) {
    const tile = guess[i];
    if (!tile.letter) continue;

    const letter = tile.letter.toUpperCase();
    const state = tile.state as 'correct' | 'present' | 'absent';

    if (!letterAnalysis.has(letter)) {
      letterAnalysis.set(letter, {
        letter,
        positions: [],
        hasConflict: false
      });
    }

    letterAnalysis.get(letter)!.positions.push({
      index: i,
      state
    });
  }

  for (const [letter, analysis] of letterAnalysis) {
    const states = analysis.positions.map((p: any) => p.state);
    const hasCorrect = states.includes('correct');
    const hasPresent = states.includes('present');
    const hasAbsent = states.includes('absent');

    if (hasAbsent && (hasCorrect || hasPresent)) {
      const nonAbsentCount = states.filter((s: string) => s !== 'absent').length;
      analysis.exactCount = nonAbsentCount;
      analysis.hasConflict = true;
    } else if (hasCorrect || hasPresent) {
      const nonAbsentCount = states.filter((s: string) => s !== 'absent').length;
      analysis.exactCount = nonAbsentCount;
    }
  }

  return letterAnalysis;
}

function applyConstraintsFromAnalysis(
  constraints: WordConstraints, 
  analysis: Map<string, any>,
  guess: Array<{letter: string, state: string}>
): void {
  
  for (const [letter, letterAnalysis] of analysis) {
    for (const position of letterAnalysis.positions) {
      switch (position.state) {
        case 'correct':
          constraints.correctPositions.set(position.index, letter);
          constraints.presentLetters.add(letter);
          break;
          
        case 'present':
          constraints.presentLetters.add(letter);
          if (!constraints.positionExclusions.has(position.index)) {
            constraints.positionExclusions.set(position.index, new Set());
          }
          constraints.positionExclusions.get(position.index)!.add(letter);
          break;
          
        case 'absent':
          const hasNonAbsentInThisGuess = letterAnalysis.positions.some((p: any) => p.state !== 'absent');
          if (!hasNonAbsentInThisGuess) {
            constraints.absentLetters.add(letter);
          }
          break;
      }
    }

    if (letterAnalysis.exactCount !== undefined) {
      if (letterAnalysis.hasConflict) {
        constraints.letterCounts.set(letter, {
          min: letterAnalysis.exactCount,
          max: letterAnalysis.exactCount
        });
      } else {
        const existingConstraint = constraints.letterCounts.get(letter);
        const newMin = Math.max(letterAnalysis.exactCount, existingConstraint?.min || 0);
        constraints.letterCounts.set(letter, {
          min: newMin,
          max: existingConstraint?.max
        });
      }
    }
  }
}

// Validation logic (copied from src/utils/constraints/validator.ts)
function validateWordAgainstConstraints(word: string, constraints: WordConstraints): boolean {
  const wordUpper = word.toUpperCase();
  
  // Check correct positions
  for (const [position, letter] of constraints.correctPositions) {
    if (wordUpper[position] !== letter) {
      return false;
    }
  }

  // Check letter count constraints
  for (const [letter, countConstraint] of constraints.letterCounts) {
    const actualCount = wordUpper.split('').filter(l => l === letter).length;
    
    if (actualCount < countConstraint.min) {
      return false;
    }
    
    if (countConstraint.max !== undefined && actualCount > countConstraint.max) {
      return false;
    }
  }

  // Check absent letters
  for (const letter of constraints.absentLetters) {
    if (!constraints.letterCounts.has(letter) && wordUpper.includes(letter)) {
      return false;
    }
  }

  // Check present letters
  for (const presentLetter of constraints.presentLetters) {
    const letterCount = wordUpper.split('').filter(l => l === presentLetter).length;
    
    if (letterCount === 0) {
      return false;
    }
  }

  // Check position exclusions
  for (const [excludedPosition, excludedLetters] of constraints.positionExclusions) {
    const letterAtPosition = wordUpper[excludedPosition];
    
    for (const excludedLetter of excludedLetters) {
      if (letterAtPosition === excludedLetter) {
        return false;
      }
    }
  }

  return true;
}

// Scoring logic (copied from src/utils/constraints/scorer.ts)
function calculateWordScore(word: string, constraints: WordConstraints, baseFrequency: number): number {
  let probability = 0.1; // Base 10% probability
  
  const constraintFitness = calculateConstraintFitness(word, constraints);
  probability += constraintFitness * 0.6;
  
  const frequencyBonus = Math.log(baseFrequency + 1) / Math.log(10000);
  probability += Math.min(0.2, frequencyBonus);
  
  const qualityBonus = calculateWordQuality(word);
  probability += qualityBonus * 0.1;
  
  return Math.max(0.01, Math.min(0.99, probability));
}

function calculateConstraintFitness(word: string, constraints: WordConstraints): number {
  let fitness = 0;
  
  let correctMatches = 0;
  for (const [position, letter] of constraints.correctPositions) {
    if (word.toUpperCase()[position] === letter) {
      correctMatches++;
    }
  }
  if (constraints.correctPositions.size > 0) {
    fitness += (correctMatches / constraints.correctPositions.size) * 0.7;
  }
  
  let presentMatches = 0;
  for (const letter of constraints.presentLetters) {
    if (word.toUpperCase().includes(letter)) {
      let validPlacement = false;
      for (let i = 0; i < word.length; i++) {
        if (word.toUpperCase()[i] === letter) {
          const excludedAtPosition = constraints.positionExclusions.get(i);
          if (!excludedAtPosition || !excludedAtPosition.has(letter)) {
            validPlacement = true;
            break;
          }
        }
      }
      if (validPlacement) presentMatches++;
    }
  }
  if (constraints.presentLetters.size > 0) {
    fitness += (presentMatches / constraints.presentLetters.size) * 0.5;
  }
  
  fitness += 0.3;
  
  return Math.min(1.0, fitness);
}

function calculateWordQuality(word: string): number {
  let quality = 0.3;
  
  const vowels = 'AEIOU';
  const vowelCount = word.split('').filter(letter => vowels.includes(letter.toUpperCase())).length;
  if (vowelCount >= 1 && vowelCount <= 3) {
    quality += 0.3;
  }
  
  const uniqueLetters = new Set(word.toUpperCase().split('')).size;
  if (uniqueLetters >= 4) {
    quality += 0.2;
  }
  
  const commonLetters = 'ETAOINSHRDLU';
  let patternScore = 0;
  for (const letter of word.toUpperCase()) {
    const frequency = commonLetters.indexOf(letter);
    if (frequency !== -1) {
      patternScore += (commonLetters.length - frequency) / (commonLetters.length * word.length);
    }
  }
  quality += patternScore * 0.2;
  
  return Math.min(1.0, quality);
}

// Circuit breaker for web scraper failures
let webScraperFailureCount = 0;
const MAX_SCRAPER_FAILURES = 3;

export async function performMLAnalysis(guessData: any[], wordLength: number, excludedLetters: string[] = [], positionExclusions: Record<string, number[]> = {}): Promise<AnalysisResult> {
  console.log('Starting simplified ML analysis...');
  
  // Basic error boundary - catch ALL errors and return fallback
  try {
    // Step 1: Quick input validation
    if (!Array.isArray(guessData) || guessData.length === 0 || typeof wordLength !== 'number') {
      console.log('Invalid inputs, using fallback');
      return createFallbackResult('Invalid input parameters');
    }
    
    console.log(`Input validation passed: ${guessData.length} guesses, word length ${wordLength}`);
    
    // Step 2: Circuit breaker check - if web scraper has been failing, skip it
    if (webScraperFailureCount >= MAX_SCRAPER_FAILURES) {
      console.log('Web scraper circuit breaker active, using fallback corpus');
      return performAnalysisWithFallbackCorpus(guessData, wordLength, excludedLetters, positionExclusions);
    }
    
    // Step 3: Try web-scraper with aggressive timeout
    let scrapedData;
    try {
      console.log('Attempting web-scraper with 8-second timeout...');
      
      const scraperPromise = supabase.functions.invoke('web-scraper', {
        body: { maxWords: 50000 } // Reduced from 200K to 50K for faster response
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 8000) // Reduced from 15s to 8s
      );
      
      const result = await Promise.race([scraperPromise, timeoutPromise]) as any;
      
      if (result.error || !result.data?.words || !Array.isArray(result.data.words)) {
        throw new Error('Invalid scraper response');
      }
      
      scrapedData = result.data;
      webScraperFailureCount = 0; // Reset failure count on success
      console.log(`Web scraper success: ${scrapedData.words.length} words`);
      
    } catch (error) {
      console.error('Web scraper failed, incrementing failure count:', error.message);
      webScraperFailureCount++;
      
      // Use fallback corpus instead of failing
      return performAnalysisWithFallbackCorpus(guessData, wordLength, excludedLetters, positionExclusions);
    }
    
    // Step 4: Perform analysis with scraped words
    return performAnalysisWithWordList(scrapedData.words, guessData, wordLength, excludedLetters, positionExclusions);
    
  } catch (error) {
    console.error('Analysis failed, using fallback:', error.message);
    return createFallbackResult(error.message || 'Analysis failed');
  }
}

// Perform analysis with fallback word corpus when web scraper fails
async function performAnalysisWithFallbackCorpus(guessData: any[], wordLength: number, excludedLetters: string[] = [], positionExclusions: Record<string, number[]> = {}): Promise<AnalysisResult> {
  console.log('Using fallback word corpus for analysis');
  
  // Comprehensive fallback word lists by length
  const fallbackCorpus = {
    3: ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'HAD', 'DAY', 'GET', 'USE', 'MAN', 'NEW', 'NOW', 'OLD', 'SEE', 'HIM', 'TWO', 'HOW', 'ITS', 'WHO', 'OIL', 'SIT', 'SET'],
    4: ['THAT', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM', 'THEY', 'KNOW', 'WANT', 'BEEN', 'GOOD', 'MUCH', 'SOME', 'TIME', 'VERY', 'WHEN', 'COME', 'HERE', 'JUST', 'LIKE', 'LONG', 'MAKE', 'MANY', 'OVER', 'SUCH', 'TAKE', 'THAN', 'THEM', 'WELL', 'WORK'],
    5: ['WHICH', 'THEIR', 'WOULD', 'THERE', 'COULD', 'OTHER', 'AFTER', 'FIRST', 'NEVER', 'THESE', 'THINK', 'WHERE', 'BEING', 'EVERY', 'GREAT', 'MIGHT', 'SHALL', 'STILL', 'THOSE', 'UNDER', 'WHILE', 'ABOVE', 'AGAIN', 'BEFORE', 'RIGHT', 'WORLD', 'PLACE', 'HOUSE', 'WATER', 'SOUND'],
    6: ['SHOULD', 'THROUGH', 'BEFORE', 'LITTLE', 'AROUND', 'ANOTHER', 'CHANGE', 'FOLLOW', 'LETTER', 'MOTHER', 'ANSWER', 'SCHOOL', 'FATHER', 'DIFFER', 'TURN', 'POINT', 'SMALL', 'LARGE', 'SPELL', 'PICTURE'],
    7: ['BECAUSE', 'BETWEEN', 'ANOTHER', 'THROUGH', 'THOUGHT', 'EXAMPLE', 'SPECIAL', 'MACHINE', 'PICTURE', 'SCIENCE', 'COUNTRY', 'SENTENCE', 'IMPORTANT', 'AMERICA', 'CHILDREN', 'QUESTION', 'GENERAL', 'NATURAL', 'STUDENT', 'CERTAIN']
  };
  
  const wordList = fallbackCorpus[wordLength as keyof typeof fallbackCorpus] || fallbackCorpus[5];
  console.log(`Using fallback corpus with ${wordList.length} words for length ${wordLength}`);
  
  return performAnalysisWithWordList(wordList, guessData, wordLength, excludedLetters, positionExclusions);
}

// Core analysis logic that works with any word list
function performAnalysisWithWordList(words: string[], guessData: any[], wordLength: number, excludedLetters: string[] = [], positionExclusions: Record<string, number[]> = {}): AnalysisResult {
  try {
    console.log('Analyzing constraints from guess data...');
    const guessHistory = [{ guess: guessData, timestamp: Date.now() }];
    const constraints = analyzeConstraints(guessHistory);
    
    // Convert excludedLetters and positionExclusions to constraints format
    for (const letter of excludedLetters) {
      constraints.absentLetters.add(letter.toUpperCase());
    }
    
    for (const [letter, positions] of Object.entries(positionExclusions)) {
      for (const position of positions) {
        if (!constraints.positionExclusions.has(position)) {
          constraints.positionExclusions.set(position, new Set());
        }
        constraints.positionExclusions.get(position)!.add(letter.toUpperCase());
      }
    }
    
    console.log('Filtering and validating words...');
    const candidateWords = words
      .filter(word => typeof word === 'string' && word.length === wordLength)
      .filter(word => {
        try {
          return validateWordAgainstConstraints(word, constraints);
        } catch (error) {
          return false;
        }
      });
    
    console.log(`${candidateWords.length} words passed validation`);
    
    if (candidateWords.length === 0) {
      return createFallbackResult('No words match the constraints');
    }
    
    // Score and sort words
    const scoredWords = candidateWords.map((word: string) => {
      try {
        const baseFrequency = words.indexOf(word) + 1;
        const probability = calculateWordScore(word, constraints, baseFrequency);
        return { word: word.toUpperCase(), probability };
      } catch (error) {
        return { word: word.toUpperCase(), probability: 0.01 };
      }
    }).sort((a, b) => b.probability - a.probability);
    
    const solutions = scoredWords.slice(0, 20); // Limit to top 20 results
    
    return {
      solutions,
      status: solutions.length > 0 ? 'complete' : 'partial',
      confidence: solutions.length > 0 ? 0.85 : 0.3
    };
    
  } catch (error) {
    console.error('Core analysis failed:', error);
    return createFallbackResult('Analysis logic failed');
  }
    
  } catch (error) {
    console.error('ML Analysis failed with detailed error:', error);
    
    // Provide specific error information for debugging
    const errorMessage = error.message || 'Unknown error';
    console.error('Error details:', {
      message: errorMessage,
      stack: error.stack,
      type: error.constructor.name
    });
    
    // Return fallback result with error information
    return createFallbackResult(errorMessage);
  }
}

// Fallback analysis function for when primary analysis fails
function createFallbackResult(errorReason: string): AnalysisResult {
  console.log('Creating fallback result due to:', errorReason);
  
  // Provide a minimal but functional fallback
  const commonWords = [
    'AROSE', 'ADIEU', 'AUDIO', 'ORATE', 'RATIO', 'TEARS', 'RATES', 'OATER',
    'REALS', 'RALES', 'LATER', 'TALES', 'LARES', 'LASER', 'EARLS', 'LEARS'
  ];
  
  const fallbackSolutions = commonWords.map(word => ({
    word,
    probability: 0.1
  }));
  
  return {
    solutions: fallbackSolutions,
    status: 'partial',
    confidence: 0.3,
    error: errorReason,
    fallback: true
  };
}
