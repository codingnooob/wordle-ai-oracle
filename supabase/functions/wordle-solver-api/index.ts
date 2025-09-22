
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './corsConfig.ts';
import { WordleAPIRequest } from './types.ts';
import { validateWordleRequest } from './validation.ts';
import { validateRequest, trackUsage, validateRequestSize } from './rateLimit.ts';
import { performMLAnalysis } from './analysis.ts';
import { createJob, updateJobStatus, storeResults, getJobStatus } from './jobManager.ts';

// Security utilities (inline since we can't import from src/ in edge functions)
function secureLog(message: string, data?: any, level: 'info' | 'warn' | 'error' = 'info'): void {
  if (level === 'error') {
    console.error(`[SECURITY-${level.toUpperCase()}] ${message}`, data);
  } else if (level === 'warn') {
    console.warn(`[SECURITY-${level.toUpperCase()}] ${message}`, data);
  } else {
    console.log(`[SECURITY-${level.toUpperCase()}] ${message}`, data);
  }
}

function getSafeErrorMessage(error: Error, context: string): string {
  const isDev = Deno.env.get('ENVIRONMENT') === 'development';
  if (isDev) {
    return `${context}: ${error.message}`;
  }
  return 'An error occurred while processing your request';
}

function generateRequestFingerprint(request: Request): string {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const acceptLanguage = request.headers.get('accept-language') || 'unknown';
  const acceptEncoding = request.headers.get('accept-encoding') || 'unknown';
  
  // Create a basic fingerprint (don't use crypto for edge functions)
  const fingerprint = btoa(`${userAgent}-${acceptLanguage}-${acceptEncoding}-${url.pathname}`).slice(0, 16);
  return fingerprint;
}

function getSecureResponseHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache'
  };
}

serve(async (req) => {
  // Security headers
  const secureHeaders = {
    ...corsHeaders,
    ...getSecureResponseHeaders()
  };
  
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: secureHeaders });
    }

    // Generate request fingerprint for security
    const fingerprint = generateRequestFingerprint(req);
    secureLog('API request received', { fingerprint, method: req.method }, 'info');

    const url = new URL(req.url);
    const path = url.pathname;

    // Handle status check endpoint with enhanced security
    if (req.method === 'GET' && path.includes('/status/')) {
      const pathParts = path.split('/status/')[1];
      const [jobId, encodedSessionToken] = pathParts.split('/');
      
      if (!encodedSessionToken) {
        secureLog('Status check missing session token', { jobId }, 'warn');
        return new Response(JSON.stringify({ error: 'Session token required' }), {
          status: 401,
          headers: { ...secureHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      try {
        // URL decode the session token to handle special characters
        const sessionToken = decodeURIComponent(encodedSessionToken);
        secureLog('Status check request', { jobId }, 'info');
        
        const jobStatus = await getJobStatus(jobId, sessionToken);
        
        if (!jobStatus) {
          secureLog('Status check failed - invalid job/token', { jobId }, 'warn');
          return new Response(JSON.stringify({ error: 'Job not found or invalid session token' }), {
            status: 404,
            headers: { ...secureHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        return new Response(JSON.stringify(jobStatus), {
          headers: { ...secureHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        const safeError = getSafeErrorMessage(error, 'Status Check');
        secureLog('Status check error', { jobId, error: safeError }, 'error');
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: { ...secureHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Handle main API endpoint
    if (req.method === 'POST') {
      try {
        // Validate request size first
        const sizeValidation = validateRequestSize(req);
        if (!sizeValidation.valid) {
          secureLog('Request size validation failed', { error: sizeValidation.error }, 'warn');
          return new Response(JSON.stringify({ error: sizeValidation.error }), {
            status: 413,
            headers: { ...secureHeaders, 'Content-Type': 'application/json' }
          });
        }

        let requestBody: WordleAPIRequest;
        try {
          requestBody = await req.json();
        } catch (error) {
          secureLog('Invalid JSON in request', { error: error.message }, 'warn');
          return new Response(JSON.stringify({ error: 'Invalid JSON format' }), {
            status: 400,
            headers: { ...secureHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // Validate input format first
        const inputValidation = validateWordleRequest(requestBody);
        if (!inputValidation.valid) {
          secureLog('Request validation failed', { error: inputValidation.error }, 'warn');
          return new Response(JSON.stringify({ error: inputValidation.error }), {
            status: 400,
            headers: { ...secureHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const { guessData, wordLength, excludedLetters, positionExclusions, apiKey, responseMode = 'auto' } = requestBody;
        
        // Extract client info for rate limiting with better IP handling
        const rawIP = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     req.headers.get('cf-connecting-ip') || // Cloudflare
                     'unknown';
        
        // Log all IP headers for debugging
        secureLog('IP Headers Debug', {
          'x-forwarded-for': req.headers.get('x-forwarded-for'),
          'x-real-ip': req.headers.get('x-real-ip'),
          'cf-connecting-ip': req.headers.get('cf-connecting-ip'),
          'final-raw-ip': rawIP
        }, 'info');
        
        const sourceIp = rawIP;
        const clientId = req.headers.get('x-client-id') || 'unknown';
        
        // Validate request and rate limiting
        const validation = await validateRequest(apiKey, clientId, sourceIp);
        if (!validation.valid) {
          secureLog('Rate limit exceeded', { 
            sourceIp, 
            apiKey: apiKey ? 'present' : 'none',
            error: validation.error 
          }, 'warn');
          return new Response(JSON.stringify({ error: validation.error }), {
            status: 429,
            headers: { 
              ...secureHeaders, 
              'Content-Type': 'application/json',
              'Retry-After': '60'
            }
          });
        }
        
        // Track usage with IP for security monitoring
        await trackUsage(apiKey, sourceIp);
        
        // Sanitize guess data (normalize letters to uppercase)
        const sanitizedGuessData = guessData.map(tile => ({
          letter: tile.letter.toUpperCase(),
          state: tile.state
        }));
        
        // Create job record with enhanced security data
        const job = await createJob({ 
          guessData: sanitizedGuessData, 
          wordLength, 
          excludedLetters,
          source_ip: sourceIp,
          clientFingerprint: fingerprint
        });

        // Create hashed session token for enhanced security
        if (job) {
          try {
            await supabase.rpc('create_hashed_session_token', {
              token_param: job.session_token,
              job_id_param: job.id
            });
            secureLog('Hashed session token created', { jobId: job.id }, 'info');
          } catch (tokenError) {
            secureLog('Failed to create hashed session token', { 
              jobId: job.id,
              error: getSafeErrorMessage(tokenError as Error, 'create_hashed_session_token')
            }, 'warn');
          }
        }
        
        secureLog('Job created', { jobId: job.id, responseMode }, 'info');
        
        // Handle different response modes with better error handling
        if (responseMode === 'immediate') {
          try {
            secureLog('Starting immediate analysis', { jobId: job.id }, 'info');
            const analysisPromise = performMLAnalysis(sanitizedGuessData, wordLength, excludedLetters || [], positionExclusions || {});
            const analysisResult = await Promise.race([
              analysisPromise,
              new Promise((_, reject) => setTimeout(() => reject(new Error('Analysis timeout after 8 seconds')), 8000))
            ]) as any;

            // Validate result object structure before accessing properties
            if (!analysisResult || typeof analysisResult !== 'object' || analysisResult instanceof Error) {
              throw new Error('Invalid analysis result structure or timeout occurred');
            }

            // Safely access properties with fallback values
            const solutions = analysisResult.solutions || [];
            const status = analysisResult.status || 'partial';
            const confidence = analysisResult.confidence || 0.0;

            const statusUpdate = await updateJobStatus(
              job.id, 
              status === 'failed' ? 'failed' : 'complete',
              new Date().toISOString()
            );
            
            const resultsStorage = await storeResults(job.id, solutions, confidence, 'complete');
            
            // Log failures but don't crash the request
            if (!statusUpdate.success) {
              secureLog('Failed to update job status in immediate mode', { jobId: job.id, error: statusUpdate.error }, 'error');
            }
            if (!resultsStorage.success) {
              secureLog('Failed to store results in immediate mode', { jobId: job.id, error: resultsStorage.error }, 'error');
            }
            secureLog('Immediate analysis completed', { jobId: job.id, solutionCount: solutions.length }, 'info');

            return new Response(JSON.stringify({
              job_id: job.id,
              session_token: job.session_token,
              solutions: solutions,
              status: solutions.length > 0 ? 'complete' : 'partial',
              confidence: confidence,
              processing_status: 'complete',
              response_mode: 'immediate'
            }), {
              headers: { ...secureHeaders, 'Content-Type': 'application/json' }
            });
          } catch (error) {
            const safeError = getSafeErrorMessage(error, 'Immediate Analysis');
            secureLog('Immediate analysis failed', { jobId: job.id, error: safeError }, 'error');
            return new Response(JSON.stringify({
              error: 'Immediate processing failed. Analysis took too long or encountered an error.',
              job_id: job.id,
              session_token: job.session_token,
              status: 'failed',
              response_mode: 'immediate'
            }), {
              status: 408,
              headers: { ...secureHeaders, 'Content-Type': 'application/json' }
            });
          }
        }

        if (responseMode === 'async') {
          secureLog('Starting async processing', { jobId: job.id }, 'info');
          
          // Use modern EdgeRuntime.waitUntil for background processing
          const backgroundTask = async () => {
            try {
              secureLog('Background task started', { jobId: job.id }, 'info');
              const result = await performMLAnalysis(sanitizedGuessData, wordLength, excludedLetters || [], positionExclusions || {});
              
              // Validate result object structure before accessing properties
              if (!result || typeof result !== 'object' || result instanceof Error) {
                throw new Error('Invalid analysis result structure');
              }

              // Safely access properties with fallback values
              const solutions = result.solutions || [];
              const status = result.status || 'partial';
              const confidence = result.confidence || 0.0;
              
              const statusUpdate = await updateJobStatus(
                job.id, 
                status === 'failed' ? 'failed' : 'complete',
                new Date().toISOString()
              );
              
              const resultsStorage = await storeResults(job.id, solutions, confidence, 'complete');
              
              // Log failures but don't crash background processing
              if (!statusUpdate.success) {
                secureLog('Failed to update job status in async mode', { jobId: job.id, error: statusUpdate.error }, 'error');
              }
              if (!resultsStorage.success) {
                secureLog('Failed to store results in async mode', { jobId: job.id, error: resultsStorage.error }, 'error');
              }
              secureLog('Async analysis completed', { jobId: job.id, solutionCount: solutions.length }, 'info');
            } catch (error) {
              const safeError = getSafeErrorMessage(error, 'Async Analysis');
              secureLog('Async analysis failed', { jobId: job.id, error: safeError }, 'error');
              await updateJobStatus(
                job.id, 
                'failed',
                new Date().toISOString(),
                safeError
              );
            }
          };
          
          // Execute background task
          if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
            EdgeRuntime.waitUntil(backgroundTask());
          } else {
            // Fallback for environments without EdgeRuntime
            backgroundTask().catch((error) => {
              secureLog('Background task fallback failed', { jobId: job.id, error: error.message }, 'error');
            });
          }
          
          // Generate proper status URL based on request origin
          const requestOrigin = req.headers.get('origin') || '';
          const currentUrl = new URL(req.url);
          const isCustomDomain = !currentUrl.hostname.includes('supabase.co');
          
          let statusUrl: string;
          if (isCustomDomain) {
            // For custom domains, construct URL from the current request
            statusUrl = `https://${currentUrl.hostname}/api/wordle-solver/status/${job.id}/${encodedSessionToken}`;
          } else {
            // For direct Supabase calls, use the direct function URL
            statusUrl = `https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api/status/${job.id}/${encodedSessionToken}`;
          }
          
          return new Response(JSON.stringify({
            job_id: job.id,
            session_token: job.session_token,
            status: 'processing',
            message: 'Analysis started. Use the status endpoint to check progress.',
            estimated_completion_seconds: 15,
            response_mode: 'async',
            status_url: statusUrl
          }), {
            status: 202,
            headers: { ...secureHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Default 'auto' mode: Try immediate, fallback to async
        try {
          const analysisPromise = performMLAnalysis(sanitizedGuessData, wordLength, excludedLetters || [], positionExclusions || {});
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Analysis timeout after 10 seconds')), 10000)
          );
          
          const result = await Promise.race([analysisPromise, timeoutPromise]);
          
          // Validate result object structure before accessing properties
          secureLog('Auto mode analysis result type check', { jobId: job.id, resultType: typeof result, hasProperties: result && typeof result === 'object' }, 'info');
          
          if (!result || typeof result !== 'object' || result instanceof Error) {
            throw new Error('Invalid analysis result structure or timeout occurred');
          }
          
          // Safely access properties with fallback values
          const solutions = result.solutions || [];
          const status = result.status || 'partial';
          const confidence = result.confidence || 0.0;
          
          const statusUpdate = await updateJobStatus(
            job.id, 
            status === 'failed' ? 'failed' : 'complete',
            new Date().toISOString()
          );
          
          const resultsStorage = await storeResults(job.id, solutions, confidence, 'complete');
          
          // Log failures but don't crash the request
          if (!statusUpdate.success) {
            secureLog('Failed to update job status in auto mode', { jobId: job.id, error: statusUpdate.error }, 'error');
          }
          if (!resultsStorage.success) {
            secureLog('Failed to store results in auto mode', { jobId: job.id, error: resultsStorage.error }, 'error');
          }
          secureLog('Auto mode immediate analysis completed', { jobId: job.id, solutionCount: solutions.length }, 'info');
          
          return new Response(JSON.stringify({
            job_id: job.id,
            session_token: job.session_token,
            status: status,
            solutions: solutions,
            confidence_score: confidence,
            processing_status: 'complete',
            response_mode: 'immediate',
            message: 'Analysis completed immediately'
          }), {
            headers: { ...secureHeaders, 'Content-Type': 'application/json' }
          });
          
        } catch (error) {
          secureLog('Auto mode falling back to async', { jobId: job.id }, 'info');
          
          // Use modern EdgeRuntime.waitUntil for background processing
          const backgroundTask = async () => {
            try {
              secureLog('Auto mode background task started', { jobId: job.id }, 'info');
              const result = await performMLAnalysis(sanitizedGuessData, wordLength, excludedLetters || [], positionExclusions || {});
              
              // Validate result object structure before accessing properties
              if (!result || typeof result !== 'object' || result instanceof Error) {
                throw new Error('Invalid analysis result structure');
              }

              // Safely access properties with fallback values
              const solutions = result.solutions || [];
              const status = result.status || 'partial';
              const confidence = result.confidence || 0.0;
              
              const statusUpdate = await updateJobStatus(
                job.id, 
                status === 'failed' ? 'failed' : 'complete',
                new Date().toISOString()
              );
              
              const resultsStorage = await storeResults(job.id, solutions, confidence, 'complete');
              
              // Log failures but continue background processing
              if (!statusUpdate.success) {
                secureLog('Failed to update job status in background task', { jobId: job.id, error: statusUpdate.error }, 'error');
              }
              if (!resultsStorage.success) {
                secureLog('Failed to store results in background task', { jobId: job.id, error: resultsStorage.error }, 'error');
              }
              secureLog('Auto mode async analysis completed', { jobId: job.id, solutionCount: solutions.length }, 'info');
            } catch (error) {
              const safeError = getSafeErrorMessage(error, 'Auto Mode Async Analysis');
              secureLog('Auto mode async analysis failed', { jobId: job.id, error: safeError }, 'error');
              const statusUpdate = await updateJobStatus(
                job.id, 
                'failed',
                new Date().toISOString(),
                safeError
              );
              
              // Log failure but don't throw - we're already in error handling
              if (!statusUpdate.success) {
                secureLog('Failed to update job status to failed', { jobId: job.id, error: statusUpdate.error }, 'error');
              }
            }
          };
          
          // Execute background task
          if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
            EdgeRuntime.waitUntil(backgroundTask());
          } else {
            // Fallback for environments without EdgeRuntime
            backgroundTask().catch((error) => {
              secureLog('Auto mode background task fallback failed', { jobId: job.id, error: error.message }, 'error');
            });
          }
          
          // Generate proper status URL based on request origin
          const currentUrl = new URL(req.url);
          const isCustomDomain = !currentUrl.hostname.includes('supabase.co');
          
          let statusUrl: string;
          if (isCustomDomain) {
            // For custom domains, construct URL from the current request
            statusUrl = `https://${currentUrl.hostname}/api/wordle-solver/status/${job.id}/${encodedSessionToken}`;
          } else {
            // For direct Supabase calls, use the direct function URL
            statusUrl = `https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api/status/${job.id}/${encodedSessionToken}`;
          }
          
          return new Response(JSON.stringify({
            job_id: job.id,
            session_token: job.session_token,
            status: 'processing',
            message: 'Analysis started, check status using the job_id and session_token',
            estimated_completion_seconds: 15,
            response_mode: 'async',
            status_url: statusUrl
          }), {
            headers: { ...secureHeaders, 'Content-Type': 'application/json' }
          });
        }
        
      } catch (error) {
        const safeError = getSafeErrorMessage(error, 'API Handler');
        secureLog('Unhandled API error', { error: safeError }, 'error');
        return new Response(JSON.stringify({ error: 'Internal server error' }), {
          status: 500,
          headers: { ...secureHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...secureHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    const safeError = getSafeErrorMessage(error, 'Request Handler');
    secureLog('Critical API error', { error: safeError }, 'error');
    
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
