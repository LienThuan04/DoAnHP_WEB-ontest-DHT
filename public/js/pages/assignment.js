Dashmix.helpersOnLoad(["jq-select2"]);

Dashmix.onLoad(() =>
  class {
    static initValidation() {
      Dashmix.helpers("jq-validation");
      jQuery(".form-phancong").validate({
        rules: {
          "giang-vien": { required: true },
          namhoc: { required: true },
          hocky: { required: true },
        },
        messages: {
          "giang-vien": { required: "Vui lòng chọn giảng viên" },
          namhoc: { required: "Vui lòng chọn năm học" },
          hocky: { required: "Vui lòng chọn học kỳ" },
        },
      });
    }
    static init() {
      this.initValidation();
    }
  }.init()
);

// Bộ môn đã chọn
let subject = new Set();

// Hiển thị danh sách phân công
function showAssignment(data) {
  if (data.length === 0) {
    $("#listAssignment").html(
      '<tr><td colspan="8" class="text-center text-muted py-4">Chưa có phân công nào</td></tr>'
    );
    $('[data-bs-toggle="tooltip"]').tooltip("dispose");
    return;
  }

  // Lấy giá trị lọc từ dropdown
  const selectedNamHoc = $("#filter-namhoc").val();
  const selectedHocKy = $("#filter-hocky").val();

  // Lọc dữ liệu client-side
  const filteredData = data.filter((item) => {
    const matchNamHoc = !selectedNamHoc || item.namhoc == selectedNamHoc;
    const matchHocKy = !selectedHocKy || item.hocky == selectedHocKy;
    return matchNamHoc && matchHocKy;
  });

  if (filteredData.length === 0) {
    $("#listAssignment").html(
      '<tr><td colspan="8" class="text-center text-muted py-4">Không tìm thấy phân công nào cho năm học và học kỳ đã chọn</td></tr>'
    );
    $('[data-bs-toggle="tooltip"]').tooltip("dispose");
    return;
  }
  filteredData.sort((a, b) => {
    const yearA = Number(a.tennamhoc.split("-")[0]);
    const yearB = Number(b.tennamhoc.split("-")[0]);

    if (yearA !== yearB) return yearB - yearA;

    return Number(b.hocky) - Number(a.hocky);
  });

  // =========================================================

  let html = "";
  let limit = this.option?.limit || 10;
  let curPage = this.valuePage?.curPage || 1;
  let offset = (curPage - 1) * limit;

  filteredData.forEach((element, idx) => {
    const stt = offset + idx + 1;
    const giangvien_id = element["manguoidung"] || "";
    const monhoc_code = element["mamonhoc"] || "";
    const hoten = element["hoten"]
      ? $("<div>").text(element["hoten"]).html()
      : "";
    const tenmonhoc = element["tenmonhoc"]
      ? $("<div>").text(element["tenmonhoc"]).html()
      : "";
    const namhoc = element["tennamhoc"] || "-";
    const hocky = element["tenhocky"] || "-";

    html += `
      <tr
        data-old-gv="${giangvien_id}"
        data-old-mh="${monhoc_code}"
        data-old-nh="${element["namhoc"] || ""}"
        data-old-hk="${element["hocky"] || ""}"
      >
        <td class="text-center"><strong>${stt}</strong></td>
        <td class="fw-semibold">${hoten}</td>
        <td class="text-center">${$("<div>").text(monhoc_code).html()}</td>
        <td>${tenmonhoc}</td>
        <td class="text-center">${namhoc}</td>
        <td class="text-center">${hocky}</td>

    
        <td class="text-center">
          ${
            element.trangthai == 1
              ? '<span class="badge bg-success">Hoạt động</span>'
              : '<span class="badge bg-danger">Hủy Phân Công</span>'
          }
        </td>

   
        <td class="text-center col-action">
          <a href="javascript:void(0)"
             class="btn btn-sm btn-alt-warning btn-edit-assignment me-1"
             data-bs-toggle="tooltip" data-bs-placement="top" title="Chỉnh sửa"
             data-giangvien="${giangvien_id}"
             data-monhoc="${monhoc_code}"
             data-namhoc="${element["namhoc"] || ""}"
             data-hocky="${element["hocky"] || ""}">
            <i class="fa fa-edit"></i>
          </a>
          <a href="javascript:void(0)"
             class="btn btn-sm btn-alt-danger btn-delete-assignment"
             data-bs-toggle="tooltip" data-bs-placement="top" title="Xóa Phân Công"
             data-id="${giangvien_id}"
             data-mamon="${monhoc_code}"
             data-namhoc="${element["namhoc"] || ""}"
             data-hocky="${element["hocky"] || ""}">
            <i class="fa fa-trash"></i>
          </a>
        </td>
      </tr>`;
  });

  $("#listAssignment").html(html);
  $('[data-bs-toggle="tooltip"]').tooltip();
}

// Hiển thị danh sách môn học trong modal
function showSubject(data) {
  if (data.length === 0) {
    $("#list-subject").html(
      "<tr><td colspan='6' class='text-center text-muted'>Không tìm thấy môn học</td></tr>"
    );
    return;
  }
  let html = "";
  data.forEach((element) => {
    const checked = subject.has(element["mamonhoc"]) ? "checked" : "";
    html += `<tr>
        <td class="text-center">
            <input class="form-check-input" type="checkbox" name="selectSubject" value="${element["mamonhoc"]}" ${checked}>
        </td>
        <td class="text-center">${element["mamonhoc"]}</td>
        <td>${element["tenmonhoc"]}</td>
        <td class="text-center">${element["sotinchi"]}</td>
        <td class="text-center">${element["sotietlythuyet"]}</td>
        <td class="text-center">${element["sotietthuchanh"]}</td>
    </tr>`;
  });
  $("#list-subject").html(html);
}

$(document).ready(function () {
  // Khởi tạo Select2
  $(".js-select2").select2({ dropdownParent: $("#modal-add-assignment") });
  $("#modal-default-vcenter").on("shown.bs.modal", function () {
    $("#edit-giang-vien, #edit-mon-hoc, #edit-namhoc, #edit-hocky").select2({
      dropdownParent: $("#modal-default-vcenter"),
    });
  });
  $("#edit-mon-hoc, #edit-namhoc, #edit-hocky").on("click", function () {
    Dashmix.helpers("jq-notify", {
      type: "info",
      message: "Không thể chỉnh sửa môn học, năm học hoặc học kỳ.",
    });
  });

  // === LỌC NĂM HỌC + HỌC KỲ TRỰC TIẾP ===
  $("#filter-namhoc, #filter-hocky").on("change", function () {
    console.log("Filter changed:", {
      namhoc: $("#filter-namhoc").val(),
      hocky: $("#filter-hocky").val(),
    });
    mainPagePagination.getPagination(
      mainPagePagination.option,
      1 // reset về trang 1 khi filter
    );
  });

  // Bổ sung filter vào data trước khi gọi API
  const originalGetFormData = mainPagePagination.getFormData;
  mainPagePagination.getFormData = function () {
    const data = originalGetFormData.call(this) || {};
    data.filter = data.filter || {};
    data.filter.namhoc = $("#filter-namhoc").val();
    data.filter.hocky = $("#filter-hocky").val();
    console.log("Filter values sent to API:", data.filter); // Debug
    return data;
  };

  // Tải dữ liệu giảng viên
  $.get(
    "./assignment/getGiangVien",
    function (data) {
      let html = "<option value=''>Chọn giảng viên</option>";
      data.forEach((el) => {
        html += `<option value="${el["id"]}">${el["hoten"]}</option>`;
      });
      $("#giang-vien, #edit-giang-vien").html(html);
    },
    "json"
  ).fail(function () {
    Dashmix.helpers("jq-notify", {
      type: "danger",
      message: "Lỗi khi tải danh sách giảng viên!",
    });
  });

  // Tải dữ liệu môn học
  $.get(
    "./assignment/getMonHoc",
    function (data) {
      let html = "<option value=''>Chọn môn học</option>";
      data.forEach((el) => {
        html += `<option value="${el["mamonhoc"]}">${el["tenmonhoc"]}</option>`;
      });
      $("#edit-mon-hoc").html(html);
    },
    "json"
  ).fail(function () {
    Dashmix.helpers("jq-notify", {
      type: "danger",
      message: "Lỗi khi tải danh sách môn học!",
    });
  });

  // Tải năm học (thêm)
  $.get(
    "./assignment/getNamHoc",
    function (data) {
      let html = '<option value="">Chọn năm học</option>';
      if (!data || !Array.isArray(data)) {
        Dashmix.helpers("jq-notify", {
          type: "danger",
          message: "Không thể tải danh sách năm học!",
        });
        return;
      }
      data.forEach((el) => {
        html += `<option value="${el.manamhoc}">${el.tennamhoc}</option>`;
      });
      $("#namhoc").html(html);
    },
    "json"
  ).fail(function () {
    Dashmix.helpers("jq-notify", {
      type: "danger",
      message: "Lỗi khi tải danh sách năm học!",
    });
  });

  // Khi chọn năm học → tải học kỳ
  $("#namhoc").on("change", function () {
    const manamhoc = $(this).val();
    $("#hocky")
      .prop("disabled", !manamhoc)
      .html('<option value="">Đang tải...</option>');
    if (!manamhoc) {
      $("#hocky").html('<option value="">Chọn học kỳ</option>');
      return;
    }
    $.post(
      "./assignment/getHocKy",
      { manamhoc },
      function (data) {
        let html = '<option value="">Chọn học kỳ</option>';
        if (!data || !Array.isArray(data)) {
          Dashmix.helpers("jq-notify", {
            type: "danger",
            message: "Không thể tải danh sách học kỳ!",
          });
          $("#hocky").html('<option value="">Chọn học kỳ</option>');
          return;
        }
        data.forEach((el) => {
          html += `<option value="${el.mahocky}">${el.tenhocky}</option>`;
        });
        $("#hocky").html(html);
      },
      "json"
    ).fail(function () {
      Dashmix.helpers("jq-notify", {
        type: "danger",
        message: "Lỗi khi tải danh sách học kỳ!",
      });
      $("#hocky").html('<option value="">Chọn học kỳ</option>');
    });
  });

  // Tải năm học (chính)
  $.get(
    "./assignment/getNamHoc",
    function (data) {
      let html = '<option value="">Chọn năm học</option>';
      if (!data || !Array.isArray(data)) {
        Dashmix.helpers("jq-notify", {
          type: "danger",
          message: "Không thể tải danh sách năm học!",
        });
        return;
      }
      data.forEach((el) => {
        html += `<option value="${el.manamhoc}">${el.tennamhoc}</option>`;
      });
      $("#filter-namhoc").html(html);
    },
    "json"
  ).fail(function () {
    Dashmix.helpers("jq-notify", {
      type: "danger",
      message: "Lỗi khi tải danh sách năm học!",
    });
  });

  // Khi chọn năm học → load học kỳ tương ứng
  $("#filter-namhoc").on("change", function () {
    const manamhoc = $(this).val();

    // Reset học kỳ
    $("#filter-hocky")
      .prop("disabled", !manamhoc)
      .html('<option value="">Đang tải...</option>');

    if (!manamhoc) {
      $("#filter-hocky").html('<option value="">Chọn học kỳ</option>');
      mainPagePagination.getPagination(mainPagePagination.option, 1);
      return;
    }

    // Tải danh sách học kỳ
    $.post(
      "./assignment/getHocKy",
      { manamhoc },
      function (data) {
        let html = '<option value="">Chọn học kỳ</option>';
        if (Array.isArray(data)) {
          data.forEach((el) => {
            html += `<option value="${el.mahocky}">${el.tenhocky}</option>`;
          });
        }
        $("#filter-hocky").html(html);

        mainPagePagination.getPagination(mainPagePagination.option, 1);
      },
      "json"
    ).fail(function () {
      Dashmix.helpers("jq-notify", {
        type: "danger",
        message: "Lỗi khi tải danh sách học kỳ!",
      });
      $("#filter-hocky").html('<option value="">Chọn học kỳ</option>');
    });
  });

  // Mở modal thêm phân công
  $("#add_assignment").click(function () {
    $("#giang-vien").val("").trigger("change");
    $("#namhoc").val("").trigger("change");
    $("#hocky").val("").trigger("change");
    subject.clear();
    modalAddAssignmentPagination.getPagination(
      modalAddAssignmentPagination.option,
      1
    );
  });

  $("#modal-add-assignment").on("hidden.bs.modal", function () {
    subject.clear();
  });

  // Khi chọn giảng viên → tải môn đã phân công
  $(document).on("change", "#giang-vien", function () {
    subject.clear();
    modalAddAssignmentPagination.getPagination(
      modalAddAssignmentPagination.option,
      1
    );
  });

  // Chọn môn học
  $("#list-subject").on("change", "input[type=checkbox]", function () {
    const val = $(this).val();
    if ($(this).is(":checked")) subject.add(val);
    else subject.delete(val);
  });

  // Lưu phân công
  $("#btn_assignment").click(function () {
    if (!$(".form-phancong").valid()) return;

    const giangvien = $("#giang-vien").val();
    const namhoc = $("#namhoc").val();
    const hocky = $("#hocky").val();
    const listSubject = [...subject];

    if (!giangvien || !namhoc || !hocky) {
      Dashmix.helpers("jq-notify", {
        type: "warning",
        message: "Vui lòng chọn đầy đủ thông tin!",
      });
      return;
    }

    if (listSubject.length === 0) {
      Dashmix.helpers("jq-notify", {
        type: "info",
        message: "Chưa chọn môn nào để phân công.",
      });
      return;
    }

    $.post(
      "./assignment/checkDuplicate",
      {
        magiangvien: giangvien,
        listSubject: listSubject,
        namhoc: namhoc,
        hocky: hocky,
      },
      function (res) {
        const duplicates = res.duplicates || [];
        const newSubjects = listSubject.filter(
          (mh) => !duplicates.includes(mh)
        );

        if (duplicates.length > 0) {
          Dashmix.helpers("jq-notify", {
            type: "danger",
            message: "Đã bị trùng phân công cho môn: " + duplicates.join(", "),
          });
        }

        if (newSubjects.length > 0) {
          $.post(
            "./assignment/addAssignment",
            {
              magiangvien: giangvien,
              listSubject: newSubjects,
              namhoc: namhoc,
              hocky: hocky,
            },
            function (res) {
              if (res.success) {
                Dashmix.helpers("jq-notify", {
                  type: "success",
                  message: res.message,
                });
                $("#modal-add-assignment").modal("hide");
                mainPagePagination.getPagination(
                  mainPagePagination.option,
                  mainPagePagination.valuePage.curPage
                );
              } else {
                Dashmix.helpers("jq-notify", {
                  type: "danger",
                  message: res.message,
                });
              }
            },
            "json"
          ).fail(function () {
            Dashmix.helpers("jq-notify", {
              type: "danger",
              message: "Lỗi khi lưu phân công!",
            });
          });
        }
      },
      "json"
    ).fail(function () {
      Dashmix.helpers("jq-notify", {
        type: "danger",
        message: "Lỗi khi kiểm tra trùng phân công!",
      });
    });
  });

  // Chỉnh sửa phân công
  $(document).on("click", ".btn-edit-assignment", function () {
    const $btn = $(this);
    const giangvien_id = $btn.data("giangvien"); // manguoidung
    const monhoc_code = $btn.data("monhoc");
    const namhoc = $btn.data("namhoc"); // manamhoc (int)
    const hocky = $btn.data("hocky"); // mahocky (int)

    // Lưu dữ liệu cũ vào row
    $btn.closest("tr").data({
      old_gv: giangvien_id,
      old_mh: monhoc_code,
      old_nh: namhoc,
      old_hk: hocky,
    });

    // Xóa hidden cũ
    $("#edit-namhoc-hidden, #edit-hocky-hidden, #edit-mon-hoc-hidden").remove();
    $("<input>")
      .attr({ type: "hidden", name: "namhoc", id: "edit-namhoc-hidden" })
      .val(namhoc)
      .appendTo("#form-edit-assignment");
    $("<input>")
      .attr({ type: "hidden", name: "hocky", id: "edit-hocky-hidden" })
      .val(hocky)
      .appendTo("#form-edit-assignment");
    $("<input>")
      .attr({ type: "hidden", name: "mamonhoc", id: "edit-mon-hoc-hidden" })
      .val(monhoc_code)
      .appendTo("#form-edit-assignment");

    // === TẢI LẠI TOÀN BỘ 3 SELECT KHI EDIT ===
    $.when(
      $.get("./assignment/getGiangVien", null, null, "json"),
      $.get("./assignment/getMonHoc", null, null, "json"),
      $.get("./assignment/getNamHoc", null, null, "json"),
      $.post("./assignment/getHocKy", { manamhoc: namhoc }, null, "json")
    )
      .done(function (gvRes, mhRes, nhRes, hkRes) {
        // Bây giờ gvRes[0], mhRes[0]... chắc chắn là array
        let gvHtml = "<option value=''>Chọn giảng viên</option>";
        gvRes[0].forEach((el) => {
          gvHtml += `<option value="${el.id || el.manguoidung}">${
            el.hoten
          }</option>`;
        });
        $("#edit-giang-vien").html(gvHtml).val(giangvien_id).trigger("change");

        let mhHtml = "<option value=''>Chọn môn học</option>";
        mhRes[0].forEach((el) => {
          mhHtml += `<option value="${el.mamonhoc}">${el.tenmonhoc}</option>`;
        });
        $("#edit-mon-hoc").html(mhHtml).val(monhoc_code).trigger("change");

        let nhHtml = "<option value=''>Chọn năm học</option>";
        nhRes[0].forEach((el) => {
          nhHtml += `<option value="${el.manamhoc}">${el.tennamhoc}</option>`;
        });
        $("#edit-namhoc").html(nhHtml).val(namhoc).trigger("change");

        let hkHtml = "<option value=''>Chọn học kỳ</option>";
        hkRes[0].forEach((el) => {
          hkHtml += `<option value="${el.mahocky}">${el.tenhocky}</option>`;
        });
        $("#edit-hocky").html(hkHtml).val(hocky).trigger("change");

        // Re-init Select2
        $("#edit-giang-vien, #edit-mon-hoc, #edit-namhoc, #edit-hocky").select2(
          {
            dropdownParent: $("#modal-default-vcenter"),
          }
        );

        $("#modal-default-vcenter").modal("show");
      })
      .done(function (gvRes, mhRes, nhRes, hkRes) {
        // Giảng viên
        let gvHtml = "<option value=''>Chọn giảng viên</option>";
        gvRes[0].forEach((el) => {
          gvHtml += `<option value="${el.id}">${el.hoten}</option>`;
        });
        $("#edit-giang-vien").html(gvHtml).val(giangvien_id).trigger("change");

        // Môn học
        let mhHtml = "<option value=''>Chọn môn học</option>";
        mhRes[0].forEach((el) => {
          mhHtml += `<option value="${el.mamonhoc}">${el.tenmonhoc}</option>`;
        });
        $("#edit-mon-hoc").html(mhHtml).val(monhoc_code).trigger("change");

        // Năm học
        let nhHtml = "<option value=''>Chọn năm học</option>";
        nhRes[0].forEach((el) => {
          nhHtml += `<option value="${el.manamhoc}">${el.tennamhoc}</option>`;
        });
        $("#edit-namhoc").html(nhHtml).val(namhoc).trigger("change");

        // Học kỳ
        let hkHtml = "<option value=''>Chọn học kỳ</option>";
        hkRes[0].forEach((el) => {
          hkHtml += `<option value="${el.mahocky}">${el.tenhocky}</option>`;
        });
        $("#edit-hocky").html(hkHtml).val(hocky).trigger("change");

        // Re-init Select2 sau khi thay html
        $("#edit-giang-vien, #edit-mon-hoc, #edit-namhoc, #edit-hocky").select2(
          {
            dropdownParent: $("#modal-default-vcenter"),
          }
        );

        // Mở modal
        $("#modal-default-vcenter").modal("show");
      })
      .fail(function () {
        Dashmix.helpers("jq-notify", {
          type: "danger",
          message: "Lỗi tải dữ liệu chỉnh sửa!",
        });
      });

    // Vô hiệu hóa 3 field không cho sửa
    $("#edit-mon-hoc, #edit-namhoc, #edit-hocky").prop("disabled", true);
  });

  // Submit form cập nhật
  $("#form-edit-assignment").submit(function (e) {
    e.preventDefault();

    const row = $("#listAssignment tr")
      .filter(function () {
        return $(this).data("old_gv") !== undefined;
      })
      .first();

    const old_mh = row.data("old_mh");
    const old_gv = row.data("old_gv");
    const old_nh = row.data("old_nh");
    const old_hk = row.data("old_hk");

    const newGv = $("#edit-giang-vien").val();
    const newNh = $("#edit-namhoc-hidden").val();
    const newHk = $("#edit-hocky-hidden").val();
    const newMh = $("#edit-mon-hoc-hidden").val(); // Lấy từ hidden

    $.post(
      "./assignment/checkDuplicateForUpdate",
      {
        magiangvien: newGv,
        listSubject: [newMh],
        old_mamonhoc: old_mh,
        namhoc: newNh,
        hocky: newHk,
      },
      function (res) {
        if (res.duplicates && res.duplicates.length > 0) {
          Dashmix.helpers("jq-notify", {
            type: "danger",
            message: "Chọn giảng viên khác phân cho học phần này!",
          });
          return;
        }

        $.post(
          "./assignment/update",
          {
            old_mamonhoc: old_mh,
            old_manguoidung: old_gv,
            old_namhoc: old_nh,
            old_hocky: old_hk,
            mamonhoc: newMh,
            magiangvien: newGv,
            namhoc: newNh,
            hocky: newHk,
          },
          function (res) {
            if (res.success) {
              Dashmix.helpers("jq-notify", {
                type: "success",
                message: res.message,
              });
              $("#modal-default-vcenter").modal("hide");
              mainPagePagination.getPagination(
                mainPagePagination.option,
                mainPagePagination.valuePage.curPage
              );
            } else {
              Dashmix.helpers("jq-notify", {
                type: "danger",
                message: res.message,
              });
            }
          },
          "json"
        );
      },
      "json"
    );
  });

  // Xóa phân công
  $(document).on("click", ".btn-delete-assignment", function () {
    const $btn = $(this);
    const id = $btn.data("id");
    const mamon = $btn.data("mamon");
    const namhoc = $btn.data("namhoc");
    const hocky = $btn.data("hocky");

    Swal.fire({
      title: "Xóa phân công?",
      text: "Không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
    }).then((r) => {
      if (r.isConfirmed) {
        $.post(
          "./assignment/delete",
          { id, mamon, namhoc, hocky },
          function (res) {
            const success = res.success ?? true;
            Swal.fire(
              success ? "Thành công!" : "Lỗi!",
              success ? "Đã xóa!" : "Xóa thất bại!",
              success ? "success" : "error"
            );
            if (success) {
              mainPagePagination.getPagination(
                mainPagePagination.option,
                mainPagePagination.valuePage.curPage
              );
            }
          },
          "json"
        ).fail(function () {
          Swal.fire("Lỗi!", "Xóa thất bại do lỗi kết nối!", "error");
        });
      }
    });
  });
});

// === PHÂN TRANG ===
const paginationContainer = document.querySelectorAll(".pagination-container");
paginationContainer[0].classList.add(paginationClassName[0]);
paginationContainer[1].classList.add(paginationClassName[1]);

const mainPageNav = document.querySelector(`.${paginationClassName[0]}`);
const mainPageSearchForm = document.getElementById("main-page-search-form");
const modalAssignmentNav = document.querySelector(`.${paginationClassName[1]}`);
const modalAssignmentSearchForm = document.getElementById(
  "modal-add-assignment-search-form"
);

const mainPagePagination = new Pagination(
  mainPageNav,
  mainPageSearchForm,
  showAssignment
);
mainPagePagination.option.controller = "assignment";
mainPagePagination.option.model = "PhanCongModel";
mainPagePagination.option.limit = 10;
mainPagePagination.getPagination(mainPagePagination.option, 1);

const modalAddAssignmentPagination = new Pagination(
  modalAssignmentNav,
  modalAssignmentSearchForm,
  showSubject
);
modalAddAssignmentPagination.option.controller = "assignment";
modalAddAssignmentPagination.option.model = "PhanCongModel";
modalAddAssignmentPagination.option.custom.function = "monhoc";
modalAddAssignmentPagination.getPagination(
  modalAddAssignmentPagination.option,
  1
);
