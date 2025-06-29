
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { RateLimitResult } from './types.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function validateRequest(apiKey?: string, clientId?: string): Promise<RateLimitResult> {
  // Simple rate limiting check
  if (clientId) {
    const { data: usage } = await supabase
      .from('api_usage')
      .select('request_count, last_request')
      .eq('api_key_hash', apiKey || 'anonymous')
      .eq('endpoint', 'wordle-solver')
      .single();
    
    if (usage && usage.request_count > 100) {
      const hourAgo = new Date(Date.now() - 3600000).toISOString();
      if (usage.last_request > hourAgo) {
        return { valid: false, error: 'Rate limit exceeded' };
      }
    }
  }
  
  return { valid: true };
}

export async function trackUsage(apiKey?: string) {
  const keyHash = apiKey || 'anonymous';
  
  const { data: existing } = await supabase
    .from('api_usage')
    .select('request_count')
    .eq('api_key_hash', keyHash)
    .eq('endpoint', 'wordle-solver')
    .single();
  
  if (existing) {
    await supabase
      .from('api_usage')
      .update({ 
        request_count: existing.request_count + 1,
        last_request: new Date().toISOString()
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
        last_request: new Date().toISOString()
      });
  }
}
