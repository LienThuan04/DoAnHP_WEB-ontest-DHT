import { Module } from '@nestjs/common';
import { AssignmentsController } from '@/assignments/assignments.controller';
import { AssignmentsService } from '@/assignments/assignments.service';

/**
 * Module Phân công giảng dạy (bảng phancong) — thay assignment.php + PhanCongModel.
 * MỞ KHOÁ dữ liệu thật cho trang câu hỏi + tạo nhóm (đều lọc môn/năm/kỳ qua phancong).
 */
@Module({
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
})
export class AssignmentsModule {}
