import { Controller, Post, Req, VERSION_NEUTRAL } from '@nestjs/common';
import type { Request } from 'express';
import { SkipTransform } from '@/common/decorators/skip-transform.decorator';
import { ClassModulesService } from '@/class-modules/class-modules.service';
import type { IExamJwtPayload } from '@/exam-auth/interfaces/exam-auth.types';

/**
 * Nhóm học phần (module.php) — hiện chỉ phục vụ loadData cho trang tạo/sửa đề.
 * Route ở path gốc `/module/...` (VERSION_NEUTRAL, trong exclude global prefix).
 * loadData chỉ yêu cầu đăng nhập (PHP dùng AuthCore::checkAuthentication, không
 * gate quyền riêng) → không gắn @Permissions, chỉ dựa JwtAuthGuard toàn cục.
 */
@Controller({ path: 'module', version: VERSION_NEUTRAL })
export class ClassModulesController {
  constructor(private readonly classModules: ClassModulesService) {}

  /** POST /module/loadData — nhóm GV đang dạy (dropdown chọn nhóm khi tạo đề). */
  @SkipTransform()
  @Post('loadData')
  loadData(@Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return this.classModules.getBySubject(user.id);
  }
}
