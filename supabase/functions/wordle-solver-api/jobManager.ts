
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function createJob(inputData: any) {
  const { data: job, error: jobError } = await supabase
    .from('analysis_jobs')
    .insert({
      input_data: inputData,
      status: 'processing',
      estimated_completion_seconds: 15
    })
    .select('id, session_token, status, created_at, estimated_completion_seconds')
    .single();
  
  if (jobError || !job) {
    throw new Error('Failed to create analysis job');
  }
  
  return job;
}

export async function updateJobStatus(jobId: string, status: string, completedAt?: string, errorMessage?: string) {
  await supabase
    .from('analysis_jobs')
    .update({ 
      status,
      completed_at: completedAt,
      error_message: errorMessage
    })
    .eq('id', jobId);
}

export async function storeResults(jobId: string, solutions: any[], confidence: number, processingStatus: string) {
  await supabase
    .from('analysis_results')
    .insert({
      job_id: jobId,
      solutions,
      confidence_score: confidence,
      processing_status: processingStatus
    });
}

export async function getJobStatus(jobId: string, sessionToken: string) {
  try {
    console.log(`[JOB MANAGER] Getting status for job: ${jobId}`);
    
    // Use the updated secure function that now returns all required fields including analysis results
    const { data: job, error: jobError } = await supabase
      .rpc('get_job_status_secure_v2', {
        job_id_param: jobId,
        session_token_param: sessionToken
      });
    
    if (jobError || !job || job.length === 0) {
      console.log('[JOB MANAGER] Job status fetch failed:', jobError || 'No data returned');
      return null;
    }
    
    const jobData = job[0];
    console.log(`[JOB MANAGER] Job status: ${jobData.status}`);
    
    // The updated function now returns all required fields including analysis results
    return {
      job_id: jobData.job_id,
      status: jobData.status,
      created_at: jobData.created_at,
      completed_at: jobData.completed_at,
      estimated_completion_seconds: jobData.estimated_completion_seconds,
      solutions: jobData.solutions || [],
      confidence_score: jobData.confidence_score || 0,
      processing_status: jobData.processing_status || 'initializing',
      error_message: jobData.error_message
    };
  } catch (error) {
    console.error('[JOB MANAGER] Unexpected error:', error);
    return null;
  }
}
