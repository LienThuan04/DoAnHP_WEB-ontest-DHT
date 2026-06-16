import { Module } from '@nestjs/common';
import { AcademicYearsController } from '@/academic-years/academic-years.controller';
import { AcademicYearsService } from '@/academic-years/academic-years.service';

/** Module Năm học & Học kỳ (namhoc + hocky) — thay namhoc.php. */
@Module({
  controllers: [AcademicYearsController],
  providers: [AcademicYearsService],
})
export class AcademicYearsModule {}
