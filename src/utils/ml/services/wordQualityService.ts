
export class WordQualityService {
  processTrainingData(words: string[]): string[] {
    return [...new Set(words)]
      .filter(word => this.isQualityWord(word));
  }

  private isQualityWord(word: string): boolean {
    if (word.length < 3 || word.length > 8) return false;
    if (!/^[A-Z]+$/.test(word)) return false;
    
    const vowels = 'AEIOU';
    const vowelCount = word.split('').filter(char => vowels.includes(char)).length;
    if (vowelCount === 0) return false;
    
    const vowelRatio = vowelCount / word.length;
    if (vowelRatio < 0.15 || vowelRatio > 0.8) return false;
    
    if (/[BCDFGHJKLMNPQRSTVWXYZ]{4,}/.test(word)) return false;
    if (/^[XZ]/.test(word)) return false;
    if (/(.)\1{2,}/.test(word)) return false;
    
    return true;
  }
}
