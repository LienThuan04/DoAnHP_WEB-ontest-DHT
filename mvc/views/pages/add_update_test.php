<style>
#page-footer {
    display: none;
}

/* ========== LAYOUT CHUNG ========== */
.form-taodethi {
    display: flex;
    flex-wrap: wrap;
    background: #f8f9fa;
}

/* ========== SIDEBAR ========== */
.sidebar-config {
    padding: 16px;
    height: 100vh;
    overflow-y: auto;
    background: #fff;
    border-right: 1px solid #e9ecef;
}

.sidebar-config h3 {
    color: #343a40;
    font-weight: 600;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #e9ecef;
}

.sidebar-config .form-check {
    margin-bottom: 10px;
}

.sidebar-config .form-check-input:checked {
    background-color: #0d6efd;
    border-color: #0d6efd;
}

.sidebar-config .form-check-input:focus {
    box-shadow: 0 0 0 0.25rem rgba(13,110,253,0.25);
}

/* ========== MAIN CONTENT ========== */
.main-content {
    padding: 20px;
    flex-grow: 1;
}

.block.form-tao-de {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    padding: 22px;
}

.block-header {
    border-bottom: 1px solid #e9ecef;
    margin-bottom: 18px;
    padding-bottom: 10px;
}

.block-title {
    font-weight: 700;
    font-size: 1.26rem;
}

/* Input chung */
.form-label {
    font-weight: 500;
    margin-bottom: 6px;
}

.form-control,
.form-select {
    border-radius: 6px;
    border: 1px solid #ced4da;
    padding: 8px 12px;
    transition: .2s;
}

.form-control:focus,
.form-select:focus {
    border-color: #0d6efd;
    box-shadow: 0 0 4px rgba(13,110,253,0.25);
}

/* Input group */
.input-group-text {
    background: #e9ecef;
    border: 1px solid #ced4da;
}

/* Số câu hỏi theo loại */
.socau-group {
    padding: 18px;
    border: 1px solid #e9ecef;
    border-radius: 10px;
}

/* Buttons */
.btn-hero {
    border-radius: 8px;
    padding: 8px 14px;
    font-weight: 500;
}

.btn-hero.btn-primary {
    background: #0d6efd;
    border-color: #0d6efd;
}

.btn-hero.btn-primary:hover {
    background: #0b5ed7;
}

.btn-hero.btn-success {
    background: #198754;
    border-color: #198754;
}

.btn-hero.btn-success:hover {
    background: #157347;
}

/* Loại câu hỏi */
#loaicauhoi-container .form-check {
    display: flex;
    align-items: center;
    gap: 6px;
}

#loaicauhoi-container .form-check-input:checked {
    background-color: #0d6efd;
    border-color: #0d6efd;
}

/* CHỌN CHƯƠNG */
.show-chap label {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 10px;
}

/* Responsive */
@media (max-width: 768px) {
    .sidebar-config {
        height: auto;
        border-right: none;
        border-bottom: 1px solid #e9ecef;
    }

    .main-content {
        padding: 15px;
    }

    .block.form-tao-de {
        padding: 15px;
    }
}


</style>


<form class="row g-0 flex-md-grow-1 form-taodethi">
    <div class="col-md-4 col-lg-5 col-xl-3 order-md-1 bg-white">
        <div class="content px-2">
            <div class="d-md-none push">
                <button type="button" class="btn w-100 btn-alt-primary" data-toggle="class-toggle" data-target="#side-content" data-class="d-none">
                    <i class="fa fa-cog text-white"></i> CẤU HÌNH
                </button>
            </div>
            <div id="side-content" class="d-none d-md-block push">
                <h3 class="fs-5"><i class="fa fa-wrench text-primary"></i> CẤU HÌNH</h3>
                <div class="form-check form-switch mb-2">
                    <input class="form-check-input" type="checkbox" id="tudongsoande" name="tudongsoande" checked>
                    <label class="form-check-label" for="tudongsoande"><i class="fa fa-check-circle text-success"></i> Tự động lấy từ ngân hàng đề</label>
                </div>
                <div class="form-check form-switch mb-2">
                    <input class="form-check-input" type="checkbox" id="xemdiem" name="xemdiem">
                    <label class="form-check-label" for="xemdiem"><i class="fa fa-eye text-info"></i> Xem điểm sau khi thi xong</label>
                </div>
                <div class="form-check form-switch mb-2 d-none">
                    <input class="form-check-input" type="checkbox" id="xemda" name="xemda">
                    <label class="form-check-label" for="xemda"><i class="fa fa-list text-warning"></i> Xem đáp án khi thi xong</label>
                </div>
                <div class="form-check form-switch mb-2">
                    <input class="form-check-input" type="checkbox" id="xembailam" name="xembailam">
                    <label class="form-check-label" for="xembailam"><i class="fa fa-file text-secondary"></i> Xem bài làm khi thi xong</label>
                </div>
                <div class="form-check form-switch mb-2">
                    <input class="form-check-input" type="checkbox" id="daocauhoi" name="daocauhoi">
                    <label class="form-check-label" for="daocauhoi"><i class="fa fa-random text-danger"></i> Đảo câu hỏi</label>
                </div>
                <div class="form-check form-switch mb-2">
                    <input class="form-check-input" type="checkbox" id="daodapan" name="daodapan">
                    <label class="form-check-label" for="daodapan"><i class="fa fa-exchange text-primary"></i> Đảo đáp án</label>
                </div>
                <div class="form-check form-switch mb-2">
                    <input class="form-check-input" type="checkbox" id="tudongnop" name="tudongnop">
                    <label class="form-check-label" for="tudongnop"><i class="fa fa-upload text-warning"></i> Tự động nộp bài khi chuyển tab</label>
                </div>
            </div>
        </div>
    </div>
    <div class="col-md-8 col-lg-7 col-xl-9 order-md-0">
        <div class="content content-full">
            <form class="block block-rounded form-tao-de">
    <div class="block-header block-header-default">
        
           <h3 class="block-title text-center fs-2">
    <?php echo $data["Action"] == "create" ? "Tạo mới đề thi" : "Cập nhật đề thi"; ?>
</h3>
        </h3>
    </div>

    <div class="block-content">
        

        <!-- TÊN ĐỀ KIỂM TRA -->
        <div class="mb-4">
            <label class="form-label"><i class="fa fa-font text-primary"></i> Tên đề kiểm tra</label>
            <input type="text" class="form-control" id="name-exam" name="tende" placeholder="Nhập tên đề kiểm tra">
        </div>

        <!-- THỜI GIAN BẮT ĐẦU/KẾT THÚC -->
        <div class="row mb-4">
            <div class="col-xl-6">
                <label for="time-start" class="form-label">
                    <i class="fa fa-play text-success"></i> Thời gian bắt đầu
                </label>
                <input type="text" class="js-flatpickr form-control" id="time-start" name="thoigianbatdau"
                       data-enable-time="true" data-time_24hr="true" placeholder="Từ">
            </div>
            <div class="col-xl-6">
                <label for="time-end" class="form-label">
                    <i class="fa fa-stop text-danger"></i> Thời gian kết thúc
                </label>
                <input type="text" class="js-flatpickr form-control" id="time-end" name="thoigianketthuc"
                       data-enable-time="true" data-time_24hr="true" placeholder="Đến">
            </div>
        </div>

        <!-- THỜI GIAN THI -->
        <div class="mb-4">
            <div class="input-group">
                <span class="input-group-text"><i class="fa fa-stopwatch text-secondary"></i></span>
                <input type="number" class="form-control text-center" id="exam-time" name="thoigianthi" placeholder="00">
                <span class="input-group-text">phút</span>
            </div>
        </div>

        <!-- GIAO CHO NHÓM -->
        <div class="mb-4">
            <div class="block block-rounded border">
                <div class="block-header block-header-default">
                    <h3 class="block-title"><i class="fa fa-users text-success"></i> Giao cho</h3>
                    <div class="block-option">
                        <select class="js-select2 form-select" id="nhom-hp" name="manhom" style="width: 100%;" data-placeholder="Chọn nhóm học phần giảng dạy..." <?php if ($data["Action"] == "update") {
                            echo "disabled";
                        } ?>></select>
                        <input type="hidden" name="mamonhoc" id="mamonhoc" value="">
                    </div>
                </div>
                <div class="block-content pb-3">
                    <div class="row" id="list-group">
                        <div class="text-center fs-sm">
                            <img style="width:100px" src="./public/media/svg/empty_data.png" alt="">
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- CHỌN CHƯƠNG -->
        <div class="mb-4 show-chap" id="chuong-container">
            <label for="chuong" class="form-label fw-semibold text-dark mb-3 d-flex align-items-center">
                <i class="fa fa-book-open text-primary me-2 fs-5"></i> Chọn chương
            </label>
            <div id="chuong" class="d-flex flex-column gap-2"></div>
        </div>
        <!-- LOẠI CÂU HỎI -->
      <div class="mb-4" id="loaicauhoi-container">
    <div class="col-md-6 form-section">
        <label class="form-label section-title">
            <i class="fa fa-list-check text-primary me-2"></i>Loại câu hỏi
        </label>

        <div class="d-flex flex-column gap-2">
            <!-- Trắc nghiệm -->
            <div class="d-flex align-items-center gap-3">
                <div class="form-check d-flex align-items-center flex-grow-1">
                    <input class="form-check-input dang-hoi me-2" type="checkbox" id="loai-tracnghiem" name="loai_cau_hoi[]" value="mcq" checked>
                    <label class="form-check-label mb-0" for="loai-tracnghiem">Trắc nghiệm</label>
                </div>
                <input type="number" class="form-control w-25" name="diem_tracnghiem" id="diem_tracnghiem" placeholder="Điểm" min="0">
            </div>

            <!-- Tự luận -->
            <div class="d-flex align-items-center gap-3">
                <div class="form-check d-flex align-items-center flex-grow-1">
                    <input class="form-check-input dang-hoi me-2" type="checkbox" id="loai-tuluan" name="loai_cau_hoi[]" value="essay">
                    <label class="form-check-label mb-0" for="loai-tuluan">Tự luận</label>
                </div>
                <input type="number" class="form-control w-25" name="diem_tuluan" id="diem_tuluan" placeholder="Điểm" min="0">
            </div>

            <!-- Đọc hiểu -->
            <div class="d-flex align-items-center gap-3">
                <div class="form-check d-flex align-items-center flex-grow-1">
                    <input class="form-check-input dang-hoi me-2" type="checkbox" id="loai-doc-hieu" name="loai_cau_hoi[]" value="reading">
                    <label class="form-check-label mb-0" for="loai-doc-hieu">Đọc hiểu</label>
                </div>
                <input type="number" class="form-control w-25" name="diem_dochieu" id="diem_dochieu" placeholder="Điểm"  min="0">
            </div>
         
        </div>
    </div>
</div>

        <!-- SỐ LƯỢNG CÂU THEO DẠNG & MỨC ĐỘ -->
<div id="socau-container" class="mb-4">

    <div class="fs-5 fw-bold mb-3">Cấu hình số lượng câu hỏi</div>

    <div class="socau-wrapper">

        <!-- TEMPLATE CHUNG CHO MỖI LOẠI CÂU HỎI -->
        <!-- TRẮC NGHIỆM -->
<div class="socau-card mb-3 p-3 border rounded shadow-sm" id="box-tn" data-type="tracnghiem">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="d-flex align-items-center gap-2">
            <i class="fa fa-check-circle text-primary fs-4"></i>
            <span class="fw-semibold fs-6">Trắc nghiệm</span>
        </div>
        <div class="text-end">
            <span class="text-muted small">Nhập số câu cho từng mức độ</span>
            <div class="mt-1 fw-bold text-primary" id="diem-moi-cau-tn">
                Mỗi câu: <span class="text-danger">0</span> điểm
            </div>
        </div>
    </div>
    <!-- Các input số câu giữ nguyên -->
    <div class="row g-3">
        <div class="col-12 col-md-4">
            <label class="form-label small text-muted">Dễ</label>
            <input type="number" class="form-control" id="coban_tracnghiem" min="0" value="0">
        </div>
        <div class="col-12 col-md-4">
            <label class="form-label small text-muted">Trung bình</label>
            <input type="number" class="form-control" id="trungbinh_tracnghiem" min="0" value="0">
        </div>
        <div class="col-12 col-md-4">
            <label class="form-label small text-muted">Khó</label>
            <input type="number" class="form-control" id="kho_tracnghiem" min="0" value="0">
        </div>
    </div>
</div>

<!-- TỰ LUẬN -->
<div class="socau-card mb-3 p-3 border rounded shadow-sm d-none" id="box-tl" data-type="tuluan">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="d-flex align-items-center gap-2">
            <i class="fa fa-file-pen text-warning fs-4"></i>
            <span class="fw-semibold fs-6">Tự luận</span>
        </div>
        <div class="text-end">
            <span class="text-muted small">Nhập số câu cho từng mức độ</span>
            <div class="mt-1 fw-bold text-warning" id="diem-moi-cau-tl">
                Mỗi câu: <span class="text-danger">0</span> điểm
            </div>
        </div>
    </div>
    <!-- Input giữ nguyên -->
    <div class="row g-3">
        <div class="col-12 col-md-4">
            <label class="form-label small text-muted">Dễ</label>
            <input type="number" class="form-control" id="coban_tuluan" min="0" value="0">
        </div>
        <div class="col-12 col-md-4">
            <label class="form-label small text-muted">Trung bình</label>
            <input type="number" class="form-control" id="trungbinh_tuluan" min="0" value="0">
        </div>
        <div class="col-12 col-md-4">
            <label class="form-label small text-muted">Khó</label>
            <input type="number" class="form-control" id="kho_tuluan" min="0" value="0">
        </div>
    </div>
</div>

<!-- ĐỌC HIỂU -->
<div class="socau-card mb-3 p-3 border rounded shadow-sm d-none" id="box-dh" data-type="dochieu">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <div class="d-flex align-items-center gap-2">
            <i class="fa fa-book text-success fs-4"></i>
            <span class="fw-semibold fs-6">Đọc hiểu</span>
        </div>
        <div class="text-end">
            <span class="text-muted small">Nhập số câu cho từng mức độ</span>
            <div class="mt-1 fw-bold text-success" id="diem-moi-cau-dh">
                Mỗi câu: <span class="text-danger">0</span> điểm
            </div>
        </div>
    </div>
    <!-- Input giữ nguyên -->
    <div class="row g-3">
        <div class="col-12 col-md-4">
            <label class="form-label small text-muted">Dễ</label>
            <input type="number" class="form-control" id="coban_dochieu" min="0" value="0">
        </div>
        <div class="col-12 col-md-4">
            <label class="form-label small text-muted">Trung bình</label>
            <input type="number" class="form-control" id="trungbinh_dochieu" min="0" value="0">
        </div>
        <div class="col-12 col-md-4">
            <label class="form-label small text-muted">Khó</label>
            <input type="number" class="form-control" id="kho_dochieu" min="0" value="0">
        </div>
    </div>
</div>
       

        <!-- NÚT HÀNH ĐỘNG -->
        <div class="mb-4">
            <?php if ($data["Action"] == "create"): ?>
                <button type="submit" class="btn btn-hero btn-primary" id="btn-add-test">
                    <i class="fa fa-plus-circle text-white"></i> Tạo đề
                </button>
            <?php elseif ($data["Action"] == "update"): ?>
                <button type="submit" class="btn btn-hero btn-primary" id="btn-update-test" >
                    <i class="fa fa-save text-white"></i> Cập nhật đề
                </button>
            <?php endif; ?>
            <a class="btn btn-hero btn-success" id="btn-update-quesoftest" data-made="">
                <i class="fa fa-edit text-white"></i> Chỉnh sửa danh sách câu hỏi
            </a>
        </div>

    </div>
            </form>
        </div>
    </div>
</form>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        const checkboxes = document.querySelectorAll('input[name="loai_cau_hoi[]"]');
        const types = {
            'tracnghiem': document.querySelector('.socau-type[data-type="tracnghiem"]'),
            'tuluan': document.querySelector('.socau-type[data-type="tuluan"]'),
            'dochieu': document.querySelector('.socau-type[data-type="dochieu"]'),
        };
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const typeDiv = types[this.value];
                if (typeDiv) {
                    typeDiv.style.display = this.checked ? 'block' : 'none';
                }
            });
            // Initial state
            const typeDiv = types[checkbox.value];
            if (typeDiv) {
                typeDiv.style.display = checkbox.checked ? 'block' : 'none';
            }
        });
    });
     document.addEventListener('DOMContentLoaded', function () {
    // init flatpickr if exists
    if (window.flatpickr) {
      flatpickr(".js-flatpickr", { enableTime: true, time_24hr: true, dateFormat: "Y-m-d H:i" });
    }

    // INITIAL STATE for types: keep original checked states
    updateBoxDisplay();

    // When loai-de changes (1: only 1 allowed, 2: 2 allowed, 3: all allowed)
    $("#loai-de").on("change", function () {
      const type = parseInt($(this).val());
      const checkboxes = $(".dang-hoi");

      // reset any special handler
      checkboxes.off("change.onlyone");
      if (type === 1) {
        // only one allowed
        checkboxes.on("change.onlyone", function () {
          if ($(this).is(":checked")) {
            checkboxes.not(this).prop("checked", false);
          }
          updateBoxDisplay();
        });
      }
      updateBoxDisplay();
    });

    // When any dang-hoi toggled
    $(".dang-hoi").on("change", function () {
      updateBoxDisplay();
    });

    // Ensure #mon-hoc change triggers chapter load: keep compatibility with existing selectors
    $("#mon-hoc").on("change", function () {
      // reuse the same endpoint as other selectors: ./subject/getAllChapter
      const mamonhoc = $(this).val();
      const htmlEmpty = '<option value=""></option>';
      $.ajax({
        type: "post",
        url: "./subject/getAllChapter",
        data: { mamonhoc: mamonhoc },
        dataType: "json",
        success: function (data) {
          let html = htmlEmpty;
          data.forEach((item) => {
            html += `<option value="${item.machuong}">${item.tenchuong}</option>`;
          });
          $("#chuong").html(html);

          // If there is a pending chapter to set (from edit), set it now
          if (window.chapterToSet) {
            $("#chuong").val(window.chapterToSet).trigger("change");
            window.chapterToSet = null;
          }
        },
        error: function () {
          // keep existing options if any; notify lightly
          console.warn("Không tải được chương (mon-hoc -> getAllChapter).");
        }
      });
    });

    // Keep behavior for other selectors that existed in your system:
    $(".data-monhoc").on("change", function () {
      let selectedValue = $(this).val();
      let id = $(this).data("tab");
      let html = "<option></option>";
      $.ajax({
        type: "post",
        url: "./subject/getAllChapter",
        data: { mamonhoc: selectedValue },
        dataType: "json",
        success: function (data) {
          data.forEach((item) => {
            html += `<option value="${item.machuong}">${item.tenchuong}</option>`;
          });
          $(`.data-chuong[data-tab="${id}"]`).html(html);
        }
      });
    });

    $("#main-page-monhoc").on("change", function () {
      let mamonhoc = $(this).val();
      let id = $(this).data("tab");
      let html = "<option></option>";
      $.ajax({
        type: "post",
        url: "./subject/getAllChapter",
        data: { mamonhoc: mamonhoc },
        dataType: "json",
        success: function (data) {
          data.forEach((item) => {
            html += `<option value="${item.machuong}">${item.tenchuong}</option>`;
          });
          $(`#main-page-chuong[data-tab="${id}"]`).html(html);
        }
      });
    });

    // If backend sets variables or you call getQuestionById elsewhere and sets window.chapterToSet,
    // the above mon-hoc listener will set the chapter after AJAX returns.
  });

  // show/hide socau blocks according to checkboxes
  function updateBoxDisplay() {
    // keep original IDs and boxes
    toggleBox("#box-tn", "#loai-tracnghiem");
    toggleBox("#box-tl", "#loai-tuluan");
    toggleBox("#box-dh", "#loai-doc-hieu");
  }

  function toggleBox(boxSelector, checkboxSelector) {
    if ($(checkboxSelector).is(":checked")) {
      $(boxSelector).removeClass("d-none");
    } else {
      $(boxSelector).addClass("d-none");
      // optional: clear values inside when hidden to avoid accidental submit
      $(boxSelector).find("input[type='number']").val("");
    }
  }

  // Utility: When editing a question (from previous code) you should call:
  // window.chapterToSet = <mã chương>;
  // $("#mon-hoc").val(<mã môn>).trigger("change");
  // This pattern is compatible with the mon-hoc listener above and will set chuong safely.

  // Example: if your existing getQuestionById used setTimeout to set "#chuong", replace with:
  // window.chapterToSet = machuong;
  // $("#mon-hoc").val(monhoc).trigger("change");

</script>