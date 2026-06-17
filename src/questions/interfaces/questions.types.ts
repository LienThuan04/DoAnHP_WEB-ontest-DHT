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
