/**
 * Security logging utility for client-side security events
 */

export class SecurityLogger {
  private static readonly MAX_LOG_SIZE = 1000;
  private static logs: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error';
    event: string;
    details?: any;
  }> = [];

  /**
   * Log security events with proper sanitization
   */
  static logSecurityEvent(
    level: 'info' | 'warn' | 'error',
    event: string,
    details?: any
  ): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      event: this.sanitizeLogData(event),
      details: details ? this.sanitizeLogData(details) : undefined
    };

    // Add to internal log storage
    this.logs.push(logEntry);
    
    // Keep only recent logs to prevent memory issues
    if (this.logs.length > this.MAX_LOG_SIZE) {
      this.logs = this.logs.slice(-this.MAX_LOG_SIZE);
    }

    // Console logging in development only
    if (import.meta.env.DEV) {
      console[level](`[Security] ${event}`, details);
    }

    // In production, only log errors to console
    if (!import.meta.env.DEV && level === 'error') {
      console.error(`[Security] ${event}`);
    }
  }

  /**
   * Sanitize log data to prevent log injection
   */
  private static sanitizeLogData(data: any): any {
    if (typeof data === 'string') {
      return data.replace(/[\r\n\t]/g, ' ').substring(0, 200);
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Skip sensitive fields
        if (['password', 'token', 'secret', 'key'].some(sensitive => 
          key.toLowerCase().includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeLogData(value);
        }
      }
      return sanitized;
    }
    
    return data;
  }

  /**
   * Get recent security logs (for debugging purposes)
   */
  static getRecentLogs(count: number = 50): typeof SecurityLogger.logs {
    return this.logs.slice(-count);
  }

  /**
   * Clear all stored logs
   */
  static clearLogs(): void {
    this.logs = [];
  }

  /**
   * Log API request attempts
   */
  static logApiRequest(endpoint: string, success: boolean, details?: any): void {
    this.logSecurityEvent(
      success ? 'info' : 'warn',
      `API_REQUEST_${success ? 'SUCCESS' : 'FAILED'}`,
      {
        endpoint,
        timestamp: new Date().toISOString(),
        ...details
      }
    );
  }

  /**
   * Log input validation failures
   */
  static logValidationFailure(field: string, value: any, reason: string): void {
    this.logSecurityEvent('warn', 'VALIDATION_FAILURE', {
      field,
      value: typeof value === 'string' ? value.substring(0, 50) : '[OBJECT]',
      reason
    });
  }

  /**
   * Log rate limiting events
   */
  static logRateLimit(endpoint: string, attempts: number): void {
    this.logSecurityEvent('warn', 'RATE_LIMIT_HIT', {
      endpoint,
      attempts,
      timestamp: new Date().toISOString()
    });
  }
}
