
import { ScrapingTarget, ScrapeResult } from './types.ts';
import { extractWordsFromHtml } from './wordValidator.ts';
import { SearchService } from './searchService.ts';
import { LocalScraper } from './localScraper.ts';

export class WebScraper {
  private searchService = new SearchService();
  private localScraper = new LocalScraper();

  async scrapeFromTargets(staticTargets: ScrapingTarget[]): Promise<{ words: Set<string>; results: ScrapeResult[] }> {
    const allWords = new Set<string>();
    const scrapeResults: ScrapeResult[] = [];

    console.log('🚀 Starting enhanced web scraping with local fallback...');

    // Try search-based scraping first (if API key available)
    const apiKey = Deno.env.get('BRAVE_SEARCH_API_KEY');
    let searchTargets: ScrapingTarget[] = [];
    
    if (apiKey) {
      console.log('🔍 API key found - using search-enhanced scraping');
      try {
        searchTargets = await this.searchService.findWordSources();
        console.log(`Found ${searchTargets.length} additional targets via search API`);
      } catch (error) {
        console.warn('Search API failed, continuing with local scraping:', error);
      }
    } else {
      console.log('🕷️ No API key - using local spider/scraper fallback');
      
      // Use local discovery to find more sources
      try {
        const discoveredTargets = await this.localScraper.discoverWordSources();
        searchTargets = discoveredTargets;
        console.log(`Discovered ${searchTargets.length} additional targets via local spidering`);
      } catch (error) {
        console.warn('Local discovery failed:', error);
      }
    }

    // Combine all targets: static + search/discovered + local scraper targets
    const allTargets = [
      ...staticTargets,
      ...searchTargets
    ];

    // Add local scraping results regardless of API availability
    console.log('🔄 Performing local scraping for immediate word collection...');
    try {
      const localResults = await this.localScraper.performLocalScraping();
      localResults.words.forEach(word => allWords.add(word));
      scrapeResults.push(...localResults.results);
      console.log(`Local scraping added ${localResults.words.size} words from ${localResults.results.length} sources`);
    } catch (error) {
      console.error('Local scraping failed:', error);
    }

    console.log(`Total scraping targets: ${allTargets.length}`);

    // Scrape from combined targets with high frequency
    for (const target of allTargets) {
      try {
        console.log(`Scraping ${target.name}...`);
        
        const response = await fetch(target.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WordleBot/1.0; Educational use)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive'
          },
          signal: AbortSignal.timeout(8000) // 8 second timeout for faster processing
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();
        const words = extractWordsFromHtml(html);
        
        words.forEach(word => allWords.add(word));
        
        scrapeResults.push({
          source: target.name,
          wordCount: words.length,
          success: true
        });

        console.log(`✓ ${words.length} words from ${target.name}`);
        
        // Very short delay for high-frequency scraping (300ms)
        await new Promise(resolve => setTimeout(resolve, 300));
        
      } catch (error) {
        console.error(`✗ Failed to scrape ${target.name}:`, error);
        scrapeResults.push({
          source: target.name,
          wordCount: 0,
          success: false
        });
      }
    }

    console.log(`🎯 Enhanced scraping complete: ${allWords.size} total words from ${scrapeResults.length} sources`);
    return { words: allWords, results: scrapeResults };
  }
}
