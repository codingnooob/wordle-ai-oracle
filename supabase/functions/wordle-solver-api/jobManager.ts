
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
    .select()
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

export async function getJobStatus(jobId: string) {
  const { data: job, error: jobError } = await supabase
    .from('analysis_jobs')
    .select('*, analysis_results(*)')
    .eq('id', jobId)
    .single();
  
  if (jobError || !job) {
    return null;
  }
  
  return {
    job_id: job.id,
    status: job.status,
    created_at: job.created_at,
    completed_at: job.completed_at,
    estimated_completion_seconds: job.estimated_completion_seconds,
    solutions: job.analysis_results?.[0]?.solutions || [],
    confidence_score: job.analysis_results?.[0]?.confidence_score || 0,
    processing_status: job.analysis_results?.[0]?.processing_status || 'initializing'
  };
}
