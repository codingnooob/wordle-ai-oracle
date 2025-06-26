
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

  // Calculate letter count constraints - improved logic
  for (const [letter, states] of letterStates) {
    if (states.has('correct') || states.has('present')) {
      const correctCount = Array.from(constraints.correctPositions.values()).filter(l => l === letter).length;
      const presentCount = constraints.presentLetters.has(letter) ? 1 : 0;
      const minCount = correctCount + presentCount;
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

  // Step 3: Check present letters placement
  if (!canPlacePresentLettersCorrectly(wordUpper, constraints)) {
    console.log(`❌ Cannot place all present letters in valid positions`);
    return false;
  }

  // Step 4: Check letter count constraints
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

  console.log(`✅ "${wordUpper}" is VALID!`);
  return true;
}

function canPlacePresentLettersCorrectly(word: string, constraints: WordConstraints): boolean {
  console.log(`\n--- Checking present letter placement for "${word}" ---`);
  
  // For each present letter, verify it exists in valid positions
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
    
    // Get excluded positions for this letter
    const excludedPositions = constraints.positionExclusions.get(presentLetter) || new Set();
    
    // Check if this letter has at least one valid position
    let hasValidPosition = false;
    for (const pos of letterPositions) {
      const isExcluded = Array.from(excludedPositions).includes(pos);
      const correctLetterAtPos = constraints.correctPositions.get(pos);
      const isOccupiedByDifferentCorrectLetter = correctLetterAtPos && correctLetterAtPos !== presentLetter;
      
      if (!isExcluded && !isOccupiedByDifferentCorrectLetter) {
        hasValidPosition = true;
        console.log(`✅ Letter ${presentLetter} has valid position at ${pos}`);
        break;
      }
    }
    
    if (!hasValidPosition) {
      console.log(`❌ Letter ${presentLetter} has no valid positions (excluded: [${Array.from(excludedPositions).join(', ')}])`);
      return false;
    }
  }
  
  console.log(`✅ All present letters can be placed in valid positions`);
  return true;
}

// Improved scoring algorithm
export function calculateWordScore(word: string, constraints: WordConstraints, baseFrequency: number): number {
  let score = Math.log(baseFrequency + 1) * 10; // Use logarithmic scaling for frequency
  
  console.log(`Calculating score for ${word}, base frequency: ${baseFrequency}, initial score: ${score}`);

  // Heavy bonus for matching correct positions (these are guaranteed)
  let correctPositionBonus = 0;
  for (const [position, letter] of constraints.correctPositions) {
    if (word.toUpperCase()[position] === letter) {
      correctPositionBonus += 30;
    }
  }
  score += correctPositionBonus;

  // Bonus for containing present letters in valid positions
  let presentLetterBonus = 0;
  for (const letter of constraints.presentLetters) {
    if (word.toUpperCase().includes(letter)) {
      presentLetterBonus += 20;
    }
  }
  score += presentLetterBonus;

  // Penalty for common letters in wrong positions (reduce over-scoring)
  const commonLetters = 'ETAOINSHRDLU';
  let commonLetterPenalty = 0;
  for (let i = 0; i < word.length; i++) {
    const letter = word[i].toUpperCase();
    if (commonLetters.includes(letter)) {
      const excludedPositions = constraints.positionExclusions.get(letter);
      if (excludedPositions && Array.from(excludedPositions).includes(i)) {
        commonLetterPenalty += 5; // Penalty for common letters in excluded positions
      }
    }
  }
  score -= commonLetterPenalty;

  // Word complexity bonus (favor less common words slightly)
  const uniqueLetters = new Set(word.toUpperCase().split('')).size;
  if (uniqueLetters >= 4) {
    score += 5;
  }

  // Vowel distribution bonus
  const vowels = 'AEIOU';
  const vowelCount = word.split('').filter(letter => vowels.includes(letter.toUpperCase())).length;
  if (vowelCount >= 2 && vowelCount <= 3) {
    score += 3;
  }

  console.log(`Final score for ${word}: ${score} (correct: +${correctPositionBonus}, present: +${presentLetterBonus}, penalty: -${commonLetterPenalty})`);
  
  return Math.max(1, score); // Ensure minimum score of 1
}

// Enhanced potential matches finder
export function findPotentialMatches(constraints: WordConstraints): string[] {
  const presentLetters = Array.from(constraints.presentLetters);
  const correctLetters = Array.from(constraints.correctPositions.values());
  const allRequiredLetters = [...new Set([...presentLetters, ...correctLetters])];
  
  console.log(`Looking for words containing all letters: ${allRequiredLetters.join(', ')}`);
  
  // Enhanced example word generation based on common 5-letter patterns
  const commonWords = [
    'ARISE', 'ADIEU', 'AUDIO', 'HOUSE', 'MOUSE', 'ROUTE', 'SLATE', 'CRANE', 
    'TRACE', 'SPACE', 'PLACE', 'GRACE', 'BRACE', 'PRICE', 'PRIME', 'CRIME',
    'CRUEL', 'LUCRE', 'ULCER', 'CLUER', 'CLEAR', 'LEARN', 'EARTH', 'HEART',
    'SMART', 'START', 'CHART', 'GREAT', 'TREAT', 'BREAD', 'DREAM', 'CREAM'
  ];
  
  const examples = commonWords.filter(word => {
    const wordUpper = word.toUpperCase();
    return allRequiredLetters.every(letter => wordUpper.includes(letter));
  });
  
  console.log('Potential example words to check:', examples);
  return examples.slice(0, 10); // Limit for performance
}
