-- Chuyển lưu ảnh từ blob trong CSDL sang Supabase Storage: cột `hinhanh`
-- (cauhoi, cautraloi, hinhanh_traloi_tuluan) đổi từ BYTEA (Bytes) sang TEXT
-- để lưu PUBLIC URL của file. Dữ liệu blob cũ (nếu có) KHÔNG chuyển được sang
-- URL nên đặt NULL — hệ thống mới chỉ lưu đường dẫn, file nằm ở bucket Supabase.

ALTER TABLE "cauhoi" ALTER COLUMN "hinhanh" TYPE TEXT USING NULL;
ALTER TABLE "cautraloi" ALTER COLUMN "hinhanh" TYPE TEXT USING NULL;
ALTER TABLE "hinhanh_traloi_tuluan" ALTER COLUMN "hinhanh" TYPE TEXT USING NULL;
