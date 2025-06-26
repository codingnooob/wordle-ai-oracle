
import { WordConstraints } from './types';

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
      const excludedPositionsSet = constraints.positionExclusions.get(letter);
      if (excludedPositionsSet && excludedPositionsSet.has(i)) {
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
