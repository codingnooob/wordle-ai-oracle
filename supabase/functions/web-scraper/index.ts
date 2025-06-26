
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

  console.log('🚀 Starting MASSIVE high-frequency web scraping...');

  try {
    const { maxWords = 50000 } = await req.json().catch(() => ({})); // Massively increased capacity
    
    const scraper = new WebScraper();
    const { words: allWords, results: scrapeResults } = await scraper.scrapeFromTargets(SCRAPING_TARGETS);

    // Add fallback words if we still don't have enough
    if (allWords.size < 5000) { // Even higher threshold
      console.log('📚 Adding comprehensive fallback content...');
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

    const apiMode = Deno.env.get('BRAVE_SEARCH_API_KEY') ? 'API + Enhanced' : 'Enhanced Local';
    console.log(`✅ MASSIVE scraping complete (${apiMode}): ${finalWords.length} words from ${scrapeResults.length} sources`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ MASSIVE scraping failed:', error);
    
    // Return enhanced fallback data
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
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);
