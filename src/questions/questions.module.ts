import { Module } from '@nestjs/common';
import { QuestionsController } from '@/questions/questions.controller';
import { QuestionsService } from '@/questions/questions.service';

/** Module Ngân hàng câu hỏi (cauhoi + cautraloi + doan_van) — thay question.php. */
@Module({
  controllers: [QuestionsController],
  providers: [QuestionsService],
})
export class QuestionsModule {}
