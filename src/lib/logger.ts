/**
 * @fileoverview Structured logging system
 * @version 1.0.0
 * @created 2024-03-21
 * @copyright Write Care Notes Ltd
 */

interface LoggerConfig {
  service: string;
  version?: string;
  environment?: string;
}

interface LogMetadata {
  [key: string]: any;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private service: string;
  private version: string;
  private environment: string;

  constructor(config: LoggerConfig) {
    this.service = config.service;
    this.version = config.version || '1.0.0';
    this.environment = config.environment || process.env.NODE_ENV || 'development';
  }

  private formatMessage(level: LogLevel, message: string, metadata?: LogMetadata) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      service: this.service,
      version: this.version,
      environment: this.environment,
      message,
      ...(metadata && { metadata })
    };

    // In production, we might want to send this to a logging service
    if (this.environment === 'production') {
      // TODO: Implement production logging service integration
      // e.g., Winston, Bunyan, or cloud logging services
    }

    return JSON.stringify(logEntry);
  }

  debug(message: string, metadata?: LogMetadata) {
    if (this.environment !== 'production') {
      console.debug(this.formatMessage('debug', message, metadata));
    }
  }

  info(message: string, metadata?: LogMetadata) {
    console.info(this.formatMessage('info', message, metadata));
  }

  warn(message: string, metadata?: LogMetadata) {
    console.warn(this.formatMessage('warn', message, metadata));
  }

  error(message: string, error?: Error, metadata?: LogMetadata) {
    console.error(this.formatMessage('error', message, {
      ...metadata,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    }));
  }

  // Specialized logging methods for security events
  security(message: string, metadata?: LogMetadata) {
    const securityMetadata = {
      ...metadata,
      timestamp: new Date().toISOString(),
      type: 'SECURITY_EVENT'
    };
    console.warn(this.formatMessage('warn', message, securityMetadata));
    
    // In production, we might want to trigger alerts
    if (this.environment === 'production' && metadata?.severity === 'high') {
      this.triggerSecurityAlert(message, securityMetadata);
    }
  }

  private async triggerSecurityAlert(message: string, metadata: LogMetadata) {
    try {
      // TODO: Implement security alert system
      // e.g., send email, Slack notification, or trigger incident response
      const alertPayload = {
        message,
        metadata,
        timestamp: new Date().toISOString()
      };

      // Example: Send to security team
      // await notifySecurityTeam(alertPayload);
    } catch (error) {
      this.error('Failed to trigger security alert', error as Error);
    }
  }
} 


