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
    console.log('Starting security cleanup...');
    const startTime = Date.now();
    
    // Call cleanup functions
    const results = await Promise.allSettled([
      supabase.rpc('cleanup_expired_sessions'),
      supabase.rpc('cleanup_api_usage_data'),
      supabase.rpc('cleanup_sensitive_data')
    ]);
    
    const completedTime = Date.now() - startTime;
    
    // Log results
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;
    
    if (failureCount > 0) {
      console.error('Some cleanup operations failed:', results.filter(r => r.status === 'rejected'));
    }
    
    console.log(`Security cleanup completed: ${successCount} succeeded, ${failureCount} failed, took ${completedTime}ms`);
    
    // Log security event
    await supabase.rpc('log_security_event', {
      p_event_type: 'automated_cleanup_cycle',
      p_endpoint: 'security-cleanup',
      p_severity: failureCount > 0 ? 'warn' : 'info',
      p_details: {
        success_count: successCount,
        failure_count: failureCount,
        duration_ms: completedTime,
        timestamp: new Date().toISOString()
      }
    });
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Security cleanup completed',
      stats: {
        operations_completed: successCount,
        operations_failed: failureCount,
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