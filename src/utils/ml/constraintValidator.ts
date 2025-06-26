
import { GuessData } from '../constraints/types';

export class ConstraintValidator {
  satisfiesConstraints(word: string, guessData: GuessData[]): boolean {
    const wordUpper = word.toUpperCase();
    
    for (let i = 0; i < guessData.length; i++) {
      const tile = guessData[i];
      if (!tile.letter) continue;
      
      const letter = tile.letter.toUpperCase();
      const wordLetter = wordUpper[i];
      
      switch (tile.state) {
        case 'correct':
          if (wordLetter !== letter) return false;
          break;
        case 'present':
          if (!wordUpper.includes(letter) || wordLetter === letter) return false;
          break;
        case 'absent':
          if (wordUpper.includes(letter)) return false;
          break;
      }
    }
    
    return true;
  }
}
