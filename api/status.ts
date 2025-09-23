export const config = {
  runtime: 'edge',
};

const SUPABASE_FUNCTION_URL = 'https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api';

export default async function handler(request: Request): Promise<Response> {
  // Enhanced debug logging for deployment verification
  console.log(`[VERCEL EDGE STATUS] Function executing - ${new Date().toISOString()}`);
  console.log(`[VERCEL EDGE STATUS] Request: ${request.method} ${request.url}`);
  console.log(`[VERCEL EDGE STATUS] Environment check:`, {
    hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV
  });
  
  // Set CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    // Ensure only GET requests are processed
    if (request.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[VERCEL EDGE STATUS] Processing GET request`);

    // Extract jobId and sessionToken from URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(part => part);
    
    // Expected path: /api/wordle-solver/status/{jobId}/{sessionToken} or query params
    let jobId = url.searchParams.get('jobId');
    let sessionToken = url.searchParams.get('sessionToken');
    
    // If not in query params, try to extract from path
    if (!jobId || !sessionToken) {
      // Find the indices for jobId and sessionToken in the path
      const statusIndex = pathParts.indexOf('status');
      if (statusIndex >= 0 && statusIndex + 2 < pathParts.length) {
        jobId = pathParts[statusIndex + 1];
        sessionToken = pathParts[statusIndex + 2];
      }
    }

    if (!jobId || !sessionToken) {
      console.error('[VERCEL EDGE STATUS] Missing jobId or sessionToken in path or query params');
      return new Response(JSON.stringify({ 
        error: 'Invalid request', 
        message: 'Missing jobId or sessionToken parameters' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`[VERCEL EDGE STATUS] Processing status check for job: ${jobId}`);

    // Construct target URL for Supabase Edge Function  
    const targetUrl = `${SUPABASE_FUNCTION_URL}/${jobId}/${sessionToken}`;
    
    // Check for environment variables (no fallback to force proper configuration)
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseAnonKey) {
      console.error('[VERCEL EDGE STATUS] Missing SUPABASE_ANON_KEY environment variable');
      return new Response(JSON.stringify({ 
        error: 'Configuration error',
        message: 'Missing Supabase configuration'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'apikey': supabaseAnonKey,
    };

    // Forward relevant headers from original request
    const apiKey = request.headers.get('x-api-key');
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }
    
    const authorization = request.headers.get('authorization');
    if (authorization) {
      headers['authorization'] = authorization;
    }

    // Forward client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('cf-connecting-ip');
    if (clientIp) {
      headers['x-forwarded-for'] = clientIp;
    }

    console.log(`[VERCEL EDGE STATUS] Forwarding to: ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    console.log(`[VERCEL EDGE STATUS] Supabase response status: ${response.status}`);
    console.log(`[VERCEL EDGE STATUS] Supabase response content-type: ${response.headers.get('Content-Type')}`);

    const data = await response.text();
    
    // Ensure we're returning JSON, not HTML
    const contentType = response.headers.get('Content-Type') || 'application/json';
    if (contentType.includes('text/html')) {
      console.error('[VERCEL EDGE STATUS] Received HTML response from Supabase, expected JSON');
      return new Response(JSON.stringify({ 
        error: 'Unexpected response format',
        message: 'Service temporarily unavailable'
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Forward response with CORS headers
    return new Response(data, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('[VERCEL EDGE STATUS] Edge Function API Proxy Error:', error);
    return new Response(JSON.stringify({ 
      error: 'API proxy failed',
      message: 'Unable to connect to status service',
      environment: 'vercel-edge-deployment',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}