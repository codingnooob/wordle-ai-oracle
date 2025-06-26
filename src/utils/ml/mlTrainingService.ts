import { realMLAnalyzer } from './realMLAnalyzer';
import { supabase } from '@/integrations/supabase/client';

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

export class MLTrainingService {
  private trainingInterval: NodeJS.Timeout | null = null;
  private isTraining = false;
  private trainingData: string[] = [];
  private readonly CACHE_KEY = 'ml_scraped_data';
  private readonly CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours instead of 24
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 5000;

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
      const cachedData = this.getCachedData();
      
      // Force fresh scraping if cache is expired or we want to grow the dataset
      if (cachedData && Date.now() < cachedData.expiresAt && cachedData.totalWords > 1000) {
        console.log(`Using cached scraped data: ${cachedData.totalWords} words`);
        this.trainingData = cachedData.words;
      } else {
        console.log('Cache expired or insufficient data, performing fresh web scraping...');
        const scrapedData = await this.performWebScraping();
        
        if (scrapedData) {
          this.trainingData = scrapedData.words;
          this.cacheScrapedData(scrapedData);
          
          console.log(`Real web scraping completed: ${scrapedData.totalWords} words`);
          
          if (scrapedData.fallback) {
            console.warn('Web scraping used fallback data due to network issues');
          } else {
            console.log('Scraping results:', scrapedData.scrapeResults);
          }
        } else {
          this.trainingData = this.getExpandedFallbackData();
          console.warn(`Web scraping failed, using expanded fallback: ${this.trainingData.length} words`);
        }
      }
      
      this.processTrainingData();
      
      console.log(`Training completed with ${this.trainingData.length} data points`);
    } catch (error) {
      console.error('Background training failed:', error);
      
      this.trainingData = this.getExpandedFallbackData();
      this.processTrainingData();
      
      console.log(`Fallback training completed with ${this.trainingData.length} data points`);
    } finally {
      this.isTraining = false;
    }
  }

  private async performWebScraping(attempt = 1): Promise<ScrapedData | null> {
    try {
      console.log(`Attempting web scraping (attempt ${attempt}/${this.MAX_RETRY_ATTEMPTS})...`);
      
      const { data, error } = await supabase.functions.invoke('web-scraper', {
        body: { maxWords: 10000 } // Increase word limit
      });

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data || !data.words || !Array.isArray(data.words)) {
        throw new Error('Invalid response format from web scraper');
      }

      return data as ScrapedData;
      
    } catch (error) {
      console.error(`Web scraping attempt ${attempt} failed:`, error);
      
      if (attempt < this.MAX_RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt));
        return this.performWebScraping(attempt + 1);
      }
      
      return null;
    }
  }

  private getCachedData(): CachedScrapedData | null {
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

  private cacheScrapedData(data: ScrapedData): void {
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

  getTrainingDataSize(): number {
    return this.trainingData.length;
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

  stopBackgroundTraining(): void {
    if (this.trainingInterval) {
      clearInterval(this.trainingInterval);
      this.trainingInterval = null;
    }
    console.log('Background ML training stopped');
  }

  private getExpandedFallbackData(): string[] {
    const fallbackSentences = [
      "English language vocabulary consists of many common words used in daily communication and writing",
      "Five letter words are particularly common in word games and puzzles like Wordle Scrabble and crosswords",
      "The most frequent letters in English text are E T A O I N S H R D L U based on linguistic analysis",
      "Common word patterns include consonant vowel combinations that form readable and pronounceable words",
      "Dictionary validation ensures that generated words are legitimate English vocabulary items found in standard references",
      
      "Classic literature contains thousands of common English words that readers encounter in novels poetry and prose",
      "Newspaper articles magazine stories and online content provide excellent sources of contemporary word usage patterns",
      "Educational materials textbooks and academic writing demonstrate formal vocabulary and technical terminology usage",
      "Conversational speech everyday dialogue and informal communication reveal the most frequently used spoken words",
      "Business communication professional writing and formal correspondence showcase workplace vocabulary and industry terms",
      
      "Nouns represent people places things and concepts while verbs describe actions states and processes",
      "Adjectives modify and describe nouns providing color size shape emotion and other descriptive qualities",
      "Adverbs modify verbs adjectives and other adverbs indicating manner time place degree and frequency",
      "Prepositions show relationships between words indicating location direction time and other spatial temporal connections",
      "Conjunctions connect words phrases and clauses creating complex sentences and joining related ideas together",
      
      "Common prefixes include anti auto inter multi over under which modify root words meanings",
      "Frequent suffixes like able ible tion sion ness ment ly transform words into different parts speech",
      "Silent letters appear in words like knife thumb lamb comb where certain letters remain unpronounced",
      "Double consonants occur in words like letter better running swimming when adding suffixes to root words",
      "Vowel combinations create unique sounds in words like bread break great steak though throughought",
      
      "Latin roots form the basis of many English words especially in academic scientific and medical terminology",
      "Greek origins contribute to technical vocabulary particularly in science mathematics and philosophy related fields",
      "Germanic foundations provide many basic everyday words including articles pronouns and common verbs nouns",
      "French influences appear in cuisine fashion art and cultural vocabulary brought through historical language contact",
      "Modern borrowings from various languages continue to expand English vocabulary through globalization and technology"
    ];
    
    const words = new Set<string>();
    
    fallbackSentences.forEach(sentence => {
      const sentenceWords = sentence
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length >= 3 && word.length <= 8)
        .filter(word => /^[a-z]+$/.test(word))
        .map(word => word.toUpperCase());
        
      sentenceWords.forEach(word => words.add(word));
    });
    
    const categoryWords = [
      'HOUSE', 'WATER', 'PAPER', 'STORY', 'POINT', 'WORLD', 'MUSIC', 'HEART', 'COLOR', 'LIGHT',
      'MONEY', 'MONTH', 'SOUND', 'NIGHT', 'POWER', 'PLACE', 'FIELD', 'VOICE', 'THING', 'FRIEND',
      'THINK', 'SPEAK', 'LEARN', 'TEACH', 'WRITE', 'DRIVE', 'SLEEP', 'DANCE', 'LAUGH', 'SMILE',
      'WATCH', 'LISTEN', 'TRAVEL', 'CHANGE', 'CREATE', 'DELIVER', 'MANAGE', 'HANDLE', 'FINISH', 'START',
      'HAPPY', 'QUICK', 'SMART', 'FUNNY', 'BRIGHT', 'CLEAR', 'CLEAN', 'FRESH', 'SHARP', 'SMOOTH',
      'STRONG', 'GENTLE', 'SIMPLE', 'COMPLEX', 'MODERN', 'ANCIENT', 'RECENT', 'FUTURE', 'CURRENT', 'FINAL',
      'PHONE', 'EMAIL', 'SOCIAL', 'MEDIA', 'ONLINE', 'SEARCH', 'CLICK', 'SCROLL', 'SWIPE', 'TOUCH',
      'SCREEN', 'DEVICE', 'BATTERY', 'CHARGE', 'CONNECT', 'NETWORK', 'SERVER', 'CLOUD', 'BACKUP', 'UPDATE'
    ];
    
    categoryWords.forEach(word => words.add(word));
    
    return Array.from(words);
  }

  private processTrainingData(): void {
    this.trainingData = [...new Set(this.trainingData)]
      .filter(word => this.isQualityWord(word));
  }

  private isQualityWord(word: string): boolean {
    if (word.length < 3 || word.length > 8) return false;
    if (!/^[A-Z]+$/.test(word)) return false;
    
    const vowels = 'AEIOU';
    const vowelCount = word.split('').filter(char => vowels.includes(char)).length;
    if (vowelCount === 0) return false;
    
    const vowelRatio = vowelCount / word.length;
    if (vowelRatio < 0.15 || vowelRatio > 0.8) return false;
    
    if (/[BCDFGHJKLMNPQRSTVWXYZ]{4,}/.test(word)) return false;
    if (/^[XZ]/.test(word)) return false;
    if (/(.)\1{2,}/.test(word)) return false;
    
    return true;
  }
}

export const mlTrainingService = new MLTrainingService();
