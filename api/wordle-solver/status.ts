export const runtime = 'edge';

const SUPABASE_FUNCTION_URL = 'https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api';

export default async function handler(request: Request): Promise<Response> {
  // Debug logging
  console.log(`[API DEBUG] Status API called: ${request.method} ${request.url}`);
  console.log(`[API DEBUG] Headers:`, Object.fromEntries(request.headers.entries()));
  
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

  // Only allow GET requests for status endpoint
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    
    // Extract jobId and sessionToken from path
    // Expected format: /api/wordle-solver/status/{jobId}/{sessionToken}
    const jobIdIndex = pathParts.findIndex(part => part === 'status') + 1;
    const jobId = pathParts[jobIdIndex];
    const sessionToken = pathParts[jobIdIndex + 1];
    
    if (!jobId || !sessionToken) {
      return new Response(JSON.stringify({ 
        error: 'Invalid status request. Required: /api/wordle-solver/status/{jobId}/{sessionToken}',
        path: url.pathname,
        pathParts: pathParts
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    // Forward request to Supabase Edge Function
    const targetUrl = `${SUPABASE_FUNCTION_URL}/status/${jobId}/${encodeURIComponent(sessionToken)}`;
    
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdHBmdXF2cHZrY2RpZHlpb3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MTM4NzksImV4cCI6MjA2NjQ4OTg3OX0.fneT0q0WENCgPK5JV_VlSqxYKy_q5oX97SMOLdEhcPA';
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'apikey': supabaseAnonKey,
    };
    
    // Forward relevant headers from original request
    const authorization = request.headers.get('authorization');
    if (authorization) {
      headers['authorization'] = authorization;
    }

    // Forward client IP for security logging
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('cf-connecting-ip');
    if (clientIp) {
      headers['x-forwarded-for'] = clientIp;
    }

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    const data = await response.text();
    
    // Forward response with CORS headers
    return new Response(data, {
      status: response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': response.headers.get('Content-Type') || 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Status Edge Function API Proxy Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Status check failed',
      message: 'Unable to connect to status service',
      environment: 'custom-domain-edge'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
}