<?php

class NhomModel extends DB
{
    public function create($tennhom, $ghichu, $namhoc, $hocky, $giangvien, $mamonhoc)
    {
        // Kiểm tra trùng lặp
        if ($this->isDuplicate($tennhom, $mamonhoc, $namhoc, $hocky, $giangvien)) {
            return [
                'success' => false,
                'message' => 'Nhóm đã tồn tại với cùng tên, môn học, năm học, học kỳ và giảng viên.'
            ];
        }

        // Tạo mã mời
        $mamoi = substr(md5(mt_rand()), 0, 7);

        // Sử dụng prepared statement
        $sql = "INSERT INTO `nhom` (`tennhom`, `ghichu`, `mamoi`, `namhoc`, `hocky`, `giangvien`, `mamonhoc`) VALUES (?, ?, ?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($this->con, $sql);
        if (!$stmt) {
            return [
                'success' => false,
                'message' => 'Lỗi chuẩn bị câu lệnh SQL: ' . mysqli_error($this->con)
            ];
        }

        mysqli_stmt_bind_param($stmt, 'sssssss', $tennhom, $ghichu, $mamoi, $namhoc, $hocky, $giangvien, $mamonhoc);
        $result = mysqli_stmt_execute($stmt);

        if ($result) {
            mysqli_stmt_close($stmt);
            return [
                'success' => true,
                'message' => 'Thêm nhóm thành công!'
            ];
        } else {
            $error = mysqli_stmt_error($stmt);
            mysqli_stmt_close($stmt);
            return [
                'success' => false,
                'message' => 'Lỗi khi thêm nhóm: ' . $error
            ];
        }
    }
    public function checkDuplicateAjax($tennhom, $mamonhoc, $namhoc, $hocky, $giangvien, $excludeManhom = null)
    {
        $isDup = $this->isDuplicate($tennhom, $mamonhoc, $namhoc, $hocky, $giangvien, $excludeManhom);
        return [
            'duplicate' => $isDup,
            'message' => $isDup ? 'Đã trùng: tên nhóm, môn học, năm học và học kỳ.' : 'Không trùng.'
        ];
    }
    private function isDuplicate($tennhom, $mamonhoc, $namhoc, $hocky, $giangvien, $excludeManhom = null)
    {
        $sql = "SELECT manhom FROM nhom WHERE tennhom = ? AND mamonhoc = ? AND namhoc = ? AND hocky = ? AND giangvien = ? AND trangthai = 1";
        if ($excludeManhom !== null) {
            $sql .= " AND manhom != ?";
        }
        $stmt = mysqli_prepare($this->con, $sql);
        if ($excludeManhom !== null) {
            mysqli_stmt_bind_param($stmt, 'ssssss', $tennhom, $mamonhoc, $namhoc, $hocky, $giangvien, $excludeManhom);
        } else {
            mysqli_stmt_bind_param($stmt, 'sssss', $tennhom, $mamonhoc, $namhoc, $hocky, $giangvien);
        }
        mysqli_stmt_execute($stmt);
        mysqli_stmt_store_result($stmt);
        $count = mysqli_stmt_num_rows($stmt);
        mysqli_stmt_close($stmt);
        return $count > 0;
    }



    public function update($manhom, $tennhom, $ghichu, $namhoc, $hocky, $mamonhoc)
    {
        $group = $this->getById($manhom);
        $giangvien = $group['giangvien'] ?? '';

        // Kiểm tra trùng lặp
        if ($this->isDuplicate($tennhom, $mamonhoc, $namhoc, $hocky, $giangvien, $manhom)) {
            return [
                'success' => false,
                'message' => 'Nhóm đã tồn tại với cùng tên, môn học, năm học, học kỳ và giảng viên.'
            ];
        }

        // Sử dụng prepared statement
        $sql = "UPDATE `nhom` SET `tennhom`=?, `ghichu`=?, `namhoc`=?, `hocky`=?, `mamonhoc`=? WHERE `manhom`=?";
        $stmt = mysqli_prepare($this->con, $sql);
        if (!$stmt) {
            return [
                'success' => false,
                'message' => 'Lỗi chuẩn bị câu lệnh SQL: ' . mysqli_error($this->con)
            ];
        }

        mysqli_stmt_bind_param($stmt, 'ssssss', $tennhom, $ghichu, $namhoc, $hocky, $mamonhoc, $manhom);
        $result = mysqli_stmt_execute($stmt);

        if ($result) {
            mysqli_stmt_close($stmt);
            return [
                'success' => true,
                'message' => 'Cập nhật nhóm thành công!'
            ];
        } else {
            $error = mysqli_stmt_error($stmt);
            mysqli_stmt_close($stmt);
            return [
                'success' => false,
                'message' => 'Lỗi khi cập nhật nhóm: ' . $error
            ];
        }
    }



    public function delete($manhom)
    {
        mysqli_begin_transaction($this->con);
        try {
            // Kiểm tra bảng chitietnhom
            $sql_check_chitietnhom = "SELECT COUNT(*) as count FROM `chitietnhom` WHERE `manhom` = ?";
            $stmt_check_chitietnhom = mysqli_prepare($this->con, $sql_check_chitietnhom);
            if (!$stmt_check_chitietnhom) {
                throw new Exception("Lỗi chuẩn bị truy vấn kiểm tra chi tiết nhóm: " . mysqli_error($this->con));
            }
            mysqli_stmt_bind_param($stmt_check_chitietnhom, "s", $manhom);
            mysqli_stmt_execute($stmt_check_chitietnhom);
            $result_check_chitietnhom = mysqli_stmt_get_result($stmt_check_chitietnhom);
            $row_chitietnhom = mysqli_fetch_assoc($result_check_chitietnhom);
            mysqli_stmt_close($stmt_check_chitietnhom);
            if ($row_chitietnhom['count'] > 0) {
                throw new Exception("Không thể xóa nhóm vì vẫn còn {$row_chitietnhom['count']} thành viên trong nhóm.");
            }

            // Kiểm tra bảng chitietthongbao
            $sql_check_thongbao = "SELECT COUNT(*) as count FROM `chitietthongbao` WHERE `manhom` = ?";
            $stmt_check_thongbao = mysqli_prepare($this->con, $sql_check_thongbao);
            if (!$stmt_check_thongbao) {
                throw new Exception("Lỗi chuẩn bị truy vấn kiểm tra thông báo: " . mysqli_error($this->con));
            }
            mysqli_stmt_bind_param($stmt_check_thongbao, "s", $manhom);
            mysqli_stmt_execute($stmt_check_thongbao);
            $result_check_thongbao = mysqli_stmt_get_result($stmt_check_thongbao);
            $row_thongbao = mysqli_fetch_assoc($result_check_thongbao);
            mysqli_stmt_close($stmt_check_thongbao);
            if ($row_thongbao['count'] > 0) {
                throw new Exception("Không thể xóa nhóm vì vẫn còn {$row_thongbao['count']} thông báo liên quan.");
            }

            // Kiểm tra bảng giaodethi
            $sql_check_giaodethi = "SELECT COUNT(*) as count FROM `giaodethi` WHERE `manhom` = ?";
            $stmt_check_giaodethi = mysqli_prepare($this->con, $sql_check_giaodethi);
            if (!$stmt_check_giaodethi) {
                throw new Exception("Lỗi chuẩn bị truy vấn kiểm tra giao đề thi: " . mysqli_error($this->con));
            }
            mysqli_stmt_bind_param($stmt_check_giaodethi, "s", $manhom);
            mysqli_stmt_execute($stmt_check_giaodethi);
            $result_check_giaodethi = mysqli_stmt_get_result($stmt_check_giaodethi);
            $row_giaodethi = mysqli_fetch_assoc($result_check_giaodethi);
            mysqli_stmt_close($stmt_check_giaodethi);
            if ($row_giaodethi['count'] > 0) {
                throw new Exception("Không thể xóa nhóm vì vẫn còn {$row_giaodethi['count']} đề thi được giao.");
            }

            $sql = "DELETE FROM `nhom` WHERE `manhom` = ?";
            $stmt = mysqli_prepare($this->con, $sql);
            if (!$stmt) {
                throw new Exception("Lỗi chuẩn bị truy vấn cập nhật trạng thái nhóm: " . mysqli_error($this->con));
            }
            mysqli_stmt_bind_param($stmt, "s", $manhom);
            $success = mysqli_stmt_execute($stmt);
            $affected_rows = mysqli_stmt_affected_rows($stmt);
            mysqli_stmt_close($stmt);

            if ($success && $affected_rows > 0) {
                mysqli_commit($this->con);
                return [
                    'success' => true,
                    'message' => 'Xóa nhóm thành công!'
                ];
            } else {
                throw new Exception("Không tìm thấy nhóm hoặc không thể xóa.");
            }
        } catch (Exception $e) {
            mysqli_rollback($this->con);
            error_log("Lỗi xóa nhóm: " . $e->getMessage());
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    // Ẩn || Hiện nhóm
    public function hide($manhom, $giatri)
    {
        try {
            // Kiểm tra giá trị hợp lệ của giatri (0 hoặc 1)
            if (!in_array($giatri, ['0', '1'])) {
                return [
                    'success' => false,
                    'message' => 'Giá trị hiển thị không hợp lệ.'
                ];
            }

            $sql = "UPDATE `nhom` SET `hienthi` = ? WHERE `manhom` = ?";
            $stmt = mysqli_prepare($this->con, $sql);
            if (!$stmt) {
                error_log("Lỗi chuẩn bị truy vấn SQL trong hide: " . mysqli_error($this->con));
                return [
                    'success' => false,
                    'message' => 'Lỗi chuẩn bị truy vấn SQL.'
                ];
            }
            mysqli_stmt_bind_param($stmt, 'ss', $giatri, $manhom);
            $success = mysqli_stmt_execute($stmt);
            $affected_rows = mysqli_stmt_affected_rows($stmt);
            mysqli_stmt_close($stmt);

            if ($success && $affected_rows > 0) {
                return [
                    'success' => true,
                    'message' => $giatri == '1' ? 'Hiển thị nhóm thành công!' : 'Ẩn nhóm thành công!'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Không tìm thấy nhóm hoặc không thể cập nhật.'
                ];
            }
        } catch (Exception $e) {
            error_log("Lỗi ẩn/hiện nhóm: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Có lỗi xảy ra khi cập nhật trạng thái nhóm.'
            ];
        }
    }
    public function sv_hide($manhom, $masv, $giatri)
    {
        try {
            if (!in_array($giatri, ['0', '1'])) {
                return [
                    'success' => false,
                    'message' => 'Giá trị hiển thị không hợp lệ.'
                ];
            }

            $sql = "UPDATE `chitietnhom` SET `hienthi` = ? WHERE `manhom` = ? AND `manguoidung` = ?";
            $stmt = mysqli_prepare($this->con, $sql);
            if (!$stmt) {
                error_log("Lỗi chuẩn bị truy vấn SQL trong sv_hide: " . mysqli_error($this->con));
                return [
                    'success' => false,
                    'message' => 'Lỗi chuẩn bị truy vấn SQL.'
                ];
            }
            mysqli_stmt_bind_param($stmt, 'sss', $giatri, $manhom, $masv);
            $success = mysqli_stmt_execute($stmt);
            $affected_rows = mysqli_stmt_affected_rows($stmt);
            mysqli_stmt_close($stmt);

            if ($success && $affected_rows > 0) {
                return [
                    'success' => true,
                    'message' => $giatri == '1' ? 'Hiển thị sinh viên trong nhóm thành công!' : 'Ẩn sinh viên trong nhóm thành công!'
                ];
            } else {
                return [
                    'success' => false,
                    'message' => 'Không tìm thấy sinh viên trong nhóm hoặc không thể cập nhật.'
                ];
            }
        } catch (Exception $e) {
            error_log("Lỗi ẩn/hiện sinh viên trong nhóm: " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Có lỗi xảy ra khi cập nhật trạng thái sinh viên trong nhóm.'
            ];
        }
    }

    public function getById($manhom)
    {
        $sql = "SELECT * FROM `nhom` WHERE `manhom` = ?";
        $stmt = mysqli_prepare($this->con, $sql);
        mysqli_stmt_bind_param($stmt, 's', $manhom);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $row = mysqli_fetch_assoc($result);
        mysqli_stmt_close($stmt);
        return $row ? $row : [];
    }
    public function getNamHoc($manguoidung)
    {
        $rows = [];
        $sql = "
        SELECT DISTINCT nh.manamhoc, nh.tennamhoc
        FROM phancong pc
        INNER JOIN namhoc nh ON pc.namhoc = nh.manamhoc
        WHERE pc.manguoidung = ? and pc.trangthai = 1
        ORDER BY nh.tennamhoc DESC
    ";

        $stmt = $this->con->prepare($sql);
        if (!$stmt) {
            error_log("getNamHoc prepare failed: " . $this->con->error . " | SQL: $sql");
            return $rows;
        }

        $stmt->bind_param("s", $manguoidung);
        $stmt->execute();

        $result = $stmt->get_result();
        if ($result) {
            while ($r = $result->fetch_assoc()) {
                $rows[] = $r;
            }
        } else {
            $stmt->bind_result($manamhoc, $tennamhoc);
            while ($stmt->fetch()) {
                $rows[] = [
                    'manamhoc' => $manamhoc,
                    'tennamhoc' => $tennamhoc
                ];
            }
        }

        $stmt->close();
        return $rows;
    }

    public function getHocKy($manguoidung, $manamhoc)
    {
        $rows = [];

        $sql = "
        SELECT DISTINCT hk.mahocky, hk.tenhocky
        FROM phancong pc
        INNER JOIN hocky hk ON pc.hocky = hk.mahocky
        WHERE pc.manguoidung = ? AND pc.namhoc = ? AND pc.trangthai = 1
        ORDER BY hk.tenhocky ASC
    ";

        $stmt = $this->con->prepare($sql);
        if (!$stmt) {
            error_log("getHocKy prepare failed: " . $this->con->error . " | SQL: $sql");
            return $rows;
        }

        $stmt->bind_param("ss", $manguoidung, $manamhoc);
        $stmt->execute();

        $result = $stmt->get_result();
        if ($result) {
            while ($r = $result->fetch_assoc()) {
                $rows[] = $r;
            }
        } else {
            $stmt->bind_result($mahocky, $tenhocky);
            while ($stmt->fetch()) {
                $rows[] = [
                    'mahocky' => $mahocky,
                    'tenhocky' => $tenhocky
                ];
            }
        }

        $stmt->close();
        return $rows;
    }


    public function getBySubject($nguoitao, $hienthi)
    {
        $sht = $hienthi == 2 ? "" : "AND nhom.hienthi = $hienthi";

        $sql = "SELECT 
                monhoc.mamonhoc, 
                monhoc.tenmonhoc, 
                namhoc.manamhoc AS manamhoc,
                namhoc.tennamhoc,
                hocky.mahocky,
                hocky.tenhocky,
                hocky.sohocky,

                nhom.manhom, 
                nhom.tennhom, 
                nhom.ghichu, 
                nhom.siso, 
                nhom.hienthi
            FROM nhom
            JOIN monhoc ON nhom.mamonhoc = monhoc.mamonhoc
            JOIN hocky ON nhom.hocky = hocky.mahocky
            JOIN namhoc ON hocky.manamhoc = namhoc.manamhoc
            WHERE nhom.giangvien = '$nguoitao' 
              AND nhom.trangthai = 1 
              ";

        $result = mysqli_query($this->con, $sql);
        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }

        // Gom nhóm theo môn + năm học + học kỳ
        $newArray = [];
        foreach ($rows as $item) {
            $foundIndex = -1;
            foreach ($newArray as $key => $newItem) {
                if (
                    $newItem["mamonhoc"] == $item["mamonhoc"]
                    && $newItem["manamhoc"] == $item["manamhoc"]
                    && $newItem["mahocky"] == $item["mahocky"]
                ) {
                    $foundIndex = $key;
                    break;
                }
            }

            $detail_group = [
                "manhom" => $item["manhom"],
                "tennhom" => $item["tennhom"],
                "ghichu" => $item["ghichu"],
                "siso" => $item["siso"],
                "hienthi" => $item["hienthi"]
            ];

            if ($foundIndex == -1) {
                $newArray[] = [
                    "mamonhoc"   => $item["mamonhoc"],
                    "tenmonhoc"  => $item["tenmonhoc"],
                    "manamhoc"   => $item["manamhoc"],
                    "tennamhoc"  => $item["tennamhoc"],
                    "mahocky"    => $item["mahocky"],
                    "tenhocky"   => $item["tenhocky"],
                    "sohocky"    => $item["sohocky"],
                    "nhom"       => [$detail_group],
                ];
            } else {
                $newArray[$foundIndex]['nhom'][] = $detail_group;
            }
        }

        return $newArray;
    }


    public function updateInvitedCode($manhom)
    {
        $valid = true;
        do {
            $mamoi = substr(md5(mt_rand()), 0, 7);
            $check = $this->getIdFromInvitedCode($mamoi);
        } while ($check != null);
        $sql = "UPDATE `nhom` SET `mamoi`='$mamoi' WHERE `manhom` = '$manhom'";
        $result = mysqli_query($this->con, $sql);
        if (!$result) {
            $valid = false;
        }
        return $valid;
    }

    public function getInvitedCode($manhom)
    {
        $sql = "SELECT mamoi FROM nhom WHERE manhom = '$manhom'";
        $result = mysqli_query($this->con, $sql);
        return mysqli_fetch_assoc($result);
    }

    public function getIdFromInvitedCode($mamoi)
    {
        $sql = "SELECT `manhom` FROM `nhom` WHERE `mamoi` = '$mamoi'";
        $result = mysqli_query($this->con, $sql);
        return mysqli_fetch_assoc($result);
    }

    // Thêm sinh viên vào nhóm
    public function join($manhom, $manguoidung)
    {
        $valid = true;
        $manhom = mysqli_real_escape_string($this->con, $manhom);
        $manguoidung = mysqli_real_escape_string($this->con, $manguoidung);
        $checkSql = "SELECT * FROM `chitietnhom` WHERE `manhom` = '$manhom' AND `manguoidung` = '$manguoidung'";
        $checkResult = mysqli_query($this->con, $checkSql);

        if (mysqli_num_rows($checkResult) == 0) {
            $insertSql = "INSERT INTO `chitietnhom` (`manhom`, `manguoidung`, `hienthi`) VALUES ('$manhom', '$manguoidung', 1)";
            $insertResult = mysqli_query($this->con, $insertSql);

            if (!$insertResult) {
                $valid = false;
            } else {
                $this->updateSiso($manhom);
            }
        } else {
            $valid = false;
        }
        return $valid;
    }


    public function SVDelete($manhom, $manguoidung)
    {
        $valid = true;
        $sql = "DELETE FROM `chitietnhom` WHERE `manhom` = '$manhom' AND `manguoidung` = '$manguoidung'";
        $result = mysqli_query($this->con, $sql);
        if (!$result) {
            $valid = false;
        }
        return $valid;
    }

    public function getAllGroup_User($user_id, $hienthi)
    {
        $user_id = mysqli_real_escape_string($this->con, $user_id);
        $hienthi = mysqli_real_escape_string($this->con, $hienthi);
        $sql = "SELECT 
                monhoc.mamonhoc, 
                monhoc.tenmonhoc, 
                nhom.manhom, 
                nhom.tennhom, 
                nhom.namhoc, 
                nhom.hocky,
                namhoc.tennamhoc,
                hocky.tenhocky,
                nguoidung.hoten, 
                nguoidung.avatar, 
                chitietnhom.hienthi
            FROM chitietnhom
            JOIN nhom ON chitietnhom.manhom = nhom.manhom
            JOIN nguoidung ON nguoidung.id = nhom.giangvien
            JOIN monhoc ON monhoc.mamonhoc = nhom.mamonhoc
            
            -- JOIN thêm để lấy tên năm học
            LEFT JOIN namhoc ON namhoc.manamhoc = nhom.namhoc
            
            -- JOIN thêm để lấy tên học kỳ
            LEFT JOIN hocky ON hocky.mahocky = nhom.hocky

            WHERE chitietnhom.manguoidung = '$user_id'
            AND chitietnhom.hienthi = '$hienthi'
            AND nhom.trangthai != 0";
        $result = mysqli_query($this->con, $sql);
        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    // Lấy chi tiết một nhóm mà sinh viên tham gia
    public function getDetailGroup($manhom)
    {
        $sql = "SELECT 
            monhoc.mamonhoc,
            monhoc.tenmonhoc,
            nhom.manhom,
            nhom.tennhom,

            namhoc.tennamhoc,
            hocky.tenhocky,

            nhom.giangvien,
            nguoidung.hoten,
            nguoidung.avatar

        FROM nhom
        JOIN nguoidung ON nguoidung.id = nhom.giangvien
        JOIN monhoc    ON monhoc.mamonhoc = nhom.mamonhoc
        JOIN namhoc    ON namhoc.manamhoc = nhom.namhoc
        JOIN hocky     ON hocky.mahocky   = nhom.hocky

        WHERE nhom.manhom = $manhom";
        $result = mysqli_query($this->con, $sql);
        return mysqli_fetch_assoc($result);
    }

    // Lấy danh sách bạn học chung nhóm
    public function getSvList($manhom)
    {
        $sql = "SELECT id, avatar, hoten, email, gioitinh, ngaysinh FROM chitietnhom, nguoidung WHERE manguoidung = id AND chitietnhom.manhom = $manhom";
        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function updateSiso($manhom)
    {
        $valid = true;
        $sql = "UPDATE `nhom` SET `siso`= (SELECT count(*) FROM `chitietnhom` where manhom = $manhom ) WHERE `manhom` = $manhom";
        $result = mysqli_query($this->con, $sql);
        if (!$result) {
            $valid = false;
        }
        return $valid;
    }
    public function updateSiso1($mamoi)
    {
        $result = $this->getIdFromInvitedCode($mamoi);
        $manhom = $result['manhom'];
        $valid = $this->updateSiso($manhom);
        return $valid;
    }

    public function getStudentByGroup($group)
    {
        $sql = "SELECT ng.id,ng.hoten,ng.email,ng.ngaythamgia,ng.ngaysinh,ng.gioitinh FROM chitietnhom ctn JOIN nguoidung ng ON ctn.manguoidung=ng.id WHERE ctn.manhom = $group";
        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }
    public function addSV($mssv, $hoten, $password)
    {
        $password = password_hash($password, PASSWORD_DEFAULT);
        $sql = "INSERT INTO `nguoidung`(`id`,`hoten`,`matkhau`,`trangthai`, `manhomquyen`) VALUES ('$mssv','$hoten','$password','1', '2')";
        $check = true;
        $result = mysqli_query($this->con, $sql);
        if (!$result) {
            $check = false;
        }
        return $check;
    }

    public function kickUser($manhom, $mssv)
    {
        $valid = true;
        $sql = "DELETE FROM `chitietnhom` WHERE `manguoidung` = '$mssv' AND `manhom` = $manhom";
        $result = mysqli_query($this->con, $sql);
        if (!$result) {
            $valid = false;
        }
        return $valid;
    }
    public function addStudentsByClassCode($malop, $manhom)
    {
        $malop = mysqli_real_escape_string($this->con, $malop);
        $manhom = mysqli_real_escape_string($this->con, $manhom);

        $checkLop = "SELECT COUNT(*) as total FROM nguoidung WHERE id LIKE '$malop%'";
        $resLop = mysqli_query($this->con, $checkLop);
        $rowLop = mysqli_fetch_assoc($resLop);

        if (!$resLop || $rowLop['total'] == 0) {
            return [
                'success' => false,
                'message' => "Mã lớp không tồn tại"
            ];
        }

        $query = "
        SELECT nguoidung.id 
        FROM nguoidung 
        LEFT JOIN chitietnhom 
            ON nguoidung.id = chitietnhom.manguoidung AND chitietnhom.manhom = '$manhom'
        WHERE nguoidung.id LIKE '$malop%' 
            AND chitietnhom.manguoidung IS NULL
    ";

        $result = mysqli_query($this->con, $query);

        $added = 0;
        while ($row = mysqli_fetch_assoc($result)) {
            $mssv = mysqli_real_escape_string($this->con, $row['id']);
            $insert = mysqli_query($this->con, "INSERT INTO chitietnhom (manhom, manguoidung) VALUES ('$manhom', '$mssv')");
            if ($insert) {
                $added++;
            }
        }

        if ($added > 0) {
            return [
                'success' => true,
                'message' => "Đã thêm $added sinh viên mới vào nhóm"
            ];
        } else {
            return [
                'success' => false,
                'message' => "Tất cả sinh viên đã có trong nhóm"
            ];
        }
    }



    public function checkAcc($mssv, $manhom)
    {
        $mssv = mysqli_real_escape_string($this->con, $mssv);
        $manhom = mysqli_real_escape_string($this->con, $manhom);
        $sql_checkGroup = "SELECT * FROM chitietnhom WHERE manhom='$manhom' AND manguoidung='$mssv'";
        $result_checkGroup = mysqli_query($this->con, $sql_checkGroup);
        if ($result_checkGroup->num_rows > 0) {
            return "0";
        }

        $sql_checkNguoiDung = "SELECT * FROM nguoidung WHERE id='$mssv'";
        $result_checkNguoiDung = mysqli_query($this->con, $sql_checkNguoiDung);
        if ($result_checkNguoiDung->num_rows > 0) {
            return "-1";
        }
        return "1";
    }

    public function getGroupSize($id)
    {
        $sql = "SELECT siso from nhom where manhom = $id";
        $result = mysqli_query($this->con, $sql);
        $row = mysqli_fetch_assoc($result);
        return $row['siso'];
    }

    public function getQuerySortByName($filter, $input, $args, $order)
    {
        $query = "SELECT ND.id, avatar, hoten, email, gioitinh, ngaysinh, SUBSTRING_INDEX(hoten, ' ', -1) AS firstname FROM chitietnhom CTN, nguoidung ND WHERE CTN.manguoidung = ND.id AND CTN.manhom = " . $args['manhom'];
        if ($input) {
            $query .= " AND (ND.hoten LIKE N'%{$input}%' OR CTN.manguoidung LIKE N'%{$input}%')";
        }
        $query .= " ORDER BY firstname $order";
        return $query;
    }

    public function getQuery($filter, $input, $args)
    {
        $query = "SELECT ND.id, avatar, hoten, email, gioitinh, ngaysinh FROM chitietnhom CTN, nguoidung ND WHERE CTN.manguoidung = ND.id AND CTN.manhom = " . $args['manhom'];
        if ($input) {
            $query .= " AND (ND.hoten LIKE N'%{$input}%' OR CTN.manguoidung LIKE N'%{$input}%')";
        }
        if ($input) {
            $input = addslashes($input);
            $query .= " AND (ND.hoten LIKE N'%$input%' OR ND.id LIKE N'%$input%')";
        }
        if (isset($args["custom"]["function"])) {
            $function = $args["custom"]["function"];
            switch ($function) {
                case "sort":
                    $column = $args["custom"]["column"];
                    $order = $args["custom"]["order"];
                    switch ($column) {
                        case "id":
                            $query .= " ORDER BY $column $order";
                            break;
                        case "hoten":
                            $query = $this->getQuerySortByName($filter, $input, $args, $order);
                            break;
                        default:
                    }
                    break;
                default:
            }
        }
        return $query;
    }

}
