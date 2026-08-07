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

Hạ tầng + Phase 1/2/3 **XONG**. Phase 4 (đề thi & làm bài, module lớn nhất) **XONG**:
slice 1–5 (danh sách/tạo-sửa/chọn câu/làm bài SV/chi tiết-kết quả + chấm tự luận);
export PDF/Excel đã làm ở Phase 7. **Phase 5
XONG:** quản lý nhóm học phần GV (`module.php`) + chi tiết nhóm/thành viên
(`class_detail.php`, path `/module`) + **phân công GV↔môn (`assignment.php`, path
`/assignment`)** + **phía SV (`client.php`, path `/client`, module `src/client/`)** —
xem `../docs/11` §4b slice 4. `assignment` MỞ KHOÁ dữ liệu thật (dropdown môn lọc qua
`phancong`). **Phase 6 slice 1 XONG (2026-07-24):** thông báo — module
`src/announcements/` (path `/teacher_announcement`) + chuông thông báo ở header
(`permission.js` + `header.ejs`), mở khoá tab thông báo offcanvas trước đây 404.
**Phase 6 slice 2 XONG (2026-07-26):** thống kê — module `src/statistic/` (path
`/statistic`) thay `statistic.php` + `ThongKeModel.php` (thống kê 1 đề + tổng hợp,
8 thẻ + biểu đồ `chart.js`). **Phase 6 slice 3 XONG (2026-07-27) → PHASE 6 HOÀN TẤT:**
dashboard email onboarding — `src/pages/pages.service.ts` + 3 route
`POST /dashboard/{checkEmail,checkEmailExist,updateEmail}` + modal `#modal-onboarding`
trong `dashboard.ejs` + `public/js/pages/dashboard.js`.
**Phase 7 slice 1 XONG (2026-07-29):** xuất/nhập Excel + in PDF — gói `exceljs`,
helper `src/common/utils/excel.util.ts`, service mới `src/exams/exams-export.service.ts`.
6 route: `module/exportExcelStudentS`, `test/exportExcel`, `test/getMarkOfAllTest`
(MỚI — PHP thiếu action), `test/exportPdf/:makq` (trang HTML tự `window.print()` thay
dompdf), `user/addExcel` + `user/addFileExcelGroup` (chỉ đọc `.xlsx`; file mẫu
`public/filemau/danhsachsv_mau.xlsx`). Chi tiết + danh sách "KHÁC PHP": `docs/03`.

**Phase 7 slice 2 XONG (2026-08-04):** seed dữ liệu mẫu nghiệp vụ —
`src/seed-db/seed/exam-demo.data.ts` (dữ liệu thuần) + `exam-demo.seeder.ts`
(`seedExamDemo`/`clearExamDemo`), nối vào `SeedDbService` qua biến **`SEED_DEMO_DATA`**
(mặc định `false`) + script `node scripts/seed-demo.cjs [--clear|--force|--clear-only]`.
Seed ra: 13 người dùng (mật khẩu `123456`), 4 môn + 14 chương, 9 phân công, 3 nhóm học
phần, 38 câu hỏi (mcq/essay/reading), 3 đề thi (1 đang mở thủ công, 1 đang mở tự động,
1 đã kết thúc kèm 4 bài làm mẫu). Đã chạy thật + smoke test HTTP các trang GV/SV.
Chi tiết: `docs/03`.

**Phase 7 slice 3 XONG (2026-08-05) → TẤT CẢ 7 PHASE HOÀN TẤT:** trang lỗi + e2e.
`AllExceptionsFilter` phân nhánh **trình duyệt → HTML / AJAX-API → JSON (shape cũ)**:
401 xoá cookie + redirect `/auth/signin` (thay `AuthCore::checkAuthentication`),
403 → `views/pages/error/page_403.ejs`, 404 → `page_404.ejs` (2 trang bê từ PHP),
còn lại → `page_500.ejs` (MỚI, PHP không có; chi tiết lỗi chỉ hiện khi
`MODE=development`). Log 4xx = WARN gọn, 5xx = ERROR kèm stack. e2e viết lại:
`test/setup-app.ts` (dựng app y `main.ts`, **ép `SEED_DB=false`** để test không đụng
dữ liệu) + `test/error-pages.e2e-spec.ts` — `pnpm run test:e2e` → **10/10 pass**
(cần `DATABASE_URL` sống). Chi tiết: `docs/03`.

**Kiểm chứng 2026-08-07:** đã chạy thật 4 route export trên dữ liệu mẫu (đăng nhập
`gv001`): `module/exportExcelStudentS`, `test/exportExcel`, `test/getMarkOfAllTest`,
`test/exportPdf/:makq` — **đều đúng**, file .xlsx mở lại được, `exportPdf` với `makq`
lạ trả 404. Bảng chi tiết ở `docs/03`.

→ Việc kế tiếp gợi ý: kiểm chứng **nhập SV từ .xlsx** (`user/addExcel`,
`user/addFileExcelGroup`) qua HTTP thật; mở rộng e2e sang luồng nghiệp vụ; nợ lẻ
`view_subject.php`, `getExamineeByGroup`, đọc `.xls` cũ.

✅ **Lỗi DB ETIMEDOUT đã fix** (commit `32e94f23`): `src/prisma/prisma.service.ts`
dùng `datasourceUrl` cho URL Accelerate `prisma+postgres://`, chỉ dùng adapter `pg`
cho `postgres://` trực tiếp. App boot tới `Nest application successfully started`.

**Sau mỗi phiên: cập nhật `docs/03-tien-do.md`** để phiên/agent sau không mất mạch.
