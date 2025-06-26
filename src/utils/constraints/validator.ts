
import { WordConstraints } from './types';

export function validateWordAgainstConstraints(word: string, constraints: WordConstraints): boolean {
  const wordUpper = word.toUpperCase();
  
  console.log(`\n=== Enhanced Validation for "${wordUpper}" ===`);
  console.log('Enhanced constraints:', {
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

  // Step 2: Enhanced letter count validation (both min and max)
  for (const [letter, countConstraint] of constraints.letterCounts) {
    const actualCount = wordUpper.split('').filter(l => l === letter).length;
    console.log(`Checking enhanced count for ${letter}: actual=${actualCount}, min=${countConstraint.min}, max=${countConstraint.max || 'unlimited'}`);
    
    if (actualCount < countConstraint.min) {
      console.log(`❌ Insufficient count of letter ${letter}, needs at least ${countConstraint.min}, has ${actualCount}`);
      return false;
    }
    
    if (countConstraint.max !== undefined && actualCount > countConstraint.max) {
      console.log(`❌ Too many instances of letter ${letter}, max ${countConstraint.max}, has ${actualCount}`);
      return false;
    }
    
    console.log(`✅ Letter ${letter} count constraint satisfied: ${actualCount} (min: ${countConstraint.min}, max: ${countConstraint.max || 'unlimited'})`);
  }

  // Step 3: Check absent letters (only for letters not in letterCounts - they're handled above)
  for (const letter of constraints.absentLetters) {
    if (!constraints.letterCounts.has(letter) && wordUpper.includes(letter)) {
      console.log(`❌ Contains globally absent letter ${letter}`);
      return false;
    }
  }
  console.log(`✅ No globally absent letters found in word`);

  // Step 4: Enhanced present letter validation
  if (!validateEnhancedPresentLetters(wordUpper, constraints)) {
    console.log(`❌ Enhanced present letter validation failed`);
    return false;
  }

  console.log(`✅ "${wordUpper}" passed all enhanced validations!`);
  return true;
}

function validateEnhancedPresentLetters(word: string, constraints: WordConstraints): boolean {
  console.log(`\n--- Enhanced Present Letter Validation for "${word}" ---`);
  
  // Check each present letter
  for (const presentLetter of constraints.presentLetters) {
    const letterCount = word.split('').filter(l => l === presentLetter).length;
    
    // The letter must exist in the word
    if (letterCount === 0) {
      console.log(`❌ Present letter ${presentLetter} not found in word "${word}"`);
      return false;
    }
    
    // Check if we have count constraints for this letter
    const countConstraint = constraints.letterCounts.get(presentLetter);
    if (countConstraint) {
      // The count constraint already validates the exact count
      console.log(`✅ Present letter ${presentLetter} count validated by count constraint`);
    } else {
      console.log(`✅ Present letter ${presentLetter} found in word (count: ${letterCount})`);
    }
  }

  // Check position exclusions - present letters must NOT be in their excluded positions
  for (const [excludedPosition, excludedLetters] of constraints.positionExclusions) {
    const letterAtPosition = word[excludedPosition];
    
    for (const excludedLetter of excludedLetters) {
      if (letterAtPosition === excludedLetter) {
        console.log(`❌ Letter ${excludedLetter} found at excluded position ${excludedPosition} in word "${word}"`);
        return false;
      }
    }
  }

  console.log(`✅ All present letters are in valid positions with correct counts`);
  return true;
}
