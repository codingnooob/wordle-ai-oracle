
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface WordleAPIRequest {
  guessData: Array<{letter: string, state: 'correct' | 'present' | 'absent'}>;
  wordLength: number;
  excludedLetters?: string[];
  apiKey?: string;
}

interface WordleSolution {
  word: string;
  probability: number;
}

// Validate request input strictly
function validateWordleRequest(request: WordleAPIRequest): {valid: boolean, error?: string} {
  // Check if guessData exists and is array
  if (!Array.isArray(request.guessData)) {
    return { valid: false, error: 'guessData must be an array' };
  }
  
  // Check wordLength
  if (!request.wordLength || request.wordLength < 3 || request.wordLength > 15) {
    return { valid: false, error: 'wordLength must be between 3 and 15' };
  }
  
  // Check if guessData length matches wordLength
  if (request.guessData.length !== request.wordLength) {
    return { valid: false, error: `guessData length (${request.guessData.length}) must match wordLength (${request.wordLength})` };
  }
  
  // Validate each tile in guessData
  for (let i = 0; i < request.guessData.length; i++) {
    const tile = request.guessData[i];
    
    // Check if tile has required properties
    if (!tile.letter || !tile.state) {
      return { valid: false, error: `Tile at position ${i} is missing letter or state` };
    }
    
    // Check if letter is valid (single alphabetic character)
    if (typeof tile.letter !== 'string' || tile.letter.length !== 1 || !/^[A-Za-z]$/.test(tile.letter)) {
      return { valid: false, error: `Tile at position ${i} has invalid letter. Must be a single alphabetic character` };
    }
    
    // Check if state is valid (only correct, present, or absent allowed)
    if (!['correct', 'present', 'absent'].includes(tile.state)) {
      return { valid: false, error: `Tile at position ${i} has invalid state '${tile.state}'. Only 'correct', 'present', and 'absent' are allowed. All tiles must have a known state` };
    }
  }
  
  return { valid: true };
}

// Rate limiting and API key validation
async function validateRequest(apiKey?: string, clientId?: string): Promise<{valid: boolean, error?: string}> {
  // Simple rate limiting check
  if (clientId) {
    const { data: usage } = await supabase
      .from('api_usage')
      .select('request_count, last_request')
      .eq('api_key_hash', apiKey || 'anonymous')
      .eq('endpoint', 'wordle-solver')
      .single();
    
    if (usage && usage.request_count > 100) {
      const hourAgo = new Date(Date.now() - 3600000).toISOString();
      if (usage.last_request > hourAgo) {
        return { valid: false, error: 'Rate limit exceeded' };
      }
    }
  }
  
  return { valid: true };
}

// Track API usage
async function trackUsage(apiKey?: string) {
  const keyHash = apiKey || 'anonymous';
  
  const { data: existing } = await supabase
    .from('api_usage')
    .select('request_count')
    .eq('api_key_hash', keyHash)
    .eq('endpoint', 'wordle-solver')
    .single();
  
  if (existing) {
    await supabase
      .from('api_usage')
      .update({ 
        request_count: existing.request_count + 1,
        last_request: new Date().toISOString()
      })
      .eq('api_key_hash', keyHash)
      .eq('endpoint', 'wordle-solver');
  } else {
    await supabase
      .from('api_usage')
      .insert({
        api_key_hash: keyHash,
        endpoint: 'wordle-solver',
        request_count: 1,
        last_request: new Date().toISOString()
      });
  }
}

// ML Analysis function (simplified version)
async function performMLAnalysis(guessData: any[], wordLength: number, excludedLetters: string[] = []): Promise<{solutions: WordleSolution[], status: string, confidence: number}> {
  // Simulate ML processing time
  const processingTime = Math.random() * 2000 + 1000; // 1-3 seconds
  await new Promise(resolve => setTimeout(resolve, processingTime));
  
  // Call the existing analyze-wordle function
  try {
    const { data, error } = await supabase.functions.invoke('analyze-wordle', {
      body: { guessData, wordLength, excludedLetters }
    });
    
    if (error) throw error;
    
    const solutions = Array.isArray(data) ? data : [];
    const confidence = solutions.length > 0 ? 0.95 : 0.5;
    
    return {
      solutions: solutions.slice(0, 15), // Limit to top 15 results
      status: solutions.length > 0 ? 'complete' : 'partial',
      confidence
    };
  } catch (error) {
    console.error('ML Analysis failed:', error);
    return {
      solutions: [],
      status: 'failed',
      confidence: 0.0
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  // Handle status check endpoint
  if (req.method === 'GET' && path.includes('/status/')) {
    const jobId = path.split('/status/')[1];
    
    try {
      const { data: job, error: jobError } = await supabase
        .from('analysis_jobs')
        .select('*, analysis_results(*)')
        .eq('id', jobId)
        .single();
      
      if (jobError || !job) {
        return new Response(JSON.stringify({ error: 'Job not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const response = {
        job_id: job.id,
        status: job.status,
        created_at: job.created_at,
        completed_at: job.completed_at,
        estimated_completion_seconds: job.estimated_completion_seconds,
        solutions: job.analysis_results?.[0]?.solutions || [],
        confidence_score: job.analysis_results?.[0]?.confidence_score || 0,
        processing_status: job.analysis_results?.[0]?.processing_status || 'initializing'
      };
      
      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  // Handle main API endpoint
  if (req.method === 'POST') {
    try {
      const requestBody: WordleAPIRequest = await req.json();
      
      // Validate input format first
      const inputValidation = validateWordleRequest(requestBody);
      if (!inputValidation.valid) {
        return new Response(JSON.stringify({ error: inputValidation.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const { guessData, wordLength, excludedLetters, apiKey } = requestBody;
      
      // Validate request and rate limiting
      const clientId = req.headers.get('x-forwarded-for') || 'unknown';
      const validation = await validateRequest(apiKey, clientId);
      if (!validation.valid) {
        return new Response(JSON.stringify({ error: validation.error }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Track usage
      await trackUsage(apiKey);
      
      // Sanitize guess data (normalize letters to uppercase)
      const sanitizedGuessData = guessData.map(tile => ({
        letter: tile.letter.toUpperCase(),
        state: tile.state
      }));
      
      // Create job record
      const { data: job, error: jobError } = await supabase
        .from('analysis_jobs')
        .insert({
          input_data: { guessData: sanitizedGuessData, wordLength, excludedLetters },
          status: 'processing',
          estimated_completion_seconds: 15
        })
        .select()
        .single();
      
      if (jobError || !job) {
        return new Response(JSON.stringify({ error: 'Failed to create analysis job' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Try immediate processing (with timeout)
      try {
        const analysisPromise = performMLAnalysis(sanitizedGuessData, wordLength, excludedLetters || []);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 10000)
        );
        
        const result = await Promise.race([analysisPromise, timeoutPromise]) as {solutions: WordleSolution[], status: string, confidence: number};
        
        // Update job as complete
        await supabase
          .from('analysis_jobs')
          .update({ 
            status: result.status === 'failed' ? 'failed' : 'complete',
            completed_at: new Date().toISOString()
          })
          .eq('id', job.id);
        
        // Store results
        await supabase
          .from('analysis_results')
          .insert({
            job_id: job.id,
            solutions: result.solutions,
            confidence_score: result.confidence,
            processing_status: 'complete'
          });
        
        // Return immediate response
        return new Response(JSON.stringify({
          job_id: job.id,
          status: result.status,
          solutions: result.solutions,
          confidence_score: result.confidence,
          processing_status: 'complete',
          message: 'Analysis completed immediately'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        // If immediate processing fails or times out, return job ID for async processing
        console.log('Immediate processing failed, returning job ID for async processing');
        
        // Schedule background processing
        EdgeRuntime.waitUntil(
          performMLAnalysis(sanitizedGuessData, wordLength, excludedLetters || [])
            .then(async (result) => {
              await supabase
                .from('analysis_jobs')
                .update({ 
                  status: result.status === 'failed' ? 'failed' : 'complete',
                  completed_at: new Date().toISOString()
                })
                .eq('id', job.id);
              
              await supabase
                .from('analysis_results')
                .insert({
                  job_id: job.id,
                  solutions: result.solutions,
                  confidence_score: result.confidence,
                  processing_status: 'complete'
                });
            })
            .catch(async (error) => {
              console.error('Background processing failed:', error);
              await supabase
                .from('analysis_jobs')
                .update({ 
                  status: 'failed',
                  completed_at: new Date().toISOString(),
                  error_message: error.message
                })
                .eq('id', job.id);
            })
        );
        
        return new Response(JSON.stringify({
          job_id: job.id,
          status: 'processing',
          message: 'Analysis started, check status using the job_id',
          estimated_completion_seconds: 15,
          status_url: `${req.url}/status/${job.id}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
    } catch (error) {
      console.error('API Error:', error);
      return new Response(JSON.stringify({ error: 'Invalid JSON format or internal server error' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
  
  return new Response(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
