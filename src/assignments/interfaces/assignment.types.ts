/**
 * Kiểu dữ liệu module Phân công giảng dạy (assignment.php / PhanCongModel).
 * Gắn giảng viên (nguoidung) với môn học theo năm học + học kỳ (bảng phancong).
 */

/** 1 giảng viên đủ điều kiện được phân công (getGiangVien). */
export interface IGiangVienRow {
  id: string;
  manhomquyen: number | null;
  hoten: string;
}

/** 1 dòng phân công (danh sách chính + modal). */
export interface IAssignmentRow {
  mamonhoc: string;
  manguoidung: string;
  namhoc: number | null;
  hocky: number | null;
  hoten: string;
  tenmonhoc: string;
  tennamhoc: string | null;
  tenhocky: string | null;
  trangthai: number;
}

/** Kết quả addAssignment (theo shape JS gốc mong đợi). */
export interface IAddAssignmentResult {
  success: boolean;
  added: string[];
  message: string;
  errors: Record<string, string>;
}

/** Tham số phân trang (pagination.js, model=PhanCongModel). */
export interface IAssignmentPaginationArgs {
  controller?: string;
  model?: string;
  limit?: number | string;
  page?: number | string;
  input?: string;
  content?: string;
  filter?: {
    namhoc?: number | string;
    hocky?: number | string;
  };
  custom?: {
    function?: string;
  };
}
