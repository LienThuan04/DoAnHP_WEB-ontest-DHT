<?php

class Account extends Controller
{
    public $nguoidung;

    public function __construct()
    {
        $this->nguoidung = $this->model("NguoiDungModel");
        parent::__construct();
    }

    public function default()
    {
        AuthCore::checkAuthentication();
        $this->view("main_layout", [
            "Page" => "account_setting",
            "Title" => "Trang cá nhân",
            "User" => $this->nguoidung->getById($_SESSION['user_id']),
            "Plugin" => [
                "sweetalert2" => 1,
                "datepicker" => 1,
                "flatpickr" => 1,
                "jquery-validate" => 1,
                "notify" => 1,
            ],
            "Script" => "account_setting"
        ]);
    }

    public function changePassword()
    {
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            header('Content-Type: application/json; charset=utf8'); // Đảm bảo mã hóa UTF-8

            $matkhaucu = isset($_POST['matkhaucu']) ? trim($_POST['matkhaucu']) : '';
            $matkhaumoi = isset($_POST['matkhaumoi']) ? trim($_POST['matkhaumoi']) : '';
            $id = isset($_SESSION['user_id']) ? trim($_SESSION['user_id']) : '';

            if (empty($matkhaucu) || empty($matkhaumoi) || empty($id)) {
                echo json_encode([
                    "message" => "Vui lòng nhập đầy đủ thông tin.",
                    "valid" => false
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $valid = $this->nguoidung->checkPassword($id, $matkhaucu);
            if ($valid) {
                $new_password_hashed = password_hash($matkhaumoi, PASSWORD_BCRYPT);
                $result = $this->nguoidung->changePassword($id, $new_password_hashed);
                if ($result) {
                    echo json_encode([
                        "message" => "Thay đổi mật khẩu thành công!",
                        "valid" => true
                    ], JSON_UNESCAPED_UNICODE);
                } else {
                    echo json_encode([
                        "message" => "Lỗi khi cập nhật mật khẩu. Vui lòng thử lại.",
                        "valid" => false
                    ], JSON_UNESCAPED_UNICODE);
                }
            } else {
                echo json_encode([
                    "message" => "Mật khẩu hiện tại không đúng.",
                    "valid" => false
                ], JSON_UNESCAPED_UNICODE);
            }
        }
        exit;
    }

    public function changeProfile()
    {
        AuthCore::checkAuthentication();
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $email = $_POST['email'];
            $id = $_SESSION['user_id'];
            $hoten = $_POST['hoten'];
            $ngaysinh = $_POST['ngaysinh'];
            $gioitinh = $_POST['gioitinh'];
            if ($email == $_SESSION['user_email']) {
                $result = $this->nguoidung->updateProfile($hoten, $gioitinh, $ngaysinh, $email, $id);
                if ($result) {
                    echo json_encode(["message" => "Thay đổi hồ sơ thành công !", "valid" => true]);
                }
            } else {
                $check = $this->nguoidung->checkEmailExist($email);
                if ($check == 0) {
                    $result = $this->nguoidung->updateProfile($hoten, $gioitinh, $ngaysinh, $email, $id);
                    if ($result) {
                        echo json_encode(["message" => "Thay đổi hồ sơ thành công !", "valid" => true]);
                    }
                } else {
                    echo json_encode(["message" => "Địa chỉ email đã tồn tại !", "valid" => false]);
                }
            }
        }
    }

    public function checkAllow()
    {
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $id = $_SESSION['user_id'];
            $email = $_POST['email'];
            $result = $this->nguoidung->updateProfile($id, $email);
        }
    }

    public function uploadFile()
    {
        AuthCore::checkAuthentication();
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            if (isset($_FILES['file-img']['name'])) {
                $id = $_SESSION['user_id'];
                $imageName = $_FILES['file-img']['name'];
                $tmpName = $_FILES['file-img']['tmp_name'];
                $validImageExtension = ['jpg', 'jpeg', 'png'];
                $imageExtension = explode('.', $imageName);
                $name = $imageExtension[0];
                $imageExtension = strtolower(end($imageExtension));
                $result = $this->nguoidung->uploadFile($id, $tmpName, $imageExtension, $validImageExtension, $name);
                echo json_encode($result);
            }
        }
    }

    public function getRole()
    {
        AuthCore::checkAuthentication();
        if ($_SERVER["REQUEST_METHOD"] == "GET") {
            echo json_encode($_SESSION['user_role']);
        }
    }

    public function check()
    {
        echo "<pre>";
        print_r($_SESSION);
    }
}
