import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppException } from '@/common/exceptions/app.exception';

@Catch() // Bắt tất cả các loại exception, còn nếu bắt cụ thể thì điền vào trong @Catch(HttpException) hoặc @Catch(AppException) là bắt riêng từng loại
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp(); // lấy context của HTTP request/response, nếu là WebSocket thì dùng switchToWs(), GraphQL thì dùng switchToGraphQL()... tùy vào loại ứng dụng của bạn

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: any;

    /**
     * 1. Custom App Exception
     */
    if (exception instanceof AppException) {
      statusCode = exception.statusCode;
      message = exception.message;
      code = exception.code;
      details = exception.details;
    }

    /**
     * 2. NestJS Default Exception
     */
    else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const res = exceptionResponse as any;

        message = Array.isArray(res.message)
          ? res.message.join(', ')
          : res.message || message;

        // Preserve validation errors detail from ValidationPipe
        if (res.errors && Array.isArray(res.errors)) {
          details = res.errors;
        }
      } else {
        message = String(exceptionResponse);
      }

      code = 'HTTP_EXCEPTION';
    }

    /**
     * 3. Unknown Error
     */
    else if (exception instanceof Error) {
      message = exception.message;
    }

    /**
     * Logging
     */
    this.logger.error({
      method: request.method,
      path: request.url,
      statusCode,
      message,
      code,
      stack: exception instanceof Error ? exception.stack : null,
    });

    /**
     * Standard Response
     */
    response.status(statusCode).json({
      statusCode,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(details && { details }),
    });
  }
}