import { Module } from '@nestjs/common';
import { AccountController } from '@/account/account.controller';
import { AccountService } from '@/account/account.service';

/** Module trang cá nhân — thay account.php (Phase 2: mới có getRole). */
@Module({
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
