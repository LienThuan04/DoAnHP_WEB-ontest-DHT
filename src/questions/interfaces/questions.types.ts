/**
 * Kiểu dữ liệu module Ngân hàng câu hỏi — thay CauHoiModel.php / CauTraLoiModel.php.
 * Ảnh (blob) trả về dạng base64 data-URI để JS gắn thẳng vào <img>, giống PHP
 * (question_image_base64 / option_image_base64 / hinhanh_base64). Xem question.js.
 */

/** Một dòng câu hỏi trên bảng danh sách theo môn — thay getQuestionBySubject(). */
export interface IQuestionRow {
  macauhoi: number;
  noidung: string; // reading → lấy nội dung đoạn văn, còn lại → noidung câu hỏi
  dokho: number;
  machuong: number;
  loai: string;
  tenmonhoc: string;
  num_subquestions: number; // số câu hỏi con (chỉ reading), còn lại = 0
}

/**
 * Tham số phân trang gửi từ pagination.js (giống users/subjects):
 * args JSON → {controller, model, limit, page, input/content, filter, custom}.
 */
export interface IPaginationArgs {
  controller?: string;
  model?: string;
  limit?: number | string;
  page?: number | string;
  input?: string;
  content?: string;
  filter?: Record<string, unknown>;
  custom?: Record<string, unknown>;
}

/**
 * Một dòng của bảng danh sách câu hỏi chính (trang /question) — thay
 * CauHoiModel::getQuery(). Gộp mcq/essay + reading (1 dòng/đoạn văn). Có thêm
 * mamonhoc/madv/tieude_doanvan so với IQuestionRow để khớp cột UNION của SQL gốc.
 */
export interface IQuestionListRow {
  macauhoi: number;
  noidung: string;
  dokho: number;
  mamonhoc: string;
  machuong: number;
  tenmonhoc: string;
  loai: string;
  madv: number | null;
  tieude_doanvan: string;
  num_subquestions: number;
}

/** Chi tiết 1 câu hỏi để mở modal sửa — thay getQuestionById() (đã bỏ blob). */
export interface IQuestionDetail {
  macauhoi: number;
  noidung: string;
  dapan_dung: string | null;
  dokho: number;
  mamonhoc: string;
  machuong: number;
  nguoitao: string | null;
  trangthai: number | null;
  loai: string;
  madv: number | null;
  tieude?: string; // chỉ reading
  question_image_base64: string | null;
  hinhanh_base64: string | null;
}

/** Một đáp án (mcq/essay) trả cho getAnswerById(). */
export interface IAnswerRow {
  macautl: number;
  noidungtl: string;
  ladapan: number;
  macauhoi: number;
  option_image_base64: string | null;
}

/** Một đáp án câu hỏi con của reading trả cho getAnswerById(). */
export interface IReadingAnswerRow {
  macauhoicon: number;
  noidung_con: string;
  noidungtl: string;
  ladapan: number;
  question_image_base64: string | null;
  option_image_base64: string | null;
}

/**
 * Một option/đáp án parse từ JSON `cautraloi` của FormData (addQues/editQuesion).
 * `image` = base64 ảnh CŨ giữ lại; `delete_image` = cờ xoá ảnh; ảnh MỚI tải lên
 * đến qua multipart (option_hinhanh[]) chứ không nằm ở đây.
 */
export interface IIncomingOption {
  content?: string;
  check?: number | string | boolean;
  image?: string | null;
  delete_image?: number | string | boolean;
}

/** Phần tử `cautraloi`: đáp án (mcq/essay) hoặc câu hỏi con reading (có options). */
export interface IIncomingAnswer extends IIncomingOption {
  options?: IIncomingOption[];
}

/** Dữ liệu text (không kể file) gửi lên addQues/editQuesion. */
export interface IWriteQuestionInput {
  id?: string;
  mamon?: string;
  machuong?: string;
  dokho?: string;
  loai?: string;
  noidung?: string;
  doanvan_noidung?: string;
  doanvan_tieude?: string;
  cautraloi?: string;
  delete_question_image?: string;
}

/** Kết quả trả cho addQues/editQuesion — khớp shape question.js mong đợi. */
export interface IWriteQuestionResult {
  status: 'success' | 'error';
  message: string;
  loai?: string;
}
