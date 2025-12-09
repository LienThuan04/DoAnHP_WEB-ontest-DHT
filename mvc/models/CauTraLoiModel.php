<?php

class CauTraLoiModel extends DB
{
    public function create($macauhoi, $noidungtl, $ladapan, $hinhanh = null)
    {
        $sql = "INSERT INTO cautraloi (macauhoi, noidungtl, ladapan, hinhanh)
            VALUES (?, ?, ?, ?)";

        $stmt = mysqli_prepare($this->con, $sql);

        if (!$stmt) {
            die("Prepare failed: " . mysqli_error($this->con));
        }

        $blob = null;

        mysqli_stmt_bind_param(
            $stmt,
            "isib",
            $macauhoi,
            $noidungtl,
            $ladapan,
            $blob
        );

        // Nếu có ảnh → gửi dữ liệu binary
        if ($hinhanh !== null) {
            mysqli_stmt_send_long_data($stmt, 3, $hinhanh);
        }

        $result = mysqli_stmt_execute($stmt);

        if (!$result) {
            die("Execute failed: " . mysqli_error($this->con));
        }

        mysqli_stmt_close($stmt);
        return true;
    }



    public function updateAnswer($macautl, $macauhoi, $noidungtl, $ladapan, $hinhanh = null)
    {
        $valid = true;

        if ($hinhanh !== null) {
            $sql = "UPDATE cautraloi 
                SET macauhoi = ?, noidungtl = ?, ladapan = ?, hinhanh = ? 
                WHERE macautl = ?";
        } else {
            $sql = "UPDATE cautraloi 
                SET macauhoi = ?, noidungtl = ?, ladapan = ? 
                WHERE macautl = ?";
        }

        $stmt = mysqli_prepare($this->con, $sql);

        if (!$stmt) {
            die("Prepare failed: " . mysqli_error($this->con));
        }

        if ($hinhanh !== null) {
            mysqli_stmt_bind_param(
                $stmt,
                "issbi",
                $macauhoi,
                $noidungtl,
                $ladapan,
                $hinhanh,
                $macautl
            );
            mysqli_stmt_send_long_data($stmt, 3, $hinhanh); // cột thứ 4 là BLOB
        } else {
            mysqli_stmt_bind_param(
                $stmt,
                "issi",
                $macauhoi,
                $noidungtl,
                $ladapan,
                $macautl
            );
        }

        if (!mysqli_stmt_execute($stmt)) {
            $valid = false;
        }

        mysqli_stmt_close($stmt);

        return $valid;
    }


    public function delete($macautl)
    {
        $valid = true;
        // Clear any references from chitietketqua.dapanchon to avoid FK constraint errors
        $clearSql = "UPDATE `chitietketqua` SET `dapanchon` = NULL WHERE `dapanchon` = $macautl";
        mysqli_query($this->con, $clearSql);

        $sql = "DELETE FROM `cautraloi` WHERE `macautl` = $macautl";
        $result = mysqli_query($this->con, $sql);
        if (!$result) {
            $valid = false;
        }
        return $valid;
    }

    public function getAll($macauhoi)
    {
        $macauhoi = mysqli_real_escape_string($this->con, $macauhoi);

        $sql = "SELECT macautl, macauhoi, noidungtl, ladapan, hinhanh 
            FROM `cautraloi` 
            WHERE `macauhoi` = '$macauhoi' 
            ORDER BY macautl ASC";

        $result = mysqli_query($this->con, $sql);
        if (!$result) {
            die("Query Error: " . mysqli_error($this->con));
        }

        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $row['hinhanh'] = $row['hinhanh'];

            $row['noidungtl'] = $row['noidungtl'] ?? '';
            $row['ladapan']   = $row['ladapan'] ?? 0;

            $rows[] = $row;
        }

        return $rows;
    }


    public function getAllWithoutAnswer($macauhoi)
    {
        $sql = "SELECT `macautl`, `noidungtl`, `hinhanh`
            FROM `cautraloi`
            WHERE `macauhoi` = " . intval($macauhoi);

        $result = mysqli_query($this->con, $sql);
        $rows = [];

        while ($row = mysqli_fetch_assoc($result)) {

            // Xử lý ảnh đáp án
            if (!empty($row['hinhanh'])) {
                $row['hinhanhtl'] = base64_encode($row['hinhanh']);
            } else {
                $row['hinhanhtl'] = "";
            }

            unset($row['hinhanh']);
            $rows[] = $row;
        }

        return $rows;
    }
    //lấy câu tl tự luận; optional $search filters by student name or student id (MSSV)
    public function getAllEssaySubmissions($made, $search = null, $status = 'all')
    {
        $sql = "
       SELECT 
    k.makq,
    k.manguoidung,
    COALESCE(nd.hoten, k.manguoidung) AS hoten,
    nd.avatar, 
    k.diemthi,
    k.diem_dochieu,
    k.diem_tuluan,
    k.trangthai_tuluan,
    k.thoigianvaothi,
    k.thoigianlambai
FROM ketqua k
INNER JOIN (
    -- Chỉ lấy mỗi makq 1 lần dù có bao nhiêu câu tự luận
    SELECT DISTINCT makq 
    FROM traloi_tuluan 
    WHERE makq IN (SELECT makq FROM ketqua WHERE made = ?)
) tt ON tt.makq = k.makq
LEFT JOIN nguoidung nd ON nd.id = k.manguoidung
WHERE k.made = ?

";

        $params = [];
        $types = "ii"; // made, made
        $params[] = $made;
        $params[] = $made;

        if ($search !== null && trim($search) !== '') {
            $sql .= " AND (nd.hoten LIKE ? OR k.manguoidung LIKE ?) ";
            $types .= "ss";
            $like = '%' . $search . '%';
            $params[] = $like;
            $params[] = $like;
        }

        // Apply status filter: 'all' | 'graded' | 'ungraded'
        if ($status === 'graded') {
            $sql .= " AND (k.diem_tuluan IS NOT NULL AND k.diem_tuluan > 0) ";
        } elseif ($status === 'ungraded') {
            $sql .= " AND (k.diem_tuluan IS NULL OR k.diem_tuluan = 0) ";
        }

        $sql .= " ORDER BY (k.thoigianvaothi + INTERVAL k.thoigianlambai SECOND) DESC;";

        $stmt = mysqli_prepare($this->con, $sql);
        if (!$stmt) {
            return ['success' => false, 'message' => 'Lỗi chuẩn bị truy vấn: ' . mysqli_error($this->con)];
        }

        // Bind params dynamically
        $bind_names[] = $types;
        for ($i = 0; $i < count($params); $i++) {
            $bind_name = 'bind' . $i;
            $$bind_name = $params[$i];
            $bind_names[] = &$$bind_name;
        }

        call_user_func_array('mysqli_stmt_bind_param', array_merge([$stmt], $bind_names));

        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        $data = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $diemTL = round(floatval($row['diem_tuluan'] ?? 0), 2);

            $data[] = [
                'makq'                 => (int)$row['makq'],
                'manguoidung'          => $row['manguoidung'],
                'hoten'                => $row['hoten'],
                'diemthi'              => $row['diemthi'] !== null ? floatval($row['diemthi']) : null,
                'diem_dochieu'         => $row['diem_dochieu'] !== null ? floatval($row['diem_dochieu']) : null,
                'diem_tuluan_hien_tai' => $diemTL,
                'trangthai_cham'       => $diemTL > 0 ? 'Đã chấm' : 'Chưa chấm'
            ];
        }

        mysqli_stmt_close($stmt);

        return ['success' => true, 'data' => $data];
    }

    public function getEssayAnswersByMakq($makq)
    {
        if ($makq <= 0) {
            return ['success' => false, 'message' => 'Mã kết quả không hợp lệ'];
        }

        // 1. Lấy manguoidung (nếu cần hiển thị tên, mã SV)
        // 1. Lấy manguoidung + hoten (rất chuẩn!)
        $manguoidung = null;
        $hoten = null;
        $avatar = null;

        $sqlUser = "SELECT 
        kq.manguoidung, 
        COALESCE(nd.hoten, kq.manguoidung) AS hoten,
        nd.avatar
    FROM ketqua kq 
    LEFT JOIN nguoidung nd ON nd.id = kq.manguoidung 
    WHERE kq.makq = ? 
    LIMIT 1";

        $stmtUser = mysqli_prepare($this->con, $sqlUser);
        if ($stmtUser) {
            mysqli_stmt_bind_param($stmtUser, "i", $makq);
            mysqli_stmt_execute($stmtUser);
            $resUser = mysqli_stmt_get_result($stmtUser);
            if ($rowUser = mysqli_fetch_assoc($resUser)) {
                $manguoidung = $rowUser['manguoidung'];
                $hoten = $rowUser['hoten'];
                $avatar      = $rowUser['avatar'];
            }
            mysqli_stmt_close($stmtUser);
        }

        // 2. QUERY CHÍNH – LẤY ĐỀ + TRẢ LỜI + ẢNH + ĐIỂM CHẤM
        $sql = "
        SELECT 
            tt.id AS traloi_id,
            tt.macauhoi,
            tt.noidung AS noidung_tra_loi,
            tt.thoigianlam,

            ch.noidung AS noidung_cauhoi,
            ct.diem AS diem_da_cham,

            h.hinhanh
        FROM traloi_tuluan tt
        INNER JOIN cauhoi ch ON ch.macauhoi = tt.macauhoi
        LEFT JOIN cham_tuluan ct ON ct.makq = tt.makq AND ct.macauhoi = tt.macauhoi
        LEFT JOIN hinhanh_traloi_tuluan h ON h.traloi_id = tt.id
        WHERE tt.makq = ?
        ORDER BY tt.macauhoi ASC, h.id ASC
    ";

        $stmt = mysqli_prepare($this->con, $sql);
        if (!$stmt) {
            return ['success' => false, 'message' => 'Lỗi prepare: ' . mysqli_error($this->con)];
        }

        mysqli_stmt_bind_param($stmt, "i", $makq);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        $cauhoiArr = [];
        $tongDiemTuLuan = 0;
        $soCauDaCham    = 0;

        while ($row = mysqli_fetch_assoc($result)) {
            $mc = $row['macauhoi'];

            // Khởi tạo câu hỏi lần đầu
            if (!isset($cauhoiArr[$mc])) {
                $diemCham = $row['diem_da_cham'] !== null ? floatval($row['diem_da_cham']) : null;

                $cauhoiArr[$mc] = [
                    'macauhoi'        => $mc,
                    'noidung_cauhoi'  => $row['noidung_cauhoi'] ?: '(Câu hỏi đã bị xóa)',
                    'noidung_tra_loi' => $row['noidung_tra_loi'] ?? '',
                    'thoigianlam'     => $row['thoigianlam'],
                    'diem_cham'       => $diemCham,
                    'hinhanh'         => []
                ];

                // Tính tổng điểm tự luận
                if ($diemCham !== null) {
                    $tongDiemTuLuan += $diemCham;
                    $soCauDaCham++;
                }
            }

            // Thêm ảnh (nếu có)
            if (!empty($row['hinhanh'])) {
                $cauhoiArr[$mc]['hinhanh'][] = base64_encode($row['hinhanh']);
            }
        }

        mysqli_stmt_close($stmt);

        // Nếu không có câu nào → vẫn trả success nhưng rỗng
        if (empty($cauhoiArr)) {
            return [
                'success'         => true,
                'makq'            => $makq,
                'manguoidung'     => $manguoidung,
                'tong_diem_tuluan' => 0,
                'cautraloi'       => []
            ];
        }

        return [
            'success'         => true,
            'makq'            => $makq,
            'manguoidung'     => $manguoidung,
            'hoten'           => $hoten,
            'avatar'           => $avatar,
            'tong_diem_tuluan' => round($tongDiemTuLuan, 2),
            'tong_cau'        => count($cauhoiArr),
            'da_cham'         => $soCauDaCham,
            'cautraloi'       => array_values($cauhoiArr)
        ];
    }



    public function getById($macautl)
    {
        $sql = "SELECT * FROM `cautraloi` WHERE `macautl` = ?";
        $stmt = mysqli_prepare($this->con, $sql);
        mysqli_stmt_bind_param($stmt, "i", $macautl);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $row = mysqli_fetch_assoc($result);
        mysqli_stmt_close($stmt);

        // Trong getById()
        if (!empty($row['hinhanh'])) {
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime = $finfo->buffer($row['hinhanh']) ?: 'image/jpeg';

            $row['hinhanh_base64'] = 'data:' . $mime . ';base64,' . base64_encode($row['hinhanh']);
            $row['option_image_base64'] = $row['hinhanh_base64']; // cho JS
        } else {
            $row['hinhanh_base64'] = null;
            $row['option_image_base64'] = null;
        }

        return $row;
    }

    public function deletebyanswer($macauhoi)
    {
        $valid = true;
        $clearSql = "UPDATE `chitietketqua` SET `dapanchon` = NULL WHERE `macauhoi` = $macauhoi";
        mysqli_query($this->con, $clearSql);

        $sql = "DELETE FROM `cautraloi` WHERE `macauhoi` = $macauhoi";
        $result = mysqli_query($this->con, $sql);
        if (!$result) {
            $valid = false;
        }
        return $valid;
    }

    public function getAnswersForMultipleQuestions($arr_question_id)
    {
        $list = implode(", ", $arr_question_id);
        $sql = "SELECT * FROM cautraloi WHERE macauhoi IN ($list)";
        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }



}
