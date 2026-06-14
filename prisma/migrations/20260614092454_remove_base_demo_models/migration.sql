-- Gỡ stack demo của bộ khung — hệ thi OnTest là stack duy nhất.
-- Xoá model nền (User/Role/Session/File + pending OTP). Hệ thi dùng
-- NguoiDung/NhomQuyen/ChiTietQuyen/DanhMucChucNang (giữ nguyên).
-- CASCADE để bỏ luôn khoá ngoại liên quan.
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "File" CASCADE;
DROP TABLE IF EXISTS "PendingUserUpdate" CASCADE;
DROP TABLE IF EXISTS "PendingRegistration" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "Role" CASCADE;
