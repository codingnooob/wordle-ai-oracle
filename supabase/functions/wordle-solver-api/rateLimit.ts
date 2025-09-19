
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { RateLimitResult } from './types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function validateRequest(apiKey?: string, clientId?: string, sourceIp?: string): Promise<RateLimitResult> {
  try {
    // Enhanced rate limiting with IP-based detection
    const keyHash = apiKey || 'anonymous';
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 3600000);
    
    // Check IP-based job creation limit (10 jobs per IP per hour)
    if (sourceIp && sourceIp !== 'unknown') {
      const { data: ipJobCount } = await supabase
        .from('analysis_jobs')
        .select('id')
        .gte('created_at', hourAgo.toISOString())
        .contains('input_data', { source_ip: sourceIp });
      
      if (ipJobCount && ipJobCount.length >= 10) {
        await supabase
          .from('security_events')
          .insert({
            event_type: 'ip_job_limit_exceeded',
            source_ip: sourceIp,
            endpoint: 'wordle-solver',
            details: {
              job_count: ipJobCount.length,
              limit: 10,
              timeframe: '1 hour'
            },
            severity: 'warning'
          });
        
        return { valid: false, error: 'Too many jobs created from this IP. Please wait before creating more jobs.' };
      }
    }
    
    // Check API key usage
    const { data: usage } = await supabase
      .from('api_usage')
      .select('request_count, last_request')
      .eq('api_key_hash', keyHash)
      .eq('endpoint', 'wordle-solver')
      .gte('last_request', hourAgo.toISOString())
      .single();
    
    // Rate limit: 100 requests per hour for regular users
    const maxRequests = apiKey ? 100 : 50; // Anonymous users get lower limit
    
    if (usage && usage.request_count > maxRequests) {
      // Log suspicious activity
      await supabase
        .from('security_events')
        .insert({
          event_type: 'rate_limit_exceeded',
          source_ip: sourceIp,
          api_key_hash: keyHash,
          endpoint: 'wordle-solver',
          details: {
            request_count: usage.request_count,
            limit: maxRequests,
            timeframe: '1 hour'
          },
          severity: 'warning'
        });
      
      return { valid: false, error: 'Rate limit exceeded. Please try again later.' };
    }
    
    return { valid: true };
  } catch (error) {
    console.error('Rate limit validation error:', error);
    return { valid: true }; // Allow on error to avoid blocking legitimate users
  }
}

export function validateRequestSize(request: Request): { valid: boolean; error?: string } {
  const contentLength = request.headers.get('content-length');
  
  if (contentLength) {
    const size = parseInt(contentLength);
    // Limit request size to 50KB to prevent large payload attacks
    const maxSize = 50 * 1024; // 50KB
    
    if (size > maxSize) {
      return { 
        valid: false, 
        error: `Request too large. Maximum size is ${maxSize} bytes.` 
      };
    }
  }
  
  return { valid: true };
}

export async function trackUsage(apiKey?: string, sourceIp?: string) {
  try {
    const keyHash = apiKey || 'anonymous';
    const now = new Date();
    
    const { data: existing } = await supabase
      .from('api_usage')
      .select('request_count')
      .eq('api_key_hash', keyHash)
      .eq('endpoint', 'wordle-solver')
      .gte('last_request', new Date(now.getTime() - 3600000).toISOString())
      .single();
    
    if (existing) {
      await supabase
        .from('api_usage')
        .update({ 
          request_count: existing.request_count + 1,
          last_request: now.toISOString()
        })
        .eq('api_key_hash', keyHash)
        .eq('endpoint', 'wordle-solver');
    } else {
      await supabase
        .from('api_usage')
        .insert({
          api_key_hash: keyHash,
          endpoint: 'wordle-solver',
          request_count: 1,
          last_request: now.toISOString()
        });
    }
    
    // Log API usage for monitoring
    await supabase
      .from('security_events')
      .insert({
        event_type: 'api_request',
        source_ip: sourceIp,
        api_key_hash: keyHash,
        endpoint: 'wordle-solver',
        details: {
          timestamp: now.toISOString(),
          authenticated: !!apiKey
        },
        severity: 'info'
      });
  } catch (error) {
    console.error('Usage tracking error:', error);
    // Don't throw - tracking failures shouldn't block API requests
  }
}
