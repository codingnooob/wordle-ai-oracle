
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

  for (const history of guessHistory) {
    for (let i = 0; i < history.guess.length; i++) {
      const tile = history.guess[i];
      if (!tile.letter) continue;

      const letter = tile.letter.toUpperCase();
      
      // Initialize tracking for this letter if needed
      if (!letterStates.has(letter)) {
        letterStates.set(letter, new Set());
      }
      
      letterStates.get(letter)!.add(tile.state);

      switch (tile.state) {
        case 'correct':
          constraints.correctPositions.set(i, letter);
          break;
        case 'present':
          constraints.presentLetters.add(letter);
          // Add position exclusion
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
  
  console.log(`\n=== Validating word "${wordUpper}" ===`);

  // Step 1: Check correct positions
  for (const [position, letter] of constraints.correctPositions) {
    if (wordUpper[position] !== letter) {
      console.log(`❌ Wrong letter at position ${position}, expected ${letter}, got ${wordUpper[position]}`);
      return false;
    }
  }

  // Step 2: Check absent letters are not in the word
  for (const letter of constraints.absentLetters) {
    if (wordUpper.includes(letter)) {
      console.log(`❌ Contains absent letter ${letter}`);
      return false;
    }
  }

  // Step 3: Check letter count constraints
  for (const [letter, countConstraint] of constraints.letterCounts) {
    const actualCount = wordUpper.split('').filter(l => l === letter).length;
    if (actualCount < countConstraint.min) {
      console.log(`❌ Insufficient count of letter ${letter}, needs at least ${countConstraint.min}, has ${actualCount}`);
      return false;
    }
    if (countConstraint.max !== undefined && actualCount > countConstraint.max) {
      console.log(`❌ Too many instances of letter ${letter}, max ${countConstraint.max}, has ${actualCount}`);
      return false;
    }
  }

  // Step 4: Check if all present letters can be placed in valid positions
  if (!canPlacePresentLettersCorrectly(wordUpper, constraints)) {
    console.log(`❌ Cannot place all present letters in valid positions`);
    return false;
  }

  console.log(`✅ "${wordUpper}" is VALID!`);
  return true;
}

function canPlacePresentLettersCorrectly(word: string, constraints: WordConstraints): boolean {
  console.log(`\n--- Checking present letter placement for "${word}" ---`);
  
  // For each present letter, we need to verify:
  // 1. The letter exists in the word
  // 2. The letter is NOT in any of its excluded positions
  // 3. All present letters can be satisfied simultaneously
  
  for (const presentLetter of constraints.presentLetters) {
    console.log(`Checking present letter: ${presentLetter}`);
    
    // Find all positions where this letter appears in the word
    const letterPositions: number[] = [];
    for (let i = 0; i < word.length; i++) {
      if (word[i] === presentLetter) {
        letterPositions.push(i);
      }
    }
    
    if (letterPositions.length === 0) {
      console.log(`❌ Letter ${presentLetter} not found in word`);
      return false;
    }
    
    console.log(`Letter ${presentLetter} found at positions: [${letterPositions.join(', ')}]`);
    
    // Check if this letter has any valid positions (not excluded and not occupied by correct letters)
    const excludedPositions = constraints.positionExclusions.get(presentLetter) || new Set();
    const validPositions: number[] = [];
    
    for (const pos of letterPositions) {
      // Position is valid if:
      // 1. It's not excluded for this letter
      // 2. It's not occupied by a correct letter (unless it's the same letter)
      const isExcluded = Array.from(excludedPositions).some(excludedPos => excludedPos === pos);
      const correctLetterAtPos = constraints.correctPositions.get(pos);
      const isOccupiedByDifferentCorrectLetter = correctLetterAtPos && correctLetterAtPos !== presentLetter;
      
      if (!isExcluded && !isOccupiedByDifferentCorrectLetter) {
        validPositions.push(pos);
      }
    }
    
    console.log(`Letter ${presentLetter} valid positions: [${validPositions.join(', ')}] (excluded: [${Array.from(excludedPositions).join(', ')}])`);
    
    if (validPositions.length === 0) {
      console.log(`❌ Letter ${presentLetter} has no valid positions`);
      return false;
    }
  }
  
  // If we get here, each present letter has at least one valid position
  // Now we need to check if there's a valid assignment of all present letters
  return hasValidLetterAssignment(word, constraints);
}

function hasValidLetterAssignment(word: string, constraints: WordConstraints): boolean {
  console.log(`\n--- Checking letter assignment for "${word}" ---`);
  
  // Create a map of letter -> required count from present letters
  const presentLettersArray = Array.from(constraints.presentLetters);
  const letterRequirements = new Map<string, number>();
  
  for (const letter of presentLettersArray) {
    letterRequirements.set(letter, (letterRequirements.get(letter) || 0) + 1);
  }
  
  console.log('Required present letters:', Array.from(letterRequirements.entries()));
  
  // For each required letter, check if the word can satisfy it
  for (const [letter, requiredCount] of letterRequirements) {
    // Count how many times this letter appears in valid positions
    let validOccurrences = 0;
    const excludedPositions = new Set<number>();
    
    // Add excluded positions for this letter
    const letterExclusions = constraints.positionExclusions.get(letter);
    if (letterExclusions) {
      for (const pos of letterExclusions) {
        excludedPositions.add(pos);
      }
    }
    
    // Add positions occupied by correct letters (different letters)
    for (const [pos, correctLetter] of constraints.correctPositions) {
      if (correctLetter !== letter) {
        excludedPositions.add(pos);
      }
    }
    
    // Count valid occurrences
    for (let i = 0; i < word.length; i++) {
      if (word[i] === letter && !excludedPositions.has(i)) {
        validOccurrences++;
      }
    }
    
    console.log(`Letter ${letter}: needs ${requiredCount}, has ${validOccurrences} valid occurrences (excluded positions: [${Array.from(excludedPositions).join(', ')}])`);
    
    if (validOccurrences < requiredCount) {
      console.log(`❌ Not enough valid positions for letter ${letter}`);
      return false;
    }
  }
  
  console.log(`✅ All present letters can be satisfied`);
  return true;
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
