<div class="content py-5 bg-light" data-id="<?php echo $_SESSION['user_id']; ?>">
  <div class="block block-rounded shadow-lg border-start border-5 border-teal">
    <div class="block-header bg-gradient-teal text-white p-4 d-flex justify-content-between align-items-center">
      <h3 class="block-title mb-0"><i class="fa fa-bullhorn me-2"></i> Quản lý Thông báo</h3>
      <a href="./teacher_announcement/add" class="btn btn-hero-sm btn-light" title="Thêm thông báo">
        <i class="fa fa-plus-circle me-1 text-teal"></i> Thêm thông báo
      </a>
    </div>

    <div class="block-content p-4">
      <form id="search-form" onsubmit="return false;" class="mb-4">
        <div class="row gy-3">
          <div class="col-md-6">
            <div class="input-group input-group-lg">
              <span class="input-group-text bg-white border-2 border-teal">
                <i class="fa fa-search text-muted"></i>
              </span>
              <input type="text" class="form-control border-2 border-teal" id="search-input" placeholder="Tìm kiếm thông báo..." aria-label="Tìm kiếm thông báo">
              <button type="button" class="btn btn-outline-teal btn-search" data-bs-toggle="tooltip" title="Tìm kiếm">
                <i class="fa fa-search"></i> Tìm
              </button>
            </div>
          </div>

          <div class="col-md-3">
            <label for="filter-kihoc" class="form-label fw-semibold visually-hidden">Học kỳ</label>
            <select id="filter-kihoc" class="form-select border-teal">
              <option value="">Tất cả học kỳ</option>
            </select>
          </div>

          <div class="col-md-3">
            <label for="filter-nhomhocphan" class="form-label fw-semibold visually-hidden">Nhóm học phần</label>
            <select id="filter-nhomhocphan" class="form-select border-teal">
              <option value="">Tất cả nhóm học phần</option>
            </select>
          </div>
        </div>
      </form>

      <div class="table-responsive">
        <!-- JS sẽ render bảng/danh sách vào đây -->
        <div class="list-announces" id="list-announces"></div>
      </div>

      <div class="pagination-container main-page-pagination mt-4 d-flex justify-content-end">
        <?php
          if (isset($data["Plugin"]["pagination"])) {
            require "./mvc/views/inc/pagination.php";
          }
        ?>
      </div>
    </div>
  </div>

  <!-- Reuse styles from namhoc for consistent look -->
  <style>
  .bg-gradient-teal { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); }
  .bg-teal-light { background-color: #ccfbf1 !important; }
  .btn-teal { background-color: #14b8a6; border-color: #14b8a6; color: #fff; }
  .btn-teal:hover { background-color: #0d9488; border-color: #0d9488; }
  .btn-outline-teal { border-color: #14b8a6; color: #14b8a6; }
  .btn-outline-teal:hover { background-color: #14b8a6; color: #fff; }
  .border-teal { border-color: #14b8a6 !important; }
  .shadow-lg { box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important; }
  .table-hover tbody tr:hover { background-color: #f1f5f9; }
  .form-control:focus, .form-select:focus { border-color: #14b8a6; box-shadow: 0 0 0 0.2rem rgba(20,184,166,0.15); }
  @media (max-width:576px){ .block-header h3{ font-size:1.1rem; } }
  
  </style>
</div>
