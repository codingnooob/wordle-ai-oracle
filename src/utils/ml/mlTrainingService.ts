
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
    console.log('🚀 Starting full corpus ML training service (30-second intervals)...');
    
    await realMLAnalyzer.initialize();

    // Training frequency: every 30 seconds
    this.trainingInterval = setInterval(() => {
      this.performBackgroundTraining();
    }, 30 * 1000);

    // Perform initial training immediately
    await this.performBackgroundTraining();
  }

  private async performBackgroundTraining(): Promise<void> {
    if (this.isTraining) return;
    
    this.isTraining = true;
    const startTime = Date.now();
    console.log('⚡ Full corpus ML training cycle starting...');

    try {
      const cachedData = this.cacheService.getCachedData();
      
      // Check time-based expiration first
      if (cachedData && cachedData.totalWords > 1000) {
        console.log(`📋 Using cached full corpus: ${cachedData.totalWords} words (${Math.floor((Date.now() - cachedData.cachedAt) / 1000)}s old)`);
        if (cachedData.totalScraped) {
          console.log(`📊 Full corpus cache: ${cachedData.totalWords} selected from ${cachedData.totalScraped} total available`);
        }
        this.trainingData = cachedData.words;
      } else {
        console.log('🔄 No valid cache, performing fresh full corpus scraping...');
        
        const scrapedData = await this.webScrapingService.performWebScraping();
        
        if (scrapedData && scrapedData.words.length > 0) {
          this.trainingData = scrapedData.words;
          this.cacheService.cacheScrapedData(scrapedData);
          
          const corpusInfo = scrapedData.totalScraped 
            ? `${scrapedData.totalWords} selected from ${scrapedData.totalScraped} scraped`
            : `${scrapedData.totalWords} words`;
          console.log(`✅ Fresh full corpus: ${corpusInfo}`);
          
          if (scrapedData.fallback) {
            console.warn('⚠️ Using fallback data due to network issues');
          } else {
            const successfulScrapes = scrapedData.scrapeResults.filter(r => r.success).length;
            console.log(`📊 Full corpus scraping: ${successfulScrapes}/${scrapedData.scrapeResults.length} sources successful`);
          }
        } else {
          console.warn('🔄 Full corpus scraping failed, using fallback data');
          this.trainingData = this.fallbackDataService.getExpandedFallbackData();
        }
      }
      
      // Process training data with minimal filtering to preserve full corpus
      const originalCount = this.trainingData.length;
      this.trainingData = this.wordQualityService.processTrainingData(this.trainingData);
      
      const duration = Date.now() - startTime;
      const utilizationRate = originalCount > 0 ? ((this.trainingData.length / originalCount) * 100).toFixed(1) : '0';
      console.log(`⚡ Full corpus training complete: ${originalCount}→${this.trainingData.length} words (${utilizationRate}% retention, ${duration}ms)`);
      
    } catch (error) {
      console.error('❌ Full corpus training cycle failed:', error);
      
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

  getCacheStatus(): { cached: boolean; age?: string; size?: number; totalScraped?: number } {
    return this.cacheService.getCacheStatus();
  }

  clearCache(): void {
    console.log('🗑️ Manually clearing cache to force fresh full corpus data...');
    this.cacheService.clearCache();
  }

  stopBackgroundTraining(): void {
    if (this.trainingInterval) {
      clearInterval(this.trainingInterval);
      this.trainingInterval = null;
    }
    console.log('🛑 Full corpus ML training stopped');
  }
}

export const mlTrainingService = new MLTrainingService();
