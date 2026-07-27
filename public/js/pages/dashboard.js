// Bê từ DHT_OneTest/public/js/pages/dashboard.js — chỉ đổi "./dashboard/..."
// thành "/dashboard/..." (NestJS phục vụ route ở path gốc).
$(document).ready(function () {
  $.ajax({
    type: "post",
    url: "/dashboard/checkEmail",
    success: function (response) {
      if (response == "") {
        let i = document.getElementById("modal-onboarding");
        new bootstrap.Modal(i).show(),
          i.addEventListener("shown.bs.modal", () => {
            const $slider = $("#modal-onboarding .js-slider");

            if ($slider.hasClass("slick-initialized")) {
              $slider.slick("unslick");
            }

            $slider.removeClass("js-slider-enabled");

            Dashmix.helpers("jq-slick");
          });
      } else {
        Dashmix.helpers("jq-slick");
      }
    },
  });
});

function validateEmail($email) {
  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return emailReg.test($email);
}

function checkEmailExist(email) {
  $.ajax({
    type: "post",
    url: "/dashboard/checkEmailExist",
    data: {
      email: email,
    },
    success: function (response) {
      let check = response;
      if (check == 0) {
        updateEmail(email);
      } else {
        Dashmix.helpers("jq-notify", {
          type: "danger",
          icon: "fa fa-times me-1",
          message: `Email đã tồn tài trong hệ thống!`,
        });
      }
    },
  });
}

function updateEmail(email) {
  $.ajax({
    type: "post",
    url: "/dashboard/updateEmail",
    data: {
      email: email,
    },
    success: function (response) {
      if (response) {
        Dashmix.helpers("jq-notify", {
          type: "success",
          icon: "fa fa-times me-1",
          message: `Cập nhật email thành công!!`,
        });
        $("#modal-onboarding").modal("hide");
      } else {
        Dashmix.helpers("jq-notify", {
          type: "danger",
          icon: "fa fa-times me-1",
          message: `Cập nhật email không thành công`,
        });
      }
    },
  });
}

$("#btn-email").click(function () {
  let email = $("#email").val();
  if (email == "") {
    Dashmix.helpers("jq-notify", {
      type: "danger",
      icon: "fa fa-times me-1",
      message: `Vui lòng không để trống email!`,
    });
  } else if (validateEmail(email)) {
    checkEmailExist(email);
  } else {
    Dashmix.helpers("jq-notify", {
      type: "danger",
      icon: "fa fa-times me-1",
      message: `Vui lòng điền đúng định dạng email`,
    });
  }
});
