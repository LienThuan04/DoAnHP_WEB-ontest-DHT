// Kiểu dữ liệu cho phía sinh viên (client.php) — nhóm học phần SV tham gia +
// lịch kiểm tra (test_schedule).

/** 1 dòng nhóm mà SV đang tham gia (getAllGroup_User). */
export interface IClientGroupRow {
  mamonhoc: string;
  tenmonhoc: string;
  manhom: number;
  tennhom: string;
  namhoc: number | null;
  hocky: number | null;
  tennamhoc: string | null;
  tenhocky: string | null;
  hoten: string;
  avatar: string | null;
  hienthi: number | null;
}

/** Tham số phân trang lịch thi SV (pagination.js gửi kèm args JSON). */
export interface IClientScheduleArgs {
  controller?: string;
  model?: string;
  manguoidung?: string;
  limit?: number | string;
  page?: number | string;
  input?: string;
  content?: string;
  filter?: string | number;
  custom?: { function?: string };
}

/** 1 dòng lịch thi (T1 LEFT JOIN T2 của getUserTestSchedule). */
export interface ITestScheduleRow {
  made: number;
  tende: string | null;
  thoigianbatdau: Date | null;
  thoigianketthuc: Date | null;
  manhom: number;
  tennhom: string;
  tenmonhoc: string;
  namhoc: number | null;
  hocky: number | null;
  diemthi: number | null;
  dathi: number | null;
  xemdiemthi: number | null;
  diem_tuluan: number | null;
  trangthai_tuluan: string | null;
}
