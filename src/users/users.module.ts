import { Module } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { UsersController } from '@/users/users.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { RoleModule } from '@/role/role.module';
import { FilesModule } from '@/files/files.module';
import { EmailModule } from '@/email/email.module';
import { OtpService } from '@/auth/services/otp.service';
import { UserUpdateOtpService } from '@/auth/services/user-update-otp.service';

@Module({
  imports: [PrismaModule, RoleModule, FilesModule, EmailModule],
  controllers: [UsersController],
  providers: [UsersService, OtpService, UserUpdateOtpService],
  exports: [UsersService]
})
export class UsersModule {}
