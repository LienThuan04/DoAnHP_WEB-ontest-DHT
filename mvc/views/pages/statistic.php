<?php
// Giả sử $data['Semesters'], $data['AcademicYears'] được lấy từ controller
?>

<div class="row g-0 flex-md-grow-1">
    <div class="content content-full">
        <div class="block block-rounded shadow-sm">
            <?php if (isset($data['ShowAggregate']) && $data['ShowAggregate']): ?>
                <div class="row mb-4 align-items-center">
                    <!-- Bộ lọc học kỳ -->
                    <div class="col-md-3 mb-2 mb-md-0">
                        <div class="dropdown">
                            <button class="btn btn-outline-info w-100 text-start d-flex align-items-center justify-content-between" type="button" id="dropdown-filter-semester" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fa fa-calendar me-2"></i> <span>Chọn học kỳ</span> <i class="fa fa-chevron-down ms-auto"></i>
                            </button>
                            <ul class="dropdown-menu w-100 shadow-sm" aria-labelledby="dropdown-filter-semester">
                                <?php foreach ($data['Semesters'] as $semester): ?>
                                    <li><a class="dropdown-item filter-semester" href="javascript:void(0)" data-id="<?= htmlspecialchars($semester['mahocky']) ?>">
                                  <?= htmlspecialchars($semester['tenhocky']) ?>
                                    </a></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    </div>

                    <!-- Bộ lọc năm học -->
                    <div class="col-md-3 mb-2 mb-md-0">
                        <div class="dropdown">
                            <button class="btn btn-outline-warning w-100 text-start d-flex align-items-center justify-content-between" type="button" id="dropdown-filter-year" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fa fa-graduation-cap me-2"></i> <span>Chọn năm học</span> <i class="fa fa-chevron-down ms-auto"></i>
                            </button>
                            <ul class="dropdown-menu w-100 shadow-sm" aria-labelledby="dropdown-filter-year">
                                <?php foreach ($data['AcademicYears'] as $year): ?>
                                    <li><a class="dropdown-item filter-year" href="javascript:void(0)" data-id="<?= htmlspecialchars($year['namhoc']) ?>">
                                        <?= htmlspecialchars($year['tennamhoc']) ?>
                                    </a></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                    </div>

                    <!-- Bộ lọc môn học -->
                    <div class="col-md-3 mb-2 mb-md-0">
                        <div class="dropdown">
                            <button class="btn btn-outline-primary w-100 text-start d-flex align-items-center justify-content-between" type="button" id="dropdown-filter-subject" data-bs-toggle="dropdown" aria-expanded="false" disabled>
                                <i class="fa fa-book me-2"></i> <span>Chọn môn học</span> <i class="fa fa-chevron-down ms-auto"></i>
                            </button>
                            <ul class="dropdown-menu w-100 shadow-sm" aria-labelledby="dropdown-filter-subject" id="subject-menu">
                                <!-- Môn học sẽ được load động qua AJAX -->
                            </ul>
                        </div>
                    </div>

                    <!-- Bộ lọc nhóm -->
                    <div class="col-md-3 mb-2 mb-md-0">
                        <div class="dropdown">
                            <button class="btn btn-outline-success w-100 text-start d-flex align-items-center justify-content-between" type="button" id="dropdown-filter-group" data-bs-toggle="dropdown" aria-expanded="false" disabled>
                                <i class="fa fa-layer-group me-2"></i> <span>Chọn nhóm</span> <i class="fa fa-chevron-down ms-auto"></i>
                            </button>
                            <ul class="dropdown-menu w-100 shadow-sm" aria-labelledby="dropdown-filter-group" id="group-menu">
                                <!-- Nhóm sẽ được load động qua AJAX -->
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- 8 thẻ thống kê -->
                <div class="row g-3 mb-4">
                    <div class="col-md-6 col-xl-3">
                        <div class="block block-rounded block-fx-shadow bg-success text-white">
                            <div class="block-content block-content-full d-flex align-items-center justify-content-between p-3">
                                <div class="me-3">
                                    <p class="fs-lg fw-semibold mb-0" id="da_nop">0</p>
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
                                    <p class="fs-lg fw-semibold mb-0" id="chua_nop">0</p>
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
                                    <p class="fs-lg fw-semibold mb-0" id="khong_thi">0</p>
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
                                    <p class="fs-lg fw-semibold mb-0" id="diem_trung_binh">0</p>
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
                                    <p class="fs-lg fw-semibold mb-0" id="diem_duoi_1">0</p>
                                    <p class="text-white-75 mb-0">Số thí sinh điểm &le; 1</p>
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
                                    <p class="fs-lg fw-semibold mb-0" id="diem_duoi_5">0</p>
                                    <p class="text-white-75 mb-0">Số thí sinh điểm &le; 5</p>
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
                                    <p class="fs-lg fw-semibold mb-0" id="diem_lon_5">0</p>
                                    <p class="text-white-75 mb-0">Số thí sinh điểm &ge; 5</p>
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
                                    <p class="fs-lg fw-semibold mb-0" id="diem_cao_nhat">0</p>
                                    <p class="text-white-75 mb-0">Điểm cao nhất</p>
                                </div>
                                <div class="item item-circle bg-white bg-opacity-10">
                                    <i class="fa fa-users text-white"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Biểu đồ -->
                <div class="chart-container mt-4" style="position: relative; height: 40vh; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <canvas id="myChart" class="bg-white rounded"></canvas>
                </div>

            <?php else: ?>
                <!-- Thống kê chi tiết -->
                <h3 class="mb-3"><?php echo htmlspecialchars($data['Test']['tenmonhoc']); ?> - <?php echo htmlspecialchars($data['Test']['tende']); ?></h3>
                <!-- Tabs Navigation -->
                <ul class="nav nav-tabs nav-tabs-alt nav-justified align-items-center bg-light" role="tablist">
                    <li class="nav-item">
                        <button class="nav-link text-primary fw-bold" id="bang-diem-tab" data-bs-toggle="tab" data-bs-target="#bang-diem" role="tab" aria-controls="bang-diem" aria-selected="false">
                            <i class="fa fa-table me-2"></i>Bảng điểm
                        </button>
                    </li>
                    <li class="nav-item">
                        <button class="nav-link active text-secondary fw-bold" id="thong-ke-tab" data-bs-toggle="tab" data-bs-target="#thong-ke" role="tab" aria-controls="thong-ke" aria-selected="true">
                            <i class="fa fa-chart-bar me-2"></i>Thống kê
                        </button>
                    </li>
                </ul>
                <!-- Tab Content -->
                <div class="block-content tab-content p-3">
                    <!-- Thống kê -->
                    <div class="tab-pane fade show active" id="thong-ke" role="tabpanel" aria-labelledby="thong-ke-tab">
                        <div class="mb-3">
                            <div class="dropdown">
                                <button class="btn btn-alt-secondary dropdown-toggle btn-filtered-by-static" id="dropdown-filter-static" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                    Tất cả nhóm
                                </button>
                                <ul class="dropdown-menu" aria-labelledby="dropdown-filter-static">
                                    <li><a class="dropdown-item filtered-by-static active" href="javascript:void(0)" data-id="0">Tất cả nhóm</a></li>
                                    <?php foreach ($data["Nhom"] as $nhom): ?>
                                        <li><a class="dropdown-item filtered-by-static" href="javascript:void(0)" data-id="<?php echo htmlspecialchars($nhom['manhom']); ?>">
                                            <?php echo htmlspecialchars($nhom['tennhom']); ?>
                                        </a></li>
                                    <?php endforeach; ?>
                                </ul>
                            </div>
                        </div>
                        <div class="row g-3 mb-4">
                            <div class="col-md-6 col-xl-3">
                                <div class="block block-rounded block-fx-shadow bg-success text-white">
                                    <div class="block-content block-content-full d-flex align-items-center justify-content-between p-3">
                                        <div class="me-3">
                                            <p class="fs-lg fw-semibold mb-0" id="da_nop">0</p>
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
                                            <p class="fs-lg fw-semibold mb-0" id="chua_nop">0</p>
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
                                            <p class="fs-lg fw-semibold mb-0" id="khong_thi">0</p>
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
                                            <p class="fs-lg fw-semibold mb-0" id="diem_trung_binh">0</p>
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
                                            <p class="fs-lg fw-semibold mb-0" id="diem_duoi_1">0</p>
                                            <p class="text-white-75 mb-0">Số thí sinh điểm &le; 1</p>
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
                                            <p class="fs-lg fw-semibold mb-0" id="diem_duoi_5">0</p>
                                            <p class="text-white-75 mb-0">Số thí sinh điểm &le; 5</p>
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
                                            <p class="fs-lg fw-semibold mb-0" id="diem_lon_5">0</p>
                                            <p class="text-white-75 mb-0">Số thí sinh điểm &ge; 5</p>
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
                                            <p class="fs-lg fw-semibold mb-0" id="diem_cao_nhat">0</p>
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
                    <!-- Bảng điểm -->
                    <div class="tab-pane fade" id="bang-diem" role="tabpanel" aria-labelledby="bang-diem-tab">
                        <p>Bảng điểm sẽ hiển thị chi tiết kết quả thi của từng sinh viên.</p>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>