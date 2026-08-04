# 03 — Tiến độ (LIVING DOC — cập nhật mỗi phiên)

> Cập nhật gần nhất: **2026-08-04**. Đây là "sổ tay tiến độ" — mỗi phiên làm xong
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
| 7 | Hoàn thiện (export thật, seed mẫu, trang lỗi, e2e) | 🟡 slice 1 (xuất/nhập Excel + in PDF) + slice 2 (seed dữ liệu mẫu) XONG; còn trang lỗi, e2e |

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

## Việc kế tiếp (gợi ý)

1. **Phase 7 slice 3** — trang lỗi (404/403/500) + e2e. Đã có dữ liệu mẫu nên e2e
   chạy được thật.
2. Test **export Excel / in PDF** (Phase 7 slice 1) với dữ liệu mẫu — đề *Kiểm tra
   giữa kỳ LTW* đã có 4 bài làm nên `test/exportExcel`, `test/getMarkOfAllTest`,
   `test/exportPdf/:makq`, `module/exportExcelStudentS` đều có dữ liệu để chạy.
3. Còn nợ lẻ: `view_subject.php` (SV xem môn — Phase 2), `getExamineeByGroup`
   (chưa có nơi gọi), hỗ trợ đọc `.xls` cũ khi nhập SV (nếu người dùng cần).
