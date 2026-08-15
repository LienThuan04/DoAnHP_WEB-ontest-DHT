// Ẩn/hiện nút theo quyền (RBAC phía client) + chuông thông báo trên header —
// port DHT_OneTest/public/js/permission.js. URL đổi sang tuyệt đối cho NestJS.
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
  // Gỡ tiêu đề nhóm ở navbar khi mọi mục dưới nó đã bị ẩn — thay chỗ PHP
  // `build_navbar()` chỉ in heading nếu `count($nav['navbarItem']) > 0`.
  $(".nav-main .nav-main-heading").each(function () {
    if ($(this).nextUntil(".nav-main-heading", ".nav-main-item").length === 0) {
      $(this).remove();
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

// ── Chuông thông báo (port nguyên phần notification của permission.js gốc) ──
$(document).ready(function () {
  loadNotificationCount();
  $(".btn-show-notifications").on("click", function (e) {
    e.preventDefault();
    loadNotifications();
    markNotificationsAsRead();
  });

  function loadNotifications() {
    $.ajax({
      type: "post",
      url: "/teacher_announcement/getNotifications",
      dataType: "json",
      success: function (data) {
        showListNotifications(data);
      },
      error: function (xhr, status, error) {
        console.error("Lỗi AJAX:", status, error);
      },
    });
  }

  function markNotificationsAsRead() {
    $.ajax({
      type: "post",
      url: "/teacher_announcement/markAsRead",
      success: function () {
        console.log("Đã đánh dấu đã xem");
        updateNotificationCount(0);
      },
      error: function () {
        console.warn("Không đánh dấu được thông báo đã xem");
      },
    });
  }
  function loadNotificationCount() {
    $.ajax({
      type: "post",
      url: "/teacher_announcement/getUnreadCount",
      dataType: "json",
      success: function (data) {
        updateNotificationCount(data.count);
      },
      error: function () {
        console.warn("Không lấy được số lượng thông báo chưa đọc.");
      },
    });
  }

  function showListNotifications(notifications) {
    let html = "";
    if (notifications.length != 0) {
      notifications.forEach((notification) => {
        const thoigiantao = new Date(notification.thoigiantao);
        let displayDate;
        if (dateIsValid(thoigiantao)) {
          displayDate = formatDate(thoigiantao);
        }
        html += `
                <li>
                    <a class="d-flex text-dark py-2" href="javascript:void(0)">
                        <div class="flex-shrink-0 mx-3">
                            <img class="img-avatar img-avatar48" src="${avatarUrl(
                              notification.avatar
                            )}" alt="">
                        </div>
                        <div class="flex-grow-1 fs-sm pe-2">
                           <div class="truncate truncate--3">
  <span class="fw-semibold">${
    notification.hoten
  }</span> đã gửi một thông báo đến lớp học phần
  <span class="fw-semibold">${
    notification.tenmonhoc + " - " + notification.tennhom
  }</span>:
  <span class="fst-italic">${notification.noidung}</span>${
          notification.noidung.endsWith(".") ? "" : "."
        }
</div>
<div class="text-muted">${displayDate || notification.thoigiantao}</div>

                        </div>
                    </a>
                </li>
                `;
      });
    } else {
      html += `<p class="text-center">Không có thông báo</p>`;
    }
    $(".list-notifications").html(html);
  }

  function updateNotificationCount(count) {
    const badge = $("#notification-count");
    const bellIcon = $("#notification-bell-icon");

    badge.text(count);

    if (count > 0) {
      badge.show();
      bellIcon.addClass("bell-shake");
    } else {
      badge.hide();
      bellIcon.removeClass("bell-shake");
    }
  }

  function dateIsValid(date) {
    return !Number.isNaN(new Date(date).getTime());
  }

  function formatDate(date) {
    const calcDaysPassed = (date1, date2) =>
      Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));

    const daysPassed = calcDaysPassed(date, new Date());
    if (daysPassed === 0) return "Hôm nay";
    if (daysPassed === 1) return "Hôm qua";
    if (daysPassed <= 7) return `${daysPassed} ngày trước`;

    return new Intl.DateTimeFormat(navigator.language, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
});
