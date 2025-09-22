
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function createJob(inputData: any) {
  try {
    console.log('[JOB MANAGER] Creating new analysis job');
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
      console.error('[JOB MANAGER] Failed to create job:', jobError?.message || 'No job data returned');
      throw new Error(`Failed to create analysis job: ${jobError?.message || 'Unknown error'}`);
    }
    
    console.log(`[JOB MANAGER] Successfully created job: ${job.id}`);
    return job;
  } catch (error) {
    console.error('[JOB MANAGER] Job creation error:', error);
    throw error; // Re-throw to maintain existing error behavior
  }
}

export async function updateJobStatus(jobId: string, status: string, completedAt?: string, errorMessage?: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[JOB MANAGER] Updating job ${jobId} status to: ${status}`);
    const { error } = await supabase
      .from('analysis_jobs')
      .update({ 
        status,
        completed_at: completedAt,
        error_message: errorMessage
      })
      .eq('id', jobId);
    
    if (error) {
      console.error(`[JOB MANAGER] Failed to update job status for ${jobId}:`, error.message);
      return { success: false, error: error.message };
    }
    
    console.log(`[JOB MANAGER] Successfully updated job ${jobId} status to: ${status}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[JOB MANAGER] Unexpected error updating job status for ${jobId}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function storeResults(jobId: string, solutions: any[], confidence: number, processingStatus: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[JOB MANAGER] Storing results for job ${jobId}, solutions count: ${solutions?.length || 0}`);
    const { error } = await supabase
      .from('analysis_results')
      .insert({
        job_id: jobId,
        solutions,
        confidence_score: confidence,
        processing_status: processingStatus
      });
    
    if (error) {
      // Handle duplicate key errors gracefully (results might already exist)
      if (error.code === '23505') {
        console.log(`[JOB MANAGER] Results already exist for job ${jobId}, skipping insert`);
        return { success: true }; // Treat duplicates as success
      }
      
      console.error(`[JOB MANAGER] Failed to store results for job ${jobId}:`, error.message);
      return { success: false, error: error.message };
    }
    
    console.log(`[JOB MANAGER] Successfully stored results for job ${jobId}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[JOB MANAGER] Unexpected error storing results for job ${jobId}:`, errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function getJobStatus(jobId: string, sessionToken: string) {
  try {
    console.log(`[JOB MANAGER] Getting status for job: ${jobId}`);
    
    // Validate inputs
    if (!jobId || !sessionToken) {
      console.log('[JOB MANAGER] Invalid inputs: jobId or sessionToken missing');
      return null;
    }
    
    if (sessionToken.length < 32) {
      console.log('[JOB MANAGER] Invalid session token format');
      return null;
    }
    
    // Direct table queries (separate queries to avoid foreign key dependency)
    // Query 1: Get job data from analysis_jobs
    const { data: jobData, error: jobError } = await supabase
      .from('analysis_jobs')
      .select('id, status, created_at, completed_at, estimated_completion_seconds, error_message')
      .eq('id', jobId)
      .eq('session_token', sessionToken)
      .gt('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()) // Within 2 hours
      .gt('expires_at', new Date().toISOString()) // Not expired
      .single();
    
    if (jobError || !jobData) {
      console.log('[JOB MANAGER] Job status fetch failed:', jobError || 'No data returned');
      return null;
    }
    
    console.log(`[JOB MANAGER] Job status: ${jobData.status}`);
    
    // Query 2: Get analysis results for this job
    const { data: resultsData, error: resultsError } = await supabase
      .from('analysis_results')
      .select('solutions, confidence_score, processing_status')
      .eq('job_id', jobId)
      .maybeSingle();
    
    // Log results query (it's OK if this fails - job might not have results yet)
    if (resultsError) {
      console.log('[JOB MANAGER] No analysis results found (job may still be processing):', resultsError.message);
    }
    
    // Combine job data with analysis results
    const analysisResult = resultsData || {};
    
    // Return formatted response matching the original structure
    return {
      job_id: jobData.id,
      status: jobData.status,
      created_at: jobData.created_at,
      completed_at: jobData.completed_at,
      estimated_completion_seconds: jobData.estimated_completion_seconds,
      solutions: analysisResult.solutions || [],
      confidence_score: analysisResult.confidence_score || 0,
      processing_status: analysisResult.processing_status || 'initializing',
      error_message: jobData.error_message
    };
  } catch (error) {
    console.error('[JOB MANAGER] Unexpected error:', error);
    return null;
  }
}
