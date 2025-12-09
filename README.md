# DoAnHP4_WEB-ontest-DHT 

**Mô tả**  
Website quản lý bài thi trực tuyến do **LianHarman** phát triển trong khuôn khổ đồ án học phần 4 ngành Công nghệ Thông tin từ đồ án 3 lên, Đại học Kỹ thuật Công nghệ Cần Thơ.  
Hỗ trợ tạo đề thi, làm bài, chấm điểm và thống kê kết quả.

---

## Chức năng chính

- **Quản lý đề thi**  
  - Tạo, chỉnh sửa và xóa đề thi  
  - Nhập câu hỏi dạng trắc nghiệm

- **Thi trực tuyến**  
  - Giao diện thân thiện, dễ sử dụng  
  - Tự động tính điểm và lưu kết quả

- **Quản lý tài khoản**  
  - Phân quyền Admin (giáo viên) và User (thí sinh)  
  - Đăng nhập/đăng ký đơn giản (nếu đã được cài đặt)

- **Thống kê kết quả**  
  - Hiển thị danh sách kết quả theo từng thí sinh  
  - Xuất dữ liệu để phục vụ báo cáo (nếu có tích hợp)

- **Hỗ trợ thêm định nghĩa role theo sở thích của admin và trao quyền hạn sử dụng nhất định tùy mục đích của admin**.

---

## Cấu trúc thư mục

- `container/`: Cấu hình hoặc cơ sở khởi tạo (nếu dùng Docker hoặc tương tự)  
- `database/`: File và migration cơ sở dữ liệu (`tracnghiemonline.sql`)  
- `img/`: Tập tin hình ảnh sử dụng trong trang web  
- `mvc/`: Các lớp controller, model, view triển khai kiến trúc MVC  
- `public/`: Tài nguyên truy cập công khai như JS, CSS, hình ảnh  
- `tests/`: Các bộ kiểm thử (nếu có)  
- `vendor/`: Thư viện do Composer quản lý  

---

## Hướng dẫn cài đặt

1. **Clone repository**:
   ```bash
   git clone https://github.com/LienThuan9697/DoAnHP3_WEB-ontest-DHT.git

2. **Setup database**:
- Tìm file `tracnghiemonline.sql` trong thư mục `database` rồi dán vào mysql của xampp rồi chạy.
- Sau khi đã có database ta tiến hành đem thư mục này vào thư mục htdoc của xampp rồi khởi động xampp là đã có dự án.
