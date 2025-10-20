import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types from the web app
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

interface MLWordleSolution {
  word: string;
  probability: number;
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

// Enhanced constraint analysis from the web app
function analyzeConstraints(guessHistory: GuessHistory[]): WordConstraints {
  const constraints: WordConstraints = {
    correctPositions: new Map(),
    presentLetters: new Set(),
    absentLetters: new Set(),
    positionExclusions: new Map(),
    letterCounts: new Map()
  };

  console.log('=== Enhanced Duplicate Letter Analysis ===');

  for (const history of guessHistory) {
    console.log(`Analyzing guess: ${history.guess.map(t => t.letter).join('')}`);
    
    const duplicateLetterAnalysis = analyzeDuplicateLettersInGuess(history.guess);
    console.log('Duplicate letter analysis:', duplicateLetterAnalysis);

    applyConstraintsFromAnalysis(constraints, duplicateLetterAnalysis, history.guess);
  }

  console.log('Final enhanced constraints:', {
    correctPositions: Array.from(constraints.correctPositions.entries()),
    presentLetters: Array.from(constraints.presentLetters),
    absentLetters: Array.from(constraints.absentLetters),
    positionExclusions: Array.from(constraints.positionExclusions.entries()).map(([pos, letters]) => [pos, Array.from(letters)]),
    letterCounts: Array.from(constraints.letterCounts.entries())
  });

  return constraints;
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

    console.log(`Letter ${letter}: states = [${states.join(', ')}]`);

    if (hasAbsent && (hasCorrect || hasPresent)) {
      const nonAbsentCount = states.filter(s => s !== 'absent').length;
      analysis.exactCount = nonAbsentCount;
      analysis.hasConflict = true;
      console.log(`  Exact count determined: ${letter} appears exactly ${nonAbsentCount} times`);
    } else if (hasCorrect || hasPresent) {
      const nonAbsentCount = states.filter(s => s !== 'absent').length;
      analysis.exactCount = nonAbsentCount;
      console.log(`  Minimum count: ${letter} appears at least ${nonAbsentCount} times`);
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

    // Set letter count constraints
    if (letterAnalysis.exactCount !== undefined) {
      if (letterAnalysis.hasConflict) {
        constraints.letterCounts.set(letter, {
          min: letterAnalysis.exactCount,
          max: letterAnalysis.exactCount
        });
        console.log(`Set exact count constraint for ${letter}: exactly ${letterAnalysis.exactCount}`);
      } else {
        const existingConstraint = constraints.letterCounts.get(letter);
        const newMin = Math.max(letterAnalysis.exactCount, existingConstraint?.min || 0);
        constraints.letterCounts.set(letter, {
          min: newMin,
          max: existingConstraint?.max
        });
        console.log(`Set minimum count constraint for ${letter}: at least ${newMin}`);
      }
    }
  }
}

function validateWordAgainstConstraints(word: string, constraints: WordConstraints): boolean {
  const wordUpper = word.toUpperCase();
  
  // Check correct positions
  for (const [position, letter] of constraints.correctPositions) {
    if (wordUpper[position] !== letter) {
      return false;
    }
  }

  // Enhanced letter count validation
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

  // Enhanced present letter validation
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

function calculateWordScore(word: string, constraints: WordConstraints, baseFrequency: number): number {
  let probability = 0.1; // Base 10% probability for any valid word
  
  // Constraint fitness is the primary factor
  const constraintFitness = calculateConstraintFitness(word, constraints);
  probability += constraintFitness * 0.6; // Up to 60% boost for perfect constraint satisfaction
  
  // Frequency contribution (logarithmic scaling)
  const frequencyBonus = Math.log(baseFrequency + 1) / Math.log(10000); // Scale to 0-1 range
  probability += Math.min(0.2, frequencyBonus); // Up to 20% boost for frequency
  
  // Word quality factors
  const qualityBonus = calculateWordQuality(word);
  probability += qualityBonus * 0.1; // Up to 10% boost for word quality
  
  // Return probability as score (will be converted to percentage for display)
  return Math.max(0.01, Math.min(0.99, probability));
}

function calculateConstraintFitness(word: string, constraints: WordConstraints): number {
  let fitness = 0;
  
  // Perfect position matches are highly valuable
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
      // Check if it's placed in a valid (non-excluded) position
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
  
  // Bonus for not containing absent letters (already filtered, but validates fitness)
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

async function getWordCorpus(wordLength: number): Promise<string[]> {
  try {
    console.log('Attempting to get word corpus from web-scraper...');
    
    const response = await supabase.functions.invoke('web-scraper', {
      body: { wordLength }
    });

    if (response.data && response.data.words && Array.isArray(response.data.words)) {
      console.log(`✅ Got ${response.data.words.length} words from web-scraper`);
      return response.data.words.filter((word: string) => 
        word && typeof word === 'string' && word.length === wordLength
      );
    }
  } catch (error) {
    console.log('Web-scraper failed:', error.message);
  }

  // Fallback to common words
  console.log('Using fallback word corpus');
  return getCommonWords(wordLength);
}

function getCommonWords(wordLength: number): string[] {
  const commonWordSets: { [key: number]: string[] } = {
    3: ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAR', 'FAR', 'OFF', 'ITS', 'DAY'],
    4: ['THAT', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM', 'THEY', 'KNOW', 'WANT', 'BEEN', 'GOOD', 'MUCH', 'SOME', 'TIME'],
    5: ['ABOUT', 'WOULD', 'THERE', 'THEIR', 'COULD', 'OTHER', 'AFTER', 'FIRST', 'NEVER', 'THESE', 'LOOSE', 'GOOSE', 'BLOOD', 'FLOOR', 'ALLEY', 'HELLO', 'BALLS', 'HALLS', 'CALLS', 'ARISE', 'ADIEU', 'AUDIO', 'HOUSE', 'MOUSE', 'ROUTE', 'SLATE', 'CRANE', 'TRACE', 'SPACE', 'PLACE'],
    6: ['SHOULD', 'AROUND', 'LITTLE', 'PEOPLE', 'BEFORE', 'MOTHER', 'THOUGH', 'SCHOOL', 'ALWAYS', 'REALLY', 'FAMILY', 'FRIEND', 'CHANGE', 'MOMENT', 'FOLLOW'],
    7: ['THROUGH', 'BETWEEN', 'ANOTHER', 'WITHOUT', 'BECAUSE', 'AGAINST', 'NOTHING', 'SOMEONE', 'TOWARDS', 'SEVERAL', 'THOUGHT', 'PRESENT', 'COMPANY', 'MACHINE'],
    8: ['BUSINESS', 'TOGETHER', 'CHILDREN', 'QUESTION', 'COMPLETE', 'YOURSELF', 'REMEMBER', 'ALTHOUGH', 'CONTINUE', 'POSSIBLE', 'INTEREST', 'STUDENTS', 'PERSONAL']
  };

  return commonWordSets[wordLength] || [];
}

// Serialize Maps and Sets for JSON
function serializeConstraints(constraints: WordConstraints) {
  return {
    correctPositions: Array.from(constraints.correctPositions.entries()),
    presentLetters: Array.from(constraints.presentLetters),
    absentLetters: Array.from(constraints.absentLetters),
    positionExclusions: Array.from(constraints.positionExclusions.entries()).map(([pos, letters]) => [pos, Array.from(letters)]),
    letterCounts: Array.from(constraints.letterCounts.entries())
  };
}

function deserializeConstraints(serializedConstraints: any): WordConstraints {
  const constraints: WordConstraints = {
    correctPositions: new Map(serializedConstraints.correctPositions || []),
    presentLetters: new Set(serializedConstraints.presentLetters || []),
    absentLetters: new Set(serializedConstraints.absentLetters || []),
    positionExclusions: new Map(),
    letterCounts: new Map(serializedConstraints.letterCounts || [])
  };

  // Reconstruct position exclusions
  for (const [pos, letters] of (serializedConstraints.positionExclusions || [])) {
    constraints.positionExclusions.set(pos, new Set(letters));
  }

  return constraints;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { guessData, wordLength, excludedLetters = [], positionExclusions = {}, maxResults = 15, minProbability = 1.0 } = await req.json();

    console.log('=== Unified Wordle Analysis ===');
    console.log('Input guess data:', guessData);
    console.log('Word length:', wordLength);
    console.log('Excluded letters:', excludedLetters);
    console.log('Position exclusions:', positionExclusions);
    console.log('Max results:', maxResults);
    console.log('Min probability:', minProbability);

    // Validate inputs
    if (!Array.isArray(guessData) || !wordLength || wordLength < 3 || wordLength > 8) {
      return new Response(
        JSON.stringify({ error: 'Invalid input parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze constraints from guess data
    const guessHistory = [{ guess: guessData, timestamp: Date.now() }];
    const constraints = analyzeConstraints(guessHistory);
    
    // Merge manual position exclusions with constraint-derived exclusions
    for (const [letter, positions] of Object.entries(positionExclusions)) {
      for (const position of positions as number[]) {
        if (!constraints.positionExclusions.has(position)) {
          constraints.positionExclusions.set(position, new Set());
        }
        constraints.positionExclusions.get(position)!.add(letter);
      }
    }
    
    console.log('Analyzed constraints:', serializeConstraints(constraints));

    // Get word corpus
    const wordCorpus = await getWordCorpus(wordLength);
    console.log(`Using corpus of ${wordCorpus.length} words`);

    // Filter words that match constraints
    const excludedSet = new Set(excludedLetters.map((l: string) => l.toUpperCase()));
    
    let validWords = wordCorpus.filter(word => {
      const wordUpper = word.toUpperCase();
      
      // Check excluded letters
      for (const excluded of excludedSet) {
        if (wordUpper.includes(excluded)) {
          return false;
        }
      }
      
      // Validate against constraints
      return validateWordAgainstConstraints(word, constraints);
    });

    console.log(`${validWords.length} words passed all validations`);

    if (validWords.length === 0) {
      console.log('No words match constraints - returning empty results');
      return new Response(
        JSON.stringify({
          solutions: [],
          analysisType: 'no_matches',
          message: 'No words found that satisfy all constraints. Try adjusting your guesses or constraints.',
          constraints: serializeConstraints(constraints),
          corpusSize: wordCorpus.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Score the valid words
    const scoredWords = validWords.map(word => {
      const baseFrequency = Math.random() * 1000; // Simulate frequency data
      const probability = calculateWordScore(word, constraints, baseFrequency);
      
      return {
        word: word,
        probability: Math.round(probability * 100 * 10) / 10 // Convert to percentage
      };
    });

    // Sort by probability and return results
    const sortedWords = scoredWords.sort((a, b) => b.probability - a.probability);
    
    // Apply maxResults limit or probability threshold
    let finalResults;
    if (maxResults === 0) {
      // Unlimited results - filter by probability threshold
      finalResults = sortedWords.filter(word => word.probability >= minProbability);
    } else {
      finalResults = sortedWords.slice(0, maxResults);
    }
    
    console.log('Final unified analysis results:', finalResults.slice(0, 5));

    return new Response(
      JSON.stringify({
        solutions: finalResults,
        analysisType: 'unified',
        constraints: serializeConstraints(constraints),
        corpusSize: wordCorpus.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in unified-wordle-analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});