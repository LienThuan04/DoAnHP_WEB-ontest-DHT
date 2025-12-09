<div class="content">
    <div class="block block-rounded">
        <div class="block-header block-header-default bg-olive text-white p-3 d-flex justify-content-between align-items-center">
            <h3 class="block-title mb-0 fs-5 fw-bold">
                <i class="fa fa-tasks me-2"></i> Tất cả phân công
            </h3>
            <div class="block-options">
                <button data-role="phancong" data-action="create" type="button" 
                        class="btn btn-sm btn-light rounded-pill px-3" 
                        data-bs-toggle="modal" data-bs-target="#modal-add-assignment" id="add_assignment">
                    <i class="fa-regular fa-plus me-1"></i> Thêm phân công mới
                </button>
            </div>
        </div>
        <div class="block-content p-4">
            <form action="#" id="main-page-search-form" onsubmit="return false;">
                <div class="row g-3 mb-4">
                    <div class="col-md-4">
                        <div class="input-group rounded-pill overflow-hidden shadow-sm">
                            <span class="input-group-text bg-white border-0">
                                <i class="fa fa-search text-muted"></i>
                            </span>
                            <input type="text" class="form-control form-control-alt border-0" 
                                   id="search-input" name="search-input" 
                                   placeholder="Tìm kiếm giảng viên, môn học...">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <select class="form-select border-olive" id="filter-namhoc" name="filter-namhoc">
                            <option value="">Chọn năm học</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <select class="form-select border-olive" id="filter-hocky" name="filter-hocky">
                            <option value="">Chọn học kỳ</option>
                        </select>
                    </div>
                </div>
            </form>

            <div class="table-responsive">
                <table class="table table-vcenter table-hover">
                    <thead class="bg-olive-light text-dark">
                        <tr>
                            <th class="text-center" style="width: 60px;">STT</th>
                            <th><i class="fa fa-user me-1"></i> Tên giảng viên</th>
                            <th class="text-center"><i class="fa fa-barcode me-1"></i> Mã môn</th>
                            <th><i class="fa fa-book me-1"></i> Môn học</th>
                            <th class="text-center"><i class="fa fa-calendar me-1"></i> Năm học</th>
                            <th class="text-center"><i class="fa fa-clock me-1"></i> Học kỳ</th>
                            <th class="text-center"><i class="fa fa-circle me-1"></i>Trạng thái</th>
                            <th class="text-center" style="width: 150px;"><i class="fa fa-cogs me-1"></i> Hành động</th>
                        </tr>
                    </thead>
                    <tbody id="listAssignment">
                        <tr>
                            <td class="text-center">1</td>
                            <td class="fw-semibold text-olive">Nguyễn Văn A</td>
                            <td class="text-center">CS101</td>
                            <td class="fw-medium">Lập trình C</td>
                            <td class="text-center">2023-2024</td>
                            <td class="text-center">1</td>
                            <td class="text-center">
                                <button class="btn btn-sm btn-warning rounded-pill me-1" title="Sửa">
                                    <i class="fa fa-pencil-alt"></i>
                                </button>
                                <button class="btn btn-sm btn-danger-subtle rounded-pill" title="Xóa">
                                    <i class="fa fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <?php if (isset($data["Plugin"]["pagination"])) {
                require "./mvc/views/inc/pagination.php";
            } ?>
        </div>
    </div>
</div>

<!-- Modal: Thêm phân công -->
<div class="modal fade" id="modal-add-assignment" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-xl">
        <div class="modal-content">
            <ul class="nav nav-tabs nav-tabs-alt mb-1 bg-light" role="tablist">
                <li class="nav-item">
                    <button class="nav-link active fw-semibold text-olive" data-bs-toggle="tab" data-bs-target="#btabs-alt-static-home">
                        <i class="fa fa-hand-pointer me-1"></i> Thêm thủ công
                    </button>
                </li>
                <li class="nav-item ms-auto">
                    <button type="button" class="btn btn-close p-3" data-bs-dismiss="modal"></button>
                </li>
            </ul>
            <div class="modal-body block block-transparent bg-white mb-0 block-rounded p-4">
                <div class="tab-content">
                    <div class="tab-pane active" id="btabs-alt-static-home">
                        <form class="mb-4 form-phancong">
                            <div class="row g-3">
                                <div class="col-md-4">
                                    <label class="form-label fw-semibold">Giảng viên <span class="text-danger">*</span></label>
                                    <select class="js-select2 form-select border-olive" id="giang-vien" name="giang-vien" required>
                                        <option value="">Chọn giảng viên</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-semibold">Năm học <span class="text-danger">*</span></label>
                                    <select class="js-select2 form-select border-olive" id="namhoc" name="namhoc" required>
                                        <option value="">Chọn năm học</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label fw-semibold">Học kỳ <span class="text-danger">*</span></label>
                                    <select class="js-select2 form-select border-olive" id="hocky" name="hocky" required>
                                        <option value="">Chọn học kỳ</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                        <form action="#" id="modal-add-assignment-search-form" onsubmit="return false;">
                            <div class="mb-4">
                                <div class="input-group rounded-pill overflow-hidden shadow-sm">
                                    <span class="input-group-text bg-white border-0">
                                        <i class="fa fa-search text-muted"></i>
                                    </span>
                                    <input type="text" class="form-control form-control-alt border-0" 
                                           id="search-input" name="search-input" 
                                           placeholder="Tìm kiếm môn học...">
                                </div>
                            </div>
                        </form>
                        <div class="mb-4 row">
                            <div class="table-responsive">
                                <table class="table table-vcenter">
                                    <thead class="bg-olive-light text-dark">
                                        <tr>
                                            <th class="text-center" style="width: 100px;">Chọn</th>
                                            <th class="text-center"><i class="fa fa-barcode me-1"></i> Mã môn học</th>
                                            <th><i class="fa fa-book me-1"></i> Tên môn học</th>
                                            <th class="text-center"><i class="fa fa-graduation-cap me-1"></i> Số tín chỉ</th>
                                            <th class="text-center"><i class="fa fa-chalkboard me-1"></i> Số tiết lý thuyết</th>
                                            <th class="text-center"><i class="fa fa-flask me-1"></i> Số tiết thực hành</th>
                                        </tr>
                                    </thead>
                                    <tbody id="list-subject">
                                        <tr>
                                            <td class="text-center">
                                                <div class="form-check">
                                                    <input class="form-check-input" type="checkbox" value="1">
                                                </div>
                                            </td>
                                            <td class="text-center">CS101</td>
                                            <td>Lập trình C</td>
                                            <td class="text-center">3</td>
                                            <td class="text-center">30</td>
                                            <td class="text-center">15</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <?php if (isset($data["Plugin"]["pagination"])) {
                                require "./mvc/views/inc/pagination.php";
                            }?>
                        </div>
                        <div class="mb-4 d-flex flex-row-reverse">
                            <button type="submit" class="btn btn-olive rounded-pill px-4 fw-semibold" id="btn_assignment">
                                <i class="fa fa-fw fa-plus me-1"></i> Lưu phân công
                            </button>
                            <input type="hidden" value="" id="question_id">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal: Chỉnh sửa phân công -->
<div class="modal fade" id="modal-default-vcenter" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0">
            <div class="modal-header bg-olive text-white">
                <h5 class="modal-title fw-bold">
                    <i class="fa fa-edit me-2"></i> Chỉnh sửa phân công
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <form id="form-edit-assignment">
                <div class="modal-body p-4">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold text-olive">
                                <i class="fa fa-chalkboard-teacher me-2"></i> Giảng viên
                            </label>
                            <select class="js-select2 form-select border-olive" id="edit-giang-vien" required>
                                <option value="">Chọn giảng viên</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold text-olive">
                                <i class="fa fa-book-open me-2"></i> Môn học
                            </label>
                            <select class="js-select2 form-select border-olive" id="edit-mon-hoc" required>
                                <option value="">Chọn môn học</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold text-olive">
                                <i class="fa fa-calendar me-2"></i> Năm học
                            </label>
                            <select class="js-select2 form-select border-olive" id="edit-namhoc" required disabled>
                                <option value="">Chọn năm học</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold text-olive">
                                <i class="fa fa-clock me-2"></i> Học kỳ
                            </label>
                            <select class="js-select2 form-select border-olive" id="edit-hocky" required disabled>
                                <option value="">Chọn học kỳ</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                        <i class="fa fa-times me-1"></i> Hủy
                    </button>
                    <button type="submit" class="btn btn-olive shadow-sm rounded-pill px-4">
                        <i class="fa fa-save me-1"></i> Lưu thay đổi
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Custom CSS -->
<style>
/* Màu chủ đạo */
.bg-olive { background-color: #9A9F6E !important; }
.bg-olive-light { background-color: #F5F6E9 !important; }
.text-olive { color: #9A9F6E !important; }
.border-olive { border-color: #9A9F6E !important; }
.btn-olive {
    background-color: #9A9F6E;
    border-color: #9A9F6E;
    color: #fff;
    font-weight: 600;
}
.btn-olive:hover {
    background-color: #7F8460;
    border-color: #7F8460;
}

.input-group .form-control {
    border-radius: 999px 0 0 999px !important;
    padding: 0.75rem 1rem;
    font-size: 1rem;
}
.input-group .input-group-text {
    border-radius: 0 999px 999px 0 !important;
    background-color: #f8f9fa;
}

.table thead th {
    font-weight: 600;
    font-size: 0.875rem;
}
.table td {
    font-size: 0.95rem;
    vertical-align: middle;
}
.table-hover tbody tr:hover {
    background-color: #F9FAF2;
}

.btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
}
.btn-warning {
    background-color: #fde68a;
    border-color: #fde68a;
    color: #92400e;
}
.btn-warning:hover {
    background-color: #fde068;
}
.btn-danger-subtle {
    background-color: #fee2e2;
    border-color: #fee2e2;
    color: #991b1b;
}
.btn-danger-subtle:hover {
    background-color: #fecaca;
}

.nav-tabs-alt .nav-link.active {
    color: #9A9F6E;
    border-bottom: 3px solid #9A9F6E;
    font-weight: 600;
}

.block-rounded {
    border-radius: 1rem;
}
.shadow-lg {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08) !important;
}

@media (max-width: 576px) {
    .block-header h3 { font-size: 1.1rem; }
    .btn-sm { padding: 0.2rem 0.4rem; font-size: 0.8rem; }
    .input-group .form-control { font-size: 0.9rem; padding: 0.5rem 0.75rem; }
}
</style>