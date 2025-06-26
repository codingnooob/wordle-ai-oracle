
import { SecurityUtils } from '../../security/securityUtils';

export class WordQualityService {
  processTrainingData(words: string[]): string[] {
    // Enhanced security: sanitize all scraped words before processing
    const sanitizedWords = words.map(word => SecurityUtils.sanitizeScrapedContent(word));
    const uniqueWords = [...new Set(sanitizedWords)];
    const processedWords = uniqueWords.filter(word => this.isValidWord(word));
    
    SecurityUtils.secureLog(`Full corpus processing: ${words.length} raw → ${uniqueWords.length} unique → ${processedWords.length} valid words`);
    
    // Return ALL valid words without artificial limits
    return processedWords;
  }

  private isValidWord(word: string): boolean {
    // Enhanced validation with security checks
    if (!word || typeof word !== 'string') return false;
    
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
    
    // Security: Reject words that might be malicious patterns
    if (this.isSuspiciousPattern(word)) return false;
    
    return true;
  }

  private isSuspiciousPattern(word: string): boolean {
    // Basic pattern detection for potentially malicious content
    const suspiciousPatterns = [
      /^[AEIOU]{10,}$/, // All vowels (suspicious)
      /^[BCDFGHJKLMNPQRSTVWXYZ]{10,}$/, // All consonants (suspicious)
      /(.)\1{4,}/, // 5+ repeated characters
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(word));
  }
}
