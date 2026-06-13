import { Injectable, Logger, Scope } from '@nestjs/common';

interface LogMeta {
  [key: string]: any;
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private readonly logger: Logger;
  private readonly isDevelopment =
    process.env.NODE_ENV === 'development';

  constructor(private readonly context: string = 'App') {
    this.logger = new Logger(context);
  }

  /**
   * Debug log
   */
  debug(message: string, meta?: LogMeta): void {
    if (!this.isDevelopment) return;

    this.logger.debug(this.formatMessage('DEBUG', message, meta));
  }

  /**
   * Info log
   */
  info(message: string, meta?: LogMeta): void {
    this.logger.log(this.formatMessage('INFO', message, meta));
  }

  /**
   * Warning log
   */
  warn(message: string, meta?: LogMeta): void {
    this.logger.warn(this.formatMessage('WARN', message, meta));
  }

  /**
   * Error log
   */
  error(message: string, error?: Error, meta?: LogMeta): void {
    this.logger.error(
      this.formatMessage('ERROR', message, meta),
      error?.stack,
    );
  }

  /**
   * Format log message
   */
  private formatMessage(
    level: string,
    message: string,
    meta?: LogMeta,
  ): string {
    const timestamp = new Date().toISOString();

    return `[${timestamp}] [${level}] ${message}${
      meta ? ` | ${JSON.stringify(meta)}` : ''
    }`;
  }
}