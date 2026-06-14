// Ẩn/hiện nút theo quyền (RBAC phía client) — port phần button-gating của
// DHT_OneTest/public/js/permission.js. Phần thông báo (notification) sẽ bổ sung
// cùng module announcements ở Phase 6. URL đổi sang tuyệt đối cho route NestJS.
let role = [];
$.getJSON("/account/getRole", function (data) {
  role = data || {};
});

$(document).ajaxStop(function () {
  $("[data-role]").each(function () {
    const r = role[`${$(this).data("role")}`];
    if (r === undefined || !r.includes($(this).data("action"))) {
      $(this).remove();
    } else {
      $(this).addClass("show");
    }
  });
  $(".col-action").each(function () {
    if ($(this).children().length == 0) {
      $(this).remove();
    }
  });
  $(".col-header-action").each(function () {
    if ($(this).closest("table").find(".col-action").length != 0) {
      $(this).show();
    }
  });
});
