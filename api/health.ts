export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request): Promise<Response> {
  console.log(`[HEALTH CHECK] Function executing - ${new Date().toISOString()}`);
  console.log(`[HEALTH CHECK] Request: ${request.method} ${request.url}`);
  
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

  try {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        hasSupabaseKey: !!process.env.SUPABASE_ANON_KEY,
        supabaseKeyPreview: process.env.SUPABASE_ANON_KEY ? 
          process.env.SUPABASE_ANON_KEY.substring(0, 10) + '...' : 'MISSING'
      },
      runtime: 'edge',
      message: 'Vercel Edge Function is working correctly'
    };

    console.log(`[HEALTH CHECK] Health data:`, healthData);

    return new Response(JSON.stringify(healthData, null, 2), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('[HEALTH CHECK] Error:', error);
    return new Response(JSON.stringify({ 
      status: 'error',
      message: error.message,
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