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
import { RolesService } from '@/roles/roles.service';
import { CreateRoleDto } from '@/roles/dto/create-role.dto';
import { UpdateRoleDto } from '@/roles/dto/update-role.dto';
import { RoleIdDto, RoleQueryDto } from '@/roles/dto/role-query.dto';
import type { IExamJwtPayload } from '@/exam-auth/interfaces/exam-auth.types';

/**
 * Phân quyền (SSR + AJAX) — thay controller roles.php của DHT_OneTest.
 * Route ở path gốc (VERSION_NEUTRAL, nằm trong exclude của global prefix /api).
 * Các endpoint AJAX dùng @SkipTransform để trả nguyên giá trị (boolean/JSON)
 * đúng như roles.js gốc mong đợi (`if (response)`, `$.getJSON`). Xem docs/06, 09.
 */
@Controller({ path: 'roles', version: VERSION_NEUTRAL })
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /** GET /roles — trang quản lý nhóm quyền (thay Roles::default). */
  @Permissions('nhomquyen', 'view')
  @Get()
  @Render('pages/roles')
  page(@Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return { Title: 'Phân quyền', Page: 'roles', user };
  }

  /** GET /roles/getAllSl — danh sách + số người dùng (thay getAllSl). */
  @SkipTransform()
  @Get('getAllSl')
  getAllSl() {
    return this.rolesService.getAllSl();
  }

  /** GET /roles/getAll — danh sách nhóm quyền cho dropdown (thay getAll). */
  @SkipTransform()
  @Get('getAll')
  getAll() {
    return this.rolesService.getAll();
  }

  /** POST /roles/getDetail — chi tiết để sửa (thay getDetail). */
  @Permissions('nhomquyen', 'view')
  @SkipTransform()
  @Post('getDetail')
  getDetail(@Body() dto: RoleQueryDto) {
    return this.rolesService.getById(dto.manhomquyen);
  }

  /** POST /roles/getUsers — người dùng trong nhóm (thay getUsers). */
  @Permissions('nhomquyen', 'view')
  @SkipTransform()
  @Post('getUsers')
  getUsers(@Body() dto: RoleQueryDto) {
    return this.rolesService.getUsers(dto.manhomquyen);
  }

  /** POST /roles/add — tạo nhóm quyền (thay add). */
  @Permissions('nhomquyen', 'create')
  @SkipTransform()
  @Post('add')
  add(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto.name, dto.roles);
  }

  /** POST /roles/edit — sửa nhóm quyền (thay edit). */
  @Permissions('nhomquyen', 'update')
  @SkipTransform()
  @Post('edit')
  edit(@Body() dto: UpdateRoleDto) {
    return this.rolesService.update(dto.id, dto.name, dto.roles);
  }

  /** POST /roles/delete — xoá mềm nhóm quyền (thay delete). */
  @Permissions('nhomquyen', 'delete')
  @SkipTransform()
  @Post('delete')
  delete(@Body() dto: RoleIdDto) {
    return this.rolesService.delete(dto.id);
  }
}
