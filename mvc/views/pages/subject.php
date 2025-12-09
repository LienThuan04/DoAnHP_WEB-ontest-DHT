<div class="content">
  <div class="block block-rounded shadow-sm">
    <div class="block-header block-header-default bg-indigo text-white p-3 d-flex justify-content-between align-items-center">
      <h3 class="block-title mb-0 fs-5 fw-bold">
        <i class="fa fa-book me-2"></i>Danh sách môn học
      </h3>
      <div class="block-options">
        <button type="button" class="btn btn-sm btn-indigo rounded-pill px-3" data-bs-toggle="modal" data-bs-target="#modal-add-subject"
          data-role="monhoc" data-action="create">
          <i class="fa fa-plus me-1"></i> Thêm môn học
        </button>
      </div>
    </div>

    <div class="block-content p-4">
      <!-- Tìm kiếm -->
      <form action="#" id="search-form" onsubmit="return false;">
        <div class="mb-4">
          <div class="input-group rounded-pill overflow-hidden shadow-sm">
            <span class="input-group-text bg-white border-0">
              <i class="fa fa-search text-indigo"></i>
            </span>
            <input type="text" class="form-control form-control-alt border-0" id="search-input" name="search-input"
              placeholder="Tìm kiếm môn học...">
          </div>
        </div>
      </form>

      <!-- Bảng dữ liệu -->
      <div class="table-responsive">
        <table class="table table-bordered table-hover table-vcenter align-middle text-center">
          <thead class="bg-indigo-light text-dark">
            <tr>
              <th><i class="fa fa-barcode me-1"></i> Mã môn</th>
              <th class="text-start"><i class="fa fa-book-open me-1"></i> Tên môn</th>
              <th class="d-none d-sm-table-cell"><i class="fa fa-graduation-cap me-1"></i> Số tín chỉ</th>
              <th class="d-none d-sm-table-cell"><i class="fa fa-chalkboard me-1"></i> Số tiết LT</th>
              <th class="d-none d-sm-table-cell"><i class="fa fa-flask me-1"></i> Số tiết TH</th>
              <th class="d-none d-sm-table-cell"><i class="fa fa-circle me-1"></i> Trạng thái</th>
              <th class="text-center col-header-action"><i class="fa fa-cogs me-1"></i> Hành động</th>
            </tr>
          </thead>
          <tbody id="list-subject">
            <tr>
              <td class="fw-semibold text-indigo">CS101</td>
              <td class="text-start fw-medium">Lập trình C</td>
              <td class="d-none d-sm-table-cell">3</td>
              <td class="d-none d-sm-table-cell">30</td>
              <td class="d-none d-sm-table-cell">15</td>
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

<!-- Modal Thêm/Chỉnh sửa Môn học -->
<div class="modal fade" id="modal-add-subject" tabindex="-1" role="dialog" aria-labelledby="modal-add-subject"
  aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="block block-rounded block-themed block-transparent mb-0">
        <div class="block-header bg-indigo text-white">
          <h3 class="block-title add-subject-element mb-0"><i class="fa fa-plus-circle me-2"></i> Thêm môn học</h3>
          <h3 class="block-title update-subject-element mb-0"><i class="fa fa-edit me-2"></i> Chỉnh sửa môn học</h3>
          <div class="block-options">
            <button type="button" class="btn-block-option text-white" data-bs-dismiss="modal" aria-label="Close">
              <i class="fa fa-fw fa-times"></i>
            </button>
          </div>
        </div>
        <form class="block-content fs-sm form-add-subject p-4">
          <div class="mb-3">
            <label class="form-label fw-semibold">Mã môn học</label>
            <input type="text" class="form-control form-control-alt border-indigo" name="mamonhoc" id="mamonhoc"
              placeholder="Nhập mã môn học">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Tên môn học</label>
            <input type="text" class="form-control form-control-alt border-indigo" name="tenmonhoc" id="tenmonhoc"
              placeholder="Nhập tên môn học">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Hình thức</label>
            <select class="form-select border-indigo" name="loaimon" id="loaimon">
              <option value="lt">Lý thuyết</option>
              <option value="th">Thực hành</option>
              <option value="lt+th">Lý thuyết & Thực hành</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Tổng số tín chỉ</label>
            <input type="number" class="form-control form-control-alt border-indigo" name="sotinchi" id="sotinchi"
              placeholder="Nhập số tín chỉ">
          </div>
          <div class="row">
            <div class="col-6 mb-3">
              <label class="form-label fw-semibold">Số tiết lý thuyết</label>
              <input type="number" class="form-control form-control-alt border-indigo" name="sotiet_lt" id="sotiet_lt"
                placeholder="Nhập số tiết lý thuyết">
            </div>
            <div class="col-6 mb-3">
              <label class="form-label fw-semibold">Số tiết thực hành</label>
              <input type="number" class="form-control form-control-alt border-indigo" name="sotiet_th" id="sotiet_th"
                placeholder="Nhập số tiết thực hành">
            </div>
          </div>
        </form>
        <div class="block-content block-content-full text-end bg-light">
          <button type="button" class="btn btn-sm btn-outline-secondary me-2" data-bs-dismiss="modal">Đóng</button>
          <button type="button" class="btn btn-sm btn-indigo rounded-pill px-4 add-subject-element" id="add_subject">Lưu</button>
          <button type="button" class="btn btn-sm btn-indigo rounded-pill px-4 update-subject-element" id="update_subject"
            data-id="">Cập nhật</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Modal Chương -->
<div class="modal fade" id="modal-chapter" tabindex="-1" role="dialog" aria-labelledby="modal-chapter"
  aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
    <div class="modal-content">
      <div class="modal-header bg-indigo text-white">
        <h5 class="modal-title"><i class="fa fa-list me-2"></i>Danh sách chương</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body pb-1 p-4">
        <div class="table-responsive">
          <table class="table table-vcenter table-hover align-middle">
            <thead class="bg-indigo-light text-dark">
              <tr>
                <th class="text-center" style="width: 40px;">STT</th>
                <th><i class="fa fa-bookmark me-1"></i> Tên chương</th>
                <th class="text-center col-header-action"><i class="fa fa-cogs me-1"></i> Hành động</th>
              </tr>
            </thead>
            <tbody id="showChapper">
              <tr>
                <td class="text-center">1</td>
                <td>Chương 1: Giới thiệu</td>
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

        <div class="block block-rounded mt-3 bg-light">
          <div class="block-content pb-3">
            <a class="fw-semibold text-indigo" data-role="chuong" data-action="create" data-bs-toggle="collapse"
              href="#collapseChapter" role="button" aria-expanded="false" aria-controls="collapseChapter"
              id="btn-add-chapter">
              <i class="fa fa-plus me-1"></i> Thêm chương
            </a>

            <div class="collapse mt-3" id="collapseChapter">
              <form method="post" class="form-chapter">
                <div class="row g-2">
                  <div class="col-8">
                    <input type="text" class="form-control border-indigo" name="name_chapter" id="name_chapter"
                      placeholder="Nhập tên chương">
                  </div>
                  <div class="col-4 d-flex flex-wrap gap-1">
                    <input type="hidden" name="mamon_chuong" id="mamon_chuong">
                    <input type="hidden" name="machuong" id="machuong">
                    <button id="add-chapter" type="submit" class="btn btn-indigo btn-sm rounded-pill px-3">Tạo chương</button>
                    <button id="edit-chapter" type="submit" class="btn btn-warning btn-sm rounded-pill px-3">Đổi tên</button>
                    <button type="button" class="btn btn-outline-secondary btn-sm close-chapter">Huỷ</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer bg-light">
        <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">Thoát</button>
      </div>
    </div>
  </div>
</div>
<style>
  #mamonhoc:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
  }

  .form-control::placeholder {
    color: #495057;
    opacity: 1;
  }

  .form-control::-moz-placeholder {
    color: #495057;
    opacity: 1;
  }

  .form-control::-webkit-input-placeholder {
    color: #495057;
    opacity: 1;
  }

  .form-control:-ms-input-placeholder {
    color: #495057;
    opacity: 1;
  }

  .bg-indigo { background-color: #4f46e5 !important; }
  .bg-indigo-light { background-color: #e0e7ff !important; }
  .text-indigo { color: #4f46e5 !important; }
  .border-indigo { border-color: #4f46e5 !important; }
  .btn-indigo {
    background-color: #4f46e5;
    border-color: #4f46e5;
    color: #fff;
    font-weight: 600;
    transition: all 0.2s ease;
  }
  .btn-indigo:hover {
    background-color: #4338ca;
    border-color: #4338ca;
    transform: translateY(-1px);
  }

  .input-group .form-control {
    border-radius: 999px 0 0 999px !important;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    border: 1px solid #d1d5db;
  }
  .input-group .input-group-text {
    border-radius: 0 999px 999px 0 !important;
    background-color: #f8f9fa;
    border: 1px solid #d1d5db;
    color: #4f46e5;
  }

  .table thead th {
    font-weight: 600;
    font-size: 0.875rem;
    background-color: #e0e7ff;
    color: #1f2937;
  }
  .table td {
    font-size: 0.95rem;
    vertical-align: middle;
  }
  .table-hover tbody tr:hover {
    background-color: #f5f7ff;
    transition: background-color 0.2s ease;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
  .btn-warning {
    background-color: #fcd34d;
    border-color: #fcd34d;
    color: #78350f;
    transition: all 0.2s ease;
  }
  .btn-warning:hover {
    background-color: #fbbf24;
    border-color: #fbbf24;
  }
  .btn-danger-subtle {
    background-color: #fee2e2;
    border-color: #fee2e2;
    color: #991b1b;
    transition: all 0.2s ease;
  }
  .btn-danger-subtle:hover {
    background-color: #fecaca;
    border-color: #fecaca;
  }

  .block-rounded {
    border-radius: 1rem;
  }
  .shadow-sm {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
  }

  .form-control:focus, .form-select:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 0.2rem rgba(79, 70, 229, 0.25);
  }

  @media (max-width: 576px) {
    .block-header h3 { font-size: 1.1rem; }
    .btn-sm { padding: 0.2rem 0.4rem; font-size: 0.8rem; }
    .input-group .form-control { font-size: 0.9rem; padding: 0.5rem 0.75rem; }
  }

/* .list-test .block-content {
  overflow-x: auto; 
}

.table-responsive {
  display: block;
  width: 100%;
  overflow-x: auto;
}

.table thead th,
.table tbody td {
  white-space: nowrap;
  vertical-align: middle;
}

.table .btn {
  font-size: 0.85rem;
  padding: 0.35rem 0.7rem;
} */

</style>