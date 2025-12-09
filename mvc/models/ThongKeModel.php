<?php

class ThongKeModel extends DB
{
    // Lấy danh sách học kỳ
    public function getSemesters($nguoitao)
    {
        if (empty($nguoitao) || !is_string($nguoitao)) {
            return [];
        }

        $sql = "SELECT DISTINCT 
    n.hocky AS mahocky,
    hk.tenhocky
FROM nhom n
JOIN hocky hk ON n.hocky = hk.mahocky
JOIN giaodethi g ON n.manhom = g.manhom
JOIN dethi d ON g.made = d.made
WHERE d.nguoitao = ?
  AND n.trangthai = 1
  AND d.trangthai = 1
ORDER BY hk.tenhocky
";
        $stmt = $this->con->prepare($sql);
        if ($stmt === false) {
            error_log("Prepare failed in getSemesters: " . $this->con->error);
            return [];
        }
        $stmt->bind_param("s", $nguoitao);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result === false) {
            error_log("SQL Error in getSemesters: " . $this->con->error);
            return [];
        }

        $semesters = [];
        while ($row = $result->fetch_assoc()) {
            $semesters[] = $row;
        }
        $stmt->close();
        return $semesters;
    }

    // Lấy danh sách năm học
    public function getAcademicYears($nguoitao)
    {
        if (empty($nguoitao) || !is_string($nguoitao)) {
            return [];
        }

        $sql = "SELECT DISTINCT 
    n.namhoc,
    nh.tennamhoc
FROM nhom n
JOIN namhoc nh ON n.namhoc = nh.manamhoc
JOIN giaodethi g ON n.manhom = g.manhom
JOIN dethi d ON g.made = d.made
WHERE d.nguoitao = ?
  AND n.trangthai = 1
  AND d.trangthai = 1
ORDER BY nh.tennamhoc DESC
";
        $stmt = $this->con->prepare($sql);
        if ($stmt === false) {
            error_log("Prepare failed in getAcademicYears: " . $this->con->error);
            return [];
        }
        $stmt->bind_param("s", $nguoitao);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result === false) {
            error_log("SQL Error in getAcademicYears: " . $this->con->error);
            return [];
        }

        $years = [];
        while ($row = $result->fetch_assoc()) {
            $years[] = $row;
        }
        $stmt->close();
        return $years;
    }

    // Lấy danh sách môn học theo học kỳ và năm học
    public function getSubjectsByCreator($nguoitao, $mahocky, $namhoc)
    {
        if (empty($nguoitao) || !is_string($nguoitao) || empty($mahocky) || !is_numeric($mahocky) || empty($namhoc) || !is_numeric($namhoc)) {
            return [];
        }

        $sql = "SELECT DISTINCT m.mamonhoc, m.tenmonhoc
                FROM monhoc m
                JOIN dethi d ON m.mamonhoc = d.monthi
                JOIN giaodethi g ON d.made = g.made
                JOIN nhom n ON g.manhom = n.manhom
                WHERE d.nguoitao = ? AND d.trangthai = 1 AND n.hocky = ? AND n.namhoc = ? AND n.trangthai = 1";
        $stmt = $this->con->prepare($sql);
        if ($stmt === false) {
            error_log("Prepare failed in getSubjectsByCreator: " . $this->con->error);
            return [];
        }
        $stmt->bind_param("sis", $nguoitao, $mahocky, $namhoc);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result === false) {
            error_log("SQL Error in getSubjectsByCreator: " . $this->con->error);
            return [];
        }

        $subjects = [];
        while ($row = $result->fetch_assoc()) {
            $subjects[] = $row;
        }
        $stmt->close();
        return $subjects;
    }

    public function getGroupsByCreator($nguoitao, $mahocky, $namhoc, $mamonhoc = null)
    {
        if (empty($nguoitao) || !is_string($nguoitao) ||
            empty($mahocky) || !is_numeric($mahocky) ||
            empty($namhoc) || !is_numeric($namhoc)) {
            return [];
        }

        $sql = "SELECT DISTINCT n.manhom, n.tennhom
            FROM nhom n
            JOIN giaodethi g ON n.manhom = g.manhom
            JOIN dethi d ON g.made = d.made
            WHERE d.nguoitao = ? 
              AND n.trangthai = 1 
              AND d.trangthai = 1 
              AND n.hocky = ? 
              AND n.namhoc = ?";

        $types = "sis";
        $params = [$nguoitao, $mahocky, $namhoc];

        if (!empty($mamonhoc)) {
            $sql .= " AND n.mamonhoc = ?";
            $types .= "s";
            $params[] = $mamonhoc;
        }

        $stmt = $this->con->prepare($sql);
        if ($stmt === false) {
            error_log("Prepare failed in getGroupsByCreator: " . $this->con->error);
            return [];
        }

        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result === false) {
            error_log("SQL Error in getGroupsByCreator: " . $this->con->error);
            return [];
        }

        $groups = [];
        while ($row = $result->fetch_assoc()) {
            $groups[] = $row;
        }

        $stmt->close();
        return $groups;
    }


    // Lấy dữ liệu thống kê tổng hợp
    public function getAggregatedStatisticalData($nguoitao, $mahocky, $namhoc, $mamonhoc = null, $manhom = null)
    {
        $data = [
            'da_nop_bai' => 0,
            'chua_nop_bai' => 0,
            'khong_thi' => 0,
            'diem_trung_binh' => 0,
            'diem_cao_nhat' => 0,
            'thong_ke_diem' => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];

        if (empty($nguoitao) || !is_string($nguoitao) || empty($mahocky) || !is_numeric($mahocky) || empty($namhoc) || !is_numeric($namhoc)) {
            return $data;
        }

        $sql_base = "SELECT kq.made, gd.manhom, kq.diemthi, kq.thoigianvaothi
             FROM ketqua kq
             JOIN giaodethi gd ON kq.made = gd.made
             JOIN chitietnhom cn ON gd.manhom = cn.manhom AND kq.manguoidung = cn.manguoidung
             JOIN dethi d ON kq.made = d.made
             JOIN nhom n ON gd.manhom = n.manhom
             WHERE d.nguoitao = ? AND d.trangthai = 1 AND n.trangthai = 1 AND n.hocky = ? AND n.namhoc = ?";

        $params = ["sis", $nguoitao, $mahocky, $namhoc];
        if ($mamonhoc && is_string($mamonhoc)) {
            $sql_base .= " AND d.monthi = ?";
            $params[0] .= "s";
            $params[] = $mamonhoc;
        }
        if ($manhom && is_numeric($manhom)) {
            $sql_base .= " AND cn.manhom = ?";
            $params[0] .= "i";
            $params[] = $manhom;
        }

        $stmt = $this->con->prepare($sql_base);
        if ($stmt === false) {
            error_log("Prepare failed in getAggregatedStatisticalData: " . $this->con->error);
            return $data;
        }
        $stmt->bind_param(...$params);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result === false) {
            error_log("SQL Error in getAggregatedStatisticalData: " . $this->con->error);
            return $data;
        }

        $total_students = [];
        $scores = [];
        while ($row = $result->fetch_assoc()) {
            $key = $row['made'] . '-' . $row['manhom'];
            if (!isset($total_students[$key])) {
                $total_students[$key] = [
                    'submitted' => 0,
                    'not_submitted' => 0,
                    'not_appeared' => 0
                ];
            }
            if ($row['diemthi'] !== null) {
                $data['da_nop_bai']++;
                $total_students[$key]['submitted']++;
                $scores[] = min($row['diemthi'], 10);
            } elseif ($row['thoigianvaothi'] !== null) {
                $data['chua_nop_bai']++;
                $total_students[$key]['not_submitted']++;
            } else {
                $data['khong_thi']++;
                $total_students[$key]['not_appeared']++;
            }
        }
        $stmt->close();

        // Tính số thí sinh không thi
        $sql_khong_thi = "SELECT COUNT(DISTINCT cn.manguoidung) as total
                         FROM chitietnhom cn
                         JOIN giaodethi gd ON cn.manhom = gd.manhom
                         JOIN dethi d ON gd.made = d.made
                         JOIN nhom n ON cn.manhom = n.manhom
                         LEFT JOIN ketqua kq ON cn.manguoidung = kq.manguoidung AND kq.made = d.made
                         WHERE d.nguoitao = ? AND d.trangthai = 1 AND n.trangthai = 1 AND n.hocky = ? AND n.namhoc = ? AND kq.makq IS NULL";
        $params_khong_thi = ["sis", $nguoitao, $mahocky, $namhoc];
        if ($mamonhoc && is_string($mamonhoc)) {
            $sql_khong_thi .= " AND d.monthi = ?";
            $params_khong_thi[0] .= "s";
            $params_khong_thi[] = $mamonhoc;
        }
        if ($manhom && is_numeric($manhom)) {
            $sql_khong_thi .= " AND cn.manhom = ?";
            $params_khong_thi[0] .= "i";
            $params_khong_thi[] = $manhom;
        }

        $stmt = $this->con->prepare($sql_khong_thi);
        if ($stmt === false) {
            error_log("Prepare failed in getAggregatedStatisticalData (khong_thi): " . $this->con->error);
            return $data;
        }
        $stmt->bind_param(...$params_khong_thi);
        $stmt->execute();
        $result_khong_thi = $stmt->get_result();
        if ($result_khong_thi) {
            $data['khong_thi'] = $result_khong_thi->fetch_assoc()['total'] ?? 0;
        }
        $stmt->close();

        if (!empty($scores)) {
            $data['diem_trung_binh'] = round(array_sum($scores) / count($scores), 1);
            $data['diem_cao_nhat'] = max($scores);
            for ($i = 0; $i <= 9; $i++) {
                $data['thong_ke_diem'][$i] = count(array_filter($scores, function ($score) use ($i) {
                    return $score >= $i && $score < ($i + 1);
                }));
            }
        }

        return $data;
    }

    // Các phương thức khác giữ nguyên từ mã gốc
    public function getTestInfo($made, $nguoitao)
    {
        if (empty($made) || !is_numeric($made) || empty($nguoitao) || !is_string($nguoitao)) {
            return null;
        }

        $sql = "SELECT d.made, d.tende, d.thoigiantao, m.mamonhoc, m.tenmonhoc
                FROM dethi d
                JOIN monhoc m ON d.monthi = m.mamonhoc
                WHERE d.made = ? AND d.nguoitao = ? AND d.trangthai = 1";
        $stmt = $this->con->prepare($sql);
        if ($stmt === false) {
            error_log("Prepare failed in getTestInfo: " . $this->con->error);
            return null;
        }
        $stmt->bind_param("is", $made, $nguoitao);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result === false) {
            error_log("SQL Error in getTestInfo: " . $this->con->error);
            return null;
        }

        $row = $result->fetch_assoc();
        $stmt->close();
        return $row ?: null;
    }

    public function getNhomByTest($made)
    {
        if (empty($made) || !is_numeric($made)) {
            return [];
        }

        $sql = "SELECT n.manhom, n.tennhom
                FROM nhom n
                JOIN giaodethi g ON n.manhom = g.manhom
                WHERE g.made = ? AND n.trangthai = 1";
        $stmt = $this->con->prepare($sql);
        if ($stmt === false) {
            error_log("Prepare failed in getNhomByTest: " . $this->con->error);
            return [];
        }
        $stmt->bind_param("i", $made);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result === false) {
            error_log("SQL Error in getNhomByTest: " . $this->con->error);
            return [];
        }

        $nhom = [];
        while ($row = $result->fetch_assoc()) {
            $nhom[] = $row;
        }
        $stmt->close();
        return $nhom;
    }

    public function getStatisticalData($made, $manhom = 0)
    {
        $data = [
            'da_nop_bai' => 0,
            'chua_nop_bai' => 0,
            'khong_thi' => 0,
            'diem_trung_binh' => 0,
            'diem_cao_nhat' => 0,
            'thong_ke_diem' => [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ];

        if (empty($made) || !is_numeric($made)) {
            return $data;
        }

        $group_condition = $manhom == 0 ? "" : "AND cn.manhom = ?";

        // Số thí sinh đã nộp bài
        $sql_da_nop = "SELECT COUNT(*) as total
                       FROM ketqua kq
                       JOIN chitietnhom cn ON kq.manguoidung = cn.manguoidung
                       WHERE kq.made = ? AND kq.diemthi IS NOT NULL $group_condition";
        $stmt = $this->con->prepare($sql_da_nop);
        if ($stmt === false) {
            error_log("Prepare failed in getStatisticalData (da_nop): " . $this->con->error);
            return $data;
        }
        if ($manhom == 0) {
            $stmt->bind_param("i", $made);
        } else {
            $stmt->bind_param("ii", $made, $manhom);
        }
        $stmt->execute();
        $result_da_nop = $stmt->get_result();
        if ($result_da_nop) {
            $data['da_nop_bai'] = $result_da_nop->fetch_assoc()['total'] ?? 0;
        }
        $stmt->close();

        // Số thí sinh chưa nộp bài
        $sql_chua_nop = "SELECT COUNT(*) as total
                         FROM ketqua kq
                         JOIN chitietnhom cn ON kq.manguoidung = cn.manguoidung
                         WHERE kq.made = ? AND kq.diemthi IS NULL AND kq.thoigianvaothi IS NOT NULL $group_condition";
        $stmt = $this->con->prepare($sql_chua_nop);
        if ($stmt === false) {
            error_log("Prepare failed in getStatisticalData (chua_nop): " . $this->con->error);
            return $data;
        }
        if ($manhom == 0) {
            $stmt->bind_param("i", $made);
        } else {
            $stmt->bind_param("ii", $made, $manhom);
        }
        $stmt->execute();
        $result_chua_nop = $stmt->get_result();
        if ($result_chua_nop) {
            $data['chua_nop_bai'] = $result_chua_nop->fetch_assoc()['total'] ?? 0;
        }
        $stmt->close();

        // Số thí sinh không thi
        $sql_khong_thi = "SELECT COUNT(*) as total
                          FROM chitietnhom cn
                          JOIN giaodethi gd ON cn.manhom = gd.manhom
                          LEFT JOIN ketqua kq ON cn.manguoidung = kq.manguoidung AND kq.made = ?
                          WHERE gd.made = ? AND kq.makq IS NULL $group_condition";
        $stmt = $this->con->prepare($sql_khong_thi);
        if ($stmt === false) {
            error_log("Prepare failed in getStatisticalData (khong_thi): " . $this->con->error);
            return $data;
        }
        if ($manhom == 0) {
            $stmt->bind_param("ii", $made, $made);
        } else {
            $stmt->bind_param("iii", $made, $made, $manhom);
        }
        $stmt->execute();
        $result_khong_thi = $stmt->get_result();
        if ($result_khong_thi) {
            $data['khong_thi'] = $result_khong_thi->fetch_assoc()['total'] ?? 0;
        }
        $stmt->close();

        // Tính điểm trung bình
        $sql_avg = "SELECT AVG(diemthi) as avg_score
                    FROM ketqua kq
                    JOIN chitietnhom cn ON kq.manguoidung = cn.manguoidung
                    WHERE kq.made = ? AND kq.diemthi IS NOT NULL $group_condition";
        $stmt = $this->con->prepare($sql_avg);
        if ($stmt === false) {
            error_log("Prepare failed in getStatisticalData (avg): " . $this->con->error);
            return $data;
        }
        if ($manhom == 0) {
            $stmt->bind_param("i", $made);
        } else {
            $stmt->bind_param("ii", $made, $manhom);
        }
        $stmt->execute();
        $result_avg = $stmt->get_result();
        if ($result_avg) {
            $data['diem_trung_binh'] = round($result_avg->fetch_assoc()['avg_score'] ?? 0, 1);
        }
        $stmt->close();

        // Tính điểm cao nhất
        $sql_max = "SELECT MAX(LEAST(diemthi, 10)) as max_score
                    FROM ketqua kq
                    JOIN chitietnhom cn ON kq.manguoidung = cn.manguoidung
                    WHERE kq.made = ? AND kq.diemthi IS NOT NULL $group_condition";
        $stmt = $this->con->prepare($sql_max);
        if ($stmt === false) {
            error_log("Prepare failed in getStatisticalData (max): " . $this->con->error);
            return $data;
        }
        if ($manhom == 0) {
            $stmt->bind_param("i", $made);
        } else {
            $stmt->bind_param("ii", $made, $manhom);
        }
        $stmt->execute();
        $result_max = $stmt->get_result();
        if ($result_max) {
            $data['diem_cao_nhat'] = $result_max->fetch_assoc()['max_score'] ?? 0;
        }
        $stmt->close();

        // Phân bố điểm
        for ($i = 0; $i <= 9; $i++) {
            $sql_score = "SELECT COUNT(*) as total
                          FROM ketqua kq
                          JOIN chitietnhom cn ON kq.manguoidung = cn.manguoidung
                          WHERE kq.made = ? AND kq.diemthi IS NOT NULL
                          AND LEAST(kq.diemthi, 10) >= ? AND LEAST(kq.diemthi, 10) < ? $group_condition";
            $stmt = $this->con->prepare($sql_score);
            if ($stmt === false) {
                error_log("Prepare failed in getStatisticalData (score_$i): " . $this->con->error);
                continue;
            }
            $next_i = $i + 1;
            if ($manhom == 0) {
                $stmt->bind_param("iii", $made, $i, $next_i);
            } else {
                $stmt->bind_param("iiii", $made, $i, $next_i, $manhom);
            }
            $stmt->execute();
            $result_score = $stmt->get_result();
            if ($result_score) {
                $data['thong_ke_diem'][$i] = $result_score->fetch_assoc()['total'] ?? 0;
            }
            $stmt->close();
        }

        return $data;
    }
}
