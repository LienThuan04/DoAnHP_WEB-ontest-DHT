# CLAUDE.md — Đọc file này ĐẦU TIÊN mỗi phiên

> File này được Claude Code / agent tự nạp vào ngữ cảnh mỗi phiên. Nó là "bộ nhớ"
> đi kèm repo — thay cho trí nhớ cá nhân của agent. **Đọc xong file này + `docs/`
> là bạn hiểu và tiếp tục được dự án mà không quên gì.**

## Dự án này là gì?

Port **hệ thi trắc nghiệm online `DHT_OneTest`** (viết bằng **PHP MVC thuần**) sang
**NestJS SSR** (server render HTML bằng EJS), tái dùng hạ tầng có sẵn của khung
NestJS (PostgreSQL + Prisma, JWT/Passport, guards, interceptors, bcrypt, email).
Giữ **nguyên nghiệp vụ + giao diện** của hệ thi cũ; chỉ đổi công nghệ.

- **Repo này = sản phẩm** (thư mục `NestJS/`, nhánh git `NestJS`).
- **Nguồn PHP để port tiếp = `../DHT_OneTest/`** (thư mục anh em, **KHÔNG nằm trong
  repo này**). Muốn port tính năng còn lại thì cần có nó cạnh bên. Xem `docs/05`.
- Tài liệu đầy đủ ở **`docs/`** — đọc `docs/README.md` để biết thứ tự.

## LUẬT CỨNG (vi phạm = làm hỏng quy ước dự án)

1. **Dùng `pnpm`**, KHÔNG `npm` (chỉ có `pnpm-lock.yaml`). Cài: `pnpm add <pkg>`;
   build: `pnpm run build`.
2. **CSDL = PostgreSQL** (KHÔNG MySQL). Thêm bảng bằng **migration Prisma mới**
   (`npx prisma migrate dev --name ...`), KHÔNG `db pull`. Sau migration:
   `npx prisma generate` rồi `pnpm run build`.
3. **Commit hạt mịn** (1 file/concern), message **tiếng Việt** conventional
   (`feat(exams): ...`). **TUYỆT ĐỐI KHÔNG** thêm `Co-Authored-By` / tên Claude vào
   commit. **Chỉ commit/push khi user yêu cầu.**
4. **Thêm mới (additive)** vào repo — KHÔNG dựng lại module demo nền đã gỡ
   (User/Role/Session…). Hệ thi là stack DUY NHẤT.
5. **Route AJAX** (jQuery `$.post/$.get`) phải `@SkipTransform()` (trả raw JSON/
   mảng/boolean đúng JS gốc). **Route ở path gốc** (vd `/test/...`) phải thêm vào
   `exclude` trong `src/config/app-setup.config.ts` (nếu không sẽ bị prefix `/api/v1`).
6. **Giữ URL cũ** mà JS gốc gọi (KHÔNG đổi sang REST lý tưởng). Bê JS/CSS/view gốc,
   sửa tối thiểu (`./x` → `/x`; trang path sâu thêm `<base href="/">`).
7. **Ảnh lưu Supabase Storage**, DB chỉ lưu **public URL** (KHÔNG blob). Xem `docs/06`.
8. **Bash & PowerShell DÙNG CHUNG cwd.** `cd` ở Bash sang `DHT_OneTest` sẽ khiến
   git chạy nhầm repo → luôn `cd .../NestJS` trước khi git/prisma.

## Kiểm chứng khi làm xong (môi trường có thể KHÔNG có DB local)

- `pnpm run build` phải sạch.
- Boot `node dist/src/main.js` → xem log `RouterExplorer` "Mapped ... route".
  DB có thể là remote (Prisma Postgres/Supabase) — nếu kết nối được thì seed chạy.

## Trạng thái hiện tại (tóm tắt — chi tiết ở `docs/03`)

Hạ tầng + Phase 1/2/3 **XONG**. Phase 4 (đề thi & làm bài, module lớn nhất) **gần
xong**: slice 1–5 xong (danh sách/tạo-sửa/chọn câu/làm bài SV/chi tiết-kết quả +
chấm tự luận); còn export PDF/Excel thật (đang stub) + `test_schedule`. **Phase 5
XONG:** quản lý nhóm học phần GV (`module.php`) + chi tiết nhóm/thành viên
(`class_detail.php`, path `/module`) + **phân công GV↔môn (`assignment.php`, path
`/assignment`)** + **phía SV (`client.php`, path `/client`, module `src/client/`)** —
xem `../docs/11` §4b slice 4. `assignment` MỞ KHOÁ dữ liệu thật (dropdown môn lọc qua
`phancong`). Phase 6/7 **chưa làm**.

→ Việc kế tiếp gợi ý: **Phase 6** — `teacher_announcement.php` (thông báo, mở khoá
tab thông báo offcanvas đang 404 vô hại) → `statistic.php`/`dashboard.php`.

⚠️ **Lỗi DB đang tồn (user bảo tạm khỏi fix 2026-07-23):** boot `ETIMEDOUT` do
`src/prisma/prisma.service.ts` dùng adapter `pg` với URL Accelerate `prisma+postgres://`.
Sửa khi cần: URL `prisma+postgres://` → `datasourceUrl` (bỏ adapter pg). Verify tạm
bằng `pnpm run build` + boot map route (seed sẽ lỗi tới khi sửa DB). Chi tiết docs/11 cuối.

**Sau mỗi phiên: cập nhật `docs/03-tien-do.md`** để phiên/agent sau không mất mạch.
