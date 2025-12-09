<div class="content" data-id="<?php echo $data["user_id"] ?>">
    <form action="#" method="POST" id="search-form" onsubmit="return false;">
        <div class="row mb-4">
            <div class="col-md-8">
                <div class="d-flex gap-2 flex-wrap mb-2">
                    <div class="dropdown">
                        <button class="btn btn-outline-primary dropdown-toggle" type="button" id="dropdown-filter-state"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            Tất cả trạng thái
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="dropdown-filter-state">
                            <li><a class="dropdown-item filtered-by-state" href="javascript:void(0)" data-value="0">Chưa mở</a></li>
                            <li><a class="dropdown-item filtered-by-state" href="javascript:void(0)" data-value="1">Đang mở</a></li>
                            <li><a class="dropdown-item filtered-by-state" href="javascript:void(0)" data-value="2">Đã đóng</a></li>
                            <li><a class="dropdown-item filtered-by-state" href="javascript:void(0)" data-value="3">Tất cả</a></li>
                        </ul>
                    </div>

                    <!-- Môn học -->
                    <div class="dropdown">
                        <button class="btn btn-outline-primary dropdown-toggle" type="button" id="dropdown-filter-subject"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            Tất cả môn học
                        </button>
                        <ul class="dropdown-menu" id="subject-filter-menu" aria-labelledby="dropdown-filter-subject">
                            <li><a class="dropdown-item filtered-by-subject" href="javascript:void(0)" data-value="">Tất cả môn học</a></li>
                            <!-- Các môn học sẽ được thêm động -->
                        </ul>
                    </div>

                    <!-- Nhóm -->
                    <div class="dropdown">
                        <button class="btn btn-outline-primary dropdown-toggle" type="button" id="dropdown-filter-group"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            Tất cả nhóm
                        </button>
                        <ul class="dropdown-menu" id="group-filter-menu" aria-labelledby="dropdown-filter-group">
                            <li><a class="dropdown-item filtered-by-group" href="javascript:void(0)" data-value="">Tất cả nhóm</a></li>
                            <!-- Các nhóm sẽ được thêm động -->
                        </ul>
                    </div>
                </div>

                <!-- Hàng 2: Ô tìm kiếm chiếm full chiều ngang -->
                <input type="text" class="form-control" id="search-input" name="search-input"
                    placeholder="Tìm kiếm đề thi...">
            </div>

            <!-- Cột bên phải: Nút tạo đề -->
            <div class="col-md-4 text-end mt-3 mt-md-0">
                <a href="./test/add" class="btn btn-hero btn-primary" data-role="dethi" data-action="create">
                    <i class="fa fa-fw fa-plus me-1"></i> Tạo đề thi
                </a>
            </div>
        </div>
    </form>

    <div class="list-test" id="list-test"></div>

    <div class="row my-3">
        <?php if (isset($data["Plugin"]["pagination"])) {
            require "./mvc/views/inc/pagination.php";
        }?>
    </div>
</div>
<style>
.list-test .block-content {
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
}

</style>