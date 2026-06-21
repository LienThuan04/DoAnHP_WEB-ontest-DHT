/**
 * Kiểu dữ liệu module Đề thi (Phase 4) — thay test.php / DeThiModel.php.
 * AJAX trả nguyên shape mà JS gốc mong đợi (mảng / object / boolean) qua
 * @SkipTransform — xem public/js/pages/test.js, action_test.js...
 */

/**
 * Tham số phân trang gửi từ pagination.js (giống questions/users):
 * args JSON → {controller, model, id, limit, page, input/content, filter,
 * subject, group, custom:{function}}.
 */
export interface IExamPaginationArgs {
  controller?: string;
  model?: string;
  id?: string;
  limit?: number | string;
  page?: number | string;
  input?: string;
  content?: string;
  filter?: string | number; // trạng thái "0"|"1"|"2" (chưa mở/đang mở/đã đóng)
  subject?: string;
  group?: string | number;
  custom?: { function?: string };
}

/** Một dòng danh sách đề thi GV đã tạo — thay getQuery("getAllCreatedTest"). */
export interface ICreatedTestRow {
  made: number;
  tende: string | null;
  tenmonhoc: string;
  thoigianbatdau: Date | null;
  thoigianketthuc: Date | null;
  nhom: string | null; // STRING_AGG tên các nhóm được giao đề
  tennamhoc: string | null;
  tenhocky: string | null;
}

/** Một môn học được phân công (dropdown lọc) — thay getAllSubjects(). */
export interface ISubjectOption {
  mamonhoc: string;
  tenmonhoc: string;
}

/** Một nhóm/lớp (dropdown lọc) — thay getAllGroups(). */
export interface IGroupOption {
  manhom: number;
  tennhom: string;
}

/** Chi tiết 1 đề thi (kèm chuong[] + nhom[]) — thay getById()/getDetail(). */
export interface IExamDetail {
  made: number;
  monthi: string | null;
  tenmonhoc: string;
  nguoitao: string | null;
  tende: string | null;
  thoigianthi: number | null;
  thoigianbatdau: Date | null;
  thoigianketthuc: Date | null;
  hienthibailam: number | null;
  xemdiemthi: number | null;
  xemdapan: number | null;
  troncauhoi: number | null;
  trondapan: number | null;
  nopbaichuyentab: number | null;
  loaide: number | null;
  mcq_de: number | null;
  mcq_tb: number | null;
  mcq_kho: number | null;
  essay_de: number | null;
  essay_tb: number | null;
  essay_kho: number | null;
  reading_de: number | null;
  reading_tb: number | null;
  reading_kho: number | null;
  diem_tracnghiem: number | null;
  diem_tuluan: number | null;
  diem_dochieu: number | null;
  trangthai: number | null;
  chuong: number[];
  nhom: number[];
}

/** Kết quả xoá đề — khớp shape test.js (response.success / response.message). */
export interface IDeleteExamResult {
  success: boolean;
  message: string;
}
