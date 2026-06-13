import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Res,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { Public } from '@/common/decorators/metadata';
import { SkipTransform } from '@/common/decorators/skip-transform.decorator';
import { ExamAuthService } from '@/exam-auth/exam-auth.service';
import { ExamLoginDto } from '@/exam-auth/dto/exam-login.dto';

/**
 * Đăng nhập hệ thi (SSR) — thay auth.php (signin/checkLogin/logout).
 * VERSION_NEUTRAL + path nằm trong exclude của global prefix → route ở gốc:
 *   GET  /auth/signin   (render form)
 *   POST /auth/login    (xử lý đăng nhập, set cookie JWT)
 *   POST /auth/logout   (xoá cookie, về trang đăng nhập)
 */
@Controller({ path: 'auth', version: VERSION_NEUTRAL })
export class ExamAuthController {
  private readonly cookieName: string;

  constructor(
    private readonly examAuthService: ExamAuthService,
    private readonly config: ConfigService,
  ) {
    this.cookieName =
      this.config.get<string>('ACCESS_TOKEN_COOKIE') || 'access_token';
  }

  @Public()
  @Get('signin')
  @Render('pages/auth/signin')
  signin() {
    // = AuthCore::onLogin + view('single_layout', Page:'auth/signin')
    return { Title: 'Đăng nhập', Page: 'auth/signin' };
  }

  @Public()
  @Post('login')
  async login(
    @Body() dto: ExamLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.examAuthService.login(dto);
    res.cookie(this.cookieName, result.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1h (đồng bộ JWT_ACCESS_EXPIRE)
      path: '/',
    });
    // Không phải route render → TransformInterceptor bọc thành {statusCode,message,data}
    return { statusCode: 200, message: 'Đăng nhập thành công', data: result.user };
  }

  @Public()
  @SkipTransform()
  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie(this.cookieName, { path: '/' });
    res.redirect('/auth/signin');
  }
}
