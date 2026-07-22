/**
 * Giới hạn kích thước 1 file upload (byte) — đọc `LIMIT_UPLOAD_FILE_SIZEMB` (MB)
 * từ env, mặc định 50MB. Dùng cho `limits.fileSize` của Multer trên các route có
 * FileInterceptor/AnyFilesInterceptor (thêm/sửa câu hỏi có ảnh, nộp bài tự luận).
 *
 * Env đã được ConfigModule.forRoot() nạp vào process.env trước khi các controller
 * được import; fallback 50 để an toàn nếu chưa có giá trị.
 */
export const MAX_UPLOAD_FILE_MB =
  Number(process.env.LIMIT_UPLOAD_FILE_SIZEMB) || 50;

export const MAX_UPLOAD_FILE_BYTES = MAX_UPLOAD_FILE_MB * 1024 * 1024;

/** Options limits dùng chung cho Multer interceptor. */
export const MULTER_LIMITS = { fileSize: MAX_UPLOAD_FILE_BYTES } as const;
