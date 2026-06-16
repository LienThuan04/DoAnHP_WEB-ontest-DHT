/**
 * Kiểu dữ liệu cho module Môn học & Chương — thay MonHocModel.php / ChuongModel.php.
 * Trang môn học dùng cùng giao thức phân trang server với người dùng (pagination.js):
 * args JSON → {controller, model, limit, page, input/content, filter, custom}.
 */

/** Tham số phân trang gửi từ pagination.js (giống IPaginationArgs của users). */
export interface IPaginationArgs {
  controller?: string;
  model?: string;
  limit?: number | string;
  page?: number | string;
  input?: string;
  content?: string;
  filter?: Record<string, string>;
  custom?: Record<string, unknown>;
}

/** Một dòng môn học trên bảng danh sách — thay MonHocModel::getQuery(). */
export interface ISubjectRow {
  mamonhoc: string;
  tenmonhoc: string;
  sotinchi: number | null;
  sotietlythuyet: number | null;
  sotietthuchanh: number | null;
  trangthai: number | null;
}

/** Một chương trong modal "Danh sách chương" — thay ChuongModel::getAll(). */
export interface IChapterRow {
  machuong: number;
  tenchuong: string;
  mamonhoc: string;
  trangthai: number | null;
}
