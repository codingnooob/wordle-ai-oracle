
interface WordApiResponse {
  word: string;
  score: number;
  tags?: string[];
}

interface CachedWordData {
  words: Array<{ word: string; frequency: number }>;
  timestamp: number;
  expiresAt: number;
}

class WordApiService {
  private cache = new Map<string, CachedWordData>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  private readonly API_BASE_URL = 'https://api.datamuse.com/words';
  private readonly MAX_WORDS_PER_LENGTH = 2000;

  async getWordsForLength(length: number): Promise<Array<{ word: string; frequency: number }>> {
    const cacheKey = `words_${length}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      console.log(`Using cached words for length ${length}: ${cached.words.length} words`);
      return cached.words;
    }

    try {
      console.log(`Fetching words from API for length ${length}`);
      const words = await this.fetchWordsFromApi(length);
      
      // Cache the results
      const cacheData: CachedWordData = {
        words,
        timestamp: Date.now(),
        expiresAt: Date.now() + this.CACHE_DURATION
      };
      this.cache.set(cacheKey, cacheData);
      
      console.log(`Fetched ${words.length} words for length ${length}`);
      return words;
    } catch (error) {
      console.error(`Failed to fetch words for length ${length}:`, error);
      
      // Return cached data if available, even if expired
      if (cached) {
        console.log(`Using expired cache for length ${length}`);
        return cached.words;
      }
      
      // Fallback to a minimal set if API fails completely
      return this.getFallbackWords(length);
    }
  }

  private async fetchWordsFromApi(length: number): Promise<Array<{ word: string; frequency: number }>> {
    const allWords: Array<{ word: string; frequency: number }> = [];
    
    // Fetch common words first (high frequency)
    const commonWords = await this.fetchWordBatch(length, 'f', 500);
    allWords.push(...commonWords);
    
    // Fetch additional words to reach our target
    if (allWords.length < this.MAX_WORDS_PER_LENGTH) {
      const additionalWords = await this.fetchWordBatch(
        length, 
        '', 
        this.MAX_WORDS_PER_LENGTH - allWords.length
      );
      
      // Filter out duplicates
      const existingWords = new Set(allWords.map(w => w.word.toUpperCase()));
      const newWords = additionalWords.filter(w => !existingWords.has(w.word.toUpperCase()));
      allWords.push(...newWords);
    }
    
    return allWords;
  }

  private async fetchWordBatch(
    length: number, 
    sortBy: string = '', 
    maxResults: number = 1000
  ): Promise<Array<{ word: string; frequency: number }>> {
    const params = new URLSearchParams({
      sp: '?'.repeat(length), // Match exact length
      max: maxResults.toString(),
    });
    
    if (sortBy) {
      params.append('sort', sortBy);
    }
    
    const url = `${this.API_BASE_URL}?${params}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data: WordApiResponse[] = await response.json();
    
    return data
      .filter(item => {
        const word = item.word.toUpperCase();
        // Filter valid English words (only letters, correct length)
        return word.length === length && 
               /^[A-Z]+$/.test(word) &&
               !word.includes('-') &&
               !word.includes("'");
      })
      .map(item => ({
        word: item.word.toUpperCase(),
        frequency: Math.max(1, item.score || 1) // Ensure minimum frequency of 1
      }));
  }

  private getFallbackWords(length: number): Array<{ word: string; frequency: number }> {
    // Minimal fallback words for each length
    const fallbackWords: { [key: number]: string[] } = {
      3: ['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER'],
      4: ['THAT', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM', 'THEY', 'KNOW', 'WANT'],
      5: ['WHICH', 'THEIR', 'WOULD', 'THERE', 'COULD', 'OTHER', 'AFTER', 'FIRST', 'NEVER', 'THESE'],
      6: ['SHOULD', 'AROUND', 'LITTLE', 'PEOPLE', 'BEFORE', 'MOTHER', 'THOUGH', 'SCHOOL', 'ALWAYS', 'REALLY'],
      7: ['THROUGH', 'BETWEEN', 'ANOTHER', 'WITHOUT', 'BECAUSE', 'AGAINST', 'NOTHING', 'SOMEONE', 'TOWARDS', 'SEVERAL'],
      8: ['BUSINESS', 'TOGETHER', 'CHILDREN', 'QUESTION', 'COMPLETE', 'YOURSELF', 'REMEMBER', 'ALTHOUGH', 'CONTINUE', 'POSSIBLE']
    };
    
    const words = fallbackWords[length] || [];
    return words.map((word, index) => ({
      word,
      frequency: 100 - (index * 5) // Decreasing frequency
    }));
  }

  clearCache(): void {
    this.cache.clear();
    console.log('Word cache cleared');
  }

  getCacheStats(): { [key: string]: { count: number; age: string } } {
    const stats: { [key: string]: { count: number; age: string } } = {};
    
    for (const [key, data] of this.cache.entries()) {
      const ageMs = Date.now() - data.timestamp;
      const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
      const ageMinutes = Math.floor((ageMs % (1000 * 60 * 60)) / (1000 * 60));
      
      stats[key] = {
        count: data.words.length,
        age: `${ageHours}h ${ageMinutes}m`
      };
    }
    
    return stats;
  }
}

// Export singleton instance
export const wordApiService = new WordApiService();
