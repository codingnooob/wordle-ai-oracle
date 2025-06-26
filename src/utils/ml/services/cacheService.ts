
interface ScrapedData {
  words: string[];
  totalWords: number;
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
  private readonly CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

  getCachedData(): CachedScrapedData | null {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (!cached) return null;
      
      const data = JSON.parse(cached) as CachedScrapedData;
      
      if (!data.words || !Array.isArray(data.words) || !data.expiresAt) {
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }

  cacheScrapedData(data: ScrapedData): void {
    try {
      const cachedData: CachedScrapedData = {
        ...data,
        cachedAt: Date.now(),
        expiresAt: Date.now() + this.CACHE_DURATION
      };
      
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cachedData));
      console.log(`Cached ${data.totalWords} words for 6 hours`);
    } catch (error) {
      console.error('Failed to cache scraped data:', error);
    }
  }

  getCacheStatus(): { cached: boolean; age?: string; size?: number } {
    const cached = this.getCachedData();
    
    if (!cached) {
      return { cached: false };
    }
    
    const ageMs = Date.now() - cached.cachedAt;
    const ageHours = Math.floor(ageMs / (1000 * 60 * 60));
    const ageMinutes = Math.floor((ageMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return {
      cached: Date.now() < cached.expiresAt,
      age: `${ageHours}h ${ageMinutes}m`,
      size: cached.totalWords
    };
  }

  clearCache(): void {
    try {
      localStorage.removeItem(this.CACHE_KEY);
      console.log('Scraped data cache cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
}
