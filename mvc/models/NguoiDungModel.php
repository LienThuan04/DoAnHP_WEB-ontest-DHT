<?php

class NguoiDungModel extends DB
{
    public function create($id, $email, $hoten, $gioitinh, $ngaysinh, $sodienthoai, $password)
    {
        $id = mysqli_real_escape_string($this->con, $id);
        $email = mysqli_real_escape_string($this->con, $email);
        $hoten = mysqli_real_escape_string($this->con, $hoten);
        $gioitinh = $gioitinh !== null ? (int)$gioitinh : 0;
        $ngaysinh = mysqli_real_escape_string($this->con, $ngaysinh ?: '2004-01-01');
        $sodienthoai = $sodienthoai !== null ? (int)$sodienthoai : 'NULL';
        $password = password_hash($password, PASSWORD_DEFAULT);
        $ngaythamgia = date('Y-m-d');
        $trangthai = 1;
        $manhomquyen = 2;

        $sql = "INSERT INTO `nguoidung`(`id`, `email`, `hoten`, `gioitinh`, `ngaysinh`, `ngaythamgia`, `matkhau`, `trangthai`, `sodienthoai`, `manhomquyen`) 
                VALUES ('$id', '$email', '$hoten', $gioitinh, '$ngaysinh', '$ngaythamgia', '$password', $trangthai, $sodienthoai, $manhomquyen)";
        $result = mysqli_query($this->con, $sql);
        return $result !== false;
    }

    public function delete($id)
    {
        $id = mysqli_real_escape_string($this->con, $id);
        $sql = "UPDATE `nguoidung` SET `trangthai` = 0 WHERE `id` = '$id'";
        $result = mysqli_query($this->con, $sql);
        return $result !== false;
    }

    public function update($id, $email, $hoten, $gioitinh, $ngaysinh, $sodienthoai, $password, $trangthai, $manhomquyen)
    {
        $id = mysqli_real_escape_string($this->con, $id);
        $email = mysqli_real_escape_string($this->con, $email);
        $hoten = mysqli_real_escape_string($this->con, $hoten);
        $gioitinh = $gioitinh !== null ? (int)$gioitinh : 0;
        $ngaysinh = mysqli_real_escape_string($this->con, $ngaysinh ?: '2004-01-01');
        $sodienthoai = $sodienthoai !== null ? (int)$sodienthoai : 'NULL';
        $trangthai = (int)$trangthai;
        $manhomquyen = (int)$manhomquyen;

        $querypass = $password ? ", `matkhau`='" . password_hash($password, PASSWORD_DEFAULT) . "'" : '';
        $sql = "UPDATE `nguoidung` SET `email`='$email', `hoten`='$hoten', `gioitinh`=$gioitinh, `ngaysinh`='$ngaysinh', 
                `sodienthoai`=$sodienthoai, `trangthai`=$trangthai, `manhomquyen`=$manhomquyen $querypass WHERE `id`='$id'";
        $result = mysqli_query($this->con, $sql);
        return $result !== false;
    }

    public function updateProfile($hoten, $gioitinh, $ngaysinh, $email, $id)
    {
        $id = mysqli_real_escape_string($this->con, $id);
        $email = mysqli_real_escape_string($this->con, $email);
        $hoten = mysqli_real_escape_string($this->con, $hoten);
        $gioitinh = $gioitinh !== null ? (int)$gioitinh : 0;
        $ngaysinh = mysqli_real_escape_string($this->con, $ngaysinh ?: '2004-01-01');

        $sql = "UPDATE `nguoidung` SET `email`='$email', `hoten`='$hoten', `gioitinh`=$gioitinh, `ngaysinh`='$ngaysinh' WHERE `id`='$id'";
        $result = mysqli_query($this->con, $sql);
        return $result !== false;
    }

    public function uploadFile($id, $tmpName, $imageExtension, $validImageExtension, $name)
    {
        if (!in_array($imageExtension, $validImageExtension)) {
            return false;
        }
        $newImageName = $name . "-" . uniqid() . '.' . $imageExtension;
        if (move_uploaded_file($tmpName, './public/media/avatars/' . $newImageName)) {
            $id = mysqli_real_escape_string($this->con, $id);
            $sql = "UPDATE `nguoidung` SET `avatar`='$newImageName' WHERE `id`='$id'";
            return mysqli_query($this->con, $sql) !== false;
        }
        return false;
    }

    public function getAll()
    {
        $sql = "SELECT nguoidung.*, nhomquyen.`tennhomquyen`
                FROM nguoidung
                LEFT JOIN nhomquyen ON nguoidung.`manhomquyen` = nhomquyen.`manhomquyen`";
        $result = mysqli_query($this->con, $sql);
        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function getById($id)
    {
        $sql = "SELECT * FROM nguoidung WHERE id = ?";
        $stmt = $this->con->prepare($sql);
        $stmt->bind_param("s", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result ? $result->fetch_assoc() : false;
    }


    public function getByEmail($email)
    {
        $email = mysqli_real_escape_string($this->con, $email);
        $sql = "SELECT * FROM `nguoidung` WHERE `email`='$email'";
        $result = mysqli_query($this->con, $sql);
        return $result ? mysqli_fetch_assoc($result) : false;
    }

    public function checkOtp($email, $otp)
    {
        $stmt = $this->con->prepare("SELECT 1 FROM nguoidung WHERE email = ? AND otp = ?");
        $stmt->bind_param("ss", $email, $otp);
        $stmt->execute();
        $stmt->store_result();

        return $stmt->num_rows > 0;
    }


    public function changePassword($id, $new_password_hashed)
    {
       
        $sql = "UPDATE nguoidung SET matkhau = ? WHERE id = ?";
        $stmt = $this->con->prepare($sql);
        $stmt->bind_param("ss", $new_password_hashed, $id);
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                return true;
            } else {
                error_log("Không có dòng nào bị thay đổi trong UPDATE mật khẩu.");
                return false;
            }
        } else {
            error_log("Lỗi khi UPDATE mật khẩu: " . $stmt->error);
            return false;
        }
    }

    public function checkPassword($id, $password)
    {
        $user = $this->getById($id);
        return $user && password_verify($password, $user['matkhau']);
    }

    public function checkLogin($id, $password)
    {
        if (empty($id) || empty($password)) {
            return [
                'success' => false,
                'message' => 'Vui lòng nhập đầy đủ mã sinh viên và mật khẩu'
            ];
        }

        $user = $this->getById($id);
        if (!$user) {
            return [
                'success' => false,
                'message' => 'Tài khoản không tồn tại'
            ];
        }

        if ($user['trangthai'] == 0) {
            return [
                'success' => false,
                'message' => 'Tài khoản bị khóa'
            ];
        }

        if (!password_verify($password, $user['matkhau'])) {
            return [
                'success' => false,
                'message' => 'Mật khẩu không đúng'
            ];
        }

        $token = time() . password_hash($id, PASSWORD_DEFAULT);
        if ($this->updateToken($id, $token)) {
            setcookie("token", $token, time() + 7 * 24 * 3600, "/", "", false, true); // Thêm bảo mật cho cookie
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['user_email'] = $user['email'];
            $_SESSION['user_name'] = $user['hoten'];
            $_SESSION['user_role'] = $this->getRole($user['manhomquyen']);
            $_SESSION['user_permission_group'] = $user['manhomquyen'];

            return [
                'success' => true,
                'message' => 'Đăng nhập thành công'
            ];
        }

        return [
            'success' => false,
            'message' => 'Lỗi hệ thống khi đăng nhập'
        ];
    }

    public function updateToken($id, $token)
    {
        $id = mysqli_real_escape_string($this->con, $id);
        $token = $token !== null ? "'" . mysqli_real_escape_string($this->con, $token) . "'" : 'NULL';
        $sql = "UPDATE `nguoidung` SET `token`=$token WHERE `id`='$id'";
        return mysqli_query($this->con, $sql) !== false;
    }

    public function validateToken($token)
    {
        if (empty($token)) {
            return false;
        }

        $token = mysqli_real_escape_string($this->con, $token);
        $sql = "SELECT * FROM `nguoidung` WHERE `token`='$token' LIMIT 1";
        $result = mysqli_query($this->con, $sql);

        if ($result && mysqli_num_rows($result) > 0) {
            $row = mysqli_fetch_assoc($result);

            if (!$row) {
                return false;
            }

            $_SESSION['user_id'] = $row['id'] ?? null;
            $_SESSION['user_email'] = $row['email'] ?? null;
            $_SESSION['user_name'] = $row['hoten'] ?? null;
            $_SESSION['avatar'] = $row['avatar'] ?? null;

            if (isset($row['manhomquyen'])) {
                $_SESSION['user_permission_group'] = $row['manhomquyen'];
                $_SESSION['user_role'] = $this->getRole($row['manhomquyen']);
                $_SESSION['is_admin'] = ($row['manhomquyen'] == 3);
            } else {
                $_SESSION['user_role'] = null;
                $_SESSION['is_admin'] = false;
            }

            return true;
        }

        return false;
    }


    public function getRole($manhomquyen)
    {
        $manhomquyen = (int)$manhomquyen;
        $sql = "SELECT chucnang, hanhdong FROM chitietquyen WHERE manhomquyen = $manhomquyen";
        $result = mysqli_query($this->con, $sql);
        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        $roles = [];
        foreach ($rows as $item) {
            $chucnang = $item['chucnang'];
            $hanhdong = $item['hanhdong'];
            if (!isset($roles[$chucnang])) {
                $roles[$chucnang] = [$hanhdong];
            } else {
                array_push($roles[$chucnang], $hanhdong);
            }
        }
        return $roles;
    }

    public function logout()
    {
        $id = mysqli_real_escape_string($this->con, $_SESSION['user_id']);
        $sql = "UPDATE `nguoidung` SET `token`=NULL WHERE `id`='$id'";
        session_destroy();
        setcookie("token", "", time() - 10, '/');
        return mysqli_query($this->con, $sql) !== false;
    }

    public function updateOpt($email, $otp)
    {
        $email = mysqli_real_escape_string($this->con, $email);
        $otp = $otp !== null ? "'" . mysqli_real_escape_string($this->con, $otp) . "'" : 'NULL';
        $sql = "UPDATE `nguoidung` SET `otp`=$otp WHERE `email`='$email'";
        return mysqli_query($this->con, $sql) !== false;
    }

    public function addFile($data, $pass)
    {
        $check = true;
        foreach ($data as $user) {
            $fullname = mysqli_real_escape_string($this->con, $user['fullname']);
            $email = mysqli_real_escape_string($this->con, $user['email']);
            $mssv = mysqli_real_escape_string($this->con, $user['mssv']);
            $password = password_hash($pass, PASSWORD_DEFAULT);
            $trangthai = (int)$user['trangthai'];
            $nhomquyen = (int)$user['nhomquyen'];
            $ngaythamgia = date('Y-m-d');
            $sql = "INSERT INTO `nguoidung`(`id`, `email`, `hoten`, `matkhau`, `trangthai`, `manhomquyen`, `ngaythamgia`) 
                    VALUES ('$mssv', '$email', '$fullname', '$password', $trangthai, $nhomquyen, '$ngaythamgia')";
            if (!mysqli_query($this->con, $sql)) {
                $check = false;
            }
        }
        return $check;
    }

    public function addFileGroup($data, $pass, $group)
    {
        $success = [];
        $exists = [];
        $errors = [];

        foreach ($data as $user) {
            $fullname = mysqli_real_escape_string($this->con, $user['fullname'] ?? '');
            $email = mysqli_real_escape_string($this->con, $user['email'] ?? '');
            $mssv = mysqli_real_escape_string($this->con, $user['mssv'] ?? '');
            $trangthai = (int)($user['trangthai'] ?? 1);
            $nhomquyen = (int)($user['nhomquyen'] ?? 2);
            $ngaythamgia = date('Y-m-d');

            // Kiểm tra dữ liệu đầu vào
            if (empty($mssv) || empty($email) || empty($fullname)) {
                $errors[] = "Dữ liệu không hợp lệ cho MSSV: $mssv";
                continue;
            }

            $sql_check = "SELECT id FROM nguoidung WHERE id = '$mssv'";
            $result = mysqli_query($this->con, $sql_check);
            if (mysqli_num_rows($result) > 0) {
                $sql_check_group = "SELECT manguoidung FROM chitietnhom WHERE manguoidung = '$mssv' AND manhom = '$group'";
                $result_group = mysqli_query($this->con, $sql_check_group);
                if (mysqli_num_rows($result_group) > 0) {
                    $exists[] = $mssv;
                    continue;
                }
                if ($this->join($group, $mssv)) {
                    $success[] = $mssv;
                } else {
                    $errors[] = "Không thể thêm MSSV $mssv vào nhóm";
                }
                continue;
            }

            $sql_check_email = "SELECT email FROM nguoidung WHERE email = '$email'";
            $result_email = mysqli_query($this->con, $sql_check_email);
            if (mysqli_num_rows($result_email) > 0) {
                $errors[] = "Email $email đã tồn tại cho MSSV $mssv";
                continue;
            }

            $password = password_hash($pass, PASSWORD_DEFAULT);
            $sql = "INSERT INTO `nguoidung`(`id`, `email`, `hoten`, `matkhau`, `trangthai`, `manhomquyen`, `ngaythamgia`) 
                VALUES ('$mssv', '$email', '$fullname', '$password', $trangthai, $nhomquyen, '$ngaythamgia')";

            if (mysqli_query($this->con, $sql)) {
                if ($this->join($group, $mssv)) {
                    $success[] = $mssv;
                } else {
                    $errors[] = "Không thể thêm MSSV $mssv vào nhóm";
                    $this->delete($mssv);
                }
            } else {
                $errors[] = "Lỗi thêm MSSV $mssv: " . mysqli_error($this->con);
            }
        }

        return [
            'success' => $success,
            'exists' => $exists,
            'errors' => $errors
        ];
    }

    public function join($manhom, $manguoidung)
    {
        $manhom = mysqli_real_escape_string($this->con, $manhom);
        $manguoidung = mysqli_real_escape_string($this->con, $manguoidung);
        $sql = "INSERT INTO `chitietnhom`(`manhom`, `manguoidung`) VALUES ('$manhom', '$manguoidung')";
        if (mysqli_query($this->con, $sql)) {
            return $this->updateSiso($manhom);
        }
        return false;
    }
    public function exists($mssv)
    {
        $mssv = mysqli_real_escape_string($this->con, $mssv);
        $sql = "SELECT COUNT(*) as total FROM nguoidung WHERE id = '$mssv'";
        $result = mysqli_query($this->con, $sql);

        if ($result && mysqli_num_rows($result) > 0) {
            $row = mysqli_fetch_assoc($result);
            return $row['total'] > 0;
        }

        return false;
    }


    public function updateSiso($manhom)
    {
        $manhom = (int)$manhom;
        $sql = "UPDATE `nhom` SET `siso`=(SELECT COUNT(*) FROM `chitietnhom` WHERE manhom=$manhom) WHERE `manhom`=$manhom";
        return mysqli_query($this->con, $sql) !== false;
    }

    public function setStatus($id, $trangthai)
    {
        $id = mysqli_real_escape_string($this->con, $id);
        $trangthai = (int)$trangthai;
        $sql = "UPDATE `nguoidung` SET `trangthai`=$trangthai WHERE `id`='$id'";
        return mysqli_query($this->con, $sql) !== false;
    }
    public function getQuery($filter, $input, $args)
    {
        $query = "SELECT ND.*, NQ.tennhomquyen FROM nguoidung ND, nhomquyen NQ WHERE ND.manhomquyen = NQ.manhomquyen AND ND.trangthai = 1  AND ND.manhomquyen != 3";
        if (isset($filter['role'])) {
            $query .= " AND ND.manhomquyen = " . $filter['role'];
        }
        if ($input) {
            $query = $query . " AND (ND.hoten LIKE N'%{$input}%' OR ND.id LIKE '%{$input}%')";
        }
        $query = $query . " ORDER BY id ASC";
        return $query;
    }
    public function checkUser($mssv, $email)
    {
        $mssv = mysqli_real_escape_string($this->con, $mssv);
        $email = mysqli_real_escape_string($this->con, $email);
        $sql = "SELECT * FROM `nguoidung` WHERE `id`='$mssv' OR `email`='$email'";
        $result = mysqli_query($this->con, $sql);
        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function checkEmail($id)
    {
        $id = mysqli_real_escape_string($this->con, $id);
        $sql = "SELECT email FROM nguoidung WHERE id='$id'";
        $result = mysqli_query($this->con, $sql);
        return $result ? mysqli_fetch_assoc($result)['email'] : false;
    }

    public function checkEmailExist($email)
    {
        $email = mysqli_real_escape_string($this->con, $email);
        $sql = "SELECT * FROM nguoidung WHERE email='$email'";
        $result = mysqli_query($this->con, $sql);
        return $result && mysqli_num_rows($result) > 0;
    }

    public function updateEmail($id, $email)
    {
        $id = mysqli_real_escape_string($this->con, $id);
        $email = mysqli_real_escape_string($this->con, $email);
        $sql = "UPDATE `nguoidung` SET `email`='$email' WHERE `id`='$id'";
        return mysqli_query($this->con, $sql) !== false;
    }

    public function getAllRoles()
    {
        $sql = "SELECT * FROM nhomquyen WHERE trangthai=1";
        $result = mysqli_query($this->con, $sql);
        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function getByRole($manhomquyen)
    {
        $manhomquyen = (int)$manhomquyen;
        $sql = "SELECT nguoidung.id, nguoidung.hoten, nguoidung.email, nguoidung.trangthai, nhomquyen.tennhomquyen
            FROM nguoidung
            LEFT JOIN nhomquyen ON nguoidung.manhomquyen = nhomquyen.manhomquyen
            WHERE nguoidung.manhomquyen = $manhomquyen
            ORDER BY nguoidung.id ASC";
        $result = mysqli_query($this->con, $sql);
        $rows = [];
        while ($row = mysqli_fetch_assoc($result)) {
            $rows[] = $row;
        }
        return $rows;
    }
}
