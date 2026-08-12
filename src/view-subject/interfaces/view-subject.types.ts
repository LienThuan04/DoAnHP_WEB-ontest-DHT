/**
 * Kiểu dữ liệu module "Môn học của tôi" (view_subject.php / XemMonHocModel).
 * Trang chỉ ĐỌC danh sách môn được phân công cho giảng viên đang đăng nhập
 * (bảng phancong) + quản lý chương của môn đó.
 */

/** 1 dòng môn học được phân công (getQuery: phancong × monhoc × namhoc × hocky). */
export interface IAssignedSubjectRow {
  mamonhoc: string;
  manguoidung: string;
  namhoc: number;
  hocky: number;
  tenmonhoc: string;
  sotinchi: number | null;
  sotietlythuyet: number | null;
  sotietthuchanh: number | null;
  tennamhoc: string | null;
  tenhocky: string | null;
}

/** 1 năm học trong dropdown lọc (getNamHoc). */
export interface INamHocOption {
  manamhoc: number;
  tennamhoc: string;
}

/** 1 học kỳ trong dropdown lọc (getHocKy). */
export interface IHocKyOption {
  mahocky: number;
  tenhocky: string;
}

/** Tham số phân trang (pagination.js, controller=view_subject, model=XemMonHocModel). */
export interface IViewSubjectPaginationArgs {
  controller?: string;
  model?: string;
  limit?: number | string;
  page?: number | string;
  input?: string;
  content?: string;
  filter?: {
    namhoc?: number | string;
    hocky?: number | string;
    /** Ô tìm kiếm khi bấm nút kính lúp (view_subject.js đặt vào filter). */
    input?: string;
  };
  custom?: {
    function?: string;
  };
}
