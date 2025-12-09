<?php

class NamHocModel extends DB
{
    public function getNamHoc($page = 1, $limit = 10, $q = "")
    {
        $page = (int)$page;
        $limit = (int)$limit;
        $offset = ($page - 1) * $limit;
        $countSql = "SELECT COUNT(*) as total FROM namhoc WHERE 1=1";
        $params = [];
        $types = "";

        if ($q) {
            $countSql .= " AND tennamhoc LIKE ?";
            $qParam = "%$q%";
            $params[] = &$qParam;
            $types .= "s";
        }

        $stmt = mysqli_prepare($this->con, $countSql);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . mysqli_error($this->con));
        }

        if ($params) {
            mysqli_stmt_bind_param($stmt, $types, ...$params);
        }

        mysqli_stmt_execute($stmt);
        $countRes = mysqli_stmt_get_result($stmt);
        $totalRow = mysqli_fetch_assoc($countRes);
        $total = (int)$totalRow['total'];
        mysqli_stmt_close($stmt);
        $dataSql = "SELECT nh.*, 
                       (SELECT COUNT(*) FROM hocky hk WHERE hk.manamhoc = nh.manamhoc) as tonghocky
                FROM namhoc nh
                WHERE 1=1";

        $params = [];
        $types = "";
        if ($q) {
            $dataSql .= " AND nh.tennamhoc LIKE ?";
            $qParam = "%$q%";
            $params[] = &$qParam;
            $types .= "s";
        }

        // Không dùng bind param cho LIMIT/OFFSET, gán trực tiếp
        $dataSql .= " ORDER BY nh.manamhoc DESC LIMIT $limit OFFSET $offset";

        $stmt = mysqli_prepare($this->con, $dataSql);
        if (!$stmt) {
            throw new Exception("Prepare failed: " . mysqli_error($this->con));
        }

        if ($params) {
            mysqli_stmt_bind_param($stmt, $types, ...$params);
        }

        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);

        $rows = [];
        while ($row = mysqli_fetch_assoc($res)) {
            $rows[] = $row;
        }
        mysqli_stmt_close($stmt);

        return [
            'data' => $rows,
            'total' => $total,
            'page' => $page,
            'limit' => $limit
        ];
    }

    public function existsNamHoc($tennamhoc, $excludeId = null)
    {
        $sql = "SELECT COUNT(*) as cnt FROM namhoc WHERE tennamhoc = ?";
        if ($excludeId) {
            $sql .= " AND manamhoc <> ?";
        }
        $stmt = mysqli_prepare($this->con, $sql);
        if ($excludeId) {
            mysqli_stmt_bind_param($stmt, "si", $tennamhoc, $excludeId);
        } else {
            mysqli_stmt_bind_param($stmt, "s", $tennamhoc);
        }
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        $row = mysqli_fetch_assoc($res);
        mysqli_stmt_close($stmt);
        return $row['cnt'] > 0;
    }


    // THÊM NĂM HỌC + TỰ TẠO HỌC KỲ
    public function addNamHoc($tennamhoc, $sohocky = 3)
    {
        if ($this->existsNamHoc($tennamhoc)) {
            return ["success" => false, "message" => "Năm học này đã tồn tại!"];
        }

        mysqli_autocommit($this->con, false);
        try {
            $sql = "INSERT INTO namhoc (tennamhoc, trangthai) VALUES (?, 1)";
            $stmt = mysqli_prepare($this->con, $sql);
            mysqli_stmt_bind_param($stmt, "s", $tennamhoc);
            mysqli_stmt_execute($stmt);
            $manamhoc = mysqli_insert_id($this->con);
            mysqli_stmt_close($stmt);

            $values = [];
            for ($i = 1; $i <= $sohocky; $i++) {
                $tenhk = "Học kỳ $i";
                $values[] = "('$tenhk', $manamhoc, $i)";
            }
            $sql_hk = "INSERT INTO hocky (tenhocky, manamhoc, sohocky) VALUES " . implode(',', $values);
            mysqli_query($this->con, $sql_hk);

            mysqli_commit($this->con);
            return ["success" => true];
        } catch (Exception $e) {
            mysqli_rollback($this->con);
            error_log("addNamHoc error: " . $e->getMessage());
            return ["success" => false, "message" => "Lỗi khi thêm năm học!"];
        } finally {
            mysqli_autocommit($this->con, true);
        }
    }

    public function updateNamHoc($manamhoc, $tennamhoc, $trangthai, $sohocky = null)
    {
        if ($this->existsNamHoc($tennamhoc, $manamhoc)) {
            return ["success" => false, "message" => "Năm học này đã tồn tại!"];
        }

        mysqli_autocommit($this->con, false);
        try {
            $sql = "UPDATE namhoc SET tennamhoc = ?, trangthai = ? WHERE manamhoc = ?";
            $stmt = mysqli_prepare($this->con, $sql);
            mysqli_stmt_bind_param($stmt, "sii", $tennamhoc, $trangthai, $manamhoc);
            mysqli_stmt_execute($stmt);
            mysqli_stmt_close($stmt);

            if ($sohocky !== null) {
                $res = mysqli_query($this->con, "SELECT COUNT(*) as cnt FROM hocky WHERE manamhoc = $manamhoc");
                $row = mysqli_fetch_assoc($res);
                $current = (int)$row['cnt'];

                if ($sohocky > $current) {
                    for ($i = $current + 1; $i <= $sohocky; $i++) {
                        $tenhk = "Học kỳ $i";
                        mysqli_query($this->con, "INSERT INTO hocky (tenhocky, manamhoc, sohocky) VALUES ('$tenhk', $manamhoc, $i)");
                    }
                } elseif ($sohocky < $current) {
                    mysqli_query($this->con, "DELETE FROM hocky WHERE manamhoc = $manamhoc AND sohocky > $sohocky");
                }
            }

            mysqli_commit($this->con);
            return ["success" => true];
        } catch (Exception $e) {
            mysqli_rollback($this->con);
            error_log("updateNamHoc error: " . $e->getMessage());
            return ["success" => false, "message" => "Lỗi khi cập nhật năm học!"];
        } finally {
            mysqli_autocommit($this->con, true);
        }
    }


    public function deleteNamHoc($manamhoc)
    {
        $sql = "UPDATE namhoc SET trangthai = 0 WHERE manamhoc = ?";
        $stmt = mysqli_prepare($this->con, $sql);
        mysqli_stmt_bind_param($stmt, "i", $manamhoc);
        $result = mysqli_stmt_execute($stmt);
        mysqli_stmt_close($stmt);
        return $result;
    }

    public function getHocKy($manamhoc)
    {
        $sql = "SELECT mahocky, tenhocky, sohocky FROM hocky WHERE manamhoc = ? ORDER BY sohocky";
        $stmt = mysqli_prepare($this->con, $sql);
        mysqli_stmt_bind_param($stmt, "i", $manamhoc);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        $rows = [];
        while ($row = mysqli_fetch_assoc($res)) {
            $rows[] = $row;
        }
        mysqli_stmt_close($stmt);
        return $rows;
    }

    public function getQuery($filter, $input, $args)
    {
        $query = "SELECT nh.*, 
                         (SELECT COUNT(*) FROM hocky hk WHERE hk.manamhoc = nh.manamhoc) as tonghocky
                  FROM namhoc nh WHERE 1=1";
        if ($input) {
            $query .= " AND nh.tennamhoc LIKE ?";
        }
        $query .= " ORDER BY nh.manamhoc DESC";
        return $query;
    }
}
