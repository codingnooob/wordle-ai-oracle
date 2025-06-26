
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

    console.log('🚀 Starting MASSIVELY enhanced web scraping...');

    // Get all possible sources
    const [searchTargets, dynamicTargets] = await Promise.all([
      this.getSearchTargets(),
      this.dynamicSources.getExpandedSources()
    ]);

    // Local scraping with enhanced discovery
    const localResults = await this.localScraper.performLocalScraping();
    localResults.words.forEach(word => allWords.add(word));
    scrapeResults.push(...localResults.results);
    console.log(`🏠 Local scraping: ${localResults.words.size} words from ${localResults.results.length} sources`);

    // Enhanced scraping on dynamic sources (books, news, educational)
    const enhancedResults = await this.enhancedScraper.performEnhancedScraping(dynamicTargets);
    enhancedResults.words.forEach(word => allWords.add(word));
    scrapeResults.push(...enhancedResults.results);
    console.log(`📚 Enhanced scraping: ${enhancedResults.words.size} words from ${enhancedResults.results.length} sources`);

    // Combine all remaining targets
    const allTargets = [
      ...staticTargets,
      ...searchTargets
    ];

    console.log(`📊 Processing ${allTargets.length} additional targets...`);

    // High-speed scraping of remaining targets
    for (const target of allTargets) {
      try {
        const response = await fetch(target.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WordBot/1.0; Educational)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive'
          },
          signal: AbortSignal.timeout(8000)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();
        const words = this.extractWordsFromHtml(html);
        
        words.forEach(word => allWords.add(word));
        
        scrapeResults.push({
          source: target.name,
          wordCount: words.length,
          success: true
        });

        console.log(`✓ ${words.length} words from ${target.name}`);
        
        // Ultra-short delay for maximum frequency
        await new Promise(resolve => setTimeout(resolve, 150));
        
      } catch (error) {
        console.error(`✗ Failed to scrape ${target.name}:`, error);
        scrapeResults.push({
          source: target.name,
          wordCount: 0,
          success: false
        });
      }
    }

    console.log(`🎯 MASSIVE scraping complete: ${allWords.size} total words from ${scrapeResults.length} sources`);
    return { words: allWords, results: scrapeResults };
  }

  private async getSearchTargets(): Promise<ScrapingTarget[]> {
    const apiKey = Deno.env.get('BRAVE_SEARCH_API_KEY');
    
    if (apiKey) {
      console.log('🔍 Using search API for additional targets');
      try {
        return await this.searchService.findWordSources();
      } catch (error) {
        console.warn('Search API failed:', error);
      }
    } else {
      console.log('🕷️ Using local discovery for additional targets');
      try {
        return await this.localScraper.discoverWordSources();
      } catch (error) {
        console.warn('Local discovery failed:', error);
      }
    }
    
    return [];
  }

  private extractWordsFromHtml(html: string): string[] {
    const words = new Set<string>();
    
    // Enhanced extraction with multiple passes
    const textContent = html
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&[^;]+;/g, ' ');
    
    // Multiple word extraction patterns
    const patterns = [
      /\b[a-zA-Z]{3,8}\b/g,  // Standard words
      /[A-Z][a-z]{2,7}\b/g,  // Capitalized words
      /\b[a-z]{3,8}(?=\s)/g  // Words followed by space
    ];
    
    patterns.forEach(pattern => {
      const matches = textContent.match(pattern) || [];
      matches.forEach(word => {
        const cleanWord = word.toUpperCase().trim();
        if (this.isValidWord(cleanWord)) {
          words.add(cleanWord);
        }
      });
    });
    
    return Array.from(words);
  }

  private isValidWord(word: string): boolean {
    if (word.length < 3 || word.length > 8 || !/^[A-Z]+$/.test(word)) return false;
    if (!/[AEIOU]/.test(word)) return false;
    if (/[BCDFGHJKLMNPQRSTVWXYZ]{4,}/.test(word)) return false;
    if (/^[XZ]/.test(word)) return false;
    if (/(.)\1{2,}/.test(word)) return false;
    return true;
  }
}
