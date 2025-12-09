<?php

$GLOBALS['navbar'] = [
    [
        'name' => 'Dashboard',
        'icon' => 'fas fa-tachometer-alt',
        'url'  => 'dashboard'
    ],
    [
        'name' => 'Sinh viên',
        'type' => 'heading',
        'navbarItem' => [
            [
                'name' => 'Học phần',
                'icon' => 'fas fa-chalkboard-teacher',
                'url'  => 'client/group',
                'role' => 'tghocphan'
            ],
            [
                'name' => 'Đề thi',
                'icon' => 'fas fa-file-alt',
                'url'  => 'client/test',
                'role' => 'tgthi'
            ],
        ]
    ],
    [
        'name' => 'Giáo viên',
        'type' => 'heading',
        'navbarItem' => [
            [
                'name' => 'Môn học',
                'icon' => 'fas fa-book-open',
                'url'  => 'view_subject',
                'role' => 'xem_monhoc'
            ],
            [
                'name' => 'Câu hỏi',
                'icon' => 'fas fa-question-circle',
                'url'  => 'question',
                'role' => 'cauhoi'
            ],
            [
                'name' => 'Nhóm học phần',
                'icon' => 'fas fa-layer-group',
                'url'  => 'module',
                'role' => 'hocphan'
            ],
            [
                'name' => 'Đề kiểm tra',
                'icon' => 'fas fa-file-lines',
                'url'  => 'test',
                'role' => 'dethi'
            ],
            [
                'name' => 'Thông báo',
                'icon' => 'fas fa-bullhorn',
                'url'  => 'teacher_announcement',
                'role' => 'thongbao'
            ],
            [
                'name' => 'Thống kê',
                'icon' => 'fas fa-chart-bar',
                'url'  => 'statistic',
                'role' => 'thongke'
            ],
        ]
    ],
    // ==========================
    // ADMIN SECTION (kế thừa từ GV)
    // ==========================
    [
        'name' => 'Admin',
        'type' => 'heading',
        'navbarItem' => [
            [
                'name' => 'Quản lý người dùng',
                'icon' => 'fas fa-users-cog',
                'url'  => 'user',
                'role' => 'nguoidung'
            ],
            [
            'name' => 'Năm học',
            'icon' => 'fas fa-calendar-alt',
            'url'  => 'namhoc',
            'role' => 'phancong'
            ],
            [
                'name' => 'Tạo môn học',
                'icon' => 'fas fa-plus-circle',
                'url'  => 'subject',
                'role' => 'monhoc'
            ],
            [
                'name' => 'Phân công môn học',
                'icon' => 'fas fa-tasks',
                'url'  => 'assignment',
                'role' => 'phancong'
            ],
            [
                'name' => 'Phân Quyền',
                'icon' => 'fas fa-users',
                'url'  => 'roles',
                'role' => 'nhomquyen'
            ],
        ]
    ],
];

// =========================
// 🔹 Hàm xác định trang hiện tại
// =========================
function getActiveNav()
{
    $directoryURI = $_SERVER['REQUEST_URI'];
    $path = parse_url($directoryURI, PHP_URL_PATH);
    $components = explode('/', $path);
    return $components[2] ?? '';
}

// =========================
// 🔹 Hàm build navbar (lọc theo quyền)
// =========================
function build_navbar()
{
    // Lọc các navbar item không thuộc quyền của user
    foreach ($GLOBALS['navbar'] as $key => $nav) {
        if (isset($nav['navbarItem'])) {
            foreach ($nav['navbarItem'] as $key1 => $navItem) {
                $role = $navItem['role'];
                // Nếu role là admin, chỉ show với admin
                if ($role == 'nguoidung' || $role == 'monhoc_admin' || $role == 'phancong' || $role == 'nhomquyen') {
                    if (empty($_SESSION['is_admin'])) {
                        unset($GLOBALS['navbar'][$key]['navbarItem'][$key1]);
                    }
                } else {
                    // check role bình thường
                    if (!array_key_exists($role, $_SESSION['user_role'])) {
                        unset($GLOBALS['navbar'][$key]['navbarItem'][$key1]);
                    }
                }
            }
        }
    }


    // Render HTML menu
    $html = '';
    $current_page = getActiveNav();

    foreach ($GLOBALS['navbar'] as $nav) {
        if (isset($nav['navbarItem']) && isset($nav['type']) && count($nav['navbarItem']) > 0) {
            $html .= "<li class=\"nav-main-heading\">".$nav['name']."</li>";
            foreach ($nav['navbarItem'] as $navItem) {
                $link_name = '<span class="nav-main-link-name">' . $navItem['name'] . '</span>' . "\n";
                $link_icon = '<i class="nav-main-link-icon ' . $navItem['icon'] . '"></i>' . "\n";
                $html .= "<li class=\"nav-main-item\">"."\n";
                $html .= "<a class=\"nav-main-link".($current_page == $navItem['url'] ? " active" : "")."\" href=\"./".$navItem['url']."\">";
                $html .= $link_icon;
                $html .= $link_name;
                $html .= "</a></li>\n";
            }
        }
    }

    echo $html;
}
