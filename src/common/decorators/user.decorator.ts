import { GoogleUser } from '@/auth/passport/google/google-user.interface';
import { UserEntity } from '@/users/entities/user.entity';
import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { ClientType as ClientTypeEnum } from '@/common/enums/client-type.enum';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as UserEntity;
  },
);

export const UserGoogle = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as GoogleUser;
  },
);

export const ClientType = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ClientTypeEnum => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.headers['x-client-type'] === 'mobile'
      ? ClientTypeEnum.MOBILE
      : ClientTypeEnum.WEB;
  },
);

// Reads deviceId from X-Device-ID header (mobile) or cookie (web)
export const DeviceId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const deviceIdEnv = process.env.NAME_DEVICEID_CLIENT!;
    if (!deviceIdEnv || deviceIdEnv.trim() === '') {
      throw new Error('Device ID cookie/header name is not defined in environment variables');
    }
    const request = ctx.switchToHttp().getRequest<Request>();
    const fromHeader = request.headers['x-device-id'] as string | undefined;
    if (fromHeader?.trim()) return fromHeader.trim();
    const deviceId = request.cookies?.[deviceIdEnv];
    if (!deviceId || typeof deviceId !== 'string' || deviceId.trim() === '') {
      throw new BadRequestException('Device ID not found in X-Device-ID header or cookies');
    }
    return deviceId;
  },
);

