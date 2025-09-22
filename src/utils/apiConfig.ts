/**
 * API Configuration utility for environment-aware URL management
 * Provides the correct API base URL based on the current environment
 */

export interface ApiEndpoints {
  analyze: string;
  status: (jobId: string, sessionToken: string) => string;
}

export const getApiConfig = (): ApiEndpoints => {
  // Detect environment
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('lovable.app');
  
  const baseUrl = isDevelopment 
    ? 'https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api'  // Direct Supabase for development
    : `${window.location.origin}/api/wordle-solver`;  // Custom domain for production

  return {
    analyze: baseUrl,
    status: (jobId: string, sessionToken: string) => {
      const encodedToken = encodeURIComponent(sessionToken);
      return `${baseUrl}/status/${jobId}/${encodedToken}`;
    }
  };
};

// Legacy support - returns the analyze endpoint URL
export const getBaseUrl = (): string => {
  return getApiConfig().analyze;
};

// Utility to check if we're using custom domain
export const isUsingCustomDomain = (): boolean => {
  return !window.location.hostname.includes('lovable.app') && 
         window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1';
};

// Get the display URL for documentation (always show custom domain in production docs)
export const getDisplayUrl = (): string => {
  return isUsingCustomDomain() 
    ? `${window.location.origin}/api/wordle-solver`
    : 'https://yourdomain.com/api/wordle-solver';
};