/**
 * API Configuration utility for environment-aware URL management
 * Provides the correct API base URL based on the current environment
 */

export interface ApiEndpoints {
  analyze: string;
  status: (jobId: string, sessionToken: string) => string;
}

export const getApiConfig = (): ApiEndpoints => {
  // Detect environment - use direct Supabase for all Lovable domains and development
  const hostname = window.location.hostname;
  const isDevelopment = hostname === 'localhost' || 
                       hostname === '127.0.0.1' ||
                       hostname.includes('lovable.app') ||
                       hostname.includes('lovableproject.com') ||
                       hostname.includes('vercel.app');
  
  const baseUrl = isDevelopment 
    ? 'https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api'  // Direct Supabase for development
    : `${window.location.origin}/api/wordle-solver`;  // Custom domain for production
    
  // Debug logging
  console.log('[API Config] Hostname:', hostname, 'isDevelopment:', isDevelopment, 'baseUrl:', baseUrl);

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
  const hostname = window.location.hostname;
  return !hostname.includes('lovable.app') && 
         !hostname.includes('lovableproject.com') &&
         !hostname.includes('vercel.app') &&
         hostname !== 'localhost' && 
         hostname !== '127.0.0.1';
};

// Get the display URL for documentation (always show custom domain in production docs)
export const getDisplayUrl = (): string => {
  return isUsingCustomDomain() 
    ? `${window.location.origin}/api/wordle-solver`
    : 'https://yourdomain.com/api/wordle-solver';
};