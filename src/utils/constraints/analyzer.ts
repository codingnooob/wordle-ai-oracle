
import { WordConstraints, GuessHistory } from './types';

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
