<?php

class MonHocModel extends DB
{
    public function create($mamon, $tenmon, $sotinchi, $sotietlythuyet, $sotietthuchanh)
    {
        if (!isset($_SESSION['user_id'])) {
            return false;
        }

        // Kiểm tra xem môn học đã tồn tại chưa
        $check_sql = "SELECT * FROM monhoc WHERE mamonhoc = ?";
        $stmt_check = mysqli_prepare($this->con, $check_sql);
        mysqli_stmt_bind_param($stmt_check, "s", $mamon);
        mysqli_stmt_execute($stmt_check);
        mysqli_stmt_store_result($stmt_check);

        if (mysqli_stmt_num_rows($stmt_check) > 0) {
            mysqli_stmt_close($stmt_check);
            return "exist";
        }
        mysqli_stmt_close($stmt_check);

        // Bắt đầu transaction
        mysqli_begin_transaction($this->con);

        try {
            $sql_monhoc = "INSERT INTO `monhoc` (`mamonhoc`, `tenmonhoc`, `sotinchi`, `sotietlythuyet`, `sotietthuchanh`, `trangthai`) 
                       VALUES (?, ?, ?, ?, ?, 1)";
            $stmt_monhoc = mysqli_prepare($this->con, $sql_monhoc);
            if (!$stmt_monhoc) {
                throw new Exception('Lỗi chuẩn bị truy vấn môn học: ' . mysqli_error($this->con));
            }

            mysqli_stmt_bind_param($stmt_monhoc, "ssiii", $mamon, $tenmon, $sotinchi, $sotietlythuyet, $sotietthuchanh);
            $result_monhoc = mysqli_stmt_execute($stmt_monhoc);
            mysqli_stmt_close($stmt_monhoc);

            if (!$result_monhoc) {
                throw new Exception('Lỗi chèn môn học: ' . mysqli_error($this->con));
            }

            mysqli_commit($this->con);
            return true;
        } catch (Exception $e) {
            mysqli_rollback($this->con);
            error_log("Lỗi tạo môn học: " . $e->getMessage());
            return false;
        }
    }

    public function update($id, $mamon, $tenmon, $sotinchi, $sotietlythuyet, $sotietthuchanh)
    {
        $valid = true;
        $sql = "UPDATE `monhoc` SET `mamonhoc`='$mamon',`tenmonhoc`='$tenmon',`sotinchi`='$sotinchi',`sotietlythuyet`='$sotietlythuyet',`sotietthuchanh`='$sotietthuchanh' WHERE `mamonhoc`='$id'";
        $result = mysqli_query($this->con, $sql);
        if (!$result) {
            $valid = false;
        }
        return $valid;
    }

    public function delete($mamon)
    {
        mysqli_begin_transaction($this->con);
        try {
        //     // 1. Kiểm tra bảng cauhoi
        //     $sql_check_cauhoi = "SELECT COUNT(*) as count FROM `cauhoi` WHERE `mamonhoc` = ?";
        //     $stmt = mysqli_prepare($this->con, $sql_check_cauhoi);
        //     mysqli_stmt_bind_param($stmt, "s", $mamon);
        //     mysqli_stmt_execute($stmt);
        //     $result = mysqli_stmt_get_result($stmt);
        //     $count_cauhoi = mysqli_fetch_assoc($result)['count'];
        //     mysqli_stmt_close($stmt);
        //     if ($count_cauhoi > 0) {
        //         throw new Exception("Không thể xóa môn học vì vẫn còn câu hỏi liên quan.");
        //     }

        //     // 2. Kiểm tra bảng chuong
        //     $sql_check_chuong = "SELECT COUNT(*) as count FROM `chuong` WHERE `mamonhoc` = ?";
        //     $stmt = mysqli_prepare($this->con, $sql_check_chuong);
        //     mysqli_stmt_bind_param($stmt, "s", $mamon);
        //     mysqli_stmt_execute($stmt);
        //     $result = mysqli_stmt_get_result($stmt);
        //     $count_chuong = mysqli_fetch_assoc($result)['count'];
        //     mysqli_stmt_close($stmt);
        //     if ($count_chuong > 0) {
        //         throw new Exception("Không thể xóa môn học vì vẫn còn chương liên quan.");
        //     }

        //     // 3. Kiểm tra bảng dethi
        //     $sql_check_dethi = "SELECT COUNT(*) as count FROM `dethi` WHERE `monthi` = ? AND `trangthai` = 1";
        //     $stmt = mysqli_prepare($this->con, $sql_check_dethi);
        //     mysqli_stmt_bind_param($stmt, "s", $mamon);
        //     mysqli_stmt_execute($stmt);
        //     $result = mysqli_stmt_get_result($stmt);
        //     $count_dethi = mysqli_fetch_assoc($result)['count'];
        //     mysqli_stmt_close($stmt);
        //     if ($count_dethi > 0) {
        //         throw new Exception("Không thể xóa môn học vì vẫn còn đề thi đang hoạt động liên quan.");
        //     }

        //     // 4. Kiểm tra bảng nhom
        //     $sql_check_nhom = "SELECT COUNT(*) as count FROM `nhom` WHERE `mamonhoc` = ? AND `trangthai` = 1";
        //     $stmt = mysqli_prepare($this->con, $sql_check_nhom);
        //     mysqli_stmt_bind_param($stmt, "s", $mamon);
        //     mysqli_stmt_execute($stmt);
        //     $result = mysqli_stmt_get_result($stmt);
        //     $count_nhom = mysqli_fetch_assoc($result)['count'];
        //     mysqli_stmt_close($stmt);
        //     if ($count_nhom > 0) {
        //         throw new Exception("Không thể xóa môn học vì vẫn còn nhóm học phần đang hoạt động liên quan.");
        //     }

        //     // 5. Kiểm tra bảng phancong
        //     $sql_check_phancong = "SELECT COUNT(*) as count FROM `phancong` WHERE `mamonhoc` = ?";
        //     $stmt = mysqli_prepare($this->con, $sql_check_phancong);
        //     mysqli_stmt_bind_param($stmt, "s", $mamon);
        //     mysqli_stmt_execute($stmt);
        //     $result = mysqli_stmt_get_result($stmt);
        //     $count_phancong = mysqli_fetch_assoc($result)['count'];
        //     mysqli_stmt_close($stmt);

        //     // Nếu có phân công, thì xóa trước
        //     if ($count_phancong > 0) {
        //         $sql_delete_phancong = "DELETE FROM `phancong` WHERE `mamonhoc` = ?";
        //         $stmt = mysqli_prepare($this->con, $sql_delete_phancong);
        //         mysqli_stmt_bind_param($stmt, "s", $mamon);
        //         mysqli_stmt_execute($stmt);
        //         mysqli_stmt_close($stmt);
        //     }

            // 6. Xóa môn học
            $sql_monhoc = "UPDATE `monhoc` SET `trangthai`='0' WHERE `mamonhoc` = ?";
            $stmt = mysqli_prepare($this->con, $sql_monhoc);
            if (!$stmt) {
                throw new Exception("Lỗi chuẩn bị truy vấn xóa môn học: " . mysqli_error($this->con));
            }
            mysqli_stmt_bind_param($stmt, "s", $mamon);
            $result = mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);

            if (!$result) {
                throw new Exception("Lỗi xóa môn học: " . mysqli_error($this->con));
            }

            mysqli_commit($this->con);
            return true;
        } catch (Exception $e) {
            mysqli_rollback($this->con);
            error_log("Lỗi xóa môn học: " . $e->getMessage());
            return $e->getMessage();
        }
    }


    public function getAll()
    {
        $sql = "SELECT * FROM `monhoc` WHERE `trangthai` = 1";
        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function getById($id)
    {
        $sql = "SELECT * FROM `monhoc` WHERE `mamonhoc` = '$id'";
        $result = mysqli_query($this->con, $sql);
        return mysqli_fetch_assoc($result);
    }

    public function search($input)
    {
        $sql = "SELECT * FROM `monhoc` WHERE `mamonhoc` LIKE '%$input%' OR `tenmonhoc` LIKE N'%$input%';";
        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function getAllSubjectAssignment($userid)
    {
        $sql = "SELECT DISTINCT monhoc.*
        FROM phancong
        JOIN monhoc ON monhoc.mamonhoc = phancong.mamonhoc
        WHERE phancong.manguoidung = '$userid'
          AND monhoc.trangthai = 1";

        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function getQuery($filter, $input, $args)
    {
        $query = "SELECT * FROM `monhoc`";
        $params = array();

        if ($input) {
            $query .= " AND (`monhoc`.`tenmonhoc` LIKE ? OR `monhoc`.`mamonhoc` LIKE ?)";
            $params = array('ss', "%$input%", "%$input%");
        }

        if (isset($filter)) {
            if (isset($filter['mamonhoc'])) {
                $query .= " AND `monhoc`.`mamonhoc` = ?";
                $params[0] = isset($params[0]) ? $params[0] . 's' : 's';
                $params[] = $filter['mamonhoc'];
            }
            if (isset($filter['tenmonhoc'])) {
                $query .= " AND `monhoc`.`tenmonhoc` LIKE ?";
                $params[0] = isset($params[0]) ? $params[0] . 's' : 's';
                $params[] = "%{$filter['tenmonhoc']}%";
            }
        }

        $query .= " ORDER BY `mamonhoc` ASC";

        return ['query' => $query, 'params' => $params];
    }
    public function checkSubject($mamon)
    {
        $sql = "SELECT * FROM `monhoc` WHERE `mamonhoc` = $mamon";
        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }
}
