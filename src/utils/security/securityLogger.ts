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
   * Log security events using the secure database function
   */
  static async logSecurityEvent(
    level: 'info' | 'warn' | 'error',
    event: string,
    details?: any
  ): Promise<void> {
    try {
      // For client-side logging, we'll use the Supabase client
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Use the secure logging function instead of direct table access
      const { error } = await supabase.rpc('log_security_event', {
        p_event_type: event,
        p_severity: level,
        p_details: this.sanitizeLogData(details),
        p_source_ip: this.getClientIP(),
        p_user_agent: navigator.userAgent?.substring(0, 500) || null,
        p_endpoint: window.location.pathname || null
      });

      if (error) {
        console.error('Failed to log security event:', error);
        // Fallback to local logging
        this.logLocally(level, event, details);
      }
    } catch (error) {
      console.error('Security logging error:', error);
      // Fallback to local logging
      this.logLocally(level, event, details);
    }
  }

  /**
   * Fallback local logging for when database logging fails
   */
  private static logLocally(
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
   * Get client IP (limited on client-side, mainly for development)
   */
  private static getClientIP(): string | null {
    // In production, this would typically be handled server-side
    // Client-side IP detection is limited and unreliable
    return null;
  }

  /**
   * Sanitize log data to prevent log injection and redact sensitive information
   */
  private static sanitizeLogData(data: any): any {
    if (typeof data === 'string') {
      return data.replace(/[\r\n\t]/g, ' ').substring(0, 200);
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Skip sensitive fields
        if (['password', 'token', 'secret', 'key', 'auth', 'session', 'private'].some(sensitive => 
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
   * Log API request attempts with enhanced security
   */
  static async logApiRequest(endpoint: string, success: boolean, details?: any): Promise<void> {
    await this.logSecurityEvent(
      success ? 'info' : 'warn',
      success ? 'API_REQUEST_SUCCESS' : 'API_REQUEST_FAILED',
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
  static async logValidationFailure(field: string, value: any, reason: string): Promise<void> {
    await this.logSecurityEvent('warn', 'VALIDATION_FAILURE', {
      field,
      value: typeof value === 'string' ? value.substring(0, 50) : '[OBJECT]',
      reason
    });
  }

  /**
   * Log rate limiting events
   */
  static async logRateLimit(endpoint: string, attempts: number): Promise<void> {
    await this.logSecurityEvent('error', 'RATE_LIMIT_EXCEEDED', {
      endpoint,
      attempts,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Log security violations
   */
  static async logSecurityViolation(violation: string, context?: any): Promise<void> {
    await this.logSecurityEvent('error', 'SECURITY_VIOLATION', {
      violation,
      context: this.sanitizeLogData(context)
    });
  }

  /**
   * Log authentication events
   */
  static async logAuthEvent(event: string, success: boolean, details?: any): Promise<void> {
    await this.logSecurityEvent(
      success ? 'info' : 'warn',
      `AUTH_${event.toUpperCase()}`,
      { success, ...this.sanitizeLogData(details) }
    );
  }
}
