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
import { ExamsService } from '@/exams/exams.service';
import {
  DeleteExamDto,
  ExamIdDto,
  ExamPaginationBodyDto,
} from '@/exams/dto/exam.dto';
import type { IExamPaginationArgs } from '@/exams/interfaces/exams.types';
import type { IExamJwtPayload } from '@/exam-auth/interfaces/exam-auth.types';

/**
 * Đề thi (SSR + AJAX) — thay controller test.php của DHT_OneTest.
 * Route ở path gốc (VERSION_NEUTRAL, trong exclude của global prefix /api) để
 * khớp URL `/test/...` mà test.js gọi. AJAX dùng @SkipTransform để trả nguyên
 * shape JS gốc mong đợi (mảng / object / boolean).
 *
 * Đã port (slice 1 — trang danh sách GV): trang SSR /test, danh sách chính
 * (pagination/getTotalPages, lọc trạng thái/môn/nhóm/từ khoá), xoá đề,
 * get_subjects/get_groups (dropdown lọc), getDetail.
 * CHƯA port: tạo/sửa đề (add/update + addTest/updateTest), chọn câu hỏi
 * (select_question), chi tiết kết quả (detail), luồng làm bài & chấm (Phase 4 tiếp).
 */
@Controller({ path: 'test', version: VERSION_NEUTRAL })
export class ExamsController {
  constructor(private readonly exams: ExamsService) {}

  private parseArgs(raw: string): IExamPaginationArgs {
    try {
      return JSON.parse(raw) as IExamPaginationArgs;
    } catch {
      return {};
    }
  }

  /** GET /test — trang danh sách đề thi (thay Test::default). */
  @Permissions('dethi', 'view')
  @Get()
  @Render('pages/test')
  page(@Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return { Title: 'Đề kiểm tra', Page: 'test', user };
  }

  /** GET /test/get_subjects — môn được phân công (dropdown lọc). */
  @Permissions('dethi', 'view')
  @SkipTransform()
  @Get('get_subjects')
  getSubjects(@Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return this.exams.getAllSubjects(user.id);
  }

  /** GET /test/get_groups — tất cả nhóm còn hiệu lực (dropdown lọc). */
  @Permissions('dethi', 'view')
  @SkipTransform()
  @Get('get_groups')
  getGroups() {
    return this.exams.getAllGroups();
  }

  /** POST /test/getTotalPages — tổng số trang danh sách (pagination.js). */
  @Permissions('dethi', 'view')
  @SkipTransform()
  @Post('getTotalPages')
  getTotalPages(@Body() dto: ExamPaginationBodyDto, @Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return this.exams.countCreatedTestPages(user.id, this.parseArgs(dto.args));
  }

  /** POST /test/pagination — 1 trang danh sách đề thi (pagination.js). */
  @Permissions('dethi', 'view')
  @SkipTransform()
  @Post('pagination')
  paginate(@Body() dto: ExamPaginationBodyDto, @Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return this.exams.listCreatedTests(user.id, this.parseArgs(dto.args));
  }

  /** POST /test/getDetail — chi tiết 1 đề thi (kèm chương + nhóm). */
  @Permissions('dethi', 'view')
  @SkipTransform()
  @Post('getDetail')
  getDetail(@Body() dto: ExamIdDto) {
    return this.exams.getById(dto.made);
  }

  /** POST /test/delete — xoá đề thi (chặn nếu đã có thí sinh làm). */
  @Permissions('dethi', 'delete')
  @SkipTransform()
  @Post('delete')
  delete(@Body() dto: DeleteExamDto) {
    return this.exams.delete(dto.made);
  }
}
