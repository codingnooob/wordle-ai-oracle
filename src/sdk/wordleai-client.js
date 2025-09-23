/**
 * Wordle AI Oracle JavaScript SDK
 * A client library for the Wordle AI Oracle API with smart fallback logic.
 */

class WordleAIClient {
  constructor(options = {}) {
    this.customDomainUrl = options.customDomainUrl || 'https://wordlesolver.ai/api';
    this.fallbackUrl = options.fallbackUrl || 'https://tctpfuqvpvkcdidyiowu.supabase.co/functions/v1/wordle-solver-api';
    this.apiKey = options.apiKey;
    this.timeout = options.timeout || 10000;
  }

  /**
   * Make HTTP request with smart fallback logic
   * @param {string} endpoint - API endpoint path
   * @param {Object} data - Request data for POST requests
   * @param {Object} options - Additional request options
   * @returns {Promise<Object>} API response
   */
  async makeRequest(endpoint = '', data = null, options = {}) {
    const requestOptions = {
      method: data ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey && { 'X-API-Key': this.apiKey }),
        ...options.headers
      },
      ...(data && { body: JSON.stringify(data) })
    };

    // Try custom domain first
    try {
      const customUrl = `${this.customDomainUrl}${endpoint}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(customUrl, {
        ...requestOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        }
      }
    } catch (error) {
      console.warn('Custom domain failed, trying fallback:', error.message);
    }

    // Fallback to Supabase
    try {
      const fallbackUrl = `${this.fallbackUrl}${endpoint}`;
      const response = await fetch(fallbackUrl, requestOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      throw new Error(`API request failed: ${error.message}`);
    }
  }

  /**
   * Analyze Wordle guess data
   * @param {Array} guessData - Array of letter objects with 'letter' and 'state' properties
   * @param {Object} options - Analysis options
   * @param {number} options.wordLength - Target word length (default: 5)
   * @param {Array} options.excludedLetters - Letters to exclude from results
   * @param {string} options.responseMode - 'immediate' or 'async'
   * @param {boolean} options.pollForResult - Whether to auto-poll async results (default: true)
   * @returns {Promise<Object>} Analysis results
   */
  async analyze(guessData, options = {}) {
    const payload = {
      guessData,
      wordLength: options.wordLength || 5,
      excludedLetters: options.excludedLetters || [],
      responseMode: options.responseMode || 'immediate',
      ...(this.apiKey && { apiKey: this.apiKey })
    };

    const result = await this.makeRequest('', payload);
    
    // Handle async processing
    if (result.job_id && result.status !== 'complete') {
      return options.pollForResult !== false ? 
        await this.pollJobStatus(result.job_id, result.session_token) : result;
    }
    
    return result;
  }

  /**
   * Poll job status until completion
   * @param {string} jobId - Job identifier
   * @param {string} sessionToken - Session token for authentication
   * @param {number} maxAttempts - Maximum polling attempts (default: 30)
   * @returns {Promise<Object>} Final job result
   */
  async pollJobStatus(jobId, sessionToken, maxAttempts = 30) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        const result = await this.makeRequest(`/status/${jobId}`, null, {
          headers: { 'X-Session-Token': sessionToken }
        });
        
        if (result.status === 'complete' || result.status === 'failed') {
          return result;
        }
      } catch (error) {
        console.warn(`Polling attempt ${attempt + 1} failed:`, error.message);
      }
    }
    
    throw new Error('Polling timeout: Analysis did not complete within expected time');
  }

  /**
   * Get current status of an analysis job
   * @param {string} jobId - Job identifier
   * @param {string} sessionToken - Session token for authentication
   * @returns {Promise<Object>} Job status
   */
  async getStatus(jobId, sessionToken) {
    return await this.makeRequest(`/status/${jobId}`, null, {
      headers: { 'X-Session-Token': sessionToken }
    });
  }

  /**
   * Get the currently working endpoint
   * @returns {string} Current endpoint URL
   */
  getWorkingEndpoint() {
    return this.customDomainUrl; // Default to custom domain
  }

  /**
   * Check if currently using fallback endpoint
   * @returns {boolean} True if using fallback
   */
  isUsingFallback() {
    return false; // This would need more sophisticated tracking
  }

  /**
   * Reset internal state (useful for testing different endpoints)
   */
  reset() {
    // Reset any cached endpoint state if implemented
  }
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WordleAIClient;
} else if (typeof window !== 'undefined') {
  window.WordleAIClient = WordleAIClient;
}

// Also export as default for ES modules
if (typeof exports !== 'undefined') {
  exports.default = WordleAIClient;
}