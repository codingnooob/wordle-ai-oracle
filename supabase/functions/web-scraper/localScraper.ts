
import { ScrapingTarget } from './types.ts';
import { extractWordsFromHtml } from './wordValidator.ts';

export class LocalScraper {
  private readonly LOCAL_TARGETS: ScrapingTarget[] = [
    // Educational and dictionary sites
    { url: 'https://www.merriam-webster.com/games/quordle', name: 'Merriam-Webster Games' },
    { url: 'https://www.vocabulary.com/lists/52473', name: 'Vocabulary.com Common Words' },
    { url: 'https://www.englishclub.com/vocabulary/common-words-25.htm', name: 'EnglishClub Common Words' },
    { url: 'https://basicenglish.org/basic-english-word-list/', name: 'Basic English Word List' },
    
    // News and content sites (word-rich)
    { url: 'https://simple.wikipedia.org/wiki/Main_Page', name: 'Simple Wikipedia Main' },
    { url: 'https://simple.wikipedia.org/wiki/List_of_basic_English_words', name: 'Basic English Words' },
    { url: 'https://simple.wikipedia.org/wiki/Oxford_English_Dictionary', name: 'Simple Wiki Dictionary' },
    
    // Language learning resources
    { url: 'https://www.ef.com/wwen/english-resources/english-vocabulary/', name: 'EF English Vocabulary' },
    { url: 'https://www.perfect-english-grammar.com/vocabulary.html', name: 'Perfect English Grammar' },
    
    // Open source word lists and resources
    { url: 'https://github.com/dwyl/english-words/blob/master/words_alpha.txt', name: 'GitHub English Words (Raw)' },
    { url: 'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt', name: 'Raw Word List' }
  ];

  async performLocalScraping(): Promise<{ words: Set<string>; results: Array<{ source: string; wordCount: number; success: boolean }> }> {
    const allWords = new Set<string>();
    const scrapeResults: Array<{ source: string; wordCount: number; success: boolean }> = [];

    console.log('Starting local web scraping without API dependencies...');

    for (const target of this.LOCAL_TARGETS) {
      try {
        console.log(`Local scraping: ${target.name}...`);
        
        const response = await fetch(target.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WordleBot/1.0; Educational use)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        const words = extractWordsFromHtml(html);
        
        words.forEach(word => allWords.add(word));
        
        scrapeResults.push({
          source: target.name,
          wordCount: words.length,
          success: true
        });

        console.log(`✓ Local scraped ${words.length} words from ${target.name}`);
        
        // Very short delay between requests (500ms)
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error(`✗ Local scraping failed for ${target.name}:`, error);
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

  // Spider-like functionality to discover more word sources
  async discoverWordSources(seedUrls: string[] = []): Promise<ScrapingTarget[]> {
    const discoveredTargets: ScrapingTarget[] = [];
    const processedUrls = new Set<string>();

    // Start with seed URLs if provided, otherwise use our local targets
    const startUrls = seedUrls.length > 0 ? seedUrls : this.LOCAL_TARGETS.map(t => t.url);

    for (const url of startUrls.slice(0, 3)) { // Limit to 3 seed URLs to avoid overwhelming
      if (processedUrls.has(url)) continue;
      processedUrls.add(url);

      try {
        console.log(`Discovering links from: ${url}`);
        
        const response = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WordleBot/1.0; Educational use)' },
          signal: AbortSignal.timeout(8000)
        });

        if (!response.ok) continue;

        const html = await response.text();
        
        // Extract links that might contain word lists
        const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
        let match;
        
        while ((match = linkRegex.exec(html)) !== null) {
          const linkUrl = match[1];
          const linkText = match[2].toLowerCase();
          
          // Look for links that might contain word lists
          if (this.isWordRelatedLink(linkUrl, linkText)) {
            const fullUrl = this.resolveUrl(linkUrl, url);
            if (fullUrl && !processedUrls.has(fullUrl)) {
              discoveredTargets.push({
                url: fullUrl,
                name: `Discovered: ${match[2].trim()}`
              });
            }
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
      'spelling', 'grammar', 'list', 'common', 'frequent', 'basic'
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
