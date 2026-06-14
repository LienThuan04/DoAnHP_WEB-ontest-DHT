/**
 * Kiểu cho module phân quyền hệ thi — thay NhomQuyenModel của PHP.
 *   resource (chucnang) × action (hanhdong) = một dòng chitietquyen.
 * Xem docs/06 (RBAC) & roles.php gốc.
 */

/** Một ô quyền tick trên form (1 checkbox) — { name: chucnang, action: hanhdong }. */
export interface IRolePermissionInput {
  name: string;
  action: string;
}

/** Dòng hiển thị danh sách nhóm quyền — thay NhomQuyenModel::getAllSl(). */
export interface IRoleListItem {
  manhomquyen: number;
  tennhomquyen: string;
  soluong: number;
}

/** Chi tiết 1 nhóm quyền để đổ lên modal sửa — thay NhomQuyenModel::getById(). */
export interface IRoleDetail {
  name: string | null;
  detail: { chucnang: string; hanhdong: string }[];
}

/** Người dùng thuộc nhóm quyền — thay NguoiDungModel::getByRole(). */
export interface IRoleUser {
  id: string;
  hoten: string;
  email: string;
  trangthai: number;
}
