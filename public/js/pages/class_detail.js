Dashmix.onLoad(() => {
  class ValidationInit {
    static initValidation() {
      Dashmix.helpers("jq-validation");
      jQuery("#addSvThuCong").validate({
        rules: {
          mssv: { required: true, minlength: 10 },
          hoten: { required: true },
          matkhau: { required: true, minlength: 6 },
        },
        messages: {
          mssv: {
            required: "Vui lòng nhập mã sinh viên của bạn",
            minlength: "Mã số sinh viên ít nhất 10 ký tự",
          },
          hoten: { required: "Cung cấp đầy đủ họ tên" },
          matkhau: {
            required: "Nhập mật khẩu",
            minlength: "Mật khẩu phải có ít nhất 6 ký tự!",
          },
        },
        errorPlacement: function (error, element) {
          error.insertAfter(element);
        },
      });
    }

    static init() {
      this.initValidation();
    }
  }
  ValidationInit.init();
});

$(".btn-copy-code").click(function (e) {
  e.preventDefault();
  var text = $("#show-ma-moi").text();
  navigator.clipboard.writeText(text).then(
    function () {
      Dashmix.helpers("jq-notify", {
        type: "success",
        icon: "fa fa-check me-1",
        message: `Sao chép mã thành công !`,
      });
    },
    function () {
      Dashmix.helpers("jq-notify", {
        type: "danger",
        icon: "fa fa-times me-1",
        message: `Sao chép mã không thành công !`,
      });
    }
  );
});

const manhom = $(".content").data("id");
const showData = function (
  students,
  curPage = mainPagePagination.valuePage.curPage,
  limit = mainPagePagination.option.limit
) {
  let html = "";
  let index = 1;
  let offset = (curPage - 1) * limit;
  if (students.length === 0) {
    html += `<tr><td colspan="7" class="text-center">Không có dữ liệu</td></tr>`;
  } else {
    students.forEach((student) => {
      html += `
                <tr>
                    <td class="text-center">${offset + index++}</td>
                    <td class="fs-sm d-flex align-items-center">
                        <img class="img-avatar img-avatar48 me-3" src="/public/media/avatars/${
                          student.avatar || "avatar2.jpg"
                        }" alt="">
                        <div class="d-flex flex-column">
                            <a class="fw-semibold" href="javascript:void(0)">${
                              student.hoten
                            }</a>
                            <span class="fw-normal fs-sm text-muted">${
                              student.email
                            }</span>
                        </div>
                    </td>
                    <td class="text-center">${student.id}</td>
                    <td class="text-center fs-sm">${
                      student.gioitinh == 1 ? "Nam" : "Nữ"
                    }</td>
                    <td class="text-center fs-sm">${student.ngaysinh}</td>
                    <td class="text-center">
                        <div class="btn-group">
                            <button type="button" class="btn btn-sm btn-alt-secondary kick-user" data-bs-toggle="Delete" title="Delete" data-id="${
                              student.id
                            }">
                                <i class="fa fa-fw fa-times"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
    });
  }
  $("#list-student").html(html);
  $('[data-bs-toggle="tooltip"]').tooltip();
};

function updatePaginationUI(totalItems, limit, curPage) {
  let totalPages = Math.ceil(totalItems / limit);
  let paginationHtml = "";

  // Tạo HTML cho các số trang
  let startPage = Math.max(1, curPage - 2);
  let endPage = Math.min(totalPages, curPage + 2);
  for (let i = startPage; i <= endPage; i++) {
    paginationHtml += `
            <li class="page-item ${i === curPage ? "active" : ""}">
                <a class="page-link" href="javascript:void(0)" data-page="${i}">${i}</a>
            </li>
        `;
  }

  // Cập nhật danh sách số trang
  $(".list-page").html(paginationHtml);

  // Cập nhật trạng thái các nút điều hướng
  $(".first-page")
    .toggleClass("disabled", curPage === 1)
    .data("page", 1);
  $(".prev-page")
    .toggleClass("disabled", curPage === 1)
    .data("page", curPage - 1);
  $(".next-page")
    .toggleClass("disabled", curPage === totalPages)
    .data("page", curPage + 1);
  $(".last-page")
    .toggleClass("disabled", curPage === totalPages)
    .data("page", totalPages);

  // Gắn sự kiện click
  $(".page-link")
    .off("click")
    .on("click", function (e) {
      e.preventDefault();
      let newPage = $(this).data("page");
      if (
        newPage &&
        !$(this).parent().hasClass("disabled") &&
        !$(this).parent().hasClass("active")
      ) {
        mainPagePagination.valuePage.curPage = newPage;
        mainPagePagination.getPagination(mainPagePagination.option, newPage);
      }
    });
}

$(document).ready(function () {
  $(document).on("click", ".kick-user", function () {
    var mssv = $(this).data("id");
    let e = Swal.mixin({
      buttonsStyling: !1,
      target: "#page-container",
      customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-danger m-1",
        input: "form-control",
      },
    });

    e.fire({
      title: "Are you sure?",
      text: "Bạn có chắc chắn muốn xóa người dùng này ra khỏi nhóm?",
      icon: "warning",
      showCancelButton: !0,
      customClass: {
        confirmButton: "btn btn-danger m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Vâng, tôi chắc chắn!",
      preConfirm: () => new Promise((e) => setTimeout(() => e(), 50)),
    }).then((t) => {
      if (t.value) {
        $.ajax({
          type: "post",
          url: "/module/kickUser",
          data: { manhom: manhom, manguoidung: mssv },
          success: function (response) {
            getGroupSize(manhom);
            mainPagePagination.valuePage.curPage = 1;
            mainPagePagination.getPagination(mainPagePagination.option, 1);
            e.fire("Deleted!", "Xóa người dùng thành công!", "success");
          },
        });
      }
    });
  });

  $("#addSvByClassCode").on("submit", function (e) {
    e.preventDefault();
    const classCode = $("#malop").val().trim();
    const groupId = $(".content").data("id");

    if (classCode === "") return alert("Vui lòng nhập mã lớp");

    $.ajax({
      url: "/module/addStudentsByClassCode",
      type: "POST",
      data: { malop: classCode, manhom: groupId },
      success: function (res) {
        try {
          if (typeof res === "string") res = JSON.parse(res);
        } catch (e) {
          Dashmix.helpers("jq-notify", {
            type: "danger",
            icon: "fa fa-times me-1",
            message: "Lỗi định dạng phản hồi từ server.",
          });
          return;
        }
        if (
          !res.success &&
          res.message &&
          res.message.includes("Không tìm thấy lớp")
        ) {
          Dashmix.helpers("jq-notify", {
            type: "danger",
            icon: "fa fa-times me-1",
            message: "Mã lớp không tồn tại. Vui lòng kiểm tra lại.",
          });
          return;
        }
        Dashmix.helpers("jq-notify", {
          type: res.success ? "success" : "danger",
          icon: res.success ? "fa fa-check me-1" : "fa fa-times me-1",
          message: res.message || "Xử lý hoàn tất",
        });
        if (res.success) {
          $("#modal-add-user").modal("hide");
          mainPagePagination.valuePage.curPage = 1;
          mainPagePagination.getPagination(mainPagePagination.option, 1);
          getGroupSize(groupId);
        }
      },
      error: function (err) {
        console.error("Lỗi AJAX:", err);
      },
    });
  });

  function loadList() {
    console.log(
      "Gọi loadList với manhom:",
      mainPagePagination.option.manhom,
      "page:",
      mainPagePagination.valuePage.curPage,
      "limit:",
      mainPagePagination.option.limit
    );
    $.ajax({
      type: "post",
      url: "/module/getSvList",
      data: {
        manhom: mainPagePagination.option.manhom,
        limit: mainPagePagination.option.limit,
        page: mainPagePagination.valuePage.curPage,
        filter: mainPagePagination.option.filter,
        custom: mainPagePagination.option.custom || {},
      },
      dataType: "json",
      success: function (response) {
        console.log("Dữ liệu từ server (/module/getSvList):", response);
        mainPagePagination.option.total = response.total || 0;
        console.log(
          "Tổng số bản ghi (total):",
          mainPagePagination.option.total
        );
        console.log("Danh sách sinh viên (students):", response.students);
        showData(
          response.students || [],
          mainPagePagination.valuePage.curPage,
          mainPagePagination.option.limit
        );
        updatePaginationUI(
          mainPagePagination.option.total,
          mainPagePagination.option.limit,
          mainPagePagination.valuePage.curPage
        );
      },
      error: function (err) {
        console.error("Lỗi khi tải danh sách sinh viên:", err);
        Dashmix.helpers("jq-notify", {
          type: "danger",
          icon: "fa fa-times me-1",
          message: "Không thể tải danh sách sinh viên!",
        });
      },
    });
  }
  const showData = function (
    students,
    curPage = mainPagePagination.valuePage.curPage,
    limit = mainPagePagination.option.limit
  ) {
    console.log(
      "showData - students:",
      students,
      "curPage:",
      curPage,
      "limit:",
      limit
    );
    let html = "";
    let index = 1;
    let offset = (curPage - 1) * limit;
    if (!Array.isArray(students) || students.length === 0) {
      console.log("Không có dữ liệu sinh viên để hiển thị");
      html += `<tr><td colspan="7" class="text-center">Không có dữ liệu</td></tr>`;
    } else {
      console.log("Số lượng sinh viên hiển thị:", students.length);
      students.forEach((student, idx) => {
        console.log(`Sinh viên ${idx + 1}:`, student);
        html += `
                <tr>
                    <td class="text-center">${offset + index++}</td>
                    <td class="fs-sm d-flex align-items-center">
                        <img class="img-avatar img-avatar48 me-3" src="/public/media/avatars/${
                          student.avatar || "avatar2.jpg"
                        }" alt="">
                        <div class="d-flex flex-column">
                            <a class="fw-semibold" href="javascript:void(0)">${
                              student.hoten || "Không có tên"
                            }</a>
                            <span class="fw-normal fs-sm text-muted">${
                              student.email || "Không có email"
                            }</span>
                        </div>
                    </td>
                    <td class="text-center">${student.id || "N/A"}</td>
                    <td class="text-center fs-sm">${
                      student.gioitinh == 1 ? "Nam" : "Nữ"
                    }</td>
                    <td class="text-center fs-sm">${
                      student.ngaysinh || "N/A"
                    }</td>
                    <td class="text-center">
                        <div class="btn-group">
                            <button type="button" class="btn btn-sm btn-alt-secondary kick-user" data-bs-toggle="Delete" title="Delete" data-id="${
                              student.id || ""
                            }">
                                <i class="fa fa-fw fa-times"></i>
                            </button>
                        </div>
                    </td>
                </tr>`;
      });
    }
    $("#list-student").html(html);
    console.log("Cập nhật HTML cho #list-student");
    $('[data-bs-toggle="tooltip"]').tooltip();
  };
  function loadDataAnnounce(manhom) {
    $.ajax({
      type: "post",
      url: "/teacher_announcement/getAnnounce",
      data: { manhom: manhom },
      dataType: "json",
      success: function (response) {
        showAnnouncement(response);
      },
    });
  }

  function showAnnouncement(announces) {
    let html = "";
    if (announces.length != 0) {
      announces.forEach((announce) => {
        html += `
                    <li>
                    <a class="d-flex text-dark py-2" href="/teacher_announcement/update/${
                      announce.matb
                    }">
                        <div class="flex-shrink-0 mx-3">
                            <img class="img-avatar img-avatar48" src="/public/media/avatars/${
                              announce.avatar == null
                                ? "avatar2.jpg"
                                : announce.avatar
                            }" alt="">
                        </div>
                        <div class="flex-grow-1 fs-sm pe-2">
                            <div class="fw-semibold">${announce.noidung}</div>
                            <div class="text-muted">${formatDate(
                              announce.thoigiantao
                            )}</div>
                        </div>
                    </a>
                </li>`;
      });
    } else {
      html += `<p class="text-center">Không có thông báo</p>`;
    }
    $(".list-announce").html(html);
  }
  function showDataTest(tests) {
    let html = ``;
    if (tests.length != 0) {
      tests.forEach((test) => {
        html += `<div class="block block-rounded block-fx-pop mb-2">
                <div class="block-content block-content-full border-start border-3 border-primary">
                    <div class="d-md-flex justify-content-md-between align-items-md-center">
                        <div class="p-1 p-md-2">
                            <h3 class="h4 fw-bold mb-3">
                                <a href="/test/detail/${test.made}" class="text-dark link-fx">${test.tende}</a>
                            </h3>
                            <p class="fs-sm text-muted mb-0">
                                <i class="fa fa-clock me-1"></i> Diễn ra từ <span>${test.thoigianbatdau}</span> đến <span>${test.thoigianketthuc}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>`;
      });
    } else {
      html += `<p class="text-center">Chưa có đề thi...</p>`;
    }
    $(".list-test").html(html);
  }

  function loadDataTest(manhom) {
    $.ajax({
      type: "post",
      url: "/test/getTestGroup",
      data: {
        manhom: manhom,
      },
      dataType: "json",
      success: function (response) {
        showDataTest(response);
      },
    });
  }

  $("[data-bs-target='#offcanvasSetting']").click(function (e) {
    e.preventDefault();
    Promise.all([loadDataTest(manhom), loadDataAnnounce(manhom)])
      .then(() => {
        // Kích hoạt lại tab "Đề kiểm tra"
        $("#tab-test-tab").addClass("active");
        $("#tab-announce-tab").removeClass("active");
        $("#tab-test").addClass("show active");
        $("#tab-announce").removeClass("show active");

        // Mở Offcanvas
        $("#offcanvasSetting").offcanvas("show");
      })
      .catch((err) => {
        console.error("Lỗi khi tải dữ liệu:", err);
        Dashmix.helpers("jq-notify", {
          type: "danger",
          icon: "fa fa-times me-1",
          message: "Không thể tải dữ liệu cho offcanvas!",
        });
      });
  });

  showInvitedCode();

  function showInvitedCode() {
    $.ajax({
      type: "post",
      url: "/module/getInvitedCode",
      data: { manhom: manhom },
      success: function (response) {
        $("#show-ma-moi").text(response);
      },
    });
  }

  $(".btn-reset-invited-code").click(function (e) {
    e.preventDefault();
    $.ajax({
      type: "post",
      url: "/module/updateInvitedCode",
      data: { manhom: manhom },
      success: function (response) {
        showInvitedCode();
      },
    });
  });

  $("#mssv").on("change", function () {
    checkAcc($(this).val());
  });

  $(".btn-add-sv-group").hide();
  function checkAcc(mssv) {
    $.ajax({
      type: "post",
      url: "/module/checkAcc",
      data: { mssv: mssv, manhom: manhom },
      success: function (response) {
        let check = response;
        if (check == 0) {
          Dashmix.helpers("jq-notify", {
            type: "danger",
            icon: "fa fa-times me-1",
            message: `Sinh viên đã có trong nhóm!`,
          });
          $(".btn-add-sv-group").hide();
          $(".btn-add-sv").hide();
          $("#collapseAddSv").collapse("hide");
        } else if (check == -1) {
          $(".btn-add-sv-group").show();
          $(".btn-add-sv").hide();
          $("#collapseAddSv").collapse("hide");
        } else if (check == 1) {
          $(".btn-add-sv").show();
          $(".btn-add-sv-group").hide();
          $("#collapseAddSv").collapse("show");
        }
      },
    });
  }

  $(".btn-add-sv-group").click(function (e) {
    e.preventDefault();
    $.ajax({
      type: "post",
      url: "/module/addSvGroup",
      data: { manhom: manhom, mssv: $("#mssv").val() },
      success: function (response) {
        if (response) {
          getGroupSize(manhom);
          mainPagePagination.valuePage.curPage = 1;
          mainPagePagination.getPagination(mainPagePagination.option, 1);
          $("#modal-add-user").modal("hide");
          Dashmix.helpers("jq-notify", {
            type: "success",
            icon: "fa fa-times me-1",
            message: `Thêm người dùng thành công!`,
          });
        }
      },
    });
  });

  $(".btn-add-sv").click(function (e) {
    e.preventDefault();
    if ($("#addSvThuCong").valid()) {
      $.ajax({
        type: "post",
        url: "/module/addSV",
        data: {
          manhom: manhom,
          mssv: $("#mssv").val(),
          hoten: $("#hoten").val(),
          password: $("#matkhau").val(),
        },
        dataType: "json",
        success: function (response) {
          if (response) {
            $("#modal-add-user").modal("hide");
            Dashmix.helpers("jq-notify", {
              type: "success",
              icon: "fa fa-times me-1",
              message: `Thêm người dùng thành công!`,
            });
            getGroupSize(manhom);
            mainPagePagination.valuePage.curPage = 1;
            mainPagePagination.getPagination(mainPagePagination.option, 1);
          }
        },
      });
    }
  });

  $("#exportStudents").click(function () {
    $.ajax({
      type: "post",
      url: "/module/exportExcelStudentS",
      data: { manhom: manhom },
      dataType: "json",
      success: function (response) {
        var $a = $("<a>");
        $a.attr("href", response.file);
        $("body").append($a);
        $a.attr("download", "Danh sách sinh viên.xls");
        $a[0].click();
        $a.remove();
      },
    });
  });

  $("#exportScores").click(function () {
    $.ajax({
      type: "post",
      url: "/test/getMarkOfAllTest",
      data: { manhom: manhom },
      dataType: "json",
      success: function (response) {
        var $a = $("<a>");
        $a.attr("href", response.file);
        $("body").append($a);
        $a.attr("download", "Danh sách điểm.xls");
        $a[0].click();
        $a.remove();
      },
    });
  });
  $("#nhap-file").click(function (e) {
    e.preventDefault();
    let password = $("#ps_user_group").val();
    let file_cauhoi = $("#file-cau-hoi").val();
    if (password == "" || file_cauhoi == "") {
      Dashmix.helpers("jq-notify", {
        type: "danger",
        icon: "fa fa-times me-1",
        message: `Vui lòng điền đầy đủ thông tin!`,
      });
      return;
    }

    var file = $("#file-cau-hoi")[0].files[0];
    var formData = new FormData();
    formData.append("fileToUpload", file);
    $.ajax({
      type: "post",
      url: "/user/addExcel",
      data: formData,
      contentType: false,
      processData: false,
      dataType: "json",
      beforeSend: function () {
        Dashmix.layout("header_loader_on");
      },
      success: function (response) {
        if (response.status === "error") {
          Dashmix.helpers("jq-notify", {
            type: "danger",
            icon: "fa fa-times me-1",
            message: response.message,
          });
          return;
        }
        addExcel(response.data, password);
      },
      error: function (xhr, status, error) {
        console.error("Lỗi AJAX:", xhr.responseText);
        Dashmix.helpers("jq-notify", {
          type: "danger",
          icon: "fa fa-times me-1",
          message: `Lỗi khi xử lý file Excel: ${xhr.responseText}`,
        });
      },
      complete: function () {
        Dashmix.layout("header_loader_off");
      },
    });
  });

  function addExcel(data, password) {
    $.ajax({
      type: "post",
      url: "/user/addFileExcelGroup",
      data: {
        listuser: JSON.stringify(data),
        group: manhom,
        password: password,
      },
      dataType: "json",
      beforeSend: function () {
        Dashmix.layout("header_loader_on");
      },
      success: function (response) {
        Dashmix.helpers("jq-notify", {
          type: response.status === "success" ? "success" : "danger",
          icon:
            response.status === "success"
              ? "fa fa-check me-1"
              : "fa fa-times me-1",
          message:
            response.message ||
            (response.status === "success"
              ? "Thêm người dùng thành công!"
              : "Thêm người dùng thất bại!"),
        });
        if (response.status === "success") {
          getGroupSize(manhom);
          mainPagePagination.valuePage.curPage = 1;
          mainPagePagination.getPagination(mainPagePagination.option, 1);
          $("#ps_user_group").val("");
          $("#file-cau-hoi").val("");
          $("#modal-add-user").modal("hide");
        }
      },
      error: function (xhr, status, error) {
        console.error("Lỗi AJAX:", xhr.responseText);
        Dashmix.helpers("jq-notify", {
          type: "danger",
          icon: "fa fa-times me-1",
          message: `Lỗi khi thêm người dùng: ${xhr.responseText}`,
        });
      },
      complete: function () {
        Dashmix.layout("header_loader_off");
      },
    });
  }

  function getGroupSize(id) {
    $.ajax({
      type: "post",
      url: "/module/getGroupSize",
      data: { manhom: id },
      success: function (response) {
        $(".number-participants").html(+response);
      },
      error: function (err) {
        console.error(err.responseText);
      },
    });
  }

  getGroupSize(manhom);

  function resetSortIcons() {
    document.querySelectorAll(".col-sort").forEach((column) => {
      column.dataset.sortOrder = "default";
    });
  }

  $(".table-col-title").click(function (e) {
    if (!e.target.classList.contains("col-sort")) {
      return;
    }
    const column = e.target.dataset.sortColumn;
    const prevSortOrder = e.target.dataset.sortOrder;
    let currentSortOrder = "";
    switch (prevSortOrder) {
      case "default":
        currentSortOrder = "asc";
        break;
      case "asc":
        currentSortOrder = "desc";
        break;
      case "desc":
        currentSortOrder = "default";
        break;
    }

    if (currentSortOrder === "default") {
      mainPagePagination.option.custom = {};
    } else {
      mainPagePagination.option.custom = {
        function: "sort",
        column: column,
        order: currentSortOrder,
      };
    }

    getGroupSize(manhom);
    mainPagePagination.valuePage.curPage = 1;
    mainPagePagination.getPagination(mainPagePagination.option, 1);

    resetSortIcons();
    e.target.dataset.sortOrder = currentSortOrder;
  });

  function clearInputFields() {
    $("#mssv").val("");
    $("#hoten").val("");
    $("#matkhau").val("");
  }

  $("[data-bs-target='#modal-add-user']").click(function (e) {
    e.preventDefault();
    $("#collapseAddSv").collapse("hide");
    clearInputFields();
  });

  // Khởi tạo flatpickr (jQuery UI datepicker của DHT không thuộc stack NestJS —
  // dùng flatpickr; dòng #datepicker.datepicker() gốc đã bỏ vì thiếu plugin).
  $(".flatpickr").flatpickr({
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "d/m/Y",
  });
});

// Pagination
const mainPagePagination = new Pagination();
mainPagePagination.option = {
  controller: "module",
  model: "NhomModel",
  limit: 10,
  manhom: manhom,
  filter: {},
  total: 0,
};
mainPagePagination.valuePage = { curPage: 1 };
mainPagePagination.getPagination(mainPagePagination.option, 1);
