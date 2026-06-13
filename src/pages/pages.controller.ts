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
  landing() {
    return { Title: 'OnTest — Thi trắc nghiệm trực tuyến' };
  }

  @Get('dashboard')
  @Render('pages/dashboard')
  dashboard(@Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return { Title: 'Bảng điều khiển', Page: 'dashboard', user };
  }
}
