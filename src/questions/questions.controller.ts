import {
  Body,
  Controller,
  Post,
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
  QuestionBySubjectDto,
  QuestionIdDto,
  WriteQuestionDto,
} from '@/questions/dto/question.dto';
import type { IExamJwtPayload } from '@/exam-auth/interfaces/exam-auth.types';

/**
 * Ngân hàng câu hỏi (AJAX) — thay controller question.php của DHT_OneTest.
 * Route ở path gốc (VERSION_NEUTRAL, trong exclude của global prefix /api) để
 * khớp URL `/question/...` mà question.js gọi. AJAX dùng @SkipTransform để trả
 * nguyên shape JS gốc mong đợi (mảng / object / số / boolean).
 *
 * Phạm vi đợt này: đọc (getQuestionById, getAnswerById, getQuestionBySubject,
 * getTotalPageQuestionBySubject) + xoá mềm. Trang SSR + thêm/sửa + import
 * Excel/Word làm sau (xem [[conversion-progress]]).
 */
@Controller({ path: 'question', version: VERSION_NEUTRAL })
export class QuestionsController {
  constructor(private readonly questions: QuestionsService) {}

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
