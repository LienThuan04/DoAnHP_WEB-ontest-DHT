import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';
import { SKIP_TRANSFORM_KEY } from '@/common/decorators/skip-transform.decorator';

// Metadata key NestJS gắn lên handler có @Render() — dùng để tự bỏ qua route SSR.
const RENDER_METADATA = '__renderTemplate__';

export interface IApiResponse<T> {
  statusCode: number;
  message: string;
  code?: string;
  data?: T;
  timestamp?: string;
  path?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  IApiResponse<T>
> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<T>> {
    const handler = context.getHandler();

    // Route SSR: có @Render() hoặc đánh dấu @SkipTransform() → trả nguyên vẹn,
    // không bọc JSON (nếu bọc sẽ phá HTML / model truyền cho view).
    const isRender = !!this.reflector.get(RENDER_METADATA, handler);
    const isSkipped = this.reflector.getAllAndOverride<boolean>(
      SKIP_TRANSFORM_KEY,
      [handler, context.getClass()],
    );
    if (isRender || isSkipped) {
      return next.handle() as Observable<IApiResponse<T>>;
    }

    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data: unknown): IApiResponse<T> => {
        // nếu response đã chuẩn rồi thì giữ nguyên
        if (
          data &&
          typeof data === 'object' &&
          'statusCode' in data &&
          'message' in data
        ) {
          const std = data as IApiResponse<T>;
          return {
            ...std,
            code: std.code || 'SUCCESS',
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        }

        return {
          statusCode: HttpStatus.OK,
          message: 'Request successful',
          code: 'SUCCESS',
          data: data as T,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}
