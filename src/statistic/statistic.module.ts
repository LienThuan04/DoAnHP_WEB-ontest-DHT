import { Module } from '@nestjs/common';
import { StatisticController } from '@/statistic/statistic.controller';
import { StatisticService } from '@/statistic/statistic.service';

/**
 * Module Thống kê (statistic.php + ThongKeModel.php) — Phase 6 slice 2.
 * Trang `/statistic`: thống kê điểm 1 đề hoặc thống kê tổng hợp theo học kỳ/năm
 * học/môn/nhóm cho giảng viên (quyền 'thongke').
 */
@Module({
  controllers: [StatisticController],
  providers: [StatisticService],
})
export class StatisticModule {}
