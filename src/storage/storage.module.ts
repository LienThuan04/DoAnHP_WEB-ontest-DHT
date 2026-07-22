import { Global, Module } from '@nestjs/common';
import { SupabaseStorageService } from '@/storage/supabase-storage.service';

/**
 * Module lưu trữ file dùng chung (Supabase Storage). Đặt @Global để mọi module
 * nghiệp vụ (questions, exams…) inject `SupabaseStorageService` mà không cần
 * import lại. Thay cách lưu blob ảnh trong CSDL bằng lưu file ở bucket + URL.
 */
@Global()
@Module({
  providers: [SupabaseStorageService],
  exports: [SupabaseStorageService],
})
export class StorageModule {}
