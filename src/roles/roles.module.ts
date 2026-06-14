import { Module } from '@nestjs/common';
import { RolesController } from '@/roles/roles.controller';
import { RolesService } from '@/roles/roles.service';

/** Module phân quyền hệ thi (nhomquyen + chitietquyen) — thay roles.php. */
@Module({
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
