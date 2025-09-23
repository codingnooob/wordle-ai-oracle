export const runtime = 'edge';

const SUPABASE_FUNCTION_URL = 'https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api';

export default async function handler(request: Request): Promise<Response> {
  // Debug logging
  console.log(`[API DEBUG] Wordle Solver API called: ${request.method} ${request.url}`);
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

  try {
    // Forward request to Supabase Edge Function
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjdHBmdXF2cHZrY2RpZHlpb3d1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MTM4NzksImV4cCI6MjA2NjQ4OTg3OX0.fneT0q0WENCgPK5JV_VlSqxYKy_q5oX97SMOLdEhcPA';
    
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

    const body = request.method !== 'GET' ? await request.text() : undefined;

    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: request.method,
      headers,
      body,
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
    console.error('Edge Function API Proxy Error:', error);
    return new Response(JSON.stringify({ 
      error: 'API proxy failed',
      message: 'Unable to connect to analysis service',
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