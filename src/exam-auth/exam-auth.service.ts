import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { comparePassword } from '@/lib/bcrypt/bcrypt';
import {
  UnauthorizedException,
  ForbiddenException,
} from '@/common/exceptions/app.exception';
import { ExamLoginDto } from '@/exam-auth/dto/exam-login.dto';
import type {
  IExamJwtPayload,
  IExamLoginResult,
} from '@/exam-auth/interfaces/exam-auth.types';

/**
 * Logic xác thực hệ thi — thay NguoiDungModel (checkLogin/validateToken) của PHP.
 * Dùng JWT (stack có sẵn) thay token tự chế + $_SESSION. Xem docs/09.
 */
@Injectable()
export class ExamAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: ExamLoginDto): Promise<IExamLoginResult> {
    const user = await this.prisma.nguoiDung.findUnique({
      where: { id: dto.id },
      include: { nhomQuyen: true },
    });

    if (!user) throw new UnauthorizedException('Tài khoản không tồn tại');
    if (user.trangthai === 0) throw new ForbiddenException('Tài khoản bị khóa');
    if (!user.matkhau)
      throw new UnauthorizedException('Tài khoản chưa đặt mật khẩu');

    const ok = await comparePassword(dto.password, user.matkhau);
    if (!ok) throw new UnauthorizedException('Mật khẩu không đúng');

    if (user.manhomquyen == null || !user.nhomQuyen)
      throw new ForbiddenException('Tài khoản chưa được gán nhóm quyền');

    const payload: IExamJwtPayload = {
      id: user.id,
      email: user.email,
      hoten: user.hoten,
      manhomquyen: user.manhomquyen,
      roleName: user.nhomQuyen.tennhomquyen,
    };

    const accessToken = await this.jwt.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        hoten: user.hoten,
        manhomquyen: user.manhomquyen,
        roleName: user.nhomQuyen.tennhomquyen,
        avatar: user.avatar,
      },
    };
  }
}
