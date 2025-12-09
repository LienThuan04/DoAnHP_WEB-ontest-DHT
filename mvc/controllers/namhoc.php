<?php

class NamHoc extends Controller
{
    public $NamHocModel;

    public function __construct()
    {
        $this->NamHocModel = $this->model("NamHocModel");
        parent::__construct();
        require_once "./mvc/core/Pagination.php";
    }

    public function default()
    {
        if (AuthCore::checkPermission("namhoc", "view")) {
            $this->view("main_layout", [
                "Page" => "namhoc",
                "Title" => "Năm học - Học kỳ",
                "Script" => "namhoc",
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
    // Ví dụ trong controller
    public function getNamHoc()
    {
        $page = $_POST['page'] ?? 1;
        $limit = $_POST['limit'] ?? 10;
        $q = $_POST['q'] ?? '';

        $model = new NamHocModel();
        $result = $model->getNamHoc($page, $limit, $q);

        header('Content-Type: application/json');
        echo json_encode($result);
        exit;
    }


    public function addNamHoc()
    {
        AuthCore::checkAuthentication();
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $ten = trim($_POST['tennamhoc'] ?? '');
            $sohk = (int)($_POST['sohocky'] ?? 3);

            $result = $this->NamHocModel->addNamHoc($ten, $sohk);

            if (is_array($result)) {
                // trả về JSON để JS hiển thị thông báo
                echo json_encode($result);
            } else {
                echo json_encode(["success" => $result]);
            }
        }
    }

    public function updateNamHoc()
    {
        AuthCore::checkAuthentication();
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $id = (int)($_POST['manamhoc'] ?? 0);
            $ten = trim($_POST['tennamhoc'] ?? '');
            $tt = (int)($_POST['trangthai'] ?? 1);
            $sohocky = isset($_POST['sohocky']) ? (int)$_POST['sohocky'] : null;

            $result = $this->NamHocModel->updateNamHoc($id, $ten, $tt, $sohocky);

            if (is_array($result)) {
                echo json_encode($result);
            } else {
                echo json_encode(["success" => $result]);
            }
        }
    }


    public function deleteNamHoc()
    {
        AuthCore::checkAuthentication();
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $id = (int)($_POST['manamhoc'] ?? 0);
            $result = $this->NamHocModel->deleteNamHoc($id);
            echo json_encode(["success" => $result]);
        }
    }

    public function getHocKy()
    {
        AuthCore::checkAuthentication();
        if ($_SERVER["REQUEST_METHOD"] == "POST") {
            $id = (int)($_POST['manamhoc'] ?? 0);
            echo json_encode($this->NamHocModel->getHocKy($id));
        }
    }

    public function getQuery($filter, $input, $args)
    {
        AuthCore::checkAuthentication();
        return $this->NamHocModel->getQuery($filter, $input, $args);
    }
}
