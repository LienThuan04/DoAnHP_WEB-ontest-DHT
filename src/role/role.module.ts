import { Module } from '@nestjs/common';
import { RoleService } from '@/role/role.service';
import { RoleController } from '@/role/role.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule, // DI for PrismaService to interact with the database
  ],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService], // Export RoleService for use in other modules (e.g., UsersModule)
})
export class RoleModule {}
