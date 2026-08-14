/** Kiểu dữ liệu trang cá nhân (account.php + account_setting.php). */

/** Shape mà account_setting.js đọc: `if (response.valid === true)`. */
export interface IAccountActionResult {
  valid: boolean;
  message: string;
}

/** Hồ sơ đổ ra view account_setting (SSR). */
export interface IProfileView {
  id: string;
  email: string;
  hoten: string;
  gioitinh: boolean | null;
  /** `Y-m-d` cho ô flatpickr (rỗng nếu chưa có). */
  ngaysinh: string;
  /** Giá trị thô của cột `avatar`: TÊN FILE cũ hoặc URL Supabase Storage. */
  avatar: string;
  /** `src` dùng thẳng cho thẻ `<img>` (đã ghép tiền tố nếu là tên file). */
  avatarUrl: string;
  manhomquyen: number | null;
}
