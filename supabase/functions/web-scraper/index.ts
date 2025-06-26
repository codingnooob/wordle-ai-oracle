
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

  console.log('Starting enhanced web scraping process with search integration...');

  try {
    const { maxWords = 15000 } = await req.json().catch(() => ({})); // Increased from 5000
    
    const scraper = new WebScraper();
    const { words: allWords, results: scrapeResults } = await scraper.scrapeFromTargets(SCRAPING_TARGETS);

    // If we didn't get enough words from scraping, add fallback content
    if (allWords.size < 2000) { // Increased threshold from 1000
      console.log('Adding fallback word content...');
      const fallbackWords = getFallbackWords();
      fallbackWords.forEach(word => allWords.add(word));
    }

    // Convert to array and limit results
    const finalWords = Array.from(allWords).slice(0, maxWords);
    
    const response: ScrapingResponse = {
      words: finalWords,
      totalWords: finalWords.length,
      scrapeResults,
      timestamp: new Date().toISOString()
    };

    console.log(`Enhanced web scraping complete: ${finalWords.length} total words from ${scrapeResults.length} sources`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Enhanced web scraping failed:', error);
    
    // Return fallback data if scraping completely fails
    const fallbackWords = getFallbackWords();
    
    const response: ScrapingResponse = {
      words: fallbackWords,
      totalWords: fallbackWords.length,
      scrapeResults: [],
      error: error.message,
      fallback: true,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      status: 200, // Still return 200 since we have fallback data
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
