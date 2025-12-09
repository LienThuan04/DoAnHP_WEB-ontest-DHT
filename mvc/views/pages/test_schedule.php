<div class="content" data-id="<?php echo $data["user_id"] ?>">
    <!-- Thanh tìm kiếm và lọc trạng thái -->
<!-- Thanh tìm kiếm & Bộ lọc trạng thái -->
<div class="row mb-5 justify-content-center">
    <div class="col-12 col-lg-8 col-xl-7">
        <div class="search-filter-wrapper p-3 bg-white rounded-4 shadow-lg border-0" 
             style="backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2);">
            <form id="search-form" onsubmit="return false;" class="d-flex flex-column flex-md-row gap-3 align-items-center">
                <!-- Bộ lọc trạng thái -->
                <div class="dropdown flex-shrink-0">
                    <button class="btn btn-outline-primary dropdown-toggle px-4 py-2 fw-600 rounded-pill d-flex align-items-center gap-2"
                            id="dropdown-filter-state" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-filter fa-sm"></i>
                        <span class="filter-text">Tất cả</span>
                        <i class="fas fa-chevron-down ms-2 fa-xs"></i>
                    </button>
                    <ul class="dropdown-menu shadow-lg border-0 rounded-3" aria-labelledby="dropdown-filter-state">
                        <li><a class="dropdown-item py-2 filtered-by-state" href="#" data-value="4">
                            <i class="fas fa-globe me-2"></i> Tất cả
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item py-2 filtered-by-state" href="#" data-value="0">
                            <span class="badge bg-secondary rounded-pill me-2">•</span> Chưa làm
                        </a></li>
                        <li><a class="dropdown-item py-2 filtered-by-state" href="#" data-value="1">
                            <span class="badge bg-danger rounded-pill me-2">!</span> Quá hạn
                        </a></li>
                        <li><a class="dropdown-item py-2 filtered-by-state" href="#" data-value="2">
                            <span class="badge bg-warning rounded-pill me-2">●</span> Chưa mở
                        </a></li>
                        <li><a class="dropdown-item py-2 filtered-by-state" href="#" data-value="3">
                            <span class="badge bg-success rounded-pill me-2">✓</span> Đã hoàn thành
                        </a></li>
                    </ul>
                </div>

                <!-- Thanh tìm kiếm -->
                <div class="flex-grow-1 position-relative">
                    <input type="text" 
                           class="form-control form-control-lg rounded-pill ps-5 py-3 shadow-sm border-0" 
                           placeholder="Tìm kiếm đề thi, tên môn học, mã đề..." 
                           id="search-input" 
                           autocomplete="off">
                    <i class="fas fa-search position-absolute top-50 start-3 translate-middle-y text-muted"></i>
                </div>

                <!-- Nút làm mới (tùy chọn) -->
              
            </form>
        </div>
    </div>
</div>

<!-- Bảng danh sách đề thi - ĐẸP & HIỆN ĐẠI -->
<div class="table-responsive rounded-4 overflow-hidden shadow-xl">
    <table class="table table-hover align-middle mb-0 modern-table border-0">
        <thead>
            <tr class="text-white text-uppercase fw-bold fs-6 tracking-wider"
                style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <th class="py-4 ps-5">Tên đề thi</th>
                <th class="py-4">Môn học</th>
                <th class="py-4">TG bắt đầu</th>
                <th class="py-4">TG kết thúc</th>
                <th class="py-4">Nhóm</th>
                <th class="py-4 text-center">Điểm</th>
                <th class="py-4 text-center">Trạng thái</th>
                <th class="py-4 text-end pe-5">Hành động</th>
            </tr>
        </thead>
        <tbody class="list-test bg-white fw-medium">
            <!-- JS sẽ render vào đây -->
        </tbody>
    </table>
</div>

<!-- Loading Skeleton (hiển thị khi đang tải dữ liệu) -->
<div class="table-skeleton d-none mt-4">
    <div class="placeholder-glow">
        <div class="placeholder col-12 rounded-4" style="height: 80px;"></div>
        <div class="placeholder col-12 rounded-4 mt-3" style="height: 80px;"></div>
        <div class="placeholder col-12 rounded-4 mt-3" style="height: 80px;"></div>
    </div>
</div>

    <!-- Phân trang -->
    <div class="row my-3">
        <?php if (isset($data["Plugin"]["pagination"])) {
            require "./mvc/views/inc/pagination.php";
        } ?>
    </div>
</div>
<style>
/* =============== HOVER CHUẨN – CHỈ DÙNG 1 LẦN =============== */
.modern-table tbody tr {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-left: 4px solid transparent;
    position: relative;
    z-index: 1;
}

.modern-table tbody tr:hover {
    background: linear-gradient(90deg, #f8f9ff 0%, #f0f4ff 100%) !important;
    border-left-color: #667eea;
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(102, 126, 234, 0.18);
    z-index: 10;
}

/* =============== RESPONSIVE MOBILE – SIÊU ĐẸP =============== */
@media (max-width: 768px) {
    .modern-table thead {
        display: none;
    }
    
    .modern-table tbody tr {
        display: block;
        margin: 1rem 0;
        padding: 1.5rem;
        border-radius: 20px;
        border: none;
        background: white;
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.1);
        border-left: 5px solid #667eea;
    }

    .modern-table tbody td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border: none;
        text-align: right;
    }

    .modern-table tbody td::before {
        content: attr(data-label);
        font-weight: 600;
        color: #667eea;
        text-transform: uppercase;
        font-size: 0.8rem;
        flex: 1;
        text-align: left;
    }

    /* Nút hành động nổi bật trên mobile */
    .btn-mobile-round {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        box-shadow: 0 8px 20px rgba(0,0,0,0.2);
    }
}
.table-responsive { overflow-x: auto !important; }
.modern-table { min-width: 1000px; } 
</style>