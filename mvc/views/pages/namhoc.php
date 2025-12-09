<!-- Main Content -->
<div class="content py-5 bg-light">
    <div class="block block-rounded shadow-lg border-start border-5 border-teal">
        <div class="block-header bg-gradient-teal text-white p-4 d-flex justify-content-between align-items-center">
            <h3 class="block-title mb-0"><i class="fa fa-calendar-alt me-2"></i> Quản lý Năm học & Học kỳ</h3>
            <button class="btn btn-hero-sm btn-light" id="btn-add-namhoc" data-bs-toggle="tooltip" title="Thêm năm học mới">
                <i class="fa fa-plus-circle me-1 text-teal"></i> Thêm năm học
            </button>
        </div>

        <div class="block-content p-4">
            <form id="main-page-search-form" onsubmit="return false;" class="mb-4">
                <div class="input-group input-group-lg">
                    <span class="input-group-text bg-white border-2 border-teal">
                        <i class="fa fa-search text-muted"></i>
                    </span>
                    <input type="text" class="form-control border-2 border-teal" name="search-input" placeholder="Tìm năm học..." aria-label="Tìm kiếm năm học">
                    <button type="button" class="btn btn-outline-teal btn-search" data-bs-toggle="tooltip" title="Tìm kiếm">
                        <i class="fa fa-search"></i> Tìm
                    </button>
                </div>
            </form>

            <div class="table-responsive">
                <table class="table table-hover table-vcenter table-striped align-middle">
                    <thead class="bg-teal-light text-dark">
                        <tr>
                            <th class="width: 30%" style="width: 10%;">STT</th>
                            <th style="width: 30%;"><i class="fa fa-calendar me-1"></i> Năm học</th>
                            <th style="width: 20%;"><i class="fa fa-book me-1"></i> Số học kỳ</th>
                            <th style="width: 20%;"><i class="fa fa-info-circle me-1"></i> Trạng thái</th>
                            <th class="text-center" style="width: 20%;"><i class="fa fa-cogs me-1"></i> Thao tác</th>
                        </tr>
                    </thead>
                    <tbody id="listNamHoc"></tbody>
                </table>
            </div>

            <div class="pagination-container main-page-pagination mt-4 d-flex justify-content-end">
                <!-- Pagination will be dynamically inserted here -->
            </div>
        </div>
    </div>
</div>

<!-- Modal Thêm/Sửa -->
<div class="modal fade" id="modal-namhoc" tabindex="-1" aria-labelledby="modal-namhoc-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-sm">
            <div class="modal-header bg-gradient-teal text-white">
                <h5 class="modal-title" id="modal-namhoc-label"><i class="fa fa-plus-circle me-2"></i> Thêm năm học</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Đóng"></button>
            </div>
            <form id="form-namhoc">
                <div class="modal-body p-4">
                    <input type="hidden" name="manamhoc">
                    <div class="mb-4">
                        <label class="form-label fw-bold"><i class="fa fa-calendar me-1"></i> Tên năm học <span class="text-danger">*</span></label>
                        <input type="text" class="form-control border-teal" name="tennamhoc" placeholder="Ví dụ: 2023-2024" required>
                    </div>
                    <div class="mb-4" id="div-sohocky">
                        <label class="form-label fw-bold"><i class="fa fa-book me-1"></i> Số học kỳ <span class="text-danger">*</span></label>
                        <select class="form-select border-teal" name="sohocky">
                            <option value="2">2 học kỳ</option>
                            <option value="3" selected>3 học kỳ</option>
                            <option value="4">4 học kỳ</option>
                        </select>
                    </div>
                    <div class="mb-4">
                        <label class="form-label fw-bold"><i class="fa fa-toggle-on me-1"></i> Trạng thái</label>
                        <select class="form-select border-teal" name="trangthai">
                            <option value="1">Hoạt động</option>
                            <option value="0">Tạm ngưng</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal"><i class="fa fa-times me-1"></i> Hủy</button>
                    <button type="submit" class="btn btn-teal" id="btn-save-namhoc">
                        <i class="fa fa-save me-1"></i> Lưu
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Modal Xem học kỳ -->
<div class="modal fade" id="modal-hocky" tabindex="-1" aria-labelledby="modal-hocky-label" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-sm">
            <div class="modal-header bg-gradient-indigo text-white">
                <h5 class="modal-title" id="modal-hocky-label"><i class="fa fa-list-alt me-2"></i> Danh sách học kỳ</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Đóng"></button>
            </div>
            <div class="modal-body p-4">
                <div class="table-responsive">
                    <table class="table table-sm table-striped align-middle">
                        <thead class="bg-indigo-light text-dark">
                            <tr>
                                <th style="width: 20%;">STT</th>
                                <th style="width: 80%;"><i class="fa fa-book me-1"></i> Tên học kỳ</th>
                            </tr>
                        </thead>
                        <tbody id="listHocKy"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Custom CSS for Enhanced Styling -->
<style>
/* Gradient Backgrounds */
.bg-gradient-teal {
    background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%);
}
.bg-gradient-indigo {
    background: linear-gradient(135deg, #4f46e5 0%, #818cf8 100%);
}
.bg-teal-light {
    background-color: #ccfbf1 !important;
}
.bg-indigo-light {
    background-color: #e0e7ff !important;
}

/* Custom Button Styles */
.btn-teal {
    background-color: #14b8a6;
    border-color: #14b8a6;
    color: #fff;
}
.btn-teal:hover {
    background-color: #0d9488;
    border-color: #0d9488;
}
.btn-outline-teal {
    border-color: #14b8a6;
    color: #14b8a6;
}
.btn-outline-teal:hover {
    background-color: #14b8a6;
    color: #fff;
}

/* Border and Shadow Enhancements */
.border-teal {
    border-color: #14b8a6 !important;
}
.shadow-lg {
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

/* Table Hover Effect */
.table-hover tbody tr:hover {
    background-color: #f1f5f9;
}

/* Form Control Focus */
.form-control:focus, .form-select:focus {
    border-color: #14b8a6;
    box-shadow: 0 0 0 0.2rem rgba(20, 184, 166, 0.25);
}

/* Responsive Adjustments */
@media (max-width: 576px) {
    .block-header h3 {
        font-size: 1.25rem;
    }
    .btn-hero-sm {
        font-size: 0.875rem;
        padding: 0.5rem 1rem;
    }
}
</style>