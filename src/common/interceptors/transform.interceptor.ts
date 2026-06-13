import { Injectable, NestInterceptor, ExecutionContext, CallHandler, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request } from 'express';

export interface IApiResponse<T> {
  statusCode: number;
  message: string;
  code?: string;
  data?: T;
  timestamp?: string;
  path?: string;
}



@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, IApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<IApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data) => {
        // nếu response đã chuẩn rồi thì giữ nguyên
        if (data && typeof data === 'object' && 'statusCode' in data && 'message' in data) {
          return {
            ...data,
            code: data.code || 'SUCCESS',
            timestamp: new Date().toISOString(),
            path: request.url,
          };
        } 

        return {
          statusCode: HttpStatus.OK,
          message: 'Request successful',
          code: 'SUCCESS',
          data,
          timestamp: new Date().toISOString(),
          path: request.url,
        };
      }),
    );
  }
}