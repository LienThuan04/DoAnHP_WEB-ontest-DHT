# 03 — Tiến độ (LIVING DOC — cập nhật mỗi phiên)

> Cập nhật gần nhất: **2026-07-22**. Đây là "sổ tay tiến độ" — mỗi phiên làm xong
> nhớ sửa file này (đánh dấu đã làm gì, còn gì) để phiên/agent sau không mất mạch.

## Bảng phase

| Phase | Nội dung | Trạng thái |
|-------|----------|-----------|
| Hạ tầng | Gỡ demo, dời JwtStrategy → `exam-auth`, guards/interceptors tái dùng | ✅ XONG |
| 1 | Auth/RBAC: `exam-auth`, `pages` (landing/dashboard), `account` | ✅ XONG |
| 2 | `roles` (NhomQuyen), `users` (NguoiDung), `academic-years` (NamHoc+HocKy), `subjects` (MonHoc+Chuong) | ✅ XONG (trừ `view_subject` — hoãn, phụ thuộc phancong/nhom) |
| 3 | `questions`: ngân hàng câu hỏi mcq/essay/reading + đáp án + đoạn văn + ảnh + import Word (mammoth) + trang SSR/listing | ✅ XONG (Excel hoãn — nút gốc `disabled`) |
| 4 | `exams`: đề thi & làm bài & chấm (LỚN NHẤT) | 🟡 gần xong — xem dưới |
| 5 | Nhóm/lớp & phân công (model `Nhom`/`ChiTietNhom`/`PhanCong` ĐÃ có) | ⏳ chưa (UI) |
| 6 | Thông báo/thống kê/dashboard (model `ThongBao` ĐÃ có) | ⏳ chưa |
| 7 | Hoàn thiện (trang lỗi, seed mẫu, e2e, export thật) | ⏳ chưa |

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
- **exportPdf** (PHP dùng dompdf) & **exportExcel** (PhpSpreadsheet) → hiện **stub**
  trả thông báo "đang phát triển" (501 / JSON không có `file`). TODO: puppeteer/pdfkit
  + exceljs.
- **test_schedule.php** — lịch thi cho SV (trang riêng, chưa làm).
- `getExamineeByGroup` — chưa dùng ở `test_detail.js` (bỏ qua tới khi có nơi gọi).

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

1. **Phase 5** — UI nhóm/lớp (`module.php` GV + `client.php` SV) + phân công
   (`assignment.php`). Mở khoá dữ liệu thật cho các trang đang phụ thuộc.
2. Phase 6 — thông báo (`teacher_announcement.php`) + thống kê (`statistic.php`) +
   dashboard.
3. Quay lại: export PDF/Excel thật, `test_schedule`, `view_subject` (Phase 2 còn nợ).
