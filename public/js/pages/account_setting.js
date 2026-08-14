// Port từ DHT_OneTest/public/js/pages/account_setting.js — đổi URL './' → '/'.
// KHÁC bản gốc: (1) tự đăng ký validator `emailWithDot` (bản PHP dùng rule này
// nhưng chỉ định nghĩa nó trong user.js — trang cá nhân không nạp user.js nên
// jQuery Validate ném lỗi); (2) chỉ gọi /account/uploadFile khi người dùng THẬT
// SỰ chọn ảnh mới (bản gốc luôn gửi FormData rỗng); (3) cập nhật luôn ảnh đại
// diện trên header sau khi lưu.
Dashmix.helpersOnLoad(["js-flatpickr", "jq-datepicker"]);
const accountId = $(".account_ID").attr("data-id");

// Custom validate: email phải có dấu chấm ở phần domain.
if (window.jQuery && jQuery.validator) {
  jQuery.validator.addMethod(
    "emailWithDot",
    function (value, element) {
      return this.optional(element) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    },
    "Phải nhập đúng định dạng email"
  );
}

Dashmix.onLoad(() =>
  class {
    static initValidation() {
      Dashmix.helpers("jq-validation"),
        jQuery(".form-change-password").validate({
          rules: {
            "current-password": {
              required: true,
            },
            "new-password": {
              required: true,
            },
            "password-new-confirm": {
              required: true,
              equalTo: "#new-password",
            },
          },
          messages: {
            "current-password": {
              required: "Vui lòng nhập mật khẩu hiện tại",
            },
            "new-password": {
              required: "Vui lòng nhập mật khẩu mới",
            },
            "password-new-confirm": {
              required: "Vui lòng nhập lại mật khẩu mới",
              equalTo: "Mật khẩu nhập lại không khớp",
            },
          },
        });

      jQuery(".form-update-profile").validate({
        rules: {
          "dm-profile-edit-name": {
            required: true,
          },
          "dm-profile-edit-email": {
            required: true,
            emailWithDot: true,
          },
        },
        messages: {
          "dm-profile-edit-name": {
            required: "Vui lòng không được để trống họ tên",
          },
          "dm-profile-edit-email": {
            required: "Vui lòng không được để trống email",
            emailWithDot:
              "Vui lòng nhập đúng định dạng email (ví dụ: ten@email.com)",
          },
        },
      });
    }

    static init() {
      this.initValidation();
    }
  }.init()
);

$("#update-password").click(function (e) {
  e.preventDefault();
  if ($(".form-change-password").valid()) {
    let currentPass = $("#current-password").val();
    let newPass = $("#new-password").val();
    $.ajax({
      type: "post",
      url: "/account/changePassword",
      data: {
        matkhaucu: currentPass,
        matkhaumoi: newPass,
      },
      dataType: "json",
      success: function (response) {
        if (response.valid === true) {
          Dashmix.helpers("jq-notify", {
            type: "success",
            icon: "fa fa-check me-1",
            message: `${response.message}`,
          });
          $("#current-password").val("");
          $("#new-password").val("");
          $("#password-new-confirm").val("");
        } else {
          Dashmix.helpers("jq-notify", {
            type: "danger",
            icon: "fa fa-times me-1",
            message: `${response.message}`,
          });
        }
      },
    });
  }
});

var oldName = $("#dm-profile-edit-name").val();
let email = $("#dm-profile-edit-email").val();
let oldBirthDay = $("#user_ngaysinh").val();
let oldGender = $('input[name="user_gender"]:checked').val();
let resultElement = $(".up-avatar");
let avatarProfile = $(".avatar-Profile");
let avatarAccount = $(".avatar-Account");

$("#dm-profile-edit-avatar").change(function (e) {
  const files = e.target.files;
  const file = files[0];
  if (!file) return;

  const fileReader = new FileReader();
  fileReader.readAsDataURL(file);

  fileReader.onload = function () {
    const url = fileReader.result;
    resultElement.html(
      `<img class="img-avatar" src="${url}" alt="${file.name}">`
    );
    avatarProfile.html(
      `<img class="img-avatar img-avatar128 img-avatar-thumb" src="${url}" alt="${file.name}">`
    );
    avatarAccount.html(
      `<img class="img-avatar img-avatar48 img-avatar-thumb" src="${url}"
                alt="${file.name}">`
    );
  };
});

$("#update-profile").click(function (e) {
  e.preventDefault();
  let newName = $("#dm-profile-edit-name").val();
  let newBirthDay = $("#user_ngaysinh").val();
  let newGender = $('input[name="user_gender"]:checked').val();
  let newAvatar = $("#dm-profile-edit-avatar").val();
  let newEmail = $("#dm-profile-edit-email").val();
  let check =
    newName != oldName ||
    newGender != oldGender ||
    newBirthDay != oldBirthDay ||
    email != newEmail ||
    newAvatar != "";
  if (check) {
    if ($(".form-update-profile").valid()) {
      $.ajax({
        type: "post",
        url: "/account/changeProfile",
        data: {
          hoten: $("#dm-profile-edit-name").val(),
          email: $("#dm-profile-edit-email").val(),
          ngaysinh: $("#user_ngaysinh").val(),
          gioitinh: $('input[name="user_gender"]:checked').val(),
        },
        dataType: "json",
        success: function (response) {
          if (response.valid == true) {
            Dashmix.helpers("jq-notify", {
              type: "success",
              icon: "fa fa-check me-1",
              message: `${response.message}`,
            });
            // Ghi nhận mốc mới để lần bấm sau không báo "phải thay đổi ít nhất 1 thông tin".
            oldName = newName;
            oldBirthDay = newBirthDay;
            oldGender = newGender;
            email = newEmail;
            showProfile(newName);
          } else {
            Dashmix.helpers("jq-notify", {
              type: "danger",
              icon: "fa fa-times me-1",
              message: `${response.message}`,
            });
          }
        },
      });
    }
  } else {
    Dashmix.helpers("jq-notify", {
      type: "danger",
      icon: "fa fa-times me-1",
      message: `Phải thay đổi ít nhất 1 thông tin`,
    });
  }

  saveFileAvatar();
});

function saveFileAvatar() {
  const file_data = $("#dm-profile-edit-avatar")[0].files;
  if (!file_data || !file_data[0]) return; // không chọn ảnh mới thì thôi

  const form_data = new FormData();
  form_data.append("file-img", file_data[0]);
  $.ajax({
    type: "post",
    url: "/account/uploadFile",
    data: form_data,
    contentType: false,
    processData: false,
    dataType: "json",
    success: function (response) {
      Dashmix.helpers("jq-notify", {
        type: response === true ? "success" : "danger",
        icon: response === true ? "fa fa-check me-1" : "fa fa-times me-1",
        message:
          response === true
            ? "Cập nhật ảnh đại diện thành công!"
            : "Ảnh đại diện không hợp lệ (chỉ nhận .jpg, .jpeg, .png)",
      });
      if (response === true) $("#dm-profile-edit-avatar").val("");
    },
  });
}

function showProfile(newName) {
  let html1 = "";
  let html2 = "";

  html1 += `
        <div class="ms-3 flex-grow-1 text-center text-md-start my-3 my-md-0 load-nameProfile">
            <h1 class="fs-4 fw-bold mb-1">${newName}</h1>
            <h2 class="fs-sm fw-medium text-muted mb-0">
                Chỉnh sửa hồ sơ
            </h2>
        </div>
        `;

  html2 += `
            <div class="pt-2 load-nameAccount">
                <a class="fw-semibold">
                ${newName}
                </a>
            </div>
        `;

  $(".load-nameProfile").html(html1);
  $(".load-nameAccount").html(html2);
}
