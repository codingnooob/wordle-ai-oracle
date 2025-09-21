
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
  console.log('Starting ML analysis with same backend as main program...');
  
  try {
    // Step 1: Get words from web-scraper (same as main program)
    const { data: scrapedData, error: scraperError } = await supabase.functions.invoke('web-scraper', {
      body: { maxWords: 200000 }
    });
    
    if (scraperError) throw scraperError;
    
    if (!scrapedData || !scrapedData.words || !Array.isArray(scrapedData.words)) {
      throw new Error('Invalid response from web scraper');
    }
    
    console.log(`Got ${scrapedData.words.length} words from web-scraper`);
    
    // Step 2: Analyze constraints from guess data
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
      positionExclusions: Array.from(constraints.positionExclusions.entries())
    });
    
    // Step 3: Filter words by length and validate against constraints
    const candidateWords = scrapedData.words
      .filter((word: string) => word.length === wordLength)
      .filter((word: string) => validateWordAgainstConstraints(word, constraints));
    
    console.log(`${candidateWords.length} words passed validation`);
    
    // Step 4: Score and sort words
    const scoredWords = candidateWords.map((word: string) => {
      const baseFrequency = scrapedData.words.indexOf(word) + 1; // Simple frequency based on position in corpus
      const probability = calculateWordScore(word, constraints, baseFrequency);
      return {
        word: word.toUpperCase(),
        probability
      };
    }).sort((a, b) => b.probability - a.probability);
    
    // Step 5: Filter results with reasonable probability threshold (fixed from > 1 to > 0.05)
    const solutions = scoredWords.filter(s => s.probability > 0.05);
    
    console.log(`Final results: ${solutions.length} solutions with probability > 5%`);
    
    return {
      solutions,
      status: solutions.length > 0 ? 'complete' : 'partial',
      confidence: solutions.length > 0 ? 0.95 : 0.5
    };
    
  } catch (error) {
    console.error('ML Analysis failed:', error);
    return {
      solutions: [],
      status: 'failed',
      confidence: 0.0
    };
  }
}
