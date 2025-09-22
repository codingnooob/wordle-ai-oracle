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

  try {
    // Forward request to Supabase Edge Function
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Forward relevant headers
    if (req.headers['x-api-key']) {
      headers['x-api-key'] = req.headers['x-api-key'] as string;
    }
    if (req.headers['authorization']) {
      headers['authorization'] = req.headers['authorization'] as string;
    }

    // Forward client IP for rate limiting
    const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection?.remoteAddress;
    if (clientIp) {
      headers['x-forwarded-for'] = clientIp as string;
    }

    const response = await fetch(SUPABASE_FUNCTION_URL, {
      method: req.method,
      headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();
    
    // Forward response status and data
    res.status(response.status).json(data);
    
  } catch (error) {
    console.error('API Proxy Error:', error);
    res.status(500).json({ 
      error: 'API proxy failed',
      message: 'Unable to connect to analysis service'
    });
  }
}