import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req: Request) => {
  // Only allow POST requests from cron jobs or service accounts
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Verify this is being called by a trusted source (in production, add proper auth)
  const authHeader = req.headers.get('Authorization');
  const expectedKey = Deno.env.get('CLEANUP_SECRET_KEY');
  
  if (!authHeader || !expectedKey || authHeader !== `Bearer ${expectedKey}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    console.log('Starting enhanced security cleanup...');
    const startTime = Date.now();
    
    // Execute cleanup operations concurrently for better performance
    const cleanupResults = await Promise.allSettled([
      supabase.rpc('cleanup_expired_sessions'),
      supabase.rpc('cleanup_api_usage_data'),
      supabase.rpc('cleanup_sensitive_data'),
      supabase.rpc('cleanup_expired_tokens') // Add new token cleanup
    ]);
    
    const completedTime = Date.now() - startTime;
    
    // Count successful and failed operations
    const successCount = cleanupResults.filter(result => result.status === 'fulfilled').length;
    const failureCount = cleanupResults.filter(result => result.status === 'rejected').length;
    
    // Log cleanup results with enhanced details
    const failedOperations = cleanupResults
      .map((result, index) => ({ 
        result, 
        operation: ['sessions', 'api_usage', 'sensitive_data', 'expired_tokens'][index] 
      }))
      .filter(({ result }) => result.status === 'rejected')
      .map(({ result, operation }) => ({
        operation,
        error: result.status === 'rejected' ? 
          (result.reason instanceof Error ? result.reason.message : String(result.reason)) : 
          'Unknown error'
      }));

    if (failureCount > 0) {
      console.error('Some cleanup operations failed:', failedOperations);
    }
    
    console.log(`Enhanced security cleanup completed: ${successCount} succeeded, ${failureCount} failed, took ${completedTime}ms`);
    
    // Enhanced logging with more security details
    await supabase.rpc('log_security_event', {
      p_event_type: 'security_cleanup_cycle',
      p_source_ip: null,
      p_user_agent: 'system/cleanup-service',
      p_api_key_hash: null,
      p_endpoint: 'security-cleanup',
      p_severity: failureCount > 0 ? 'warn' : 'info',
      p_details: {
        successful_operations: successCount,
        failed_operations: failureCount,
        failures: failedOperations,
        cleanup_types: ['sessions', 'api_usage', 'sensitive_data', 'expired_tokens'],
        duration_ms: completedTime,
        timestamp: new Date().toISOString(),
        version: '2.0'
      }
    });
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Enhanced security cleanup completed',
      results: {
        successful: successCount,
        failed: failureCount,
        details: failedOperations,
        operations: ['sessions', 'api_usage', 'sensitive_data', 'expired_tokens'],
        duration_ms: completedTime
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Security cleanup error:', error);
    
    // Log error event
    try {
      await supabase.rpc('log_security_event', {
        p_event_type: 'cleanup_error',
        p_endpoint: 'security-cleanup',
        p_severity: 'error',
        p_details: {
          error: error.message,
          timestamp: new Date().toISOString()
        }
      });
    } catch (logError) {
      console.error('Failed to log cleanup error:', logError);
    }
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Security cleanup failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});