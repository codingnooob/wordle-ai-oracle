
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

  // Step 3: Check present letters placement
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
  
  // For each present letter, verify it exists in valid positions
  for (const presentLetter of constraints.presentLetters) {
    console.log(`\nChecking present letter: ${presentLetter}`);
    
    // Find all positions where this letter appears in the word
    const letterPositions: number[] = [];
    for (let i = 0; i < word.length; i++) {
      if (word[i] === presentLetter) {
        letterPositions.push(i);
      }
    }
    
    if (letterPositions.length === 0) {
      console.log(`❌ Letter ${presentLetter} not found in word "${word}"`);
      return false;
    }
    
    console.log(`Letter ${presentLetter} found at positions: [${letterPositions.join(', ')}]`);
    
    // Check if this letter has at least one valid position
    let hasValidPosition = false;
    for (const pos of letterPositions) {
      const excludedLettersAtPosition = constraints.positionExclusions.get(pos);
      const isExcluded = excludedLettersAtPosition && excludedLettersAtPosition.has(presentLetter);
      const correctLetterAtPos = constraints.correctPositions.get(pos);
      const isOccupiedByDifferentCorrectLetter = correctLetterAtPos && correctLetterAtPos !== presentLetter;
      
      console.log(`  Position ${pos}: letter='${word[pos]}', excluded=${isExcluded}, occupiedByDifferent=${isOccupiedByDifferentCorrectLetter}`);
      console.log(`    excludedLettersAtPosition: ${excludedLettersAtPosition ? Array.from(excludedLettersAtPosition) : 'none'}`);
      console.log(`    correctLetterAtPos: ${correctLetterAtPos || 'none'}`);
      
      if (!isExcluded && !isOccupiedByDifferentCorrectLetter) {
        hasValidPosition = true;
        console.log(`  ✅ Letter ${presentLetter} has valid position at ${pos}`);
        break;
      } else {
        console.log(`  ❌ Position ${pos} is invalid for ${presentLetter}`);
      }
    }
    
    if (!hasValidPosition) {
      console.log(`❌ Letter ${presentLetter} has no valid positions in "${word}"`);
      return false;
    }
  }
  
  console.log(`✅ All present letters can be placed in valid positions`);
  return true;
}
