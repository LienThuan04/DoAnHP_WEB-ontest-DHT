/**
 * Kiểu dữ liệu module Nhóm học phần (module.php / NhomModel) — phần đang cần
 * cho trang tạo/sửa đề (loadData). UI quản lý đầy đủ sẽ làm ở Phase 5.
 */

/** Một nhóm/lớp thuộc 1 môn-năm-kỳ (phần tử trong `nhom[]`). */
export interface IGroupItem {
  manhom: number;
  tennhom: string;
  ghichu: string | null;
  siso: number | null;
  hienthi: number | null;
}

/** 1 môn học (gom theo môn + năm học + học kỳ) kèm danh sách nhóm. */
export interface ISubjectGroups {
  mamonhoc: string;
  tenmonhoc: string;
  manamhoc: number;
  tennamhoc: string;
  mahocky: number;
  tenhocky: string;
  sohocky: number;
  nhom: IGroupItem[];
}
