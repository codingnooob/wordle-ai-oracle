
export interface GuessData {
  letter: string;
  state: 'unknown' | 'absent' | 'present' | 'correct';
}

export interface WordConstraints {
  correctPositions: Map<number, string>; // position -> letter
  presentLetters: Set<string>; // letters that are in the word but wrong position
  absentLetters: Set<string>; // letters definitely not in the word
  positionExclusions: Map<number, Set<string>>; // position -> excluded letters
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
    positionExclusions: new Map()
  };

  // Track all letters we've seen and their states
  const letterStates = new Map<string, Set<string>>();

  for (const history of guessHistory) {
    for (let i = 0; i < history.guess.length; i++) {
      const tile = history.guess[i];
      if (!tile.letter) continue;

      const letter = tile.letter.toUpperCase();
      
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

  console.log('Final constraints analysis:', {
    correctPositions: Array.from(constraints.correctPositions.entries()),
    presentLetters: Array.from(constraints.presentLetters),
    absentLetters: Array.from(constraints.absentLetters),
    positionExclusions: Array.from(constraints.positionExclusions.entries()).map(([pos, letters]) => [pos, Array.from(letters)])
  });

  return constraints;
}

export function validateWordAgainstConstraints(word: string, constraints: WordConstraints): boolean {
  const wordUpper = word.toUpperCase();
  
  console.log(`Validating word "${wordUpper}" against constraints`);

  // Check correct positions
  for (const [position, letter] of constraints.correctPositions) {
    if (wordUpper[position] !== letter) {
      console.log(`❌ ${wordUpper}: Wrong letter at position ${position}, expected ${letter}, got ${wordUpper[position]}`);
      return false;
    }
  }

  // Check present letters are in the word
  for (const letter of constraints.presentLetters) {
    if (!wordUpper.includes(letter)) {
      console.log(`❌ ${wordUpper}: Missing present letter ${letter}`);
      return false;
    }
  }

  // Check present letters are NOT in their excluded positions
  for (const [position, excludedLetters] of constraints.positionExclusions) {
    if (position < wordUpper.length && excludedLetters.has(wordUpper[position])) {
      console.log(`❌ ${wordUpper}: Letter ${wordUpper[position]} found at excluded position ${position}`);
      return false;
    }
  }

  // Check absent letters are not in the word
  for (const letter of constraints.absentLetters) {
    if (wordUpper.includes(letter)) {
      console.log(`❌ ${wordUpper}: Contains absent letter ${letter}`);
      return false;
    }
  }

  console.log(`✅ ${wordUpper}: Valid word!`);
  return true;
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
