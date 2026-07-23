import { Module } from '@nestjs/common';
import { ClientController } from '@/client/client.controller';
import { ClientService } from '@/client/client.service';
import { ClassModulesModule } from '@/class-modules/class-modules.module';

/**
 * Module phía sinh viên (client.php) — nhóm học phần SV tham gia + lịch kiểm tra.
 * Nhập ClassModulesModule để tái dùng ClassModulesService (join / getDetailGroup
 * / getSvList) thay vì viết lại truy vấn nhóm.
 */
@Module({
  imports: [ClassModulesModule],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}
