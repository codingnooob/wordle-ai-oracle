export const config = {
  runtime: 'edge',
};

const SUPABASE_FUNCTION_URL = 'https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api';

export default async function handler(request: Request): Promise<Response> {
  console.log(`[STATUS API] Function executing - ${new Date().toISOString()}`);
  console.log(`[STATUS API] Request: ${request.method} ${request.url}`);
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ 
      error: 'Method not allowed',
      message: 'Only GET requests are allowed for status endpoint'
    }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const url = new URL(request.url);
    
    // Extract jobId and sessionToken from query params or path
    let jobId = url.searchParams.get('jobId');
    let sessionToken = url.searchParams.get('sessionToken');
    
    // If not in query params, try to extract from path
    if (!jobId || !sessionToken) {
      const pathParts = url.pathname.split('/');
      const statusIndex = pathParts.findIndex(part => part === 'status');
      
      if (statusIndex !== -1 && pathParts.length > statusIndex + 2) {
        jobId = pathParts[statusIndex + 1];
        sessionToken = pathParts[statusIndex + 2];
      }
    }

    if (!jobId || !sessionToken) {
      return new Response(JSON.stringify({
        error: 'Missing parameters',
        message: 'jobId and sessionToken are required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Construct the target URL for Supabase function
    const targetUrl = `${SUPABASE_FUNCTION_URL}/status/${jobId}/${sessionToken}`;
    
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseAnonKey) {
      console.error('[STATUS API] Missing SUPABASE_ANON_KEY environment variable');
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

    // Forward client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('cf-connecting-ip');
    if (clientIp) {
      headers['x-forwarded-for'] = clientIp;
    }

    console.log(`[STATUS API] Forwarding to: ${targetUrl}`);
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    console.log(`[STATUS API] Supabase response status: ${response.status}`);

    const data = await response.text();
    
    // Forward response with CORS headers
    return new Response(data, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('[STATUS API] Status API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Status check failed',
      message: 'Unable to check job status',
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