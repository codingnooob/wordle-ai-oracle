
-- Create tables for API job management and results
CREATE TABLE public.analysis_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  input_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'complete', 'failed', 'partial')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_completion_seconds INTEGER DEFAULT 30,
  error_message TEXT
);

CREATE TABLE public.analysis_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.analysis_jobs(id) ON DELETE CASCADE NOT NULL,
  solutions JSONB NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.0,
  processing_status TEXT DEFAULT 'complete' CHECK (processing_status IN ('initializing', 'scraping', 'analyzing', 'complete')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for API usage tracking
CREATE TABLE public.api_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_hash TEXT,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  last_request TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables (public API, so more permissive policies)
ALTER TABLE public.analysis_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for API access
CREATE POLICY "Allow public access to analysis jobs" 
  ON public.analysis_jobs 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow public access to analysis results" 
  ON public.analysis_results 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow public access to api usage" 
  ON public.api_usage 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_analysis_jobs_status ON public.analysis_jobs(status);
CREATE INDEX idx_analysis_jobs_created_at ON public.analysis_jobs(created_at);
CREATE INDEX idx_analysis_results_job_id ON public.analysis_results(job_id);
CREATE INDEX idx_api_usage_api_key_hash ON public.api_usage(api_key_hash);
