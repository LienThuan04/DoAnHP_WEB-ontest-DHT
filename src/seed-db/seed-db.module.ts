import { Module } from '@nestjs/common';
import { SeedDbService } from '@/seed-db/seed-db.service';
import { SeedDbController } from '@/seed-db/seed-db.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
  ],
  controllers: [SeedDbController],
  providers: [SeedDbService],
})
export class SeedDbModule {}
