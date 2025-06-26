
export class WordQualityService {
  processTrainingData(words: string[]): string[] {
    // Reduced filtering to allow more diverse words
    return [...new Set(words)]
      .filter(word => this.isQualityWord(word));
  }

  private isQualityWord(word: string): boolean {
    // More permissive filtering to increase word diversity
    if (word.length < 3 || word.length > 8) return false;
    if (!/^[A-Z]+$/.test(word)) return false;
    
    const vowels = 'AEIOU';
    const vowelCount = word.split('').filter(char => vowels.includes(char)).length;
    
    // Must have at least one vowel, but more permissive ratios
    if (vowelCount === 0) return false;
    
    const vowelRatio = vowelCount / word.length;
    // More permissive vowel ratio (was 0.15-0.8, now 0.1-0.9)
    if (vowelRatio < 0.1 || vowelRatio > 0.9) return false;
    
    // Allow more consonant clusters (was 4+, now 5+)
    if (/[BCDFGHJKLMNPQRSTVWXYZ]{5,}/.test(word)) return false;
    
    // Less restrictive on starting letters (removed X/Z restriction)
    
    // Allow more repeated patterns (was 2, now 3)
    if (/(.)\1{3,}/.test(word)) return false;
    
    // Additional checks for very common words to avoid over-filtering
    const commonWords = ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'HAD', 'HAS', 'HIS', 'HOW', 'ITS', 'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WHO', 'BOY', 'DID', 'GET', 'LET', 'MAN', 'RUN', 'SUN', 'TOP', 'WAY', 'WIN', 'YES', 'YET'];
    if (commonWords.includes(word)) return true;
    
    return true;
  }
}
