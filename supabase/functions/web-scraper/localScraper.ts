
import { ScrapingTarget } from './types.ts';
import { extractWordsFromHtml } from './wordValidator.ts';

export class LocalScraper {
  private readonly LOCAL_TARGETS: ScrapingTarget[] = [
    // ONLY use the smallest, fastest sources (removed all large sources)
    { url: 'https://simple.wikipedia.org/wiki/Main_Page', name: 'Simple Wikipedia Main' },
    { url: 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt', name: 'Google 10K Words' },
  ];

  async performLocalScraping(): Promise<{ words: Set<string>; results: Array<{ source: string; wordCount: number; success: boolean }> }> {
    const allWords = new Set<string>();
    const scrapeResults: Array<{ source: string; wordCount: number; success: boolean }> = [];
    const MAX_WORDS_PER_SOURCE = 8000; // Reduced from 15K
    const TIMEOUT = 3000; // Very aggressive timeout

    console.log('Starting ultra-lightweight local scraping...');

    // Process sequentially (safer than parallel)
    for (const target of this.LOCAL_TARGETS) {
      try {
        console.log(`Local scraping: ${target.name}...`);
        
        const response = await fetch(target.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0',
            'Accept': 'text/plain,text/html',
          },
          signal: AbortSignal.timeout(TIMEOUT)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const content = await response.text();
        
        // Strict size limit - only process first 200KB
        const maxContentSize = 200000;
        const processContent = content.length > maxContentSize 
          ? content.substring(0, maxContentSize) 
          : content;
        
        const words = extractWordsFromHtml(processContent);
        
        // Take only first N words
        const limitedWords = words.slice(0, MAX_WORDS_PER_SOURCE);
        limitedWords.forEach(word => allWords.add(word));
        
        scrapeResults.push({
          source: target.name,
          wordCount: limitedWords.length,
          success: true
        });

        console.log(`✓ Local scraped ${limitedWords.length} words from ${target.name}`);
        
        // Stop if we have enough words
        if (allWords.size >= 12000) {
          console.log('✓ Word target reached, stopping early');
          break;
        }
        
      } catch (error) {
        console.error(`✗ ${target.name}: ${error.message}`);
        scrapeResults.push({
          source: target.name,
          wordCount: 0,
          success: false
        });
      }
    }

    console.log(`Local scraping complete: ${allWords.size} unique words from ${scrapeResults.length} sources`);
    return { words: allWords, results: scrapeResults };
  }

  // Disabled discovery - too expensive
  async discoverWordSources(): Promise<ScrapingTarget[]> {
    return [];
  }
}
