
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
    console.log('Starting background ML training service with real web scraping...');
    
    await realMLAnalyzer.initialize();

    this.trainingInterval = setInterval(() => {
      this.performBackgroundTraining();
    }, 30000); // Check every 30 seconds

    await this.performBackgroundTraining();
  }

  private async performBackgroundTraining(): Promise<void> {
    if (this.isTraining) return;
    
    this.isTraining = true;
    console.log('Performing background ML training with real web scraping...');

    try {
      const cachedData = this.cacheService.getCachedData();
      
      // Force fresh scraping if cache is expired or we want to grow the dataset
      if (cachedData && Date.now() < cachedData.expiresAt && cachedData.totalWords > 1000) {
        console.log(`Using cached scraped data: ${cachedData.totalWords} words`);
        this.trainingData = cachedData.words;
      } else {
        console.log('Cache expired or insufficient data, performing fresh web scraping...');
        const scrapedData = await this.webScrapingService.performWebScraping();
        
        if (scrapedData) {
          this.trainingData = scrapedData.words;
          this.cacheService.cacheScrapedData(scrapedData);
          
          console.log(`Real web scraping completed: ${scrapedData.totalWords} words`);
          
          if (scrapedData.fallback) {
            console.warn('Web scraping used fallback data due to network issues');
          } else {
            console.log('Scraping results:', scrapedData.scrapeResults);
          }
        } else {
          this.trainingData = this.fallbackDataService.getExpandedFallbackData();
          console.warn(`Web scraping failed, using expanded fallback: ${this.trainingData.length} words`);
        }
      }
      
      this.trainingData = this.wordQualityService.processTrainingData(this.trainingData);
      
      console.log(`Training completed with ${this.trainingData.length} data points`);
    } catch (error) {
      console.error('Background training failed:', error);
      
      this.trainingData = this.fallbackDataService.getExpandedFallbackData();
      this.trainingData = this.wordQualityService.processTrainingData(this.trainingData);
      
      console.log(`Fallback training completed with ${this.trainingData.length} data points`);
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
    console.log('Background ML training stopped');
  }
}

export const mlTrainingService = new MLTrainingService();
