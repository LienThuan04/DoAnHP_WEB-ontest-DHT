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
  mamonhoc?: string; // môn của đề (trang chọn câu hỏi getQuestionsForTest)
  limit?: number | string;
  page?: number | string;
  input?: string;
  content?: string;
  // Danh sách đề GV: trạng thái "0"|"1"|"2". Trang chọn câu hỏi: object lọc câu.
  filter?: string | number | IQuestionForTestFilter;
  subject?: string;
  group?: string | number;
  custom?: { function?: string };
}

/** Bộ lọc câu hỏi khi chọn câu cho đề thủ công (select_question.js → filter). */
export interface IQuestionForTestFilter {
  machuong?: number | string;
  dokho?: number | string;
  loai?: string;
  keyword?: string;
}

/**
 * Một dòng câu hỏi để chọn vào đề thủ công — thay getQuery("getQuestionsForTest").
 * Trả cả đoạn văn (reading) + ảnh base64 (KHÁC PHP trả blob thô qua cauhoi.*).
 */
export interface IQuestionForTestRow {
  macauhoi: number;
  noidung: string;
  noidungplaintext: string;
  dokho: number;
  loai: string;
  madv: number | null;
  machuong: number;
  mamonhoc: string;
  doanvan_noidung: string | null;
  doanvan_tieude: string | null;
  hinhanh: string | null; // data-URI base64 (PHP để blob thô → JS hỏng)
}

/** Một câu hỏi trong đề thủ công (theo thứ tự) — thay getQuestionOfTestManual. */
export interface IManualTestQuestion {
  macauhoi: number;
  thutu: number | null;
  noidung: string;
  noidungplaintext: string;
  dokho: number;
  loai: string;
  madv: number | null;
  cautraloi: IManualAnswerOption[];
  doanvan_tieude: string;
  doanvan_noidung: string;
}

/** Đáp án (không kèm ladapan) — thay CauTraLoiModel::getAllWithoutAnswer. */
export interface IManualAnswerOption {
  macautl: number;
  noidungtl: string;
  hinhanhtl: string; // base64 thuần (giữ y PHP) — bị JS ghi đè sau khi nạp đáp án
}

/** Kết quả addDetail() — thay ChiTietDeThiModel::createMultiple (success/error). */
export interface IAddDetailResult {
  success: boolean;
  error?: string;
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

/** Số câu theo mức độ của 1 loại — { de, tb, kho }. */
export interface ISoCauLevels {
  de?: number;
  tb?: number;
  kho?: number;
}

/** Cấu hình số câu theo loại — { mcq:{...}, essay:{...}, reading:{...} }. */
export type ISoCauMap = Record<string, ISoCauLevels>;

/** Kết quả addTest()/updateTest() — khớp action_test.js (success/made/error). */
export interface ICreateTestResult {
  success: boolean;
  made?: number;
  error?: string;
}
