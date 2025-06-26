
import { WordConstraints } from './types';

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
