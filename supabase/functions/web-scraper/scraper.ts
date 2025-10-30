
import { ScrapingTarget, ScrapeResult } from './types.ts';
import { SearchService } from './searchService.ts';
import { LocalScraper } from './localScraper.ts';
import { DynamicSourcesService } from './dynamicSources.ts';
import { EnhancedScraper } from './enhancedScraper.ts';

export class WebScraper {
  private searchService = new SearchService();
  private localScraper = new LocalScraper();
  private dynamicSources = new DynamicSourcesService();
  private enhancedScraper = new EnhancedScraper();

  private cache: { words: Set<string>; timestamp: number } | null = null;
  private readonly CACHE_TTL = 300000; // 5 minute cache (increased from 1 min)

  async scrapeFromTargets(staticTargets: ScrapingTarget[]): Promise<{ words: Set<string>; results: ScrapeResult[] }> {
    // Check cache first - CRITICAL for avoiding repeated heavy scraping
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_TTL) {
      console.log(`✨ Using cached data (${this.cache.words.size} words)`);
      return { 
        words: new Set(this.cache.words), 
        results: [{ source: 'Cache', wordCount: this.cache.words.size, success: true }] 
      };
    }

    const allWords = new Set<string>();
    const scrapeResults: ScrapeResult[] = [];
    const maxExecutionTime = 8000; // Very strict 8 second limit
    const startTime = Date.now();

    console.log('🚀 Starting minimal scraping (local only)...');

    try {
      // ONLY do local scraping - skip everything else
      const localResults = await this.localScraper.performLocalScraping();
      localResults.words.forEach(word => allWords.add(word));
      scrapeResults.push(...localResults.results);
      console.log(`🏠 Local: ${localResults.words.size} words from ${localResults.results.length} sources`);

      // SKIP enhanced scraping entirely - too expensive
      // SKIP dynamic sources - too expensive
      // SKIP search targets - too expensive

    } catch (error) {
      console.error('Scraping error:', error);
    }

    // Update cache with results
    this.updateCache(allWords);

    const totalTime = Date.now() - startTime;
    console.log(`🎯 Scraping complete: ${allWords.size} words in ${totalTime}ms`);
    return { words: allWords, results: scrapeResults };
  }

  private updateCache(words: Set<string>): void {
    this.cache = {
      words: new Set(words),
      timestamp: Date.now()
    };
    console.log(`📦 Cached ${words.size} words for 5 minutes`);
  }

  private async processBatchedTargets(
    targets: ScrapingTarget[], 
    allWords: Set<string>, 
    scrapeResults: ScrapeResult[], 
    remainingTime: number
  ): Promise<void> {
    const batchSize = 5;
    const timePerBatch = remainingTime / Math.ceil(targets.length / batchSize);

    for (let i = 0; i < targets.length; i += batchSize) {
      const batchStartTime = Date.now();
      const batch = targets.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (target) => {
          try {
            const response = await fetch(target.url, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; WordBot/1.0; Educational)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              },
              signal: AbortSignal.timeout(5000) // Reduced timeout
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const html = await response.text();
            const words = this.extractWordsFromHtml(html);
            
            words.forEach(word => allWords.add(word));
            
            scrapeResults.push({
              source: target.name,
              wordCount: words.length,
              success: true
            });

            console.log(`✓ ${words.length} words from ${target.name}`);
            
          } catch (error) {
            console.error(`✗ Failed ${target.name}:`, error.message);
            scrapeResults.push({
              source: target.name,
              wordCount: 0,
              success: false
            });
          }
        })
      );

      // Check if we're running out of time
      if (Date.now() - batchStartTime > timePerBatch) {
        console.log('⏰ Time limit approaching, stopping batch processing');
        break;
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  private async getSearchTargets(): Promise<ScrapingTarget[]> {
    const apiKey = Deno.env.get('BRAVE_SEARCH_API_KEY');
    
    if (apiKey) {
      try {
        return await this.searchService.findWordSources();
      } catch (error) {
        console.warn('Search API failed:', error);
      }
    }
    
    try {
      return await this.localScraper.discoverWordSources();
    } catch (error) {
      console.warn('Local discovery failed:', error);
    }
    
    return [];
  }

  private extractWordsFromHtml(html: string): string[] {
    const words = new Set<string>();
    
    // More efficient extraction
    const textContent = html
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&[^;]+;/g, ' ');
    
    // Single comprehensive pattern
    const matches = textContent.match(/\b[a-zA-Z]{3,9}\b/g) || [];
    
    matches.forEach(word => {
      const cleanWord = word.toUpperCase().trim();
      if (this.isValidWord(cleanWord)) {
        words.add(cleanWord);
      }
    });
    
    return Array.from(words);
  }

  private isValidWord(word: string): boolean {
    if (word.length < 3 || word.length > 9 || !/^[A-Z]+$/.test(word)) return false;
    
    // More permissive vowel check
    if (!/[AEIOU]/.test(word)) return false;
    
    // Less restrictive consonant clustering
    if (/[BCDFGHJKLMNPQRSTVWXYZ]{5,}/.test(word)) return false;
    
    // Allow more repeated patterns
    if (/(.)\1{4,}/.test(word)) return false;
    
    return true;
  }
}
