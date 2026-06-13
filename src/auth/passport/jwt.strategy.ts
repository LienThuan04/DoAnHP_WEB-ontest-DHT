import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { IJwtPayload } from '@/auth/interfaces/auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_ACCESS_TOKEN_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT secret key is not defined in environment variables');
    }
    const accessCookieName =
      configService.get<string>('ACCESS_TOKEN_COOKIE') || 'access_token';
    // Lấy access token từ: (1) cookie httpOnly cho trang SSR/trình duyệt (hệ thi),
    // (2) header Authorization: Bearer cho API/mobile (giữ nguyên cách cũ).
    const cookieExtractor = (req: Request): string | null => {
      const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
      return cookies?.[accessCookieName] ?? null;
    };
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: IJwtPayload) {
    return payload; // You can add additional validation logic here if needed
  }
}
