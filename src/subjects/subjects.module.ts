import { Module } from '@nestjs/common';
import { SubjectsController } from '@/subjects/subjects.controller';
import { SubjectsService } from '@/subjects/subjects.service';

/** Module Môn học & Chương (monhoc + chuong) — thay subject.php. */
@Module({
  controllers: [SubjectsController],
  providers: [SubjectsService],
})
export class SubjectsModule {}
