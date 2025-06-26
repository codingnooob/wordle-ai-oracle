
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SCRAPING_TARGETS, corsHeaders } from './config.ts';
import { ScrapingResponse } from './types.ts';
import { WebScraper } from './scraper.ts';
import { getFallbackWords } from './fallbackWords.ts';

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🚀 Starting optimized high-frequency web scraping...');
  const startTime = Date.now();

  try {
    const { maxWords = 200000 } = await req.json().catch(() => ({})); // Increased to 200K to accommodate full corpus
    
    const scraper = new WebScraper();
    const { words: allWords, results: scrapeResults } = await scraper.scrapeFromTargets(SCRAPING_TARGETS);

    // Add fallback words if we don't have enough diversity
    if (allWords.size < 10000) {
      console.log('📚 Adding fallback content for diversity...');
      const fallbackWords = getFallbackWords();
      fallbackWords.forEach(word => allWords.add(word));
    }

    // Convert to array - use the FULL corpus without artificial selection limits
    const allWordsArray = Array.from(allWords);
    
    // Return the full filtered corpus instead of artificially limiting it
    const finalWords = allWordsArray.length > maxWords ? 
      selectDiverseWords(allWordsArray, maxWords) : 
      allWordsArray;
    
    const processingTime = Date.now() - startTime;
    const response: ScrapingResponse = {
      words: finalWords,
      totalWords: finalWords.length,
      totalScraped: allWordsArray.length,
      scrapeResults,
      timestamp: new Date().toISOString()
    };

    console.log(`✅ Full corpus scraping complete: ${finalWords.length} words from ${allWordsArray.length} total scraped (${scrapeResults.length} sources) in ${processingTime}ms`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Scraping failed:', error);
    
    // Return enhanced fallback data
    const fallbackWords = getFallbackWords();
    
    const response: ScrapingResponse = {
      words: fallbackWords,
      totalWords: fallbackWords.length,
      totalScraped: fallbackWords.length,
      scrapeResults: [],
      error: error.message,
      fallback: true,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

// Smart word selection function to maximize diversity (only used if corpus exceeds 200K)
function selectDiverseWords(words: string[], maxCount: number): string[] {
  if (words.length <= maxCount) return words;
  
  // Group words by length for balanced distribution
  const wordsByLength: { [key: number]: string[] } = {};
  words.forEach(word => {
    const len = word.length;
    if (!wordsByLength[len]) wordsByLength[len] = [];
    wordsByLength[len].push(word);
  });
  
  // Calculate target per length (balanced distribution)
  const lengths = Object.keys(wordsByLength).map(Number).sort();
  const wordsPerLength = Math.floor(maxCount / lengths.length);
  const selected: string[] = [];
  
  // Select words from each length category
  lengths.forEach(length => {
    const wordsOfLength = wordsByLength[length];
    const take = Math.min(wordsPerLength, wordsOfLength.length);
    
    // Shuffle and take diverse selection
    const shuffled = wordsOfLength.sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, take));
  });
  
  // Fill remaining slots with random words
  if (selected.length < maxCount) {
    const remaining = words.filter(w => !selected.includes(w));
    const shuffledRemaining = remaining.sort(() => Math.random() - 0.5);
    selected.push(...shuffledRemaining.slice(0, maxCount - selected.length));
  }
  
  console.log(`📊 Diversity selection: ${selected.length} words from ${words.length} total (${lengths.length} length categories)`);
  return selected.slice(0, maxCount);
}

serve(handler);
