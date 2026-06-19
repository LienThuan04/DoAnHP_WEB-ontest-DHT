import {
  Body,
  Controller,
  Get,
  Post,
  Render,
  Req,
  UploadedFiles,
  UseInterceptors,
  VERSION_NEUTRAL,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { Permissions } from '@/common/decorators/permissions.decorator';
import { SkipTransform } from '@/common/decorators/skip-transform.decorator';
import { QuestionsService } from '@/questions/questions.service';
import {
  DeleteQuestionDto,
  PaginationBodyDto,
  QuestionBySubjectDto,
  QuestionIdDto,
  WriteQuestionDto,
} from '@/questions/dto/question.dto';
import type { IPaginationArgs } from '@/questions/interfaces/questions.types';
import type { IExamJwtPayload } from '@/exam-auth/interfaces/exam-auth.types';

/**
 * Ngân hàng câu hỏi (SSR + AJAX) — thay controller question.php của DHT_OneTest.
 * Route ở path gốc (VERSION_NEUTRAL, trong exclude của global prefix /api) để
 * khớp URL `/question/...` mà question.js gọi. AJAX dùng @SkipTransform để trả
 * nguyên shape JS gốc mong đợi (mảng / object / số / boolean).
 *
 * Đã port: trang SSR, danh sách chính (pagination/getTotalPages, JOIN phancong),
 * đọc/thêm/sửa/xoá. CHƯA port: import Excel/Word (addQuesFile/addExcel/
 * updateQuestionJSON) — tab "Thêm từ file" tạm vô hiệu (xem [[conversion-progress]]).
 */
@Controller({ path: 'question', version: VERSION_NEUTRAL })
export class QuestionsController {
  constructor(private readonly questions: QuestionsService) {}

  private parseArgs(raw: string): IPaginationArgs {
    try {
      return JSON.parse(raw) as IPaginationArgs;
    } catch {
      return {};
    }
  }

  /** GET /question — trang ngân hàng câu hỏi (thay Question::default). */
  @Permissions('cauhoi', 'view')
  @Get()
  @Render('pages/question')
  page(@Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return { Title: 'Câu hỏi', Page: 'question', user };
  }

  /** POST /question/getTotalPages — tổng số trang danh sách (pagination.js). */
  @Permissions('cauhoi', 'view')
  @SkipTransform()
  @Post('getTotalPages')
  getTotalPages(@Body() dto: PaginationBodyDto, @Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return this.questions.countQuestionPages(user.id, this.parseArgs(dto.args));
  }

  /** POST /question/pagination — 1 trang danh sách câu hỏi (pagination.js). */
  @Permissions('cauhoi', 'view')
  @SkipTransform()
  @Post('pagination')
  paginate(@Body() dto: PaginationBodyDto, @Req() req: Request) {
    const user = req.user as IExamJwtPayload;
    return this.questions.listQuestions(user.id, this.parseArgs(dto.args));
  }

  /** POST /question/getQuestionBySubject — danh sách câu hỏi theo môn. */
  @Permissions('cauhoi', 'view')
  @SkipTransform()
  @Post('getQuestionBySubject')
  getQuestionBySubject(@Body() dto: QuestionBySubjectDto) {
    return this.questions.getQuestionBySubject(
      dto.mamonhoc,
      dto.machuong,
      dto.dokho,
      dto.content,
      dto.page,
    );
  }

  /** POST /question/getTotalPageQuestionBySubject — tổng số trang theo môn. */
  @Permissions('cauhoi', 'view')
  @SkipTransform()
  @Post('getTotalPageQuestionBySubject')
  getTotalPageQuestionBySubject(@Body() dto: QuestionBySubjectDto) {
    return this.questions.getTotalPageQuestionBySubject(
      dto.mamonhoc,
      dto.machuong,
      dto.dokho,
      dto.content,
    );
  }

  /** POST /question/getQuestionById — chi tiết câu hỏi để mở modal sửa. */
  @Permissions('cauhoi', 'view')
  @SkipTransform()
  @Post('getQuestionById')
  getQuestionById(@Body() dto: QuestionIdDto) {
    return this.questions.getQuestionById(dto.id);
  }

  /** POST /question/getAnswerById — đáp án của câu hỏi (mcq/essay/reading). */
  @Permissions('cauhoi', 'view')
  @SkipTransform()
  @Post('getAnswerById')
  getAnswerById(@Body() dto: QuestionIdDto) {
    return this.questions.getAnswerById(dto.id);
  }

  /** POST /question/delete — xoá mềm câu hỏi. */
  @Permissions('cauhoi', 'delete')
  @SkipTransform()
  @Post('delete')
  delete(@Body() dto: DeleteQuestionDto) {
    return this.questions.delete(dto.macauhoi);
  }

  /** POST /question/addQues — thêm câu hỏi (multipart: text + ảnh). */
  @Permissions('cauhoi', 'create')
  @SkipTransform()
  @UseInterceptors(AnyFilesInterceptor())
  @Post('addQues')
  addQues(
    @Body() dto: WriteQuestionDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    const user = req.user as IExamJwtPayload;
    return this.questions.addQuestion(dto, files ?? [], user.id);
  }

  /** POST /question/editQuesion — sửa câu hỏi (multipart: text + ảnh). */
  @Permissions('cauhoi', 'update')
  @SkipTransform()
  @UseInterceptors(AnyFilesInterceptor())
  @Post('editQuesion')
  editQuesion(
    @Body() dto: WriteQuestionDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req: Request,
  ) {
    const user = req.user as IExamJwtPayload;
    return this.questions.editQuestion(dto, files ?? [], user.id);
  }
}
