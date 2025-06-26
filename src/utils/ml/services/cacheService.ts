
interface ScrapedData {
  words: string[];
  totalWords: number;
  totalScraped?: number; // Added to track total scraped words
  scrapeResults: Array<{ source: string; wordCount: number; success: boolean }>;
  timestamp: string;
  fallback?: boolean;
}

interface CachedScrapedData extends ScrapedData {
  cachedAt: number;
  expiresAt: number;
}

export class CacheService {
  private readonly CACHE_KEY = 'ml_scraped_data';
  private readonly CACHE_DURATION = 30 * 1000; // 30 seconds

  getCachedData(): CachedScrapedData | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;
      
      const data = JSON.parse(cached) as CachedScrapedData;
      
      if (!data.words || !Array.isArray(data.words) || !data.expiresAt) {
        console.log('🗂️ Invalid cache data structure, clearing cache');
        this.clearCache();
        return null;
      }
      
      // Check if cache is expired (prioritize time over word count)
      const now = Date.now();
      if (now >= data.expiresAt) {
        console.log(`🗂️ Cache expired (${Math.floor((now - data.cachedAt) / 1000)}s old), clearing old data`);
        this.clearCache();
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      this.clearCache();
      return null;
    }
  }

  cacheScrapedData(data: ScrapedData): void {
    try {
      const now = Date.now();
      const cachedData: CachedScrapedData = {
        ...data,
        cachedAt: now,
        expiresAt: now + this.CACHE_DURATION
      };
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cachedData));
      const scrapedInfo = data.totalScraped ? `${data.totalWords} selected from ${data.totalScraped} scraped` : `${data.totalWords} words`;
      console.log(`🗂️ Cached ${scrapedInfo} for 30 seconds (expires at ${new Date(cachedData.expiresAt).toLocaleTimeString()})`);
    } catch (error) {
      console.error('Failed to cache scraped data:', error);
    }
  }

  getCacheStatus(): { cached: boolean; age?: string; size?: number; totalScraped?: number } {
    const cached = this.getCachedData();
    
    if (!cached) {
      return { cached: false };
    }
    
    const now = Date.now();
    const ageMs = now - cached.cachedAt;
    const ageSeconds = Math.floor(ageMs / 1000);
    const isExpired = now >= cached.expiresAt;
    
    return {
      cached: !isExpired,
      age: `${ageSeconds}s`,
      size: cached.totalWords,
      totalScraped: cached.totalScraped
    };
  }

  clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('🗑️ Scraped data cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}
