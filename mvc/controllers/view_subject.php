<?php

require_once "./mvc/core/AuthCore.php";

class view_subject extends Controller
{
    public $xemmonhocModel;
    public $chuongModel;

    public function __construct()
    {
        $this->xemmonhocModel = $this->model("XemMonHocModel");
        $this->chuongModel = $this->model("ChuongModel");
        require_once "./mvc/core/Pagination.php";
    }

    public function default()
    {
        if (AuthCore::checkPermission("xem_monhoc", "view")) {
            $this->view("main_layout", [
                "Page" => "view_subject",
                "Title" => "Quản lý môn học",
                "Script" => "view_subject",
                "Plugin" => [
                    "sweetalert2" => 1,
                    "jquery-validate" => 1,
                    "notify" => 1,
                    "pagination" => [],
                ]
            ]);
        } else {
            $this->view("single_layout", ["Page" => "error/page_403", "Title" => "Lỗi !"]);
        }
    }
    public function getSubjectAssignment()
    {
        $id = $_SESSION['user_id'];
        $data = $this->xemmonhocModel->getAllSubjectAssignment($id);
        echo json_encode($data);
    }

    public function getDetail()
    {
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $data = $this->xemmonhocModel->getById($_POST['mamon']);
            echo json_encode($data);
        }
        echo false;
    }

    //Chapter
    public function getAllChapter()
    {
        $result = $this->chuongModel->getAll($_POST['mamonhoc']);
        echo json_encode($result);
    }

    public function chapterDelete()
    {
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $result = $this->chuongModel->delete($_POST['machuong']);
            echo $result;
        }
    }

    public function addChapter()
    {
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $result = $this->chuongModel->insert($_POST['mamonhoc'], $_POST['tenchuong']);
            echo $result;
        }
    }

    public function updateChapter()
    {
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $result = $this->chuongModel->update($_POST['machuong'], $_POST['tenchuong']);
            echo $result;
        }
    }

    public function search()
    {
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $result = $this->xemmonhocModel->search($_POST['input']);
            echo json_encode($result);
        }
    }
    public function getQuery()
    {
        header('Content-Type: application/json; charset=utf-8');
        AuthCore::checkAuthentication();

        if ($_SERVER["REQUEST_METHOD"] === "POST" && AuthCore::checkPermission("hocphan", "view")) {
            $filter = $_POST['filter'] ?? [];
            $input = $_POST['input'] ?? '';

            $queryData = $this->xemmonhocModel->getQuery($filter, $input, []);

            $stmt = $this->xemmonhocModel->con->prepare($queryData['query']);
            if (!$stmt) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Lỗi chuẩn bị truy vấn.'
                ], JSON_UNESCAPED_UNICODE);
                return;
            }

            if (!empty($queryData['params'])) {
                $stmt->bind_param(...$queryData['params']);
            }

            $stmt->execute();
            $result = $stmt->get_result();

            $rows = [];
            while ($row = $result->fetch_assoc()) {
                $rows[] = $row;
            }

            $stmt->close();

            echo json_encode([
                'success' => true,
                'data' => $rows
            ], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Yêu cầu không hợp lệ hoặc không có quyền truy cập.'
            ], JSON_UNESCAPED_UNICODE);
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

            $namhoc_list = $this->xemmonhocModel->getNamHoc($manguoidung);

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

            $hocky_list = $this->xemmonhocModel->getHocKy($manguoidung, $manamhoc);

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


}
