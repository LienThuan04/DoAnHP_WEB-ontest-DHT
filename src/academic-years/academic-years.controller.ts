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
import { AcademicYearsService } from '@/academic-years/academic-years.service';
import {
  AddNamHocDto,
  GetNamHocDto,
  NamHocIdDto,
  UpdateNamHocDto,
} from '@/academic-years/dto/academic-year.dto';
import type { IExamJwtPayload } from '@/exam-auth/interfaces/exam-auth.types';

/**
 * Năm học & Học kỳ (SSR + AJAX) — thay controller namhoc.php của DHT_OneTest.
 * Route ở path gốc (VERSION_NEUTRAL, nằm trong exclude của global prefix /api)
 * để khớp các URL `/namhoc/...` mà namhoc.js gọi. Các endpoint AJAX dùng
 * @SkipTransform để trả nguyên shape JS gốc mong đợi ({data,total} / {success} / mảng).
 *
 * RBAC: trang + đọc dữ liệu cần 'namhoc'/'view'; thêm/sửa/xoá theo hành động
 * tương ứng (chặt hơn bản PHP vốn chỉ checkAuthentication). Xem docs/06, 08.
 */
@Controller({ path: 'namhoc', version: VERSION_NEUTRAL })
export class AcademicYearsController {
  constructor(private readonly academicYears: AcademicYearsService) {}

  /** GET /namhoc — trang quản lý năm học (thay NamHoc::default). */
  @Permissions('namhoc', 'view')
  @Get()
  @Render('pages/namhoc')
  page(@Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return { Title: 'Năm học - Học kỳ', Page: 'namhoc', user };
  }

  /** POST /namhoc/getNamHoc — danh sách + phân trang (thay getNamHoc). */
  @Permissions('namhoc', 'view')
  @SkipTransform()
  @Post('getNamHoc')
  getNamHoc(@Body() dto: GetNamHocDto) {
    return this.academicYears.getNamHoc(dto.page, dto.limit, dto.q);
  }

  /** POST /namhoc/getHocKy — học kỳ của 1 năm học (thay getHocKy). */
  @Permissions('namhoc', 'view')
  @SkipTransform()
  @Post('getHocKy')
  getHocKy(@Body() dto: NamHocIdDto) {
    return this.academicYears.getHocKy(dto.manamhoc);
  }

  /** POST /namhoc/addNamHoc — thêm năm học + tự sinh học kỳ (thay addNamHoc). */
  @Permissions('namhoc', 'create')
  @SkipTransform()
  @Post('addNamHoc')
  addNamHoc(@Body() dto: AddNamHocDto) {
    return this.academicYears.addNamHoc(dto.tennamhoc, dto.sohocky);
  }

  /** POST /namhoc/updateNamHoc — sửa năm học + đồng bộ học kỳ (thay updateNamHoc). */
  @Permissions('namhoc', 'update')
  @SkipTransform()
  @Post('updateNamHoc')
  updateNamHoc(@Body() dto: UpdateNamHocDto) {
    return this.academicYears.updateNamHoc(
      dto.manamhoc,
      dto.tennamhoc,
      dto.trangthai ?? 1,
      dto.sohocky,
    );
  }

  /** POST /namhoc/deleteNamHoc — xoá mềm năm học (thay deleteNamHoc). */
  @Permissions('namhoc', 'delete')
  @SkipTransform()
  @Post('deleteNamHoc')
  async deleteNamHoc(@Body() dto: NamHocIdDto) {
    const success = await this.academicYears.deleteNamHoc(dto.manamhoc);
    return { success };
  }
}
