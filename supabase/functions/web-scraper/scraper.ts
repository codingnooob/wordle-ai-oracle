
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

  async scrapeFromTargets(staticTargets: ScrapingTarget[]): Promise<{ words: Set<string>; results: ScrapeResult[] }> {
    const allWords = new Set<string>();
    const scrapeResults: ScrapeResult[] = [];
    const maxExecutionTime = 25000; // 25 seconds to stay within limits
    const startTime = Date.now();

    console.log('🚀 Starting optimized multi-source scraping...');

    try {
      // Phase 1: Quick local scraping (high success rate sources)
      if (Date.now() - startTime < maxExecutionTime * 0.3) {
        const localResults = await this.localScraper.performLocalScraping();
        localResults.words.forEach(word => allWords.add(word));
        scrapeResults.push(...localResults.results);
        console.log(`🏠 Local: ${localResults.words.size} words from ${localResults.results.length} sources`);
      }

      // Phase 2: Enhanced scraping (limited scope for performance)
      if (Date.now() - startTime < maxExecutionTime * 0.6) {
        const dynamicTargets = await this.dynamicSources.getExpandedSources();
        const limitedTargets = dynamicTargets.slice(0, 10); // Limit for performance
        
        const enhancedResults = await this.enhancedScraper.performEnhancedScraping(limitedTargets);
        enhancedResults.words.forEach(word => allWords.add(word));
        scrapeResults.push(...enhancedResults.results);
        console.log(`📚 Enhanced: ${enhancedResults.words.size} words from ${enhancedResults.results.length} sources`);
      }

      // Phase 3: Search-based targets (if time permits)
      if (Date.now() - startTime < maxExecutionTime * 0.8) {
        const searchTargets = await this.getSearchTargets();
        const combinedTargets = [...staticTargets, ...searchTargets].slice(0, 15); // Limit total targets

        await this.processBatchedTargets(combinedTargets, allWords, scrapeResults, maxExecutionTime - (Date.now() - startTime));
      }

    } catch (error) {
      console.error('Phase processing error:', error);
    }

    console.log(`🎯 Multi-phase scraping complete: ${allWords.size} total words from ${scrapeResults.length} sources`);
    return { words: allWords, results: scrapeResults };
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
