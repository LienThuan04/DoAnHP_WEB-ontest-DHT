# 06 — Lưu file ảnh: Supabase Storage (DB chỉ lưu URL)

**Quyết định 2026-07-22 (yêu cầu user):** ảnh KHÔNG lưu blob trong CSDL nữa. Toàn bộ
file lưu ở **Supabase Storage** (bucket **PUBLIC**); DB chỉ lưu **public URL** → DB nhẹ.

## Cấu hình (.env)

| Biến | Ý nghĩa |
|------|---------|
| `SUPABASE_URL` | URL dự án Supabase |
| `SUPABASE_KEY` | API key |
| `SUPABASE_NAME_BUCKET` | Tên bucket — **PHẢI là PUBLIC** (dùng `getPublicUrl`) |
| `LIMIT_UPLOAD_FILE_SIZEMB` | Giới hạn 1 file upload (MB), mặc định 50 |

## Thành phần code

- **`src/storage/supabase-storage.service.ts`** (`SupabaseStorageService`) trong
  **`StorageModule` (@Global)** → inject khắp nơi. Dùng `@supabase/supabase-js`.
  - `uploadImage(buffer, folder) → publicUrl | null`
  - `uploadBase64(b64, folder) → publicUrl | null` (giải mã data-URI/base64 rồi upload)
  - `getPublicUrl(path)`, `remove(url)` (trích path từ URL để xoá)
  - Nhận diện MIME magic-bytes (png/gif/webp/jpeg); tên file UUID tránh trùng.
- **`src/common/config/upload.config.ts`**: `MULTER_LIMITS = { fileSize: ... }` đọc
  `LIMIT_UPLOAD_FILE_SIZEMB`. Gắn vào `FileInterceptor/AnyFilesInterceptor` ở
  `questions.controller` (thêm/sửa câu hỏi, import .docx) và `exams.controller` (submit).

## Schema

3 cột `hinhanh` đổi `Bytes` → `String` (lưu URL): `cauhoi`, `cautraloi`,
`hinhanh_traloi_tuluan`. Migration **`20260722030000_hinhanh_to_supabase_url`**
(đã deploy). Blob cũ (nếu có) → NULL (không chuyển được sang URL).

## Luồng GHI (upload TRƯỚC transaction)

Upload có I/O mạng → **không được nằm trong `$transaction`** (tránh giữ giao dịch DB
trong lúc chờ mạng). Nên upload trước, lấy URL rồi mới ghi DB.

- **`questions.service`** (thêm/sửa câu hỏi, multipart):
  - `mainImageUrl(files)` — upload ảnh câu hỏi chính (field `hinhanh`) → URL.
  - `uploadQueue(files, 'option_hinhanh[]')` — upload sẵn hàng đợi ảnh đáp án → URL[].
  - `pickImageUrl(queue, item)` — sync: xoá→null; **giữ ảnh cũ** = client gửi lại URL
    trong `item.image` → trả nguyên; else lấy URL mới kế tiếp trong queue.
  - Thư mục bucket: `questions/`.
- **`exams.service`** (nộp bài tự luận): `collectEssayAnswers(body)` parse
  `essay_{i}_image_{j}` (base64) + `uploadBase64` → URL[] TRƯỚC tx; `saveEssayAnswers`
  chỉ ghi URL. Thư mục bucket: `essays/`.

## Luồng ĐỌC (trả thẳng URL)

Trước đây nhiều chỗ trả base64/data-URI; nay trả **URL** để `<img src=url>` dùng trực
tiếp:
- Chỗ trước là **data-URI** (ảnh câu hỏi/đáp án ở nhiều endpoint) → thay bằng URL là
  **trong suốt** (URL vẫn hợp lệ làm `src`), frontend không cần đổi.
- Chỗ trước là **base64 THUẦN** (ảnh tự luận): `getResultDetail.ds_hinhanh` (gộp URL
  bằng `||`) và `getEssayDetail.hinhanh[]` → đã sửa `public/js/pages/test_detail.js`
  và `vaothi.js` bỏ tiền tố `data:image/...;base64,`, dùng URL trực tiếp.

## TODO còn nợ

- **Dọn file cũ trên bucket** khi đổi/xoá ảnh (hiện chỉ ghi URL mới, chưa gọi
  `remove()` cho ảnh cũ) — làm nếu cần tiết kiệm dung lượng.
- Nếu bucket đổi sang **private**: phải dùng **signed URL** (DB lưu path, server ký
  URL khi trả) — hiện code giả định bucket **public** + `getPublicUrl`.
