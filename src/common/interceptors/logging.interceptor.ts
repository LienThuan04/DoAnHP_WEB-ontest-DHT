import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;

        this.logger.log(
          `${request.method} ${request.url} → ${response.statusCode} | ${duration}ms`,
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;

        this.logger.error(
          `${request.method} ${request.url} → ERROR | ${duration}ms`,
        );

        throw error;
      }),
    );
  }
}