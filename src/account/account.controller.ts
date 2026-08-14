import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Render,
  Req,
  UploadedFile,
  UseInterceptors,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { MULTER_LIMITS } from '@/common/config/upload.config';
import { SkipTransform } from '@/common/decorators/skip-transform.decorator';
import { AccountService } from '@/account/account.service';
import { ChangePasswordDto, ChangeProfileDto } from '@/account/dto/account.dto';
import type { IExamJwtPayload } from '@/exam-auth/interfaces/exam-auth.types';

/**
 * Trang cá nhân (SSR + AJAX) — thay account.php + account_setting.php.
 * Route ở path gốc `/account/...` (VERSION_NEUTRAL, trong exclude global prefix)
 * để khớp URL account_setting.js gọi.
 *
 * RBAC: y PHP — mọi route CHỈ cần đăng nhập (JwtAuthGuard), không gate quyền
 * riêng, vì người dùng chỉ thao tác trên hồ sơ của CHÍNH MÌNH (id lấy từ JWT,
 * không nhận id từ client).
 *
 * KHÔNG port `checkAllow` (PHP gọi updateProfile sai số tham số, không JS nào
 * gọi) và `check` (in `$_SESSION` để debug).
 */
@Controller({ path: 'account', version: VERSION_NEUTRAL })
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  /** GET /account — trang cá nhân (thay Account::default). */
  @Get()
  @Render('pages/account_setting')
  async page(@Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    const profile = await this.accountService.getProfile(user.id);
    if (!profile) throw new NotFoundException('Không tìm thấy người dùng');
    return { Title: 'Trang cá nhân', Page: 'account_setting', user, profile };
  }

  /** GET /account/getRole — bản đồ quyền của user hiện tại (thay Account::getRole). */
  @SkipTransform()
  @Get('getRole')
  getRole(@Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return this.accountService.getRoleMap(user.manhomquyen);
  }

  /** POST /account/changePassword — đổi mật khẩu (trả {valid,message}). */
  @SkipTransform()
  @Post('changePassword')
  changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    const user = req.user as IExamJwtPayload;
    return this.accountService.changePassword(
      user.id,
      dto.matkhaucu,
      dto.matkhaumoi,
    );
  }

  /** POST /account/changeProfile — cập nhật hồ sơ (trả {valid,message}). */
  @SkipTransform()
  @Post('changeProfile')
  changeProfile(@Req() req: Request, @Body() dto: ChangeProfileDto) {
    const user = req.user as IExamJwtPayload;
    return this.accountService.changeProfile(
      user.id,
      dto.hoten,
      dto.email,
      dto.ngaysinh,
      dto.gioitinh,
    );
  }

  /**
   * POST /account/uploadFile — đổi ảnh đại diện. Trả `true|false` y PHP.
   * account_setting.js gửi field file tên `file-img` (FormData), luôn gọi kèm
   * changeProfile nên body có thể RỖNG khi người dùng không chọn ảnh mới.
   */
  @SkipTransform()
  @Post('uploadFile')
  @UseInterceptors(FileInterceptor('file-img', { limits: MULTER_LIMITS }))
  uploadFile(@Req() req: Request, @UploadedFile() file?: Express.Multer.File) {
    const user = req.user as IExamJwtPayload;
    return this.accountService.uploadAvatar(user.id, file);
  }
}
