import { Module } from '@nestjs/common';
import { SubjectsModule } from '@/subjects/subjects.module';
import { ViewSubjectController } from '@/view-subject/view-subject.controller';
import { ViewSubjectService } from '@/view-subject/view-subject.service';

/**
 * Module "Môn học của tôi" (view_subject.php) — GV xem môn được phân công.
 * Import SubjectsModule để dùng lại SubjectsService cho phần quản lý chương
 * (cùng bảng `chuong`, không nhân bản logic).
 */
@Module({
  imports: [SubjectsModule],
  controllers: [ViewSubjectController],
  providers: [ViewSubjectService],
})
export class ViewSubjectModule {}
