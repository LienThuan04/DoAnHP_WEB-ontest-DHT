import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Req,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import type { Request } from 'express';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { SkipTransform } from '@/common/decorators/skip-transform.decorator';
import { UsersService } from '@/users/users.service';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { UpdateUserDto } from '@/users/dto/update-user.dto';
import {
  CheckUserDto,
  PaginationBodyDto,
  SetStatusDto,
  UserIdDto,
} from '@/users/dto/user-query.dto';
import type { IPaginationArgs } from '@/users/interfaces/users.types';
import type { IExamJwtPayload } from '@/exam-auth/interfaces/exam-auth.types';

/**
 * Quản lý người dùng (SSR + AJAX) — thay user.php. Route ở path gốc
 * (VERSION_NEUTRAL, trong exclude của global prefix). AJAX dùng @SkipTransform
 * trả nguyên shape JS gốc mong đợi ({status,message} / {success} / mảng).
 */
@Controller({ path: 'user', version: VERSION_NEUTRAL })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private parseArgs(raw: string): IPaginationArgs {
    try {
      return JSON.parse(raw) as IPaginationArgs;
    } catch {
      return {};
    }
  }

  /** GET /user — trang quản lý người dùng (thay User::default). */
  @Permissions('nguoidung', 'view')
  @Get()
  @Render('pages/user')
  async page(@Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    const roles = await this.usersService.getAllRoles();
    return { Title: 'Quản lý người dùng', Page: 'user', user, roles };
  }

  /** POST /user/getTotalPages — tổng số trang (pagination.js). */
  @Permissions('nguoidung', 'view')
  @SkipTransform()
  @Post('getTotalPages')
  getTotalPages(@Body() dto: PaginationBodyDto) {
    return this.usersService.getTotalPages(this.parseArgs(dto.args));
  }

  /** POST /user/pagination — 1 trang dữ liệu (pagination.js). */
  @Permissions('nguoidung', 'view')
  @SkipTransform()
  @Post('pagination')
  paginate(@Body() dto: PaginationBodyDto) {
    return this.usersService.paginate(this.parseArgs(dto.args));
  }

  /** POST /user/checkUser — kiểm tra trùng id/email (thay checkUser). */
  @Permissions('nguoidung', 'view')
  @SkipTransform()
  @Post('checkUser')
  checkUser(@Body() dto: CheckUserDto) {
    return this.usersService.checkUser(dto.mssv, dto.email);
  }

  /** POST /user/getDetail — chi tiết người dùng (thay getDetail). */
  @Permissions('nguoidung', 'view')
  @SkipTransform()
  @Post('getDetail')
  getDetail(@Body() dto: UserIdDto) {
    return this.usersService.getDetail(dto.id);
  }

  /** POST /user/add — thêm người dùng (thay add). */
  @Permissions('nguoidung', 'create')
  @SkipTransform()
  @Post('add')
  add(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  /** POST /user/update — cập nhật người dùng (thay update). */
  @Permissions('nguoidung', 'update')
  @SkipTransform()
  @Post('update')
  update(@Body() dto: UpdateUserDto) {
    return this.usersService.update(dto);
  }

  /** POST /user/deleteData — xoá mềm người dùng (thay deleteData). */
  @Permissions('nguoidung', 'delete')
  @SkipTransform()
  @Post('deleteData')
  deleteData(@Body() dto: UserIdDto) {
    return this.usersService.delete(dto.id);
  }

  /** POST /user/setStatus — khoá/mở khoá (thay setStatus). */
  @Permissions('nguoidung', 'update')
  @SkipTransform()
  @Post('setStatus')
  async setStatus(@Body() dto: SetStatusDto) {
    const ok = await this.usersService.setStatus(dto.id, dto.status);
    return { success: ok };
  }
}
