
import { ScrapingTarget } from './types.ts';
import { extractWordsFromHtml } from './wordValidator.ts';

export class LocalScraper {
  private readonly LOCAL_TARGETS: ScrapingTarget[] = [
    // High-success educational and dictionary sites
    { url: 'https://simple.wikipedia.org/wiki/Main_Page', name: 'Simple Wikipedia Main' },
    { url: 'https://www.vocabulary.com/lists/52473', name: 'Vocabulary.com Common Words' },
    
    // Smaller, manageable word list (10K words instead of 370K)
    { url: 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt', name: 'Google 10K Words' },
    
    // Alternative reliable sources
    { url: 'https://www.ef.com/wwen/english-resources/english-vocabulary/', name: 'EF English Vocabulary' },
    { url: 'https://simple.wikipedia.org/wiki/Oxford_English_Dictionary', name: 'Simple Wiki Dictionary' },
    
    // NOTE: Removed massive word lists that exceed resource limits:
    // - words_alpha.txt (370K+ words, several MB) was causing WORKER_LIMIT errors
  ];

  async performLocalScraping(): Promise<{ words: Set<string>; results: Array<{ source: string; wordCount: number; success: boolean }> }> {
    const allWords = new Set<string>();
    const scrapeResults: Array<{ source: string; wordCount: number; success: boolean }> = [];
    const MAX_WORDS_PER_SOURCE = 15000; // Limit words per source to prevent memory issues

    console.log('Starting optimized local web scraping...');

    // Process targets in parallel batches with smaller batch size
    const batchSize = 2; // Reduced from 3
    for (let i = 0; i < this.LOCAL_TARGETS.length; i += batchSize) {
      const batch = this.LOCAL_TARGETS.slice(i, i + batchSize);
      
      await Promise.allSettled(
        batch.map(async (target) => {
          try {
            console.log(`Local scraping: ${target.name}...`);
            
            const response = await fetch(target.url, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; WordleBot/1.0; Educational use)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7',
                'Accept-Language': 'en-US,en;q=0.5',
                'Connection': 'keep-alive',
              },
              signal: AbortSignal.timeout(6000) // Reduced from 8000
            });

            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const content = await response.text();
            
            // Safety check: if content is too large, only process first part
            const maxContentSize = 500000; // 500KB max
            const processContent = content.length > maxContentSize 
              ? content.substring(0, maxContentSize) 
              : content;
            
            const words = extractWordsFromHtml(processContent);
            
            // Limit words per source to prevent memory issues
            const limitedWords = words.slice(0, MAX_WORDS_PER_SOURCE);
            limitedWords.forEach(word => allWords.add(word));
            
            scrapeResults.push({
              source: target.name,
              wordCount: limitedWords.length,
              success: true
            });

            console.log(`✓ Local scraped ${limitedWords.length} words from ${target.name}`);
            
          } catch (error) {
            console.error(`✗ Local scraping failed for ${target.name}:`, error.message);
            scrapeResults.push({
              source: target.name,
              wordCount: 0,
              success: false
            });
          }
        })
      );
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100)); // Reduced from 200
    }

    console.log(`Local scraping complete: ${allWords.size} unique words from ${scrapeResults.length} sources`);
    return { words: allWords, results: scrapeResults };
  }

  // Simplified discovery for better performance
  async discoverWordSources(seedUrls: string[] = []): Promise<ScrapingTarget[]> {
    const discoveredTargets: ScrapingTarget[] = [];
    const processedUrls = new Set<string>();

    // Use only the most reliable seed URLs
    const startUrls = seedUrls.length > 0 ? seedUrls : [
      'https://simple.wikipedia.org/wiki/Main_Page',
      'https://www.vocabulary.com/lists/52473'
    ];

    for (const url of startUrls.slice(0, 2)) { // Limit to 2 seed URLs
      if (processedUrls.has(url)) continue;
      processedUrls.add(url);

      try {
        console.log(`Discovering links from: ${url}`);
        
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WordleBot/1.0; Educational use)' },
          signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) continue;

        const html = await response.text();
        
        // Extract promising links
        const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
        let match;
        let linkCount = 0;
        
        while ((match = linkRegex.exec(html)) !== null && linkCount < 10) { // Limit discoveries
          const linkUrl = match[1];
          const linkText = match[2].toLowerCase();
          
          if (this.isWordRelatedLink(linkUrl, linkText)) {
            const fullUrl = this.resolveUrl(linkUrl, url);
            if (fullUrl && !processedUrls.has(fullUrl)) {
              discoveredTargets.push({
                url: fullUrl,
                name: `Discovered: ${match[2].trim()}`
              });
              linkCount++;
            }
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`Discovery failed for ${url}:`, error);
      }
    }

    console.log(`Discovered ${discoveredTargets.length} additional word sources`);
    return discoveredTargets.slice(0, 5); // Limit discoveries
  }

  private isWordRelatedLink(url: string, text: string): boolean {
    const wordKeywords = [
      'word', 'vocabulary', 'dictionary', 'english', 'language',
      'spelling', 'list', 'common', 'frequent', 'basic'
    ];
    
    const urlLower = url.toLowerCase();
    const textLower = text.toLowerCase();
    
    return wordKeywords.some(keyword => 
      urlLower.includes(keyword) || textLower.includes(keyword)
    ) && !urlLower.includes('image') && !urlLower.includes('video');
  }

  private resolveUrl(url: string, baseUrl: string): string | null {
    try {
      if (url.startsWith('http')) return url;
      if (url.startsWith('//')) return 'https:' + url;
      if (url.startsWith('/')) {
        const base = new URL(baseUrl);
        return base.origin + url;
      }
      return new URL(url, baseUrl).href;
    } catch {
      return null;
    }
  }
}
