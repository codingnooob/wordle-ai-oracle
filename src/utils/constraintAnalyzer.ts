
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

  for (const history of guessHistory) {
    for (let i = 0; i < history.guess.length; i++) {
      const tile = history.guess[i];
      if (!tile.letter) continue;

      const letter = tile.letter.toUpperCase();

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
          // Only mark as absent if it's not correct or present elsewhere
          const isCorrectElsewhere = Array.from(constraints.correctPositions.values()).includes(letter);
          const isPresentElsewhere = constraints.presentLetters.has(letter);
          if (!isCorrectElsewhere && !isPresentElsewhere) {
            constraints.absentLetters.add(letter);
          }
          break;
      }
    }
  }

  return constraints;
}

export function validateWordAgainstConstraints(word: string, constraints: WordConstraints): boolean {
  const wordUpper = word.toUpperCase();

  // Check correct positions
  for (const [position, letter] of constraints.correctPositions) {
    if (wordUpper[position] !== letter) {
      return false;
    }
  }

  // Check present letters are in the word
  for (const letter of constraints.presentLetters) {
    if (!wordUpper.includes(letter)) {
      return false;
    }
  }

  // Check present letters are NOT in their excluded positions
  for (const [position, excludedLetters] of constraints.positionExclusions) {
    if (position < wordUpper.length && excludedLetters.has(wordUpper[position])) {
      return false;
    }
  }

  // Check absent letters are not in the word
  for (const letter of constraints.absentLetters) {
    if (wordUpper.includes(letter)) {
      return false;
    }
  }

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
