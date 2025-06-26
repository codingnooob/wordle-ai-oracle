
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapingTarget {
  url: string;
  name: string;
  selector?: string;
}

const SCRAPING_TARGETS: ScrapingTarget[] = [
  {
    url: 'https://en.wikipedia.org/wiki/Most_common_words_in_English',
    name: 'Wikipedia Common Words',
  },
  {
    url: 'https://simple.wikipedia.org/wiki/List_of_common_English_words',
    name: 'Simple Wikipedia Words',
  },
  {
    url: 'https://en.wikipedia.org/wiki/English_language',
    name: 'Wikipedia English Language',
  }
];

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Starting web scraping process...');

  try {
    const { maxWords = 5000 } = await req.json().catch(() => ({}));
    
    const allWords = new Set<string>();
    const scrapeResults: { source: string; wordCount: number; success: boolean }[] = [];

    // Scrape from each target
    for (const target of SCRAPING_TARGETS) {
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

    // If we didn't get enough words from scraping, add fallback content
    if (allWords.size < 1000) {
      console.log('Adding fallback word content...');
      const fallbackWords = getFallbackWords();
      fallbackWords.forEach(word => allWords.add(word));
    }

    // Convert to array and limit results
    const finalWords = Array.from(allWords).slice(0, maxWords);
    
    const response = {
      words: finalWords,
      totalWords: finalWords.length,
      scrapeResults,
      timestamp: new Date().toISOString()
    };

    console.log(`Web scraping complete: ${finalWords.length} total words`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Web scraping failed:', error);
    
    // Return fallback data if scraping completely fails
    const fallbackWords = getFallbackWords();
    
    return new Response(JSON.stringify({
      words: fallbackWords,
      totalWords: fallbackWords.length,
      scrapeResults: [],
      error: error.message,
      fallback: true,
      timestamp: new Date().toISOString()
    }), {
      status: 200, // Still return 200 since we have fallback data
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

function extractWordsFromHtml(html: string): string[] {
  const words = new Set<string>();
  
  // Remove HTML tags and extract text content
  const textContent = html
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[^;]+;/g, ' '); // Remove HTML entities
  
  // Extract words using regex
  const wordMatches = textContent.match(/\b[a-zA-Z]{3,8}\b/g) || [];
  
  wordMatches.forEach(word => {
    const cleanWord = word.toUpperCase().trim();
    
    // Validate word quality
    if (isValidEnglishWord(cleanWord)) {
      words.add(cleanWord);
    }
  });
  
  return Array.from(words);
}

function isValidEnglishWord(word: string): boolean {
  // Must be 3-8 letters, only alphabetic characters
  if (word.length < 3 || word.length > 8 || !/^[A-Z]+$/.test(word)) {
    return false;
  }
  
  // Must contain at least one vowel
  if (!/[AEIOU]/.test(word)) {
    return false;
  }
  
  // Avoid words with too many consecutive consonants
  if (/[BCDFGHJKLMNPQRSTVWXYZ]{4,}/.test(word)) {
    return false;
  }
  
  // Avoid very uncommon starting patterns
  if (/^[XZ]/.test(word)) {
    return false;
  }
  
  // Avoid repeated letter patterns that are uncommon in English
  if (/(.)\1{2,}/.test(word)) {
    return false;
  }
  
  return true;
}

function getFallbackWords(): string[] {
  // Comprehensive fallback word lists organized by length
  const wordsByLength: { [key: number]: string[] } = {
    3: [
      'THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER',
      'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'HAD', 'HAS', 'HIS', 'HOW', 'ITS',
      'MAY', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WHO', 'BOY', 'DID', 'GET',
      'LET', 'MAN', 'RUN', 'SUN', 'TOP', 'WAY', 'WIN', 'YES', 'YET', 'AGO'
    ],
    4: [
      'THAT', 'WITH', 'HAVE', 'THIS', 'WILL', 'YOUR', 'FROM', 'THEY', 'KNOW', 'WANT',
      'BEEN', 'GOOD', 'MUCH', 'SOME', 'TIME', 'VERY', 'WHEN', 'COME', 'HERE', 'JUST',
      'LIKE', 'LONG', 'MAKE', 'MANY', 'OVER', 'SUCH', 'TAKE', 'THAN', 'THEM', 'WELL',
      'BACK', 'CALL', 'CAME', 'EACH', 'FIND', 'GIVE', 'HAND', 'HIGH', 'KEEP', 'KIND',
      'LAST', 'LEFT', 'LIFE', 'LIVE', 'LOOK', 'MADE', 'MOST', 'MOVE', 'MUST', 'NAME'
    ],
    5: [
      'WHICH', 'THEIR', 'WOULD', 'THERE', 'COULD', 'OTHER', 'AFTER', 'FIRST', 'NEVER', 'THESE',
      'THINK', 'WHERE', 'BEING', 'EVERY', 'GREAT', 'MIGHT', 'SHALL', 'STILL', 'THOSE', 'UNDER',
      'WHILE', 'ABOUT', 'AGAIN', 'BEFORE', 'HOUSE', 'RIGHT', 'SMALL', 'SOUND', 'STILL', 'SUCH',
      'PLACE', 'WORLD', 'YEARS', 'YOUNG', 'ASKED', 'GOING', 'HEARD', 'LARGE', 'LIGHT', 'LIVED'
    ],
    6: [
      'SHOULD', 'AROUND', 'LITTLE', 'PEOPLE', 'BEFORE', 'MOTHER', 'THOUGH', 'SCHOOL', 'ALWAYS', 'REALLY',
      'ANSWER', 'APPEAR', 'DURING', 'FOLLOW', 'FRIEND', 'GROUND', 'HAPPEN', 'LETTER', 'LISTEN', 'MOMENT',
      'NUMBER', 'OBJECT', 'PLAYED', 'REASON', 'SECOND', 'SYSTEM', 'THINGS', 'TURNED', 'WALKED', 'WANTED'
    ],
    7: [
      'THROUGH', 'BETWEEN', 'ANOTHER', 'WITHOUT', 'BECAUSE', 'AGAINST', 'NOTHING', 'SOMEONE', 'TOWARDS', 'SEVERAL',
      'ALREADY', 'CHANGED', 'DECIDED', 'EVENING', 'FINALLY', 'GENERAL', 'HOWEVER', 'INSTEAD', 'KITCHEN', 'LEARNED',
      'MACHINE', 'NATURAL', 'PERHAPS', 'PRESENT', 'PROBLEM', 'QUICKLY', 'REACHED', 'STARTED', 'THOUGHT', 'VILLAGE'
    ],
    8: [
      'BUSINESS', 'TOGETHER', 'CHILDREN', 'QUESTION', 'COMPLETE', 'YOURSELF', 'REMEMBER', 'ALTHOUGH', 'CONTINUE', 'POSSIBLE',
      'BIRTHDAY', 'BUILDING', 'COMPUTER', 'DISTANCE', 'EVERYONE', 'FOLLOWED', 'HAPPENED', 'INTEREST', 'LANGUAGE', 'MOUNTAIN',
      'NEIGHBOR', 'OPPOSITE', 'PICTURE', 'PROBABLY', 'RECOGNIZE', 'STRENGTH', 'TROUBLE', 'UMBRELLA', 'VACATION', 'WONDERFUL'
    ]
  };
  
  // Flatten all words into a single array
  const allWords: string[] = [];
  for (const lengthWords of Object.values(wordsByLength)) {
    allWords.push(...lengthWords);
  }
  
  return allWords;
}

serve(handler);
