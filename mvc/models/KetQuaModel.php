<?php

class KetQuaModel extends DB
{
    public function start($made, $manguoidung)
    {
        $valid = true;
        $sql = "INSERT INTO `ketqua`(`made`, `manguoidung`) VALUES ('$made','$manguoidung')";
        $result = mysqli_query($this->con, $sql);
        if (!$result) {
            $valid = false;
        }
        return $valid;
    }
    // update số lần chuyển tab lên server với thông tin tài khoảng và đề thi
    public function updateChangeTab($made, $manguoidung)
    {
        $solanchuyentab = $this->getChangeTab($made, $manguoidung)['solanchuyentab'];
        $sql = "UPDATE `ketqua` SET `solanchuyentab`='$solanchuyentab' WHERE `made`='$made' AND `manguoidung`='$manguoidung'";
        $valid = true;
        $result = mysqli_query($this->con, $sql);
        if (!$result) {
            $valid = false;
        }
        return $valid;
    }

    public function getChangeTab($made, $manguoidung)
    {
        $sql = "SELECT `solanchuyentab` FROM `ketqua` WHERE `made`='$made' AND `manguoidung`='$manguoidung'";
        $result = mysqli_query($this->con, $sql);
        return mysqli_fetch_assoc($result);
    }

    public function getMaKQ($made, $manguoidung)
    {
        $sql = "SELECT * FROM `ketqua` WHERE `made` = '$made' AND `manguoidung` = '$manguoidung'";
        $result = mysqli_query($this->con, $sql);
        return mysqli_fetch_assoc($result);
    }

    public function socaudung($listCauTraLoi)
    {
        $socaudung = 0;
        foreach ($listCauTraLoi as $tl) {
            $macauhoi = $tl['macauhoi'];
            $cautraloi = $tl['cautraloi'];
            $sql = "SELECT * FROM cautraloi ctl WHERE ctl.macauhoi = '$macauhoi' AND ctl.macautl = '$cautraloi' AND ctl.ladapan = 1";
            $result = mysqli_query($this->con, $sql);
            if (mysqli_num_rows($result) > 0) {
                $socaudung++;
            }
        }
        return $socaudung;
    }
    public function submit($made, $nguoidung, $thoigian = null)
    {
        ob_clean();
        header('Content-Type: application/json; charset=utf-8');
        date_default_timezone_set('Asia/Ho_Chi_Minh');
        $this->con->query("SET time_zone = '+07:00'");

        // 1. Lấy makq + thời gian vào thi
        $stmt = $this->con->prepare("
        SELECT makq, thoigianvaothi 
        FROM ketqua 
        WHERE made = ? AND manguoidung = ? AND diemthi IS NULL
        LIMIT 1
    ");
        if (!$stmt) {
            echo json_encode(['success' => false,'message' => 'Lỗi hệ thống']);
            exit;
        }
        $stmt->bind_param("is", $made, $nguoidung);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$row) {
            echo json_encode(['success' => false,'message' => 'Bài đã nộp hoặc không tồn tại']);
            exit;
        }

        $makq = $row['makq'];
        $thoigianvaothi = $row['thoigianvaothi'];

        // 2. Thời gian kết thúc
        $thoigianketthuc = date('Y-m-d H:i:s');
        if (!empty($_POST['thoigian'])) {
            $ts = strtotime($_POST['thoigian']);
            if ($ts !== false && abs($ts - time()) <= 120) {
                $thoigianketthuc = date('Y-m-d H:i:s', $ts);
            }
        }
        $thoigianlambai = max(strtotime($thoigianketthuc) - strtotime($thoigianvaothi), 0);

        // 3. Lấy listCauTraLoi từ client (JS đã gửi thutu = thứ tự UI)
        $rawList = $_POST['listCauTraLoi'] ?? '[]';
        $listCauTraLoi = is_string($rawList) ? json_decode($rawList, true) : [];
        if (!is_array($listCauTraLoi)) {
            $listCauTraLoi = [];
        }

        // 4. Lấy loại câu hỏi
        $questionTypes = [];
        if (!empty($listCauTraLoi)) {
            $macList = array_filter(array_unique(array_map('intval', array_column($listCauTraLoi, 'macauhoi'))));
            if (!empty($macList)) {
                $placeholders = implode(',', array_fill(0, count($macList), '?'));
                $stmt = $this->con->prepare("SELECT macauhoi, loai FROM cauhoi WHERE macauhoi IN ($placeholders)");
                $stmt->bind_param(str_repeat('i', count($macList)), ...$macList);
                $stmt->execute();
                $res = $stmt->get_result();
                while ($r = $res->fetch_assoc()) {
                    $questionTypes[$r['macauhoi']] = $r['loai'];
                }
                $stmt->close();
            }
        }

        // 5. Lưu + chấm đáp án MCQ/Reading theo thứ tự UI
        $socaudung_mcq = 0;
        $socaudung_reading = 0;
        foreach ($listCauTraLoi as $ans) {
            $macauhoi  = intval($ans['macauhoi'] ?? 0);
            $cautraloi = intval($ans['cautraloi'] ?? 0);
            $thutu     = intval($ans['thutu'] ?? 0); // ← thứ tự UI

            if ($macauhoi <= 0) {
                continue;
            }
            $loai = $questionTypes[$macauhoi] ?? '';
            if ($loai === 'essay') {
                continue; // Không lưu essay từ listCauTraLoi
            }

            // Lưu vào chitietketqua
            $this->luuDapAnTracNghiem($makq, $macauhoi, $cautraloi, $thutu);

            if ($cautraloi === 0) {
                continue;
            }

            // Chấm đúng/sai
            $check = $this->con->prepare("SELECT 1 FROM cautraloi WHERE macauhoi=? AND macautl=? AND ladapan=1");
            if (!$check) {
                continue;
            }
            $check->bind_param("ii", $macauhoi, $cautraloi);
            $check->execute();
            $correct = $check->get_result()->num_rows > 0;
            $check->close();

            if ($correct) {
                $loai = $questionTypes[$macauhoi] ?? 'mcq';
                if ($loai === 'reading') {
                    $socaudung_reading++;
                } else {
                    $socaudung_mcq++;
                }
            }
        }

        $socaudung_tong = $socaudung_mcq + $socaudung_reading;

        // 6. Tính điểm MCQ/Reading
        $stmt = $this->con->prepare("SELECT diem_tracnghiem, diem_dochieu FROM dethi WHERE made=?");
        $mcq_total_points = 10;
        $reading_total_points = 0;
        if ($stmt) {
            $stmt->bind_param("i", $made);
            $stmt->execute();
            $row = $stmt->get_result()->fetch_assoc();
            $stmt->close();
            $mcq_total_points = floatval($row['diem_tracnghiem'] ?? 10);
            $reading_total_points = floatval($row['diem_dochieu'] ?? 0);
        }
        $tongcau_mcq = count(array_filter($questionTypes, fn ($t) => $t === 'mcq'));
        $tongcau_reading = count(array_filter($questionTypes, fn ($t) => $t === 'reading'));
        $diem_tracnghiem = $tongcau_mcq > 0 ? round(($mcq_total_points / $tongcau_mcq) * $socaudung_mcq, 2) : 0;
        $diem_dochieu    = $tongcau_reading > 0 ? round(($reading_total_points / $tongcau_reading) * $socaudung_reading, 2) : 0;
        $diemthi = $diem_tracnghiem + $diem_dochieu;

        // 7. Xử lý tự luận
        $this->xuLyTuLuan($makq);

        // 8. Kiểm tra có tự luận
        $stmt = $this->con->prepare("
        SELECT EXISTS(
            SELECT 1 FROM chitietdethi ctd
            JOIN cauhoi ch ON ctd.macauhoi=ch.macauhoi
            WHERE ctd.made=? AND ch.loai='essay'
        ) AS has_essay
    ");
        $stmt->bind_param("i", $made);
        $stmt->execute();
        $has_tuluan = (bool)$stmt->get_result()->fetch_assoc()['has_essay'];
        $stmt->close();
        $trangthai_tuluan = $has_tuluan ? 'Chưa chấm' : 'Đã chấm';

        // 9. Cập nhật ketqua
        $stmt = $this->con->prepare("
        UPDATE ketqua SET 
            diemthi=?, diem_dochieu=?, thoigianlambai=?, thoigianketthuc=?, 
            socaudung=?, trangthai='Đã nộp', trangthai_tuluan=? 
        WHERE makq=?
    ");
        $stmt->bind_param("ddisisi", $diemthi, $diem_dochieu, $thoigianlambai, $thoigianketthuc, $socaudung_tong, $trangthai_tuluan, $makq);
        $stmt->execute();
        $stmt->close();

        // 10. Trả kết quả
        echo json_encode(['success' => true,'diemthi' => round($diemthi, 2),'thoigianlambai' => $thoigianlambai,'message' => 'Nộp bài thành công!']);
        exit;
    }


    // Sửa hàm lưu đáp án
    private function luuDapAnTracNghiem($makq, $macauhoi, $dapanchon, $thutu)
    {
        $thutu = intval($thutu);

        if ($dapanchon === 0) { // tự luận
            $stmt = $this->con->prepare("
            INSERT INTO chitietketqua (makq, macauhoi, dapanchon, thutu)
            VALUES (?, ?, NULL, ?)
            ON DUPLICATE KEY UPDATE 
                dapanchon = VALUES(dapanchon),
                thutu = VALUES(thutu)
        ");
            $stmt->bind_param("iii", $makq, $macauhoi, $thutu);
        } else { // MCQ / Reading
            $stmt = $this->con->prepare("
            INSERT INTO chitietketqua (makq, macauhoi, dapanchon, thutu)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                dapanchon = VALUES(dapanchon),
                thutu = VALUES(thutu)
        ");
            $stmt->bind_param("iiii", $makq, $macauhoi, $dapanchon, $thutu);
        }

        if (!$stmt->execute()) {
            $stmt->close();
            return false;
        }

        $stmt->close();
        return true;
    }

    // Xử lý tự luận
    private function xuLyTuLuan($makq)
    {

        $essays = [];
        foreach ($_POST as $key => $value) {
            if (preg_match('/^essay_(\d+)_(exists|macauhoi|noidung|thutu|image_\d+)$/', $key, $matches)) {
                $index = $matches[1];
                if (!isset($essays[$index])) {
                    $essays[$index] = [
                        'macauhoi' => 0,
                        'noidung'  => '',
                        'thutu'    => 0,
                        'images'   => []
                    ];
                }

                if (str_ends_with($key, '_macauhoi')) {
                    $essays[$index]['macauhoi'] = intval($value);
                } elseif (str_ends_with($key, '_noidung')) {
                    $essays[$index]['noidung'] = trim($value);
                } elseif (str_ends_with($key, '_thutu')) {
                    $essays[$index]['thutu'] = intval($value);
                } elseif (strpos($key, '_image_') !== false && !empty($value)) {
                    $essays[$index]['images'][] = $value;
                }
            }
        }

        foreach ($essays as $essay) {
            $macauhoi = $essay['macauhoi'];
            $noidung  = $essay['noidung'];
            $thutu    = $essay['thutu'];

            if ($macauhoi <= 0) {
                continue;
            }

            // 1. Lưu thứ tự và dapanchon = 0
            // $this->luuDapAnTracNghiem($makq, $macauhoi, 0, $thutu);
            $stmt = $this->con->prepare("
    INSERT INTO chitietketqua (makq, macauhoi, dapanchon, thutu)
    VALUES (?, ?, NULL, ?)
    ON DUPLICATE KEY UPDATE 
        dapanchon = NULL,
        thutu = VALUES(thutu)
");
            $stmt->bind_param("iii", $makq, $macauhoi, $thutu);
            $stmt->execute();
            $stmt->close();

            // 2. Lưu nội dung tự luận
            $stmt = $this->con->prepare("
            INSERT INTO traloi_tuluan (makq, macauhoi, noidung)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE noidung = VALUES(noidung)
        ");
            if (!$stmt) {
                continue;
            }
            $stmt->bind_param("iis", $makq, $macauhoi, $noidung);
            if (!$stmt->execute()) {
            }
            $traloi_id = $this->con->insert_id ?: $this->getTraloiId($makq, $macauhoi);
            $stmt->close();

            // 3. Lưu ảnh
            foreach ($essay['images'] as $base64String) {
                $imgBinary = base64_decode($base64String);
                if ($imgBinary === false) {
                    continue;
                }

                $stmt2 = $this->con->prepare("INSERT INTO hinhanh_traloi_tuluan (traloi_id, hinhanh) VALUES (?, ?)");
                if (!$stmt2) {
                    continue;
                }

                $null = null;
                $stmt2->bind_param("ib", $traloi_id, $null);
                $stmt2->send_long_data(1, $imgBinary);
                $stmt2->execute();
                $stmt2->close();
            }
        }

    }


    // Hàm phụ trợ nếu cần lấy lại traloi_id khi đã tồn tại
    private function getTraloiId($makq, $macauhoi)
    {
        $stmt = $this->con->prepare("SELECT id FROM traloi_tuluan WHERE makq = ? AND macauhoi = ?");
        $stmt->bind_param("ii", $makq, $macauhoi);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        return $row['id'] ?? 0;
    }


    public function kiemTraDiemTuluan($makq, $diemCham)
    {
        $sql = "
            SELECT d.diem_tuluan AS diem_tuluan_max
            FROM ketqua k
            JOIN dethi d ON k.made = d.made
            WHERE k.makq = ?
            LIMIT 1
        ";

        $stmt = $this->con->prepare($sql);
        if (!$stmt) {
            throw new Exception("Lỗi prepare: " . $this->con->error);
        }

        $stmt->bind_param("i", $makq);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();

        if (!$row) {
            return false; // makq không tồn tại
        }

        // So sánh điểm chấm với điểm tối đa
        return $diemCham <= (float)$row['diem_tuluan_max'];
    }



    // Lưu điểm TL
    public function luuDiemTuLuan($makq, $diemTong, $diemTungCau = [])
    {
        $makq     = intval($makq);
        $diemTong = round(floatval($diemTong), 2);

        if ($makq <= 0) {
            return ['success' => false, 'message' => 'Mã kết quả không hợp lệ'];
        }

        // --- Kiểm tra điểm tự luận với điểm tối đa ---
        $sql = "
        SELECT d.diem_tuluan AS diem_tuluan_max
        FROM ketqua k
        JOIN dethi d ON k.made = d.made
        WHERE k.makq = ?
        LIMIT 1
    ";
        $stmtCheck = mysqli_prepare($this->con, $sql);
        mysqli_stmt_bind_param($stmtCheck, "i", $makq);
        mysqli_stmt_execute($stmtCheck);
        $resultCheck = mysqli_stmt_get_result($stmtCheck);
        $rowCheck = mysqli_fetch_assoc($resultCheck);
        mysqli_stmt_close($stmtCheck);

        if (!$rowCheck) {
            return ['success' => false, 'message' => 'Kết quả không tồn tại'];
        }

        $diemMax = (float)$rowCheck['diem_tuluan_max'];
        if ($diemTong > $diemMax) {
            return [
                'success' => false,
                'message' => "Điểm chấm <span style='color:green; font-size:1.5em; font-weight:bold;'>$diemTong </span>điểm vượt quá tối đa <span style='color:red; font-size:1.5em; font-weight:bold;'>$diemMax</span> điểm cho phần tự luận"
            ];
        }


        // --- Bắt đầu transaction ---
        mysqli_begin_transaction($this->con);

        try {
            // BƯỚC 1: Lưu điểm từng câu (gộp 1 câu lệnh duy nhất)
            if (!empty($diemTungCau) && is_array($diemTungCau)) {
                $values = [];
                $params = [];
                $types  = '';

                foreach ($diemTungCau as $macauhoi => $diem) {
                    $macauhoi = intval($macauhoi);
                    $diem     = round(floatval($diem), 2);

                    if ($macauhoi > 0) {
                        $values[] = "(?, ?, ?)";
                        $params[] = $makq;
                        $params[] = $macauhoi;
                        $params[] = $diem;
                        $types .= 'iid';
                    }
                }

                if (!empty($values)) {
                    $sql = "INSERT INTO cham_tuluan (makq, macauhoi, diem) VALUES "
                         . implode(',', $values)
                         . " ON DUPLICATE KEY UPDATE diem = VALUES(diem)";

                    $stmt = mysqli_prepare($this->con, $sql);
                    mysqli_stmt_bind_param($stmt, $types, ...$params);
                    mysqli_stmt_execute($stmt);
                    mysqli_stmt_close($stmt);
                }
            }

            // BƯỚC 2: Cập nhật tổng điểm vào ketqua
            $trangthai = ($diemTong > 0) ? 'Đã chấm' : 'Chưa chấm';
            $sql = "UPDATE ketqua SET diem_tuluan = ?, trangthai_tuluan = ? WHERE makq = ?";
            $stmt = mysqli_prepare($this->con, $sql);
            mysqli_stmt_bind_param($stmt, "dsi", $diemTong, $trangthai, $makq);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);

            mysqli_commit($this->con);

        } catch (Exception $e) {
            mysqli_rollback($this->con);
            return ['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()];
        }

        return [
            'success' => true,
            'message' => 'Lưu điểm tự luận thành công!',
            'diem_tuluan' => $diemTong
        ];
    }


    public function tookTheExam($made)
    {
        $sql = "select * from ketqua kq join nguoidung nd on kq.manguoidung = nd.id where kq.made = '$made'";
        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function getExamineeByGroup($made, $manhom)
    {
        $sql = "SELECT KQ.*, email, hoten, avatar FROM ketqua KQ, nguoidung ND, chitietnhom CTN WHERE KQ.manguoidung = ND.id AND CTN.manguoidung = ND.id AND KQ.made = $made AND CTN.manhom = $manhom";
        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    // Lấy ra điểm tất cả đề thi của nhóm học phần để xuất file Excel
    public function getMarkOfAllTest($manhom)
    {
        // Lấy danh sách đề thi
        $sql_giaodethi = "SELECT dethi.made,tende FROM giaodethi,dethi WHERE manhom = $manhom AND giaodethi.made = dethi.made";
        $result_giaodethi = mysqli_query($this->con, $sql_giaodethi);
        $arr_dethi = array();
        while ($row = mysqli_fetch_assoc($result_giaodethi)) {
            $arr_dethi[] = $row;
        }

        // Lấy danh sách sinh viên
        $sql_sinhvien = "SELECT id,hoten FROM nguoidung, chitietnhom WHERE nguoidung.id = chitietnhom.manguoidung AND chitietnhom.manhom = $manhom";
        $result_sinhvien = mysqli_query($this->con, $sql_sinhvien);
        $arr_sinhvien = array();
        while ($row = mysqli_fetch_assoc($result_sinhvien)) {
            $arr_sinhvien[] = $row;
        }

        // Lấy bảng điểm
        $arr_ketqua = array();
        foreach ($arr_dethi as $dethi) {
            $arr_ketqua[$dethi['made']] = $this->getMarkOfOneTest($manhom, $dethi['made']);
        }

        // Xử lý header
        $header = array("Mã sinh viên", "Tên sinh viên");
        foreach ($arr_dethi as $dethi) {
            $header[] = $dethi['tende'];
        }

        // Xử lý mảng
        $arr_result = array($header);
        for ($i = 0;$i < count($arr_sinhvien);$i++) {
            $row = array($arr_sinhvien[$i]['id'],$arr_sinhvien[$i]['hoten']);
            for ($j = 0; $j < count($arr_dethi); $j++) {
                array_push($row, $arr_ketqua[$arr_dethi[$j]['made']][$i]['diemthi']);
            }
            $arr_result[] = $row;
        }

        return $arr_result;
    }

    public function getMarkOfOneTest($manhom, $made)
    {
        $sql = "SELECT DISTINCT giaodethi.made,chitietnhom.manguoidung,ketqua.diemthi
        FROM giaodethi, chitietnhom LEFT JOIN ketqua ON chitietnhom.manguoidung = ketqua.manguoidung AND ketqua.made = $made 
        WHERE giaodethi.manhom = chitietnhom.manhom AND giaodethi.manhom = $manhom AND giaodethi.made = $made";
        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    // Lấy thông tin đề thi, kết quả của sinh viên để xuất file PDF
public function getInfoPrintPdf($makq)
{
    $makq = intval($makq);

    $sql = "SELECT 
                kq.made,
                dt.tende,
                dt.thoigianthi,
                mh.tenmonhoc,
                kq.manguoidung,
                u.hoten,
                kq.socaudung,
                (SELECT COUNT(*) FROM chitietdethi WHERE made = kq.made) AS tongsocauhoi,
                kq.diemthi,
                dt.thoigianthi,
                kq.thoigianvaothi,
                kq.thoigianketthuc,
                -- Tính thời gian làm bài thực tế (giây)
                TIMESTAMPDIFF(SECOND, kq.thoigianvaothi, 
                    COALESCE(kq.thoigianketthuc, NOW())) AS thoigianlambai_giay
            FROM ketqua kq
            JOIN dethi dt ON kq.made = dt.made
            JOIN monhoc mh ON dt.monthi = mh.mamonhoc
            JOIN nguoidung u ON kq.manguoidung = u.id
            WHERE kq.makq = ?";

    $stmt = mysqli_prepare($this->con, $sql);
    if (!$stmt) return false;

    mysqli_stmt_bind_param($stmt, "i", $makq);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if (mysqli_num_rows($result) == 0) return false;

    return mysqli_fetch_assoc($result);
}


    public function countQuestionsByMakq($makq)
    {
        $makq = intval($makq);
        if ($makq <= 0) {
            return 0;
        }
        $sql = "SELECT COUNT(*) as cnt FROM chitietketqua WHERE makq = '$makq'";
        $res = mysqli_query($this->con, $sql);
        if (!$res) {
            return 0;
        }
        $row = mysqli_fetch_assoc($res);
        return isset($row['cnt']) ? (int)$row['cnt'] : 0;
    }

    // Lấy điểm để thống kê
    public function getStatictical($made, $manhom)
    {
        $nhomm = $manhom != 0 ? "AND chitietnhom.manhom = $manhom" : "";
        $sql = "SELECT chitietnhom.manguoidung, ketqua.manguoidung AS mandkq, makq, ketqua.made, diemthi
        FROM chitietnhom
        JOIN giaodethi ON chitietnhom.manhom = giaodethi.manhom
        LEFT JOIN ketqua ON ketqua.manguoidung = chitietnhom.manguoidung AND ketqua.made = '$made'
        WHERE giaodethi.made = '$made' $nhomm";
        $result = mysqli_query($this->con, $sql);
        $diemthi = array_fill(0, 10, 0);
        $tongdiem = 0;
        $soluong = 0;
        $max = 0;
        $chuanop = 0;
        $khongthi = 0;
        while ($row = mysqli_fetch_assoc($result)) {
            if ($row['diemthi'] != null) {
                $tongdiem += $row['diemthi'];
                $soluong++;
                $index = ceil($row['diemthi']) > 0 ? ceil($row['diemthi']) - 1 : 0;
                $diemthi[$index]++;
                if ($row['diemthi'] > $max) {
                    $max = $row['diemthi'];
                }
            } else {
                if ($row['mandkq'] != null) {
                    $chuanop++;
                } else {
                    $khongthi++;
                }
            }
        }
        $rs = array(
            "diem_trung_binh" => $soluong != 0 ? round($tongdiem / $soluong, 2) : 0,
            "da_nop_bai" => $soluong,
            "chua_nop_bai" => $chuanop,
            "khong_thi" => $khongthi,
            "diem_cao_nhat" => $max,
            "thong_ke_diem" => $diemthi
        );
        return $rs;
    }

    public function getQueryAddColumnFirstname($original_query, $filter, $input, $args, $order)
    {
        $from_index = strpos($original_query, "FROM");
        $select_string = substr($original_query, 0, $from_index) . ", SUBSTRING_INDEX(hoten, ' ', -1) AS firstname";
        $from_string = substr($original_query, $from_index);
        $query = "$select_string $from_string";
        return $query;
    }

    public function getListAbsentFromTest($filter, $input, $args)
    {
        if (is_array($args['manhom'])) {
            $listGroup = implode(", ", $args['manhom']);
        } else {
            $listGroup = $args['manhom'];
        }
        $query = "SELECT KQ.makq, KQ.made, CTN.manguoidung, KQ.diemthi, KQ.thoigianvaothi, KQ.thoigianlambai, KQ.socaudung, KQ.solanchuyentab, email, hoten, avatar FROM chitietnhom CTN JOIN nguoidung ND ON ND.id = CTN.manguoidung LEFT JOIN ketqua KQ ON CTN.manguoidung = KQ.manguoidung AND KQ.made = ".$args['made']." WHERE KQ.made IS NULL AND CTN.manhom IN ($listGroup)";
        return $query;
    }

    public function getQueryAll($filter, $input, $args)
    {
        $count_only = $args['count_only'] ?? false;

        $absent_query = $this->getListAbsentFromTest($filter, $input, $args);
        $cols = "KQ.makq, KQ.made, KQ.manguoidung, KQ.diemthi, KQ.diem_tuluan, KQ.trangthai, KQ.trangthai_tuluan, KQ.thoigianvaothi, KQ.thoigianlambai, KQ.socaudung, KQ.solanchuyentab, ND.email, ND.hoten, ND.avatar";
        $query = "SELECT DISTINCT $cols FROM ketqua KQ JOIN nguoidung ND ON KQ.manguoidung = ND.id JOIN chitietnhom CTN ON CTN.manguoidung = ND.id WHERE KQ.made = " . $args['made'];
        if (is_array($args['manhom'])) {
            $list = implode(", ", $args['manhom']);
            $query .= " AND CTN.manhom IN ($list)";
        } else {
            $query .= " AND CTN.manhom = ".$args['manhom'];
        }
        $present_query = $query;
        // Ensure absent_query returns the same column order/aliases as present_query
        // absent_query from getListAbsentFromTest currently returns: makq, made, manguoidung, diemthi, thoigianvaothi, thoigianlambai, socaudung, solanchuyentab, email, hoten, avatar
        // We need to align it with $cols (including diem_tuluan, trangthai, trangthai_tuluan which will be NULL for absent rows)
        if (strpos($absent_query, 'SELECT') === 0) {
            // rewrite absent_query to replace its SELECT ... FROM clause with the explicit columns + FROM
            $absent_query = preg_replace(
                '/SELECT\s+.*?\s+FROM\s+/is',
                'SELECT KQ.makq, KQ.made, CTN.manguoidung, KQ.diemthi, KQ.diem_tuluan, KQ.trangthai, KQ.trangthai_tuluan, KQ.thoigianvaothi, KQ.thoigianlambai, KQ.socaudung, KQ.solanchuyentab, ND.email, ND.hoten, ND.avatar FROM ',
                $absent_query,
                1
            );
        }

        $query = "($present_query) UNION ($absent_query)";

        // Bỏ ORDER nếu đang đếm
        $order_by = "";
        if (!$count_only) {
            $order_by = "ORDER BY manguoidung ASC";
            if (isset($args["custom"]["function"])) {
                $function = $args["custom"]["function"];
                switch ($function) {
                    case "sort":
                        $column = $args["custom"]["column"];
                        $order = $args["custom"]["order"];
                        switch ($column) {
                            case "manguoidung":
                            case "diemthi":
                            case "thoigianvaothi":
                            case "thoigianlambai":
                            case "solanchuyentab":
                                $order_by = "ORDER BY $column $order";
                                break;
                            case "hoten":
                                $present_query = $this->getQueryAddColumnFirstname($present_query, $filter, $input, $args, $order);
                                $absent_query = $this->getQueryAddColumnFirstname($absent_query, $filter, $input, $args, $order);
                                $query = "($present_query) UNION ($absent_query)";
                                $order_by = "ORDER BY firstname $order";
                                break;
                            default:
                        }
                        break;
                    default:
                }
            }
        }

        if ($input) {
            $query = "SELECT * FROM ($query) AS combined_results WHERE (hoten LIKE N'%{$input}%' OR manguoidung LIKE '%{$input}%')";
        }

        $query .= " $order_by";

        return $query;
    }

    // Tìm kiếm & phân trang & sắp xếp
    public function getQuery($filter, $input, $args)
    {
        if ($filter == "all") {
            return $this->getQueryAll($filter, $input, $args);
        }
        if ($filter == "absent") {
            $query = $this->getListAbsentFromTest($filter, $input, $args);
        } else {
            $query = "SELECT DISTINCT 
            KQ.*, 
            ND.email, 
            ND.hoten, 
            ND.avatar,
            DT.thoigianbatdau,
            DT.thoigianketthuc as thoigianketthuc_dethi
          FROM ketqua KQ
          JOIN nguoidung ND ON KQ.manguoidung = ND.id
          JOIN chitietnhom CTN ON CTN.manguoidung = ND.id
          JOIN dethi DT ON DT.made = KQ.made
          WHERE KQ.made = ".$args['made'] ;


            switch ($filter) {
                case "present":
                    $query .= " AND diemthi IS NOT NULL";
                    break;
                case "interrupted":
                    $query .= " AND ISNULL(diemthi)";
                    break;
                default:
            }
            if (is_array($args['manhom'])) {
                $list = implode(", ", $args['manhom']);
                $query .= " AND CTN.manhom IN ($list)";
            } else {
                $query .= " AND CTN.manhom = ".$args['manhom'];
            }
        }
        if ($input) {
            $query .= " AND (hoten LIKE N'%{$input}%' OR CTN.manguoidung LIKE '%{$input}%')";
        }
        if (isset($args["custom"]["function"])) {
            $function = $args["custom"]["function"];
            switch ($function) {
                case "sort":
                    $column = $args["custom"]["column"];
                    $order = $args["custom"]["order"];
                    switch ($column) {
                        case "manguoidung":
                        case "diemthi":
                        case "thoigianvaothi":
                        case "thoigianlambai":
                        case "solanchuyentab":
                            $query .= " ORDER BY $column $order";
                            break;
                        case "hoten":
                            $query = $this->getQueryAddColumnFirstname($query, $filter, $input, $args, $order);
                            $query .= " ORDER BY firstname $order";
                            break;
                        default:
                    }
                    break;
                default:
            }
        } else {
            $query .= " ORDER BY KQ.manguoidung ASC";
        }
        return $query;
    }

    public function getTestScoreGroup($made, $manhom)
    {
        $sql = "SELECT ds.manguoidung,ds.hoten,kqt.diemthi,kqt.thoigianvaothi,kqt.thoigianlambai,kqt.socaudung,kqt.solanchuyentab FROM (SELECT ctn.manguoidung,nd.hoten FROM chitietnhom ctn JOIN nguoidung nd ON ctn.manguoidung=nd.id WHERE ctn.manhom=$manhom) ds LEFT JOIN 
        (SELECT kq.manguoidung,kq.diemthi,kq.thoigianvaothi,kq.thoigianlambai,kq.socaudung,kq.solanchuyentab FROM ketqua kq JOIN giaodethi gdt ON kq.made=gdt.made WHERE gdt.made=$made AND gdt.manhom=$manhom) kqt ON ds.manguoidung=kqt.manguoidung";
        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function getTestAll($made, $ds)
    {
        $list = implode(", ", $ds);
        $cols = "KQ.makq, KQ.made, CTN.manguoidung, KQ.diemthi, KQ.diem_tuluan, KQ.trangthai, KQ.trangthai_tuluan, KQ.thoigianvaothi, KQ.thoigianlambai, KQ.socaudung, KQ.solanchuyentab, ND.email, ND.hoten, ND.avatar";
        $sql = "(SELECT $cols FROM chitietnhom CTN JOIN nguoidung ND ON ND.id = CTN.manguoidung LEFT JOIN ketqua KQ ON CTN.manguoidung = KQ.manguoidung AND KQ.made = $made WHERE KQ.made IS NULL AND CTN.manhom IN ($list))
        UNION
        (SELECT DISTINCT $cols FROM ketqua KQ JOIN nguoidung ND ON KQ.manguoidung = ND.id JOIN chitietnhom CTN ON CTN.manguoidung = ND.id WHERE KQ.made = $made AND CTN.manhom IN ($list))
        ORDER BY manguoidung ASC";
        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function chuyentab($made, $id)
    {
        $sql_dethi = "SELECT * FROM ketqua WHERE made='$made' AND manguoidung='$id'";
        $result = mysqli_query($this->con, $sql_dethi);
        $data_dethi = mysqli_fetch_assoc($result);

        $solan = $data_dethi['solanchuyentab'];
        $solan++;

        $sql_update = "UPDATE ketqua SET solanchuyentab = '$solan' WHERE made='$made' AND manguoidung='$id'";
        $result_update = mysqli_query($this->con, $sql_update);

        $sql_check = "SELECT * FROM dethi where made = '$made'";
        $result_check = mysqli_query($this->con, $sql_check);
        $data_check = mysqli_fetch_assoc($result_check);
        return $data_check['nopbaichuyentab'];
    }
}
