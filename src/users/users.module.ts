import { Module } from '@nestjs/common';
import { UsersController } from '@/users/users.controller';
import { UsersService } from '@/users/users.service';

/** Module quản lý người dùng hệ thi (nguoidung) — thay user.php. */
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
