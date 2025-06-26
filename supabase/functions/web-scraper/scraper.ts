
import { ScrapingTarget, ScrapeResult } from './types.ts';
import { extractWordsFromHtml } from './wordValidator.ts';

export class WebScraper {
  async scrapeFromTargets(targets: ScrapingTarget[]): Promise<{ words: Set<string>; results: ScrapeResult[] }> {
    const allWords = new Set<string>();
    const scrapeResults: ScrapeResult[] = [];

    // Scrape from each target
    for (const target of targets) {
      try {
        console.log(`Scraping ${target.name}...`);
        
        const response = await fetch(target.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WordleBot/1.0; Educational use)',
          },
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

        console.log(`Successfully scraped ${words.length} words from ${target.name}`);
        
        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Failed to scrape ${target.name}:`, error);
        scrapeResults.push({
          source: target.name,
          wordCount: 0,
          success: false
        });
      }
    }

    return { words: allWords, results: scrapeResults };
  }
}
