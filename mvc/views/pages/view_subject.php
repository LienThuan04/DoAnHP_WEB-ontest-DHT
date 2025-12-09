<style>
  /* General Styles */
  body {
    font-family: "Poppins", sans-serif;
    background-color: #f9fafb;
    color: #1f2937;
  }

  /* Block Header */
  .block-header-default {
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    color: #ffffff;
    padding: 1rem 1.5rem;
    border-radius: 12px 12px 0 0;
    border-bottom: 3px solid #4338ca;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .block-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    align-items: center;
  }

  .block-title i {
    margin-right: 0.75rem;
    color: #e0e7ff;
    font-size: 1.2rem;
  }

  /* Buttons */
  .btn-primary {
    background-color: #4f46e5;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-weight: 500;
    color: #ffffff;
    transition: all 0.2s ease;
  }

  .btn-primary:hover {
    background-color: #4338ca;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  }

  .btn-alt-primary {
    background-color: #10b981;
    color: #ffffff;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .btn-alt-primary:hover {
    background-color: #059669;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .btn-alt-secondary {
    background-color: #e5e7eb;
    color: #1f2937;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .btn-alt-secondary:hover {
    background-color: #d1d5db;
    transform: translateY(-2px);
  }

  .btn-light {
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    color: #4f46e5;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .btn-light:hover {
    background-color: #f3f4f6;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  /* Input Group */
  .input-group .form-control {
    border-radius: 8px 0 0 8px;
    border: 1px solid #e5e7eb;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    transition: border-color 0.2s ease;
  }

  .input-group .form-control:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  .input-group .btn-search {
    border-radius: 0 8px 8px 0;
    border: 1px solid #e5e7eb;
    border-left: none;
    background-color: #ffffff;
    padding: 0.5rem 1rem;
    transition: background-color 0.2s ease;
  }

  .btn-search:hover {
    background-color: #f3f4f6;
  }

  .btn-search i {
    color: #6b7280;
    font-size: 1rem;
  }

  /* Select */
  .form-select {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    transition: border-color 0.2s ease;
  }

  .form-select:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }

  /* Table */
  .table {
    background-color: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    border-collapse: separate;
    border-spacing: 0;
  }

  .table-light {
    background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
    color: #1f2937;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.85rem;
  }

  .table-hover tbody tr:hover {
    background-color: #f3f4f6;
  }

  .table td, .table th {
    vertical-align: middle;
    padding: 1rem;
    border: 1px solid #e5e7eb;
  }

  /* Action Buttons */
  .btn-edit, .btn-delete {
    border-radius: 6px;
    padding: 0.4rem 0.75rem;
    font-size: 0.9rem;
    transition: all 0.2s ease;
    border: none;
  }

  .btn-edit {
    background-color: #fef3c7;
    color: #92400e;
  }

  .btn-edit i {
    color: #92400e;
  }

  .btn-edit:hover {
    background-color: #fde68a;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .btn-delete {
    background-color: #fee2e2;
    color: #991b1b;
  }

  .btn-delete i {
    color: #991b1b;
  }

  .btn-delete:hover {
    background-color: #fecaca;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  /* Modal */
  .modal-content {
    border-radius: 12px;
    border: none;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }

  .modal-header {
    background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
    border-bottom: 1px solid #e5e7eb;
    padding: 1rem 1.5rem;
  }

  .modal-title {
    font-size: 1.125rem;
    font-weight: 600;
    display: flex;
    align-items: center;
  }

  .modal-title i {
    color: #4f46e5;
    margin-right: 0.75rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .modal-footer {
    background: linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%);
    border-top: 1px solid #e5e7eb;
    padding: 1rem 1.5rem;
  }

  /* Block Content */
  .block-content {
    padding: 1.5rem;
    background-color: #ffffff;
    border-radius: 0 0 12px 12px;
  }

  /* Collapse */
  .collapse .form-chapter {
    background-color: #f9fafb;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .block-header-default {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }

    .table td, .table th {
      padding: 0.75rem;
      font-size: 0.85rem;
    }

    .input-group .form-control,
    .form-select {
      font-size: 0.85rem;
    }

    .btn-primary, .btn-alt-primary, .btn-alt-secondary, .btn-light {
      padding: 0.4rem 0.75rem;
      font-size: 0.85rem;
    }
  }
</style>

<div class="content">
  <div class="block block-rounded shadow-sm border-0">
    <div class="block-header block-header-default">
      <h3 class="block-title">
        <i class="fas fa-book-open me-2"></i>Danh sách môn học
      </h3>
      <div class="block-options">
        <button
          type="button"
          class="btn btn-light btn-sm"
          data-bs-toggle="modal"
          data-bs-target="#modal-add-subject"
          data-role="monhoc"
          data-action="create"
        >
          <i class="fas fa-plus me-1"></i> Thêm môn học
        </button>
      </div>
    </div>

    <div class="block-content">
      <form id="search-form" onsubmit="return false;">
        <div class="mb-4">
          <div class="row g-3 align-items-end">
            <div class="col-lg-4">
              <div class="input-group">
                <input
                  type="text"
                  class="form-control"
                  id="search-input"
                  name="search-input"
                  placeholder="Tìm kiếm môn học..."
                />
                <button class="btn btn-search" type="button">
                  <i class="fas fa-search"></i>
                </button>
              </div>
            </div>
            <div class="col-lg-3">
              <select class="form-select" id="filter-namhoc" name="namhoc">
                <option value="">Tất cả năm học</option>
              </select>
            </div>
            <div class="col-lg-3">
              <select class="form-select" id="filter-hocky" name="hocky">
                <option value="">Tất cả học kỳ</option>
              </select>
            </div>
          </div>
        </div>
      </form>

      <div class="table-responsive rounded">
        <table class="table table-bordered table-hover table-vcenter text-center">
          <thead class="table-light">
            <tr>
              <th>Mã môn</th>
              <th class="text-start">Tên môn</th>
              <th class="d-none d-sm-table-cell">Số tín chỉ</th>
              <th class="d-none d-sm-table-cell">Số tiết LT</th>
              <th class="d-none d-sm-table-cell">Số tiết TH</th>
              <th class="d-none d-sm-table-cell">Năm học</th>
              <th class="d-none d-sm-table-cell">Học kỳ</th>
              <th class="text-center col-header-action">Hành động</th>
            </tr>
          </thead>
          <tbody id="list-subject"></tbody>
        </table>
      </div>

      <?php if (isset($data["Plugin"]["pagination"])) {
          require "./mvc/views/inc/pagination.php";
      } ?>
    </div>
  </div>
</div>

<div class="modal fade" id="modal-chapter" tabindex="-1" role="dialog" aria-labelledby="modal-chapter" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
          <i class="fas fa-list me-2"></i>Danh sách chương
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">
        <div class="table-responsive">
          <table class="table table-vcenter table-hover">
            <thead>
              <tr>
                <th class="text-center" style="width: 40px;">#</th>
                <th>Tên chương</th>
                <th class="text-center col-header-action">Hành động</th>
              </tr>
            </thead>
            <tbody id="showChapper"></tbody>
          </table>
        </div>

        <div class="block block-rounded mt-3">
          <div class="block-content">
            <a
              class="fw-semibold text-primary"
              data-role="chuong"
              data-action="create"
              data-bs-toggle="collapse"
              href="#collapseChapter"
              role="button"
              aria-expanded="false"
              aria-controls="collapseChapter"
              id="btn-add-chapter"
            >
              <i class="fas fa-plus me-1"></i> Thêm chương
            </a>

            <div class="collapse mt-2" id="collapseChapter">
              <form method="post" class="form-chapter">
                <div class="row g-2 align-items-center">
                  <div class="col-8">
                    <input
                      type="text"
                      class="form-control"
                      name="name_chapter"
                      id="name_chapter"
                      placeholder="Nhập tên chương..."
                    />
                  </div>
                  <div class="col-4 d-flex flex-wrap gap-1">
                    <input type="hidden" name="mamon_chuong" id="mamon_chuong" />
                    <input type="hidden" name="machuong" id="machuong" />
                    <button id="add-chapter" type="submit" class="btn btn-alt-primary btn-sm">Tạo chương</button>
                    <button id="edit-chapter" type="submit" class="btn btn-primary btn-sm">Đổi tên</button>
                    <button type="button" class="btn btn-alt-secondary btn-sm close-chapter">Huỷ</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-sm btn-primary" data-bs-dismiss="modal">Thoát</button>
      </div>
    </div>
  </div>
</div>