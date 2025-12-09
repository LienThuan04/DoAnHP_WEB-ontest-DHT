<?php

require_once 'vendor/autoload.php';
require_once 'vendor/phpoffice/phpexcel/Classes/PHPExcel/IOFactory.php';

class Module extends Controller
{
    public $nhomModel;

    public function __construct()
    {
        $this->nhomModel = $this->model("NhomModel");
        parent::__construct();
        require_once "./mvc/core/Pagination.php";
    }

    public function default()
    {
        if (AuthCore::checkPermission("hocphan", "view")) {
            $this->view("main_layout", [
                "Page" => "module",
                "Title" => "Quản lý nhóm học phần",
                "Script" => "module",
                "Plugin" => [
                    "sweetalert2" => 1,
                    "select" => 1,
                    "jquery-validate" => 1,
                    "notify" => 1
                ]
            ]);
        } else {
            $this->view("single_layout", ["Page" => "error/page_403", "Title" => "Lỗi !"]);
        }
    }



    public function detail($manhom)
    {
        $chitietnhom = $this->nhomModel->getDetailGroup($manhom);
        if (AuthCore::checkPermission("hocphan", "view") && $_SESSION['user_id'] == $chitietnhom['giangvien']) {
            $this->view("main_layout", [
                "Page" => "class_detail",
                "Title" => "Quản lý nhóm",
                "Plugin" => [
                    "datepicker" => 1,
                    "flatpickr" => 1,
                    "sweetalert2" => 1,
                    "jquery-validate" => 1,
                    "notify" => 1,
                    "pagination" => [],
                ],
                "Script" => "class_detail",
                "Detail" => $chitietnhom
            ]);
        } else {
            $this->view("single_layout", ["Page" => "error/page_403", "Title" => "Lỗi !"]);
        }
    }

    public function loadData()
    {
        header('Content-Type: application/json; charset=utf-8');
        AuthCore::checkAuthentication();
        if ($_SERVER['REQUEST_METHOD'] == "POST") {
            $hienthi = $_POST['hienthi'] ?? 1;
            $user_id = $_SESSION['user_id'] ?? '';
            $result = $this->nhomModel->getBySubject($user_id, $hienthi);
            echo json_encode($result);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Phương thức không được hỗ trợ.'
            ]);
        }
    }

    public function add()
    {
        header('Content-Type: application/json; charset=utf-8');
        if ($_SERVER["REQUEST_METHOD"] == "POST" && AuthCore::checkPermission("hocphan", "create")) {
            $tennhom = $_POST['tennhom'] ?? '';
            $ghichu = $_POST['ghichu'] ?? '';
            $monhoc = $_POST['monhoc'] ?? '';
            $namhoc = $_POST['namhoc'] ?? '';
            $hocky = $_POST['hocky'] ?? '';
            $giangvien = $_SESSION['user_id'] ?? '';

            if (!$tennhom || !$monhoc || !$namhoc || !$hocky || !$giangvien) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Thiếu thông tin bắt buộc để thêm nhóm.'
                ]);
                return;
            }

            $result = $this->nhomModel->create($tennhom, $ghichu, $namhoc, $hocky, $giangvien, $monhoc);
            echo json_encode($result);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Yêu cầu không hợp lệ hoặc không có quyền.'
            ]);
        }
    }
    public function getNamHoc()
    {
        header('Content-Type: application/json; charset=utf-8');
        AuthCore::checkAuthentication();

        if ($_SERVER["REQUEST_METHOD"] === "POST" && AuthCore::checkPermission("hocphan", "view")) {
            $manguoidung = $_SESSION['user_id'] ?? '';

            if (empty($manguoidung)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Không xác định được người dùng.'
                ]);
                return;
            }

            $namhoc_list = $this->nhomModel->getNamHoc($manguoidung);

            echo json_encode([
                'success' => true,
                'data' => $namhoc_list
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Yêu cầu không hợp lệ hoặc không có quyền truy cập.'
            ], JSON_UNESCAPED_UNICODE);
        }
    }


    public function getHocKy()
    {
        header('Content-Type: application/json; charset=utf-8');
        AuthCore::checkAuthentication();

        if ($_SERVER["REQUEST_METHOD"] === "POST" && AuthCore::checkPermission("hocphan", "view")) {
            $manguoidung = $_SESSION['user_id'] ?? '';
            $manamhoc = $_POST['namhoc'] ?? '';

            if (empty($manguoidung) || empty($manamhoc)) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Thiếu thông tin người dùng hoặc năm học.'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            $hocky_list = $this->nhomModel->getHocKy($manguoidung, $manamhoc);

            echo json_encode([
                'success' => true,
                'data' => $hocky_list
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Yêu cầu không hợp lệ hoặc không có quyền truy cập.'
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    public function delete()
    {
        header('Content-Type: application/json; charset=utf-8');
        if ($_SERVER["REQUEST_METHOD"] == "POST" && AuthCore::checkPermission("hocphan", "delete")) {
            $manhom = $_POST['manhom'] ?? '';
            if (!$manhom) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Thiếu mã nhóm để xóa.'
                ]);
                return;
            }
            $result = $this->nhomModel->delete($manhom);
            echo json_encode($result);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Yêu cầu không hợp lệ hoặc không có quyền.'
            ]);
        }
    }

    public function update()
    {
        header('Content-Type: application/json; charset=utf-8');
        if ($_SERVER["REQUEST_METHOD"] == "POST" && AuthCore::checkPermission("hocphan", "update")) {
            $manhom = $_POST['manhom'] ?? '';
            $tennhom = $_POST['tennhom'] ?? '';
            $ghichu = $_POST['ghichu'] ?? '';
            $monhoc = $_POST['monhoc'] ?? '';
            $namhoc = $_POST['namhoc'] ?? '';
            $hocky = $_POST['hocky'] ?? '';

            if (!$manhom || !$tennhom || !$monhoc || !$namhoc || !$hocky) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Thiếu thông tin bắt buộc để cập nhật nhóm.'
                ]);
                return;
            }

            $result = $this->nhomModel->update($manhom, $tennhom, $ghichu, $namhoc, $hocky, $monhoc);
            echo json_encode($result);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Yêu cầu không hợp lệ hoặc không có quyền.'
            ]);
        }
    }

    public function hide()
    {
        header('Content-Type: application/json; charset=utf-8');
        if ($_SERVER["REQUEST_METHOD"] == "POST" && AuthCore::checkPermission("hocphan", "create")) {
            $manhom = $_POST['manhom'] ?? '';
            $giatri = $_POST['giatri'] ?? 0;
            if (!$manhom) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Thiếu mã nhóm để ẩn/hiện.'
                ]);
                return;
            }
            $result = $this->nhomModel->hide($manhom, $giatri);
            echo json_encode($result);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Yêu cầu không hợp lệ hoặc không có quyền.'
            ]);
        }
    }

    public function getDetail()
    {
        header('Content-Type: application/json; charset=utf-8');
        if ($_SERVER["REQUEST_METHOD"] == "POST" && AuthCore::checkPermission("hocphan", "create")) {
            $manhom = $_POST['manhom'] ?? '';
            if (!$manhom) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Thiếu mã nhóm để lấy chi tiết.'
                ]);
                return;
            }
            $result = $this->nhomModel->getById($manhom);
            echo json_encode([
                'success' => true,
                'data' => $result
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Yêu cầu không hợp lệ hoặc không có quyền.'
            ]);
        }
    }

    public function updateInvitedCode()
    {
        header('Content-Type: application/json; charset=utf-8');
        if ($_SERVER["REQUEST_METHOD"] == "POST" && AuthCore::checkPermission("hocphan", "create")) {
            $manhom = $_POST['manhom'] ?? '';
            if (!$manhom) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Thiếu mã nhóm để cập nhật mã mời.'
                ]);
                return;
            }
            $result = $this->nhomModel->updateInvitedCode($manhom);
            echo json_encode($result);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Yêu cầu không hợp lệ hoặc không có quyền.'
            ]);
        }
    }

    public function getInvitedCode()
    {
        if ($_SERVER["REQUEST_METHOD"] == "POST" && AuthCore::checkPermission("hocphan", "view")) {
            $manhom = $_POST['manhom'];
            $result = $this->nhomModel->getInvitedCode($manhom);
            echo $result['mamoi'];
        }
    }

    public function getSvList()
    {
        AuthCore::checkAuthentication();
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $manhom = $_POST['manhom'];
            $result = $this->nhomModel->getSvList($manhom);
            echo json_encode($result);
        }
    }



    public function addSV()
    {
        AuthCore::checkAuthentication();
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $manhom = $_POST['manhom'];
            $mssv = $_POST['mssv'];
            $hoten = $_POST['hoten'];
            $password = $_POST['password'];
            $result = $this->nhomModel->addSV($mssv, $hoten, $password);
            $joinGroup = $this->nhomModel->join($manhom, $mssv);
            echo $joinGroup;
        }
    }


    public function addStudentsByClassCode()
    {
        header('Content-Type: application/json; charset=utf-8');
        AuthCore::checkAuthentication();
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $manhom = $_POST['manhom'] ?? '';
            $malop = $_POST['malop'] ?? '';
            if (!$manhom || !$malop) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Thiếu mã nhóm hoặc mã lớp.'
                ]);
                return;
            }
            $result = $this->nhomModel->addStudentsByClassCode($malop, $manhom);
            echo json_encode($result);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Phương thức không được hỗ trợ.'
            ]);
        }
    }

    public function addSvGroup()
    {
        AuthCore::checkAuthentication();
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $manhom = $_POST['manhom'];
            $mssv = $_POST['mssv'];
            $joinGroup = $this->nhomModel->join($manhom, $mssv);
            echo($joinGroup);
        }
    }

    public function checkAcc()
    {
        AuthCore::checkAuthentication();
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $manhom = $_POST['manhom'];
            $mssv = $_POST['mssv'];
            $result = $this->nhomModel->checkAcc($mssv, $manhom);
            echo $result;
        }
    }


    public function exportExcelStudentS()
    {
        AuthCore::checkAuthentication();
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $manhom = $_POST['manhom'] ?? '';
            if (!$manhom) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Thiếu mã nhóm để xuất danh sách.'
                ]);
                return;
            }
            $result = $this->nhomModel->getStudentByGroup($manhom);
            $excel = new PHPExcel();
            $excel->setActiveSheetIndex(0);
            $excel->getActiveSheet()->setTitle("Danh sách kết quả");

            $excel->getActiveSheet()->getColumnDimension('A')->setWidth(15);
            $excel->getActiveSheet()->getColumnDimension('B')->setWidth(30);
            $excel->getActiveSheet()->getColumnDimension('C')->setWidth(30);
            $excel->getActiveSheet()->getColumnDimension('D')->setWidth(20);
            $excel->getActiveSheet()->getColumnDimension('E')->setWidth(20);
            $excel->getActiveSheet()->getColumnDimension('F')->setWidth(20);

            $phpColor = new PHPExcel_Style_Color();
            $phpColor->setRGB('FFFFFF');
            $excel->getActiveSheet()->getStyle('A1:F1')->getFont()->setBold(true);
            $excel->getActiveSheet()->getStyle('A1:F1')->getFont()->setColor($phpColor);
            $excel->getActiveSheet()->getStyle('A1:F1')->applyFromArray([
                'fill' => [
                    'type' => PHPExcel_Style_Fill::FILL_SOLID,
                    'color' => ['rgb' => '33FF33']
                ]
            ]);
            $excel->getActiveSheet()->getStyle('A1:F1')->getAlignment()->applyFromArray([
                'horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_CENTER,
            ]);

            $excel->getActiveSheet()->setCellValue('A1', 'MSSV');
            $excel->getActiveSheet()->setCellValue('B1', 'Họ và tên');
            $excel->getActiveSheet()->setCellValue('C1', 'Email');
            $excel->getActiveSheet()->setCellValue('D1', 'Ngày tham gia');
            $excel->getActiveSheet()->setCellValue('E1', 'Ngày Sinh');
            $excel->getActiveSheet()->setCellValue('F1', 'Giới tính');

            $numRow = 2;
            foreach ($result as $row) {
                $excel->getActiveSheet()->setCellValue('A' . $numRow, $row["id"]);
                $excel->getActiveSheet()->setCellValue('B' . $numRow, $row["hoten"]);
                $excel->getActiveSheet()->setCellValue('C' . $numRow, $row["email"]);
                $excel->getActiveSheet()->setCellValue('D' . $numRow, $row["ngaythamgia"]);
                $excel->getActiveSheet()->setCellValue('E' . $numRow, $row["ngaysinh"]);
                $excel->getActiveSheet()->setCellValue('F' . $numRow, $row["gioitinh"] == 0 ? "Nữ" : ($row["gioitinh"] == 1 ? "Nam" : "Null"));

                $excel->getActiveSheet()->getStyle("A" . $numRow . ":F" . $numRow)->getAlignment()->applyFromArray([
                    'horizontal' => PHPExcel_Style_Alignment::HORIZONTAL_CENTER,
                ]);
                $numRow++;
            }

            ob_start();
            $write = PHPExcel_IOFactory::createWriter($excel, 'Excel2007');
            $write->save('php://output');
            $xlsData = ob_get_contents();
            ob_end_clean();
            echo json_encode([
                'status' => true,
                'file' => "data:application/vnd.ms-excel;base64," . base64_encode($xlsData)
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Phương thức không được hỗ trợ.'
            ]);
        }
    }

    public function getGroupSize()
    {
        AuthCore::checkAuthentication();
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $manhom = $_POST['manhom'];
            $result = $this->nhomModel->getGroupSize($manhom);
            echo $result;
        }
    }
    public function checkDuplicate()
    {
        header('Content-Type: application/json; charset=utf-8');
        if ($_SERVER["REQUEST_METHOD"] === "POST" && AuthCore::checkPermission("hocphan", "create")) {
            $tennhom = $_POST['tennhom'] ?? '';
            $monhoc = $_POST['monhoc'] ?? '';
            $namhoc = $_POST['namhoc'] ?? '';
            $hocky = $_POST['hocky'] ?? '';
            $manhom = $_POST['manhom'] ?? null;

            if (!$tennhom || !$monhoc || !$namhoc || !$hocky) {
                echo json_encode([
                    'duplicate' => false,
                    'message' => 'Thiếu thông tin bắt buộc để kiểm tra trùng.'
                ]);
                return;
            }

            $giangvien = $_SESSION['user_id'] ?? '';
            $exclude = $manhom ? $manhom : null;

            $result = $this->nhomModel->checkDuplicateAjax($tennhom, $monhoc, $namhoc, $hocky, $giangvien, $exclude);
            echo json_encode($result);
            return;
        }

        error_log("checkDuplicate failed. Method: {$_SERVER['REQUEST_METHOD']}, user_id: " . ($_SESSION['user_id'] ?? 'null'));
        echo json_encode([
            'duplicate' => false,
            'message' => 'Yêu cầu không hợp lệ hoặc không có quyền.'
        ]);
    }




    public function kickUser()
    {
        header('Content-Type: application/json; charset=utf-8');
        AuthCore::checkAuthentication();
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $manhom = $_POST['manhom'] ?? '';
            $mssv = $_POST['manguoidung'] ?? '';
            if (!$manhom || !$mssv) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Thiếu mã nhóm hoặc mã sinh viên.'
                ]);
                return;
            }
            $result = $this->nhomModel->kickUser($manhom, $mssv);
            echo json_encode([
                'success' => $result,
                'message' => $result ? 'Xóa sinh viên khỏi nhóm thành công!' : 'Không thể xóa sinh viên khỏi nhóm.'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Phương thức không được hỗ trợ.'
            ]);
        }
    }
}
