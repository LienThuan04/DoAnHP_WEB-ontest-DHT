import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { IExamJwtPayload } from '@/exam-auth/interfaces/exam-auth.types';

/**
 * Xác thực JWT cho hệ thi (hạ tầng giữ lại từ bộ khung).
 * Lấy access token từ: (1) cookie httpOnly cho trang SSR/trình duyệt,
 * (2) header Authorization: Bearer cho API/mobile. Xem docs/06.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_ACCESS_TOKEN_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT secret key is not defined in environment variables');
    }
    const accessCookieName =
      configService.get<string>('ACCESS_TOKEN_COOKIE') || 'access_token';
    const cookieExtractor = (req: Request): string | null => {
      const cookies = (req as Request & { cookies?: Record<string, string> })
        .cookies;
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

  validate(payload: IExamJwtPayload) {
    return payload; // req.user = payload (id, email, hoten, manhomquyen, roleName)
  }
}
