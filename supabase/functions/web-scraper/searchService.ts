
import { ScrapingTarget } from './types.ts';
import { SEARCH_QUERIES } from './config.ts';

export class SearchService {
  private readonly SEARCH_API_URL = 'https://api.search.brave.com/res/v1/web/search';
  
  async findWordSources(): Promise<ScrapingTarget[]> {
    const allTargets: ScrapingTarget[] = [];
    
    // Try to get API key from environment
    const apiKey = Deno.env.get('BRAVE_SEARCH_API_KEY');
    
    if (!apiKey) {
      console.log('No search API key found, using static targets only');
      return [];
    }

    for (const query of SEARCH_QUERIES) {
      try {
        console.log(`Searching for: ${query}`);
        
        const response = await fetch(`${this.SEARCH_API_URL}?q=${encodeURIComponent(query)}&count=5`, {
          headers: {
            'X-Subscription-Token': apiKey,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          console.error(`Search API error for "${query}": ${response.status}`);
          continue;
        }

        const data = await response.json();
        
        if (data.web?.results) {
          for (const result of data.web.results) {
            // Filter for relevant educational and dictionary sites
            if (this.isRelevantWordSource(result.url, result.title)) {
              allTargets.push({
                url: result.url,
                name: result.title || 'Search Result',
              });
            }
          }
        }
        
        // Add delay between searches to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Search failed for "${query}":`, error);
      }
    }

    // Remove duplicates and limit results
    const uniqueTargets = allTargets.filter((target, index, arr) => 
      arr.findIndex(t => t.url === target.url) === index
    );

    console.log(`Found ${uniqueTargets.length} additional word sources via search`);
    return uniqueTargets.slice(0, 10); // Limit to 10 additional sources
  }

  private isRelevantWordSource(url: string, title: string): boolean {
    const relevantDomains = [
      'merriam-webster.com',
      'dictionary.com',
      'vocabulary.com',
      'oxfordlearnersdictionaries.com',
      'cambridge.org',
      'englishclub.com',
      'learnenglish.britishcouncil.org',
      'englishpage.com',
      'perfect-english-grammar.com',
      'wikipedia.org',
      'wiktionary.org'
    ];

    const relevantKeywords = [
      'word list', 'vocabulary', 'dictionary', 'english words',
      'common words', 'basic english', 'language learning',
      'word frequency', 'english grammar', 'spelling'
    ];

    // Check if URL is from a relevant domain
    const isDomainRelevant = relevantDomains.some(domain => url.includes(domain));
    
    // Check if title contains relevant keywords
    const titleLower = title.toLowerCase();
    const isTitleRelevant = relevantKeywords.some(keyword => titleLower.includes(keyword));
    
    // Avoid non-English content
    const hasNonEnglishIndicators = titleLower.includes('deutsch') || 
                                   titleLower.includes('français') || 
                                   titleLower.includes('español');

    return (isDomainRelevant || isTitleRelevant) && !hasNonEnglishIndicators;
  }
}
