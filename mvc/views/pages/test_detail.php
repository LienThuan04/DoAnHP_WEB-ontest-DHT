<div class="row g-0 flex-md-grow-1" id="chitietdethi" data-id="<?php echo $data['Test']['made']; ?>">
    <div class="content content-full">
        <div class="block block-rounded shadow-sm">
            <!-- Tabs Navigation -->
            <ul class="nav nav-tabs nav-tabs-alt nav-justified align-items-center bg-light" role="tablist">
                <li class="nav-item">
                    <button class="nav-link active text-primary fw-bold" id="bang-diem-tab" data-bs-toggle="tab" data-bs-target="#bang-diem" role="tab" aria-controls="bang-diem" aria-selected="true">
                        <i class="fa fa-table me-2"></i>Bảng điểm
                    </button>
                </li>
                <!-- Thêm vào ngay sau <li> của tab "Thống kê" -->
<li class="nav-item">
    <button class="nav-link text-success fw-bold" id="cham-tuluan-tab" data-bs-toggle="tab" data-bs-target="#cham-tuluan" role="tab">
        <i class="fa fa-edit me-2"></i>Chấm tự luận
        <span class="badge bg-danger ms-2" id="count-chua-cham">0</span>
    </button>
</li>
                <li class="nav-item">
                    <button class="nav-link text-warning fw-bold" id="thong-ke-tab" data-bs-toggle="tab" data-bs-target="#thong-ke" role="tab" aria-controls="thong-ke" aria-selected="false">
                        <i class="fa fa-chart-bar me-2"></i>Thống kê
                    </button>
                </li>
                <li class="nav-item ms-auto">
                    <div class="block-options ps-3 pe-2 d-flex align-items-center">
                        <button type="button" class="btn-block-option btn btn-outline-info btn-sm rounded-circle" data-bs-toggle="offcanvas" data-bs-target="#offcanvasSetting" aria-controls="offcanvasSetting" title="Thông tin">
                            <i class="si si-info"></i>
                        </button>
                        <a href="./test/update/<?php echo $data['Test']['made']; ?>" class="btn-block-option btn btn-outline-warning btn-sm rounded-circle ms-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Chỉnh sửa đề thi">
                            <i class="si si-pencil"></i>
                        </a>
                        <button type="button" class="btn-block-option btn btn-outline-secondary btn-sm rounded-circle ms-2" data-bs-toggle="tooltip" data-bs-placement="top" title="Toàn màn hình" data-toggle="block-option" data-action="fullscreen_toggle">
                            <i class="si si-size-fullscreen"></i>
                        </button>
                    </div>
                </li>
            </ul>

            <!-- Tab Content -->
            <div class="block-content tab-content p-3">
                <!-- Bảng điểm -->
                <div class="tab-pane fade show active" id="bang-diem" role="tabpanel" aria-labelledby="bang-diem-tab">
                    <form action="#" method="POST" id="search-form" onsubmit="return false;">
                        <div class="row mb-4 align-items-center">
                            <div class="col-md-6">
                                <div class="input-group">
                                    <div class="d-flex gap-2">
                                        <div class="dropdown">
                                            <button class="btn btn-alt-secondary dropdown-toggle btn-filtered-by-group" id="dropdown-filter-group" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                Tất cả
                                            </button>
                                            <ul class="dropdown-menu" aria-labelledby="dropdown-filter-group">
                                                <li><a class="dropdown-item filtered-by-group active" href="javascript:void(0)" data-value="0">Tất cả</a></li>
                                                <?php foreach ($data["Test"]["nhom"] as $nhom): ?>
                                                    <li><a class="dropdown-item filtered-by-group" href="javascript:void(0)" data-value="<?php echo $nhom['manhom']; ?>"><?php echo $nhom['tennhom']; ?></a></li>
                                                <?php endforeach; ?>
                                            </ul>
                                        </div>
                                        <div class="dropdown">
                                            <button class="btn btn-alt-secondary dropdown-toggle btn-filtered-by-state" id="dropdown-filter-state" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                Đã nộp bài
                                            </button>
                                            <ul class="dropdown-menu" aria-labelledby="dropdown-filter-state">
                                                <li><a class="dropdown-item filtered-by-state" href="javascript:void(0)" data-state="present">Đã nộp bài</a></li>
                                                <li><a class="dropdown-item filtered-by-state" href="javascript:void(0)" data-state="absent">Vắng thi</a></li>
                                                <li><a class="dropdown-item filtered-by-state" href="javascript:void(0)" data-state="interrupted">Chưa nộp bài</a></li>
                                                <li><a class="dropdown-item filtered-by-state" href="javascript:void(0)" data-state="all">Tất cả</a></li>
                                            </ul>
                                        </div>
                                        <input type="text" class="form-control form-control-alt" id="search-input" name="search-input" placeholder="Tìm kiếm sinh viên..." aria-label="Tìm kiếm">
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 text-end">
                                <button type="button" class="btn btn-primary btn-sm" id="export_excel">
                                    <i class="fa-solid fa-file-excel me-1"></i> Xuất bảng điểm
                                </button>
                            </div>
                        </div>
                    </form>
                    <div class="table-responsive">
                        <table class="table table-striped table-hover table-vcenter">
                            <thead class="bg-primary text-white">
                                <tr class="table-col-title">
                                    <th class="text-center col-sort" data-sort-column="manguoidung" data-sort-order="default">MSSV</th>
                                    <th class="col-sort" data-sort-column="hoten" data-sort-order="default">Họ tên</th>
                                    <th class="text-center col-sort" data-sort-column="diemthi" data-sort-order="default">Điểm</th>
                                    <th class="text-center col-sort" data-sort-column="thoigianvaothi" data-sort-order="default">Thời gian vào thi</th>
                                    <th class="text-center col-sort" data-sort-column="thoigianlambai" data-sort-order="default">Thời gian thi</th>
                                    <th class="text-center col-sort" data-sort-column="solanchuyentab" data-sort-order="default">Số lần thoát</th>
                                    <th class="text-center">Hành động</th>
                                </tr>
                            </thead>
                            <tbody id="took_the_exam" class="js-table-sections-body"></tbody>
                        </table>
                    </div>
                    <?php if (isset($data["Plugin"]["pagination"])): ?>
                        <?php require "./mvc/views/inc/pagination.php"; ?>
                    <?php endif; ?>
                </div>
                <!-- Chấm tự luận -->
                 <!-- Thêm vào trong <div class="block-content tab-content p-3"> -->
<div class="tab-pane fade" id="cham-tuluan" role="tabpanel">
    <div class="row">
        <!-- Danh sách sinh viên cần chấm -->
        <div class="col-lg-4">
            <div class="block block-rounded h-100">
                <div class="block-header block-header-default">
                    <h3 class="block-title">Danh sách cần chấm (<span id="total-chua-cham">0</span>)</h3>
                </div>
                <div class="block-content block-content-full">
                    <ul class="list-group list-group-flush" id="danh-sach-sinhvien-tuluan">
                        <!-- Load bằng JS -->
                    </ul>
                </div>
            </div>
        </div>

        <!-- Khu vực chấm bài -->
        <div class="col-lg-8">
            <div class="block block-rounded" id="khu-vuc-cham-bai" style="display:none;">
                <div class="block-header block-header-default d-flex justify-content-between align-items-center">
                      <span class="fw-bold fs-5 text-primary">Chi tiết câu trả lời</span>
            <span class="mx-2 fw-bold">-</span>
            <span id="ten-sinhvien-cham" class="fw-bold fs-5">Nguyễn Văn A</span>
            <span class="mx-2 fw-bold">-</span>
            <span id="mssv-cham" class="fw-bold fs-5">CNTT123456</span>
                </div>
                <div class="block-content">
                    <div id="noi-dung-tuluan"></div>
                    
                    <hr class="my-4">

                    <form id="form-cham-diem-tuluan">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Điểm tự luận (tổng: <span id="tong-diem-tuluan">0</span> điểm)</label>
                            <input type="number" step="0.25" min="0" class="form-control form-control-lg text-center fw-bold text-primary" 
                                   id="diem-tuluan-input" value="0" style="font-size: 2rem;" readonly>
                        </div>
                        <div class="text-center">
    <button type="submit" class="btn btn-success btn-lg px-5">
        <i class="fa fa-save me-2"></i>Lưu điểm
    </button>
</div>

                    </form>
                </div>
            </div>

            <!-- Khi chưa chọn sinh viên -->
            <div class="text-center py-5 text-muted" id="khong-co-du-lieu">
                <i class="fa fa-edit fa-5x mb-4 opacity-25"></i>
                <h4>Chọn một sinh viên để bắt đầu chấm tự luận</h4>
            </div>
        </div>
    </div>
</div>


                <!-- Thống kê -->
                <div class="tab-pane fade" id="thong-ke" role="tabpanel" aria-labelledby="thong-ke-tab">
                    <div class="mb-3">
                        <div class="dropdown">
                            <button class="btn btn-alt-secondary dropdown-toggle btn-filtered-by-static" id="dropdown-filter-static" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Tất cả
                            </button>
                            <ul class="dropdown-menu" aria-labelledby="dropdown-filter-static">
                                <li><a class="dropdown-item filtered-by-static active" href="javascript:void(0)" data-id="0">Tất cả</a></li>
                                <?php foreach ($data["Test"]["nhom"] as $index => $nhom): ?>
                                    <li><a class="dropdown-item filtered-by-static" href="javascript:void(0)" data-id="<?php echo $nhom['manhom']; ?>"><?php echo $nhom['tennhom']; ?></a></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    </div>
                    <div class="row g-3 mb-4">
                        <div class="col-md-6 col-xl-3">
                            <div class="block block-rounded block-fx-shadow bg-success text-white">
                                <div class="block-content block-content-full d-flex align-items-center justify-content-between p-3">
                                    <div class="me-3">
                                        <p class="fs-lg fw-semibold mb-0" id="da_nop">40</p>
                                        <p class="text-white-75 mb-0">Thí sinh đã nộp</p>
                                    </div>
                                    <div class="item item-circle bg-white bg-opacity-10">
                                        <i class="fa fa-user-check text-white"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-xl-3">
                            <div class="block block-rounded block-fx-shadow bg-warning text-white">
                                <div class="block-content block-content-full d-flex align-items-center justify-content-between p-3">
                                    <div class="me-3">
                                        <p class="fs-lg fw-semibold mb-0" id="chua_nop">31</p>
                                        <p class="text-white-75 mb-0">Thí sinh chưa nộp</p>
                                    </div>
                                    <div class="item item-circle bg-white bg-opacity-10">
                                        <i class="fa fa-user-pen text-white"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-xl-3">
                            <div class="block block-rounded block-fx-shadow bg-danger text-white">
                                <div class="block-content block-content-full d-flex align-items-center justify-content-between p-3">
                                    <div class="me-3">
                                        <p class="fs-lg fw-semibold mb-0" id="khong_thi">12</p>
                                        <p class="text-white-75 mb-0">Thí sinh không thi</p>
                                    </div>
                                    <div class="item item-circle bg-white bg-opacity-10">
                                        <i class="fa fa-user-xmark text-white"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-xl-3">
                            <div class="block block-rounded block-fx-shadow bg-info text-white">
                                <div class="block-content block-content-full d-flex align-items-center justify-content-between p-3">
                                    <div class="me-3">
                                        <p class="fs-lg fw-semibold mb-0" id="diem_trung_binh">3.1</p>
                                        <p class="text-white-75 mb-0">Điểm trung bình</p>
                                    </div>
                                    <div class="item item-circle bg-white bg-opacity-10">
                                        <i class="fa fa-gauge text-white"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-xl-3">
                            <div class="block block-rounded block-fx-shadow bg-secondary text-white">
                                <div class="block-content block-content-full d-flex align-items-center justify-content-between p-3">
                                    <div class="me-3">
                                        <p class="fs-lg fw-semibold mb-0" id="diem_duoi_1">1</p>
                                        <p class="text-white-75 mb-0">Số thí sinh điểm <= 1</p>
                                    </div>
                                    <div class="item item-circle bg-white bg-opacity-10">
                                        <i class="fa fa-face-sad-cry text-white"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-xl-3">
                            <div class="block block-rounded block-fx-shadow bg-warning text-white">
                                <div class="block-content block-content-full d-flex align-items-center justify-content-between p-3">
                                    <div class="me-3">
                                        <p class="fs-lg fw-semibold mb-0" id="diem_duoi_5">80</p>
                                        <p class="text-white-75 mb-0">Số thí sinh điểm <= 5</p>
                                    </div>
                                    <div class="item item-circle bg-white bg-opacity-10">
                                        <i class="fa fa-thumbs-down text-white"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-xl-3">
                            <div class="block block-rounded block-fx-shadow bg-success text-white">
                                <div class="block-content block-content-full d-flex align-items-center justify-content-between p-3">
                                    <div class="me-3">
                                        <p class="fs-lg fw-semibold mb-0" id="diem_lon_5">80</p>
                                        <p class="text-white-75 mb-0">Số thí sinh điểm >= 5</p>
                                    </div>
                                    <div class="item item-circle bg-white bg-opacity-10">
                                        <i class="fa fa-award text-white"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6 col-xl-3">
                            <div class="block block-rounded block-fx-shadow bg-primary text-white">
                                <div class="block-content block-content-full d-flex align-items-center justify-content-between p-3">
                                    <div class="me-3">
                                        <p class="fs-lg fw-semibold mb-0" id="diem_cao_nhat">7</p>
                                        <p class="text-white-75 mb-0">Điểm cao nhất</p>
                                    </div>
                                    <div class="item item-circle bg-white bg-opacity-10">
                                        <i class="fa fa-users text-white"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chart-container mt-4" style="position: relative; height: 40vh; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <canvas id="myChart" class="bg-white rounded"></canvas>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal Chi tiết đề thi -->
<div class="modal fade" id="modal-cau-hoi" tabindex="-1" aria-labelledby="modal-cau-hoi-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-xl">
        <div class="modal-content shadow-lg">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modal-cau-hoi-label">Chi tiết đề thi</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body pb-1">
                <div id="list-question" class="p-3"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Đóng</button>
            </div>
        </div>
    </div>
</div>

<!-- Offcanvas Setting -->
<div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasSetting" aria-labelledby="offcanvasExampleLabel">
    <div class="offcanvas-header bg-light">
        <h4 class="offcanvas-title" id="offcanvasExampleLabel"><?php echo $data["Test"]["tende"]; ?></h4>
        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body content-side p-4">
        <h5 class="mb-3 text-primary">THÔNG TIN ĐỀ THI</h5>
        <ul class="list-unstyled text-dark fs-sm">
            <li class="mb-2"><i class="text-primary fa fa-file-signature me-2"></i><span>Tên đề: <?php echo $data["Test"]["tende"]; ?></span></li>
            <li class="mb-2"><i class="text-primary fa fa-clock me-2"></i><span>Thời gian tạo: <?php echo date_format(date_create($data["Test"]["thoigiantao"]), "H:i d/m/Y"); ?></span></li>
        </ul>
        <h5 class="mb-3 text-primary">MÔN THI</h5>
        <p class="mb-3"><?php echo $data["Test"]["mamonhoc"] . " - " . $data["Test"]["tenmonhoc"]; ?></p>
        <h5 class="mb-3 text-primary">GIAO CHO</h5>
        <ul class="nav nav-pills nav-justified flex-column">
            <?php foreach ($data["Test"]["nhom"] as $nhom): ?>
                <li class="nav-item mb-2"><a class="nav-link border text-muted rounded-pill" href="./module/detail/<?php echo $nhom['manhom']; ?>"><?php echo $nhom['tennhom']; ?></a></li>
            <?php endforeach; ?>
        </ul>
        <?php if ($data["Test"]["loaide"] == 0): ?>
            <h5 class="mb-3 text-primary">NỘI DUNG</h5>
            <a href="javascript:void(0)" class="btn btn-outline-primary rounded-pill" data-bs-toggle="modal" data-bs-target="#modal-cau-hoi" data-id="<?php echo $data["Test"]["made"]; ?>">
                <i class="fa fa-file me-2"></i>Xem chi tiết
            </a>
        <?php endif; ?>
    </div>
</div>

<!-- Modal Chi tiết kết quả -->
<div class="modal fade" id="modal-show-test" tabindex="-1" aria-labelledby="modal-result-label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-xl">
        <div class="modal-content shadow-lg">
            <div class="modal-header bg-info text-white">
                <h5 class="modal-title" id="modal-result-label">Chi tiết kết quả</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body pb-1">
                <div id="content-file" class="p-3"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-alt-secondary btn-sm" data-bs-dismiss="modal">Đóng</button>
                <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal">Hoàn tất</button>
            </div>
        </div>
    </div>
</div>
<style>
#danh-sach-sinhvien-tuluan .list-group-item {
    cursor: pointer;
    transition: all 0.2s;
}
#danh-sach-sinhvien-tuluan .list-group-item:hover {
    background-color: #f8f9fa;
}
#danh-sach-sinhvien-tuluan .list-group-item.active {
    background-color: #e3f2fd !important;
    border-left: 4px solid #1976d2;
}
.tuluan-cauhoi {
    background: #f8f9fa;
    border-left: 4px solid #1976d2;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
}
.tuluan-cauhoi h5 {
    color: #1976d2;
    margin-bottom: 10px;
}
.tuluan-image {
    max-width: 100%;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    margin: 10px 0;
    cursor: zoom-in;
}
.student-item { 
    transition: all 0.3s ease; 
    cursor: pointer; 
  }
  .student-item:hover { 
    transform: translateY(-2px); 
    box-shadow: 0 8px 25px rgba(0,0,0,0.12)!important; 
  }
 /* Active student nhẹ nhàng hơn */
.student-item.active {
    background-color: #cfe2ff !important; /* Xanh nhạt Bootstrap */
    color: #0d6efd !important;           /* chữ xanh đậm */
    border-left: 4px solid #0d6efd;      /* viền trái nổi bật */
}

  .student-item.active * { color: white!important; }
  .student-item.active .text-muted { opacity: 0.9; }
  .avatar-bg { background: #0d6efd; }
  .hover-shadow { transition: box-shadow 0.3s; }
  @media (max-width: 768px) {
    .student-item .d-flex.gap-3 { gap: 1rem!important; font-size: 0.9rem; }
    .student-item strong.fs-5 { font-size: 1.1rem!important; }
    .student-item strong.fs-4 { font-size: 1.3rem!important; }
  }
  #khu-vuc-cham-bai {
    background: #fff;
    border: 1px solid #e3e3e3;
    border-radius: 12px;
}
#noi-dung-tuluan .card {
    border-radius: 10px;
    margin-bottom: 20px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
#noi-dung-tuluan .card-header {
    font-weight: 600;
    font-size: 1rem;
}
#noi-dung-tuluan .diem-cau {
    max-width: 120px;
}
@media (max-width: 768px) {
    #khu-vuc-cham-bai {
        padding: 15px;
    }
    #ten-sinhvien-cham, #mssv-cham {
        font-size: 1rem;
    }
    #diem-tuluan-input {
        font-size: 1.5rem;
    }
}
</style>
