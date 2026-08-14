import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { AppException } from '@/common/exceptions/app.exception';

@Catch() // Bắt tất cả các loại exception, còn nếu bắt cụ thể thì điền vào trong @Catch(HttpException) hoặc @Catch(AppException) là bắt riêng từng loại
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp(); // lấy context của HTTP request/response, nếu là WebSocket thì dùng switchToWs(), GraphQL thì dùng switchToGraphQL()... tùy vào loại ứng dụng của bạn

    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal Server Error';
    let code = 'INTERNAL_SERVER_ERROR';
    let details: unknown;

    /**
     * 1. Custom App Exception
     */
    if (exception instanceof AppException) {
      statusCode = exception.statusCode;
      message = exception.message;
      code = exception.code;
      details = exception.details;
    } else if (exception instanceof HttpException) {
      /**
       * 2. NestJS Default Exception
       */
      statusCode = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        // Shape do ValidationPipe/Nest trả về: { message: string | string[], errors?: [] }
        const res = exceptionResponse as {
          message?: string | string[];
          errors?: unknown;
        };

        message = Array.isArray(res.message)
          ? res.message.join(', ')
          : res.message || message;

        // Preserve validation errors detail from ValidationPipe
        if (Array.isArray(res.errors)) {
          details = res.errors;
        }
      } else {
        message = String(exceptionResponse);
      }

      code = 'HTTP_EXCEPTION';
    } else if (exception instanceof Error) {
      /**
       * 3. Unknown Error
       */
      message = exception.message;
    }

    /**
     * Logging — lỗi 4xx (404 vào URL sai, 403 thiếu quyền...) là chuyện thường
     * ngày nên chỉ ghi WARN gọn; chỉ 5xx mới là sự cố thật → ERROR kèm stack.
     */
    const logEntry = {
      method: request.method,
      path: request.url,
      statusCode,
      message,
      code,
    };
    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error({
        ...logEntry,
        stack: exception instanceof Error ? exception.stack : null,
      });
    } else {
      this.logger.warn(logEntry);
    }

    // Không còn gì để gửi (vd lỗi xảy ra khi response đã bắt đầu stream).
    if (response.headersSent) return;

    /**
     * Trang lỗi HTML cho hệ thi (SSR) — thay myerror.php + error/page_40x.php.
     * Chỉ áp dụng cho điều hướng bằng trình duyệt; AJAX/API vẫn nhận JSON.
     */
    if (this.wantsHtmlPage(request)) {
      this.renderErrorPage(request, response, statusCode, message);
      return;
    }

    /**
     * Standard Response
     */
    response.status(statusCode).json({
      statusCode,
      message,
      code,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(details ? { details } : {}),
    });
  }

  /**
   * Yêu cầu này có phải người dùng đang MỞ MỘT TRANG bằng trình duyệt không?
   * - Chỉ `GET` (mọi AJAX ghi dữ liệu của JS gốc đều là POST → giữ JSON).
   * - Không phải XHR (`req.xhr` = header `X-Requested-With: XMLHttpRequest`
   *   jQuery tự gắn) và client phải chấp nhận `text/html`.
   * - Không nằm dưới global prefix `/api` (đó là API thuần, luôn trả JSON).
   */
  private wantsHtmlPage(request: Request): boolean {
    if (request.method !== 'GET') return false;
    if (request.xhr) return false;

    const accept = request.headers.accept ?? '';
    if (!accept.includes('text/html')) return false;

    const globalPrefix =
      this.configService.get<string>('GLOBAL_PREFIX') || 'api';
    const path = (request.path || request.url || '').split('?')[0];
    if (path === `/${globalPrefix}` || path.startsWith(`/${globalPrefix}/`)) {
      return false;
    }
    return true;
  }

  /**
   * 401 → về trang đăng nhập (thay `AuthCore::checkAuthentication`: xoá cookie
   * hỏng/hết hạn rồi `header("Location: login_path")`).
   * 403/404 → 2 trang lỗi bê từ PHP; còn lại → trang 500 chung.
   */
  private renderErrorPage(
    request: Request,
    response: Response,
    statusCode: HttpStatus,
    message: string,
  ): void {
    if (statusCode === HttpStatus.UNAUTHORIZED) {
      const cookieName =
        this.configService.get<string>('ACCESS_TOKEN_COOKIE') || 'access_token';
      response.clearCookie(cookieName, { path: '/' });
      response.redirect('/auth/signin');
      return;
    }

    const view =
      statusCode === HttpStatus.FORBIDDEN
        ? 'pages/error/page_403'
        : statusCode === HttpStatus.NOT_FOUND
          ? 'pages/error/page_404'
          : 'pages/error/page_500';

    // Thông điệp kỹ thuật chỉ lộ ở môi trường phát triển.
    const isDev = this.configService.get<string>('MODE') === 'development';

    response
      .status(statusCode)
      .render(
        view,
        { Title: 'Lỗi !', code: statusCode, detail: isDev ? message : null },
        (err: Error | null, html: string) => {
          if (err) {
            // Không render được trang lỗi thì cũng KHÔNG được ném tiếp (sẽ lặp vô hạn).
            this.logger.error(
              `Không render được trang lỗi ${view} cho ${request.url}: ${err.message}`,
            );
            response.type('text/plain').send(`${statusCode} - ${message}`);
            return;
          }
          response.send(html);
        },
      );
  }
}
