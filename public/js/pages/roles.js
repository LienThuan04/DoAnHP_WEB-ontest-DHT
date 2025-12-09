Dashmix.onLoad(() =>
  class {
    static initValidation() {
      Dashmix.helpers("jq-validation"),
        jQuery(".form_role").validate({
          rules: {
            "ten-nhom-quyen": {
              required: !0,
            },
          },
          messages: {
            "ten-nhom-quyen": {
              required: "Vui lòng nhập tên nhóm quyền",
            },
          },
        });
    }

    static init() {
      this.initValidation();
    }
  }.init()
);

$(document).ready(function () {
  function getDataForm() {
    let roles = [];
    $(".form_role input[type=checkbox]:checked").each(function () {
      let name = $(this).attr("name");
      let action = $(this).val();
      roles.push({ name: name, action: action });
    });
    return roles;
  }

  $("#save-role").click(function (e) {
    e.preventDefault();
    let roles = getDataForm();
    if ($(".form_role").valid()) {
      if (roles.length != 0) {
        $.ajax({
          type: "post",
          url: "./roles/add",
          data: {
            name: $("#ten-nhom-quyen").val(),
            roles: roles,
          },
          success: function (response) {
            console.log(response);
            if (response) {
              loadDataTable();
              $("#modal-add-role").modal("hide");
              Dashmix.helpers("jq-notify", {
                type: "success",
                icon: "fa fa-check me-1",
                message: "Tạo nhóm quyền thành công!",
              });
            } else {
              Dashmix.helpers("jq-notify", {
                type: "danger",
                icon: "fa fa-times me-1",
                message: "Tạo nhóm quyền không thành công!",
              });
            }
          },
        });
      } else {
        Dashmix.helpers("jq-notify", {
          type: "danger",
          icon: "fa fa-times me-1",
          message: "Bạn phải chọn quyền!",
        });
      }
    }
  });

  function loadDataTable() {
    let html = ``;
    $.getJSON("./roles/getAllSl", function (data) {
      data.forEach((item) => {
        html += `<tr>
                    <td class="text-center fs-sm"><strong>${item.manhomquyen}</strong></td>
                    <td>${item.tennhomquyen}</td>
                    <td class="text-center fs-sm">${item.soluong}</td>
                    <td class="text-center col-action">
                      <button data-role="nhomquyen" data-action="update" class="btn btn-sm btn-alt-secondary btn-show-update" data-id="${item.manhomquyen}" data-bs-toggle="tooltip" aria-label="Edit" data-bs-original-title="Edit">
                        <i class="fa fa-fw fa-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-alt-info btn-view-users" data-id="${item.manhomquyen}" data-bs-toggle="tooltip" data-bs-original-title="Xem thành viên" aria-label="Xem thành viên">
                        <i class="fa fa-fw fa-users"></i>
                        <span class="d-none d-sm-inline ms-1">Thành viên</span>
                      </button>
                      <button data-role="nhomquyen" data-action="delete" class="btn btn-sm btn-alt-secondary delete_roles" data-id="${item.manhomquyen}" data-bs-toggle="tooltip" aria-label="Delete"
                        data-bs-original-title="Delete">
                        <i class="fa fa-fw fa-times"></i>
                      </button>
                    </td>
                </tr>`;
      });
      $("#list-roles").html(html);
      $('[data-bs-toggle="tooltip"]').tooltip();
    });
  }

  $("[data-bs-target='#modal-add-role']").click(function (e) {
    e.preventDefault();
    $(".add-role-element").show();
    $(".update-role-element").hide();
  });

  let e = Swal.mixin({
    buttonsStyling: !1,
    target: "#page-container",
    customClass: {
      confirmButton: "btn btn-success m-1",
      cancelButton: "btn btn-danger m-1",
      input: "form-control",
    },
  });

  $(document).on("click", ".delete_roles", function () {
    let id = $(this).data("id");
    let index = $(this).data("index");
    e.fire({
      title: "Are you sure?",
      text: "Bạn có chắc chắn muốn xoá đề thi?",
      icon: "warning",
      showCancelButton: !0,
      customClass: {
        confirmButton: "btn btn-danger m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Vâng, tôi chắc chắn!",
      html: !1,
      preConfirm: (e) =>
        new Promise((e) => {
          setTimeout(() => {
            e();
          }, 50);
        }),
    }).then((t) => {
      if (t.value == true) {
        $.ajax({
          type: "post",
          url: "./roles/delete",
          data: {
            id: id,
          },
          success: function (response) {
            if (response) {
              e.fire("Deleted!", "Xóa nhóm quyền thành công!", "success");
              loadDataTable();
            } else {
              e.fire("Lỗi !", "Xoá nhóm quyền không thành công !)", "error");
            }
          },
        });
      }
    });
  });

  $("#modal-add-role").on("hidden.bs.modal", function () {
    $("#ten-nhom-quyen").val("");
    $("[type='checkbox']").prop("checked", false);
  });

  $(document).on("click", ".btn-show-update", function () {
    $(".add-role-element").hide();
    $(".update-role-element").show();
    let manhomquyen = $(this).data("id");
    $("[name='manhomquyen']").val(manhomquyen);

    $.ajax({
      type: "post",
      url: "./roles/getDetail",
      data: { manhomquyen: manhomquyen },
      dataType: "json",
      success: function (response) {
        $("#ten-nhom-quyen").val(response.name);

        // Reset tất cả checkbox
        $(".form_role input[type=checkbox]").prop("checked", false);

        $.each(response.detail, function (i, item) {
          if (item.chucnang === "view_monhoc") {
            $(`[name="view_monhoc"][value="${item.hanhdong}"]`).prop(
              "checked",
              true
            );
          } else {
            $(`[name="${item.chucnang}"][value="${item.hanhdong}"]`).prop(
              "checked",
              true
            );
          }
        });

        $("#modal-add-role").modal("show");
      },
    });
  });

  // Hiển thị danh sách người dùng của nhóm
  $(document).on("click", ".btn-view-users", function () {
    let manhom = $(this).data("id");
    $.ajax({
      type: "post",
      url: "./roles/getUsers",
      data: { manhomquyen: manhom },
      dataType: "json",
      success: function (response) {
        let html = "";
        if (response && response.length > 0) {
          response.forEach((u) => {
            const statusText = u.trangthai == 1 ? "Kích hoạt" : "Khóa";
            const toggleLabel = u.trangthai == 1 ? "Khóa" : "Kích hoạt";
            const toggleClass = u.trangthai == 1 ? "btn-danger" : "btn-success";
            html += `<tr data-user-id="${u.id}">
                                <td>${u.id}</td>
                                <td>${u.hoten}</td>
                                <td>${u.email}</td>
                                <td>
                                    <span class="status-badge">${statusText}</span>
                                    <button class="btn btn-sm ms-2 btn-toggle-status ${toggleClass}" data-id="${u.id}" data-status="${u.trangthai}">${toggleLabel}</button>
                                </td>
                            </tr>`;
          });
        } else {
          html = `<tr><td colspan="4" class="text-center">Không có người dùng</td></tr>`;
        }
        $("#list-role-users").html(html);
        $("#modal-role-users").modal("show");
      },
      error: function () {
        Dashmix.helpers("jq-notify", {
          type: "danger",
          icon: "fa fa-times me-1",
          message: "Lỗi khi tải danh sách người dùng",
        });
      },
    });
  });

  // Toggle user status from modal
  $(document).on("click", ".btn-toggle-status", function (e) {
    e.preventDefault();
    const btn = $(this);
    const id = btn.data("id");
    const current = parseInt(btn.data("status"));
    const newStatus = current === 1 ? 0 : 1;

    $.ajax({
      type: "post",
      url: "./user/setStatus",
      data: { id: id, status: newStatus },
      dataType: "json",
      success: function (resp) {
        if (resp && resp.success) {
          // update button and badge
          btn.data("status", newStatus);
          const badge = btn.closest("td").find(".status-badge");
          if (newStatus === 1) {
            btn.removeClass("btn-success").addClass("btn-danger");
            btn.text("Khóa");
            badge.text("Kích hoạt");
          } else {
            btn.removeClass("btn-danger").addClass("btn-success");
            btn.text("Kích hoạt");
            badge.text("Khóa");
          }
        } else {
          Dashmix.helpers("jq-notify", {
            type: "danger",
            icon: "fa fa-times me-1",
            message: "Thay đổi trạng thái thất bại",
          });
        }
      },
      error: function () {
        Dashmix.helpers("jq-notify", {
          type: "danger",
          icon: "fa fa-times me-1",
          message: "Lỗi server khi thay đổi trạng thái",
        });
      },
    });
  });

  $("#update-role-btn").click(function (e) {
    e.preventDefault();
    let roles = getDataForm();
    if ($(".form_role").valid()) {
      if (roles.length != 0) {
        $.ajax({
          type: "post",
          url: "./roles/edit",
          data: {
            id: $("[name='manhomquyen']").val(),
            name: $("#ten-nhom-quyen").val(),
            roles: roles,
          },
          success: function (response) {
            if (response) {
              loadDataTable();
              $("#modal-add-role").modal("hide");
              Dashmix.helpers("jq-notify", {
                type: "success",
                icon: "fa fa-check me-1",
                message: "Cập nhật nhóm quyền thành công!",
              });
            } else {
              Dashmix.helpers("jq-notify", {
                type: "danger",
                icon: "fa fa-times me-1",
                message: "Cập nhật nhóm quyền không thành công!",
              });
            }
          },
        });
      } else {
        Dashmix.helpers("jq-notify", {
          type: "danger",
          icon: "fa fa-times me-1",
          message: "Bạn phải chọn quyền!",
        });
      }
    }
  });

  loadDataTable();
});
