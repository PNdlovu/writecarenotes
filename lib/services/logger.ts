/**
 * @writecarenotes.com
 * @fileoverview Logging service
 * @version 1.0.0
 * @created 2024-01-09
 * @updated 2024-01-09
 * @author Write Care Notes team
 * @copyright Phibu Cloud Solutions Ltd
 *
 * Description:
 * Centralized logging service with structured logging and error tracking.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  module?: string;
  operation?: string;
  userId?: string;
  duration?: number;
  error?: any;
  [key: string]: any;
}

class Logger {
  private static instance: Logger;
  private environment: string;

  private constructor() {
    this.environment = process.env.NODE_ENV || 'development';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      level,
      environment: this.environment,
      message,
      ...context
    };

    if (context?.error) {
      logData.error = {
        message: context.error.message,
        stack: context.error.stack,
        code: context.error.code
      };
    }

    return JSON.stringify(logData);
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const formattedMessage = this.formatMessage(level, message, context);

    switch (level) {
      case 'debug':
        if (this.environment === 'development') {
          console.debug(formattedMessage);
        }
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        // Here you could add integration with error tracking services
        // like Sentry, Rollbar, etc.
        break;
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  }

  // Performance monitoring
  async trackOperation<T>(
    operation: string,
    module: string,
    func: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    try {
      const result = await func();
      const duration = performance.now() - startTime;
      
      this.info(`Operation completed: ${operation}`, {
        module,
        operation,
        duration,
        success: true
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.error(`Operation failed: ${operation}`, {
        module,
        operation,
        duration,
        error,
        success: false
      });
      
      throw error;
    }
  }
}

export const logger = Logger.getInstance(); 