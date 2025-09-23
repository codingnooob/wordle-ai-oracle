import type { Config } from "https://edge.netlify.com";

export default async (request: Request) => {
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
        runtime: 'netlify-edge',
        region: Deno.env.get('NETLIFY_REGION') || 'unknown',
        hasSupabaseKey: !!Deno.env.get('SUPABASE_ANON_KEY'),
        supabaseKeyPreview: Deno.env.get('SUPABASE_ANON_KEY') ? 
          Deno.env.get('SUPABASE_ANON_KEY')!.substring(0, 10) + '...' : 'MISSING'
      },
      message: 'Netlify Edge Function is working correctly'
    };

    console.log(`[NETLIFY EDGE] Health check executed successfully`);

    return new Response(JSON.stringify(healthData, null, 2), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('[NETLIFY EDGE] Health check error:', error);
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
};

export const config: Config = {
  path: "/api/health"
};