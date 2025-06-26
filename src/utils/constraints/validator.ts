
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

  // Step 3: Check present letters - COMPLETELY REWRITTEN
  if (!validatePresentLetters(wordUpper, constraints)) {
    console.log(`❌ Present letter validation failed`);
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

function validatePresentLetters(word: string, constraints: WordConstraints): boolean {
  console.log(`\n--- Validating present letters for "${word}" ---`);
  
  // First, ensure all present letters exist in the word
  for (const presentLetter of constraints.presentLetters) {
    if (!word.includes(presentLetter)) {
      console.log(`❌ Present letter ${presentLetter} not found in word "${word}"`);
      return false;
    }
  }
  
  if (constraints.presentLetters.size === 0) {
    console.log(`✅ No present letters to validate`);
    return true;
  }

  console.log(`✅ All ${constraints.presentLetters.size} present letters found in word`);

  // Now check position exclusions - each present letter must NOT be in its excluded positions
  for (const [excludedPosition, excludedLetters] of constraints.positionExclusions) {
    const letterAtPosition = word[excludedPosition];
    
    for (const excludedLetter of excludedLetters) {
      if (letterAtPosition === excludedLetter) {
        console.log(`❌ Letter ${excludedLetter} found at excluded position ${excludedPosition} in word "${word}"`);
        return false;
      }
    }
  }

  console.log(`✅ All present letters are in valid positions (not in their excluded positions)`);
  return true;
}
