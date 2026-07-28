/**
 * Kiểu cho module quản lý người dùng hệ thi — thay NguoiDungModel của PHP.
 * Xem user.php + pagination.js (giao thức getTotalPages/pagination).
 */

/** Tham số phân trang gửi từ pagination.js (đã JSON.parse từ body.args). */
export interface IPaginationArgs {
  controller?: string;
  model?: string;
  limit?: number;
  page?: number;
  filter?: { role?: number | string };
  input?: string; // từ khoá tìm kiếm (bản mới)
  content?: string; // từ khoá tìm kiếm (bản cũ)
}

/** Kết quả thao tác trả nguyên shape JS gốc mong đợi ({status, message}). */
export interface IActionStatus {
  status: 'success' | 'error';
  message: string;
}

/**
 * 1 SV đọc từ file Excel (addExcel) rồi gửi lại ở addFileExcelGroup.
 * Giữ đúng tên field mà class_detail.js chuyển tiếp nguyên vẹn giữa 2 route.
 */
export interface IImportUserRow {
  fullname: string;
  email: string;
  mssv: string;
  nhomquyen: number;
  trangthai: number;
}

/** Kết quả đọc file Excel — lỗi thì có `message`, thành công thì có `data`. */
export interface IExcelImportResult {
  status: 'success' | 'error';
  message?: string;
  data?: IImportUserRow[];
}

/** Một dòng người dùng đổ ra bảng — khớp field mà showData() (user.js) dùng. */
export interface IUserRow {
  id: string;
  email: string;
  hoten: string;
  avatar: string | null;
  gioitinh: number;
  ngaysinh: string;
  ngaythamgia: string;
  trangthai: number;
  manhomquyen: number | null;
  tennhomquyen: string | null;
}
