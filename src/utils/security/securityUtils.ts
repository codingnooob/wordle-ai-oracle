
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

  // Generate cryptographically secure nonce for CSP
  static generateCSPNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array)).replace(/[+/=]/g, '');
  }

  // Generate secure random token
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Enhanced input validation patterns
  static validateEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  static validateURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  static validateIPAddress(ip: string): boolean {
    const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
  }

  // Timing attack protection - constant time string comparison
  static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }

  // Generate secure response headers
  static getSecureResponseHeaders(): Record<string, string> {
    const nonce = this.generateCSPNonce();
    
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Content-Security-Policy': `default-src 'self'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests;`,
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), autoplay=(), encrypted-media=(), fullscreen=(), web-share=(), clipboard-write=(), clipboard-read=()',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin'
    };
  }

  // Request fingerprinting for additional security
  static generateRequestFingerprint(request: Request): string {
    const fingerprint = [
      request.method,
      new URL(request.url).pathname,
      request.headers.get('user-agent') || '',
      request.headers.get('accept') || '',
      request.headers.get('accept-language') || ''
    ].join('|');
    
    return btoa(fingerprint).slice(0, 16);
  }

  // CSRF token validation helper
  static validateCSRFToken(token: string, sessionToken: string): boolean {
    if (!token || !sessionToken) {
      return false;
    }
    
    // Simple CSRF validation - in production, use proper CSRF libraries
    return this.constantTimeCompare(token, sessionToken);
  }
}
