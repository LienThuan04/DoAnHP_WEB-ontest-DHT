<?php

class CauHoiModel extends DB
{
    public function create($noidung, $dokho, $mamonhoc, $machuong, $nguoitao, $loai = 'mcq', $madv = null, $hinhanh = null)
    {
        if ($madv !== null && $loai === 'mcq') {
            $loai = 'reading';
        }

        $sql = "INSERT INTO cauhoi 
            (noidung, dokho, mamonhoc, machuong, nguoitao, loai, madv, hinhanh) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = mysqli_prepare($this->con, $sql);

        if (!$stmt) {
            die("Prepare failed: " . mysqli_error($this->con));
        }

        $blob = null;

        mysqli_stmt_bind_param(
            $stmt,
            "sissssib",
            $noidung,
            $dokho,
            $mamonhoc,
            $machuong,
            $nguoitao,
            $loai,
            $madv,
            $blob
        );

        if ($hinhanh !== null) {
            mysqli_stmt_send_long_data($stmt, 7, $hinhanh);
        }

        mysqli_stmt_execute($stmt);

        $id = mysqli_insert_id($this->con);

        mysqli_stmt_close($stmt);

        return $id > 0 ? $id : false;
    }

    public function update(
        $macauhoi,
        $noidung,
        $dokho,
        $mamonhoc,
        $machuong,
        $nguoitao,
        $loai = 'mcq',
        $madv = null,
        $hinhanh = null,
        $deleteImage = false
    ) {
        // Nếu đang update câu hỏi con của reading mà có madv
        if ($madv !== null && $loai === 'mcq') {
            $loai = 'reading';
        }

        // TRƯỜNG HỢP 1: Người dùng bấm X → xoá ảnh
        if ($deleteImage) {
            $sql = "UPDATE cauhoi 
                SET noidung = ?, dokho = ?, mamonhoc = ?, machuong = ?, 
                    nguoitao = ?, loai = ?, madv = ?, hinhanh = NULL
                WHERE macauhoi = ?";
            $stmt = mysqli_prepare($this->con, $sql);

            mysqli_stmt_bind_param(
                $stmt,
                "sisssssi",
                $noidung,
                $dokho,
                $mamonhoc,
                $machuong,
                $nguoitao,
                $loai,
                $madv,
                $macauhoi
            );

        }
        // TRƯỜNG HỢP 2: Có upload ảnh mới (BLOB)
        elseif ($hinhanh !== null) {
            $sql = "UPDATE cauhoi 
                SET noidung = ?, dokho = ?, mamonhoc = ?, machuong = ?, 
                    nguoitao = ?, loai = ?, madv = ?, hinhanh = ?
                WHERE macauhoi = ?";
            $stmt = mysqli_prepare($this->con, $sql);

            mysqli_stmt_bind_param(
                $stmt,
                "sissssibi",
                $noidung,
                $dokho,
                $mamonhoc,
                $machuong,
                $nguoitao,
                $loai,
                $madv,
                $hinhanh,
                $macauhoi
            );
            mysqli_stmt_send_long_data($stmt, 7, $hinhanh);
        }
        // TRƯỜNG HỢP 3: Không xoá, không upload → giữ nguyên ảnh cũ
        else {
            $sql = "UPDATE cauhoi 
                SET noidung = ?, dokho = ?, mamonhoc = ?, machuong = ?, 
                    nguoitao = ?, loai = ?, madv = ?
                WHERE macauhoi = ?";
            $stmt = mysqli_prepare($this->con, $sql);

            mysqli_stmt_bind_param(
                $stmt,
                "sisssssi",
                $noidung,
                $dokho,
                $mamonhoc,
                $machuong,
                $nguoitao,
                $loai,
                $madv,
                $macauhoi
            );
        }

        $result = mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        return $result;
    }


    public function getSubQuestions($madv)
    {
        $sql = "SELECT * FROM cauhoi WHERE madv = ? AND loai = 'reading' AND trangthai = '1' ORDER BY macauhoi ASC";
        $stmt = mysqli_prepare($this->con, $sql);
        if ($stmt === false) {
            die("Lỗi chuẩn bị truy vấn: " . mysqli_error($this->con));
        }
        mysqli_stmt_bind_param($stmt, "i", $madv);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        mysqli_stmt_close($stmt);
        return $rows;
    }
    public function getWithDoanVan($macauhoi)
    {
        $sql = "SELECT c.*, d.noidung AS doanvan_noidung, d.tieude AS doanvan_tieude
            FROM cauhoi c
            LEFT JOIN doan_van d ON c.madv = d.madv
            WHERE c.macauhoi = ?";
        $stmt = mysqli_prepare($this->con, $sql);
        if ($stmt === false) {
            die("Lỗi chuẩn bị truy vấn: " . mysqli_error($this->con));
        }
        mysqli_stmt_bind_param($stmt, "i", $macauhoi);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $row = mysqli_fetch_assoc($result);
        mysqli_stmt_close($stmt);
        return $row;
    }
    public function createWithDoanVan($noidungCH, $dokho, $mamonhoc, $machuong, $nguoitao, $loai, $noidungDV, $tieudeDV = null)
    {
        // Tạo đoạn văn
        $sql = "INSERT INTO doan_van (noidung, tieude, mamonhoc, machuong, nguoitao)
                VALUES (?, ?, ?, ?, ?)";
        $stmt = mysqli_prepare($this->con, $sql);
        mysqli_stmt_bind_param($stmt, "sssis", $noidungDV, $tieudeDV, $mamonhoc, $machuong, $nguoitao);
        mysqli_stmt_execute($stmt);
        $madv = mysqli_insert_id($this->con);
        mysqli_stmt_close($stmt);

        // Tạo câu hỏi nếu có nội dung
        if (!empty($noidungCH)) {
            $this->create($noidungCH, $dokho, $mamonhoc, $machuong, $nguoitao, $loai, $madv);
        }

        return $madv;
    }
    //đề thi
    // Lấy ngẫu nhiên $qty câu hỏi theo môn, chương, mức độ, loại câu hỏi
    public function getRandomCauHoi($chuong, $monthi, $level, $types, $qty)
    {
        $listChuong = implode(',', array_map('intval', $chuong));
        $typesIn = implode(',', array_map(function ($t) { return "'" . $t . "'"; }, $types));

        $sql = "SELECT * FROM cauhoi WHERE monthi='$monthi' AND loai IN ($typesIn) AND machuong IN ($listChuong) 
                AND level=$level AND trangthai!=0 ORDER BY RAND() LIMIT $qty";
        $res = mysqli_query($this->con, $sql);

        $data = [];
        while ($row = mysqli_fetch_assoc($res)) {
            $data[] = $row;
        }
        return $data;
    }



    public function delete($macauhoi)
    {
        $sql = "UPDATE `cauhoi` SET `trangthai`='0' WHERE `macauhoi`=?";
        $stmt = mysqli_prepare($this->con, $sql);
        if ($stmt === false) {
            die("Lỗi chuẩn bị truy vấn: " . mysqli_error($this->con));
        }
        mysqli_stmt_bind_param($stmt, "i", $macauhoi);
        $result = mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        return $result;
    }

    public function getAll()
    {
        $sql = "SELECT * FROM cauhoi JOIN monhoc ON cauhoi.mamonhoc = monhoc.mamonhoc ORDER BY cauhoi.macauhoi ASC LIMIT 5";
        $result = mysqli_query($this->con, $sql);
        if ($result === false) {
            die("Lỗi truy vấn SQL: " . mysqli_error($this->con));
        }
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }
    public function getById($macauhoi)
    {
        $sql = "SELECT * FROM `cauhoi` WHERE `macauhoi` = ?";
        $stmt = mysqli_prepare($this->con, $sql);
        mysqli_stmt_bind_param($stmt, "i", $macauhoi);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $row = mysqli_fetch_assoc($result);
        mysqli_stmt_close($stmt);

        if (!empty($row['hinhanh'])) {
            $finfo = new finfo(FILEINFO_MIME_TYPE);
            $mime = $finfo->buffer($row['hinhanh']);

            if (!$mime) {
                $header = substr($row['hinhanh'], 0, 12);
                if (bin2hex(substr($header, 0, 8)) === '89504e470d0a1a0a') {
                    $mime = 'image/png';
                } elseif (bin2hex(substr($header, 0, 4)) === '47494638') {
                    $mime = 'image/gif';
                } elseif (bin2hex(substr($header, 0, 2)) === 'ffd8') {
                    $mime = 'image/jpeg';
                } else {
                    $mime = 'image/jpeg';
                }
            }

            $base64 = 'data:' . $mime . ';base64,' . base64_encode($row['hinhanh']);
            $row['hinhanh_base64'] = $base64;
            $row['question_image_base64'] = $base64;
        } else {
            $row['hinhanh_base64'] = null;
            $row['question_image_base64'] = null;
        }
        return $row;
    }


    public function getAllBySubject($mamonhoc)
    {
        $sql = "SELECT * FROM `cauhoi` WHERE `mamonhoc`=? ORDER BY id ASC";
        $stmt = mysqli_prepare($this->con, $sql);
        if ($stmt === false) {
            die("Lỗi chuẩn bị truy vấn: " . mysqli_error($this->con));
        }
        mysqli_stmt_bind_param($stmt, "s", $mamonhoc);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        mysqli_stmt_close($stmt);
        return $rows;
    }

    public function getTotalPage($content, $selected)
    {
        $sql = "SELECT COUNT(*) as total FROM cauhoi WHERE noidung LIKE ?";
        $stmt = mysqli_prepare($this->con, $sql);
        if ($stmt === false) {
            die("Lỗi chuẩn bị truy vấn: " . mysqli_error($this->con));
        }
        $content_param = "%$content%";
        mysqli_stmt_bind_param($stmt, "s", $content_param);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $count = mysqli_fetch_assoc($result)['total'];
        mysqli_stmt_close($stmt);
        $data = $count % 5 == 0 ? $count / 5 : floor($count / 5) + 1;
        return $data;
    }

    public function getQuestionBySubject($mamonhoc, $machuong, $dokho, $content, $page)
    {
        $limit = 10;
        $offset = ($page - 1) * $limit;
        $sql = "SELECT 
            c.macauhoi, 
            CASE 
                WHEN c.loai = 'reading' THEN d.noidung 
                ELSE c.noidung 
            END AS noidung, 
            c.dokho, 
            c.machuong, 
            c.loai,
            m.tenmonhoc,
            (SELECT COUNT(*) 
             FROM cauhoi sub 
             WHERE sub.madv = c.madv 
               AND sub.loai = 'reading' 
               AND sub.trangthai = '1') AS num_subquestions
        FROM cauhoi c
        LEFT JOIN doan_van d ON c.madv = d.madv
        JOIN monhoc m ON c.mamonhoc = m.mamonhoc
        WHERE c.mamonhoc = ? 
          AND c.trangthai = '1'
          AND (c.madv IS NULL OR c.loai = 'reading')";
        $params = array('s', $mamonhoc);

        if ($machuong != 0) {
            $sql .= " AND c.machuong = ?";
            $params[0] .= 's';
            $params[] = $machuong;
        }
        if ($dokho != 0) {
            $sql .= " AND c.dokho = ?";
            $params[0] .= 'i';
            $params[] = $dokho;
        }
        if ($content != '') {
            $sql .= " AND (c.noidung LIKE ? OR d.noidung LIKE ?)";
            $params[0] .= 'ss';
            $params[] = "%$content%";
            $params[] = "%$content%";
        }
        $sql .= " ORDER BY c.macauhoi ASC LIMIT ?, ?";
        $params[0] .= 'ii';
        $params[] = $offset;
        $params[] = $limit;

        $stmt = mysqli_prepare($this->con, $sql);
        if ($stmt === false) {
            return [];
        }
        mysqli_stmt_bind_param($stmt, ...$params);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $rows = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        mysqli_stmt_close($stmt);
        return $rows;
    }

    public function getTotalPageQuestionBySubject($mamonhoc, $machuong, $dokho, $content)
    {
        $sql = "SELECT COUNT(*) as total 
        FROM cauhoi c 
        LEFT JOIN doan_van d ON c.madv = d.madv 
        WHERE c.mamonhoc = ? 
          AND c.trangthai = '1'
          AND (c.madv IS NULL OR c.loai = 'reading')";
        $params = array('s', $mamonhoc);
        if ($machuong != 0) {
            $sql .= " AND c.machuong = ?";
            $params[0] .= 's';
            $params[] = $machuong;
        }
        if ($dokho != 0) {
            $sql .= " AND c.dokho = ?";
            $params[0] .= 'i';
            $params[] = $dokho;
        }
        if ($content != '') {
            $sql .= " AND (c.noidung LIKE ? OR d.noidung LIKE ?)";
            $params[0] .= 'ss';
            $params[] = "%$content%";
            $params[] = "%$content%";
        }

        $stmt = mysqli_prepare($this->con, $sql);
        if ($stmt === false) {
            return 0;
        }
        mysqli_stmt_bind_param($stmt, ...$params);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $count = mysqli_fetch_assoc($result)['total'];
        mysqli_stmt_close($stmt);
        $limit = 10;
        return ceil($count / $limit);
    }
    public function getQuery($filter, $input, $args)
    {
        if ($input) {
            return $this->getQueryWithInput($filter, $input, $args);
        }

        $query = "
        SELECT DISTINCT
            combined.macauhoi,
            combined.noidung,
            combined.dokho,
            combined.mamonhoc,
            combined.machuong,
            combined.tenmonhoc,
            combined.loai,
            combined.madv,
            combined.tieude_doanvan,
            combined.num_subquestions
        FROM (
            -- 1. Câu hỏi thường (mcq, essay)
            SELECT
                c.macauhoi,
                c.noidung,
                c.dokho,
                c.mamonhoc,
                c.machuong,
                m.tenmonhoc,
                c.loai,
                NULL AS madv,
                NULL AS tieude_doanvan,
                0 AS num_subquestions
            FROM cauhoi c
            JOIN monhoc m ON c.mamonhoc = m.mamonhoc
            JOIN phancong p ON p.mamonhoc = c.mamonhoc AND p.manguoidung = ?
            WHERE c.trangthai = 1
              AND c.madv IS NULL

            UNION ALL

            -- 2. Reading: lấy từ doan_van + GROUP BY để chắc chắn chỉ 1 dòng/madv
            SELECT
                MIN(c.macauhoi) AS macauhoi,                  
                CONCAT(LEFT(d.noidung, 150), CASE WHEN CHAR_LENGTH(d.noidung) > 150 THEN '...' ELSE '' END) AS noidung,
                c.dokho,                                     
                d.mamonhoc,
                d.machuong,
                m.tenmonhoc,
                'reading' AS loai,
                d.madv,
                COALESCE(d.tieude, '') AS tieude_doanvan,
                (SELECT COUNT(*) FROM cauhoi sub WHERE sub.madv = d.madv AND sub.loai = 'reading' AND sub.trangthai = 1) AS num_subquestions
            FROM doan_van d
            JOIN cauhoi c ON c.madv = d.madv AND c.loai = 'reading' AND c.trangthai = 1
            JOIN monhoc m ON d.mamonhoc = m.mamonhoc
            JOIN phancong p ON p.mamonhoc = d.mamonhoc AND p.manguoidung = ?
            WHERE d.trangthai = 1
            GROUP BY d.madv, d.noidung, d.tieude, d.mamonhoc, d.machuong, m.tenmonhoc, c.dokho  -- chắc chắn chỉ 1 dòng
        ) AS combined
        WHERE 1=1
    ";

        $params = ['ss', $args['id'], $args['id']];

        if (!empty($filter['mamonhoc'])) {
            $query .= " AND combined.mamonhoc = ?";
            $params[0] .= 's';
            $params[] = $filter['mamonhoc'];
        }
        if (!empty($filter['machuong'])) {
            $query .= " AND combined.machuong = ?";
            $params[0] .= 's';
            $params[] = $filter['machuong'];
        }
        if (!empty($filter['dokho']) && $filter['dokho'] != 0) {
            $query .= " AND combined.dokho = ?";
            $params[0] .= 'i';
            $params[] = $filter['dokho'];
        }

        // Filter by question type (loai) for input/search path
        if (!empty($filter['loai']) && $filter['loai'] != '0') {
            $query .= " AND combined.loai = ?";
            $params[0] .= 's';
            $params[] = $filter['loai'];
        }
        // Filter by question type (loai) if provided and not '0' / empty
        if (!empty($filter['loai']) && $filter['loai'] != '0') {
            $query .= " AND combined.loai = ?";
            $params[0] .= 's';
            $params[] = $filter['loai'];
        }

        $query .= " ORDER BY combined.macauhoi ASC";

        return ['query' => $query, 'params' => $params];
    }

    public function getQueryWithInput($filter, $input, $args)
    {
        $query = "
        SELECT DISTINCT
            combined.macauhoi,
            combined.noidung,
            combined.dokho,
            combined.mamonhoc,
            combined.machuong,
            combined.tenmonhoc,
            combined.loai,
            combined.madv,
            combined.tieude_doanvan,
            combined.num_subquestions
        FROM (
            -- 1. Câu hỏi thường
            SELECT
                c.macauhoi,
                c.noidung,
                c.dokho,
                c.mamonhoc,
                c.machuong,
                m.tenmonhoc,
                c.loai,
                NULL AS madv,
                NULL AS tieude_doanvan,
                0 AS num_subquestions
            FROM cauhoi c
            JOIN monhoc m ON c.mamonhoc = m.mamonhoc
            WHERE c.trangthai = 1
              AND c.madv IS NULL
              AND c.noidung LIKE ?

            UNION ALL

            -- 2. Reading - bắt buộc GROUP BY để không trùng
            SELECT
                MIN(c.macauhoi) AS macauhoi,
                CONCAT(LEFT(d.noidung, 150), CASE WHEN CHAR_LENGTH(d.noidung) > 150 THEN '...' ELSE '' END) AS noidung,
                c.dokho,
                d.mamonhoc,
                d.machuong,
                m.tenmonhoc,
                'reading' AS loai,
                d.madv,
                COALESCE(d.tieude, '') AS tieude_doanvan,
                (SELECT COUNT(*) FROM cauhoi sub WHERE sub.madv = d.madv AND sub.loai = 'reading' AND sub.trangthai = 1) AS num_subquestions
            FROM doan_van d
            JOIN cauhoi c ON c.madv = d.madv AND c.loai = 'reading' AND c.trangthai = 1
            JOIN monhoc m ON d.mamonhoc = m.mamonhoc
            WHERE d.trangthai = 1
              AND (d.noidung LIKE ? OR COALESCE(d.tieude, '') LIKE ?)
            GROUP BY d.madv, d.noidung, d.tieude, d.mamonhoc, d.machuong, m.tenmonhoc, c.dokho
        ) AS combined
        WHERE 1=1
    ";

        $params = ['sss', "%$input%", "%$input%", "%$input%"];

        if (!empty($filter['mamonhoc'])) {
            $query .= " AND combined.mamonhoc = ?";
            $params[0] .= 's';
            $params[] = $filter['mamonhoc'];
        }
        if (!empty($filter['machuong'])) {
            $query .= " AND combined.machuong = ?";
            $params[0] .= 's';
            $params[] = $filter['machuong'];
        }
        if (!empty($filter['dokho']) && $filter['dokho'] != 0) {
            $query .= " AND combined.dokho = ?";
            $params[0] .= 'i';
            $params[] = $filter['dokho'];
        }

        $query .= " ORDER BY CAST(combined.macauhoi AS UNSIGNED) ASC";

        return ['query' => $query, 'params' => $params];
    }

    public function getsoluongcauhoi($chuong, $monhoc, $dokho, $loaicauhoi = ['mcq'])
    {
        if (!is_array($chuong)) {
            $chuong = !empty($chuong) ? [$chuong] : [];
        }
        if (!is_array($loaicauhoi)) {
            $loaicauhoi = [$loaicauhoi];
        }

        // Prepare placeholders cho IN (...)
        $placeholdersLoai = implode(',', array_fill(0, count($loaicauhoi), '?'));
        $sql = "SELECT COUNT(*) as soluong 
            FROM cauhoi 
            WHERE dokho = ? 
              AND mamonhoc = ? 
              AND loai IN ($placeholdersLoai)
              AND trangthai = 1"; // thêm điều kiện trạng thái

        $types = str_repeat('s', 2 + count($loaicauhoi)); // dokho + mamonhoc + loaicauhoi
        $params = array_merge([(string)$dokho, $monhoc], $loaicauhoi);

        if (!empty($chuong)) {
            $placeholdersChuong = implode(',', array_fill(0, count($chuong), '?'));
            $sql .= " AND machuong IN ($placeholdersChuong)";
            $types .= str_repeat('s', count($chuong));
            $params = array_merge($params, $chuong);
        }

        $stmt = mysqli_prepare($this->con, $sql);
        if (!$stmt) {
            return 0;
        }

        mysqli_stmt_bind_param($stmt, $types, ...$params);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        $row = mysqli_fetch_assoc($result);
        mysqli_stmt_close($stmt);

        return (int)($row['soluong'] ?? 0);
    }


    public function getReadingQuestions($chuong, $monthi, $dokho, $qty = 1)
    {
        if (empty($chuong)) {
            return [];
        }

        $chuongList = implode(',', array_map('intval', $chuong));

        // Lấy tất cả đoạn văn có câu hỏi mức độ $dokho
        $sql = "SELECT DISTINCT madv
            FROM cauhoi 
            WHERE mamonhoc = ? 
              AND dokho = ? 
              AND loai = 'reading'
              AND machuong IN ($chuongList)
              AND trangthai = 1";

        $stmt = mysqli_prepare($this->con, $sql);
        mysqli_stmt_bind_param($stmt, "si", $monthi, $dokho);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);

        $doanvanList = [];
        while ($row = mysqli_fetch_assoc($res)) {
            $doanvanList[] = $row['madv'];
        }
        mysqli_stmt_close($stmt);

        if (empty($doanvanList)) {
            return [];
        }

        // Chọn ngẫu nhiên một đoạn văn
        shuffle($doanvanList);
        $selectedDoan = $doanvanList[0];

        // Lấy n câu trong đoạn đã chọn
        $sql2 = "SELECT macauhoi 
             FROM cauhoi 
             WHERE mamonhoc = ? 
               AND dokho = ? 
               AND loai = 'reading' 
               AND madv = ? 
               AND trangthai = 1
             ORDER BY RAND()
             LIMIT ?";

        $stmt2 = mysqli_prepare($this->con, $sql2);
        mysqli_stmt_bind_param($stmt2, "sisi", $monthi, $dokho, $selectedDoan, $qty);
        mysqli_stmt_execute($stmt2);
        $res2 = mysqli_stmt_get_result($stmt2);

        $questions = [];
        while ($row = mysqli_fetch_assoc($res2)) {
            $questions[] = $row;
        }
        mysqli_stmt_close($stmt2);

        return $questions;
    }
    public function getQuestions($chuong, $monthi, $dokho, $types = [], $qty = 1)
    {
        if (empty($chuong) || empty($types)) {
            return [];
        }

        // Chuẩn hóa mảng chương
        $chuongList = implode(',', array_map('intval', $chuong));

        // Chuẩn hóa mảng loại
        $typeList = implode(',', array_map(function ($t) {
            return "'" . trim($t) . "'";
        }, $types));

        // SQL: lấy câu hỏi active, theo môn, loại, chương, mức độ
        $sql = "SELECT macauhoi 
            FROM cauhoi 
            WHERE mamonhoc = ? 
              AND dokho = ? 
              AND loai IN ($typeList) 
              AND machuong IN ($chuongList) 
              AND trangthai = 1
            ORDER BY RAND() 
            LIMIT ?";

        $stmt = mysqli_prepare($this->con, $sql);
        if (!$stmt) {
            return false;
        }

        mysqli_stmt_bind_param($stmt, "sii", $monthi, $dokho, $qty);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        if (!$res) {
            return false;
        }

        $questions = [];
        while ($row = mysqli_fetch_assoc($res)) {
            $questions[] = $row;
        }

        mysqli_stmt_close($stmt);
        return $questions;
    }




}
