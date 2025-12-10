# Ứng dụng Thi Trắc Nghiệm (DoAnHP_WEB-ontest-DHT)

Giới thiệu
-----------
Đây là một hệ thống quản lý và thực hiện bài thi trắc nghiệm (OnTest) được xây dựng bằng PHP theo mô hình MVC. Ứng dụng hỗ trợ quản lý người dùng, môn học, câu hỏi, đề thi, làm bài, và thống kê kết quả. Dự án phù hợp cho mục đích học tập, triển khai nội bộ cho trường học hoặc làm nền tảng phát triển thêm.

Tính năng chính
----------------
- Quản lý người dùng (giáo viên, học sinh, quản trị)
- Quản lý môn học, chương, câu hỏi và câu trả lời
- Tạo và quản lý đề thi, chi tiết đề thi
- Làm bài thi trực tuyến và tính điểm tự động
- Thống kê kết quả và báo cáo

Cấu trúc thư mục chính
----------------------
- `mvc/` : controllers và views của ứng dụng
- `core/` : lớp nền tảng (App, Controller, DB, Autoload...)
- `models/` : các model tương tác DB
- `public/` : tài nguyên tĩnh (CSS, JS, images)
- `database/` : file SQL mẫu và ERD
- `tests/`, `container/` : unit test và test mẫu

Yêu cầu hệ thống
-----------------
- Windows (hoặc Linux) với XAMPP (Apache + MySQL) hoặc môi trường LAMP tương đương
- PHP 7.2+ (hoặc phiên bản tương thích dự án)
- Composer (dependency manager cho PHP)
- MySQL / MariaDB

Hướng dẫn cài đặt (Windows + XAMPP)
-----------------------------------
1. Tải mã nguồn
   - Clone repo hoặc giải nén vào thư mục `C:/xampp/htdocs/`.
   - Ví dụ vị trí khi copy: `C:\xampp\htdocs\Quanlythitracnghiem`

2. Cài đặt phụ thuộc PHP
   - Mở `cmd.exe`, chuyển đến thư mục gốc dự án:

     `cd C:\xampp\htdocs\Quanlythitracnghiem`

   - Chạy:

     `composer install`

   - Lưu ý: Nếu chưa cài Composer, tải từ https://getcomposer.org/ và cài vào hệ thống.

3. Tạo cơ sở dữ liệu
   - Mở `phpMyAdmin` (http://localhost/phpmyadmin) hoặc dùng dòng lệnh MySQL.
   - Tạo database mới, ví dụ `tracnghiemonline`.
   - Import file SQL mẫu:

     - Bằng phpMyAdmin: chọn database → Import → tải lên `database/tracnghiemonline.sql`.
     - Hoặc dùng lệnh trong `cmd` (nếu thêm vào PATH cho MySQL):

       `mysql -u root -p tracnghiemonline < "C:\xampp\htdocs\Quanlythitracnghiem\database\tracnghiemonline.sql"`

   - File ERD nằm tại `database/erd.mdj` (dành cho MySQL Workbench / tools tương thích).

4. Cấu hình kết nối
   - Mở file `config.php` ở thư mục gốc dự án.
   - Cập nhật thông tin kết nối database (host, tên db, user, password) cho phù hợp với môi trường của bạn.

5. Bật Apache & MySQL
   - Mở XAMPP Control Panel → Start `Apache` và `MySQL`.

6. Truy cập ứng dụng
   - Mở trình duyệt và truy cập địa chỉ (tùy theo chỗ bạn đặt project):

     `http://localhost/Quanlythitracnghiem`

   - Hoặc nếu bạn đặt trực tiếp vào `htdocs` với tên thư mục `Quanlythitracnghiem`, dùng:

     `http://localhost/Quanlythitracnghiem`

7. Chạy kiểm thử (nếu cần)
   - Nếu bạn muốn chạy unit test, từ thư mục gốc dự án chạy:

     `vendor\bin\phpunit --configuration phpunit.xml`

   - Trên một số môi trường Windows, bạn có thể cần gọi:

     `vendor\phpunit\phpunit\phpunit --configuration phpunit.xml`

Lưu ý & Khắc phục sự cố
------------------------
- Nếu `composer install` báo lỗi, kiểm tra phiên bản PHP và các extension (pdo_mysql, mbstring, openssl).
- Nếu không truy cập được trang, kiểm tra cấu hình `config.php` và đảm bảo Apache đang chạy và port không bị chiếm.
- Kiểm tra quyền đọc/ghi trên thư mục `public/` và thư mục lưu tạm nếu có.

Gợi ý cho bước tiếp theo
-------------------------
- Cập nhật `config.php` với thông tin DB thực tế.
- Import SQL và mở trang để kiểm tra.
- Muốn tôi tự động chạy kiểm thử hoặc kiểm tra cấu hình `config.php` giúp không? (Tôi có thể mở file và gợi ý các thay đổi cần thiết.)

Liên hệ
-------
Nếu cần trợ giúp thêm, cho biết vấn đề gặp phải (log lỗi, ảnh chụp màn hình, nội dung `config.php` — nếu bạn muốn tôi xem, hãy chia sẻ) để tôi hỗ trợ tiếp.

---
Project được soạn bằng tiếng Việt để thuận tiện cho người dùng trong nước.
