<?php

class XemMonHocModel extends DB
{
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
        $sql = "
        SELECT 
            mh.mamonhoc,
            mh.tenmonhoc,
            mh.sotinchi,
            mh.sotietlythuyet,
            mh.sotietthuchanh,
            nh.tennamhoc,
            hk.tenhocky
        FROM phancong pc
        INNER JOIN monhoc mh ON pc.mamonhoc = mh.mamonhoc
        INNER JOIN namhoc nh ON pc.namhoc = nh.manamhoc
        INNER JOIN hocky hk ON pc.hocky = hk.mahocky
        WHERE 
            pc.manguoidung = ?
            AND mh.trangthai = 1
        ORDER BY nh.tennamhoc DESC, hk.tenhocky ASC;
    ";

        $stmt = $this->con->prepare($sql);
        if (!$stmt) {
            error_log("Prepare failed in getAllSubjectAssignment: " . $this->con->error);
            return [];
        }

        $stmt->bind_param("s", $userid);
        $stmt->execute();
        $result = $stmt->get_result();

        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }

        $stmt->close();
        return $rows;
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
    public function getQuery($filter, $input, $args)
    {
        // Lấy user hiện tại (giáo viên)
        $userid = $_SESSION['user_id'] ?? null;

        $query = "SELECT DISTINCT
                pc.mamonhoc,
                pc.manguoidung,
                pc.namhoc,
                pc.hocky,
                mh.tenmonhoc,
                mh.sotinchi,
                mh.sotietlythuyet,
                mh.sotietthuchanh,
                nh.tennamhoc,
                hk.tenhocky
            FROM phancong pc
            INNER JOIN monhoc mh ON pc.mamonhoc = mh.mamonhoc
            LEFT JOIN namhoc nh ON pc.namhoc = nh.manamhoc
            LEFT JOIN hocky hk ON pc.hocky = hk.mahocky
            WHERE pc.trangthai = 1
              AND mh.trangthai = 1";

        $params = [];
        $types = '';

        // Bắt buộc lọc theo giáo viên hiện tại
        if ($userid) {
            $query .= " AND pc.manguoidung = ?";
            $types .= 's';
            $params[] = $userid;
        }

        // Các filter bổ sung (chỉ khi tồn tại)
        if (!empty($filter) && is_array($filter)) {
            if (!empty($filter['mamonhoc'])) {
                $query .= " AND pc.mamonhoc = ?";
                $types .= 's';
                $params[] = (string)$filter['mamonhoc'];
            }

            if (isset($filter['namhoc']) && $filter['namhoc'] !== '') {
                $query .= " AND pc.namhoc = ?";
                $types .= 'i';
                $params[] = intval($filter['namhoc']);
            }

            if (isset($filter['hocky']) && $filter['hocky'] !== '') {
                $query .= " AND pc.hocky = ?";
                $types .= 'i';
                $params[] = intval($filter['hocky']);
            }
        }

        // Tìm kiếm theo tên hoặc mã môn
        $input = trim((string)$input);
        if ($input !== '') {
            $query .= " AND (mh.tenmonhoc LIKE ? OR mh.mamonhoc LIKE ?)";
            $types .= 'ss';
            $search = "%{$input}%";
            $params[] = $search;
            $params[] = $search;
        }

        $query .= " ORDER BY nh.tennamhoc DESC, hk.tenhocky ASC, mh.mamonhoc ASC";

        if ($types !== '') {
            array_unshift($params, $types);
        }

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
