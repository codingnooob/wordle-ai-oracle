
import { realMLAnalyzer } from './realMLAnalyzer';
import { WebScrapingService } from './services/webScrapingService';
import { CacheService } from './services/cacheService';
import { FallbackDataService } from './services/fallbackDataService';
import { WordQualityService } from './services/wordQualityService';

export class MLTrainingService {
  private trainingInterval: NodeJS.Timeout | null = null;
  private isTraining = false;
  private trainingData: string[] = [];

  private webScrapingService = new WebScrapingService();
  private cacheService = new CacheService();
  private fallbackDataService = new FallbackDataService();
  private wordQualityService = new WordQualityService();

  async startBackgroundTraining(): Promise<void> {
    console.log('🚀 Starting optimized ML training service (30-second intervals)...');
    
    await realMLAnalyzer.initialize();

    // Optimized training frequency: every 30 seconds
    this.trainingInterval = setInterval(() => {
      this.performBackgroundTraining();
    }, 30 * 1000); // 30 seconds for better performance

    // Perform initial training immediately
    await this.performBackgroundTraining();
  }

  private async performBackgroundTraining(): Promise<void> {
    if (this.isTraining) return;
    
    this.isTraining = true;
    const startTime = Date.now();
    console.log('⚡ Optimized ML training cycle starting...');

    try {
      const cachedData = this.cacheService.getCachedData();
      const now = Date.now();
      
      // FIXED: Check time-based expiration first, regardless of word count
      const isCacheExpired = !cachedData || now >= cachedData.expiresAt;
      
      if (!isCacheExpired && cachedData.totalWords > 1000) {
        const ageMs = now - cachedData.cachedAt;
        const ageSeconds = Math.floor(ageMs / 1000);
        console.log(`📋 Using valid cached data: ${cachedData.totalWords} words (${ageSeconds}s old)`);
        this.trainingData = cachedData.words;
      } else {
        if (cachedData) {
          const ageMs = now - cachedData.cachedAt;
          const ageSeconds = Math.floor(ageMs / 1000);
          console.log(`🔄 Cache expired (${ageSeconds}s old), performing fresh scraping...`);
        } else {
          console.log('🔄 No cached data, performing fresh scraping...');
        }
        
        const scrapedData = await this.webScrapingService.performWebScraping();
        
        if (scrapedData && scrapedData.words.length > 0) {
          this.trainingData = scrapedData.words;
          this.cacheService.cacheScrapedData(scrapedData);
          
          console.log(`✅ Fresh scraping: ${scrapedData.totalWords} words (up from cached data)`);
          
          if (scrapedData.fallback) {
            console.warn('⚠️ Using fallback data due to network issues');
          } else {
            const successfulScrapes = scrapedData.scrapeResults.filter(r => r.success).length;
            console.log(`📊 Scraping results: ${successfulScrapes}/${scrapedData.scrapeResults.length} sources successful`);
          }
        } else {
          console.warn('🔄 Fresh scraping failed, using fallback data');
          this.trainingData = this.fallbackDataService.getExpandedFallbackData();
        }
      }
      
      // Process and validate training data with less aggressive filtering
      const originalCount = this.trainingData.length;
      this.trainingData = this.wordQualityService.processTrainingData(this.trainingData);
      
      const duration = Date.now() - startTime;
      console.log(`⚡ Training cycle complete: ${originalCount}→${this.trainingData.length} words (${duration}ms)`);
      
    } catch (error) {
      console.error('❌ Training cycle failed:', error);
      
      this.trainingData = this.fallbackDataService.getExpandedFallbackData();
      this.trainingData = this.wordQualityService.processTrainingData(this.trainingData);
      
      const duration = Date.now() - startTime;
      console.log(`🔄 Fallback training: ${this.trainingData.length} words (${duration}ms)`);
    } finally {
      this.isTraining = false;
    }
  }

  getTrainingDataSize(): number {
    return this.trainingData.length;
  }

  getCacheStatus(): { cached: boolean; age?: string; size?: number } {
    return this.cacheService.getCacheStatus();
  }

  clearCache(): void {
    console.log('🗑️ Manually clearing cache to force fresh data...');
    this.cacheService.clearCache();
  }

  stopBackgroundTraining(): void {
    if (this.trainingInterval) {
      clearInterval(this.trainingInterval);
      this.trainingInterval = null;
    }
    console.log('🛑 Optimized ML training stopped');
  }
}

export const mlTrainingService = new MLTrainingService();
