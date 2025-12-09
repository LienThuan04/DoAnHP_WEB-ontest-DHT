<div class="content py-4">
  <form onsubmit="return false;">
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group shadow-sm">
          <button class="btn btn-alt-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fa fa-filter me-1"></i> Đang học tập
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item filter-search" href="javascript:void(0)" data-id="1">
              <i class="fa fa-book-open me-2"></i> Đang học tập
            </a></li>
            <li><a class="dropdown-item filter-search" href="javascript:void(0)" data-id="0">
              <i class="fa fa-eye-slash me-2"></i> Đã ẩn
            </a></li>
          </ul>
          <input type="text" class="form-control" placeholder="Tìm kiếm nhóm..." id="form-search-group">
        </div>
      </div>
      <div class="col-md-6 d-flex justify-content-end align-items-center">
        <button type="button" class="btn btn-success btn-lg" data-bs-toggle="modal" data-bs-target="#modal-join-group">
          <i class="fa fa-plus-circle me-2"></i> Tham gia nhóm
        </button>
      </div>
    </div>
  </form>

  <!-- Danh sách nhóm -->
  <div class="row g-3" id="list-groups">
    <!-- nhóm sẽ được inject vào đây -->
  </div>
</div>

<!-- Modal tham gia nhóm -->
<div class="modal fade" id="modal-join-group" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content shadow border-0">
      
      <!-- Header -->
      <div class="modal-header bg-primary text-white">
        <h5 class="modal-title">
          <i class="fa fa-users me-2"></i> Tham gia nhóm học phần
        </h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <div class="mb-3">
          <label for="mamoi" class="form-label fw-bold">Mã mời</label>
          <input 
            type="text" 
            class="form-control" 
            name="mamoi" 
            id="mamoi" 
            placeholder="Nhập mã mời...">
        </div>
        <small class="text-muted d-block mb-1">
          <i class="fa fa-info-circle me-1"></i>
          Nhờ giảng viên cung cấp mã mời của lớp học gồm 7 ký tự, không chứa dấu cách hoặc ký hiệu.
        </small>
      </div>

      <!-- Footer -->
      <div class="modal-footer bg-light">
        <button 
          type="button" 
          class="btn btn-secondary" 
          data-bs-dismiss="modal">
          <i class="fa fa-times me-1"></i> Đóng
        </button>
        <button 
          type="button" 
          class="btn btn-primary btn-join-group">
          <i class="fa fa-check me-1"></i> Tham gia nhóm
        </button>
      </div>

    </div>
  </div>
</div>


<!-- Offcanvas chi tiết nhóm -->
<div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasExampleLabel">Lập trình Java - NH2023 - HK2 - Nhóm 2</h5>
        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body content-side">
        <div class="block block-transparent pull-x pull-t mb-0">
            <ul class="nav nav-tabs nav-tabs-block nav-justified" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="so-settings-tab" data-bs-toggle="tab"
                        data-bs-target="#so-settings" role="tab" aria-controls="so-settings" aria-selected="true">
                        <i class="fa fa-fw fa-cog me-2"></i> Đề kiểm tra
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="so-profile-tab" data-bs-toggle="tab" data-bs-target="#so-profile"
                        role="tab" aria-controls="so-profile" aria-selected="false" tabindex="-1">
                        <i class="fa fa-fw fa-bell me-2"></i> Thông báo
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="so-people-tab" data-bs-toggle="tab" data-bs-target="#so-people"
                        role="tab" aria-controls="so-people" aria-selected="false" tabindex="-1">
                        <i class="far fa-fw fa-user-circle me-2"></i> Bạn bè
                    </button>
                </li>
            </ul>
            <div class="block-content tab-content overflow-hidden">
                <div class="tab-pane pull-x fade fade-up show active" id="so-settings" role="tabpanel"
                    aria-labelledby="so-settings-tab" tabindex="0">
                    <div class="list-test px-2">
                        <div class="block block-rounded block-fx-pop mb-2">
                            <div class="block-content block-content-full border-start border-3 border-primary">
                                <div class="d-md-flex justify-content-md-between align-items-md-center">
                                    <div class="p-1 p-md-2">
                                        <h3 class="h4 fw-bold mb-3">
                                            <a href="./test/start/1" class="text-dark link-fx">Kiểm tra giữa kì</a>
                                        </h3>
                                        <p class="fs-sm text-muted mb-0">
                                            <i class="fa fa-clock me-1"></i> Diễn ra từ <span>12:00 08/03/2023</span>
                                            đến
                                            <span>12:00 09/03/2023</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class=" tab-pane pull-x fade fade-up" id="so-profile" role="tabpanel"
                    aria-labelledby="so-profile-tab" tabindex="0">
                    <ul class="list-announce nav-items my-2">
                        <p class="text-center">Không có thông báo</p>
                    </ul>
                </div>
                <div class="tab-pane pull-x fade fade-up" id="so-people" role="tabpanel" aria-labelledby="so-people-tab"
                    tabindex="0">
                    <div class="block mb-0">
                        <div class="block-content block-content-sm block-content-full bg-body">
                            <span class="text-uppercase fs-sm fw-bold">Bạn cùng nhóm</span>
                        </div>
                        <div class="block-content">
                            <ul class="nav-items list-friends">
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<style>
  .table-responsive {
  overflow: visible !important;
}
.table-responsive table {
  overflow: visible !important;
}
.table-responsive .dropdown-menu {
  position: absolute !important;
  transform: translate3d(0, 0, 0) !important;
}
.table tbody tr:hover {
  background-color: #cfe8ff !important;
  cursor: pointer;
}

</style>
