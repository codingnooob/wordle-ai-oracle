/**
 * API Configuration utility for environment-aware URL management
 * Provides the correct API base URL based on the current environment
 */

export interface ApiEndpoints {
  analyze: string;
  status: (jobId: string, sessionToken: string) => string;
}

interface FallbackEndpoints {
  analyze: string;
  status: (jobId: string, sessionToken: string) => string;
}

const SUPABASE_DIRECT_URL = 'https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api';

export const getApiConfig = (): ApiEndpoints => {
  // Detect environment - use direct Supabase for all Lovable domains and development
  const hostname = window.location.hostname;
  const isDevelopment = hostname === 'localhost' || 
                       hostname === '127.0.0.1' ||
                       hostname.includes('lovable.app') ||
                       hostname.includes('lovableproject.com') ||
                       hostname.includes('vercel.app');
  
  const baseUrl = isDevelopment 
    ? SUPABASE_DIRECT_URL  // Direct Supabase for development
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

export const getFallbackConfig = (): FallbackEndpoints => {
  // Always return direct Supabase URLs for fallback
  return {
    analyze: SUPABASE_DIRECT_URL,
    status: (jobId: string, sessionToken: string) => {
      const encodedToken = encodeURIComponent(sessionToken);
      return `${SUPABASE_DIRECT_URL}/status/${jobId}/${encodedToken}`;
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

// Get the display URL for documentation (show current environment URL)
export const getDisplayUrl = (): string => {
  const hostname = window.location.hostname;
  const isDevelopment = hostname === 'localhost' || 
                       hostname === '127.0.0.1' ||
                       hostname.includes('lovable.app') ||
                       hostname.includes('lovableproject.com') ||
                       hostname.includes('vercel.app');
                       
  if (isDevelopment) {
    return SUPABASE_DIRECT_URL;
  }
  
  return isUsingCustomDomain() 
    ? `${window.location.origin}/api/wordle-solver`
    : 'https://yourdomain.com/api/wordle-solver';
};