/**
 * Smart API Client with automatic fallback
 * Tries custom domain first, falls back to Supabase on failure
 */

interface SmartApiResponse extends Response {
  fromFallback?: boolean;
}

class SmartApiClient {
  private workingEndpoint: string | null = null;
  private customDomainUrl = 'https://wordlesolver.ai/api/wordle-solver';
  private fallbackUrl = 'https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api';

  /**
   * Makes a smart API request with automatic fallback
   */
  async makeRequest(path: string = '', options: RequestInit = {}): Promise<SmartApiResponse> {
    const fullCustomUrl = `${this.customDomainUrl}${path}`;
    const fullFallbackUrl = `${this.fallbackUrl}${path}`;

    // Try custom domain first (unless we already know it's broken)
    if (!this.workingEndpoint || this.workingEndpoint === this.customDomainUrl) {
      try {
        console.log(`[Smart API] Trying custom domain: ${fullCustomUrl}`);
        const response = await fetch(fullCustomUrl, {
          ...options,
          // Add timeout to avoid hanging on failed custom domain
          signal: AbortSignal.timeout(10000)
        });

        // Check if response is actually JSON (not HTML 404 page)
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        
        if (response.ok && isJson) {
          console.log(`[Smart API] Custom domain working, caching endpoint`);
          this.workingEndpoint = this.customDomainUrl;
          return response;
        } else {
          console.log(`[Smart API] Custom domain returned non-JSON response (status: ${response.status}), trying fallback`);
        }
      } catch (error) {
        console.log(`[Smart API] Custom domain failed:`, error);
      }
    }

    // Fallback to direct Supabase
    console.log(`[Smart API] Using Supabase fallback: ${fullFallbackUrl}`);
    this.workingEndpoint = this.fallbackUrl;
    
    const response = await fetch(fullFallbackUrl, options) as SmartApiResponse;
    response.fromFallback = true;
    return response;
  }

  /**
   * Get the current working endpoint for display purposes
   */
  getWorkingEndpoint(): string {
    return this.workingEndpoint || this.customDomainUrl;
  }

  /**
   * Check if we're currently using fallback
   */
  isUsingFallback(): boolean {
    return this.workingEndpoint === this.fallbackUrl;
  }

  /**
   * Reset the cached endpoint (for testing)
   */
  reset(): void {
    this.workingEndpoint = null;
  }
}

// Export singleton instance
export const smartApiClient = new SmartApiClient();

// Export helper functions for common API calls
export const makeAnalyzeRequest = (data: any, customHeaders?: Record<string, string>) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders
  };

  return smartApiClient.makeRequest('', {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
};

export const makeStatusRequest = (jobId: string, sessionToken: string) => {
  const encodedToken = encodeURIComponent(sessionToken);
  return smartApiClient.makeRequest(`/status/${jobId}/${encodedToken}`, {
    method: 'GET',
  });
};