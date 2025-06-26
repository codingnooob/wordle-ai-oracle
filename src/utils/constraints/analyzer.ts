
import { WordConstraints, GuessHistory } from './types';

export function analyzeConstraints(guessHistory: GuessHistory[]): WordConstraints {
  const constraints: WordConstraints = {
    correctPositions: new Map(),
    presentLetters: new Set(),
    absentLetters: new Set(),
    positionExclusions: new Map(),
    letterCounts: new Map()
  };

  console.log('=== Enhanced Duplicate Letter Analysis ===');

  for (const history of guessHistory) {
    console.log(`\nAnalyzing guess: ${history.guess.map(t => t.letter).join('')}`);
    
    // Phase 1: Per-guess duplicate letter analysis
    const duplicateLetterAnalysis = analyzeDuplicateLettersInGuess(history.guess);
    console.log('Duplicate letter analysis:', duplicateLetterAnalysis);

    // Apply constraints from this analysis
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

  // Phase 2: Determine exact counts for letters with mixed states
  for (const [letter, analysis] of letterAnalysis) {
    const states = analysis.positions.map(p => p.state);
    const hasCorrect = states.includes('correct');
    const hasPresent = states.includes('present');
    const hasAbsent = states.includes('absent');

    console.log(`Letter ${letter}: states = [${states.join(', ')}]`);

    // If we have absent state with correct/present, we can determine exact count
    if (hasAbsent && (hasCorrect || hasPresent)) {
      const nonAbsentCount = states.filter(s => s !== 'absent').length;
      analysis.exactCount = nonAbsentCount;
      analysis.hasConflict = true;
      console.log(`  Exact count determined: ${letter} appears exactly ${nonAbsentCount} times`);
    } else if (hasCorrect || hasPresent) {
      // Minimum count based on non-absent occurrences
      const nonAbsentCount = states.filter(s => s !== 'absent').length;
      analysis.exactCount = nonAbsentCount; // This is minimum, max will be set later if needed
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
          // Add position exclusion
          if (!constraints.positionExclusions.has(position.index)) {
            constraints.positionExclusions.set(position.index, new Set());
          }
          constraints.positionExclusions.get(position.index)!.add(letter);
          break;
          
        case 'absent':
          // Only mark as globally absent if this letter doesn't appear as correct/present anywhere in this guess
          const hasNonAbsentInThisGuess = letterAnalysis.positions.some(p => p.state !== 'absent');
          if (!hasNonAbsentInThisGuess) {
            constraints.absentLetters.add(letter);
          }
          break;
      }
    }

    // Phase 3: Set letter count constraints (both min and max)
    if (letterAnalysis.exactCount !== undefined) {
      if (letterAnalysis.hasConflict) {
        // This is an exact count (has both absent and non-absent states)
        constraints.letterCounts.set(letter, {
          min: letterAnalysis.exactCount,
          max: letterAnalysis.exactCount
        });
        console.log(`Set exact count constraint for ${letter}: exactly ${letterAnalysis.exactCount}`);
      } else {
        // This is a minimum count
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
