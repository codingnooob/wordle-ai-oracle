
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { RateLimitResult } from './types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function validateRequest(
  apiKey?: string,
  clientId?: string,
  sourceIp?: string
): Promise<RateLimitResult> {
  try {
    // Enhanced IP validation and rate limiting
    if (sourceIp && sourceIp !== 'unknown') {
      // Validate IP format
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
      if (!ipRegex.test(sourceIp)) {
        await logSecurityEvent('invalid_ip_format', sourceIp, null, null, 'wordle-solver', 'warn', {
          invalidIp: sourceIp
        });
        return {
          valid: false,
          error: 'Invalid IP address format'
        };
      }

      // Enhanced rate limiting for job creation (10 jobs per IP per hour)
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const { data: ipJobCount, error: ipError } = await supabase
        .from('analysis_jobs')
        .select('id')
        .gte('created_at', hourAgo.toISOString())
        .contains('input_data', { source_ip: sourceIp });
      
      if (ipError) {
        await logSecurityEvent('rate_limit_check_error', sourceIp, null, null, 'wordle-solver', 'error', {
          error: ipError.message,
          type: 'ip_jobs_check'
        });
      } else if (ipJobCount && ipJobCount.length >= 10) {
        await logSecurityEvent('ip_rate_limit_exceeded', sourceIp, null, null, 'wordle-solver', 'warn', {
          jobCount: ipJobCount.length,
          limit: 10,
          timeWindow: '1 hour'
        });
        return {
          valid: false,
          error: 'IP rate limit exceeded: Maximum 10 jobs per hour'
        };
      }
    }

    // Enhanced API key validation and tracking
    const apiKeyHash = apiKey ? await hashApiKey(apiKey) : 'anonymous';
    
    if (apiKey) {
      // Validate API key format (should be at least 32 characters)
      if (apiKey.length < 32) {
        await logSecurityEvent('invalid_api_key_format', sourceIp, null, apiKeyHash.substring(0, 8), 'wordle-solver', 'warn', {
          keyLength: apiKey.length
        });
        return {
          valid: false,
          error: 'Invalid API key format'
        };
      }

      // Authenticated users: 100 requests per hour
      const { data: keyUsage, error: keyError } = await supabase
        .from('api_usage')
        .select('request_count, last_request')
        .eq('api_key_hash', apiKeyHash)
        .eq('endpoint', 'wordle-solver')
        .gte('last_request', new Date(Date.now() - 60 * 60 * 1000).toISOString())
        .single();

      if (keyError && keyError.code !== 'PGRST116') { // Not found is OK
        await logSecurityEvent('api_usage_check_error', sourceIp, null, apiKeyHash, 'wordle-solver', 'error', {
          error: keyError.message
        });
      } else if (keyUsage && keyUsage.request_count >= 100) {
        await logSecurityEvent('api_key_rate_limit_exceeded', sourceIp, null, apiKeyHash, 'wordle-solver', 'warn', {
          requestCount: keyUsage.request_count,
          limit: 100,
          timeWindow: '1 hour'
        });
        return {
          valid: false,
          error: 'API key rate limit exceeded: Maximum 100 requests per hour'
        };
      }
    } else {
      // Enhanced anonymous user validation
      if (clientId && clientId !== 'unknown') {
        // Validate client ID format
        if (clientId.length < 8) {
          await logSecurityEvent('invalid_client_id_format', sourceIp, null, null, 'wordle-solver', 'warn', {
            clientIdLength: clientId.length
          });
          return {
            valid: false,
            error: 'Invalid client ID format'
          };
        }

        const clientHash = await hashApiKey(clientId);
        const { data: clientUsage, error: clientError } = await supabase
          .from('api_usage')
          .select('request_count')
          .eq('api_key_hash', clientHash)
          .eq('endpoint', 'wordle-solver')
          .gte('last_request', new Date(Date.now() - 60 * 60 * 1000).toISOString())
          .single();

        if (clientError && clientError.code !== 'PGRST116') {
          await logSecurityEvent('client_usage_check_error', sourceIp, null, clientHash, 'wordle-solver', 'error', {
            error: clientError.message
          });
        } else if (clientUsage && clientUsage.request_count >= 50) {
          await logSecurityEvent('client_rate_limit_exceeded', sourceIp, null, clientHash, 'wordle-solver', 'warn', {
            requestCount: clientUsage.request_count,
            limit: 50,
            timeWindow: '1 hour'
          });
          return {
            valid: false,
            error: 'Anonymous rate limit exceeded: Maximum 50 requests per hour'
          };
        }
      }
    }

    return { valid: true };
  } catch (error) {
    await logSecurityEvent('rate_limit_validation_error', sourceIp, null, null, 'wordle-solver', 'error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack?.substring(0, 500) : undefined
    });
    
    return {
      valid: false,
      error: 'Rate limit validation failed'
    };
  }
}

// Enhanced API key hashing function
async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Enhanced security event logging
async function logSecurityEvent(
  eventType: string,
  sourceIp?: string,
  userAgent?: string,
  apiKeyHash?: string,
  endpoint?: string,
  severity: string = 'info',
  details?: any
) {
  try {
    await supabase.rpc('log_security_event', {
      p_event_type: eventType,
      p_source_ip: sourceIp,
      p_user_agent: userAgent,
      p_api_key_hash: apiKeyHash,
      p_endpoint: endpoint,
      p_severity: severity,
      p_details: details
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
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
    const keyHash = apiKey ? await hashApiKey(apiKey) : 'anonymous';
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
    
    // Enhanced security event logging
    await logSecurityEvent('api_request', sourceIp, null, keyHash, 'wordle-solver', 'info', {
      timestamp: now.toISOString(),
      authenticated: !!apiKey,
      usage_tracked: true
    });
  } catch (error) {
    console.error('Usage tracking error:', error);
    // Don't throw - tracking failures shouldn't block API requests
  }
}
