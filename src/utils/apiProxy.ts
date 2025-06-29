
const SUPABASE_FUNCTION_URL = 'https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1';

export const proxyToSupabase = async (
  functionName: string,
  request: Request,
  pathSuffix: string = ''
): Promise<Response> => {
  try {
    const url = new URL(request.url);
    const targetUrl = `${SUPABASE_FUNCTION_URL}/${functionName}${pathSuffix}${url.search}`;
    
    const headers = new Headers();
    // Copy relevant headers from original request
    for (const [key, value] of request.headers.entries()) {
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'origin') {
        headers.set(key, value);
      }
    }
    
    const proxyRequest = new Request(targetUrl, {
      method: request.method,
      headers,
      body: request.method !== 'GET' ? await request.blob() : null,
    });
    
    const response = await fetch(proxyRequest);
    
    // Create response with proper CORS headers
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type, x-api-key');
    responseHeaders.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('API Proxy Error:', error);
    return new Response(JSON.stringify({ error: 'API proxy failed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
