
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

export async function performMLAnalysis(guessData: any[], wordLength: number, excludedLetters: string[] = [], positionExclusions: Record<string, number[]> = {}): Promise<AnalysisResult> {
  console.log('Starting ML analysis with enhanced error tracking...');
  
  try {
    // Step 1: Validate inputs first
    console.log('Validating analysis inputs...');
    if (!Array.isArray(guessData) || guessData.length === 0) {
      throw new Error('Invalid guess data: must be non-empty array');
    }
    
    if (typeof wordLength !== 'number' || wordLength < 3 || wordLength > 15) {
      throw new Error(`Invalid word length: ${wordLength} (must be 3-15)`);
    }
    
    console.log(`Input validation passed: ${guessData.length} guesses, word length ${wordLength}`);
    
    // Step 2: Get words from web-scraper with timeout and detailed error handling
    console.log('Calling web-scraper function with timeout...');
    
    let scrapedData, scraperError;
    try {
      const scraperPromise = supabase.functions.invoke('web-scraper', {
        body: { maxWords: 200000 }
      });
      
      // Add 15-second timeout for web scraper
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Web scraper timeout after 15 seconds')), 15000)
      );
      
      const result = await Promise.race([scraperPromise, timeoutPromise]) as any;
      scrapedData = result.data;
      scraperError = result.error;
      
      console.log('Web scraper completed successfully');
    } catch (error) {
      console.error('Web scraper failed:', error);
      throw new Error(`Web scraper error: ${error.message}`);
    }
    
    if (scraperError) {
      console.error('Web scraper returned error:', scraperError);
      throw new Error(`Web scraper service error: ${scraperError.message || scraperError}`);
    }
    
    if (!scrapedData) {
      console.error('Web scraper returned null/undefined data');
      throw new Error('Web scraper returned no data');
    }
    
    if (!scrapedData.words) {
      console.error('Web scraper response missing words array:', Object.keys(scrapedData));
      throw new Error('Web scraper response missing words array');
    }
    
    if (!Array.isArray(scrapedData.words)) {
      console.error('Web scraper words is not an array:', typeof scrapedData.words);
      throw new Error('Web scraper words is not an array');
    }
    
    if (scrapedData.words.length === 0) {
      console.error('Web scraper returned empty words array');
      throw new Error('Web scraper returned empty words array');
    }
    
    console.log(`Got ${scrapedData.words.length} words from web-scraper`);
    
    // Step 3: Analyze constraints from guess data
    console.log('Analyzing constraints from guess data...');
    try {
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
      
      console.log('Analyzed constraints:', {
        correctPositions: Array.from(constraints.correctPositions.entries()),
        presentLetters: Array.from(constraints.presentLetters),
        absentLetters: Array.from(constraints.absentLetters),
        positionExclusions: Array.from(constraints.positionExclusions.entries()).map(([pos, letters]) => [pos, Array.from(letters)])
      });
      
      console.log('Constraint analysis completed successfully');
      
      // Step 4: Filter words by length and validate against constraints
      console.log('Filtering words by length and constraints...');
      const lengthFilteredWords = scrapedData.words.filter((word: string) => {
        if (typeof word !== 'string') return false;
        return word.length === wordLength;
      });
      
      console.log(`${lengthFilteredWords.length} words match length ${wordLength} (from ${scrapedData.words.length} total)`);
      
      if (lengthFilteredWords.length === 0) {
        console.warn('No words found matching the specified length');
        return createFallbackResult(`No ${wordLength}-letter words found in corpus`);
      }
      
      console.log('Validating words against constraints...');
      const candidateWords = lengthFilteredWords.filter((word: string) => {
        try {
          return validateWordAgainstConstraints(word, constraints);
        } catch (error) {
          console.error(`Error validating word "${word}":`, error);
          return false;
        }
      });
      
      console.log(`${candidateWords.length} words passed validation`);
      
      if (candidateWords.length === 0) {
        console.warn('No words found matching the constraints');
        return createFallbackResult('No words match the given constraints');
      }
      
      // Step 5: Score and sort words
      console.log('Scoring and ranking words...');
      const scoredWords = candidateWords.map((word: string, index: number) => {
        try {
          const baseFrequency = scrapedData.words.indexOf(word) + 1;
          const probability = calculateWordScore(word, constraints, baseFrequency);
          return {
            word: word.toUpperCase(),
            probability
          };
        } catch (error) {
          console.error(`Error scoring word "${word}":`, error);
          return {
            word: word.toUpperCase(),
            probability: 0.01
          };
        }
      }).sort((a, b) => b.probability - a.probability);
      
      // Step 6: Filter results with reasonable probability threshold
      const solutions = scoredWords.filter(s => s.probability > 0.05);
      
      console.log(`Final results: ${solutions.length} solutions with probability > 5%`);
      
      return {
        solutions,
        status: solutions.length > 0 ? 'complete' : 'partial',
        confidence: solutions.length > 0 ? 0.95 : 0.5
      };
      
    } catch (constraintError) {
      console.error('Error during constraint analysis or word processing:', constraintError);
      throw new Error(`Constraint analysis failed: ${constraintError.message}`);
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
