import { SecurityUtils } from './securityUtils';
import { SecurityLogger } from './securityLogger';

export interface SecurityMiddlewareOptions {
  enableRateLimit?: boolean;
  maxRequests?: number;
  windowMs?: number;
  enableCSRF?: boolean;
  enableFingerprinting?: boolean;
}

export class SecurityMiddleware {
  private static rateLimiter: ((identifier: string) => boolean) | null = null;
  
  static initialize(options: SecurityMiddlewareOptions = {}) {
    const {
      enableRateLimit = true,
      maxRequests = 100,
      windowMs = 15 * 60 * 1000, // 15 minutes
    } = options;
    
    if (enableRateLimit) {
      this.rateLimiter = SecurityUtils.createRateLimiter(maxRequests, windowMs);
    }
    
    SecurityLogger.logSecurityEvent('info', 'SecurityMiddleware initialized', options);
  }
  
  static validateRequest(request: Request, options: SecurityMiddlewareOptions = {}): {
    isValid: boolean;
    error?: string;
    fingerprint?: string;
  } {
    try {
      const url = new URL(request.url);
      const clientIP = request.headers.get('cf-connecting-ip') || 
                      request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
      
      // Rate limiting
      if (options.enableRateLimit && this.rateLimiter) {
        if (!this.rateLimiter(clientIP)) {
          SecurityLogger.logRateLimit(url.pathname, 0);
          return { isValid: false, error: 'Rate limit exceeded' };
        }
      }
      
      // Request fingerprinting
      let fingerprint: string | undefined;
      if (options.enableFingerprinting) {
        fingerprint = SecurityUtils.generateRequestFingerprint(request);
      }
      
      // Basic security validations
      const userAgent = request.headers.get('user-agent');
      if (!userAgent || userAgent.length < 10) {
        SecurityLogger.logValidationFailure('user-agent', userAgent, 'Invalid or missing user-agent');
        return { isValid: false, error: 'Invalid request headers' };
      }
      
      // Validate content type for POST requests
      if (request.method === 'POST') {
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          SecurityLogger.logValidationFailure('content-type', contentType, 'Invalid content type for POST request');
          return { isValid: false, error: 'Invalid content type' };
        }
      }
      
      SecurityLogger.logSecurityEvent('info', 'Request validation passed', {
        method: request.method,
        path: url.pathname,
        clientIP,
        fingerprint
      });
      
      return { isValid: true, fingerprint };
      
    } catch (error) {
      SecurityLogger.logSecurityEvent('error', 'Request validation error', error);
      return { isValid: false, error: 'Request validation failed' };
    }
  }
  
  static createSecureResponse(data: any, status: number = 200): Response {
    const headers = SecurityUtils.getSecureResponseHeaders();
    
    // Ensure sensitive data is not cached
    if (status >= 400 || typeof data === 'object' && data.error) {
      headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate';
      headers['Pragma'] = 'no-cache';
      headers['Expires'] = '0';
    }
    
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });
  }
  
  static sanitizeResponseData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }
    
    // Remove sensitive fields from responses
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'private'];
    const sanitized = { ...data };
    
    for (const field of sensitiveFields) {
      if (field in sanitized) {
        delete sanitized[field];
      }
    }
    
    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeResponseData(sanitized[key]);
      }
    }
    
    return sanitized;
  }
}