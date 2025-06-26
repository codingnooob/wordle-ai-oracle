
// Security utility functions for the application
export class SecurityUtils {
  private static readonly isDevelopment = import.meta.env.DEV;

  // Safe logging that only shows detailed logs in development
  static secureLog(message: string, data?: any, level: 'info' | 'warn' | 'error' = 'info'): void {
    if (this.isDevelopment) {
      console[level](message, data);
    } else if (level === 'error') {
      // Only log errors in production, without sensitive data
      console.error('Application error occurred');
    }
  }

  // Sanitize input strings
  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/[^\w\s-]/g, '') // Only allow word characters, spaces, and hyphens
      .substring(0, 100); // Limit length
  }

  // Validate word input specifically for Wordle
  static validateWordInput(word: string): { isValid: boolean; sanitized: string; error?: string } {
    const sanitized = word.toUpperCase().replace(/[^A-Z]/g, '');
    
    if (sanitized.length === 0) {
      return { isValid: false, sanitized: '', error: 'Invalid input' };
    }
    
    if (sanitized.length > 15) {
      return { isValid: false, sanitized: '', error: 'Input too long' };
    }
    
    return { isValid: true, sanitized };
  }

  // Sanitize scraped content to prevent malicious data
  static sanitizeScrapedContent(content: string): string {
    if (typeof content !== 'string') return '';
    
    return content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[^\w\s]/g, ' ') // Replace special chars with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 50); // Limit individual word length
  }

  // Generate safe error messages for users
  static getSafeErrorMessage(error: Error, context: string): string {
    if (this.isDevelopment) {
      return `${context}: ${error.message}`;
    }
    
    // Generic messages for production
    const safeMessages: { [key: string]: string } = {
      'analysis': 'Unable to analyze word patterns',
      'scraping': 'Unable to fetch word data',
      'training': 'Training service temporarily unavailable',
      'validation': 'Invalid input provided'
    };
    
    return safeMessages[context] || 'An error occurred';
  }

  // Rate limiting helper
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requests = new Map<string, number[]>();
    
    return (identifier: string): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      if (!requests.has(identifier)) {
        requests.set(identifier, []);
      }
      
      const userRequests = requests.get(identifier)!;
      // Remove old requests outside the window
      while (userRequests.length > 0 && userRequests[0] < windowStart) {
        userRequests.shift();
      }
      
      if (userRequests.length >= maxRequests) {
        return false; // Rate limit exceeded
      }
      
      userRequests.push(now);
      return true;
    };
  }
}
