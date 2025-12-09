<?php

class User extends Controller
{
    public $NguoiDungModel;

    public function __construct()
    {
        $this->NguoiDungModel = $this->model("NguoiDungModel");
        parent::__construct();
        require_once "./mvc/core/Pagination.php";
    }

    public function default()
    {
        if (AuthCore::checkPermission("nguoidung", "view")) {
            $this->view("main_layout", [
                "Page" => "user",
                "Title" => "Quản lý người dùng",
                "Script" => "user",
                "Plugin" => [
                    "sweetalert2" => 1,
                    "datepicker" => 1,
                    "flatpickr" => 1,
                    "notify" => 1,
                    "jquery-validate" => 1,
                    "select" => 1,
                    "pagination" => [],
                ],
                "Roles" => $this->NguoiDungModel->getAllRoles(),
            ]);
        } else {
            $this->view("single_layout", ["Page" => "error/page_403", "Title" => "Lỗi !"]);
        }
    }

    public function add()
    {
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $id = $_POST['masinhvien'] ?? '';
            $email = $_POST['email'] ?? '';
            $hoten = $_POST['hoten'] ?? '';
            $ngaysinh = $_POST['ngaysinh'] ?? '1990-01-01';
            $gioitinh = $_POST['gioitinh'] ?? null;
            $sodienthoai = $_POST['sodienthoai'] ?? null;
            $password = $_POST['password'] ?? '';
            $nhomquyen = $_POST['role'] ?? 1; // Mặc định là 1
            $trangthai = $_POST['status'] ?? 1; // Mặc định là 1

            // Kiểm tra dữ liệu đầu vào
            if (empty($id) || empty($email) || empty($hoten) || empty($password)) {
                echo json_encode(['status' => 'error', 'message' => 'Vui lòng điền đầy đủ thông tin']);
                return;
            }

            // Kiểm tra định dạng email
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(['status' => 'error', 'message' => 'Email không hợp lệ']);
                return;
            }

            // Kiểm tra độ dài mật khẩu
            if (strlen($password) < 6) {
                echo json_encode(['status' => 'error', 'message' => 'Mật khẩu phải có ít nhất 6 ký tự']);
                return;
            }

            // Kiểm tra email hoặc mã sinh viên đã tồn tại
            if ($this->NguoiDungModel->getByEmail($email)) {
                echo json_encode(['status' => 'error', 'message' => 'Email đã được sử dụng']);
                return;
            }
            if ($this->NguoiDungModel->getById($id)) {
                echo json_encode(['status' => 'error', 'message' => 'Mã sinh viên đã được sử dụng']);
                return;
            }

            $result = $this->NguoiDungModel->create($id, $email, $hoten, $gioitinh, $ngaysinh, $sodienthoai, $password);
            echo json_encode([
                'status' => $result ? 'success' : 'error',
                'message' => $result ? 'Thêm người dùng thành công' : 'Thêm người dùng thất bại'
            ]);
        }
    }

    public function checkUser()
    {
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $id = $_POST['mssv'] ?? '';
            $email = $_POST['email'] ?? '';
            $result = $this->NguoiDungModel->checkUser($id, $email);
            echo json_encode($result);
        }
    }

    public function getData()
    {
        $data = $this->NguoiDungModel->getAll();
        echo json_encode($data);
    }

    public function deleteData()
    {
        if (isset($_POST['id'])) {
            $id = $_POST['id'];
            $result = $this->NguoiDungModel->delete($id);
            echo json_encode([
                'status' => $result ? 'success' : 'error',
                'message' => $result ? 'Xóa người dùng thành công' : 'Xóa người dùng thất bại'
            ]);
        }
    }

    public function update()
    {
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $id = $_POST['id'] ?? '';
            $email = $_POST['email'] ?? '';
            $hoten = $_POST['hoten'] ?? '';
            $ngaysinh = $_POST['ngaysinh'] ?? '1990-01-01';
            $gioitinh = $_POST['gioitinh'] ?? null;
            $sodienthoai = $_POST['sodienthoai'] ?? null;
            $password = $_POST['password'] ?? '';
            $nhomquyen = $_POST['role'] ?? 1;
            $trangthai = $_POST['status'] ?? 1;

            // Kiểm tra dữ liệu đầu vào
            if (empty($id) || empty($email) || empty($hoten)) {
                echo json_encode(['status' => 'error', 'message' => 'Vui lòng điền đầy đủ thông tin']);
                return;
            }

            // Kiểm tra định dạng email
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(['status' => 'error', 'message' => 'Email không hợp lệ']);
                return;
            }

            // Kiểm tra email đã tồn tại (trừ người dùng hiện tại)
            $existingUser = $this->NguoiDungModel->getByEmail($email);
            if ($existingUser && $existingUser['id'] !== $id) {
                echo json_encode(['status' => 'error', 'message' => 'Email đã được sử dụng']);
                return;
            }

            $result = $this->NguoiDungModel->update($id, $email, $hoten, $gioitinh, $ngaysinh, $sodienthoai, $password, $trangthai, $nhomquyen);
            echo json_encode([
                'status' => $result ? 'success' : 'error',
                'message' => $result ? 'Cập nhật người dùng thành công' : 'Cập nhật người dùng thất bại'
            ]);
        }
    }
    public function setStatus()
    {
        if ($_SERVER["REQUEST_METHOD"] == "POST" && AuthCore::checkPermission("nguoidung", "update")) {
            $id = $_POST['id'] ?? '';
            $status = isset($_POST['status']) ? (int)$_POST['status'] : 0;
            $result = $this->NguoiDungModel->setStatus($id, $status);
            echo json_encode(['success' => $result]);
        } else {
            echo json_encode(['success' => false, 'message' => 'No permission or invalid request']);
        }
    }

    public function getDetail()
    {
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $result = $this->NguoiDungModel->getById($_POST['id']);
            echo json_encode($result);
        }
    }
   public function addExcel()
{
    if ($_SERVER["REQUEST_METHOD"] == "POST") {

        require_once 'vendor/autoload.php';

        $file = $_FILES["fileToUpload"];
        $inputFileName = $file["tmp_name"];
        $ext = strtolower(pathinfo($file["name"], PATHINFO_EXTENSION));

        // Chỉ cho phép Excel
        if (!in_array($ext, ['xls', 'xlsx'])) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Chỉ hỗ trợ file Excel (.xls, .xlsx)'
            ]);
            return;
        }
        try {
            // PHPExcel tự nhận dạng file
            $inputFileType = PHPExcel_IOFactory::identify($inputFileName);

            // Chặn nhận nhầm HTML
            if ($inputFileType === 'HTML') {
                throw new Exception("File upload không phải Excel hợp lệ");
            }

            $objReader = PHPExcel_IOFactory::createReader($inputFileType);
            $objPHPExcel = $objReader->load($inputFileName);

        } catch (Exception $e) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Không thể đọc file: ' . $e->getMessage()
            ]);
            return;
        }
        // --- Phần xử lý dữ liệu giữ nguyên ---
        $sheet = $objPHPExcel->setActiveSheetIndex(0);
        $Totalrow = $sheet->getHighestRow();
        $LastColumn = $sheet->getHighestColumn();
        $TotalCol = PHPExcel_Cell::columnIndexFromString($LastColumn);

        $data = [];
        for ($i = 3; $i <= $Totalrow; $i++) {
            $fullname = "";
            $email = "";
            $mssv = "";
            for ($j = 0; $j < $TotalCol; $j++) {
                if ($j == 1) $mssv = trim($sheet->getCellByColumnAndRow($j, $i)->getValue());
                if ($j == 2) $fullname .= trim($sheet->getCellByColumnAndRow($j, $i)->getValue());
                if ($j == 3) $fullname .= " " . trim($sheet->getCellByColumnAndRow($j, $i)->getValue());
                if ($j == 7) $email = trim($sheet->getCellByColumnAndRow($j, $i)->getValue());
            }

            if (empty($mssv) || empty($email) || empty($fullname)) continue;
            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) continue;

            $data[] = [
                'fullname' => trim($fullname),
                'email' => trim($email),
                'mssv' => trim($mssv),
                'nhomquyen' => 2,
                'trangthai' => 1
            ];
        }

        if (empty($data)) {
            echo json_encode([
                'status' => 'error',
                'message' => 'Không có dữ liệu hợp lệ trong file'
            ]);
            return;
        }

        echo json_encode([
            'status' => 'success',
            'data' => $data
        ]);
    }
}

    public function addFileExcel()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $listUser = json_decode($_POST['listuser'], true);
            $password = $_POST['password'] ?? '';
            if (empty($listUser) || empty($password)) {
                echo json_encode(['status' => 'error', 'message' => 'Dữ liệu hoặc mật khẩu không hợp lệ']);
                return;
            }
            $result = $this->NguoiDungModel->addFile($listUser, $password);
            echo json_encode([
                'status' => $result ? 'success' : 'error',
                'message' => $result ? 'Thêm người dùng từ file thành công' : 'Thêm người dùng từ file thất bại'
            ]);
        }
    }
    public function addFileExcelGroup()
    {
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $listUser = isset($_POST['listuser']) ? json_decode($_POST['listuser'], true) : [];
            $password = $_POST['password'] ?? '';
            $manhom = $_POST['group'] ?? '';

            // Kiểm tra dữ liệu đầu vào
            if (empty($listUser) || empty($password) || empty($manhom)) {
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Dữ liệu, mật khẩu hoặc nhóm không hợp lệ'
                ]);
                return;
            }

            // Gọi hàm addFileGroup để thêm người dùng
            $result = $this->NguoiDungModel->addFileGroup($listUser, $password, $manhom);

            // Xây dựng thông báo chi tiết
            $message = '';
            if (!empty($result['success'])) {
                $message .= 'Đã thêm ' . count($result['success']) . ' sinh viên thành công. ';
            }
            if (!empty($result['exists'])) {
                $message .= 'Sinh viên đã có trong nhóm: ' . implode(', ', $result['exists']) . '. ';
            }
            if (!empty($result['errors'])) {
                $message .= 'Lỗi: ' . implode(', ', $result['errors']);
                echo json_encode([
                    'status' => 'error',
                    'message' => trim($message)
                ]);
                return;
            }

            echo json_encode([
                'status' => 'success',
                'message' => trim($message) ?: 'Thêm người dùng thành công!'
            ]);
        } else {
            echo json_encode([
                'status' => 'error',
                'message' => 'Yêu cầu không hợp lệ'
            ]);
        }
    }


    public function getQuery($filter, $input, $args)
    {
        $query = $this->NguoiDungModel->getQuery($filter, $input, $args);
        return $query;
    }
}
