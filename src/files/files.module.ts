import { Module } from '@nestjs/common';
import { FilesService } from '@/files/files.service';
import { FilesController } from '@/files/files.controller';

@Module({
  imports: [

  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
