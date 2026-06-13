import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '@/prisma/prisma.service';
import {
  PERMISSIONS_KEY,
  RequiredPermission,
} from '@/common/decorators/permissions.decorator';
import { ForbiddenException } from '@/common/exceptions/app.exception';
import type { IExamJwtPayload } from '@/exam-auth/interfaces/exam-auth.types';

/**
 * Phân quyền động cho hệ thi (RBAC) — thay AuthCore::checkPermission của PHP.
 * Đăng ký global SAU JwtAuthGuard (cần req.user trước). Route không gắn
 * @Permissions() sẽ được bỏ qua (return true). Xem docs/06.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    // Route không yêu cầu quyền cụ thể → cho qua (JwtAuthGuard đã lo xác thực).
    if (!required) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as IExamJwtPayload | undefined;

    if (!user || user.manhomquyen == null) {
      throw new ForbiddenException('Tài khoản không có nhóm quyền hợp lệ');
    }

    const count = await this.prisma.chiTietQuyen.count({
      where: {
        manhomquyen: user.manhomquyen,
        chucnang: required.resource,
        hanhdong: required.action,
      },
    });

    if (count === 0) {
      throw new ForbiddenException(
        `Bạn không có quyền '${required.action}' trên '${required.resource}'`,
      );
    }
    return true;
  }
}
