
import { ScrapingTarget, ScrapeResult } from './types.ts';
import { extractWordsFromHtml } from './wordValidator.ts';

export class EnhancedScraper {
  private readonly MAX_LINKS_PER_SOURCE = 10;
  private readonly MAX_SPIDER_DEPTH = 2;

  async performEnhancedScraping(targets: ScrapingTarget[]): Promise<{ words: Set<string>; results: ScrapeResult[] }> {
    const allWords = new Set<string>();
    const scrapeResults: ScrapeResult[] = [];

    console.log(`🔍 Starting enhanced scraping on ${targets.length} targets...`);

    for (const target of targets) {
      try {
        console.log(`📖 Enhanced scraping: ${target.name}...`);
        
        const response = await fetch(target.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; WordBot/1.0; +Educational)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Cache-Control': 'no-cache'
          },
          signal: AbortSignal.timeout(12000)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        
        // Enhanced word extraction
        const words = this.extractWordsComprehensively(html);
        words.forEach(word => allWords.add(word));
        
        scrapeResults.push({
          source: target.name,
          wordCount: words.length,
          success: true
        });

        console.log(`✅ Enhanced: ${words.length} words from ${target.name}`);

        // Spider additional links from this source
        const discoveredWords = await this.spiderAdditionalContent(target.url, html);
        discoveredWords.forEach(word => allWords.add(word));

        if (discoveredWords.size > 0) {
          console.log(`🕷️ Spidered additional ${discoveredWords.size} words from ${target.name}`);
        }
        
        // Shorter delay for higher frequency
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`❌ Enhanced scraping failed for ${target.name}:`, error);
        scrapeResults.push({
          source: target.name,
          wordCount: 0,
          success: false
        });
      }
    }

    console.log(`🎯 Enhanced scraping complete: ${allWords.size} total unique words`);
    return { words: allWords, results: scrapeResults };
  }

  private extractWordsComprehensively(html: string): string[] {
    const words = new Set<string>();
    
    // Enhanced text extraction with multiple strategies
    const strategies = [
      // Strategy 1: Standard HTML text extraction
      () => this.extractStandardWords(html),
      // Strategy 2: Extract from JSON-LD structured data
      () => this.extractFromStructuredData(html),
      // Strategy 3: Extract from meta tags and attributes
      () => this.extractFromMetaData(html),
      // Strategy 4: Extract from alt text and titles
      () => this.extractFromAltText(html)
    ];

    strategies.forEach(strategy => {
      try {
        const strategyWords = strategy();
        strategyWords.forEach(word => words.add(word));
      } catch (error) {
        console.warn('Word extraction strategy failed:', error);
      }
    });

    return Array.from(words);
  }

  private extractStandardWords(html: string): string[] {
    // Enhanced version of the standard extraction
    const textContent = html
      .replace(/<script[^>]*>.*?<\/script>/gis, '')
      .replace(/<style[^>]*>.*?<\/style>/gis, '')
      .replace(/<noscript[^>]*>.*?<\/noscript>/gis, '')
      .replace(/<!--.*?-->/gs, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&[^;]+;/g, ' ')
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ');
    
    return extractWordsFromHtml(textContent);
  }

  private extractFromStructuredData(html: string): string[] {
    const words = new Set<string>();
    
    // Extract from JSON-LD
    const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis);
    if (jsonLdMatches) {
      jsonLdMatches.forEach(match => {
        try {
          const jsonContent = match.replace(/<script[^>]*>|<\/script>/gi, '');
          const data = JSON.parse(jsonContent);
          const text = JSON.stringify(data);
          const textWords = extractWordsFromHtml(text);
          textWords.forEach(word => words.add(word));
        } catch (e) {
          // Skip invalid JSON
        }
      });
    }
    
    return Array.from(words);
  }

  private extractFromMetaData(html: string): string[] {
    const words = new Set<string>();
    
    // Extract from meta tags
    const metaMatches = html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*>/gi);
    if (metaMatches) {
      metaMatches.forEach(match => {
        const contentMatch = match.match(/content=["']([^"']+)["']/i);
        if (contentMatch) {
          const metaWords = extractWordsFromHtml(contentMatch[1]);
          metaWords.forEach(word => words.add(word));
        }
      });
    }
    
    return Array.from(words);
  }

  private extractFromAltText(html: string): string[] {
    const words = new Set<string>();
    
    // Extract from alt attributes
    const altMatches = html.match(/alt=["']([^"']+)["']/gi);
    if (altMatches) {
      altMatches.forEach(match => {
        const altMatch = match.match(/alt=["']([^"']+)["']/i);
        if (altMatch) {
          const altWords = extractWordsFromHtml(altMatch[1]);
          altWords.forEach(word => words.add(word));
        }
      });
    }
    
    // Extract from title attributes
    const titleMatches = html.match(/title=["']([^"']+)["']/gi);
    if (titleMatches) {
      titleMatches.forEach(match => {
        const titleMatch = match.match(/title=["']([^"']+)["']/i);
        if (titleMatch) {
          const titleWords = extractWordsFromHtml(titleMatch[1]);
          titleWords.forEach(word => words.add(word));
        }
      });
    }
    
    return Array.from(words);
  }

  private async spiderAdditionalContent(baseUrl: string, html: string): Promise<Set<string>> {
    const allWords = new Set<string>();
    
    try {
      // Extract promising links
      const links = this.extractPromisingLinks(html, baseUrl);
      const limitedLinks = links.slice(0, this.MAX_LINKS_PER_SOURCE);
      
      for (const link of limitedLinks) {
        try {
          const response = await fetch(link, {
            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WordBot/1.0)' },
            signal: AbortSignal.timeout(6000)
          });
          
          if (response.ok) {
            const linkedHtml = await response.text();
            const words = this.extractStandardWords(linkedHtml);
            words.forEach(word => allWords.add(word));
          }
          
          // Very short delay between spider requests
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          // Skip failed spider requests
          continue;
        }
      }
    } catch (error) {
      // Skip spider errors
    }
    
    return allWords;
  }

  private extractPromisingLinks(html: string, baseUrl: string): string[] {
    const links: string[] = [];
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]*)<\/a>/gi;
    let match;
    
    while ((match = linkRegex.exec(html)) !== null) {
      const url = match[1];
      const text = match[2].toLowerCase();
      
      // Look for word-rich content indicators
      if (this.isPromisingLink(url, text)) {
        const fullUrl = this.resolveUrl(url, baseUrl);
        if (fullUrl) {
          links.push(fullUrl);
        }
      }
    }
    
    return links;
  }

  private isPromisingLink(url: string, text: string): boolean {
    const promisingKeywords = [
      'word', 'vocabulary', 'dictionary', 'text', 'content', 'article',
      'story', 'book', 'chapter', 'page', 'list', 'glossary', 'terms'
    ];
    
    const urlLower = url.toLowerCase();
    const textLower = text.toLowerCase();
    
    return promisingKeywords.some(keyword => 
      urlLower.includes(keyword) || textLower.includes(keyword)
    ) && !urlLower.includes('image') && !urlLower.includes('pdf') && !urlLower.includes('video');
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
