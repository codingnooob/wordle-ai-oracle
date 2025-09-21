import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Types (copied from the website's constraint types)
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

// Enhanced security headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Rate limiting
const rateLimiter = new Map<string, number[]>();
const RATE_LIMIT_MAX = 20; // Max 20 requests per minute
const RATE_LIMIT_WINDOW = 60000;

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimiter.has(clientId)) {
    rateLimiter.set(clientId, []);
  }
  
  const requests = rateLimiter.get(clientId)!;
  while (requests.length > 0 && requests[0] < windowStart) {
    requests.shift();
  }
  
  if (requests.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  requests.push(now);
  return true;
}

function sanitizeInput(input: any): { isValid: boolean; data?: any; error?: string } {
  if (!input || typeof input !== 'object') {
    return { isValid: false, error: 'Invalid request format' };
  }
  
  const { guessData, wordLength, excludedLetters, positionExclusions } = input;
  
  // Validate wordLength
  if (typeof wordLength !== 'number' || wordLength < 3 || wordLength > 15) {
    return { isValid: false, error: 'Invalid word length' };
  }
  
  // Validate guessData
  if (!Array.isArray(guessData) || guessData.length !== wordLength) {
    return { isValid: false, error: 'Invalid guess data' };
  }
  
  // Sanitize guess data
  const sanitizedGuessData = guessData.map((tile: any) => {
    if (!tile || typeof tile !== 'object') {
      return { letter: '', state: 'unknown' };
    }
    
    const letter = typeof tile.letter === 'string' ? 
      tile.letter.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 1) : '';
    
    const validStates = ['correct', 'present', 'absent', 'unknown'];
    const state = validStates.includes(tile.state) ? tile.state : 'unknown';
    
    return { letter, state };
  });
  
  // Sanitize excluded letters
  const sanitizedExcludedLetters: string[] = [];
  if (Array.isArray(excludedLetters)) {
    excludedLetters.forEach((letter: any) => {
      if (typeof letter === 'string') {
        const cleanLetter = letter.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 1);
        if (cleanLetter && !sanitizedExcludedLetters.includes(cleanLetter)) {
          sanitizedExcludedLetters.push(cleanLetter);
        }
      }
    });
  }
  
  // Sanitize position exclusions
  const sanitizedPositionExclusions: Record<string, number[]> = {};
  if (input.positionExclusions && typeof input.positionExclusions === 'object') {
    Object.entries(input.positionExclusions).forEach(([letter, positions]) => {
      if (typeof letter === 'string' && Array.isArray(positions)) {
        const cleanLetter = letter.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 1);
        if (cleanLetter) {
          sanitizedPositionExclusions[cleanLetter] = positions
            .filter(pos => typeof pos === 'number' && pos >= 0 && pos < wordLength)
            .slice(0, wordLength);
        }
      }
    });
  }

  return { 
    isValid: true, 
    data: { 
      guessData: sanitizedGuessData, 
      wordLength, 
      excludedLetters: sanitizedExcludedLetters,
      positionExclusions: sanitizedPositionExclusions 
    } 
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const clientId = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(clientId)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Secure input validation
    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validation = sanitizeInput(requestBody);
    if (!validation.isValid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { guessData, wordLength, excludedLetters = [], positionExclusions = {} } = validation.data;

    secureLog('Processing sophisticated ML analysis request:', {
      wordLength,
      guessDataLength: guessData.length,
      excludedLettersCount: excludedLetters.length,
      positionExclusionsCount: Object.keys(positionExclusions).length
    });

    // Use the same sophisticated constraint analysis as the website
    const guessHistory = [{ guess: guessData, timestamp: Date.now() }];
    const constraints = analyzeConstraints(guessHistory);
    
    // Merge manual position exclusions with constraint-derived exclusions
    if (positionExclusions) {
      for (const [letter, positions] of Object.entries(positionExclusions)) {
        if (Array.isArray(positions)) {
          for (const position of positions) {
            if (!constraints.positionExclusions.has(position)) {
              constraints.positionExclusions.set(position, new Set());
            }
            constraints.positionExclusions.get(position)!.add(letter.toUpperCase());
          }
        }
      }
    }

    // Add excluded letters to absent letters set
    for (const letter of excludedLetters) {
      if (letter) {
        constraints.absentLetters.add(letter.toUpperCase());
      }
    }

    secureLog('Generated constraints:', {
      correctPositions: Array.from(constraints.correctPositions.entries()),
      presentLetters: Array.from(constraints.presentLetters),
      absentLetters: Array.from(constraints.absentLetters),
      positionExclusions: Array.from(constraints.positionExclusions.entries()).map(([pos, letters]) => [pos, Array.from(letters)])
    });

    // Find potential matches using the same logic as the website
    const candidateWords = await findPotentialMatches(constraints, wordLength);
    
    secureLog(`Found ${candidateWords.length} candidate words`);

    if (candidateWords.length === 0) {
      secureLog('No candidate words found matching constraints');
      return new Response(JSON.stringify([]), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Filter words that satisfy all constraints and calculate scores
    const validWords = candidateWords.filter(wordData => {
      const word = wordData.word;
      return validateWordAgainstConstraints(word, constraints) && 
             !constraints.absentLetters.has(word);
    });

    secureLog(`${validWords.length} words passed constraint validation`);

    // Calculate sophisticated ML scores for each valid word
    const scoredSolutions = validWords.map(wordData => {
      const score = calculateWordScore(wordData.word, constraints, wordData.frequency);
      return {
        word: wordData.word,
        probability: Math.round(score * 100) // Convert to percentage
      };
    });

    // Sort by probability and take top results
    const solutions = scoredSolutions
      .sort((a, b) => b.probability - a.probability)
      .slice(0, 10); // Return top 10 results

    secureLog('ML analysis complete:', {
      solutionsFound: solutions.length,
      topSolutions: solutions.slice(0, 3).map(s => `${s.word}: ${s.probability}%`)
    });

    return new Response(JSON.stringify(solutions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    secureLog('Error in analyze-wordle function:', error);
    
    return new Response(JSON.stringify({ error: 'Server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Sophisticated constraint analysis functions (copied from website)
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

interface LetterAnalysis {
  letter: string;
  positions: Array<{
    index: number;
    state: 'correct' | 'present' | 'absent';
  }>;
  exactCount?: number;
  hasConflict: boolean;
}

function analyzeDuplicateLettersInGuess(guess: Array<{letter: string, state: string}>): Map<string, LetterAnalysis> {
  const letterAnalysis = new Map<string, LetterAnalysis>();

  // Group tiles by letter
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

  // Determine exact counts for letters with mixed states
  for (const [letter, analysis] of letterAnalysis) {
    const states = analysis.positions.map(p => p.state);
    const hasCorrect = states.includes('correct');
    const hasPresent = states.includes('present');
    const hasAbsent = states.includes('absent');

    if (hasAbsent && (hasCorrect || hasPresent)) {
      const nonAbsentCount = states.filter(s => s !== 'absent').length;
      analysis.exactCount = nonAbsentCount;
      analysis.hasConflict = true;
    } else if (hasCorrect || hasPresent) {
      const nonAbsentCount = states.filter(s => s !== 'absent').length;
      analysis.exactCount = nonAbsentCount;
    }
  }

  return letterAnalysis;
}

function applyConstraintsFromAnalysis(
  constraints: WordConstraints, 
  analysis: Map<string, LetterAnalysis>,
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
          const hasNonAbsentInThisGuess = letterAnalysis.positions.some(p => p.state !== 'absent');
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

async function findPotentialMatches(constraints: WordConstraints, wordLength: number): Promise<Array<{ word: string; frequency: number }>> {
  // Try to get words from web scraper API first
  try {
    const { data, error } = await supabase.functions.invoke('web-scraper');
    if (!error && data && Array.isArray(data)) {
      const scrapedWords = data
        .filter((item: any) => typeof item === 'string' && item.length === wordLength)
        .map((word: string) => ({ word: word.toUpperCase(), frequency: 50 }));
      
      if (scrapedWords.length > 0) {
        secureLog(`Using ${scrapedWords.length} words from web scraper`);
        return scrapedWords.slice(0, 1000); // Limit for performance
      }
    }
  } catch (error) {
    secureLog('Web scraper failed, using fallback word list:', error);
  }

  // Fallback to common words based on length
  const fallbackWords = getFallbackWords(wordLength);
  return fallbackWords;
}

function getFallbackWords(wordLength: number): Array<{ word: string; frequency: number }> {
  const wordLists: { [key: number]: Array<{ word: string; frequency: number }> } = {
    3: [
      { word: 'THE', frequency: 100 }, { word: 'AND', frequency: 95 }, { word: 'FOR', frequency: 90 },
      { word: 'ARE', frequency: 85 }, { word: 'BUT', frequency: 80 }, { word: 'NOT', frequency: 78 }
    ],
    4: [
      { word: 'THAT', frequency: 100 }, { word: 'WITH', frequency: 95 }, { word: 'HAVE', frequency: 90 },
      { word: 'THIS', frequency: 88 }, { word: 'WILL', frequency: 85 }, { word: 'YOUR', frequency: 83 }
    ],
    5: [
      { word: 'ARISE', frequency: 100 }, { word: 'SLATE', frequency: 95 }, { word: 'CRANE', frequency: 90 },
      { word: 'HOUSE', frequency: 88 }, { word: 'MOUSE', frequency: 85 }, { word: 'PLACE', frequency: 83 },
      { word: 'SPACE', frequency: 80 }, { word: 'GRACE', frequency: 78 }, { word: 'TRACE', frequency: 75 },
      { word: 'PRICE', frequency: 73 }, { word: 'PRIME', frequency: 70 }, { word: 'CLEAR', frequency: 68 },
      { word: 'LEARN', frequency: 65 }, { word: 'HEART', frequency: 63 }, { word: 'SMART', frequency: 60 }
    ],
    6: [
      { word: 'SHOULD', frequency: 100 }, { word: 'AROUND', frequency: 95 }, { word: 'LITTLE', frequency: 90 },
      { word: 'PEOPLE', frequency: 88 }, { word: 'BEFORE', frequency: 85 }, { word: 'MOTHER', frequency: 83 }
    ],
    7: [
      { word: 'THROUGH', frequency: 100 }, { word: 'BETWEEN', frequency: 95 }, { word: 'ANOTHER', frequency: 90 },
      { word: 'WITHOUT', frequency: 88 }, { word: 'BECAUSE', frequency: 85 }, { word: 'AGAINST', frequency: 83 }
    ]
  };

  return wordLists[wordLength] || [];
}

function validateWordAgainstConstraints(word: string, constraints: WordConstraints): boolean {
  const wordUpper = word.toUpperCase();
  
  // Check correct positions
  for (const [position, letter] of constraints.correctPositions) {
    if (wordUpper[position] !== letter) return false;
  }
  
  // Check present letters
  for (const letter of constraints.presentLetters) {
    if (!wordUpper.includes(letter)) return false;
  }
  
  // Check position exclusions
  for (const [position, excludedLetters] of constraints.positionExclusions) {
    const letterAtPosition = wordUpper[position];
    if (excludedLetters.has(letterAtPosition)) return false;
  }
  
  // Check absent letters
  for (const letter of constraints.absentLetters) {
    if (wordUpper.includes(letter)) return false;
  }
  
  // Check letter counts
  for (const [letter, countConstraint] of constraints.letterCounts) {
    const letterCount = (wordUpper.match(new RegExp(letter, 'g')) || []).length;
    if (letterCount < countConstraint.min) return false;
    if (countConstraint.max !== undefined && letterCount > countConstraint.max) return false;
  }
  
  return true;
}

function calculateWordScore(word: string, constraints: WordConstraints, baseFrequency: number): number {
  let probability = 0.1; // Base 10% probability
  
  // Constraint fitness is the primary factor
  const constraintFitness = calculateConstraintFitness(word, constraints);
  probability += constraintFitness * 0.6; // Up to 60% boost
  
  // Frequency contribution
  const frequencyBonus = Math.log(baseFrequency + 1) / Math.log(10000);
  probability += Math.min(0.2, frequencyBonus); // Up to 20% boost
  
  // Word quality factors
  const qualityBonus = calculateWordQuality(word);
  probability += qualityBonus * 0.1; // Up to 10% boost
  
  return Math.max(0.01, Math.min(0.99, probability));
}

function calculateConstraintFitness(word: string, constraints: WordConstraints): number {
  let fitness = 0;
  
  // Perfect position matches
  let correctMatches = 0;
  for (const [position, letter] of constraints.correctPositions) {
    if (word.toUpperCase()[position] === letter) {
      correctMatches++;
    }
  }
  if (constraints.correctPositions.size > 0) {
    fitness += (correctMatches / constraints.correctPositions.size) * 0.7;
  }
  
  // Present letters in valid positions
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
  
  // Bonus for not containing absent letters
  fitness += 0.3;
  
  return Math.min(1.0, fitness);
}

function calculateWordQuality(word: string): number {
  let quality = 0.3; // Base quality
  
  // Vowel distribution bonus
  const vowels = 'AEIOU';
  const vowelCount = word.split('').filter(letter => vowels.includes(letter.toUpperCase())).length;
  if (vowelCount >= 1 && vowelCount <= 3) {
    quality += 0.3;
  }
  
  // Letter diversity bonus
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
  quality += patternScore * 0.2;
  
  return Math.min(1.0, quality);
}

function secureLog(message: string, data?: any): void {
  const isDev = Deno.env.get('DENO_DEPLOYMENT_ID') === undefined;
  if (isDev) {
    console.log(message, data || '');
  }
}