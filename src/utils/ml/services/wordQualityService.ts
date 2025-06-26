
export class WordQualityService {
  processTrainingData(words: string[]): string[] {
    // Much more permissive filtering to maximize word diversity
    const uniqueWords = [...new Set(words)];
    const processedWords = uniqueWords.filter(word => this.isQualityWord(word));
    
    console.log(`📊 Word processing: ${words.length} raw → ${uniqueWords.length} unique → ${processedWords.length} filtered`);
    return processedWords;
  }

  private isQualityWord(word: string): boolean {
    // Basic length and character validation
    if (word.length < 3 || word.length > 8) return false;
    if (!/^[A-Z]+$/.test(word)) return false;
    
    const vowels = 'AEIOU';
    const vowelCount = word.split('').filter(char => vowels.includes(char)).length;
    
    // Must have at least one vowel
    if (vowelCount === 0) return false;
    
    // Very permissive vowel ratio (almost anything goes)
    const vowelRatio = vowelCount / word.length;
    if (vowelRatio > 0.95) return false; // Only reject if ALL vowels
    
    // Allow more consonant clusters (only reject extreme cases)
    if (/[BCDFGHJKLMNPQRSTVWXYZ]{6,}/.test(word)) return false;
    
    // Allow most repeated patterns (only reject extreme repetition)
    if (/(.)\1{4,}/.test(word)) return false;
    
    // Accept common abbreviations and acronyms
    const commonPatterns = /^(USA|DNA|RNA|CPU|GPU|API|URL|PDF|XML|HTML|CSS|SQL|PHP)$/;
    if (commonPatterns.test(word)) return true;
    
    // Accept most everything else
    return true;
  }
}
