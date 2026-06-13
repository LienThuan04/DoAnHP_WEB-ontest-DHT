import { Controller, Get, Render, Req, VERSION_NEUTRAL } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '@/common/decorators/metadata';
import type { IExamJwtPayload } from '@/exam-auth/interfaces/exam-auth.types';

/**
 * Trang SSR gốc (không prefix /api, VERSION_NEUTRAL):
 *   GET /          landing (công khai) — thay landing.php
 *   GET /dashboard cần đăng nhập (JwtAuthGuard global) — thay dashboard.php
 *
 * Ví dụ gắn RBAC cho route nội bộ:
 *   @Permissions('dashboard', 'view')   // cần seed chitietquyen tương ứng
 */
@Controller({ version: VERSION_NEUTRAL })
export class PagesController {
  @Public()
  @Get()
  @Render('pages/landing')
  landing(@Req() req: Request) {
    // Landing công khai: chỉ cần biết đã đăng nhập chưa để đổi nút
    // (Đăng nhập <-> Dashboard) — kiểm sự hiện diện cookie, không cần verify.
    const cookieName = process.env.ACCESS_TOKEN_COOKIE || 'access_token';
    const isLoggedIn = !!req.cookies?.[cookieName];
    return { Title: 'DHT ONTEST', isLoggedIn };
  }

  @Get('dashboard')
  @Render('pages/dashboard')
  dashboard(@Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return { Title: 'Bảng điều khiển', Page: 'dashboard', user };
  }
}
