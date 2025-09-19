
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
