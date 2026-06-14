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
