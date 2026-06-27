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

// ===================== LUỒNG LÀM BÀI SV (slice 4) =====================

/** Bản ghi ketqua của 1 SV cho 1 đề — thay KetQuaModel::getMaKQ. */
export interface IKetQuaRow {
  makq: number;
  made: number;
  manguoidung: string;
  diemthi: number | null;
  diem_dochieu: number | null;
  thoigianvaothi: Date;
  thoigianlambai: number | null;
  socaudung: number | null;
  solanchuyentab: number | null;
  diem_tuluan: number | null;
  trangthai_tuluan: string | null;
  trangthai: string | null;
  thoigianketthuc: Date | null;
}

/** Một đáp án hiển thị cho SV (không kèm ladapan) — getAllWithoutAnswer. */
export interface IStudentAnswerOption {
  macautl: number;
  noidungtl: string;
  hinhanhtl: string; // base64 thuần (renderImage tự nhận diện)
}

/** Một câu hỏi khi SV làm bài — thay getQuestionByUser (mỗi phần tử cauhoi[]). */
export interface IStudentQuestion {
  macauhoi: number;
  noidung: string;
  dokho: number;
  loai: string;
  hinhanh: string | null; // base64 thuần
  context: string | null;
  tieude_context: string | null;
  thutu: number;
  dapanchon: number | null;
  cautraloi: IStudentAnswerOption[];
  thutu_hien_thi?: number;
}

/** Thông tin đề nạp vào nav khi làm bài — phần `dethi` của getQuestionByUser. */
export interface IStudentTestInfo {
  tende: string | null;
  thoigianthi: number | null;
  thoigianbatdau: Date | null;
  thoigianketthuc: Date | null;
  tenmonhoc: string | null;
  troncauhoi: number | null;
  trondapan: number | null;
  loaide: number | null;
}

/** Kết quả getQuestionByUser — { dethi, cauhoi } (de_thi.js đọc 2 khoá này). */
export interface IGetQuestionByUser {
  dethi: IStudentTestInfo | Record<string, never>;
  cauhoi: IStudentQuestion[];
}

/** Một dòng chi tiết bài làm — thay DeThiModel::getResultDetail (vaothi.js). */
export interface IResultDetailRow {
  macauhoi: number;
  noidung: string;
  dokho: number;
  loai: string;
  context: string | null;
  tieude_context: string | null;
  dapanchon: number | null;
  traloi_id: number | null;
  noidung_tra_loi: string | null;
  thoigianlam_tra_loi: Date | null;
  diem_cham_tuluan: number | null;
  ds_hinhanh_base64: string | null;
  cautraloi: IResultAnswerOption[];
}

/** Đáp án kèm ladapan + ảnh (showTestDetail dùng) — getAll(). */
export interface IResultAnswerOption {
  macautl: number;
  macauhoi: number;
  noidungtl: string;
  ladapan: number;
  hinhanh: string | null; // data-URI (KHÁC PHP trả blob thô → JS hỏng)
}

/** Dữ liệu trang vào thi (vao_thi.ejs) — Test (đề + tổng câu) + Check (ketqua). */
export interface IStartPageData {
  Test: Record<string, unknown>;
  Check: IKetQuaRow | null;
}
