import { Module } from '@nestjs/common';
import { SubjectsController } from '@/subjects/subjects.controller';
import { SubjectsService } from '@/subjects/subjects.service';

/**
 * Module Môn học & Chương (monhoc + chuong) — thay subject.php.
 * Export SubjectsService để ViewSubjectModule dùng lại phần quản lý chương.
 */
@Module({
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [SubjectsService],
})
export class SubjectsModule {}
