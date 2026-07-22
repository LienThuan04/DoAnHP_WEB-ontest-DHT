# 05 — Ánh xạ PHP ↔ NestJS & nguồn PHP

## Nguồn PHP ở đâu (QUAN TRỌNG)

⚠️ **Nguồn PHP `DHT_OneTest` KHÔNG nằm trong repo này.** Trên máy gốc nó là thư mục
anh em: `../DHT_OneTest/` (tức `convertType/DHT_OneTest/`). Muốn port tính năng còn
lại, đặt lại `DHT_OneTest/` cạnh `NestJS/`.

Cấu trúc nguồn PHP:
```
DHT_OneTest/
├── mvc/controllers/*.php    controller (mỗi file 1 nhóm chức năng)
├── mvc/models/*Model.php    model (SQL mysqli — nối chuỗi)
├── mvc/views/pages/*.php     view (port sang views/pages/*.ejs)
├── mvc/views/inc/            partial (layout, pagination.php…)
├── public/js/pages/*.js      JS trang (bê nguyên sang public/js/pages/, đổi ./→/)
├── public/js/plugins/        plugin (ckeditor, chart.js, select2… bê khi cần)
└── database/*.sql            schema MySQL gốc (chỉ tham chiếu cấu trúc bảng)
```

## Bảng map controller PHP → module NestJS

| Controller PHP | Model chính | Module NestJS | Trạng thái |
|----------------|-------------|---------------|-----------|
| `auth.php` | NguoiDungModel, MailAuth | `exam-auth` | ✅ |
| `account.php` | NguoiDungModel | `account` | ✅ |
| `roles.php` | NhomQuyenModel | `roles` | ✅ |
| `user.php` | NguoiDungModel | `users` | ✅ |
| `namhoc.php` | NamHocModel | `academic-years` | ✅ |
| `subject.php` | MonHocModel, ChuongModel | `subjects` | ✅ |
| `view_subject.php` | XemMonHocModel | `subjects` (read) | ⏳ hoãn |
| `question.php` (57KB) | CauHoiModel, CauTraLoiModel | `questions` | ✅ (Excel hoãn) |
| `module.php` | NhomModel | `class-modules` (một phần) | 🟡 chỉ loadData |
| `test.php` (56KB) | DeThiModel, ChiTietDeThiModel, KetQuaModel | `exams` | 🟡 slice 1–5 |
| `client.php` | NhomModel | (Phase 5) | ⏳ |
| `assignment.php` | PhanCongModel | (Phase 5) | ⏳ |
| `teacher_announcement.php` | AnnouncementModel | (Phase 6) | ⏳ |
| `statistic.php` | ThongKeModel | (Phase 6) | ⏳ |
| `dashboard.php` | (nhiều) | `pages` (một phần) | 🟡 |
| `home.php` | — | `pages` (landing) | ✅ |

## Ánh xạ khái niệm

| PHP | NestJS |
|-----|--------|
| `index.php ?url=ctrl/action` | Nest Router (`@Controller` + `@Get/@Post`) |
| `core/Controller::model()/view()` | DI service + `@Render()` |
| `core/DB` (mysqli, nối chuỗi) | `PrismaService` (typed) / `$queryRaw` (tham số hoá) |
| `core/AuthCore` (cookie + `$_SESSION`) | `JwtAuthGuard` + `PermissionsGuard` |
| `AuthCore::checkPermission($cn,$hd)` | `@Permissions('<cn>','<hd>')` |
| `$_POST['x']` | DTO (class-validator) — form urlencoded, ép kiểu trong DTO/service |
| `$_FILES` | Multer (`FileInterceptor`/`AnyFilesInterceptor`) |
| `echo json_encode(...)` (AJAX) | `return <obj>` + `@SkipTransform()` |
| `$this->view('main_layout', [...])` | `@Render('pages/<x>')` trả object dữ liệu |
| ảnh blob (mediumblob) | **Supabase Storage URL** (String) — xem [06](./06-luu-tru-file-supabase.md) |

## Cách tìm nhanh trong nguồn PHP

- Method controller = `public function <ten>(...)` trong `mvc/controllers/<x>.php`.
- Truy vấn = trong `mvc/models/<X>Model.php` (tìm `function <ten>`).
- URL JS gọi = grep `public/js/pages/<x>.js` cho `url:` / `$.post` / `$.ajax`.
- Trang render = `mvc/views/pages/<x>.php`; layout ở `mvc/views/main_layout.php`.

## RBAC — seed quyền

- Bảng `chitietquyen` gắn `manhomquyen` với (`chucnang`,`hanhdong`). Seed ở
  `src/seed-db/exam-sample.ts` (nhomquyen 1=admin, 2=GV, 3=... theo dữ liệu).
- Khi thêm chức năng mới cần quyền mới → thêm vào seed cho đúng nhóm, rồi gắn
  `@Permissions('<chucnang>','<hanhdong>')` ở controller.
- `PermissionsGuard` chỉ kiểm **1** quyền/route. Cần OR (create HOẶC update) thì
  kiểm thủ công trong service (vd `hasDethiCreateOrUpdate` ở `exams`).
