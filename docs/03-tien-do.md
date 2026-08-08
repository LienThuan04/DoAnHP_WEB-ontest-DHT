# 03 — Tiến độ (LIVING DOC — cập nhật mỗi phiên)

> Cập nhật gần nhất: **2026-08-08**. Đây là "sổ tay tiến độ" — mỗi phiên làm xong
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
| 7 | Hoàn thiện (export thật, seed mẫu, trang lỗi, e2e) | ✅ XONG — slice 1 (xuất/nhập Excel + in PDF) + slice 2 (seed dữ liệu mẫu) + slice 3 (trang lỗi 404/403/500 + e2e) |

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
(3 dòng → 3 bản ghi đúng) + 2 ca lỗi (`.xls`, thiếu file). **Đã kiểm chứng trên DB
thật qua HTTP:** 4 route xuất — 2026-08-07; 2 route nhập SV — 2026-08-08 (xem 2 mục
"Kiểm chứng" ở cuối tài liệu).

## Phase 7 slice 2 — Seed dữ liệu mẫu nghiệp vụ — XONG (2026-08-04)

Trước đây `seed-db` chỉ seed RBAC + 3 người dùng → hầu hết trang rỗng. Nay có **dữ
liệu mẫu chạy được cả luồng**: năm học → môn học/chương → phân công → nhóm học phần +
thành viên → ngân hàng câu hỏi (mcq/essay/reading) → đề thi (thủ công / tự động / đã
kết thúc kèm bài làm mẫu) → thông báo tự động.

| File | Vai trò |
|------|---------|
| `src/seed-db/seed/exam-demo.data.ts` | **Dữ liệu thuần** (không đụng DB). Khoá tự tăng tham chiếu nhau qua `key`/nhãn, KHÔNG hardcode id. |
| `src/seed-db/seed/exam-demo.seeder.ts` | `seedExamDemo()` / `clearExamDemo()` — hàm thuần nhận `PrismaClient`, dùng được cả trong Nest lẫn script. |
| `src/seed-db/seed-db.service.ts` | Nối dây: `SEED_DEMO_DATA=true` → seed lúc app khởi động. |
| `scripts/seed-demo.cjs` | Chạy một lần ngoài app (`--clear`, `--force`, `--clear-only`). |
| `scripts/prisma-client.cjs` | `createPrisma()` dùng chung cho 2 script seed. |

### Biến môi trường
`SEED_DEMO_DATA=false` (mặc định TẮT, đã thêm vào `.env`/`.env.example`). Chỉ có tác
dụng khi `SEED_DB=true`. Nếu `CLEAR_DB=true` **và** `SEED_DEMO_DATA=true` thì dữ liệu
nghiệp vụ được xoá **trước** `clear()` — vì `clear()` xoá `nguoidung`, giữ lại nhóm/đề/
bài làm sẽ thành bản ghi mồ côi (FK dạng scalar nên DB không chặn). `SEED_DEMO_DATA=false`
thì KHÔNG đụng tới dữ liệu nghiệp vụ (tránh lỡ tay xoá dữ liệu thật).

### Dữ liệu có gì
- **13 người dùng** (`exam-sample.ts` đã mở rộng: `admin`, `gv001`/`gv002`, `sv001`→`sv010`;
  mật khẩu `123456`). Id **cố định** nên xoá/seed lại vẫn khớp dữ liệu nghiệp vụ.
- 2 năm học × 3 học kỳ, **4 môn** (LTW001, CSDL01, MMT001, CTDL01) + **14 chương**,
  **9 phân công**, **3 nhóm học phần** (mã mời `ltw0001`/`csdl001`/`mmt0001`, 18 thành viên).
- **38 câu hỏi**: 32 mcq + 3 essay + 1 đoạn văn đọc hiểu (3 câu con).
- **3 đề thi**: *Thi cuối kỳ LTW* (thủ công, 10 câu, **đang mở** → vào thi ngay được),
  *Kiểm tra tự động CSDL* (tự động, 5 câu, đang mở), *Kiểm tra giữa kỳ LTW* (đã kết thúc,
  4 mcq + 1 tự luận, **4 bài làm mẫu** của sv001–sv004 → xem bảng điểm/thống kê/chấm tự luận).

### KHÁC code nghiệp vụ (đã ghi chú trong seeder)
- **Không bọc `$transaction`** cả lô (Accelerate giới hạn thời gian giao dịch tương tác);
  seed là thao tác một lần, muốn làm lại thì `clearExamDemo` rồi seed lại.
- Đề **tự động** chọn câu `ORDER BY macauhoi` chứ không `ORDER BY RANDOM()` như
  `addQuestionsToAutoTest` → mỗi lần seed ra cùng một đề, dễ đối chiếu.
- Chấm bài mẫu bám đúng `ExamsService.submit` (điểm = điểm_loại/tổng_câu_loại × số câu
  đúng, làm tròn 2 số; `diemthi` chưa gồm điểm tự luận; đề có tự luận → `trangthai_tuluan`
  = `Chưa chấm` để thử trang chấm tay).
- Thiếu người dùng mà dữ liệu tham chiếu → **cảnh báo** trong log, không chặn (FK scalar).

### Kiểm chứng (đã chạy với DB thật)
- `node scripts/seed-demo.cjs` và boot với `SEED_DEMO_DATA=true` đều seed đủ:
  4 môn / 14 chương / 38 câu hỏi / 3 nhóm / 3 đề / 4 bài làm.
- Smoke test HTTP sau khi seed (đăng nhập `gv001` & `sv001`, mật khẩu `123456`):
  `GET /test`, `/question`, `/module`, `/test/detail/:made`, `/test/select/:made`,
  `/test/update/:made`, `/module/detail/:manhom` → **200**;
  `/client/group`, `/client/test`, `/test/start/:made`, `/test/taketest/:made`,
  `/dashboard` (SV) → **200**. `POST /test/pagination`, `/question/pagination`,
  `/client/loadDataGroups` trả đúng dữ liệu.
- ⚠️ `gv001` (nhóm quyền 1) vẫn **403** ở `/assignment`, `/statistic`, `/subject`,
  `/namhoc` — đúng dump gốc (các quyền đó chỉ seed cho nhóm 3 admin). Dùng `admin`.
- ⚠️ Khoá tự tăng nên `made`/`manhom` **đổi sau mỗi lần seed lại** — đừng hardcode id
  trong khi test.

## Phase 7 slice 3 — Trang lỗi 404/403/500 + e2e — XONG (2026-08-05)

Trước đây MỌI lỗi đều trả JSON `{statusCode,message,code,...}` — người dùng mở nhầm
URL hay thiếu quyền thì thấy một cục JSON thay vì trang lỗi như bản PHP. Nay
`AllExceptionsFilter` phân nhánh: **điều hướng bằng trình duyệt → HTML, AJAX/API → JSON**
(không đổi shape cũ nên JS gốc không phải sửa gì).

| File | Thay đổi |
|------|----------|
| `views/pages/error/page_404.ejs` | Bê nguyên `mvc/views/pages/error/page_404.php` (đổi `href="./"` → `/`). |
| `views/pages/error/page_403.ejs` | Bê nguyên `page_403.php` (đổi `href="./dashboard"` → `/dashboard`). |
| `views/pages/error/page_500.ejs` | **MỚI** — PHP không có; cùng bố cục "hero" cho mọi lỗi còn lại. |
| `src/common/filters/all-exceptions.filter.ts` | Thêm nhánh render HTML + chuyển hướng 401; log 4xx = WARN gọn, 5xx = ERROR kèm stack. |

### Khi nào trả HTML? (`wantsHtmlPage`)
Phải thoả **cả 4**: method `GET` + **không** phải XHR (`X-Requested-With` jQuery tự
gắn) + header `Accept` có `text/html` + path **không** nằm dưới `/api`. Nhờ vậy mọi
route AJAX của JS gốc (đều là `POST`, hoặc `GET` qua jQuery) vẫn nhận JSON như cũ.

| Mã | Hành vi |
|----|---------|
| **401** | Xoá cookie `access_token` rồi `redirect('/auth/signin')` — thay `AuthCore::checkAuthentication` (PHP cũng xoá cookie + `header("Location: login_path")`). |
| **403** | Render `pages/error/page_403` (đúng chỗ PHP gọi `view("single_layout", page_403)`). |
| **404** | Render `pages/error/page_404` — cả URL không tồn tại lẫn `NotFoundException` do controller ném (vd đề thi không có). |
| còn lại | Render `pages/error/page_500` kèm mã thật (400, 429…). Chi tiết kỹ thuật **chỉ hiện khi `MODE=development`**. |

- Nếu **render trang lỗi cũng lỗi** → gửi text thuần `"<mã> - <message>"`, KHÔNG ném
  tiếp (tránh lặp vô hạn). Có kiểm `response.headersSent` trước khi ghi.
- Filter nay inject `ConfigService` (đọc `GLOBAL_PREFIX`, `ACCESS_TOKEN_COOKIE`, `MODE`).
- Trang lỗi dùng layout kiểu `single_layout.php` (chỉ `head` + nội dung + `script`,
  KHÔNG navbar/sidebar) nên render được cả khi chưa đăng nhập.

### e2e (`pnpm run test:e2e`)
Bộ e2e scaffold cũ đã hỏng (kỳ vọng `"Hello World!"`, thiếu alias `@/`) → viết lại:

| File | Vai trò |
|------|---------|
| `test/setup-app.ts` | `createTestApp()` dựng app **y như `src/main.ts`** (global prefix + exclude, ValidationPipe, cookie-parser, EJS + `views/`) và `login()` trả cookie phiên. |
| `test/error-pages.e2e-spec.ts` | **MỚI** — 10 ca: 404 HTML, 401 → redirect + xoá cookie, trang công khai vẫn 200, AJAX vẫn JSON, `/api/*` vẫn JSON, và (khi đăng nhập `gv001`) 403 HTML, 404 đề không tồn tại, lỗi 400 ra trang lỗi chung, `/test` vẫn 200. |
| `test/app.e2e-spec.ts` | Sửa: `GET /` là landing SSR, không phải `"Hello World!"`. |
| `test/jest-e2e.json` | Thêm `moduleNameMapper` cho alias `@/` + `testTimeout` 30s. |

- ⚠️ e2e chạy trên **CSDL thật** (`AppModule` cần Prisma kết nối mới init được).
  `createTestApp()` **ép `SEED_DB=false`/`CLEAR_DB=false`/`SEED_DEMO_DATA=false`**
  (đặt vào `process.env` TRƯỚC khi compile module — `@nestjs/config` không ghi đè biến
  đã có) nên test **không bao giờ** xoá/ghi đè dữ liệu.
- Nhóm test cần đăng nhập tự **bỏ qua kèm cảnh báo** nếu `gv001` chưa có trong DB.
- Kết quả: **10/10 pass**, `pnpm run build` sạch.
- Bổ sung 2026-08-08: `test/exam-flow.e2e-spec.ts` (18 ca, luồng nghiệp vụ) → tổng
  **28/28 pass**. Xem mục "e2e luồng nghiệp vụ" ở cuối tài liệu.

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
- ~~Seed mới seed QUYỀN, chưa có monhoc/cauhoi/phancong/nhom/dethi~~ → **ĐÃ CÓ** dữ
  liệu mẫu (Phase 7 slice 2): bật `SEED_DEMO_DATA=true` hoặc chạy
  `node scripts/seed-demo.cjs` (cần `pnpm run build` trước).
- Quyền đã seed: `dethi`(view/create/delete/update), `tgthi`(join), `cauhoi`(CRUD),
  `namhoc`/`monhoc`… (nhomquyen 1/2/3).

## ✅ Kiểm chứng export Excel / in PDF trên dữ liệu mẫu (2026-08-07)

Chạy server dev + đăng nhập `gv001/123456`, gọi thật 4 route của Phase 7 slice 1 trên
dữ liệu mẫu (nhóm `manhom=4` "Lập trình Web - Nhóm 01", đề `made=6` "Kiểm tra giữa kỳ"
có 4 bài làm, `makq=5` của sv001). **Cả 4 route CHẠY ĐÚNG**, file .xlsx mở lại được
bằng `exceljs`:

| Route | Kết quả |
| --- | --- |
| `POST /module/exportExcelStudentS` `{manhom:4}` | `Danh sách sinh viên.xlsx` (7.0 KB), 6 cột × 7 dòng — đủ 6 SV, cột "Giới tính" ra `Null` (đúng chủ ý, xem chú thích trong `class-modules.service.ts`) |
| `POST /test/exportExcel` `{made:6,manhom:4,ds:[]}` | `Ket_qua_de_6_nhom_4.xlsx` (7.5 KB), sheet `De_6_N4`, 10 cột × 8 dòng — 4 SV có điểm (8/6/4/8) + 2 SV "Chưa làm", cột thời gian/số câu đúng/lần chuyển tab đúng |
| `POST /test/getMarkOfAllTest` `{manhom:4}` | `Bang_diem_nhom_4.xlsx` (7.2 KB), ma trận SV × 2 đề của nhóm — cột "Thi cuối kỳ" rỗng (chưa ai làm), cột "Kiểm tra giữa kỳ" có điểm |
| `GET /test/exportPdf/5` | HTTP 200, HTML 12.8 KB, `<title>` = `Chi_tiet_ket_qua_sv001_MD5` (tên file gợi ý khi in), có `window.print()`, render đủ 5 câu (4 mcq + 1 tự luận). `makq` không tồn tại → **404** |

Ghi chú: POST trả **HTTP 201** (mặc định Nest) thay vì 200 như PHP — JS gốc chỉ đọc
`data.status` nên không ảnh hưởng.

## ✅ Kiểm chứng nhập SV từ .xlsx trên HTTP thật (2026-08-08)

Chạy server dev (`SEED_DB=false`) rồi gọi thật `POST /user/addExcel` +
`POST /user/addFileExcelGroup` bằng script một lần (không commit, để ở scratchpad).
Dữ liệu test (`sv9001`–`sv9003`, nhóm `manhom=4`) đã **xoá sạch ở cuối** và `siso`
khôi phục về 6. **17/17 ca ĐÚNG:**

| Ca | Kết quả |
| --- | --- |
| `addExcel` với **file mẫu chính thức** `public/filemau/danhsachsv_mau.xlsx` | 3 dòng, đúng MSSV/họ tên ghép từ cột C+D/email |
| `addExcel` thiếu file | `{status:'error', message:'Chưa chọn file để tải lên'}` |
| `addExcel` đuôi `.xls` | báo lỗi gợi ý "Lưu thành .xlsx" (không đọc ra dữ liệu rác) |
| `addExcel` file 5 dòng (1 thiếu MSSV, 1 email sai) | trả đúng **3** dòng hợp lệ, `nhomquyen=2`, `trangthai=1` |
| `addFileExcelGroup` lần 1 | `success` — tạo 3 tài khoản (mật khẩu đã băm bcrypt) + 3 `chitietnhom` (`hienthi=1`); `siso` 6 → 9 = số thành viên thực tế |
| `addFileExcelGroup` lần 2 (cùng danh sách) | `success` + "Sinh viên đã có trong nhóm: …", KHÔNG nhân bản bản ghi |
| MSSV mới nhưng **email trùng** | `error` "Email … đã tồn tại cho MSSV sv9009" (bắt `P2002`), KHÔNG 500 và KHÔNG tạo bản ghi mồ côi |
| `listuser` không phải JSON | `{status:'error', message:'Danh sách sinh viên không hợp lệ'}` |
| Đăng nhập bằng **SV** | vẫn gọi được (2 route chỉ cần auth — đúng `user.php` gốc) |
| Chưa đăng nhập | **401** |

Ghi chú: POST trả **HTTP 201** (mặc định Nest) như các route AJAX khác.

## ✅ e2e luồng nghiệp vụ (2026-08-08)

`test/exam-flow.e2e-spec.ts` (**MỚI**, 18 ca) phủ trọn vòng đời một đề thi, đi qua
HTTP y như trình duyệt: **GV tạo đề thủ công → chọn câu hỏi → giao nhóm → SV vào thi
→ nộp bài → GV xem bảng điểm/thống kê**.

| Bước | Route | Kiểm gì |
|------|-------|---------|
| Tạo đề | `POST /test/addTest` | trả `made`; `giaodethi` có nhóm; sinh `thongbao` `is_auto=1` |
| Chọn câu | `GET /test/select/:made`, `POST /test/getTotalPages`+`/test/pagination` (`custom.function=getQuestionsForTest`) | trang render 200; chỉ trả câu **đúng môn** + đúng loại (lọc qua `phancong` của GV) |
| Lưu câu | `POST /test/addDetail`, `POST /test/getQuestionOfTestManual` | 3 dòng `chitietdethi`, đọc lại khớp |
| SV vào thi | `GET /test/start/:made`, `POST /test/startTest` | trang có tên đề; tạo `ketqua` (`diemthi` NULL) + **pre-insert đúng 3** `chitietketqua` |
| SV làm bài | `POST /test/getQuestion`, `GET /test/taketest/:made`, `POST /test/chuyentab` | đủ 3 câu và **không lộ `ladapan`**; trang làm bài render (không redirect); `solanchuyentab` +1, cờ tự nộp = 0 |
| Nộp bài | `POST /test/submit` (multipart) | đúng hết → **10 điểm**, `socaudung=3`, `trangthai='Đã nộp'`, `trangthai_tuluan='Đã chấm'` (đề không có tự luận); **nộp lại lần 2 bị từ chối** |
| Xem lại | `POST /test/getResultDetail` | 3 câu |
| GV xem kết quả | `GET /test/detail/:made`, `POST /test/pagination` (`model=KetQuaModel`), `POST /test/getStatictical` | bảng điểm có SV với điểm 10; thống kê `da_nop_bai=1`, `diem_cao_nhat=10`, khoảng điểm cuối = 1 |
| Ràng buộc | `POST /test/delete` | **không xoá được** đề đã có người thi |

**An toàn dữ liệu:** bộ test chỉ **TẠO** một đề riêng (tên gắn dấu thời gian
`[E2E] Đề kiểm thử <ts>`), không sửa dữ liệu sẵn có, và `afterAll` xoá đúng những gì
đã tạo (thông báo → `ketqua` → `dethi`; phần còn lại theo FK cascade). **KHÔNG** dùng
`POST /test/delete` để dọn vì route đó xoá TOÀN BỘ thông báo của nhóm (quirk bê từ
PHP) → sẽ đụng dữ liệu mẫu. Dò dữ liệu tiên quyết (nhóm của `gv001` có SV + môn có ≥3
câu mcq), lấy đáp án đúng làm "đáp án chuẩn" và dọn dẹp đều qua `PrismaService` lấy từ
`app.get(...)`; mọi **bước nghiệp vụ** vẫn đi qua HTTP. Thiếu dữ liệu mẫu → **bỏ qua
kèm cảnh báo** thay vì đỏ oan.

Kết quả: `npx jest --config ./test/jest-e2e.json` → **28/28 pass** (3 bộ: app, trang
lỗi, luồng nghiệp vụ); đã đối chiếu CSDL sau khi chạy — số bản ghi trở về y như trước
(3 đề / 4 kết quả / 13 người dùng / 3 nhóm).

⚠️ `pnpm run test:e2e -- --testPathPattern X` KHÔNG còn dùng được (Jest mới đổi tên
thành `--testPathPatterns`, và chỉ nhận ở dòng lệnh) → chạy 1 bộ bằng
`npx jest --config ./test/jest-e2e.json --testPathPatterns exam-flow`.

## Việc kế tiếp (gợi ý)

**Cả 7 phase đã XONG.** Việc còn lại là kiểm chứng & nợ lẻ:

1. ~~Test **export Excel / in PDF** với dữ liệu mẫu~~ — **XONG 2026-08-07**.
   ~~Kiểm `user/addExcel` + `user/addFileExcelGroup`~~ — **XONG 2026-08-08**.
2. ~~Mở rộng e2e sang luồng nghiệp vụ~~ — **XONG 2026-08-08**
   (`test/exam-flow.e2e-spec.ts`). Có thể mở rộng tiếp: đề **tự động** (`loaide=1`),
   **chấm tự luận** (`getEssayDetailAction`/`saveEssayScoreAction`), luồng nhóm/thông
   báo phía SV (`/client/*`).
3. Còn nợ lẻ: `view_subject.php` (SV xem môn — Phase 2), `getExamineeByGroup`
   (chưa có nơi gọi), hỗ trợ đọc `.xls` cũ khi nhập SV (nếu người dùng cần).
