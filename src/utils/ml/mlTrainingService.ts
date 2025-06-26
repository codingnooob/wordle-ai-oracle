
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
    console.log('🚀 Starting high-frequency ML training service (30-second intervals)...');
    
    await realMLAnalyzer.initialize();

    // High-frequency training: every 30 seconds!
    this.trainingInterval = setInterval(() => {
      this.performBackgroundTraining();
    }, 30 * 1000); // 30 seconds

    // Perform initial training immediately
    await this.performBackgroundTraining();
  }

  private async performBackgroundTraining(): Promise<void> {
    if (this.isTraining) return;
    
    this.isTraining = true;
    const startTime = Date.now();
    console.log('⚡ High-frequency ML training cycle starting...');

    try {
      const cachedData = this.cacheService.getCachedData();
      
      // With 5-minute cache, we refresh frequently but not wastefully
      if (cachedData && Date.now() < cachedData.expiresAt && cachedData.totalWords > 500) {
        const ageMs = Date.now() - cachedData.cachedAt;
        const ageSeconds = Math.floor(ageMs / 1000);
        console.log(`📋 Using cached data: ${cachedData.totalWords} words (${ageSeconds}s old)`);
        this.trainingData = cachedData.words;
      } else {
        console.log('🔄 Cache expired/insufficient, performing fresh scraping...');
        const scrapedData = await this.webScrapingService.performWebScraping();
        
        if (scrapedData) {
          this.trainingData = scrapedData.words;
          this.cacheService.cacheScrapedData(scrapedData);
          
          console.log(`✅ Fresh scraping: ${scrapedData.totalWords} words`);
          
          if (scrapedData.fallback) {
            console.warn('⚠️ Using fallback data due to network issues');
          } else {
            const successfulScrapes = scrapedData.scrapeResults.filter(r => r.success).length;
            console.log(`📊 Scraping results: ${successfulScrapes}/${scrapedData.scrapeResults.length} sources successful`);
          }
        } else {
          this.trainingData = this.fallbackDataService.getExpandedFallbackData();
          console.warn(`🔄 Scraping failed, using fallback: ${this.trainingData.length} words`);
        }
      }
      
      // Process and validate training data
      this.trainingData = this.wordQualityService.processTrainingData(this.trainingData);
      
      const duration = Date.now() - startTime;
      console.log(`⚡ High-freq training cycle complete: ${this.trainingData.length} words (${duration}ms)`);
      
    } catch (error) {
      console.error('❌ High-frequency training failed:', error);
      
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
    this.cacheService.clearCache();
  }

  stopBackgroundTraining(): void {
    if (this.trainingInterval) {
      clearInterval(this.trainingInterval);
      this.trainingInterval = null;
    }
    console.log('🛑 High-frequency ML training stopped');
  }
}

export const mlTrainingService = new MLTrainingService();
