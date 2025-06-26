
export class WordValidator {
  async validateWords(words: string[], wordValidator: any): Promise<string[]> {
    const validWords: string[] = [];

    for (const word of words) {
      try {
        if (wordValidator) {
          const embedding = await wordValidator(word.toLowerCase());
        }
        
        const isValid = await this.isEnglishWord(word);
        
        if (isValid) {
          validWords.push(word);
        } else {
          console.log(`Filtered out non-English word: ${word}`);
        }
      } catch (error) {
        console.error(`Error validating word ${word}:`, error);
        validWords.push(word);
      }
    }

    return validWords;
  }

  private async isEnglishWord(word: string): Promise<boolean> {
    const englishPatterns = [
      /^[aeiou]/i,
      /[aeiou]/i,
      /^[bcdfghjklmnpqrstvwxyz]{1,3}[aeiou]/i,
      /[aeiou][bcdfghjklmnpqrstvwxyz]/i
    ];

    const patternMatches = englishPatterns.filter(pattern => pattern.test(word)).length;
    
    if (patternMatches < 2) return false;

    const nonEnglishPatterns = [
      /[bcdfghjklmnpqrstvwxyz]{4,}/i,
      /^[xyz]/i,
      /qq|xx|zz/i
    ];

    const hasNonEnglishPattern = nonEnglishPatterns.some(pattern => pattern.test(word));
    
    return !hasNonEnglishPattern;
  }
}
