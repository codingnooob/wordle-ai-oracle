
export class WordQualityService {
  processTrainingData(words: string[]): string[] {
    // Minimal filtering to preserve the full corpus - only remove obvious non-words
    const uniqueWords = [...new Set(words)];
    const processedWords = uniqueWords.filter(word => this.isValidWord(word));
    
    console.log(`📊 Full corpus processing: ${words.length} raw → ${uniqueWords.length} unique → ${processedWords.length} valid words`);
    
    // Return ALL valid words without artificial limits
    return processedWords;
  }

  private isValidWord(word: string): boolean {
    // Relaxed word length - allow 3-15 letters to capture more vocabulary
    if (word.length < 3 || word.length > 15) return false;
    
    // Must be only alphabetic characters (no numbers, punctuation)
    if (!/^[A-Z]+$/.test(word)) return false;
    
    // Must have at least one vowel (basic English word requirement)
    const vowels = 'AEIOU';
    const hasVowel = word.split('').some(char => vowels.includes(char));
    if (!hasVowel) return false;
    
    // Only reject extreme cases of consonant clusters (8+ consecutive)
    if (/[BCDFGHJKLMNPQRSTVWXYZ]{8,}/.test(word)) return false;
    
    // Only reject extreme repetition (5+ same letters in a row)
    if (/(.)\1{5,}/.test(word)) return false;
    
    // Accept everything else - let the ML training benefit from the full vocabulary
    return true;
  }
}
