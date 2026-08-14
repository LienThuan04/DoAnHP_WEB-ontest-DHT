/**
 * Đường dẫn ảnh đại diện — dùng chung cho MỌI trang (nạp ở views/partials/head.ejs
 * ngay sau jQuery, trước các script trang).
 *
 * Cột `nguoidung.avatar` chứa 2 dạng:
 *  - TÊN FILE cũ (`ANHSV.png`, `avatar2.jpg`… — dữ liệu seed/bản PHP để lại) →
 *    ghép tiền tố `/public/media/avatars/`;
 *  - URL ĐẦY ĐỦ trên Supabase Storage (ảnh tải lên từ 2026-08-14) → dùng nguyên.
 *
 * @param {*} avatar giá trị cột `avatar` (có thể null/rỗng)
 * @param {string} [fallback] tên file mặc định khi rỗng (mặc định `ANHSV.png`)
 * @returns {string} src dùng thẳng cho thẻ <img>
 */
window.avatarUrl = function (avatar, fallback) {
  var name = (avatar === null || avatar === undefined ? '' : String(avatar)).trim();
  if (!name) name = fallback || 'ANHSV.png';
  return /^https?:\/\//i.test(name) ? name : '/public/media/avatars/' + name;
};
