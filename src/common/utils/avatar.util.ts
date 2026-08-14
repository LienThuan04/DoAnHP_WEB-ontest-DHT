/** Ảnh đại diện mặc định khi cột `avatar` rỗng (y bản PHP). */
export const DEFAULT_AVATAR = 'avatar2.jpg';

/**
 * `src` của ảnh đại diện — bản server-side của `public/js/avatar-url.js`.
 *
 * Cột `nguoidung.avatar` chứa 2 dạng: TÊN FILE cũ (`ANHSV.png`… — dữ liệu seed
 * và ảnh bản PHP để lại trong `public/media/avatars/`) hoặc **URL đầy đủ** trên
 * Supabase Storage (ảnh tải lên từ 2026-08-14). Hàm này nhận cả 2.
 */
export function avatarSrc(
  avatar: string | null | undefined,
  fallback: string = DEFAULT_AVATAR,
): string {
  const name = (avatar ?? '').trim() || fallback;
  return /^https?:\/\//i.test(name) ? name : `/public/media/avatars/${name}`;
}
