import { Global, Module } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Global() // Make PrismaModule global so that PrismaService can be injected anywhere without needing to import PrismaModule
@Module({
  imports: [],
  providers: [PrismaService],
  exports: [PrismaService], // Export PrismaService so it can be used in other modules that import PrismaModule
})
export class PrismaModule {}
