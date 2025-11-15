/**
 * Structured logging utility for Goal Pilot
 * Provides environment-aware logging with different levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  /**
   * Debug logs - only shown in development
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.log(this.formatMessage('debug', message, context))
    }
  }

  /**
   * Info logs - shown in development, minimal in production
   */
  info(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.log(this.formatMessage('info', message, context))
    }
  }

  /**
   * Warning logs - shown in all environments
   */
  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context))
  }

  /**
   * Error logs - always shown, should be tracked in production
   */
  error(message: string, context?: LogContext): void {
    console.error(this.formatMessage('error', message, context))

    // In production, you can send to error tracking service like Sentry
    // if (!this.isDev && typeof window !== 'undefined') {
    //   // Track error with external service
    // }
  }
}

export const logger = new Logger()
