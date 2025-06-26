
import { WordConstraints } from './types';

export function validateWordAgainstConstraints(word: string, constraints: WordConstraints): boolean {
  const wordUpper = word.toUpperCase();
  
  console.log(`\n=== Validating word "${wordUpper}" ===`);
  console.log('Constraints:', {
    correctPositions: Array.from(constraints.correctPositions.entries()),
    presentLetters: Array.from(constraints.presentLetters),
    absentLetters: Array.from(constraints.absentLetters),
    positionExclusions: Array.from(constraints.positionExclusions.entries()).map(([pos, letters]) => [pos, Array.from(letters)]),
    letterCounts: Array.from(constraints.letterCounts.entries())
  });

  // Step 1: Check correct positions
  for (const [position, letter] of constraints.correctPositions) {
    if (wordUpper[position] !== letter) {
      console.log(`❌ Wrong letter at position ${position}, expected ${letter}, got ${wordUpper[position]}`);
      return false;
    } else {
      console.log(`✅ Correct letter at position ${position}: ${letter}`);
    }
  }

  // Step 2: Check absent letters are not in the word
  for (const letter of constraints.absentLetters) {
    if (wordUpper.includes(letter)) {
      console.log(`❌ Contains absent letter ${letter}`);
      return false;
    }
  }
  console.log(`✅ No absent letters found in word`);

  // Step 3: Check present letters - IMPROVED LOGIC
  if (!canPlacePresentLettersCorrectly(wordUpper, constraints)) {
    console.log(`❌ Cannot place all present letters in valid positions`);
    return false;
  }

  // Step 4: Check letter count constraints
  for (const [letter, countConstraint] of constraints.letterCounts) {
    const actualCount = wordUpper.split('').filter(l => l === letter).length;
    console.log(`Checking letter count for ${letter}: actual=${actualCount}, min=${countConstraint.min}, max=${countConstraint.max}`);
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
  
  // First, ensure all present letters exist in the word
  for (const presentLetter of constraints.presentLetters) {
    if (!word.includes(presentLetter)) {
      console.log(`❌ Letter ${presentLetter} not found in word "${word}"`);
      return false;
    }
  }
  console.log(`✅ All present letters found in word`);

  // For placement validation, we need to check if we can assign each present letter
  // to a valid position (not excluded and not occupied by a different correct letter)
  const availablePositions = new Map<string, number[]>();
  
  // For each present letter, find all valid positions it could occupy
  for (const presentLetter of constraints.presentLetters) {
    const validPositions: number[] = [];
    
    for (let pos = 0; pos < word.length; pos++) {
      const excludedLettersAtPosition = constraints.positionExclusions.get(pos);
      const isExcluded = excludedLettersAtPosition && excludedLettersAtPosition.has(presentLetter);
      const correctLetterAtPos = constraints.correctPositions.get(pos);
      const isOccupiedByDifferentCorrectLetter = correctLetterAtPos && correctLetterAtPos !== presentLetter;
      
      if (!isExcluded && !isOccupiedByDifferentCorrectLetter) {
        validPositions.push(pos);
      }
    }
    
    availablePositions.set(presentLetter, validPositions);
    console.log(`Letter ${presentLetter} can be placed at positions: [${validPositions.join(', ')}]`);
    
    if (validPositions.length === 0) {
      console.log(`❌ Letter ${presentLetter} has no valid positions in "${word}"`);
      return false;
    }
  }

  // Now check if we can actually place each letter in the word at valid positions
  // This is a more sophisticated check for complex rearrangement scenarios
  return canAssignLettersToPositions(word, constraints, availablePositions);
}

function canAssignLettersToPositions(
  word: string, 
  constraints: WordConstraints, 
  availablePositions: Map<string, number[]>
): boolean {
  console.log(`\n--- Checking letter-to-position assignment for "${word}" ---`);
  
  // For each present letter, check if it appears at any of its valid positions
  for (const presentLetter of constraints.presentLetters) {
    const validPositions = availablePositions.get(presentLetter) || [];
    const letterPositionsInWord: number[] = [];
    
    // Find where this letter actually appears in the word
    for (let i = 0; i < word.length; i++) {
      if (word[i] === presentLetter) {
        letterPositionsInWord.push(i);
      }
    }
    
    console.log(`Letter ${presentLetter}: appears at [${letterPositionsInWord.join(', ')}], valid at [${validPositions.join(', ')}]`);
    
    // Check if any of the letter's actual positions are valid
    const hasValidPlacement = letterPositionsInWord.some(pos => validPositions.includes(pos));
    
    if (!hasValidPlacement) {
      console.log(`❌ Letter ${presentLetter} not placed in any valid position`);
      return false;
    } else {
      console.log(`✅ Letter ${presentLetter} has valid placement`);
    }
  }
  
  console.log(`✅ All present letters have valid placements in "${word}"`);
  return true;
}
