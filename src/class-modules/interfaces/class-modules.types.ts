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

/** Header trang chi tiết nhóm (getDetailGroup) — hiển thị môn/năm/kỳ/nhóm + GV. */
export interface IGroupDetail {
  mamonhoc: string;
  tenmonhoc: string;
  manhom: number;
  tennhom: string;
  tennamhoc: string;
  tenhocky: string;
  giangvien: string;
  hoten: string;
  avatar: string | null;
}

/** 1 sinh viên trong danh sách thành viên nhóm (bảng chi tiết). */
export interface IGroupStudentRow {
  id: string;
  avatar: string | null;
  hoten: string;
  email: string;
  gioitinh: boolean | null;
  ngaysinh: string | null;
}

/** Tham số phân trang danh sách SV của 1 nhóm (pagination.js, model=NhomModel). */
export interface IGroupPaginationArgs {
  controller?: string;
  model?: string;
  manhom?: number | string;
  limit?: number | string;
  page?: number | string;
  input?: string;
  content?: string;
  custom?: {
    function?: string;
    column?: string;
    order?: string;
  };
}
