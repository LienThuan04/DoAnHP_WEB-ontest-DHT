import { Module } from '@nestjs/common';
import { ExamsController } from '@/exams/exams.controller';
import { ExamsService } from '@/exams/exams.service';
import { ExamsExportService } from '@/exams/exams-export.service';

/** Module Đề thi (dethi + chitietdethi + giaodethi + ketqua...) — thay test.php. */
@Module({
  controllers: [ExamsController],
  providers: [ExamsService, ExamsExportService],
})
export class ExamsModule {}
