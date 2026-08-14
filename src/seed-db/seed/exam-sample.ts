// Dữ liệu seed hệ thi OnTest — trích từ database/tracnghiemonline.sql (DHT_OneTest).
// Dùng cho SeedDbService.seedExam(). Xem docs/06 (RBAC) & docs/08 (Phase 1).

/** Nhóm quyền — bảng nhomquyen. Giữ nguyên id (1/2/3) để khớp chitietquyen. */
export const examRoles = [
  { manhomquyen: 1, tennhomquyen: 'Giáo Viên' },
  { manhomquyen: 2, tennhomquyen: 'Sinh Viên' },
  { manhomquyen: 3, tennhomquyen: 'Admin' },
];

/** Danh mục chức năng (resource) — bảng danhmucchucnang. */
export const examResources = [
  { chucnang: 'caidat', tenchucnang: 'Cài đặt' },
  { chucnang: 'cauhoi', tenchucnang: 'Quản lý câu hỏi' },
  { chucnang: 'chuong', tenchucnang: 'Quản lý chương' },
  { chucnang: 'dethi', tenchucnang: 'Quản lý đề thi' },
  { chucnang: 'hocphan', tenchucnang: 'Quản lý học phần' },
  { chucnang: 'monhoc', tenchucnang: 'Quản lý môn học' },
  { chucnang: 'namhoc', tenchucnang: 'Năm học, học kì' },
  { chucnang: 'nguoidung', tenchucnang: 'Quản lý người dùng' },
  { chucnang: 'nhomquyen', tenchucnang: 'Quản lý nhóm quyền' },
  { chucnang: 'phancong', tenchucnang: 'Quản lý phân công' },
  { chucnang: 'sinhvien', tenchucnang: 'Sinh viên' },
  { chucnang: 'tghocphan', tenchucnang: 'Tham gia học phần' },
  { chucnang: 'tgthi', tenchucnang: 'Tham gia thi' },
  { chucnang: 'thongbao', tenchucnang: 'Thông báo' },
  { chucnang: 'thongke', tenchucnang: 'Thống kê' },
  { chucnang: 'xem_monhoc', tenchucnang: 'Xem môn học' },
];

/** Chi tiết quyền (role × chức năng × hành động) — bảng chitietquyen. */
export const examPermissions = [
  // Giáo Viên (1)
  { manhomquyen: 1, chucnang: 'cauhoi', hanhdong: 'create' },
  { manhomquyen: 1, chucnang: 'cauhoi', hanhdong: 'delete' },
  { manhomquyen: 1, chucnang: 'cauhoi', hanhdong: 'update' },
  { manhomquyen: 1, chucnang: 'cauhoi', hanhdong: 'view' },
  { manhomquyen: 1, chucnang: 'chuong', hanhdong: 'create' },
  { manhomquyen: 1, chucnang: 'chuong', hanhdong: 'delete' },
  { manhomquyen: 1, chucnang: 'chuong', hanhdong: 'update' },
  { manhomquyen: 1, chucnang: 'chuong', hanhdong: 'view' },
  { manhomquyen: 1, chucnang: 'dethi', hanhdong: 'create' },
  { manhomquyen: 1, chucnang: 'dethi', hanhdong: 'delete' },
  { manhomquyen: 1, chucnang: 'dethi', hanhdong: 'update' },
  { manhomquyen: 1, chucnang: 'dethi', hanhdong: 'view' },
  { manhomquyen: 1, chucnang: 'hocphan', hanhdong: 'create' },
  { manhomquyen: 1, chucnang: 'hocphan', hanhdong: 'delete' },
  { manhomquyen: 1, chucnang: 'hocphan', hanhdong: 'update' },
  { manhomquyen: 1, chucnang: 'hocphan', hanhdong: 'view' },
  { manhomquyen: 1, chucnang: 'nguoidung', hanhdong: 'create' },
  { manhomquyen: 1, chucnang: 'nguoidung', hanhdong: 'delete' },
  { manhomquyen: 1, chucnang: 'nguoidung', hanhdong: 'update' },
  { manhomquyen: 1, chucnang: 'nguoidung', hanhdong: 'view' },
  { manhomquyen: 1, chucnang: 'xem_monhoc', hanhdong: 'view' },
  // Sinh Viên (2)
  { manhomquyen: 2, chucnang: 'tghocphan', hanhdong: 'join' },
  { manhomquyen: 2, chucnang: 'tgthi', hanhdong: 'join' },
  // Admin (3)
  { manhomquyen: 3, chucnang: 'cauhoi', hanhdong: 'create' },
  { manhomquyen: 3, chucnang: 'cauhoi', hanhdong: 'delete' },
  { manhomquyen: 3, chucnang: 'cauhoi', hanhdong: 'update' },
  { manhomquyen: 3, chucnang: 'cauhoi', hanhdong: 'view' },
  { manhomquyen: 3, chucnang: 'chuong', hanhdong: 'create' },
  { manhomquyen: 3, chucnang: 'chuong', hanhdong: 'delete' },
  { manhomquyen: 3, chucnang: 'chuong', hanhdong: 'update' },
  { manhomquyen: 3, chucnang: 'chuong', hanhdong: 'view' },
  { manhomquyen: 3, chucnang: 'dethi', hanhdong: 'create' },
  { manhomquyen: 3, chucnang: 'dethi', hanhdong: 'delete' },
  { manhomquyen: 3, chucnang: 'dethi', hanhdong: 'update' },
  { manhomquyen: 3, chucnang: 'dethi', hanhdong: 'view' },
  { manhomquyen: 3, chucnang: 'hocphan', hanhdong: 'create' },
  { manhomquyen: 3, chucnang: 'hocphan', hanhdong: 'delete' },
  { manhomquyen: 3, chucnang: 'hocphan', hanhdong: 'update' },
  { manhomquyen: 3, chucnang: 'hocphan', hanhdong: 'view' },
  { manhomquyen: 3, chucnang: 'monhoc', hanhdong: 'create' },
  { manhomquyen: 3, chucnang: 'monhoc', hanhdong: 'delete' },
  { manhomquyen: 3, chucnang: 'monhoc', hanhdong: 'update' },
  { manhomquyen: 3, chucnang: 'monhoc', hanhdong: 'view' },
  { manhomquyen: 3, chucnang: 'namhoc', hanhdong: 'create' },
  { manhomquyen: 3, chucnang: 'namhoc', hanhdong: 'delete' },
  { manhomquyen: 3, chucnang: 'namhoc', hanhdong: 'update' },
  { manhomquyen: 3, chucnang: 'namhoc', hanhdong: 'view' },
  { manhomquyen: 3, chucnang: 'nguoidung', hanhdong: 'create' },
  { manhomquyen: 3, chucnang: 'nguoidung', hanhdong: 'delete' },
  { manhomquyen: 3, chucnang: 'nguoidung', hanhdong: 'update' },
  { manhomquyen: 3, chucnang: 'nguoidung', hanhdong: 'view' },
  { manhomquyen: 3, chucnang: 'nhomquyen', hanhdong: 'create' },
  { manhomquyen: 3, chucnang: 'nhomquyen', hanhdong: 'delete' },
  { manhomquyen: 3, chucnang: 'nhomquyen', hanhdong: 'update' },
  { manhomquyen: 3, chucnang: 'nhomquyen', hanhdong: 'view' },
  { manhomquyen: 3, chucnang: 'phancong', hanhdong: 'create' },
  { manhomquyen: 3, chucnang: 'phancong', hanhdong: 'delete' },
  { manhomquyen: 3, chucnang: 'phancong', hanhdong: 'update' },
  { manhomquyen: 3, chucnang: 'phancong', hanhdong: 'view' },
  { manhomquyen: 3, chucnang: 'thongbao', hanhdong: 'create' },
  { manhomquyen: 3, chucnang: 'thongbao', hanhdong: 'delete' },
  { manhomquyen: 3, chucnang: 'thongbao', hanhdong: 'update' },
  { manhomquyen: 3, chucnang: 'thongbao', hanhdong: 'view' },
  { manhomquyen: 3, chucnang: 'thongke', hanhdong: 'create' },
  { manhomquyen: 3, chucnang: 'thongke', hanhdong: 'delete' },
  { manhomquyen: 3, chucnang: 'thongke', hanhdong: 'update' },
  { manhomquyen: 3, chucnang: 'thongke', hanhdong: 'view' },
];

/**
 * Người dùng demo — bảng nguoidung. password sẽ được hash bằng bcrypt khi seed.
 *
 * Danh sách này phải đủ cho dữ liệu mẫu nghiệp vụ ở `exam-demo.data.ts` (nhóm học
 * phần, bài làm mẫu đều trỏ tới các id bên dưới). Id để cố định (KHÔNG tự tăng) nên
 * dù CLEAR_DB=true xoá rồi seed lại thì dữ liệu mẫu vẫn khớp người dùng.
 */
export const examUsers = [
  {
    id: 'admin',
    email: 'admin@ontest.vn',
    hoten: 'Quản trị viên',
    manhomquyen: 3,
  },
  // Giảng viên
  {
    id: 'gv001',
    email: 'gv001@ontest.vn',
    hoten: 'Trần Minh Khoa',
    manhomquyen: 1,
  },
  {
    id: 'gv002',
    email: 'gv002@ontest.vn',
    hoten: 'Phạm Thị Lan',
    manhomquyen: 1,
  },
  // Sinh viên
  {
    id: 'sv001',
    email: 'sv001@ontest.vn',
    hoten: 'Nguyễn Văn An',
    manhomquyen: 2,
  },
  {
    id: 'sv002',
    email: 'sv002@ontest.vn',
    hoten: 'Lê Thị Bình',
    manhomquyen: 2,
  },
  {
    id: 'sv003',
    email: 'sv003@ontest.vn',
    hoten: 'Trần Quốc Cường',
    manhomquyen: 2,
  },
  {
    id: 'sv004',
    email: 'sv004@ontest.vn',
    hoten: 'Phạm Thùy Dung',
    manhomquyen: 2,
  },
  {
    id: 'sv005',
    email: 'sv005@ontest.vn',
    hoten: 'Hoàng Minh Đức',
    manhomquyen: 2,
  },
  {
    id: 'sv006',
    email: 'sv006@ontest.vn',
    hoten: 'Vũ Thị Giang',
    manhomquyen: 2,
  },
  {
    id: 'sv007',
    email: 'sv007@ontest.vn',
    hoten: 'Đỗ Hoàng Hải',
    manhomquyen: 2,
  },
  {
    id: 'sv008',
    email: 'sv008@ontest.vn',
    hoten: 'Bùi Thu Hương',
    manhomquyen: 2,
  },
  {
    id: 'sv009',
    email: 'sv009@ontest.vn',
    hoten: 'Ngô Gia Khánh',
    manhomquyen: 2,
  },
  {
    id: 'sv010',
    email: 'sv010@ontest.vn',
    hoten: 'Đặng Thảo Linh',
    manhomquyen: 2,
  },
];
