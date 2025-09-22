import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_FUNCTION_URL = 'https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type, x-api-key');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests for status endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { params } = req.query;
    
    if (!params || !Array.isArray(params) || params.length < 2) {
      return res.status(400).json({ 
        error: 'Invalid status request. Required: /status/{jobId}/{sessionToken}' 
      });
    }

    const [jobId, sessionToken] = params;
    
    if (!jobId || !sessionToken) {
      return res.status(400).json({ 
        error: 'Missing job ID or session token' 
      });
    }

    // Forward request to Supabase Edge Function
    const targetUrl = `${SUPABASE_FUNCTION_URL}/status/${jobId}/${encodeURIComponent(sessionToken)}`;
    
    const headers: Record<string, string> = {};
    
    // Forward relevant headers
    if (req.headers['authorization']) {
      headers['authorization'] = req.headers['authorization'] as string;
    }

    // Forward client IP for security logging
    const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress;
    if (clientIp) {
      headers['x-forwarded-for'] = clientIp as string;
    }

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    
    // Forward response status and data
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Status API Proxy Error:', error);
    res.status(500).json({ 
      error: 'Status check failed',
      message: 'Unable to connect to status service'
    });
  }
}