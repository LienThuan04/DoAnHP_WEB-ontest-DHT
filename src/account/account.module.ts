import { Module } from '@nestjs/common';
import { AccountController } from '@/account/account.controller';
import { AccountService } from '@/account/account.service';

/** Module trang cá nhân — thay account.php + account_setting.php. */
@Module({
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}
