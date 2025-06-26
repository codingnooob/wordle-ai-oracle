
import { GuessData } from '../../constraints/types';

interface MLWordleSolution {
  word: string;
  probability: number;
}

export class WordScorer {
  async scoreWords(
    words: string[], 
    guessData: GuessData[], 
    wordLength: number,
    webScrapedData: string[]
  ): Promise<MLWordleSolution[]> {
    const scoredWords: MLWordleSolution[] = [];

    for (const word of words) {
      let score = 0.5;

      let constraintScore = 0;
      for (let i = 0; i < guessData.length; i++) {
        const tile = guessData[i];
        if (!tile.letter) continue;

        const letter = tile.letter.toUpperCase();
        const wordLetter = word[i];

        switch (tile.state) {
          case 'correct':
            if (wordLetter === letter) constraintScore += 0.3;
            else constraintScore -= 0.5;
            break;
          case 'present':
            if (word.includes(letter) && wordLetter !== letter) constraintScore += 0.2;
            else constraintScore -= 0.3;
            break;
          case 'absent':
            if (!word.includes(letter)) constraintScore += 0.1;
            else constraintScore -= 0.4;
            break;
        }
      }

      score += constraintScore;

      if (webScrapedData.includes(word.toLowerCase())) {
        score += 0.2;
      }

      const probability = Math.max(0.05, Math.min(0.95, score));
      
      scoredWords.push({
        word: word,
        probability: probability
      });
    }

    return scoredWords.sort((a, b) => b.probability - a.probability);
  }
}
