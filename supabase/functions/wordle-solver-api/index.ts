
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './corsConfig.ts';
import { WordleAPIRequest } from './types.ts';
import { validateWordleRequest } from './validation.ts';
import { validateRequest, trackUsage, validateRequestSize } from './rateLimit.ts';
import { performMLAnalysis } from './analysis.ts';
import { createJob, updateJobStatus, storeResults, getJobStatus } from './jobManager.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

      // Handle status check endpoint
      if (req.method === 'GET' && path.includes('/status/')) {
        const pathParts = path.split('/status/')[1];
        const [jobId, encodedSessionToken] = pathParts.split('/');
        
        if (!encodedSessionToken) {
          return new Response(JSON.stringify({ error: 'Session token required' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        try {
          // URL decode the session token to handle special characters
          const sessionToken = decodeURIComponent(encodedSessionToken);
          console.log(`Status check for job: ${jobId}, session token: ${sessionToken.substring(0, 10)}...`);
          
          const jobStatus = await getJobStatus(jobId, sessionToken);
          
          if (!jobStatus) {
            return new Response(JSON.stringify({ error: 'Job not found or invalid session token' }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          
          return new Response(JSON.stringify(jobStatus), {
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
      // Validate request size first
      const sizeValidation = validateRequestSize(req);
      if (!sizeValidation.valid) {
        return new Response(JSON.stringify({ error: sizeValidation.error }), {
          status: 413,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const requestBody: WordleAPIRequest = await req.json();
      
      // Validate input format first
      const inputValidation = validateWordleRequest(requestBody);
      if (!inputValidation.valid) {
        return new Response(JSON.stringify({ error: inputValidation.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const { guessData, wordLength, excludedLetters, positionExclusions, apiKey, responseMode = 'auto' } = requestBody;
      
      // Validate request and rate limiting
      const sourceIp = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown';
      const clientId = req.headers.get('x-forwarded-for') || 'unknown';
      
      const validation = await validateRequest(apiKey, clientId, sourceIp);
      if (!validation.valid) {
        return new Response(JSON.stringify({ error: validation.error }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Track usage with IP for security monitoring
      await trackUsage(apiKey, sourceIp);
      
      // Sanitize guess data (normalize letters to uppercase)
      const sanitizedGuessData = guessData.map(tile => ({
        letter: tile.letter.toUpperCase(),
        state: tile.state
      }));
      
      // Create job record with source IP for tracking
      const job = await createJob({ 
        guessData: sanitizedGuessData, 
        wordLength, 
        excludedLetters,
        source_ip: sourceIp
      });
      
      // Handle different response modes
      if (responseMode === 'immediate') {
        // Force immediate processing only
        try {
          console.log('Starting immediate ML analysis...');
          const analysisPromise = performMLAnalysis(sanitizedGuessData, wordLength, excludedLetters || [], positionExclusions || {});
          const analysisResult = await Promise.race([
            analysisPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error('Analysis timeout')), 8000))
          ]) as any;

          // Update job as complete
          await updateJobStatus(
            job.id, 
            analysisResult.status === 'failed' ? 'failed' : 'complete',
            new Date().toISOString()
          );
          
          // Store results
          await storeResults(job.id, analysisResult.solutions, analysisResult.confidence, 'complete');

          return new Response(JSON.stringify({
            job_id: job.id,
            session_token: job.session_token,
            solutions: analysisResult.solutions || [],
            status: analysisResult.solutions?.length > 0 ? 'complete' : 'partial',
            confidence: analysisResult.confidence || 0.95,
            processing_status: 'complete',
            response_mode: 'immediate'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('Immediate analysis failed:', error);
          return new Response(JSON.stringify({
            error: 'Immediate processing failed. Analysis took too long or encountered an error.',
            job_id: job.id,
            session_token: job.session_token,
            status: 'failed',
            response_mode: 'immediate'
          }), {
            status: 408,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      if (responseMode === 'async') {
        // Force async processing
        console.log('Forcing async processing...');
        EdgeRuntime.waitUntil(
          performMLAnalysis(sanitizedGuessData, wordLength, excludedLetters || [], positionExclusions || {})
            .then(async (result) => {
              await updateJobStatus(
                job.id, 
                result.status === 'failed' ? 'failed' : 'complete',
                new Date().toISOString()
              );
              
              await storeResults(job.id, result.solutions, result.confidence, 'complete');
            })
            .catch(async (error) => {
              console.error('Background processing failed:', error);
              await updateJobStatus(
                job.id, 
                'failed',
                new Date().toISOString(),
                error.message
              );
            })
        );
        
        // Construct proper base URL for status endpoint
        const baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
        const encodedSessionToken = encodeURIComponent(job.session_token);
        
        return new Response(JSON.stringify({
          job_id: job.id,
          session_token: job.session_token,
          status: 'processing',
          message: 'Analysis started. Use the status endpoint to check progress.',
          estimated_completion_seconds: 15,
          response_mode: 'async',
          status_url: `${baseUrl}/status/${job.id}/${encodedSessionToken}`
        }), {
          status: 202,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Default 'auto' mode: Try immediate, fallback to async
      try {
        const analysisPromise = performMLAnalysis(sanitizedGuessData, wordLength, excludedLetters || [], positionExclusions || {});
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), 10000)
        );
        
        const result = await Promise.race([analysisPromise, timeoutPromise]);
        
        // Update job as complete
        await updateJobStatus(
          job.id, 
          result.status === 'failed' ? 'failed' : 'complete',
          new Date().toISOString()
        );
        
        // Store results
        await storeResults(job.id, result.solutions, result.confidence, 'complete');
        
        // Return immediate response
        return new Response(JSON.stringify({
          job_id: job.id,
          session_token: job.session_token,
          status: result.status,
          solutions: result.solutions,
          confidence_score: result.confidence,
          processing_status: 'complete',
          response_mode: 'immediate',
          message: 'Analysis completed immediately'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        // If immediate processing fails or times out, return job ID for async processing
        console.log('Immediate processing failed, returning job ID for async processing');
        
        // Schedule background processing
        EdgeRuntime.waitUntil(
          performMLAnalysis(sanitizedGuessData, wordLength, excludedLetters || [], positionExclusions || {})
            .then(async (result) => {
              await updateJobStatus(
                job.id, 
                result.status === 'failed' ? 'failed' : 'complete',
                new Date().toISOString()
              );
              
              await storeResults(job.id, result.solutions, result.confidence, 'complete');
            })
            .catch(async (error) => {
              console.error('Background processing failed:', error);
              await updateJobStatus(
                job.id, 
                'failed',
                new Date().toISOString(),
                error.message
              );
            })
        );
        
        // Construct proper base URL for status endpoint
        const baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
        const encodedSessionToken = encodeURIComponent(job.session_token);
        
        return new Response(JSON.stringify({
          job_id: job.id,
          session_token: job.session_token,
          status: 'processing',
          message: 'Analysis started, check status using the job_id and session_token',
          estimated_completion_seconds: 15,
          response_mode: 'async',
          status_url: `${baseUrl}/status/${job.id}/${encodedSessionToken}`
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
