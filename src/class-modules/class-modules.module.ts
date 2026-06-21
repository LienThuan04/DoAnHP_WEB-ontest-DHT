import { Module } from '@nestjs/common';
import { ClassModulesController } from '@/class-modules/class-modules.controller';
import { ClassModulesService } from '@/class-modules/class-modules.service';

/**
 * Module Nhóm học phần (nhom + chitietnhom) — thay module.php.
 * Hiện chỉ có loadData phục vụ trang tạo/sửa đề; mở rộng đầy đủ ở Phase 5.
 */
@Module({
  controllers: [ClassModulesController],
  providers: [ClassModulesService],
})
export class ClassModulesModule {}
