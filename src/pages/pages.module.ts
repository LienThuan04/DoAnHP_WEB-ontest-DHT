import { Module } from '@nestjs/common';
import { PagesController } from '@/pages/pages.controller';

@Module({
  controllers: [PagesController],
})
export class PagesModule {}
