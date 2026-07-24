/**
 * Kiểu dữ liệu module Thông báo (teacher_announcement.php / AnnouncementModel).
 * Bảng: `thongbao` (nội dung) — `chitietthongbao` (nhóm nhận) —
 * `trangthaithongbao` (trạng thái đọc theo từng SV).
 */

/** 1 dòng danh sách thông báo của GV (pagination, model=AnnouncementModel). */
export interface IAnnouncementRow {
  matb: number;
  noidung: string | null;
  thoigiantao: Date | null;
  nguoitao: string;
  is_auto: number | null;
  tenmonhoc: string | null;
  tennamhoc: string | null;
  tenhocky: string | null;
  /** Tên các nhóm nhận, gộp bằng ', ' (thay GROUP_CONCAT). */
  nhom: string | null;
}

/** 1 thông báo trong offcanvas nhóm (getAnnounce). */
export interface IGroupAnnouncementRow {
  matb: number;
  noidung: string | null;
  avatar: string | null;
  thoigiantao: Date | null;
}

/** 1 thông báo trong chuông thông báo của SV (getNotifications). */
export interface INotificationRow {
  tennhom: string;
  avatar: string | null;
  hoten: string;
  noidung: string | null;
  thoigiantao: Date | null;
  manhom: number;
  mamonhoc: string;
  tenmonhoc: string;
}

/** Chi tiết 1 thông báo cho trang cập nhật (getDetail). */
export interface IAnnouncementDetail {
  matb: number;
  noidung: string | null;
  tenmonhoc: string;
  namhoc: number | null;
  hocky: number | null;
  /** Mã các nhóm đang nhận thông báo này. */
  nhom: number[];
}

/** 1 mục của getListAnnounce (gộp nhóm thành mảng tên). */
export interface IAnnouncementListItem {
  matb: number;
  noidung: string | null;
  tenmonhoc: string;
  tennamhoc: string | null;
  /** QUIRK PHP: gán bằng `hocky` (mã) chứ không phải tên học kỳ. */
  tenhocky: number | null;
  thoigiantao: Date | null;
  nhom: string[];
}

/** Tham số phân trang (pagination.js, model=AnnouncementModel). */
export interface IAnnouncementPaginationArgs {
  controller?: string;
  model?: string;
  limit?: number | string;
  page?: number | string;
  input?: string;
  content?: string;
  id?: string;
  filter?: {
    namhoc?: number | string;
    hocky?: number | string;
    mamonhoc?: string;
    keyword?: string;
  };
  custom?: {
    function?: string;
  };
}
