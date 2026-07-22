# 01 — Tổng quan

## Dự án là gì

Chuyển hệ **Thi Trắc Nghiệm Online `DHT_OneTest`** (đồ án web) từ **PHP MVC thuần**
sang **NestJS SSR**. Sản phẩm cuối là repo này (`NestJS/`), giữ nguyên nghiệp vụ +
giao diện của hệ thi cũ, chỉ đổi nền công nghệ để chuẩn hơn (typed, an toàn SQL,
JWT chuẩn, RBAC bằng guard/decorator).

Tính năng hệ thi (nghiệp vụ cần port):
- Người dùng (Admin/Giáo viên/Sinh viên) + phân quyền động (RBAC theo bảng quyền).
- Môn học → chương → **câu hỏi** (mcq / tự luận `essay` / đọc hiểu `reading`) → đáp án.
- **Tạo đề** (thủ công chọn câu / tự động random theo độ khó), giao đề cho nhóm lớp.
- SV **vào thi → làm bài → nộp**, chấm tự động (mcq/đọc hiểu) + **chấm tay tự luận**.
- **Thống kê** kết quả, xuất PDF/Excel (đang hoãn — xem `03`).
- Đăng nhập email/mật khẩu, Google OAuth, quên mật khẩu qua OTP email.

## Bối cảnh thư mục (QUAN TRỌNG)

Trên máy phát triển gốc, cây thư mục là:

```
convertType/
├── DHT_OneTest/   ← NGUỒN PHP để port (KHÔNG nằm trong repo git NestJS)
├── docs/          ← tài liệu KẾ HOẠCH cũ (00–11, ngoài repo) — tham khảo
└── NestJS/        ← REPO NÀY (sản phẩm) — nhánh git `NestJS`
```

- **Chỉ `NestJS/` là repo git** (được push lên GitHub). `DHT_OneTest/` và
  `convertType/docs/` là thư mục anh em **không được version** cùng repo.
- ⚠️ **Nếu chỉ clone repo này về, bạn KHÔNG có nguồn PHP `DHT_OneTest`.** Để port
  tính năng còn lại (Phase 5/6/7…), cần đặt lại `DHT_OneTest/` làm thư mục anh em
  (`../DHT_OneTest/`). Bộ `docs/` trong repo này đã ghi đủ **cách làm + tiến độ**,
  nhưng **chi tiết code PHP từng method thì phải mở nguồn PHP mới có**.

## Stack thực tế

- NestJS 11, TypeScript, **Prisma 7 + PostgreSQL** (DB có thể là Prisma Postgres/
  Supabase remote — xem `.env`), Passport (JWT + Google), bcrypt, throttler,
  Swagger, Multer, Nodemailer, **EJS** (SSR), **@supabase/supabase-js** (lưu file).
- Frontend: theme Dashmix (Bootstrap) + jQuery + CKEditor + Select2 + SweetAlert2 +
  Chart.js + flatpickr — **bê nguyên từ PHP**, để trong `public/`, sửa tối thiểu.

## Mục tiêu & nguyên tắc

1. Giữ nguyên nghiệp vụ + UI hệ thi cũ.
2. Bám đúng quy ước khung NestJS (module/service/dto/interface, guard, response).
3. SSR bằng EJS qua `@Render()`; AJAX trả raw JSON (`@SkipTransform`).
4. An toàn hơn PHP: Prisma (chống SQLi), JWT (thay cookie-token tự chế), RBAC guard.
5. **Không dịch 1-1 mù quáng**: SQL nối chuỗi / logic trong controller PHP → nắn về
   đúng tầng (controller mỏng → service → prisma). Giữ quirk PHP khi vô hại (ghi chú).

→ Cách làm & quy ước chi tiết: [02-quy-uoc-va-cach-lam.md](./02-quy-uoc-va-cach-lam.md).
