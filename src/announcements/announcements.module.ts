import { Module } from '@nestjs/common';
import { AnnouncementsController } from '@/announcements/announcements.controller';
import { AnnouncementsService } from '@/announcements/announcements.service';

/**
 * Module Thông báo (teacher_announcement.php + AnnouncementModel.php) — Phase 6.
 * Mở khoá tab "Thông báo" ở offcanvas nhóm (class_detail / client_group) và
 * chuông thông báo trên header (permission.js) vốn đang 404.
 */
@Module({
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
})
export class AnnouncementsModule {}
