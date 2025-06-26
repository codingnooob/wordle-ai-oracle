
import { ScrapingTarget } from './types.ts';

export class DynamicSourcesService {
  private readonly NEWS_RSS_FEEDS = [
    'https://feeds.bbci.co.uk/news/rss.xml',
    'https://rss.cnn.com/rss/edition.rss',
    'https://feeds.npr.org/1001/rss.xml',
    'https://feeds.reuters.com/reuters/topNews'
  ];

  private readonly BOOK_SOURCES = [
    'https://www.gutenberg.org/files/74/74-0.txt', // Adventures of Tom Sawyer
    'https://www.gutenberg.org/files/1342/1342-0.txt', // Pride and Prejudice
    'https://www.gutenberg.org/files/11/11-0.txt', // Alice in Wonderland
    'https://www.gutenberg.org/files/84/84-0.txt', // Frankenstein
    'https://www.gutenberg.org/files/2701/2701-0.txt', // Moby Dick
    'https://www.gutenberg.org/files/1661/1661-0.txt', // Sherlock Holmes
    'https://www.gutenberg.org/files/25344/25344-0.txt', // Scarlet Letter
    'https://www.gutenberg.org/files/76/76-0.txt' // Huckleberry Finn
  ];

  private readonly EDUCATIONAL_SOURCES = [
    'https://simple.wikipedia.org/wiki/Special:Random',
    'https://en.wiktionary.org/wiki/Wiktionary:Frequency_lists',
    'https://www.merriam-webster.com/word-of-the-day',
    'https://www.dictionary.com/browse/',
    'https://www.vocabulary.com/dictionary/',
    'https://www.collinsdictionary.com/dictionary/english'
  ];

  async getExpandedSources(): Promise<ScrapingTarget[]> {
    const sources: ScrapingTarget[] = [];

    // Add book sources with high word density
    this.BOOK_SOURCES.forEach((url, index) => {
      sources.push({
        url,
        name: `Classic Literature ${index + 1}`
      });
    });

    // Add educational sources
    this.EDUCATIONAL_SOURCES.forEach((url, index) => {
      sources.push({
        url,
        name: `Educational Source ${index + 1}`
      });
    });

    // Add news sources (RSS feeds converted to web pages)
    sources.push(
      { url: 'https://www.bbc.com/news', name: 'BBC News' },
      { url: 'https://edition.cnn.com/', name: 'CNN News' },
      { url: 'https://www.reuters.com/world/', name: 'Reuters World' },
      { url: 'https://www.npr.org/sections/news/', name: 'NPR News' }
    );

    // Add more comprehensive word lists
    sources.push(
      { url: 'https://www.wordfrequency.info/samples.asp', name: 'Word Frequency Lists' },
      { url: 'https://www.oxfordlearnersdictionaries.com/wordlists/', name: 'Oxford Word Lists' },
      { url: 'https://github.com/first20hours/google-10000-english/blob/master/google-10000-english.txt', name: 'Google 10K Words' },
      { url: 'https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt', name: 'Google 10K Raw' }
    );

    console.log(`Generated ${sources.length} expanded dynamic sources`);
    return sources;
  }

  async getRSSContent(feedUrl: string): Promise<string[]> {
    try {
      const response = await fetch(feedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WordBot/1.0)' },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) return [];

      const xmlText = await response.text();
      const words = this.extractWordsFromXML(xmlText);
      return words;
    } catch (error) {
      console.error(`Failed to fetch RSS feed ${feedUrl}:`, error);
      return [];
    }
  }

  private extractWordsFromXML(xml: string): string[] {
    const words = new Set<string>();
    
    // Remove XML tags and extract text content
    const textContent = xml
      .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&[^;]+;/g, ' ');
    
    const wordMatches = textContent.match(/\b[a-zA-Z]{3,8}\b/g) || [];
    
    wordMatches.forEach(word => {
      const cleanWord = word.toUpperCase().trim();
      if (this.isValidWord(cleanWord)) {
        words.add(cleanWord);
      }
    });
    
    return Array.from(words);
  }

  private isValidWord(word: string): boolean {
    if (word.length < 3 || word.length > 8 || !/^[A-Z]+$/.test(word)) return false;
    if (!/[AEIOU]/.test(word)) return false;
    if (/[BCDFGHJKLMNPQRSTVWXYZ]{4,}/.test(word)) return false;
    return true;
  }
}
