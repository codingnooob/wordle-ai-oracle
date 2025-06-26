
export function isValidEnglishWord(word: string): boolean {
  // Must be 3-8 letters, only alphabetic characters
  if (word.length < 3 || word.length > 8 || !/^[A-Z]+$/.test(word)) {
    return false;
  }
  
  // Must contain at least one vowel
  if (!/[AEIOU]/.test(word)) {
    return false;
  }
  
  // Avoid words with too many consecutive consonants
  if (/[BCDFGHJKLMNPQRSTVWXYZ]{4,}/.test(word)) {
    return false;
  }
  
  // Avoid very uncommon starting patterns
  if (/^[XZ]/.test(word)) {
    return false;
  }
  
  // Avoid repeated letter patterns that are uncommon in English
  if (/(.)\1{2,}/.test(word)) {
    return false;
  }
  
  return true;
}

export function extractWordsFromHtml(html: string): string[] {
  const words = new Set<string>();
  
  // Remove HTML tags and extract text content
  const textContent = html
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[^;]+;/g, ' '); // Remove HTML entities
  
  // Extract words using regex
  const wordMatches = textContent.match(/\b[a-zA-Z]{3,8}\b/g) || [];
  
  wordMatches.forEach(word => {
    const cleanWord = word.toUpperCase().trim();
    
    // Validate word quality
    if (isValidEnglishWord(cleanWord)) {
      words.add(cleanWord);
    }
  });
  
  return Array.from(words);
}
