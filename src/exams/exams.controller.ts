import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Render,
  Req,
  Res,
  UseInterceptors,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { MULTER_LIMITS } from '@/common/config/upload.config';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { SkipTransform } from '@/common/decorators/skip-transform.decorator';
import { ExamsService } from '@/exams/exams.service';
import { ExamsExportService } from '@/exams/exams-export.service';
import {
  AddDetailDto,
  CreateTestDto,
  DeleteExamDto,
  EssayDetailDto,
  ExamIdDto,
  ExamPaginationBodyDto,
  ExportExcelDto,
  GroupTestsDto,
  ListEssaySubmissionsDto,
  MarkOfAllTestDto,
  ResultDetailDto,
  SaveEssayScoreDto,
  StaticticalDto,
  TestMadeDto,
  TestTimeDto,
  UpdateTestDto,
  parseScoreMapFromRawBody,
} from '@/exams/dto/exam.dto';
import type { IExamPaginationArgs } from '@/exams/interfaces/exams.types';
import type { IExamJwtPayload } from '@/exam-auth/interfaces/exam-auth.types';

/**
 * Đề thi (SSR + AJAX) — thay controller test.php của DHT_OneTest.
 * Route ở path gốc (VERSION_NEUTRAL, trong exclude của global prefix /api) để
 * khớp URL `/test/...` mà test.js gọi. AJAX dùng @SkipTransform để trả nguyên
 * shape JS gốc mong đợi (mảng / object / boolean).
 *
 * Đã port: danh sách GV (slice 1), tạo/sửa đề (slice 2), chọn câu hỏi cho đề
 * thủ công (slice 3), luồng làm bài SV (slice 4), chi tiết/kết quả đề + chấm
 * tự luận (slice 5), xuất Excel/PDF (Phase 7 — `ExamsExportService` thay
 * PHPExcel; PDF là trang HTML tự gọi `window.print()` thay dompdf).
 */
@Controller({ path: 'test', version: VERSION_NEUTRAL })
export class ExamsController {
  constructor(
    private readonly exams: ExamsService,
    private readonly examsExport: ExamsExportService,
  ) {}

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

  /**
   * GET /test/detail/:made — trang chi tiết/kết quả đề (bảng điểm + thống kê +
   * chấm tự luận). Thay Test::detail. Điều kiện PHP: đề tồn tại + quyền
   * dethi.create + nguoitao == user → 404 / 403.
   */
  @Permissions('dethi', 'create')
  @Get('detail/:made')
  @Render('pages/test_detail')
  async detailPage(@Param('made') madeRaw: string, @Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    const made = Number(madeRaw);
    if (!Number.isInteger(made) || made <= 0) {
      throw new NotFoundException('Đề thi không tồn tại');
    }
    const test = await this.exams.getInfoTestBasic(made);
    if (!test) throw new NotFoundException('Đề thi không tồn tại');
    if (test.nguoitao !== user.id) {
      throw new ForbiddenException('Bạn không có quyền xem chi tiết đề thi này');
    }
    return { Title: 'Danh sách đã thi', Page: 'test_detail', Test: test, user };
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
    if (args.model === 'KetQuaModel') {
      return this.exams.countExamResultPages(args);
    }
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
    if (args.model === 'KetQuaModel') {
      return this.exams.listExamResults(args);
    }
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

  // ===================== LUỒNG LÀM BÀI SV (slice 4) =====================

  /**
   * GET /test/start/:made — trang vào thi (vao_thi). Thay Test::start. Cần
   * quyền tgthi.join + SV thuộc nhóm được giao đề (checkStudentAllowed) → 403;
   * đề không tồn tại → 404.
   */
  @Permissions('tgthi', 'join')
  @Get('start/:made')
  @Render('pages/vao_thi')
  async startPage(@Param('made') madeRaw: string, @Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    const made = Number(madeRaw);
    if (!Number.isInteger(made) || made <= 0) {
      throw new NotFoundException('Đề thi không tồn tại');
    }
    const data = await this.exams.getStartPageData(made, user.id);
    if (!data) throw new NotFoundException('Đề thi không tồn tại');
    const allowed = await this.exams.checkStudentAllowed(user.id, made);
    if (!allowed) {
      throw new ForbiddenException('Bạn không thuộc nhóm được giao đề thi này');
    }
    return {
      Title: 'Bắt đầu thi',
      Page: 'vao_thi',
      Test: data.Test,
      Check: data.Check,
      user,
    };
  }

  /**
   * GET /test/taketest/:made — trang làm bài (de_thi). Thay Test::taketest.
   * Chỉ vào được khi đang trong thời gian thi & chưa nộp (diemthi rỗng); ngược
   * lại redirect về /test/start/:made (giữ hành vi PHP).
   */
  @Permissions('tgthi', 'join')
  @Get('taketest/:made')
  async takeTestPage(
    @Param('made') madeRaw: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const user = req.user as IExamJwtPayload;
    const made = Number(madeRaw);
    if (!Number.isInteger(made) || made <= 0) {
      throw new NotFoundException('Đề thi không tồn tại');
    }
    const dethi = await this.exams.getById(made);
    const check = await this.exams.getMaKQ(made, user.id);
    const now = Date.now();
    const start = dethi?.thoigianbatdau
      ? new Date(dethi.thoigianbatdau).getTime()
      : 0;
    const end = dethi?.thoigianketthuc
      ? new Date(dethi.thoigianketthuc).getTime()
      : Number.MAX_SAFE_INTEGER;
    const notSubmitted = !check || check.diemthi == null;
    if (dethi && now >= start && now <= end && notSubmitted) {
      return res.render('pages/de_thi', {
        Title: 'Làm bài kiểm tra',
        Page: 'de_thi',
        Made: made,
        user,
      });
    }
    return res.redirect(`/test/start/${made}`);
  }

  /** POST /test/getQuestion — câu hỏi để SV làm bài ({dethi, cauhoi}). */
  @Permissions('tgthi', 'join')
  @SkipTransform()
  @Post('getQuestion')
  getQuestion(@Body() dto: TestMadeDto, @Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return this.exams.getQuestionByUser(dto.made, user.id);
  }

  /** POST /test/startTest — tạo bản ghi ketqua + pre-insert chitietketqua. */
  @Permissions('tgthi', 'join')
  @SkipTransform()
  @Post('startTest')
  startTest(@Body() dto: TestMadeDto, @Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return this.exams.startTest(dto.made, user.id);
  }

  /** POST /test/getTimeTest — mốc kết thúc theo giờ vào thi + thời lượng đề. */
  @Permissions('tgthi', 'join')
  @SkipTransform()
  @Post('getTimeTest')
  getTimeTest(@Body() dto: TestTimeDto, @Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return this.exams.getTimeTest(dto.dethi, user.id);
  }

  /** POST /test/getTimeEndTest — mốc đóng đề (dethi.thoigianketthuc). */
  @Permissions('tgthi', 'join')
  @SkipTransform()
  @Post('getTimeEndTest')
  getTimeEndTest(@Body() dto: TestTimeDto) {
    return this.exams.getTimeEndTest(dto.dethi);
  }

  /** POST /test/chuyentab — +1 lần chuyển tab, trả cờ tự nộp (nopbaichuyentab). */
  @Permissions('tgthi', 'join')
  @SkipTransform()
  @Post('chuyentab')
  chuyentab(@Body() dto: TestMadeDto, @Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return this.exams.chuyentab(dto.made, user.id);
  }

  /**
   * POST /test/submit — nộp & chấm bài (de_thi.js gửi FormData/multipart).
   * AnyFilesInterceptor parse multipart; các trường text (made, thoigian,
   * listCauTraLoi, essay_*) nằm trong req.body. Lấy made/user từ JWT-an toàn.
   */
  @Permissions('tgthi', 'join')
  @SkipTransform()
  @UseInterceptors(AnyFilesInterceptor({ limits: MULTER_LIMITS }))
  @Post('submit')
  submit(@Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    const body = req.body as Record<string, unknown>;
    const made = Number(body.made);
    return this.exams.submit(made, user.id, body);
  }

  /**
   * POST /test/getTestsGroupWithUserResult — đề của 1 nhóm + điểm của SV
   * (offcanvas trang nhóm SV). made/user lấy từ JWT; chỉ cần quyền tham gia thi.
   */
  @Permissions('tgthi', 'join')
  @SkipTransform()
  @Post('getTestsGroupWithUserResult')
  getTestsGroupWithUserResult(
    @Body() dto: GroupTestsDto,
    @Req() req: Request,
  ) {
    const user = req.user as IExamJwtPayload;
    return this.exams.getTestsGroupWithUserResult(dto.manhom, user.id);
  }

  /** POST /test/getResultDetail — chi tiết bài làm để SV xem lại. */
  @Permissions('tgthi', 'join')
  @SkipTransform()
  @Post('getResultDetail')
  async getResultDetail(@Body() dto: ResultDetailDto) {
    try {
      const data = await this.exams.getResultDetail(dto.makq);
      return { success: true, data };
    } catch {
      return { success: false, error: 'Lỗi server khi lấy chi tiết bài làm' };
    }
  }

  // ============ CHI TIẾT/KẾT QUẢ ĐỀ (GV) + CHẤM TỰ LUẬN (slice 5) ============

  /** POST /test/getStatictical — thống kê điểm (tab Thống kê, biểu đồ). */
  @Permissions('dethi', 'view')
  @SkipTransform()
  @Post('getStatictical')
  getStatictical(@Body() dto: StaticticalDto) {
    return this.exams.getStatictical(dto.made, dto.manhom);
  }

  /** POST /test/getListEssaySubmissionsAction — SV có bài tự luận cần chấm. */
  @Permissions('dethi', 'view')
  @SkipTransform()
  @Post('getListEssaySubmissionsAction')
  getListEssaySubmissions(@Body() dto: ListEssaySubmissionsDto) {
    const search = dto.q ?? dto.search ?? null;
    return this.exams.getEssaySubmissions(dto.made, search, dto.status ?? 'all');
  }

  /** POST /test/getEssayDetailAction — chi tiết bài tự luận 1 SV (form chấm). */
  @Permissions('dethi', 'view')
  @SkipTransform()
  @Post('getEssayDetailAction')
  getEssayDetail(@Body() dto: EssayDetailDto) {
    return this.exams.getEssayDetail(dto.makq);
  }

  /**
   * POST /test/saveEssayScoreAction — lưu điểm tự luận (cần quyền chấm/sửa đề).
   *
   * Điểm từng câu (`cau[<macauhoi>]`) đọc từ **body thô**: body-parser gộp khoá
   * số nhỏ thành mảng rồi nén → mất macauhoi (xem `parseScoreMapFromRawBody`).
   */
  @Permissions('dethi', 'update')
  @SkipTransform()
  @Post('saveEssayScoreAction')
  saveEssayScore(
    @Req() req: RawBodyRequest<Request>,
    @Body() dto: SaveEssayScoreDto,
  ) {
    const diem = Number(dto.diem) || 0;
    const cau = parseScoreMapFromRawBody(req.rawBody) ?? dto.cau ?? {};
    return this.exams.saveEssayScore(dto.makq, diem, cau);
  }

  /**
   * GET /test/exportPdf/:makq — phiếu chi tiết kết quả 1 bài làm.
   *
   * KHÁC PHP: bản gốc render PDF bằng dompdf rồi trả `application/pdf`; ở đây
   * trả trang HTML dùng đúng bố cục/CSS đó và tự gọi `window.print()` khi mở tab
   * (test_detail.js đã `window.open`) → người dùng chọn "Lưu dạng PDF". Tránh phụ
   * thuộc Chromium/puppeteer trên server mà kết quả in ra tương đương.
   */
  @Permissions('dethi', 'view')
  @SkipTransform()
  @Get('exportPdf/:makq')
  @Render('pages/export_pdf')
  async exportPdf(@Param('makq', ParseIntPipe) makq: number) {
    const info = await this.examsExport.getInfoPrintPdf(makq);
    if (!info) throw new NotFoundException('Không tìm thấy kết quả thi.');
    const rows = await this.exams.getResultDetail(makq);

    // Thời gian làm bài: dùng số giây thực tế; chưa nộp → hiện thời gian quy định.
    const giay = Number(info.thoigianlambai_giay ?? 0);
    const thoigianlambai =
      giay > 0 && info.thoigianketthuc
        ? `${Math.floor(giay / 60)} phút ${giay % 60} giây`
        : `${info.thoigianthi ?? 0} phút (thời gian quy định)`;

    // Tên file gợi ý = tiêu đề trang (trình duyệt lấy <title> làm tên PDF).
    const mssv = (info.manguoidung || 'SinhVien').replace(/[^\w]+/gu, '_');
    return {
      Title: `Chi_tiet_ket_qua_${mssv}_MD${makq}`,
      info,
      blocks: this.examsExport.buildPrintBlocks(rows),
      diem: Number(info.diemthi ?? 0).toFixed(2),
      thoigianthi: `${info.thoigianthi ?? 0} phút`,
      thoigianlambai,
    };
  }

  /**
   * POST /test/exportExcel — xuất bảng điểm 1 đề ra .xlsx (thay PHPExcel).
   * Trả `{status,file,filename}` với `file` là data-URI base64 như bản PHP.
   */
  @Permissions('dethi', 'view')
  @SkipTransform()
  @Post('exportExcel')
  exportExcel(@Body() dto: ExportExcelDto) {
    return this.examsExport.exportExamScores(
      dto.made,
      Number(dto.manhom) || 0,
      dto.ds ?? [],
    );
  }

  /**
   * POST /test/getMarkOfAllTest — xuất bảng điểm TẤT CẢ đề của 1 nhóm ra .xlsx.
   * Route MỚI: PHP có `KetQuaModel::getMarkOfAllTest` nhưng thiếu action nên nút
   * "Xuất bảng điểm" ở class_detail.js gọi vào URL không tồn tại.
   */
  @Permissions('dethi', 'view')
  @SkipTransform()
  @Post('getMarkOfAllTest')
  getMarkOfAllTest(@Body() dto: MarkOfAllTestDto) {
    return this.examsExport.exportMarkOfAllTest(dto.manhom);
  }
}
