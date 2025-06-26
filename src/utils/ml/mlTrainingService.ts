
import { WebScrapingService } from './services/webScrapingService';
import { WordQualityService } from './services/wordQualityService';
import { CacheService } from './services/cacheService';
import { realMLAnalyzer } from './realMLAnalyzer';

export class MLTrainingService {
  private webScrapingService = new WebScrapingService();
  private wordQualityService = new WordQualityService();
  private cacheService = new CacheService();
  private isTraining = false;

  async performFullCorpusTraining(): Promise<{
    success: boolean;
    wordCount: number;
    duration: number;
    fromCache: boolean;
  }> {
    if (this.isTraining) {
      console.log('⏳ Training already in progress, skipping...');
      return { success: false, wordCount: 0, duration: 0, fromCache: false };
    }

    this.isTraining = true;
    const startTime = Date.now();

    try {
      console.log('⚡ Full corpus ML training cycle starting...');

      // Try to get cached data first
      const cachedData = this.cacheService.getCachedScrapedData();
      let scrapedWords: string[];
      let fromCache = false;

      if (cachedData) {
        console.log(`📋 Using cached full corpus: ${cachedData.words.length} words (${Math.floor((Date.now() - new Date(cachedData.timestamp).getTime()) / 1000)}s old)`);
        console.log(`📊 Full corpus cache: ${cachedData.words.length} selected from ${cachedData.totalWords} total available`);
        scrapedWords = cachedData.words;
        fromCache = true;
      } else {
        console.log('🔄 No valid cache, performing fresh full corpus scraping...');
        const scrapedData = await this.webScrapingService.performWebScraping();
        
        if (!scrapedData) {
          throw new Error('Failed to obtain scraped data');
        }

        this.cacheService.setCachedScrapedData(scrapedData);
        scrapedWords = scrapedData.words;
        
        console.log(`✅ Fresh full corpus: ${scrapedData.words.length} selected from ${scrapedData.totalWords} scraped`);
        console.log(`📊 Full corpus scraping: ${scrapedData.scrapeResults.filter(r => r.success).length}/${scrapedData.scrapeResults.length} sources successful`);
      }

      // Process the full corpus for training
      const processedWords = this.wordQualityService.processTrainingData(scrapedWords);
      
      // Update the ML analyzer with the real word corpus
      realMLAnalyzer.updateCorpus(processedWords);

      const duration = Date.now() - startTime;
      const retentionRate = ((processedWords.length / scrapedWords.length) * 100).toFixed(1);
      
      console.log(`⚡ Full corpus training complete: ${scrapedWords.length}→${processedWords.length} words (${retentionRate}% retention, ${duration}ms)`);

      return {
        success: true,
        wordCount: processedWords.length,
        duration,
        fromCache
      };

    } catch (error) {
      console.error('❌ Full corpus training failed:', error);
      return { success: false, wordCount: 0, duration: Date.now() - startTime, fromCache: false };
    } finally {
      this.isTraining = false;
    }
  }

  getTrainingStatus() {
    return {
      isTraining: this.isTraining,
      cacheStatus: this.cacheService.getCacheStatus()
    };
  }
}

export const mlTrainingService = new MLTrainingService();
