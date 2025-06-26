
export interface GuessData {
  letter: string;
  state: 'unknown' | 'absent' | 'present' | 'correct';
}

export interface WordConstraints {
  correctPositions: Map<number, string>; // position -> letter
  presentLetters: Set<string>; // letters that are in the word but wrong position
  absentLetters: Set<string>; // letters definitely not in the word
  positionExclusions: Map<number, Set<string>>; // position -> excluded letters
  letterCounts: Map<string, { min: number; max?: number }>; // letter -> count constraints
}

export interface GuessHistory {
  guess: GuessData[];
  timestamp: number;
}

export function analyzeConstraints(guessHistory: GuessHistory[]): WordConstraints {
  const constraints: WordConstraints = {
    correctPositions: new Map(),
    presentLetters: new Set(),
    absentLetters: new Set(),
    positionExclusions: new Map(),
    letterCounts: new Map()
  };

  // Track all letters we've seen and their states across all guesses
  const letterStates = new Map<string, Set<string>>();
  const letterPositionHistory = new Map<string, { correctPositions: Set<number>; excludedPositions: Set<number> }>();

  for (const history of guessHistory) {
    for (let i = 0; i < history.guess.length; i++) {
      const tile = history.guess[i];
      if (!tile.letter) continue;

      const letter = tile.letter.toUpperCase();
      
      // Initialize tracking for this letter if needed
      if (!letterStates.has(letter)) {
        letterStates.set(letter, new Set());
        letterPositionHistory.set(letter, { correctPositions: new Set(), excludedPositions: new Set() });
      }
      
      letterStates.get(letter)!.add(tile.state);
      const positionHistory = letterPositionHistory.get(letter)!;

      switch (tile.state) {
        case 'correct':
          constraints.correctPositions.set(i, letter);
          positionHistory.correctPositions.add(i);
          break;
        case 'present':
          constraints.presentLetters.add(letter);
          positionHistory.excludedPositions.add(i);
          if (!constraints.positionExclusions.has(i)) {
            constraints.positionExclusions.set(i, new Set());
          }
          constraints.positionExclusions.get(i)!.add(letter);
          break;
        case 'absent':
          // Only mark as absent if we've never seen it as correct or present
          const states = letterStates.get(letter) || new Set();
          if (!states.has('correct') && !states.has('present')) {
            constraints.absentLetters.add(letter);
          }
          break;
      }
    }
  }

  // Calculate letter count constraints
  for (const [letter, states] of letterStates) {
    if (states.has('correct') || states.has('present')) {
      const correctCount = Array.from(constraints.correctPositions.values()).filter(l => l === letter).length;
      const minCount = correctCount + (constraints.presentLetters.has(letter) ? 1 : 0);
      constraints.letterCounts.set(letter, { min: minCount });
    }
  }

  console.log('Final constraints analysis:', {
    correctPositions: Array.from(constraints.correctPositions.entries()),
    presentLetters: Array.from(constraints.presentLetters),
    absentLetters: Array.from(constraints.absentLetters),
    positionExclusions: Array.from(constraints.positionExclusions.entries()).map(([pos, letters]) => [pos, Array.from(letters)]),
    letterCounts: Array.from(constraints.letterCounts.entries())
  });

  return constraints;
}

export function validateWordAgainstConstraints(word: string, constraints: WordConstraints): boolean {
  const wordUpper = word.toUpperCase();
  
  console.log(`Validating word "${wordUpper}" against constraints`);

  // Step 1: Check correct positions
  for (const [position, letter] of constraints.correctPositions) {
    if (wordUpper[position] !== letter) {
      console.log(`❌ ${wordUpper}: Wrong letter at position ${position}, expected ${letter}, got ${wordUpper[position]}`);
      return false;
    }
  }

  // Step 2: Check absent letters are not in the word
  for (const letter of constraints.absentLetters) {
    if (wordUpper.includes(letter)) {
      console.log(`❌ ${wordUpper}: Contains absent letter ${letter}`);
      return false;
    }
  }

  // Step 3: Check letter count constraints
  for (const [letter, countConstraint] of constraints.letterCounts) {
    const actualCount = wordUpper.split('').filter(l => l === letter).length;
    if (actualCount < countConstraint.min) {
      console.log(`❌ ${wordUpper}: Insufficient count of letter ${letter}, needs at least ${countConstraint.min}, has ${actualCount}`);
      return false;
    }
    if (countConstraint.max !== undefined && actualCount > countConstraint.max) {
      console.log(`❌ ${wordUpper}: Too many instances of letter ${letter}, max ${countConstraint.max}, has ${actualCount}`);
      return false;
    }
  }

  // Step 4: Check if all present letters can be placed in valid positions
  if (!canPlacePresentLetters(wordUpper, constraints)) {
    console.log(`❌ ${wordUpper}: Cannot place all present letters in valid positions`);
    return false;
  }

  console.log(`✅ ${wordUpper}: Valid word!`);
  return true;
}

function canPlacePresentLetters(word: string, constraints: WordConstraints): boolean {
  // Get all positions that are not already taken by correct letters
  const availablePositions = new Set<number>();
  for (let i = 0; i < word.length; i++) {
    if (!constraints.correctPositions.has(i)) {
      availablePositions.add(i);
    }
  }

  // For each present letter, find positions where it can be placed
  const letterPositionOptions = new Map<string, Set<number>>();
  
  for (const letter of constraints.presentLetters) {
    const validPositions = new Set<number>();
    
    for (const pos of availablePositions) {
      // Check if this letter is excluded from this position
      const excludedLetters = constraints.positionExclusions.get(pos) || new Set();
      if (!excludedLetters.has(letter)) {
        // Check if the word actually has this letter at this position
        if (word[pos] === letter) {
          validPositions.add(pos);
        }
      }
    }
    
    if (validPositions.size === 0) {
      console.log(`❌ Present letter ${letter} has no valid positions available`);
      return false;
    }
    
    letterPositionOptions.set(letter, validPositions);
  }

  // Check if we can assign each present letter to a unique position
  return canAssignLettersToPositions(letterPositionOptions, word);
}

function canAssignLettersToPositions(letterPositionOptions: Map<string, Set<number>>, word: string): boolean {
  const letters = Array.from(letterPositionOptions.keys());
  const usedPositions = new Set<number>();
  
  // Try to find a valid assignment using backtracking
  function backtrack(letterIndex: number): boolean {
    if (letterIndex === letters.length) {
      return true; // All letters assigned successfully
    }
    
    const letter = letters[letterIndex];
    const possiblePositions = letterPositionOptions.get(letter)!;
    
    for (const position of possiblePositions) {
      if (!usedPositions.has(position) && word[position] === letter) {
        usedPositions.add(position);
        if (backtrack(letterIndex + 1)) {
          return true;
        }
        usedPositions.delete(position);
      }
    }
    
    return false;
  }
  
  const result = backtrack(0);
  if (!result) {
    console.log(`❌ Cannot find valid assignment for present letters:`, 
      Array.from(letterPositionOptions.entries()).map(([letter, positions]) => 
        `${letter}: [${Array.from(positions).join(',')}]`
      )
    );
  }
  
  return result;
}

// Add a function to find example words that might work
export function findPotentialMatches(constraints: WordConstraints): string[] {
  const presentLetters = Array.from(constraints.presentLetters);
  const correctLetters = Array.from(constraints.correctPositions.values());
  const allRequiredLetters = [...new Set([...presentLetters, ...correctLetters])];
  
  console.log(`Looking for words containing all letters: ${allRequiredLetters.join(', ')}`);
  
  // Generate some potential permutations for debugging
  if (allRequiredLetters.length >= 4) {
    const examples = [
      'CRUEL', 'LUCRE', 'ULCER', 'CLUER', 'CURED', 'LURED', 'RULED',
      'CREEL', 'CLEAR', 'CRANE', 'CRATE', 'TRACE', 'GRACE', 'BRACE'
    ].filter(word => {
      const wordUpper = word.toUpperCase();
      return allRequiredLetters.every(letter => wordUpper.includes(letter));
    });
    
    console.log('Potential example words to check:', examples);
    return examples;
  }
  
  return [];
}

export function calculateWordScore(word: string, constraints: WordConstraints, baseFrequency: number): number {
  let score = baseFrequency;

  // Bonus for matching correct positions
  for (const [position, letter] of constraints.correctPositions) {
    if (word.toUpperCase()[position] === letter) {
      score += 20;
    }
  }

  // Bonus for containing present letters
  for (const letter of constraints.presentLetters) {
    if (word.toUpperCase().includes(letter)) {
      score += 15;
    }
  }

  // Letter frequency analysis bonus
  const commonLetters = 'ETAOINSHRDLCUMWFGYPBVKJXQZ';
  for (let i = 0; i < word.length; i++) {
    const letterIndex = commonLetters.indexOf(word[i].toUpperCase());
    if (letterIndex !== -1) {
      score += (commonLetters.length - letterIndex) * 0.5;
    }
  }

  // Vowel distribution bonus
  const vowels = 'AEIOU';
  const vowelCount = word.split('').filter(letter => vowels.includes(letter.toUpperCase())).length;
  if (vowelCount >= 2 && vowelCount <= 3) {
    score += 5;
  }

  return score;
}
