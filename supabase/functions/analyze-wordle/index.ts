
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Enhanced security headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Rate limiting
const rateLimiter = new Map<string, number[]>();
const RATE_LIMIT_MAX = 20; // Max 20 requests per minute
const RATE_LIMIT_WINDOW = 60000;

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimiter.has(clientId)) {
    rateLimiter.set(clientId, []);
  }
  
  const requests = rateLimiter.get(clientId)!;
  while (requests.length > 0 && requests[0] < windowStart) {
    requests.shift();
  }
  
  if (requests.length >= RATE_LIMIT_MAX) {
    return false;
  }
  
  requests.push(now);
  return true;
}

function sanitizeInput(input: any): { isValid: boolean; data?: any; error?: string } {
  if (!input || typeof input !== 'object') {
    return { isValid: false, error: 'Invalid request format' };
  }
  
  const { guessData, wordLength, positionExclusions } = input;
  
  // Validate wordLength
  if (typeof wordLength !== 'number' || wordLength < 3 || wordLength > 15) {
    return { isValid: false, error: 'Invalid word length' };
  }
  
  // Validate guessData
  if (!Array.isArray(guessData) || guessData.length !== wordLength) {
    return { isValid: false, error: 'Invalid guess data' };
  }
  
  // Sanitize guess data
  const sanitizedGuessData = guessData.map((tile: any) => {
    if (!tile || typeof tile !== 'object') {
      return { letter: '', state: 'unknown' };
    }
    
    const letter = typeof tile.letter === 'string' ? 
      tile.letter.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 1) : '';
    
    const validStates = ['correct', 'present', 'absent', 'unknown'];
    const state = validStates.includes(tile.state) ? tile.state : 'unknown';
    
    return { letter, state };
  });
  
  // Sanitize position exclusions
  const sanitizedPositionExclusions: Record<string, number[]> = {};
  if (input.positionExclusions && typeof input.positionExclusions === 'object') {
    Object.entries(input.positionExclusions).forEach(([letter, positions]) => {
      if (typeof letter === 'string' && Array.isArray(positions)) {
        const cleanLetter = letter.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 1);
        if (cleanLetter) {
          sanitizedPositionExclusions[cleanLetter] = positions
            .filter(pos => typeof pos === 'number' && pos >= 0 && pos < wordLength)
            .slice(0, wordLength);
        }
      }
    });
  }

  return { 
    isValid: true, 
    data: { guessData: sanitizedGuessData, wordLength, positionExclusions: sanitizedPositionExclusions } 
  };
}

function secureLog(message: string, data?: any): void {
  const isDev = Deno.env.get('DENO_DEPLOYMENT_ID') === undefined;
  if (isDev) {
    console.log(message, data);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const clientId = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(clientId)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Secure input validation
    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validation = sanitizeInput(requestBody);
    if (!validation.isValid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { guessData, wordLength, positionExclusions } = validation.data;

    // Build constraint description for AI (with sanitized inputs)
    const constraints = guessData
      .map((tile: any, index: number) => {
        if (!tile.letter) return null;
        switch (tile.state) {
          case 'correct':
            return `Position ${index + 1}: '${tile.letter}' (correct position)`;
          case 'present':
            return `'${tile.letter}' is in the word but not at position ${index + 1}`;
          case 'absent':
            return `'${tile.letter}' is not in the word`;
          default:
            return null;
        }
      })
      .filter(Boolean);

    // Add position exclusion constraints
    if (positionExclusions) {
      Object.entries(positionExclusions).forEach(([letter, positions]) => {
        if (positions.length > 0) {
          const positionList = positions.map(p => p + 1).join(', ');
          constraints.push(`'${letter}' must not be at position${positions.length > 1 ? 's' : ''} ${positionList}`);
        }
      });
    }

    const constraintString = constraints.join('; ');

    const prompt = `You are a Wordle solver AI. Given the following constraints for a ${wordLength}-letter word, suggest the 10 most likely English words that fit these constraints:

Constraints: ${constraintString}

Respond with a JSON array of objects, each containing "word" (uppercase) and "probability" (0-100 representing confidence). Focus on common English words. Example format:
[{"word": "HOUSE", "probability": 85}, {"word": "MOUSE", "probability": 72}]

Only return the JSON array, no other text.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a Wordle puzzle solver that analyzes letter constraints and suggests valid English words.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse AI response with enhanced security
    let solutions;
    try {
      solutions = JSON.parse(aiResponse);
      
      if (!Array.isArray(solutions)) {
        throw new Error('Invalid response format');
      }
      
      // Validate and clean the solutions with security checks
      solutions = solutions
        .filter((sol: any) => sol.word && typeof sol.probability === 'number')
        .slice(0, 15) // Limit results
        .map((sol: any) => ({
          word: sol.word.toString().toUpperCase().replace(/[^A-Z]/g, '').substring(0, 15),
          probability: Math.min(95, Math.max(5, Number(sol.probability) || 50))
        }))
        .filter((sol: any) => sol.word.length >= 3 && sol.word.length <= 15); // Final validation
        
    } catch (parseError) {
      secureLog('Failed to parse AI response:', parseError);
      solutions = [];
    }

    return new Response(JSON.stringify(solutions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    secureLog('Error in analyze-wordle function:', error);
    
    // Return generic error message for security
    return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
