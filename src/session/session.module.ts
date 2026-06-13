import { Module } from '@nestjs/common';
import { SessionService } from '@/session/session.service';
import { SessionController } from '@/session/session.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService]
})
export class SessionModule {}
