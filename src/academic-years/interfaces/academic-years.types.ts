/**
 * Kiểu dữ liệu cho module Năm học / Học kỳ — thay NamHocModel.php của DHT_OneTest.
 * Mỗi năm học (`namhoc`) gồm nhiều học kỳ (`hocky`); danh sách kèm `tonghocky`
 * (tổng số học kỳ) để JS hiển thị cột "Số học kỳ". Xem namhoc.php + namhoc.js gốc.
 */

/** Một dòng năm học trên bảng danh sách — thay NamHocModel::getNamHoc(). */
export interface INamHocRow {
  manamhoc: number;
  tennamhoc: string;
  trangthai: number | null;
  tonghocky: number;
}

/** Kết quả phân trang trả về cho namhoc.js (`res.data`, `res.total`). */
export interface INamHocPage {
  data: INamHocRow[];
  total: number;
  page: number;
  limit: number;
}

/** Một học kỳ trong modal "Xem học kỳ" — thay NamHocModel::getHocKy(). */
export interface IHocKyRow {
  mahocky: number;
  tenhocky: string;
  sohocky: number;
}

/** Kết quả thao tác (add/update) — khớp `res.success` / `res.message` của JS gốc. */
export interface INamHocResult {
  success: boolean;
  message?: string;
}
