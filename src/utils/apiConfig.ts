/**
 * API Configuration utility - Direct Supabase API endpoints
 * Provides reliable API access using direct Supabase Edge Functions
 */

export interface ApiEndpoints {
  analyze: string;
  status: (jobId: string, sessionToken: string) => string;
}

const SUPABASE_API_URL = 'https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api';

export const getApiConfig = (): ApiEndpoints => {
  return {
    analyze: SUPABASE_API_URL,
    status: (jobId: string, sessionToken: string) => {
      const encodedToken = encodeURIComponent(sessionToken);
      return `${SUPABASE_API_URL}/status/${jobId}/${encodedToken}`;
    }
  };
};

// Legacy support - returns the analyze endpoint URL
export const getBaseUrl = (): string => {
  return SUPABASE_API_URL;
};

// Get the display URL for documentation
export const getDisplayUrl = (): string => {
  return SUPABASE_API_URL;
};