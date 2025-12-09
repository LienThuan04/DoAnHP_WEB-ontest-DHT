<?php

class ChiTietDeThiModel extends DB
{
    public function create($made, $macauhoi, $thutu)
    {
        if (empty($made) || empty($macauhoi) || empty($thutu)) {
            error_log("Invalid input: made=$made, macauhoi=$macauhoi, thutu=$thutu");
            return false;
        }

        $stmt = $this->con->prepare("SELECT macauhoi FROM cauhoi WHERE macauhoi = ?");
        $stmt->bind_param("s", $macauhoi);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 0) {
            error_log("Câu hỏi không tồn tại: macauhoi=$macauhoi");
            $stmt->close();
            return false;
        }
        $stmt->close();
        $stmt = $this->con->prepare("INSERT INTO chitietdethi (made, macauhoi, thutu) VALUES (?, ?, ?)");
        $stmt->bind_param("ssi", $made, $macauhoi, $thutu);
        $result = $stmt->execute();
        if (!$result) {
            error_log("SQL Error: " . mysqli_error($this->con));
            error_log("Parameters: made=$made, macauhoi=$macauhoi, thutu=$thutu");
            $stmt->close();
            return false;
        }
        $stmt->close();
        return true;
    }

    public function createMultiple($made, $cauhoi)
    {

        $stmt = $this->con->prepare("SELECT made FROM dethi WHERE made = ?");
        $stmt->bind_param("i", $made);
        $stmt->execute();
        $result = $stmt->get_result();
        $test = $result->fetch_assoc();
        $stmt->close();

        if (!$test) {
            return ['valid' => false, 'error' => 'Đề thi không tồn tại'];
        }

        // 2. Kiểm tra đã có thí sinh làm chưa
        $stmt = $this->con->prepare("SELECT COUNT(*) as count FROM ketqua WHERE made = ?");
        $stmt->bind_param("i", $made);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();

        if ($row['count'] > 0) {
            return ['valid' => false, 'error' => 'Đề thi đã có thí sinh làm, không thể thay đổi câu hỏi'];
        }


        $valid = true;
        $error = null;
        if (empty($made) || !is_array($cauhoi) || empty($cauhoi)) {
            error_log("Invalid input: made=$made, cauhoi=" . print_r($cauhoi, true));
            return ['valid' => false, 'error' => 'Mã đề hoặc danh sách câu hỏi không hợp lệ'];
        }
        $stmt = $this->con->prepare("SELECT made FROM dethi WHERE made = ?");
        $stmt->bind_param("s", $made);
        $stmt->execute();
        $result = $stmt->get_result();
        $test = $result->fetch_assoc();
        $stmt->close();

        if (!$test) {
            error_log("Đề thi không tồn tại: made=$made");
            return ['valid' => false, 'error' => 'Đề thi không tồn tại'];
        }
        $result = $this->delete($made);
        if (!$result) {
            error_log("Lỗi khi xóa chi tiết đề thi cũ: made=$made");
            return ['valid' => false, 'error' => 'Lỗi khi xóa chi tiết đề thi cũ'];
        }
        foreach ($cauhoi as $key => $item) {
            if (!isset($item['macauhoi']) || !isset($item['thutu'])) {
                error_log("Dữ liệu câu hỏi không hợp lệ tại vị trí: " . ($key + 1));
                return ['valid' => false, 'error' => "Dữ liệu câu hỏi không hợp lệ tại vị trí: " . ($key + 1)];
            }

            $result = $this->create($made, $item['macauhoi'], $item['thutu']);
            if (!$result) {
                $valid = false;
                $error = "Lỗi khi thêm câu hỏi với macauhoi: " . $item['macauhoi'];
                error_log($error);
                break;
            }
        }

        return ['valid' => $valid, 'error' => $error];
    }

    public function delete($made)
    {
        $valid = true;
        $sql = "DELETE FROM `chitietdethi` WHERE `made` = '$made'";
        $result = mysqli_query($this->con, $sql);
        if (!$result) {
            $valid = false;
        }
        return $valid;
    }
    public function countByMade($made)
    {
        if (empty($made)) {
            return 0;
        }
        $made = $this->con->real_escape_string($made);
        $sql = "SELECT COUNT(*) as cnt FROM `chitietdethi` WHERE `made` = '$made'";
        $result = mysqli_query($this->con, $sql);
        if (!$result) {
            error_log("ChiTietDeThiModel::countByMade SQL error: " . mysqli_error($this->con) . " for made=$made");
            return 0;
        }
        $row = mysqli_fetch_assoc($result);
        return isset($row['cnt']) ? (int)$row['cnt'] : 0;
    }
}
