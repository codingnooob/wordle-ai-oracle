
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SCRAPING_TARGETS, corsHeaders } from './config.ts';
import { ScrapingResponse } from './types.ts';
import { WebScraper } from './scraper.ts';
import { getFallbackWords } from './fallbackWords.ts';

// Security headers for enhanced protection
const securityHeaders = {
  ...corsHeaders,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Rate limiting
const rateLimiter = new Map<string, number[]>();
const RATE_LIMIT_MAX = 10; // Max 10 requests
const RATE_LIMIT_WINDOW = 60000; // Per minute

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimiter.has(clientId)) {
    rateLimiter.set(clientId, []);
  }
  
  const requests = rateLimiter.get(clientId)!;
  // Remove old requests
  while (requests.length > 0 && requests[0] < windowStart) {
    requests.shift();
  }
  
  if (requests.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  requests.push(now);
  return true;
}

function sanitizeInput(input: any): number {
  if (typeof input !== 'number' || isNaN(input) || input < 1000 || input > 200000) {
    return 200000; // Safe default
  }
  return Math.floor(input);
}

function secureLog(message: string, data?: any): void {
  // Only log in development or critical errors
  const isDev = Deno.env.get('DENO_DEPLOYMENT_ID') === undefined;
  if (isDev) {
    console.log(message, data ? JSON.stringify(data, null, 2) : '');
  } else {
    // Production: only log basic info without sensitive data
    console.log('Web scraper operation completed');
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: securityHeaders });
  }

  // Global timeout - VERY aggressive
  const GLOBAL_TIMEOUT = 12000; // 12 seconds hard limit (reduced from 20)
  const timeoutPromise = new Promise<Response>((_, reject) => {
    setTimeout(() => reject(new Error('Global timeout')), GLOBAL_TIMEOUT);
  });

  const processingPromise = (async () => {
    // Rate limiting check
    const clientId = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientId)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }

    secureLog('Starting ultra-lightweight web scraping...');
    const startTime = Date.now();

    try {
      let requestData;
      try {
        requestData = await req.json();
      } catch {
        requestData = {};
      }
      
      const maxWords = sanitizeInput(requestData.maxWords);
      
      const scraper = new WebScraper();
      const { words: allWords, results: scrapeResults } = await scraper.scrapeFromTargets(SCRAPING_TARGETS);

      // Add fallback words to ensure minimum corpus size
      const fallbackWords = getFallbackWords();
      if (allWords.size < 5000) {
        secureLog('Supplementing with fallback words...');
        fallbackWords.forEach(word => allWords.add(word));
      }

      const allWordsArray = Array.from(allWords);
      
      // Apply limits if needed
      const finalWords = allWordsArray.length > maxWords ? 
        allWordsArray.slice(0, maxWords) : 
        allWordsArray;
      
      const processingTime = Date.now() - startTime;
      
      const response: ScrapingResponse = {
        words: finalWords,
        totalWords: finalWords.length,
        totalScraped: allWordsArray.length,
        scrapeResults: scrapeResults.map(result => ({
          source: result.source,
          wordCount: result.wordCount,
          success: result.success
        })),
        timestamp: new Date().toISOString()
      };

      secureLog(`Scraping complete: ${finalWords.length} words in ${processingTime}ms`);

      return new Response(JSON.stringify(response), {
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
      });

    } catch (error) {
      secureLog('Scraping failed:', error);
      
      const fallbackWords = getFallbackWords();
      
      const response: ScrapingResponse = {
        words: fallbackWords,
        totalWords: fallbackWords.length,
        totalScraped: fallbackWords.length,
        scrapeResults: [],
        error: 'Service temporarily unavailable',
        fallback: true,
        timestamp: new Date().toISOString()
      };

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...securityHeaders, 'Content-Type': 'application/json' },
      });
    }
  })();

  // Race between processing and timeout
  try {
    return await Promise.race([processingPromise, timeoutPromise]);
  } catch (error) {
    console.error('Timeout:', error);
    
    const fallbackWords = getFallbackWords();
    const response: ScrapingResponse = {
      words: fallbackWords,
      totalWords: fallbackWords.length,
      totalScraped: fallbackWords.length,
      scrapeResults: [],
      error: 'Request timeout - using cached data',
      fallback: true,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...securityHeaders, 'Content-Type': 'application/json' },
    });
  }
};

// Smart word selection function to maximize diversity (only used if corpus exceeds limit)
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
  
  secureLog(`Diversity selection: ${selected.length} words from ${words.length} total (${lengths.length} length categories)`);
  return selected.slice(0, maxCount);
}

serve(handler);
