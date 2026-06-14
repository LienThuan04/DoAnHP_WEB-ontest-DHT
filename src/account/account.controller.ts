import { Controller, Get, Req, VERSION_NEUTRAL } from '@nestjs/common';
import type { Request } from 'express';
import { SkipTransform } from '@/common/decorators/skip-transform.decorator';
import { AccountService } from '@/account/account.service';
import type { IExamJwtPayload } from '@/exam-auth/interfaces/exam-auth.types';

/**
 * Trang cá nhân (SSR/AJAX) — thay account.php. Phase 2 mới port getRole để
 * cấp bản đồ quyền cho permission.js (ẩn/hiện nút theo RBAC). Xem docs/06.
 */
@Controller({ path: 'account', version: VERSION_NEUTRAL })
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  /** GET /account/getRole — bản đồ quyền của user hiện tại (thay Account::getRole). */
  @SkipTransform()
  @Get('getRole')
  getRole(@Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return this.accountService.getRoleMap(user.manhomquyen);
  }
}
