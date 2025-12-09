<?php

class PhanCongModel extends DB
{
    public function getGiangVien()
    {
        $sql = "SELECT ng.id, ng.manhomquyen, ng.hoten 
            FROM nguoidung ng 
            WHERE EXISTS (
                SELECT 1 
                FROM chitietquyen ctq 
                WHERE ctq.manhomquyen = ng.manhomquyen 
                  AND ctq.chucnang IN ('cauhoi', 'monhoc', 'hocphan', 'chuong')
            )
            AND ng.manhomquyen != 3 
            GROUP BY ng.id";

        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function getMonHoc()
    {
        $sql = "SELECT * FROM `monhoc`";
        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }
    public function getNamHoc()
    {
        $sql = "SELECT manamhoc, tennamhoc FROM namhoc ORDER BY tennamhoc DESC";
        $result = mysqli_query($this->con, $sql);
        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function getHocKy($manamhoc)
    {
        $sql = "SELECT mahocky, tenhocky FROM hocky WHERE manamhoc = '$manamhoc'";
        $result = mysqli_query($this->con, $sql);
        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    // Kiểm tra trùng phân công (bao gồm năm + kỳ)
    public function isAssignmentExist($giangvien, $mamonhoc, $namhoc, $hocky)
    {
        $sql = "SELECT COUNT(*) as count FROM phancong 
            WHERE manguoidung = ? AND mamonhoc = ? AND namhoc = ? AND hocky = ? AND trangthai = 1";

        $stmt = mysqli_prepare($this->con, $sql);
        if (!$stmt) {
            error_log("Prepare failed: " . mysqli_error($this->con));
            return true; // tránh insert nhầm
        }

        // Bind param: ssii -> gv, mh, nam, hk
        mysqli_stmt_bind_param($stmt, "ssii", $giangvien, $mamonhoc, $namhoc, $hocky);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_bind_result($stmt, $count);
        mysqli_stmt_fetch($stmt);
        mysqli_stmt_close($stmt);

        return $count > 0;
    }


    // Cập nhật addAssignment
    public function addAssignment($giangvien, $listSubject, $namhoc, $hocky)
    {
        if (is_string($listSubject)) {
            $listSubject = json_decode($listSubject, true);
        }

        $success = true;
        $added = [];
        $errors = []; // lưu lỗi từng môn

        foreach ($listSubject as $mamonhoc) {

            // Kiểm tra trùng
            if ($this->isAssignmentExist($giangvien, $mamonhoc, $namhoc, $hocky)) {
                $errors[$mamonhoc] = "Đã tồn tại phân công";
                continue;
            }

            $sql = "INSERT INTO phancong (mamonhoc, manguoidung, namhoc, hocky) VALUES (?, ?, ?, ?)";
            $stmt = mysqli_prepare($this->con, $sql);
            if (!$stmt) {
                $errors[$mamonhoc] = "Prepare failed: " . mysqli_error($this->con);
                $success = false;
                continue;
            }

            mysqli_stmt_bind_param($stmt, "ssii", $mamonhoc, $giangvien, $namhoc, $hocky);
            $exec = mysqli_stmt_execute($stmt);
            if (!$exec) {
                $errors[$mamonhoc] = "Execute failed: " . mysqli_stmt_error($stmt);
                $success = false;
            } else {
                $added[] = $mamonhoc;
            }
            mysqli_stmt_close($stmt);
        }

        return [
            'success' => $success && count($added) > 0,
            'added' => $added,
            'message' => count($added) > 0 ? 'Thêm thành công ' . count($added) . ' môn!' : 'Không có môn nào được thêm!',
            'errors' => $errors // in ra chi tiết lý do thất bại
        ];
    }




    public function getAssignment()
    {
        $sql = "SELECT pc.mamonhoc, pc.manguoidung, pc.namhoc, pc.hocky, 
                   ng.hoten, mh.tenmonhoc, nh.tennamhoc, hk.tenhocky
            FROM phancong pc
            JOIN monhoc mh ON pc.mamonhoc = mh.mamonhoc
            JOIN nguoidung ng ON pc.manguoidung = ng.id
            LEFT JOIN namhoc nh ON pc.namhoc = nh.manamhoc
            LEFT JOIN hocky hk ON pc.hocky = hk.mahocky
            WHERE pc.trangthai = 1";

        $result = mysqli_query($this->con, $sql);
        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }
    public function update($old_mamonhoc, $old_manguoidung, $old_namhoc, $old_hocky, $new_manguoidung)
    {
        $sql = "UPDATE phancong 
            SET manguoidung = ?
            WHERE mamonhoc = ? AND manguoidung = ? AND namhoc = ? AND hocky = ?";

        $stmt = mysqli_prepare($this->con, $sql);
        if (!$stmt) {
            return ['success' => false, 'error' => 'Prepare failed: ' . mysqli_error($this->con)];
        }

        mysqli_stmt_bind_param(
            $stmt,
            "ssiii",
            $new_manguoidung,
            $old_mamonhoc,
            $old_manguoidung,
            $old_namhoc,
            $old_hocky
        );

        $exec = mysqli_stmt_execute($stmt);
        if (!$exec) {
            $error = mysqli_stmt_error($stmt);
            mysqli_stmt_close($stmt);
            return ['success' => false, 'error' => $error];
        }

        $affected = mysqli_stmt_affected_rows($stmt);
        mysqli_stmt_close($stmt);

        if ($affected === 0) {
            return ['success' => false, 'error' => 'Không tìm thấy bản ghi để cập nhật hoặc dữ liệu giống hiện tại'];
        }

        return ['success' => true, 'error' => null];
    }
    public function delete($mamon, $id, $namhoc = null, $hocky = null)
    {
        $sql = "UPDATE phancong SET trangthai = 0 WHERE mamonhoc = ? AND manguoidung = ?";
        $types = "ss";
        $values = [$mamon, $id];

        if ($namhoc !== null && $namhoc !== '') {
            $sql .= " AND namhoc = ?";
            $types .= "i";
            $values[] = (int)$namhoc;
        }

        if ($hocky !== null && $hocky !== '') {
            $sql .= " AND hocky = ?";
            $types .= "i";
            $values[] = (int)$hocky;
        }

        $stmt = mysqli_prepare($this->con, $sql);
        if (!$stmt) {
            return false;
        }

        mysqli_stmt_bind_param($stmt, $types, ...$values);

        $result = mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);

        return $result;
    }

    public function deleteAll($id)
    {
        $sql = "DELETE FROM `phancong` WHERE manguoidung = '$id'";
        $result = mysqli_query($this->con, $sql);
        return $result;
    }
    public function getAssignmentByUser($user)
    {
        $sql = "SELECT pc.mamonhoc, pc.manguoidung, pc.namhoc, pc.hocky, 
                   ng.hoten, mh.tenmonhoc, nh.tennamhoc, hk.tenhocky
            FROM phancong pc
            JOIN monhoc mh ON pc.mamonhoc = mh.mamonhoc
            JOIN nguoidung ng ON pc.manguoidung = ng.id
            LEFT JOIN namhoc nh ON pc.namhoc = nh.manamhoc
            LEFT JOIN hocky hk ON pc.hocky = hk.mahocky
            WHERE pc.manguoidung = '$user' AND pc.trangthai = 1";

        $result = mysqli_query($this->con, $sql);
        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }
    public function getQuery($filter, $input, $args)
    {
        // Xử lý custom function (ví dụ: danh sách môn học cho modal)
        if (isset($args["custom"]["function"])) {
            $func = $args["custom"]["function"];
            switch ($func) {
                case "monhoc":
                    $query = "SELECT * FROM `monhoc` WHERE trangthai = 1";
                    if ($input) {
                        $query .= " AND (monhoc.tenmonhoc LIKE N'%{$input}%' OR monhoc.mamonhoc LIKE '%{$input}%')";
                    }
                    return $query;
                default:
                    break;
            }
        }

        // Truy vấn chính
        $query = "SELECT DISTINCT
        pc.mamonhoc, 
        pc.manguoidung, 
        pc.namhoc, 
        pc.hocky,
        ng.hoten, 
        mh.tenmonhoc, 
        nh.tennamhoc, 
        hk.tenhocky,
        pc.trangthai
    FROM phancong AS pc
    JOIN monhoc AS mh ON pc.mamonhoc = mh.mamonhoc
    JOIN nguoidung AS ng ON pc.manguoidung = ng.id
    LEFT JOIN namhoc AS nh ON pc.namhoc = nh.manamhoc
    LEFT JOIN hocky AS hk ON pc.hocky = hk.mahocky
    ";

        // Lọc theo năm học
        if (!empty($filter["namhoc"])) {
            $namhoc = intval($filter["namhoc"]);
            $query .= " AND pc.namhoc = {$namhoc}";
        }

        // Lọc theo học kỳ
        if (!empty($filter["hocky"])) {
            $hocky = intval($filter["hocky"]);
            $query .= " AND pc.hocky = {$hocky}";
        }

        // Tìm kiếm theo tên môn hoặc tên giảng viên
        if ($input) {
            $query .= " AND (mh.tenmonhoc LIKE N'%{$input}%' OR ng.hoten LIKE N'%{$input}%')";
        }

        return $query;
    }


}
