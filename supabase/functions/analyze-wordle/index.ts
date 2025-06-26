
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { guessData, wordLength } = await req.json();

    // Build constraint description for AI
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
      .filter(Boolean)
      .join('; ');

    const prompt = `You are a Wordle solver AI. Given the following constraints for a ${wordLength}-letter word, suggest the 10 most likely English words that fit these constraints:

Constraints: ${constraints}

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

    // Parse AI response
    let solutions;
    try {
      solutions = JSON.parse(aiResponse);
      // Ensure it's an array and has the right structure
      if (!Array.isArray(solutions)) {
        throw new Error('Invalid response format');
      }
      
      // Validate and clean the solutions
      solutions = solutions
        .filter((sol: any) => sol.word && typeof sol.probability === 'number')
        .slice(0, 15) // Limit to 15 results
        .map((sol: any) => ({
          word: sol.word.toUpperCase(),
          probability: Math.min(95, Math.max(5, sol.probability))
        }));
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      solutions = [];
    }

    return new Response(JSON.stringify(solutions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-wordle function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
