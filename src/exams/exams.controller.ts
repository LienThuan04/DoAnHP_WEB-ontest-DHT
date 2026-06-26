import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
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
  AddDetailDto,
  CreateTestDto,
  DeleteExamDto,
  ExamIdDto,
  ExamPaginationBodyDto,
  UpdateTestDto,
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

  /** GET /test/add — trang tạo đề (thay Test::add, Action=create). */
  @Permissions('dethi', 'create')
  @Get('add')
  @Render('pages/add_update_test')
  addPage(@Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return {
      Title: 'Tạo đề kiểm tra',
      Page: 'add_update_test',
      Action: 'create',
      user,
    };
  }

  /**
   * GET /test/update/:made — trang sửa đề (thay Test::update). Chỉ chủ đề mới
   * vào được (kiểm tra tồn tại + nguoitao == user). Quyền dethi.update đã gate.
   */
  @Permissions('dethi', 'update')
  @Get('update/:made')
  @Render('pages/add_update_test')
  async updatePage(@Param('made') madeRaw: string, @Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    const made = Number(madeRaw);
    if (!Number.isInteger(made) || made <= 0) {
      throw new NotFoundException('Đề thi không tồn tại');
    }
    const dethi = await this.exams.getById(made);
    if (!dethi) throw new NotFoundException('Đề thi không tồn tại');
    if (dethi.nguoitao !== user.id) {
      throw new ForbiddenException('Bạn không có quyền sửa đề thi này');
    }
    return {
      Title: 'Cập nhật đề kiểm tra',
      Page: 'add_update_test',
      Action: 'update',
      user,
    };
  }

  /**
   * GET /test/select/:made — trang chọn câu hỏi cho đề thủ công (thay Test::select).
   * Điều kiện như PHP: đề tồn tại + (quyền dethi create HOẶC update) + loaide==0
   * (thủ công) + nguoitao == user. Không gắn @Permissions (cần OR) — kiểm thủ công.
   */
  @Get('select/:made')
  @Render('pages/select_question')
  async selectPage(@Param('made') madeRaw: string, @Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    const made = Number(madeRaw);
    if (!Number.isInteger(made) || made <= 0) {
      throw new NotFoundException('Đề thi không tồn tại');
    }
    const dethi = await this.exams.getById(made);
    if (!dethi) throw new NotFoundException('Đề thi không tồn tại');
    const allowed = await this.exams.hasDethiCreateOrUpdate(user.manhomquyen);
    if (!allowed || dethi.loaide !== 0 || dethi.nguoitao !== user.id) {
      throw new ForbiddenException(
        'Bạn không có quyền chọn câu hỏi cho đề thi này',
      );
    }
    return { Title: 'Chọn câu hỏi', Page: 'select_question', user };
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

  /**
   * POST /test/getTotalPages — tổng số trang (pagination.js). Phân nhánh theo
   * custom.function: "getQuestionsForTest" = câu hỏi để chọn (trang chọn câu),
   * mặc định = danh sách đề thi GV đã tạo.
   */
  @Permissions('dethi', 'view')
  @SkipTransform()
  @Post('getTotalPages')
  getTotalPages(@Body() dto: ExamPaginationBodyDto, @Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    const args = this.parseArgs(dto.args);
    if (args.custom?.function === 'getQuestionsForTest') {
      return this.exams.countQuestionsForTestPages(user.id, args);
    }
    return this.exams.countCreatedTestPages(user.id, args);
  }

  /** POST /test/pagination — 1 trang dữ liệu (pagination.js), phân nhánh như trên. */
  @Permissions('dethi', 'view')
  @SkipTransform()
  @Post('pagination')
  paginate(@Body() dto: ExamPaginationBodyDto, @Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    const args = this.parseArgs(dto.args);
    if (args.custom?.function === 'getQuestionsForTest') {
      return this.exams.listQuestionsForTest(user.id, args);
    }
    return this.exams.listCreatedTests(user.id, args);
  }

  /** POST /test/getQuestionOfTestManual — câu hỏi hiện có của đề thủ công. */
  @Permissions('dethi', 'view')
  @SkipTransform()
  @Post('getQuestionOfTestManual')
  getQuestionOfTestManual(@Body() dto: ExamIdDto) {
    return this.exams.getQuestionOfTestManual(dto.made);
  }

  /** POST /test/addDetail — lưu danh sách câu hỏi cho đề thủ công. */
  @Permissions('dethi', 'update')
  @SkipTransform()
  @Post('addDetail')
  addDetail(@Body() dto: AddDetailDto) {
    return this.exams.addDetail(dto.made, dto.cauhoi);
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

  /** POST /test/addTest — tạo đề thi (AJAX action_test.js). */
  @Permissions('dethi', 'create')
  @SkipTransform()
  @Post('addTest')
  addTest(@Body() dto: CreateTestDto, @Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return this.exams.createTest(user.id, dto);
  }

  /** POST /test/updateTest — cập nhật đề thi (AJAX action_test.js). */
  @Permissions('dethi', 'update')
  @SkipTransform()
  @Post('updateTest')
  updateTest(@Body() dto: UpdateTestDto, @Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return this.exams.updateTest(user.id, dto);
  }
}
