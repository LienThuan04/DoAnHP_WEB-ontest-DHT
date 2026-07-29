# 03 — Tiến độ (LIVING DOC — cập nhật mỗi phiên)

> Cập nhật gần nhất: **2026-07-29**. Đây là "sổ tay tiến độ" — mỗi phiên làm xong
> nhớ sửa file này (đánh dấu đã làm gì, còn gì) để phiên/agent sau không mất mạch.

## Bảng phase

| Phase | Nội dung | Trạng thái |
|-------|----------|-----------|
| Hạ tầng | Gỡ demo, dời JwtStrategy → `exam-auth`, guards/interceptors tái dùng | ✅ XONG |
| 1 | Auth/RBAC: `exam-auth`, `pages` (landing/dashboard), `account` | ✅ XONG |
| 2 | `roles` (NhomQuyen), `users` (NguoiDung), `academic-years` (NamHoc+HocKy), `subjects` (MonHoc+Chuong) | ✅ XONG (trừ `view_subject` — hoãn, phụ thuộc phancong/nhom) |
| 3 | `questions`: ngân hàng câu hỏi mcq/essay/reading + đáp án + đoạn văn + ảnh + import Word (mammoth) + trang SSR/listing | ✅ XONG (Excel hoãn — nút gốc `disabled`) |
| 4 | `exams`: đề thi & làm bài & chấm (LỚN NHẤT) | ✅ XONG (export PDF/Excel đã làm ở Phase 7) |
| 5 | Nhóm/lớp & phân công (model `Nhom`/`ChiTietNhom`/`PhanCong` ĐÃ có) | ✅ XONG (`/module`, `/assignment`, `/client`) |
| 6 | Thông báo/thống kê/dashboard (model `ThongBao` ĐÃ có) | ✅ XONG (`/teacher_announcement`, `/statistic`, dashboard email onboarding) |
| 7 | Hoàn thiện (export thật, seed mẫu, trang lỗi, e2e) | 🟡 slice 1 (xuất/nhập Excel + in PDF) XONG; còn seed mẫu, trang lỗi, e2e |

> Model `PhanCong`, `Nhom`, `ChiTietNhom`, `ThongBao`… đã **kéo lên trước** vào
> schema vì Phase 4 cần (giao đề/kiểm tra SV/sinh thông báo). UI của chúng là Phase 5/6.

## Phase 4 (`src/exams/`, path `/test`) — chi tiết slice

Schema: migration `add_dethi_ketqua` (DeThi, ChiTietDeThi, DeThiTuDong, GiaoDeThi,
KetQua, ChiTietKetQua, TraLoiTuLuan, HinhAnhTraLoiTuLuan, ChamTuLuan) +
`add_nhom_thongbao_for_phase4`.

| Slice | Nội dung | Route chính | ✔ |
|-------|----------|-------------|---|
| 1 | Danh sách đề GV | `GET /test`; `POST /test/{pagination,getTotalPages,getDetail,delete}`; `get_subjects`, `get_groups` | ✅ |
| 2 | Tạo/sửa đề | `GET /test/{add,update/:made}`; `POST /test/{addTest,updateTest}`; `POST /question/getsoluongcauhoi`; module `class-modules` `POST /module/loadData` | ✅ |
| 3 | Chọn câu hỏi (đề thủ công) | `GET /test/select/:made`; `POST /test/{getQuestionOfTestManual,addDetail}`; `POST /question/getAnswersForMultipleQuestions`; nhánh pagination `custom.function=getQuestionsForTest` | ✅ |
| 4 | Luồng làm bài SV | `GET /test/{start,taketest}/:made`; `POST /test/{getQuestion,startTest,getTimeTest,getTimeEndTest,chuyentab,submit,getResultDetail}` | ✅ |
| 5 | Chi tiết/kết quả đề GV + chấm tự luận | `GET /test/detail/:made`; `POST /test/{getStatictical,getListEssaySubmissionsAction,getEssayDetailAction,saveEssayScoreAction}`; nhánh pagination `model=KetQuaModel`; stub `exportPdf`/`exportExcel` | ✅ (2026-07-22) |

### Ghi chú quan trọng theo slice
- **Slice 5** (mới nhất): `test_detail.ejs` 3 tab (Bảng điểm / Chấm tự luận / Thống kê).
  Bảng điểm dùng `pagination.js` với `args.model='KetQuaModel'` → `listExamResults`
  (4 filter present/interrupted/absent/all, UNION present+absent, sort whitelist,
  `hoten` sort theo từ cuối). Thống kê dùng `chart.js` (bê từ DHT). Chấm tự luận:
  `getEssaySubmissions`/`getEssayDetail`/`saveEssayScore` (thay `luuDiemTuLuan`; dùng
  deleteMany+createMany thay `ON DUPLICATE KEY` vì `cham_tuluan` không có unique).
- **Đề tự động** (loaide=1): random câu theo chương (`dethitudong`) khi tạo/sửa.
- **Chấm khi nộp**: mcq/đọc hiểu tự động (điểm_loại/tổng_câu_loại × số đúng); tự luận
  chờ GV chấm tay. Chỉ chấm khi `diemthi IS NULL`. Bọc `$transaction`.

### Phase 4 CÒN LẠI
- ~~**exportPdf** / **exportExcel**~~ — ĐÃ làm ở **Phase 7 slice 1** (xem mục Phase 7).
- ~~`test_schedule.php`~~ — ĐÃ làm ở Phase 5 (`GET /client/test`, module `src/client/`).
- `getExamineeByGroup` — chưa dùng ở `test_detail.js` (bỏ qua tới khi có nơi gọi).

## Phase 5 (nhóm/lớp & phân công) — XONG

| Module | Path | Nội dung | ✔ |
|--------|------|----------|---|
| `class-modules` | `/module` | Quản lý nhóm học phần GV (`module.php`) + chi tiết nhóm/thành viên (`class_detail.php`) | ✅ |
| `assignments` | `/assignment` | Phân công GV↔môn (`assignment.php`) — **MỞ KHOÁ dữ liệu thật** cho dropdown môn ở trang câu hỏi/tạo đề | ✅ |
| `client` | `/client` | Phía SV: nhóm học phần (`client_group.php`) + lịch thi (`test_schedule.php`) | ✅ |

Chi tiết từng slice: `../../docs/11-tien-do-hien-tai.md` §4b.
CÒN LẠI: ~~export Excel danh sách SV + import SV bằng Excel~~ — ĐÃ làm ở **Phase 7
slice 1**; còn `view_subject.php` (SV xem môn) nếu cần.

## Phase 6 slice 1 — Thông báo (`src/announcements/`, path `/teacher_announcement`) — XONG (2026-07-24)

Thay `teacher_announcement.php` + `AnnouncementModel.php`. Đủ 13 method của PHP gốc
+ 2 route phân trang.

| Nhóm | Route |
|------|-------|
| SSR | `GET /teacher_announcement`, `/add`, `/update/:matb` |
| CRUD | `POST /teacher_announcement/{sendAnnouncement,updateAnnounce,deleteAnnounce,getDetail}` |
| Đọc | `POST /teacher_announcement/{getAnnounce,getListAnnounce,getNotifications,markAsRead,getUnreadCount}` |
| Phân trang | `POST /teacher_announcement/{pagination,getTotalPages}` (`pagination.js`, `model=AnnouncementModel`) |

- View `teacher_announcement.ejs` + `add_announce.ejs` (dùng chung cho tạo/sửa theo
  `Action`; có `<base href="/">` vì path sâu). JS `announcement.js`/`update_announce.js`
  bê nguyên, chỉ đổi `./x` → `/x`.
- **Chuông thông báo trên header**: bổ sung phần notification vào `public/js/permission.js`
  + dropdown trong `views/partials/header.ejs` (chỉ hiện với SV — `manhomquyen === 2`).
- **Mở khoá** tab "Thông báo" ở offcanvas `class_detail`/`client_group` (trước đây 404).
- Thông báo tự động khi tạo đề (`is_auto = 1`) **KHÔNG** hiện ở danh sách quản lý của
  GV, chỉ hiện ở chuông/offcanvas nhóm.
- **KHÁC PHP:** bọc `$transaction` khi tạo/sửa (PHP không bọc → có thể để lại thông báo
  "cụt"); kiểm **người tạo == user** trước khi sửa/xoá (PHP không kiểm); `nguoitao` lấy
  từ JWT chứ không tin `args.id`.
- **QUIRK giữ nguyên:** `getAnnounce` chỉ trả thông báo khi nhóm ĐÃ có thành viên;
  `updateAnnounce` không dọn `trangthaithongbao` của nhóm bị bỏ; `getAll` gán mã học kỳ
  vào khoá `tenhocky`.
- ⚠️ **Quyền:** `thongbao`(view/create/delete/update) chỉ seed cho **nhóm quyền 3
  (admin)** — đúng y dump gốc `tracnghiemonline.sql`, GV (nhóm 1) KHÔNG có. Muốn GV
  dùng trang này phải cấp quyền qua UI nhóm quyền hoặc thêm vào `exam-sample.ts`.

## Phase 6 slice 2 — Thống kê (`src/statistic/`, path `/statistic`) — XONG (2026-07-26)

Thay `statistic.php` + `ThongKeModel.php`. Trang GV xem thống kê điểm theo **1 đề**
hoặc **tổng hợp** theo học kỳ/năm học/môn/nhóm (8 thẻ + biểu đồ cột `chart.js`).

| Nhóm | Route |
|------|-------|
| SSR | `GET /statistic` (query `made` → chi tiết 1 đề; không có → tổng hợp; `mahocky`/`namhoc` để nạp sẵn dropdown) |
| Thống kê 1 đề | `POST /statistic/getStatictical` |
| Thống kê tổng hợp | `POST /statistic/getAggregatedStatistical` |
| Bộ lọc | `POST /statistic/{getFilters,getGroupsBySubject}` |

- View `statistic.ejs` (2 nhánh `ShowAggregate`) + partial `statistic_cards.ejs` (8 thẻ
  dùng chung). JS `statistic.js` bê nguyên, đổi `./statistic/` → `/statistic/`.
  Plugin: `sweetalert2` + `chart.js` (local, bê từ DHT). Nạp `permission.js`.
- Navbar mục "Thống kê" đổi từ `#` → `/statistic` (active theo `page`).
- **KHÁC PHP:** (1) gộp 13 truy vấn của `getStatisticalData` thành 2 (fetch các dòng
  cùng phép JOIN rồi tính trên JS) — cùng kết quả; (2) thêm `#chitietdethi[data-id]`
  vào nhánh chi tiết vì view PHP gốc thiếu hook mà `statistic.js` cần (không có →
  `getStatictical` không bao giờ chạy, trang chi tiết chết); (3) `nguoitao` lấy từ JWT.
- **QUIRK giữ nguyên:** `getStatisticalData` JOIN `chitietnhom` chỉ theo `manguoidung`
  → SV thuộc nhiều nhóm bị đếm nhiều lần khi lọc "Tất cả nhóm"; phân khoảng điểm dùng
  `LEAST(diemthi,10) >= i AND < i+1` nên điểm đúng 10 KHÔNG rơi vào khoảng nào (không
  lên biểu đồ).
- ⚠️ **Quyền:** `thongke`(view…) chỉ seed cho **nhóm quyền 3 (admin)** — đúng dump gốc,
  GV (nhóm 1) KHÔNG vào được (giống trang thông báo).
- PHỤ THUỘC DỮ LIỆU: cần `dethi`/`giaodethi`/`nhom`/`ketqua` mới có số liệu; thiếu →
  dropdown rỗng, thẻ = 0 (đúng hành vi PHP).

### Phase 6 slice 3 — Dashboard email onboarding ✅ XONG (2026-07-27)
Port nốt 3 route AJAX của `dashboard.php` + modal nhắc nhập email → **Phase 6 HOÀN TẤT**.

- **`src/pages/pages.service.ts` (MỚI)** thay 3 method email của `NguoiDungModel`:
  `getEmail` (trả CHUỖI, rỗng = chưa có email), `checkEmailExist` (boolean),
  `updateEmail` (boolean).
- **`src/pages/pages.controller.ts`**: thêm `POST /dashboard/checkEmail`,
  `/dashboard/checkEmailExist`, `/dashboard/updateEmail` — `@SkipTransform()`, KHÔNG
  gate quyền riêng (như PHP chỉ `checkAuthentication`) vì user chỉ đọc/sửa email của
  CHÍNH mình; `id` lấy từ **JWT**, không tin body. DTO `DashboardEmailDto` (`@IsEmail`
  + trim). 3 route đã thêm vào `exclude` global prefix.
- **View `views/pages/dashboard.ejs`**: thêm modal `#modal-onboarding` (bê từ
  `dashboard.php`) + nạp `bootstrap-notify` và `/public/js/pages/dashboard.js`.
  Ảnh nền `public/media/photos/photo23.jpg` KHÔNG tồn tại (cả ở bản PHP) → thay bằng
  `/public/media/various/bg_dashboard.jpg` sẵn có.
- **`public/js/pages/dashboard.js`**: bê nguyên, chỉ đổi `./dashboard/` → `/dashboard/`.
- ⚠️ **KHÁC PHP (quan trọng):** Postgres bắt `nguoidung.email` NOT NULL + UNIQUE nên GV
  thêm SV bằng MSSV sẽ sinh email placeholder `<mssv>@sinhvien.local`
  (`class-modules.service.ts`) — email không bao giờ rỗng → modal sẽ không bao giờ hiện.
  `getEmail` vì thế coi hậu tố `@sinhvien.local` là **chưa có email** (trả `''`) để giữ
  đúng ý đồ onboarding.
- Chi tiết nhỏ: `updateEmail` bắt `P2002`/`P2025` → trả `false` (JS báo "Cập nhật email
  không thành công") thay vì ném 500 khi email trùng do race với `checkEmailExist`.
  Slider trang dashboard được gắn sẵn class `js-slider-enabled` để helper `jq-slick`
  (dashboard.js gọi sau `checkEmail`) không init slick lần hai.
- Build sạch; boot map đủ 3 route `POST /dashboard/*`.

## Phase 7 slice 1 — Xuất/nhập Excel + in PDF — XONG (2026-07-29)

Gỡ hết stub export/import. Gói mới: **`exceljs`** (`pnpm add exceljs`). Helper dùng
chung: **`src/common/utils/excel.util.ts`** (`createWorkbook`, `setColumnWidths`,
`writeHeaderRow`, `centerCells`, `applyThinBorders`, `workbookToDataUri`, `cellText`).

| Route | Thay gì của PHP | Nơi cài đặt |
|-------|-----------------|-------------|
| `POST /module/exportExcelStudentS` | `Module::exportExcelStudentS` (PHPExcel) | `class-modules.service.ts` → `exportStudentsExcel` |
| `POST /test/exportExcel` | `Test::exportExcel` + `getTestAll`/`getTestScoreGroup` | `exams-export.service.ts` → `exportExamScores` |
| `POST /test/getMarkOfAllTest` | **route MỚI** (PHP chỉ có model, thiếu action) | `exams-export.service.ts` → `exportMarkOfAllTest` |
| `GET /test/exportPdf/:makq` | `Test::exportPdf` (dompdf) | controller + view `views/pages/export_pdf.ejs` |
| `POST /user/addExcel` | `User::addExcel` (PHPExcel) | `users.service.ts` → `parseStudentExcel` |
| `POST /user/addFileExcelGroup` | `User::addFileExcelGroup` + `NguoiDungModel::addFileGroup` | `users.service.ts` → `addStudentsFromFile` |

Service mới **`src/exams/exams-export.service.ts`** (tách khỏi `exams.service.ts`
đã ~2000 dòng), đăng ký trong `ExamsModule`. 3 route mới thêm vào `exclude` global
prefix: `test/getMarkOfAllTest`, `user/addExcel`, `user/addFileExcelGroup`.

**Shape trả về giữ y PHP:** `{status:true, file:"data:<mime>;base64,...", filename}`
— JS gốc tạo thẻ `<a download>` rồi click, KHÔNG đổi được.

### KHÁC PHP (đã ghi chú trong code)
- **PDF không render ở server.** Thay dompdf bằng **trang HTML tự gọi `window.print()`**
  (view `export_pdf.ejs` bê nguyên CSS của dompdf + `@page`/`@media print`) → người
  dùng chọn "Lưu dạng PDF". Tránh phải cài Chromium/puppeteer trên server.
  `test_detail.js` vốn đã `window.open` nên không phải sửa JS.
- **`getMarkOfAllTest`**: dựng ma trận SV × đề bằng **1 truy vấn** + ghép theo cặp
  `(manguoidung, made)`. PHP lặp `getMarkOfOneTest` cho từng đề rồi ghép theo **chỉ số
  mảng** → lệch dòng khi một SV thiếu bản ghi ở đề nào đó.
- **`getTenLopDisplay`** tra theo `manhom` (`WHERE manhom IN (...)`). PHP tra
  `tennhom IN (...)` trong khi `ds` mà `test_detail.js` gửi lên là mảng **mã nhóm**
  → luôn không khớp, tiêu đề luôn rơi về "Tất cả các lớp".
- **Chỉ đọc `.xlsx`** khi nhập SV — exceljs không đọc định dạng `.xls` cũ (BIFF).
  Báo lỗi rõ ràng thay vì đọc ra dữ liệu rác. `class_detail.ejs` đã đổi
  `accept=".xlsx"` + file mẫu mới **`public/filemau/danhsachsv_mau.xlsx`** (sinh bằng
  exceljs, đúng bố cục: dữ liệu từ **dòng 3**, cột **B**=MSSV, **C**=họ đệm,
  **D**=tên, **H**=email — y như PHP đọc `j=1,2,3,7` 0-based).
- **`addFileGroup`**: băm mật khẩu **1 lần cho cả lô** + cập nhật sỉ số **1 lần ở cuối**
  (PHP băm/cập nhật mỗi vòng lặp). Email trùng bắt bằng `P2002` của Prisma.
- MIME data-URI của danh sách SV dùng đúng `...spreadsheetml.sheet` (PHP ghi file
  Excel2007 nhưng gắn nhầm MIME `application/vnd.ms-excel`).

### Quyền
`test/exportExcel`, `test/getMarkOfAllTest`, `test/exportPdf/:makq` gate
`@Permissions('dethi','view')`. `user/addExcel` + `user/addFileExcelGroup` **chỉ cần
đăng nhập** (đúng `user.php` gốc — GV không có quyền `nguoidung` vẫn nhập SV vào nhóm
của mình được). `module/exportExcelStudentS` giữ nguyên mức cũ.

### Kiểm chứng
Build sạch; boot map đủ 6 route. Bộ đọc Excel đã chạy thử với chính file mẫu
(3 dòng → 3 bản ghi đúng) + 2 ca lỗi (`.xls`, thiếu file). **CHƯA test với DB thật**
(cần nhóm có SV + đề có kết quả).

## Lưu file ảnh — Supabase Storage (2026-07-22)

Ảnh KHÔNG còn lưu blob trong DB; lưu ở **Supabase Storage** (bucket public), DB chỉ
lưu **public URL**. Chi tiết: [06-luu-tru-file-supabase.md](./06-luu-tru-file-supabase.md).
Migration `20260722030000_hinhanh_to_supabase_url` đã deploy.

## Phụ thuộc dữ liệu (đọc trước khi test!)

Nhiều trang lọc qua `phancong`/`giaodethi`/`chitietnhom` → **RỖNG nếu thiếu dữ liệu**
(đúng hành vi PHP gốc):
- Listing + dropdown môn của **câu hỏi** lọc qua `phancong` (GV).
- Danh sách **đề thi**, dropdown nhóm khi tạo đề, bảng điểm test_detail cần
  `giaodethi`/`nhom`/`ketqua`.
- **Seed (`src/seed-db/exam-sample.ts`) mới seed QUYỀN**, CHƯA seed monhoc/cauhoi/
  phancong/nhom/dethi → phải làm **Phase 5** (UI nhóm/phân công) hoặc insert tay.
- Quyền đã seed: `dethi`(view/create/delete/update), `tgthi`(join), `cauhoi`(CRUD),
  `namhoc`/`monhoc`… (nhomquyen 1/2/3).

## Việc kế tiếp (gợi ý)

1. **Phase 7 slice 2** — **seed dữ liệu mẫu** (monhoc/phancong/nhom/cauhoi/dethi) để
   chạy & test thật. Đây là nút thắt: hầu hết trang đang rỗng vì thiếu dữ liệu, và
   các export vừa làm cũng chưa test được với DB thật.
2. **Phase 7 slice 3** — trang lỗi (404/403/500) + e2e.
3. Còn nợ lẻ: `view_subject.php` (SV xem môn — Phase 2), `getExamineeByGroup`
   (chưa có nơi gọi), hỗ trợ đọc `.xls` cũ khi nhập SV (nếu người dùng cần).
