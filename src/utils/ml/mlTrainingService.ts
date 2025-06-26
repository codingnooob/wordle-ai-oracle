
import { WebScrapingService } from './services/webScrapingService';
import { WordQualityService } from './services/wordQualityService';
import { CacheService } from './services/cacheService';
import { realMLAnalyzer } from './realMLAnalyzer';
import { SecurityUtils } from '../security/securityUtils';

export class MLTrainingService {
  private webScrapingService = new WebScrapingService();
  private wordQualityService = new WordQualityService();
  private cacheService = new CacheService();
  private isTraining = false;
  private backgroundInterval: NodeJS.Timeout | null = null;
  private trainingDataSize = 0;

  async performFullCorpusTraining(): Promise<{
    success: boolean;
    wordCount: number;
    duration: number;
    fromCache: boolean;
  }> {
    if (this.isTraining) {
      SecurityUtils.secureLog('Training already in progress, skipping...');
      return { success: false, wordCount: 0, duration: 0, fromCache: false };
    }

    this.isTraining = true;
    const startTime = Date.now();

    try {
      SecurityUtils.secureLog('Full corpus ML training cycle starting...');

      // Try to get cached data first
      const cachedData = this.cacheService.getCachedData();
      let scrapedWords: string[];
      let fromCache = false;

      if (cachedData) {
        const cacheAge = Math.floor((Date.now() - new Date(cachedData.timestamp).getTime()) / 1000);
        SecurityUtils.secureLog(`Using cached full corpus: ${cachedData.words.length} words (${cacheAge}s old)`);
        SecurityUtils.secureLog(`Full corpus cache: ${cachedData.words.length} selected from ${cachedData.totalWords} total available`);
        scrapedWords = cachedData.words;
        fromCache = true;
      } else {
        SecurityUtils.secureLog('No valid cache, performing fresh full corpus scraping...');
        const scrapedData = await this.webScrapingService.performWebScraping();
        
        if (!scrapedData) {
          throw new Error('Failed to obtain scraped data');
        }

        this.cacheService.cacheScrapedData(scrapedData);
        scrapedWords = scrapedData.words;
        
        SecurityUtils.secureLog(`Fresh full corpus: ${scrapedData.words.length} selected from ${scrapedData.totalWords} scraped`);
        SecurityUtils.secureLog(`Full corpus scraping: ${scrapedData.scrapeResults.filter(r => r.success).length}/${scrapedData.scrapeResults.length} sources successful`);
      }

      // Process the full corpus for training with security validation
      const processedWords = this.wordQualityService.processTrainingData(scrapedWords);
      
      // Update the ML analyzer with the real word corpus
      realMLAnalyzer.updateCorpus(processedWords);
      
      // Update training data size
      this.trainingDataSize = processedWords.length;

      const duration = Date.now() - startTime;
      const retentionRate = ((processedWords.length / scrapedWords.length) * 100).toFixed(1);
      
      SecurityUtils.secureLog(`Full corpus training complete: ${scrapedWords.length}→${processedWords.length} words (${retentionRate}% retention, ${duration}ms)`);

      return {
        success: true,
        wordCount: processedWords.length,
        duration,
        fromCache
      };

    } catch (error) {
      SecurityUtils.secureLog('Full corpus training failed:', error, 'error');
      return { success: false, wordCount: 0, duration: Date.now() - startTime, fromCache: false };
    } finally {
      this.isTraining = false;
    }
  }

  startBackgroundTraining(): void {
    if (this.backgroundInterval) {
      SecurityUtils.secureLog('Background training already running');
      return;
    }

    SecurityUtils.secureLog('Starting background ML training...');
    
    // Start immediately
    this.performFullCorpusTraining();
    
    // Then run every 30 seconds
    this.backgroundInterval = setInterval(() => {
      this.performFullCorpusTraining();
    }, 30000);
  }

  stopBackgroundTraining(): void {
    if (this.backgroundInterval) {
      clearInterval(this.backgroundInterval);
      this.backgroundInterval = null;
      SecurityUtils.secureLog('Background ML training stopped');
    }
  }

  getTrainingDataSize(): number {
    return this.trainingDataSize;
  }

  getTrainingStatus() {
    return {
      isTraining: this.isTraining,
      cacheStatus: this.cacheService.getCacheStatus()
    };
  }
}

export const mlTrainingService = new MLTrainingService();
