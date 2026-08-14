import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

/**
 * Lưu file (ảnh) lên **Supabase Storage** thay vì nhét blob vào CSDL.
 *
 * Chủ trương (yêu cầu người dùng): CSDL chỉ lưu **public URL** của file; toàn bộ
 * dữ liệu nhị phân nằm ở bucket Supabase (public) → DB nhẹ. Đọc ảnh = trả thẳng
 * URL để `<img src=url>` dùng trực tiếp (không mã hoá base64 nữa).
 *
 * Env: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_NAME_BUCKET` (bucket phải PUBLIC).
 */
@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  // Lấy đúng kiểu client mà `createClient` trả về (generic mặc định của
  // `SupabaseClient` khai báo trần không khớp 1-1 nên gán bị báo unsafe).
  private readonly client: ReturnType<typeof createClient>;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_KEY');
    const bucket = this.config.get<string>('SUPABASE_NAME_BUCKET');
    if (!url || !key || !bucket) {
      throw new Error(
        'Thiếu cấu hình Supabase Storage: cần SUPABASE_URL, SUPABASE_KEY, SUPABASE_NAME_BUCKET trong .env',
      );
    }
    this.bucket = bucket;
    this.client = createClient(url, key);
  }

  /** Nhận diện MIME + đuôi file theo magic-bytes (mặc định jpeg). */
  private detectImage(buf: Buffer): { mime: string; ext: string } {
    if (buf.length >= 8 && buf.toString('hex', 0, 8) === '89504e470d0a1a0a') {
      return { mime: 'image/png', ext: 'png' };
    }
    if (buf.length >= 4 && buf.toString('hex', 0, 4) === '47494638') {
      return { mime: 'image/gif', ext: 'gif' };
    }
    if (
      buf.length >= 12 &&
      buf.toString('ascii', 0, 4) === 'RIFF' &&
      buf.toString('ascii', 8, 12) === 'WEBP'
    ) {
      return { mime: 'image/webp', ext: 'webp' };
    }
    return { mime: 'image/jpeg', ext: 'jpg' };
  }

  /**
   * Upload 1 ảnh (Buffer/Uint8Array) vào `folder/` của bucket → trả PUBLIC URL.
   * Rỗng → null. Tên file ngẫu nhiên (UUID) tránh trùng.
   */
  async uploadImage(
    data: Buffer | Uint8Array | null | undefined,
    folder: string,
  ): Promise<string | null> {
    if (!data || data.length === 0) return null;
    const buf = Buffer.from(data);
    const { mime, ext } = this.detectImage(buf);
    const path = `${folder}/${Date.now()}-${randomUUID()}.${ext}`;
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(path, buf, { contentType: mime, upsert: false });
    if (error) {
      this.logger.error(`Upload Supabase thất bại (${path}): ${error.message}`);
      throw new Error('Không thể tải ảnh lên storage: ' + error.message);
    }
    return this.getPublicUrl(path);
  }

  /** Upload ảnh từ chuỗi base64 (có/không tiền tố data-URI) → PUBLIC URL. */
  async uploadBase64(
    val: string | null | undefined,
    folder: string,
  ): Promise<string | null> {
    if (!val) return null;
    const m = /^data:image\/[^;]+;base64,(.*)$/s.exec(val);
    const b64 = m ? m[1] : val;
    let buf: Buffer;
    try {
      buf = Buffer.from(b64, 'base64');
    } catch {
      return null;
    }
    return this.uploadImage(buf, folder);
  }

  /** Public URL của 1 object path trong bucket. */
  getPublicUrl(path: string): string {
    return this.client.storage.from(this.bucket).getPublicUrl(path).data
      .publicUrl;
  }

  /** Trích object path từ 1 public URL đã lưu (để xoá). null nếu không khớp bucket. */
  private pathFromUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    const marker = `/storage/v1/object/public/${this.bucket}/`;
    const i = url.indexOf(marker);
    if (i < 0) return null;
    return url.slice(i + marker.length);
  }

  /** Xoá file theo public URL đã lưu (bỏ qua nếu URL không thuộc bucket). */
  async remove(url: string | null | undefined): Promise<void> {
    const path = this.pathFromUrl(url);
    if (!path) return;
    const { error } = await this.client.storage
      .from(this.bucket)
      .remove([path]);
    if (error) {
      this.logger.warn(`Xoá file storage thất bại (${path}): ${error.message}`);
    }
  }
}
