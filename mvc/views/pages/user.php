<div class="content">
    <div class="block block-rounded shadow-sm">
        <!-- Header -->
        <div class="block-header block-header-default bg-primary-dark text-white">
            <h3 class="block-title fw-bold">
                <i class="fa fa-users me-2"></i> Quản lý người dùng
            </h3>
            <div class="block-options">
                <button type="button" class="btn btn-hero-sm btn-alt-primary" data-bs-toggle="modal" data-bs-target="#modal-add-user">
                    <i class="fa fa-plus me-1"></i> Thêm người dùng
                </button>
            </div>
        </div>

        <!-- Search & Filter -->
        <div class="block-content bg-body-light border-bottom">
            <form id="search-form" onsubmit="return false;">
                <div class="row g-3 align-items-center">
                    <div class="col-lg-8">
                        <div class="input-group input-group-lg">
                            <span class="input-group-text bg-white border-end-0">
                                <i class="fa fa-search text-muted"></i>
                            </span>
                            <input type="text" class="form-control form-control-alt border-start-0 ps-0" 
                                   id="search-input" placeholder="Tìm kiếm theo MSSV hoặc Tên">
                        </div>
                    </div>
                    <div class="col-lg-4">
    <div class="dropdown d-inline-block w-100">
        <button class="btn btn-alt-secondary dropdown-toggle w-100 text-start" 
                type="button" data-bs-toggle="dropdown">
            <i class="fa fa-filter me-2"></i>
            <span class="filter-text">Tất cả vai trò</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item filtered-by-role active" href="javascript:void(0)" data-id="0">Tất cả vai trò</a></li>
            <?php foreach ($data["Roles"] as $role): ?>
                <?php if ($role['manhomquyen'] != 3): // bỏ nhóm quyền 3?>
                    <li>
                        <a class="dropdown-item filtered-by-role" href="javascript:void(0)" 
                           data-id="<?= $role['manhomquyen'] ?>">
                           <?= htmlspecialchars($role['tennhomquyen']) ?>
                        </a>
                    </li>
                <?php endif; ?>
            <?php endforeach; ?>
        </ul>
    </div>
</div>

                    
                </div>
            </form>
        </div>

        <!-- Table -->
        <div class="block-content block-content-full">
            <div class="table-responsive">
                <table class="table table-hover table-vcenter text-nowrap">
                    <thead class="table-dark">
                        <tr>
                            <th class="text-center" style="width: 110px;">MSSV</th>
                            <th>Họ và tên</th>
                            <th class="text-center">Giới tính</th>
                            <th class="text-center">Ngày sinh</th>
                            <th class="text-center">Nhóm quyền</th>
                            <th class="text-center">Tham gia</th>
                            <th class="text-center">Trạng thái</th>
                            <th class="text-center" style="width: 120px;">Hành động</th>
                        </tr>
                    </thead>
                    <tbody id="list-user">
                        <!-- Dữ liệu sẽ được load bằng JS -->
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <?php if (isset($data["Plugin"]["pagination"])): ?>
                <?php require "./mvc/views/inc/pagination.php"; ?>
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- Modal Thêm / Sửa người dùng -->
<div class="modal fade" id="modal-add-user" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content shadow-lg border-0">
            <div class="block block-rounded mb-0">
                <ul class="nav nav-tabs nav-tabs-alt bg-light" role="tablist">
                    <li class="nav-item">
                        <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-manual">
                            <i class="fa fa-user-plus me-1"></i> Thêm thủ công
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-import">
                            <i class="fa fa-file-excel me-1"></i> Nhập từ file
                        </button>
                    </li>
                    <li class="nav-item ms-auto">
                        <button type="button" class="btn-close p-3" data-bs-dismiss="modal" aria-label="Close"></button>
                    </li>
                </ul>

                <div class="block-content tab-content p-4">
                    <!-- Tab Thủ công -->
                    <div class="tab-pane fade show active" id="tab-manual">
                        <form class="form-add-user" novalidate onsubmit="return false;">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Mã sinh viên <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" name="masinhvien" id="masinhvien" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Email <span class="text-danger">*</span></label>
                                    <input type="email" class="form-control" name="user_email" id="user_email" required>
                                </div>
                                <div class="col-12">
                                    <label class="form-label fw-semibold">Họ và tên <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" name="user_name" id="user_name" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-semibold">Giới tính</label>
                                    <div class="d-flex gap-4 mt-2">
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="user_gender" id="gender-male" value="1" checked>
                                            <label class="form-check-label" for="gender-male">Nam</label>
                                        </div>
                                        <div class="form-check">
                                            <input class="form-check-input" type="radio" name="user_gender" id="gender-female" value="0">
                                            <label class="form-check-label" for="gender-female">Nữ</label>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-semibold">Ngày sinh</label>
                                    <input type="text" class="form-control js-flatpickr" name="user_ngaysinh" id="user_ngaysinh">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-semibold">Nhóm quyền</label>
                                    <select class="form-select js-select2 data-nhomquyen" name="user_nhomquyen" id="user_nhomquyen"></select>
                                </div>
                               
                                <div class="col-md-6">
                                    <label class="form-label fw-semibold">Trạng thái</label>
                                    <div class="form-check form-switch mt-2">
                                        <input class="form-check-input" type="checkbox" id="user_status" checked>
                                        <label class="form-check-label" for="user_status">Hoạt động</label>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-4 text-end border-top pt-3">
                                <button type="button" class="btn btn-alt-secondary me-2" data-bs-dismiss="modal">
                                    <i class="fa fa-times"></i> Hủy
                                </button>
                                <button type="submit" class="btn btn-primary add-user-element" id="btn-add-user">
                                    <i class="fa fa-save"></i> Lưu lại
                                </button>
                                <button type="button" class="btn btn-success update-user-element d-none" id="btn-update-user">
                                    <i class="fa fa-check"></i> Cập nhật
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Tab Nhập file -->
                    <div class="tab-pane fade" id="tab-import">
                        <form id="form-upload" method="POST" enctype="multipart/form-data">
                            <div class="row g-3">
                                <div class="col-12">
                                    <label class="form-label fw-semibold">Mật khẩu mặc định cho sinh viên</label>
                                    <input type="password" class="form-control" name="user_password" id="ps_user_group" placeholder="Để trống nếu muốn hệ thống tự sinh">
                                </div>
                                <div class="col-12">
                                    <label class="form-label fw-semibold">File Excel (.xlsx, .xls, .csv)</label>
                                    <input type="file" class="form-control" id="file-cau-hoi" name="file" accept=".xlsx,.xls,.csv" required>
                                </div>
                                <div class="col-12">
                                    <div class="alert alert-info">
                                        <i class="fa fa-info-circle"></i> 
                                        Vui lòng sử dụng đúng định dạng. 
                                        <a href="./public/filemau/danhsachsv_cntt2211.xls" class="alert-link">Tải file mẫu tại đây</a>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-4 text-end">
                                <button type="submit" class="btn btn-hero btn-primary" id="nhap-file">
                                    <i class="fa fa-cloud-arrow-up me-2"></i> Nhập vào hệ thống
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>