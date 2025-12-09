<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);
include "./mvc/models/CauTraLoiModel.php";
include "./mvc/models/CauHoiModel.php";

class DeThiModel extends DB
{
    public function executeQuery($sql)
    {
        return mysqli_query($this->con, $sql);
    }

    public function insertAndGetId($sql)
    {
        mysqli_query($this->con, $sql);
        return mysqli_insert_id($this->con);
    }



    private function checkQuestionAvailability($monhoc, $chuong, $loaicauhoi, $socaude, $socautb, $socaukho)
    {
        $monhoc = mysqli_real_escape_string($this->con, $monhoc);
        $counts = [];

        // Duyệt từng loại câu hỏi được chọn
        foreach ($loaicauhoi as $type) {
            foreach ([1 => 'socaude', 2 => 'socautb', 3 => 'socaukho'] as $level => $qty_field) {
                $qty = $$qty_field;
                if ($qty <= 0) {
                    continue;
                }

                $sql = "SELECT COUNT(*) as count FROM cauhoi ch
                    WHERE ch.mamonhoc='$monhoc' 
                    AND ch.dokho=$level 
                    AND ch.loai='$type' 
                    AND ch.trangthai!=0 
                    AND (";

                $chuongArr = [];
                foreach ($chuong as $c) {
                    $chuongArr[] = "ch.machuong='" . mysqli_real_escape_string($this->con, $c) . "'";
                }
                $sql .= implode(' OR ', $chuongArr) . ")";

                $res = mysqli_query($this->con, $sql);
                if (!$res) {
                    die("Lỗi SQL: " . mysqli_error($this->con));
                }

                $count = mysqli_fetch_assoc($res)['count'];
                $counts[$type][$level] = $count;

                if ($count < $qty) {
                    return [
                        'valid' => false,
                        'message' => "Không đủ câu hỏi loại $type mức độ $level: yêu cầu $qty, hiện có $count"
                    ];
                }
            }
        }

        return ['valid' => true, 'counts' => $counts];
    }

    public function create(
        $monthi,
        $nguoitao,
        $tende,
        $thoigianthi,
        $thoigianbatdau,
        $thoigianketthuc,
        $hienthibailam,
        $xemdiemthi,
        $xemdapan,
        $daocauhoi,
        $daodapan,
        $tudongnop,
        $loaide,
        $socau,
        $chuong,
        $nhom,
        $loaicauhoi,
        $diem_tracnghiem = 0,
        $diem_tuluan = 0,
        $diem_dochieu = 0
    ) {
        try {
            // ===== Normalize =====
            $monthi = trim($monthi);
            $nguoitao = trim($nguoitao);
            $tende = trim($tende);

            $thoigianthi = intval($thoigianthi);
            $hienthibailam = intval($hienthibailam);
            $xemdiemthi = intval($xemdiemthi);
            $xemdapan = intval($xemdapan);
            $daocauhoi = intval($daocauhoi);
            $daodapan = intval($daodapan);
            $tudongnop = intval($tudongnop);
            $loaide = intval($loaide);

            $chuong = is_array($chuong) ? array_map('intval', $chuong) : [];
            $nhom = is_array($nhom) ? array_map('intval', $nhom) : [];
            $loaicauhoi = is_array($loaicauhoi) ? array_filter(array_map('trim', $loaicauhoi)) : ['mcq'];

            // ===== Init số câu =====
            $mcq_de = $mcq_tb = $mcq_kho = 0;
            $essay_de = $essay_tb = $essay_kho = 0;
            $reading_de = $reading_tb = $reading_kho = 0;

            if (is_array($socau)) {
                foreach ($socau as $type => $levels) {
                    $de = intval($levels['de'] ?? 0);
                    $tb = intval($levels['tb'] ?? 0);
                    $kho = intval($levels['kho'] ?? 0);

                    switch ($type) {
                        case 'mcq':
                            $mcq_de = $de;
                            $mcq_tb = $tb;
                            $mcq_kho = $kho;
                            break;

                        case 'essay':
                            $essay_de = $de;
                            $essay_tb = $tb;
                            $essay_kho = $kho;
                            break;

                        case 'reading':
                            $reading_de = $de;
                            $reading_tb = $tb;
                            $reading_kho = $kho;
                            break;
                    }
                }
            }

            $trangthai = 1;
            $sql = "INSERT INTO dethi 
            (monthi, nguoitao, tende, thoigianthi, thoigianbatdau, thoigianketthuc,
             hienthibailam, xemdiemthi, xemdapan, troncauhoi, trondapan, nopbaichuyentab,
             loaide, mcq_de, mcq_tb, mcq_kho,
             essay_de, essay_tb, essay_kho,
             reading_de, reading_tb, reading_kho,
             diem_tracnghiem, diem_tuluan, diem_dochieu,
             trangthai)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = mysqli_prepare($this->con, $sql);
            if (!$stmt) {
                throw new Exception("Prepare failed: " . mysqli_error($this->con));
            }
            $types = "sssissiiiiiiiiiiiiiiiidddi";

            mysqli_stmt_bind_param(
                $stmt,
                $types,
                $monthi,
                $nguoitao,
                $tende,
                $thoigianthi,
                $thoigianbatdau,
                $thoigianketthuc,
                $hienthibailam,
                $xemdiemthi,
                $xemdapan,
                $daocauhoi,
                $daodapan,
                $tudongnop,
                $loaide,
                $mcq_de,
                $mcq_tb,
                $mcq_kho,
                $essay_de,
                $essay_tb,
                $essay_kho,
                $reading_de,
                $reading_tb,
                $reading_kho,
                $diem_tracnghiem,
                $diem_tuluan,
                $diem_dochieu,
                $trangthai
            );

            if (!mysqli_stmt_execute($stmt)) {
                throw new Exception("Execute failed: " . mysqli_stmt_error($stmt));
            }

            $made = mysqli_insert_id($this->con);
            mysqli_stmt_close($stmt);

            if ($made <= 0) {
                throw new Exception("Insert_id invalid");
            }

            if (!empty($chuong)) {
                $this->create_chuongdethi($made, $chuong);
            }
            if (!empty($nhom)) {
                $this->create_giaodethi($made, $nhom);
            }

            if ($loaide == 1 && !empty($socau)) {
                $addedQuestions = $this->addQuestionsToAutoTest($made, $socau, $chuong, $monthi, $loaicauhoi);

                // ===== Cập nhật thứ tự câu hỏi theo checkbox đảo =====
                if (!empty($addedQuestions)) {
                    if ($daocauhoi) {
                        shuffle($addedQuestions);
                    } else {
                        sort($addedQuestions, SORT_NUMERIC);
                    }

                    $stmtUpdate = mysqli_prepare($this->con, "UPDATE chitietdethi SET thutu = ? WHERE made = ? AND macauhoi = ?");
                    foreach ($addedQuestions as $index => $macauhoi) {
                        $thutu = $index + 1;
                        mysqli_stmt_bind_param($stmtUpdate, "iis", $thutu, $made, $macauhoi);
                        mysqli_stmt_execute($stmtUpdate);
                    }
                    mysqli_stmt_close($stmtUpdate);
                }
            }

            return $made;

        } catch (\Exception $e) {
            return false;
        }
    }






    private function addQuestionsToAutoTest($made, $socau, $chuong, $monthi, $loaicauhoi)
    {
        try {
            $cauhoiModel = new CauHoiModel($this->con);
            $addedQuestions = [];

            foreach ($socau as $type => $levels) {

                foreach (['de', 'tb', 'kho'] as $level) {
                    $qty = intval($levels[$level] ?? 0);
                    if ($qty <= 0) {
                        continue;
                    }

                    $levelMap = ['de' => '1', 'tb' => '2', 'kho' => '3'];
                    $levelNum = $levelMap[$level];

                    if ($type === 'reading') {
                        $questions = $cauhoiModel->getReadingQuestions($chuong, $monthi, $levelNum, $qty);
                    } else {
                        $questions = $cauhoiModel->getQuestions($chuong, $monthi, $levelNum, [$type], $qty);
                    }

                    if ($questions === false) {
                        throw new Exception("SQL error when fetching $type level $levelNum");
                    }

                    foreach ($questions as $q) {
                        $sql = "INSERT INTO chitietdethi (made, macauhoi) VALUES (?, ?)";
                        $stmt = mysqli_prepare($this->con, $sql);
                        if (!$stmt) {
                            continue;
                        }
                        mysqli_stmt_bind_param($stmt, "ii", $made, $q['macauhoi']);
                        mysqli_stmt_execute($stmt);
                        mysqli_stmt_close($stmt);

                        $addedQuestions[] = $q['macauhoi']; // lưu lại để sort/shuffle sau
                    }
                }
            }

            return $addedQuestions; // Trả về mảng các macauhoi đã thêm
        } catch (\Exception $e) {
            return []; // trả về mảng rỗng thay vì false
        }
    }



    // Sửa addCauHoiToDeThi để dùng đúng macauhoi
    public function addCauHoiToDeThi($made, $macauhoi)
    {
        try {
            $made = intval($made);
            $macauhoi = intval($macauhoi);

            $sql = "INSERT INTO chitietdethi(made, macauhoi) VALUES (?, ?)";
            $stmt = mysqli_prepare($this->con, $sql);

            if (!$stmt) {
                return false;
            }

            mysqli_stmt_bind_param($stmt, "ii", $made, $macauhoi);

            if (!mysqli_stmt_execute($stmt)) {
                mysqli_stmt_close($stmt);
                return false;
            }

            mysqli_stmt_close($stmt);
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    // ===== CẬP NHẬT CHƯƠNG CỦA ĐỀ TỰ ĐỘNG =====
    public function update_chuongdethi($made, $chuong)
    {
        try {
            $made = (int)$made;

            // Xóa toàn bộ chương cũ (an toàn hơn dùng prepare)
            $sql_del = "DELETE FROM dethitudong WHERE made = ?";
            $stmt_del = mysqli_prepare($this->con, $sql_del);
            if (!$stmt_del) {
                return false;
            }
            mysqli_stmt_bind_param($stmt_del, "i", $made);
            mysqli_stmt_execute($stmt_del);
            mysqli_stmt_close($stmt_del);

            // Nếu không có chương mới → xóa xong là được
            if (empty($chuong) || !is_array($chuong)) {
                return true;
            }

            // Thêm chương mới
            return $this->create_chuongdethi($made, $chuong);
        } catch (Exception $e) {
            return false;
        }
    }

    // ===== CẬP NHẬT NHÓM ĐƯỢC GIAO ĐỀ =====
    public function update_giaodethi($made, $nhom)
    {
        try {
            $made = (int)$made;

            // Xóa toàn bộ nhóm cũ
            $sql_del = "DELETE FROM giaodethi WHERE made = ?";
            $stmt_del = mysqli_prepare($this->con, $sql_del);
            if (!$stmt_del) {
                return false;
            }
            mysqli_stmt_bind_param($stmt_del, "i", $made);
            mysqli_stmt_execute($stmt_del);
            mysqli_stmt_close($stmt_del);

            // Nếu không có nhóm mới → xong
            if (empty($nhom) || !is_array($nhom)) {
                return true;
            }

            // Thêm nhóm mới
            return $this->create_giaodethi($made, $nhom);
        } catch (Exception $e) {
            return false;
        }
    }

    // ===== TẠO MỚI CHƯƠNG CHO ĐỀ =====
    public function create_chuongdethi($made, $chuong)
    {
        try {
            $made = (int)$made;
            $chuong = array_unique(array_map('intval', $chuong)); // loại trùng + ép kiểu

            $sql = "INSERT IGNORE INTO dethitudong (made, machuong) VALUES (?, ?)";
            $stmt = mysqli_prepare($this->con, $sql);
            if (!$stmt) {
                return false;
            }

            foreach ($chuong as $machuong) {
                mysqli_stmt_bind_param($stmt, "ii", $made, $machuong);
                if (!mysqli_stmt_execute($stmt)) {
                    // Không return false ngay → vẫn cố insert các cái còn lại
                }
            }

            mysqli_stmt_close($stmt);
            return true;
        } catch (Exception $e) {
            return false;
        }
    }

    // ===== TẠO MỚI NHÓM ĐƯỢC GIAO ĐỀ =====
    public function create_giaodethi($made, $nhom)
    {
        try {
            $made = (int)$made;
            $nhom = array_unique(array_map('intval', $nhom));

            $sql_check = "SELECT manhom FROM nhom WHERE manhom = ? AND trangthai != 0 LIMIT 1";
            $stmt_check = mysqli_prepare($this->con, $sql_check);

            $sql_insert = "INSERT IGNORE INTO giaodethi (made, manhom) VALUES (?, ?)";
            $stmt_insert = mysqli_prepare($this->con, $sql_insert);
            if (!$stmt_insert) {
                return false;
            }

            foreach ($nhom as $manhom) {
                // Kiểm tra nhóm có tồn tại và đang hoạt động
                if ($stmt_check) {
                    mysqli_stmt_bind_param($stmt_check, "i", $manhom);
                    mysqli_stmt_execute($stmt_check);
                    $result = mysqli_stmt_get_result($stmt_check);
                    if (mysqli_num_rows($result) == 0) {
                        continue; // bỏ qua nhóm không hợp lệ
                    }
                    mysqli_free_result($result);
                }

                // Insert
                mysqli_stmt_bind_param($stmt_insert, "ii", $made, $manhom);
                mysqli_stmt_execute($stmt_insert);
            }

            if ($stmt_check) {
                mysqli_stmt_close($stmt_check);
            }
            mysqli_stmt_close($stmt_insert);

            return true;
        } catch (Exception $e) {
            return false;
        }
    }
    public function create_dethi_auto($made, $monhoc, $chuong, $socaude, $socautb, $socaukho, $loai_cauhoi = [])
    {
        // Lấy thông tin đề thi
        $sql_dethi = "SELECT troncauhoi, trondapan FROM dethi WHERE made = '$made'";
        $dethi_data = mysqli_fetch_assoc(mysqli_query($this->con, $sql_dethi));
        $troncauhoi = $dethi_data['troncauhoi'];
        $trondapan  = $dethi_data['trondapan'];

        $orderBy = $troncauhoi == 1 ? "ORDER BY RAND()" : "ORDER BY ch.macauhoi ASC";

        // CHUẨN HÓA CHƯƠNG
        $listChuong = implode(",", array_map(function ($c) {
            return "'" . $c . "'";
        }, $chuong));

        $data = [];

        // ----------------------------
        // 1) MCQ (luôn lấy)
        // ----------------------------
        $data = array_merge($data, $this->fetchQuestionsByType('mcq', $monhoc, $listChuong, $socaude, $socautb, $socaukho, $trondapan, $orderBy));

        // ----------------------------
        // 2) Các loại khác nếu có
        // ----------------------------
        if (in_array('essay', $loai_cauhoi)) {
            $data = array_merge($data, $this->fetchQuestionsByType('essay', $monhoc, $listChuong, $socaude, $socautb, $socaukho, $trondapan, $orderBy));
        }

        if (in_array('reading', $loai_cauhoi)) {
            // lấy block đọc hiểu
            $sql_dv = "SELECT * FROM doan_van WHERE mamonhoc='$monhoc' AND machuong IN ($listChuong) AND trangthai != 0";
            $res_dv = mysqli_query($this->con, $sql_dv);

            $reading_blocks = [];
            while ($dv = mysqli_fetch_assoc($res_dv)) {
                $sql_cau = "SELECT * FROM cauhoi WHERE loai='reading' AND trangthai!=0 AND madv={$dv['madv']} ORDER BY macauhoi ASC";
                $res_cau = mysqli_query($this->con, $sql_cau);

                $questions = [];
                while ($q = mysqli_fetch_assoc($res_cau)) {
                    $sql_ans = "SELECT * FROM cautraloi WHERE macauhoi = {$q['macauhoi']} ORDER BY macautl ASC";
                    $ans = mysqli_query($this->con, $sql_ans);
                    $q['answers'] = [];
                    while ($a = mysqli_fetch_assoc($ans)) {
                        $q['answers'][] = $a;
                    }
                    $questions[] = $q;
                }

                $reading_blocks[] = [
                    "type" => "reading_block",
                    "doanvan" => $dv,
                    "questions" => $questions
                ];
            }

            if ($troncauhoi == 1) {
                shuffle($reading_blocks);
            }

            $data = array_merge($data, $reading_blocks);
        }

        return [
            "valid" => true,
            "data" => $data
        ];
    }

    private function fetchQuestionsByType($type, $monhoc, $listChuong, $socaude, $socautb, $socaukho, $trondapan, $orderBy)
    {
        $data = [];
        $levels = ['1' => $socaude, '2' => $socautb, '3' => $socaukho];
        foreach ($levels as $dokho => $limit) {
            $sql = "SELECT * FROM cauhoi WHERE loai='$type' AND mamonhoc='$monhoc' AND dokho=$dokho AND trangthai!=0 AND machuong IN ($listChuong) $orderBy LIMIT $limit";
            $res = mysqli_query($this->con, $sql);

            while ($row = mysqli_fetch_assoc($res)) {
                if ($type === 'mcq') {
                    $sql_ans = "SELECT * FROM cautraloi WHERE macauhoi = {$row['macauhoi']} ORDER BY macautl ASC";
                    $ans_res = mysqli_query($this->con, $sql_ans);
                    $answers = [];
                    while ($a = mysqli_fetch_assoc($ans_res)) {
                        $answers[] = $a;
                    }
                    if ($trondapan == 1) {
                        shuffle($answers);
                    }
                    $row['answers'] = $answers;
                }
                $data[] = $row;
            }
        }
        return $data;
    }


    public function update(
        $made,
        $monthi,
        $nguoitao,
        $tende,
        $thoigianthi,
        $thoigianbatdau,
        $thoigianketthuc,
        $hienthibailam,
        $xemdiemthi,
        $xemdapan,
        $daocauhoi,
        $daodapan,
        $tudongnop,
        $loaide,
        $socau_json,
        $chuong,
        $nhom,
        $loaicauhoi,
        $diem_tracnghiem = 0,
        $diem_tuluan = 0,
        $diem_dochieu = 0
    ) {
        try {
            $made_int = (int)$made;

            // 1. Kiểm tra đề đã có thí sinh làm chưa
            $checkSql = "SELECT makq FROM ketqua WHERE made = ? LIMIT 1";
            $checkStmt = mysqli_prepare($this->con, $checkSql);
            mysqli_stmt_bind_param($checkStmt, "i", $made_int);
            mysqli_stmt_execute($checkStmt);
            mysqli_stmt_store_result($checkStmt);
            $hasResult = mysqli_stmt_num_rows($checkStmt) > 0;
            mysqli_stmt_close($checkStmt);

            // 2. Lấy dữ liệu cũ (số câu + điểm)
            $sqlOld = "
            SELECT 
                mcq_de, mcq_tb, mcq_kho,
                essay_de, essay_tb, essay_kho,
                reading_de, reading_tb, reading_kho,
                diem_tracnghiem, diem_tuluan, diem_dochieu
            FROM dethi 
            WHERE made = ? LIMIT 1
        ";
            $stmtOld = mysqli_prepare($this->con, $sqlOld);
            mysqli_stmt_bind_param($stmtOld, "i", $made_int);
            mysqli_stmt_execute($stmtOld);
            mysqli_stmt_bind_result(
                $stmtOld,
                $old_mcq_de,
                $old_mcq_tb,
                $old_mcq_kho,
                $old_essay_de,
                $old_essay_tb,
                $old_essay_kho,
                $old_reading_de,
                $old_reading_tb,
                $old_reading_kho,
                $old_diem_mcq,
                $old_diem_essay,
                $old_diem_reading
            );
            mysqli_stmt_fetch($stmtOld);
            mysqli_stmt_close($stmtOld);

            // 3. Parse số câu mới
            $socau = json_decode($socau_json ?? '{}', true) ?: [];
            $mcq_de  = (int)($socau['mcq']['de'] ?? 0);
            $mcq_tb  = (int)($socau['mcq']['tb'] ?? 0);
            $mcq_kho = (int)($socau['mcq']['kho'] ?? 0);
            $essay_de  = (int)($socau['essay']['de'] ?? 0);
            $essay_tb  = (int)($socau['essay']['tb'] ?? 0);
            $essay_kho = (int)($socau['essay']['kho'] ?? 0);
            $reading_de  = (int)($socau['reading']['de'] ?? 0);
            $reading_tb  = (int)($socau['reading']['tb'] ?? 0);
            $reading_kho = (int)($socau['reading']['kho'] ?? 0);

            // 4. Nếu đã có thí sinh làm → chặn thay đổi số lượng câu hỏi & điểm
            if ($hasResult) {
                if (
                    $mcq_de != $old_mcq_de || $mcq_tb != $old_mcq_tb || $mcq_kho != $old_mcq_kho ||
                    $essay_de != $old_essay_de || $essay_tb != $old_essay_tb || $essay_kho != $old_essay_kho ||
                    $reading_de != $old_reading_de || $reading_tb != $old_reading_tb || $reading_kho != $old_reading_kho
                ) {
                    return ["success" => false, "error" => "Đề đã có thí sinh làm, không được thay đổi số lượng câu hỏi!"];
                }

                if (
                    $diem_tracnghiem != $old_diem_mcq ||
                    $diem_tuluan != $old_diem_essay ||
                    $diem_dochieu != $old_diem_reading
                ) {
                    return ["success" => false, "error" => "Đề đã có thí sinh làm, không được thay đổi điểm!"];
                }
            }

            // 5. Cập nhật bảng dethi (luôn cập nhật, kể cả daocauhoi)
            $sql = "UPDATE dethi SET
            monthi=?, nguoitao=?, tende=?, thoigianthi=?, thoigianbatdau=?, thoigianketthuc=?,
            hienthibailam=?, xemdiemthi=?, xemdapan=?, troncauhoi=?, trondapan=?, nopbaichuyentab=?,
            loaide=?,
            mcq_de=?, mcq_tb=?, mcq_kho=?,
            essay_de=?, essay_tb=?, essay_kho=?,
            reading_de=?, reading_tb=?, reading_kho=?,
            diem_tracnghiem=?, diem_tuluan=?, diem_dochieu=?
            WHERE made=?";

            $stmt = mysqli_prepare($this->con, $sql);
            $types = "sssissiiiiiiiiiiiiiiiidddi";
            mysqli_stmt_bind_param(
                $stmt,
                $types,
                $monthi,
                $nguoitao,
                $tende,
                $thoigianthi,
                $thoigianbatdau,
                $thoigianketthuc,
                $hienthibailam,
                $xemdiemthi,
                $xemdapan,
                $daocauhoi,
                $daodapan,
                $tudongnop,
                $loaide,
                $mcq_de,
                $mcq_tb,
                $mcq_kho,
                $essay_de,
                $essay_tb,
                $essay_kho,
                $reading_de,
                $reading_tb,
                $reading_kho,
                $diem_tracnghiem,
                $diem_tuluan,
                $diem_dochieu,
                $made_int
            );
            mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);

            // 6. Cập nhật chương & nhóm
            $this->update_chuongdethi($made, $chuong);
            $this->update_giaodethi($made, $nhom);

            // ==============================
            // 7. XỬ LÝ ĐỀ TỰ ĐỘNG + ĐẢO CÂU HỎI
            // ==============================
            if ($loaide == 1) { // Chỉ áp dụng cho đề tự động
                if (!$hasResult) {
                    // Trường hợp 1: Chưa có ai làm → Tạo lại đề mới hoàn toàn (random mới)
                    mysqli_query($this->con, "DELETE FROM chitietdethi WHERE made = " . (int)$made);
                    $this->addQuestionsToAutoTest($made, $socau, $chuong, $monthi, $loaicauhoi);
                }
                // Nếu đã có thí sinh làm → giữ nguyên danh sách câu hỏi cũ, chỉ thay đổi thứ tự
            }

            // Lấy danh sách câu hỏi hiện tại trong chitietdethi
            $questions = [];
            $query = "SELECT macauhoi FROM chitietdethi WHERE made = ? ORDER BY thutu";
            $stmt = mysqli_prepare($this->con, $query);
            mysqli_stmt_bind_param($stmt, "i", $made_int);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_bind_result($stmt, $macauhoi);
            while (mysqli_stmt_fetch($stmt)) {
                $questions[] = $macauhoi;
            }
            mysqli_stmt_close($stmt);

            // Xác định thứ tự mới dựa trên $daocauhoi
            if ($daocauhoi) {
                // Bật đảo → shuffle ngẫu nhiên (chỉ áp dụng cho danh sách hiện tại)
                shuffle($questions);
            } else {
                // Tắt đảo → sắp xếp lại theo thứ tự gốc (thutu = 1,2,3...)
                // Ta sẽ dùng macauhoi tăng dần làm gốc (hoặc bạn có thể lưu thứ tự gốc ở đâu đó)
                sort($questions, SORT_NUMERIC);
            }

            // Cập nhật lại thứ tự thutu = 1,2,3... theo mảng mới
            if (!empty($questions)) {
                $stmtUpdate = mysqli_prepare($this->con, "UPDATE chitietdethi SET thutu = ? WHERE made = ? AND macauhoi = ?");
                foreach ($questions as $index => $macauhoi) {
                    $thutu = $index + 1;
                    mysqli_stmt_bind_param($stmtUpdate, "iii", $thutu, $made_int, $macauhoi);
                    mysqli_stmt_execute($stmtUpdate);
                }
                mysqli_stmt_close($stmtUpdate);
            }

            return ['success' => true];

        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }
    public function delete($made)
    {
        mysqli_begin_transaction($this->con);
        try {
            // Kiểm tra bảng ketqua trước
            $sql_check_ketqua = "SELECT COUNT(*) as count FROM `ketqua` WHERE `made` = ?";
            $stmt_check_ketqua = mysqli_prepare($this->con, $sql_check_ketqua);
            if (!$stmt_check_ketqua) {
                throw new Exception("Lỗi chuẩn bị truy vấn kiểm tra kết quả thi: " . mysqli_error($this->con));
            }
            mysqli_stmt_bind_param($stmt_check_ketqua, "s", $made);
            mysqli_stmt_execute($stmt_check_ketqua);
            $result_check_ketqua = mysqli_stmt_get_result($stmt_check_ketqua);
            $row_ketqua = mysqli_fetch_assoc($result_check_ketqua);
            mysqli_stmt_close($stmt_check_ketqua);
            if ($row_ketqua['count'] > 0) {
                throw new Exception("Không thể xóa đề thi vì đã có {$row_ketqua['count']} thí sinh hoàn thành bài thi.");
            }

            // Lấy danh sách manhom từ giaodethi
            $sql_get_manhom = "SELECT DISTINCT manhom FROM `giaodethi` WHERE `made` = ?";
            $stmt_get_manhom = mysqli_prepare($this->con, $sql_get_manhom);
            if (!$stmt_get_manhom) {
                throw new Exception("Lỗi chuẩn bị truy vấn lấy mã nhóm: " . mysqli_error($this->con));
            }
            mysqli_stmt_bind_param($stmt_get_manhom, "s", $made);
            mysqli_stmt_execute($stmt_get_manhom);
            $result_manhom = mysqli_stmt_get_result($stmt_get_manhom);
            $manhom_list = [];
            while ($row = mysqli_fetch_assoc($result_manhom)) {
                $manhom_list[] = $row['manhom'];
            }
            mysqli_stmt_close($stmt_get_manhom);

            // Xóa bản ghi trong trangthaithongbao dựa trên matb từ chitietthongbao
            if (!empty($manhom_list)) {
                $placeholders = implode(',', array_fill(0, count($manhom_list), '?'));
                $sql_delete_trangthaithongbao = "DELETE FROM `trangthaithongbao` WHERE `matb` IN (SELECT `matb` FROM `chitietthongbao` WHERE `manhom` IN ($placeholders))";
                $stmt_delete_trangthaithongbao = mysqli_prepare($this->con, $sql_delete_trangthaithongbao);
                if (!$stmt_delete_trangthaithongbao) {
                    throw new Exception("Lỗi chuẩn bị truy vấn xóa trạng thái thông báo: " . mysqli_error($this->con));
                }
                mysqli_stmt_bind_param($stmt_delete_trangthaithongbao, str_repeat('s', count($manhom_list)), ...$manhom_list);
                mysqli_stmt_execute($stmt_delete_trangthaithongbao);
                mysqli_stmt_close($stmt_delete_trangthaithongbao);

                // Xóa bản ghi trong chitietthongbao
                $sql_delete_chitietthongbao = "DELETE FROM `chitietthongbao` WHERE `manhom` IN ($placeholders)";
                $stmt_delete_chitietthongbao = mysqli_prepare($this->con, $sql_delete_chitietthongbao);
                if (!$stmt_delete_chitietthongbao) {
                    throw new Exception("Lỗi chuẩn bị truy vấn xóa chi tiết thông báo: " . mysqli_error($this->con));
                }
                mysqli_stmt_bind_param($stmt_delete_chitietthongbao, str_repeat('s', count($manhom_list)), ...$manhom_list);
                mysqli_stmt_execute($stmt_delete_chitietthongbao);
                mysqli_stmt_close($stmt_delete_chitietthongbao);

                // Xóa bản ghi trong thongbao (chỉ xóa những thông báo không còn liên kết với nhóm nào)
                $sql_delete_thongbao = "DELETE FROM `thongbao` WHERE `matb` NOT IN (SELECT `matb` FROM `chitietthongbao`)";
                $stmt_delete_thongbao = mysqli_query($this->con, $sql_delete_thongbao);
                if (!$stmt_delete_thongbao) {
                    throw new Exception("Lỗi xóa thông báo: " . mysqli_error($this->con));
                }
            }

            // Xóa bản ghi trong chitietdethi
            $sql_delete_chitietdethi = "DELETE FROM `chitietdethi` WHERE `made` = ?";
            $stmt_delete_chitietdethi = mysqli_prepare($this->con, $sql_delete_chitietdethi);
            if (!$stmt_delete_chitietdethi) {
                throw new Exception("Lỗi chuẩn bị truy vấn xóa chi tiết đề thi: " . mysqli_error($this->con));
            }
            mysqli_stmt_bind_param($stmt_delete_chitietdethi, "s", $made);
            mysqli_stmt_execute($stmt_delete_chitietdethi);
            mysqli_stmt_close($stmt_delete_chitietdethi);

            // Xóa bản ghi trong dethitudong
            $sql_delete_dethitudong = "DELETE FROM `dethitudong` WHERE `made` = ?";
            $stmt_delete_dethitudong = mysqli_prepare($this->con, $sql_delete_dethitudong);
            if (!$stmt_delete_dethitudong) {
                throw new Exception("Lỗi chuẩn bị truy vấn xóa đề thi tự động: " . mysqli_error($this->con));
            }
            mysqli_stmt_bind_param($stmt_delete_dethitudong, "s", $made);
            mysqli_stmt_execute($stmt_delete_dethitudong);
            mysqli_stmt_close($stmt_delete_dethitudong);

            // Xóa bản ghi trong giaodethi
            $sql_delete_giaodethi = "DELETE FROM `giaodethi` WHERE `made` = ?";
            $stmt_delete_giaodethi = mysqli_prepare($this->con, $sql_delete_giaodethi);
            if (!$stmt_delete_giaodethi) {
                throw new Exception("Lỗi chuẩn bị truy vấn xóa giao đề thi: " . mysqli_error($this->con));
            }
            mysqli_stmt_bind_param($stmt_delete_giaodethi, "s", $made);
            mysqli_stmt_execute($stmt_delete_giaodethi);
            mysqli_stmt_close($stmt_delete_giaodethi);

            // Xóa đề thi
            $sql = "DELETE FROM `dethi` WHERE `made` = ?";
            $stmt = mysqli_prepare($this->con, $sql);
            if (!$stmt) {
                throw new Exception("Lỗi chuẩn bị truy vấn xóa đề thi: " . mysqli_error($this->con));
            }
            mysqli_stmt_bind_param($stmt, "s", $made);
            $success = mysqli_stmt_execute($stmt);
            $affected_rows = mysqli_stmt_affected_rows($stmt);
            mysqli_stmt_close($stmt);

            if ($success && $affected_rows > 0) {
                mysqli_commit($this->con);
                return [
                    'success' => true,
                    'message' => 'Xóa đề thi thành công!'
                ];
            } else {
                throw new Exception("Không tìm thấy đề thi hoặc không thể xóa.");
            }
        } catch (Exception $e) {
            mysqli_rollback($this->con);
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    public function getAll($nguoitao)
    {
        $sql = "SELECT dethi.made, tende, monhoc.tenmonhoc, thoigianbatdau, thoigianketthuc, nhom.tennhom, namhoc, hocky
        FROM dethi, monhoc, giaodethi, nhom
        WHERE dethi.monthi = monhoc.mamonhoc AND dethi.made = giaodethi.made AND nhom.manhom = giaodethi.manhom AND nguoitao = $nguoitao AND dethi.trangthai = 1
        ORDER BY dethi.made DESC";
        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $made = $row['made'];
            $index = array_search($made, array_column($rows, 'made'));
            if ($index === false) {
                $item = [
                    "made" => $made,
                    "tende" => $row['tende'],
                    "thoigianbatdau" => date_format(date_create($row['thoigianbatdau']), "H:i d/m/Y"),
                    "thoigianketthuc" => date_format(date_create($row['thoigianketthuc']), "H:i d/m/Y"),
                    "tenmonhoc" => $row['tenmonhoc'],
                    "namhoc" => $row['namhoc'],
                    "hocky" => $row['hocky'],
                    "nhom" => [$row['tennhom']]
                ];
                array_push($rows, $item);
            } else {
                array_push($rows[$index]["nhom"], $row['tennhom']);
            }
        }
        return $rows;
    }

    public function getById($made)
    {
        $sql_dethi = "SELECT dethi.*, monhoc.tenmonhoc FROM dethi, monhoc WHERE made = $made AND dethi.monthi = monhoc.mamonhoc";
        $result_dethi = mysqli_query($this->con, $sql_dethi);
        $dethi = mysqli_fetch_assoc($result_dethi);
        if ($dethi != null) {
            $sql_giaodethi = "SELECT manhom FROM giaodethi WHERE made = $made";
            $sql_dethitudong = "SELECT machuong FROM dethitudong WHERE made = $made";
            $result_giaodethi = mysqli_query($this->con, $sql_giaodethi);
            $result_dethitudong = mysqli_query($this->con, $sql_dethitudong);
            $dethi['chuong'] = array();
            while ($row = mysqli_fetch_assoc($result_dethitudong)) {
                $dethi['chuong'][] = $row['machuong'];
            }
            $dethi['nhom'] = array();
            while ($row = mysqli_fetch_assoc($result_giaodethi)) {
                $dethi['nhom'][] = $row['manhom'];
            }
        }
        return $dethi;
    }

    public function getInfoTestBasic($made)
    {
        $sql_dethi = "SELECT dethi.made, dethi.tende, dethi.thoigiantao,dethi.loaide,dethi.nguoitao,monhoc.mamonhoc, monhoc.tenmonhoc FROM dethi, monhoc WHERE made = $made AND dethi.monthi = monhoc.mamonhoc";
        $result_dethi = mysqli_query($this->con, $sql_dethi);
        $dethi = mysqli_fetch_assoc($result_dethi);
        if ($dethi != null) {
            $sql_giaodethi = "SELECT giaodethi.manhom, nhom.tennhom FROM giaodethi, nhom WHERE made = $made AND giaodethi.manhom = nhom.manhom";
            $result_giaodethi = mysqli_query($this->con, $sql_giaodethi);
            $dethi['nhom'] = array();
            while ($row = mysqli_fetch_assoc($result_giaodethi)) {
                $dethi['nhom'][] = $row;
            }
        }
        return $dethi;
    }

    public function getListTestGroup($manhom)
    {
        $sql = "SELECT dethi.made, dethi.tende, dethi.thoigianbatdau, dethi.thoigianketthuc
        FROM giaodethi, dethi
        WHERE manhom = '$manhom' AND giaodethi.made = dethi.made ORDER BY dethi.made DESC";
        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $row['thoigianbatdau'] = date_format(date_create($row['thoigianbatdau']), "H:i d/m/Y");
            $row['thoigianketthuc'] = date_format(date_create($row['thoigianketthuc']), "H:i d/m/Y");
            $rows[] = $row;
        }
        return $rows;
    }

    public function getQuestionOfTest($made)
    {
        $sql_dethi = "select * from dethi where made = '$made'";
        $data_dethi = mysqli_fetch_assoc(mysqli_query($this->con, $sql_dethi));
        $question = array();
        if ($data_dethi['loaide'] == 0) {
            $question = $this->getQuestionOfTestManual($made);
        } else {
            $question = $this->getQuestionTestAuto($made);
        }
        $makq = $this->getMaDe($made, $_SESSION['user_id']);
        foreach ($question as $data) {
            $macauhoi = $data['macauhoi'];
            $sql = "INSERT INTO `chitietketqua`(`makq`, `macauhoi`) VALUES ('$makq','$macauhoi')";
            $addCtKq = mysqli_query($this->con, $sql);
        }

        return $question;
    }




public function getQuestionByUser($made, $user)
{
    $made = intval($made);
    $user = trim($user);
    $rows = [];
    $ctlmodel = new CauTraLoiModel();

    // ===== 1. LẤY THÔNG TIN ĐỀ THI (để đổ vào nav) =====
    $sql_dethi = "SELECT d.tende, d.thoigianthi, d.thoigianbatdau, d.thoigianketthuc,
                         m.tenmonhoc, d.troncauhoi, d.trondapan, d.loaide
                  FROM dethi d 
                  JOIN monhoc m ON d.monthi = m.mamonhoc 
                  WHERE d.made = ? LIMIT 1";
    $stmt = mysqli_prepare($this->con, $sql_dethi);
    mysqli_stmt_bind_param($stmt, "i", $made);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    $dethi_info = mysqli_fetch_assoc($res) ?: [];
    mysqli_stmt_close($stmt);

    // Nếu không có đề → trả về ngay
    if (empty($dethi_info)) {
        return ['dethi' => [], 'cauhoi' => []];
    }

    $troncauhoi = $dethi_info['troncauhoi'];
    $trondapan  = $dethi_info['trondapan'];
    $loaide     = $dethi_info['loaide'];

    // ===== 2. Lấy makq (nếu đã có kết quả) =====
    $sql_kq = "SELECT makq FROM ketqua WHERE made = ? AND manguoidung = ? LIMIT 1";
    $stmt = mysqli_prepare($this->con, $sql_kq);
    mysqli_stmt_bind_param($stmt, "is", $made, $user);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    $kq = mysqli_fetch_assoc($res);
    mysqli_stmt_close($stmt);
    $makq = $kq['makq'] ?? 0;

    // ===== 3. Lấy toàn bộ câu hỏi =====
    $sql = "
        SELECT ch.macauhoi, ch.noidung, ch.dokho, ch.loai, ch.hinhanh,
               dv.noidung AS context, dv.tieude AS tieude_context,
               ctdt.thutu AS thutu_goc,
               ctkq.dapanchon
        FROM chitietdethi ctdt
        JOIN cauhoi ch ON ctdt.macauhoi = ch.macauhoi
        LEFT JOIN doan_van dv ON ch.madv = dv.madv
        LEFT JOIN chitietketqua ctkq ON ch.macauhoi = ctkq.macauhoi AND ctkq.makq = ?
        WHERE ctdt.made = ? AND ch.trangthai = 1
        ORDER BY ctdt.thutu ASC
    ";
    $stmt = mysqli_prepare($this->con, $sql);
    mysqli_stmt_bind_param($stmt, "ii", $makq, $made);
    mysqli_stmt_execute($stmt);
    $res_sql = mysqli_stmt_get_result($stmt);

    while ($row = mysqli_fetch_assoc($res_sql)) {
        $row['thutu'] = intval($row['thutu_goc']);

        // Xử lý đáp án
        if ($row['loai'] === 'mcq' || $row['loai'] === 'reading') {
            $arr = $row['dapanchon']
                ? [['macautl' => $row['dapanchon'], 'noidungtl' => $row['dapanchon']]]
                : $ctlmodel->getAllWithoutAnswer($row['macauhoi']);

            if ($trondapan) {
                shuffle($arr);
            }
            $row['cautraloi'] = $arr;
        } else {
            // essay
            $row['cautraloi'] = $ctlmodel->getAllWithoutAnswer($row['macauhoi']);
        }

        if (!empty($row['hinhanh'])) {
            $row['hinhanh'] = base64_encode($row['hinhanh']);
        }

        $rows[] = $row;
    }
    mysqli_stmt_close($stmt);

    if ($loaide == 1 && $troncauhoi == 1) {
        $shuffled = $rows;
        shuffle($shuffled);
        foreach ($shuffled as $k => $r) {
            $shuffled[$k]['thutu_hien_thi'] = $k + 1;
        }
        $rows = $shuffled;
    }

    return [
        'dethi'  => $dethi_info,   
        'cauhoi' => $rows
    ];
}





    public function getAllSubjects($userid)
    {
        $sql = "
        SELECT DISTINCT MH.mamonhoc, MH.tenmonhoc
        FROM monhoc MH
        JOIN phancong PC ON PC.mamonhoc = MH.mamonhoc
        WHERE PC.manguoidung = ? 
          AND PC.trangthai = 1
        ORDER BY MH.tenmonhoc ASC
    ";

        $stmt = mysqli_prepare($this->con, $sql);

        if (!$stmt) {
            throw new Exception("Lỗi prepare: " . mysqli_error($this->con));
        }

        mysqli_stmt_bind_param($stmt, "s", $userid);

        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception("Lỗi execute: " . mysqli_stmt_error($stmt));
        }

        $result = mysqli_stmt_get_result($stmt);
        if (!$result) {
            mysqli_stmt_close($stmt);
            throw new Exception("Lỗi get_result: " . mysqli_error($this->con));
        }

        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }

        mysqli_stmt_close($stmt);
        return $rows;
    }


    public function getMaDe($made, $user)
    {
        $sql = "SELECT * FROM `ketqua` WHERE made = '$made' and manguoidung = '$user'";
        $result = mysqli_query($this->con, $sql);
        $data = mysqli_fetch_assoc($result);
        return $data['makq'];
    }

    public function getQuestionTestAuto($made)
    {
        $sql_dethi = "SELECT * FROM dethi WHERE made = '$made'";
        $data_dethi = mysqli_fetch_assoc(mysqli_query($this->con, $sql_dethi));

        // Lấy đúng cột theo CSDL
        $socaude   = $data_dethi['mcq_de'];
        $socautb   = $data_dethi['mcq_tb'];
        $socaukho  = $data_dethi['mcq_kho'];
        $mamonhoc  = $data_dethi['monthi'];
        $troncauhoi = $data_dethi['troncauhoi'];

        // Nếu không xáo trộn thì ORDER BY cố định
        $orderBy = $troncauhoi == 1 ? "ORDER BY RAND()" : "ORDER BY ch.macauhoi ASC";

        // Câu dễ
        $sql_cd = "SELECT ch.macauhoi, ch.noidung, ch.dokho
        FROM dethitudong dttd
        JOIN cauhoi ch ON dttd.machuong = ch.machuong
        WHERE ch.dokho = 1
        AND dttd.made = '$made'
        AND ch.mamonhoc = '$mamonhoc'
        AND ch.trangthai != 0
        $orderBy
        LIMIT $socaude";

        // Trung bình
        $sql_ctb = "SELECT ch.macauhoi, ch.noidung, ch.dokho
        FROM dethitudong dttd
        JOIN cauhoi ch ON dttd.machuong = ch.machuong
        WHERE ch.dokho = 2
        AND dttd.made = '$made'
        AND ch.mamonhoc = '$mamonhoc'
        AND ch.trangthai != 0
        $orderBy
        LIMIT $socautb";

        // Khó
        $sql_ck = "SELECT ch.macauhoi, ch.noidung, ch.dokho
        FROM dethitudong dttd
        JOIN cauhoi ch ON dttd.machuong = ch.machuong
        WHERE ch.dokho = 3
        AND dttd.made = '$made'
        AND ch.mamonhoc = '$mamonhoc'
        AND ch.trangthai != 0
        $orderBy
        LIMIT $socaukho";

        $result_cd = mysqli_query($this->con, $sql_cd);
        $result_tb = mysqli_query($this->con, $sql_ctb);
        $result_ck = mysqli_query($this->con, $sql_ck);

        // Gom kết quả
        $result = [];
        while ($row = mysqli_fetch_assoc($result_cd)) {
            $result[] = $row;
        }
        while ($row = mysqli_fetch_assoc($result_tb)) {
            $result[] = $row;
        }
        while ($row = mysqli_fetch_assoc($result_ck)) {
            $result[] = $row;
        }

        // Chỉ xáo trộn khi bật
        if ($troncauhoi == 1) {
            shuffle($result);
        }

        // Lấy đáp án
        $rows = [];
        $ctlmodel = new CauTraLoiModel();

        foreach ($result as $row) {
            $row['cautraloi'] = $ctlmodel->getAllWithoutAnswer($row['macauhoi']);
            $rows[] = $row;
        }

        return $rows;
    }



    public function getNameGroup($manhom)
    {
        $sql = "SELECT * FROM `nhom` WHERE manhom=$manhom";
        $result = mysqli_query($this->con, $sql);
        $nameGroup = mysqli_fetch_assoc($result)['tennhom'];
        return $nameGroup;
    }
    public function getQuestionOfTestManual($made)
    {
        // Lấy thông tin đề thi
        $sql_dethi = "SELECT trondapan, troncauhoi FROM dethi WHERE made = ?";
        $stmt_dethi = mysqli_prepare($this->con, $sql_dethi);
        mysqli_stmt_bind_param($stmt_dethi, "i", $made);
        mysqli_stmt_execute($stmt_dethi);
        $result_dethi = mysqli_stmt_get_result($stmt_dethi);
        $dethi = mysqli_fetch_assoc($result_dethi);
        mysqli_stmt_close($stmt_dethi);

        $troncauhoi = $dethi['troncauhoi'] ?? 0;
        $trondapan = $dethi['trondapan'] ?? 0;

        // Lấy danh sách câu hỏi theo thứ tự
        $sql = "SELECT 
                CTDT.macauhoi, 
                CTDT.thutu,
                CH.noidung, 
                CH.dokho, 
                CH.loai, 
                CH.madv
            FROM chitietdethi CTDT
            JOIN cauhoi CH ON CTDT.macauhoi = CH.macauhoi
            WHERE CTDT.made = ?
            ORDER BY CTDT.thutu ASC";

        $stmt = mysqli_prepare($this->con, $sql);
        mysqli_stmt_bind_param($stmt, "i", $made);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);

        $rows = [];
        $ctlmodel = new CauTraLoiModel();

        while ($row = mysqli_fetch_assoc($result)) {
            $row['noidungplaintext'] = $row['noidung']; // luôn có trường cho JS
            $macauhoi = $row['macauhoi'];
            $loai = $row['loai'];

            // Lấy đáp án
            if ($loai === 'mcq' || $loai === 'reading') {
                $row['cautraloi'] = $ctlmodel->getAllWithoutAnswer($macauhoi);
                if ($trondapan == 1) {
                    shuffle($row['cautraloi']);
                }
            } elseif ($loai === 'essay') {
                $row['cautraloi'] = [];
            }

            // Nếu là reading và có madv, lấy đoạn văn
            if ($loai === 'reading' && !empty($row['madv'])) {
                $sql_dv = "SELECT tieude, noidung FROM doan_van WHERE madv = ? AND trangthai = 1";
                $stmt_dv = mysqli_prepare($this->con, $sql_dv);
                mysqli_stmt_bind_param($stmt_dv, "i", $row['madv']);
                mysqli_stmt_execute($stmt_dv);
                $result_dv = mysqli_stmt_get_result($stmt_dv);
                $doanvan = mysqli_fetch_assoc($result_dv);
                mysqli_stmt_close($stmt_dv);

                $row['doanvan_tieude'] = $doanvan['tieude'] ?? '';
                $row['doanvan_noidung'] = $doanvan['noidung'] ?? '';
            } else {
                $row['doanvan_tieude'] = '';
                $row['doanvan_noidung'] = '';
            }

            // Lưu nguyên madv để JS có thể group, không unset
            $rows[] = $row;
        }

        mysqli_stmt_close($stmt);

        // Trộn thứ tự câu hỏi nếu bật
        if ($troncauhoi == 1) {
            shuffle($rows);
        }

        return $rows;
    }


    public function getResultDetail($makq)
    {
        $makq = mysqli_real_escape_string($this->con, $makq);
        $sql = "SELECT 
    ch.macauhoi, 
    ch.noidung,
    ch.dokho,
    ch.loai,
    dv.noidung AS context,
    dv.tieude AS tieude_context,
    ct.dapanchon,

    -- Thí sinh trả lời tự luận
    tt.id AS traloi_id,
    tt.noidung AS noidung_tra_loi,
    tt.thoigianlam AS thoigianlam_tra_loi,

    -- Điểm GV chấm
    ctt.diem AS diem_cham_tuluan,

    -- Lấy toàn bộ hình ảnh trả lời
    GROUP_CONCAT(
        TO_BASE64(hinh.hinhanh)
        ORDER BY hinh.id SEPARATOR '||'
    ) AS ds_hinhanh_base64

FROM chitietdethi ctd
JOIN cauhoi ch 
    ON ctd.macauhoi = ch.macauhoi

LEFT JOIN chitietketqua ct 
    ON ct.macauhoi = ch.macauhoi AND ct.makq = '$makq'

LEFT JOIN traloi_tuluan tt 
    ON tt.macauhoi = ch.macauhoi AND tt.makq = '$makq'

LEFT JOIN cham_tuluan ctt 
    ON ctt.macauhoi = ch.macauhoi AND ctt.makq = '$makq'

LEFT JOIN doan_van dv 
    ON ch.madv = dv.madv
LEFT JOIN hinhanh_traloi_tuluan hinh 
    ON hinh.traloi_id = tt.id

WHERE 
    ctd.made = (SELECT made FROM ketqua WHERE makq = '$makq' LIMIT 1)

GROUP BY 
    ch.macauhoi

ORDER BY 
    ct.thutu ASC;
";

        $result = mysqli_query($this->con, $sql);
        if (!$result) {
            die("Query Error: " . mysqli_error($this->con));
        }

        $rows = [];
        $ctlmodel = new CauTraLoiModel();

        while ($row = mysqli_fetch_assoc($result)) {
            $row['cautraloi'] = $ctlmodel->getAll($row['macauhoi']);
            $row['dapanchon'] = $row['dapanchon'] ?? null;


            $rows[] = $row;
        }

        return $rows;
    }


    public function getTimeTest($dethi, $nguoidung)
    {
        $sql = "Select * from ketqua where made = '$dethi' and manguoidung = '$nguoidung'";
        $sql_dethi = "select * from dethi where made = '$dethi'";
        $result_dethi = mysqli_query($this->con, $sql_dethi);
        $result = mysqli_query($this->con, $sql);
        if ($result) {
            $data = mysqli_fetch_assoc($result);
            $data_dethi = mysqli_fetch_assoc($result_dethi);
            date_default_timezone_set('Asia/Ho_Chi_Minh');
            $thoigianketthuc = date("Y-m-d H:i:s", strtotime($data['thoigianvaothi']) + ($data_dethi['thoigianthi'] * 60));
            return $thoigianketthuc;
        }
        return false;
    }

    public function getTimeEndTest($dethi)
    {
        $sql_dethi = "select * from dethi where made = '$dethi'";
        $result_dethi = mysqli_query($this->con, $sql_dethi);
        $data_dethi = mysqli_fetch_assoc($result_dethi);
        $thoigianketthuc = date("Y-m-d H:i:s", strtotime($data_dethi['thoigianketthuc']));
        return $thoigianketthuc;
    }

    public function getGroupsTakeTests($tests)
    {
        $string = implode(', ', $tests);
        $sql = "SELECT GDT.*, tennhom, namhoc, hocky FROM giaodethi GDT, nhom N WHERE GDT.manhom = N.manhom AND made IN ($string)";
        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function checkStudentAllowed($manguoidung, $madethi)
    {
        $valid = true;
        $sql = "SELECT *
        FROM giaodethi, chitietnhom
        WHERE giaodethi.made = '$madethi' AND giaodethi.manhom = chitietnhom.manhom AND chitietnhom.manguoidung = '$manguoidung'";
        $result = mysqli_query($this->con, $sql);
        if (!mysqli_fetch_assoc($result)) {
            $valid = false;
        }
        return $valid;
    }

    public function getAllGroups()
    {
        $sql = "SELECT manhom, tennhom FROM nhom WHERE trangthai != 0 ORDER BY tennhom ASC";
        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function getQuery($filter, $input, $args)
    {
        $query = "";
        if (isset($args["custom"]["function"])) {
            $func = $args["custom"]["function"];
            switch ($func) {
                case "getUserTestSchedule":
                    $query = "SELECT T1.*, T2.diemthi, T2.dathi, T2.xemdiemthi, T2.diem_tuluan, T2.trangthai_tuluan
              FROM (
                  SELECT DT.made, tende, thoigianbatdau, thoigianketthuc, CTN.manhom,
                         tennhom, tenmonhoc, namhoc, hocky
                  FROM chitietnhom CTN, giaodethi GDT, dethi DT, monhoc MH, nhom N
                  WHERE N.trangthai != 0
                    AND N.manhom = CTN.manhom
                    AND CTN.manhom = GDT.manhom
                    AND DT.made = GDT.made
                    AND MH.mamonhoc = DT.monthi
                    AND DT.trangthai = 1
                    AND manguoidung = '" . $args['manguoidung'] . "'
              ) T1
              LEFT JOIN (
                  SELECT DISTINCT DT.made,
                         CASE WHEN DT.xemdiemthi = 1 THEN KQ.diemthi ELSE NULL END AS diemthi,
                         CASE WHEN KQ.manguoidung IS NOT NULL THEN 1 ELSE 0 END AS dathi,
                         CASE WHEN DT.xemdiemthi = 1 THEN KQ.diem_tuluan ELSE NULL END AS diem_tuluan,
                         CASE WHEN DT.xemdiemthi = 1 THEN KQ.trangthai_tuluan ELSE NULL END AS trangthai_tuluan,

                         DT.xemdiemthi
                  FROM chitietnhom CTN, giaodethi GDT, dethi DT,
                       monhoc MH, nhom N, ketqua KQ
                  WHERE N.manhom = CTN.manhom
                    AND CTN.manhom = GDT.manhom
                    AND DT.made = GDT.made
                    AND MH.mamonhoc = DT.monthi
                    AND KQ.made = DT.made
                    AND DT.trangthai = 1
                    AND KQ.manguoidung = '" . $args['manguoidung'] . "'
              ) T2
              ON T1.made = T2.made
              WHERE 1";

                    if (isset($filter)) {
                        switch ($filter) {
                            case "0":
                                $query .= " AND CURRENT_TIMESTAMP() BETWEEN thoigianbatdau AND thoigianketthuc AND (T2.dathi IS NULL OR T2.dathi = 0)";
                                break;
                            case "1":
                                $query .= " AND CURRENT_TIMESTAMP() > thoigianketthuc AND (T2.dathi IS NULL OR T2.dathi = 0)";
                                break;
                            case "2":
                                $query .= " AND CURRENT_TIMESTAMP() < thoigianbatdau";
                                break;
                            case "3":
                                $query .= " AND T2.dathi = 1";
                                break;
                        }
                    }

                    if ($input) {
                        $query .= " AND (tende LIKE N'%$input%' OR tenmonhoc LIKE N'%$input%')";
                    }
                    $query .= " ORDER BY made DESC";
                    break;


                case "getAllCreatedTest":
                    $query = "SELECT 
                DT.made, 
                DT.tende, 
                MH.tenmonhoc, 
                DT.thoigianbatdau, 
                DT.thoigianketthuc,
                GROUP_CONCAT(DISTINCT N.tennhom SEPARATOR ', ') AS nhom,
                NH.tennamhoc, 
                HK.tenhocky
              FROM dethi DT
              JOIN giaodethi GDT ON DT.made = GDT.made
              JOIN nhom N ON N.manhom = GDT.manhom
              JOIN monhoc MH ON DT.monthi = MH.mamonhoc
              JOIN namhoc NH ON N.namhoc = NH.manamhoc
              JOIN hocky HK ON N.hocky = HK.mahocky
              WHERE DT.nguoitao = '" . $args['id'] . "' 
                AND DT.trangthai = 1";
                    if (isset($filter)) {
                        switch ($filter) {
                            case "0":
                                $query .= " AND CURRENT_TIMESTAMP() < thoigianbatdau";
                                break;
                            case "1":
                                $query .= " AND CURRENT_TIMESTAMP() BETWEEN thoigianbatdau AND thoigianketthuc";
                                break;
                            case "2":
                                $query .= " AND CURRENT_TIMESTAMP() > thoigianketthuc";
                                break;
                            default:
                        }
                    }
                    if ($input) {
                        $query .= " AND (tende LIKE N'%$input%' OR tenmonhoc LIKE N'%$input%')";
                    }
                    if (isset($args['subject']) && $args['subject'] !== '') {
                        $subject = mysqli_real_escape_string($this->con, $args['subject']);
                        $query .= " AND DT.monthi = '$subject'";
                    }
                    if (isset($args['group']) && $args['group'] !== '') {
                        $group = mysqli_real_escape_string($this->con, $args['group']);
                        $query .= " AND GDT.manhom = '$group'";
                    }
                    $query .= " GROUP BY DT.made ORDER BY DT.made DESC";
                    break;
                    case "getQuestionsForTest":
    $id = mysqli_real_escape_string($this->con, $args['id']);
    $mamonhoc = mysqli_real_escape_string($this->con, $args['mamonhoc']);

    $query = "SELECT 
        cauhoi.*,
        cauhoi.noidung AS noidungplaintext,
        dv.noidung AS doanvan_noidung,
        dv.tieude AS doanvan_tieude,
        COUNT(*) OVER() AS total
    FROM cauhoi
    LEFT JOIN doan_van dv ON cauhoi.madv = dv.madv
    WHERE cauhoi.trangthai = 1
      AND cauhoi.mamonhoc = '$mamonhoc'
      AND EXISTS (
        SELECT 1 FROM phancong pc 
        WHERE pc.mamonhoc = cauhoi.mamonhoc 
          AND pc.manguoidung = '$id'
      )";

    // Các filter khác giữ nguyên
    if (!empty($filter['machuong'])) {
        $query .= " AND cauhoi.machuong = " . intval($filter['machuong']);
    }
    if (!empty($filter['dokho'])) {
        $query .= " AND cauhoi.dokho = " . intval($filter['dokho']);
    }
    if (!empty($filter['loai'])) {
        $loai_safe = mysqli_real_escape_string($this->con, $filter['loai']);
        $query .= " AND cauhoi.loai = '$loai_safe'";
    }
    if (!empty($input)) {
        $input_safe = mysqli_real_escape_string($this->con, $input);
        $query .= " AND (cauhoi.noidung LIKE '%$input_safe%')";
    }

    // Nếu cần phân trang
    // $query .= " LIMIT $limit OFFSET $offset";

    break;
                    

             
                default:

            }
        }
        return $query;
    }

    public function getTestsGroupWithUserResult($manhom, $manguoidung)
    {
        $sql = "SELECT T1.*, diemthi FROM (SELECT DT.made, tende, thoigianbatdau, thoigianketthuc FROM dethi DT, giaodethi GDT WHERE DT.made = GDT.made AND DT.trangthai = 1 AND manhom = $manhom) T1 LEFT JOIN (SELECT KQ.made, diemthi FROM ketqua KQ, giaodethi GDT WHERE KQ.made = GDT.made AND manguoidung = '$manguoidung' AND GDT.manhom = $manhom) T2 ON T1.made = T2.made ORDER BY made DESC";
        $result = mysqli_query($this->con, $sql);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }
}
