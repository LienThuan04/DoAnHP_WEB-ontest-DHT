Dashmix.helpersOnLoad(["jq-select2"]);
let isReadingFile = false;

// =============== QUẢN LÝ CKEDITOR THÔNG MINH ===============
let ckeditorInstances = {};

function destroyAllCKEditors() {
  Object.keys(CKEDITOR.instances).forEach((name) => {
    if (CKEDITOR.instances[name]) {
      CKEDITOR.instances[name].destroy(true);
    }
  });
  ckeditorInstances = {};
}
CKEDITOR.replace("option-content", {
  allowedContent: true,
  extraAllowedContent: "*[*]{*}(*)",
});

function initCKEditor(instanceName, config = {}) {
  const defaultConfig = {
    entities: false,
    basicEntities: false,
    entities_latin: false,
    entities_greek: false,
    enterMode: CKEDITOR.ENTER_P,
    shiftEnterMode: CKEDITOR.ENTER_BR,
    autoParagraph: false,
    allowedContent: true,
    // extraAllowedContent:
    //   "*(*);*[id,class,style,href,target,title,alt,src,data-*]",
    removeButtons: "",
    allowedContent: {
      "p b i u strong em sub sup br ul ol li img": true,
      span: { attributes: ["class"] },
      "h1 h2 h3 h4": true,
    },
    fillEmptyBlocks: false,
    height: 200,
    removePlugins: "elementspath",
    resize_enabled: false,
  };

  const finalConfig = { ...defaultConfig, ...config };

  if (CKEDITOR.instances[instanceName]) {
    CKEDITOR.instances[instanceName].destroy(true);
  }

  CKEDITOR.replace(instanceName, finalConfig);
  ckeditorInstances[instanceName] = true;
}

// Gọi 1 lần khi trang load
Dashmix.helpersOnLoad(["jq-select2"]);
destroyAllCKEditors(); // đảm bảo sạch
initCKEditor("js-ckeditor");
initCKEditor("option-content");
initCKEditor("passage-content");
initCKEditor("reading-question-content");
Dashmix.onLoad(() =>
  class {
    static initValidation() {
      Dashmix.helpers("jq-validation"),
        jQuery("#form_add_question").validate({
          rules: {
            "mon-hoc": {
              required: true,
            },
            chuong: {
              required: true,
            },
            dokho: {
              required: true,
            },
            "js-ckeditor": {
              required: function () {
                return $("#loai-cau-hoi").val() !== "reading";
              },
            },
            "passage-content": {
              required: function () {
                return $("#loai-cau-hoi").val() === "reading";
              },
            },
          },
          messages: {
            "mon-hoc": {
              required: "Vui lòng chọn môn học",
            },
            chuong: {
              required: "Vui lòng chọn chương.",
            },
            dokho: {
              required: "Vui lòng chọn mức độ.",
            },
            "js-ckeditor": {
              required: "Vui lòng không để trống câu hỏi.",
            },
            "passage-content": {
              required: "Vui lòng nhập đoạn ngữ liệu.",
            },
          },
          errorClass: "is-invalid",
          validClass: "is-valid",
        });
    }
    static init() {
      this.initValidation();
    }
  }.init()
);

function showData(data) {
  let html = "";

  data.forEach((question) => {
    let dokho =
      { 1: "Cơ bản", 2: "Trung bình", 3: "Nâng cao" }[question.dokho] ||
      "Không xác định";

    // Hiển thị HTML thật
    let contentHtml = question.noidung || "";

    // Tạo badge
    let badge = "";
    if (question.loai === "reading") {
      let numSub = question.num_subquestions || 0;
      badge = `<span class="badge bg-primary ms-2">Đoạn văn · ${numSub} câu</span>`;
    } else if (question.loai === "essay") {
      badge = `<span class="badge bg-warning ms-2">Tự luận</span>`;
    } else {
      badge = `<span class="badge bg-success ms-2">Trắc nghiệm</span>`;
    }

    html += `
      <tr>
        <td class="text-center fs-sm"><strong>${
          question.macauhoi ?? ""
        }</strong></td>

        <td class="fs-sm">
          <div class="d-flex align-items-start gap-2">
            <div class="question-preview">${contentHtml}</div>
            ${badge}
          </div>
          <div class="question-full d-none">${contentHtml}</div>
        </td>

        <td class="d-none d-xl-table-cell fs-sm">${
          question.tenmonhoc ?? ""
        }</td>
        <td class="d-none d-sm-table-cell fs-sm"><strong>${dokho}</strong></td>

        <td class="text-center col-action">
        
          <!-- Nút sửa -->
          <button 
            class="btn btn-sm btn-alt-secondary btn-edit-question"
            data-id="${question.macauhoi}"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Chỉnh sửa"
          >
            <i class="fa fa-pencil"></i>
          </button>

          <!-- Nút xóa -->
          <button 
            class="btn btn-sm btn-alt-secondary btn-delete-question"
            data-id="${question.macauhoi}"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title="Xóa"
          >
            <i class="fa fa-times"></i>
          </button>

        </td>
      </tr>`;
  });

  // Đổ HTML vào bảng
  $("#listQuestion").html(html);

  // Khởi tạo tooltip (Bootstrap 5) + FIX overflow table-responsive
  document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => {
    new bootstrap.Tooltip(el, { container: "body" });
  });
}

let options = [];
let readingQuestions = [];
let questions = [];
let isModified = false;
let autoSaveTimer = null;

$(document).ready(function () {
  // Initialize Select2
  $(".js-select2").select2();
  $("#main-page-loai").select2();
  $("#loai-cau-hoi").select2({
    dropdownParent: $("#modal-add-question"),
  });
  $("#mon-hoc").select2({
    dropdownParent: $("#modal-add-question"),
  });
  $("#chuong").select2({
    dropdownParent: $("#modal-add-question"),
  });
  $("#dokho").select2({
    dropdownParent: $("#modal-add-question"),
  });
  $("#monhocfile").select2({
    dropdownParent: $("#modal-add-question"),
  });
  $("#chuongfile").select2({
    dropdownParent: $("#modal-add-question"),
  });

  // Toggle option form buttons
  $("[data-bs-target='#add_option']").on("click", function () {
    $("#update-option").hide();
    $("#save-option").show();
  });

  // Toggle form sections based on question type
  function toggleQuestionType(type) {
    // Ẩn tất cả trước
    $("#mcq-options-area").hide();
    $("#add_option").collapse("hide");

    $("#essay-area").hide();
    $("#passage-area").hide();
    $("#reading-questions-area").hide();
    $("#question-content-area").show();

    if (type === "mcq") {
      $("#mcq-options-area").show();
    } else if (type === "essay") {
      $("#mcq-options-area").hide();
      $("#essay-area").show();
    } else if (type === "reading") {
      $("#mcq-options-area").hide();
      $("#list-options").html("");
      options = [];

      $("#passage-area").show();
      $("#reading-questions-area").show();
      $("#question-content-area").hide();
    }
  }

  // Initial toggle
  toggleQuestionType($("#loai-cau-hoi").val());

  // Handle question type change
  $("#loai-cau-hoi").on("change", function () {
    toggleQuestionType($(this).val());
  });

  // Preview ảnh phương án khi chọn file mới (cho trắc nghiệm trong form add_option)
  $("#option-image").on("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $("#option-image-preview").html(`
          <div class="position-relative d-inline-block">
            <img src="${e.target.result}" class="img-thumbnail" style="max-width:120px; max-height:80px; object-fit:contain;">
            <button type="button" class="btn btn-danger btn-xs position-absolute top-0 end-0 btn-delete-option-image-temp" style="transform: translate(50%, -50%); font-size: 10px; padding: 2px 6px;">
              <i class="fa fa-times"></i>
            </button>
          </div>
        `);
      };
      reader.readAsDataURL(file);
    } else {
      $("#option-image-preview").html(
        '<small class="text-muted">Không có ảnh</small>'
      );
    }
  });

  // Xóa ảnh tạm trong form add_option
  $(document).on("click", ".btn-delete-option-image-temp", function () {
    $("#option-image-preview").html(
      '<small class="text-muted">Không có ảnh</small>'
    );
    $("#option-image").val("");
    // Nếu đang update, set flag delete cho option
    const index = $("#update-option").data("id");
    if (index !== undefined) {
      options[index].delete_image = true;
      options[index].image = null;
      options[index].file = null;
    }
  });

  // Save MCQ option (thêm mới)
  $("#save-option").click(function (e) {
    e.preventDefault();
    let content_option = CKEDITOR.instances["option-content"].getData();
    let true_option = $("#true-option").prop("checked");
    let imageFile = $("#option-image")[0]?.files[0];

    let option = {
      content: content_option,
      check: true_option,
      image: null,
      file: imageFile || null,
      delete_image: false, // Flag delete mặc định false
    };

    if (!imageFile) {
      options.push(option);
      $("#add_option").collapse("hide");
      resetOptionForm();
      showOptions(options);
      return;
    }

    let reader = new FileReader();
    reader.onload = function (e) {
      option.image = e.target.result;
      options.push(option);
      console.log("Saved option with image:", option);
      $("#add_option").collapse("hide");
      resetOptionForm();
      showOptions(options);
    };
    reader.readAsDataURL(imageFile);
  });

  // Update MCQ option (cập nhật)
  $("#update-option").click(function (e) {
    e.preventDefault();

    let index = $(this).data("id");

    options[index].content = CKEDITOR.instances["option-content"]
      .getData()
      .trim();
    options[index].check = $("#true-option").prop("checked") ? 1 : 0;

    let imageFile = $("#option-image")[0]?.files[0];

    if (imageFile) {
      let reader = new FileReader();
      reader.onload = function (e) {
        options[index].image = e.target.result;
        options[index].file = imageFile;
        options[index].delete_image = false; // Reset flag nếu upload mới
        showOptions(options);
        resetOptionForm();
        $("#add_option").collapse("hide");
      };
      reader.readAsDataURL(imageFile);
    } else {
      // Nếu không upload mới, giữ flag delete nếu đã xóa trước đó
      showOptions(options);
      resetOptionForm();
      $("#add_option").collapse("hide");
    }
  });

  function escapeHT(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Show MCQ options (danh sách)
  function showOptions(options) {
    let html = "";
    options.forEach((item, i) => {
      let imgHtml = '<small class="text-muted">Không có ảnh</small>';
      if (item.image) {
        imgHtml = `
            <div class="position-relative d-inline-block">
                <img src="${item.image}" class="img-thumbnail" style="max-width:120px; max-height:80px; object-fit:contain;">
                <button type="button" class="btn btn-danger btn-xs position-absolute top-0 end-0 btn-delete-option-image" data-id="${i}" style="transform: translate(50%, -50%); font-size: 10px; padding: 2px 6px;">
                    <i class="fa fa-times"></i>
                </button>
            </div>`;
      }

      html += `<tr>
            <th class="text-center">${i + 1}</th>
            <td class="option-content-cell" data-index="${i}">${
        item.content
      }</td>
            <td class="text-center">${imgHtml}</td>
            <td class="text-center">
                <input type="radio" class="form-check-input" name="da-dung" data-id="${i}" ${
        item.check ? "checked" : ""
      }>
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-alt-secondary btn-edit-option" data-id="${i}"><i class="fa fa-pencil-alt"></i></button>
                <button class="btn btn-sm btn-alt-secondary btn-delete-option" data-id="${i}"><i class="fa fa-times"></i></button>
            </td>
        </tr>`;
    });

    $("#list-options").html(html);

    // Bắt sự kiện sửa
    $(".btn-edit-option")
      .off("click")
      .on("click", function () {
        const index = $(this).data("id");
        $("#update-option").show().data("id", index);
        $("#save-option").hide();
        $("#add_option").collapse("show");
        CKEDITOR.instances["option-content"].setData(options[index].content);
        $("#true-option").prop("checked", options[index].check);
        $("#option-image").val("");
        // Load preview ảnh cũ nếu có
        if (options[index].image) {
          $("#option-image-preview").html(`
            <div class="position-relative d-inline-block">
              <img src="${options[index].image}" class="img-thumbnail" style="max-width:120px; max-height:80px; object-fit:contain;">
              <button type="button" class="btn btn-danger btn-xs position-absolute top-0 end-0 btn-delete-option-image-temp" style="transform: translate(50%, -50%); font-size: 10px; padding: 2px 6px;">
                <i class="fa fa-times"></i>
              </button>
            </div>
          `);
        } else {
          $("#option-image-preview").html(
            '<small class="text-muted">Không có ảnh</small>'
          );
        }
        setTimeout(() => {
          document.getElementById("add_option").scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 300);
      });
  }

  // READING
  function showReadingQuestions() {
    let html = "";

    readingQuestions.forEach((question, index) => {
      // --- Dòng câu hỏi ---
      html += `
      <tr class="question-row">
        <td class="text-center align-top">${index + 1}</td>
        <td class="align-top"><strong>${question.content}</strong></td>
        <td></td>
        <td></td>
        <td class="text-center align-top">
          <div class="btn-group">
            <button class="btn btn-sm btn-alt-secondary btn-edit-reading-question"
                    data-id="${index}" title="Chỉnh sửa">
                <i class="fa fa-pencil-alt"></i>
            </button>
            <button class="btn btn-sm btn-alt-secondary btn-delete-reading-question"
                    data-id="${index}" title="Xóa">
                <i class="fa fa-times"></i>
            </button>
          </div>
        </td>
      </tr>
    `;

      // --- Các phương án ---
      let correctRendered = false;
      question.options.forEach((opt, i) => {
        let isCorrect = "";
        let checkedAttr = "";

        if (opt.check && !correctRendered) {
          isCorrect = "correct-answer";
          checkedAttr = "checked";
          correctRendered = true;
        }

        const optionLetter = String.fromCharCode(65 + i);

        html += `
        <tr class="option-row">
          <td></td>
          <td></td>
          <td class="ps-4">${optionLetter}. ${opt.content}</td>
          <td class="text-center">
            <input type="radio" name="reading-da-${index}"
                   class="correct-radio ${isCorrect}"
                   ${checkedAttr}>
          </td>
          <td></td>
        </tr>
      `;
      });
    });

    $("#reading-questions-list").html(html);
  }

  // Reset MCQ option form
  function resetOptionForm() {
    CKEDITOR.instances["option-content"].setData("");
    $("#true-option").prop("checked", false);
    $("#option-image").val("");
    $("#option-image-preview").html(
      '<small class="text-muted">Không có ảnh</small>'
    );
  }

  // Edit MCQ option
  $(document).on("click", ".btn-edit-option", function () {
    let index = $(this).data("id");
    $("#update-option").show();
    $("#save-option").hide();
    $("#update-option").data("id", index);
    $("#add_option").collapse("show");
    CKEDITOR.instances["option-content"].setData(options[index].content);
    $("#true-option").prop("checked", options[index].check);
    $("#option-image").val("");
    console.log("Editing option:", options[index]);
    setTimeout(() => {
      document.getElementById("add_option").scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  });

  // Delete MCQ option
  $(document).on("click", ".btn-delete-option", function () {
    let index = $(this).data("id");
    let e = Swal.mixin({
      buttonsStyling: false,
      target: "#page-container",
      customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-danger m-1",
        input: "form-control",
      },
    });

    e.fire({
      title: "Are you sure?",
      text: "Bạn có chắc chắn muốn xoá câu trả lời?",
      icon: "warning",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-danger m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Vâng, tôi chắc chắn!",
      html: false,
      preConfirm: () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 50);
        }),
    }).then((result) => {
      if (result.value) {
        e.fire("Deleted!", "Xóa câu trả lời thành công!", "success");
        options.splice(index, 1);
        showOptions(options);
      }
    });
  });

  // Update correct answer for MCQ
  $(document).on("change", "[name='da-dung']", function () {
    let index = $(this).data("id");
    options.forEach((item) => {
      item.check = false;
    });
    options[index].check = true;
  });

  // Add Reading Option
  $("#add-reading-option").on("click", function () {
    let optionHtml = `
<div class="mb-2 reading-option-item d-flex align-items-start gap-2">
  <div class="form-check mt-2">
      <input type="radio" name="reading-correct" class="form-check-input">
      <label class="form-check-label">Đáp án đúng</label>
  </div>
  <textarea class="form-control reading-option-content" rows="2" placeholder="Nhập nội dung đáp án"></textarea>
  <button type="button" class="btn btn-sm btn-danger btn-remove-reading-option">
      <i class="fa fa-times"></i>
  </button>
</div>`;
    $("#reading-question-options").append(optionHtml);
  });

  // Remove Reading Option
  $(document).on("click", ".btn-remove-reading-option", function () {
    $(this).closest(".reading-option-item").remove();
  });

  // Save Reading Question
  $("#save-reading-question").on("click", function () {
    let questionContent =
      CKEDITOR.instances["reading-question-content"].getData();
    let options = [];

    $(".reading-option-item").each(function () {
      let content = $(this).find(".reading-option-content").val();
      let check = $(this).find("input[type=radio]").prop("checked");
      if (content) options.push({ content: content, check: check });
    });

    if (!questionContent || options.length === 0) {
      Dashmix.helpers("jq-notify", {
        type: "danger",
        icon: "fa fa-times me-1",
        message: "Vui lòng nhập đoạn ngữ liệu và ít nhất một câu hỏi.",
      });
      return;
    }

    readingQuestions.push({
      content: questionContent,
      options: options,
    });

    showReadingQuestions();
    resetReadingQuestionForm();
    $("#add_reading_question").collapse("hide");
  });

  // Show Reading Questions List
  function showReadingQuestions() {
    let html = "";

    readingQuestions.forEach((question, index) => {
      const questionImage = question.image
        ? `<img src="${question.image}" class="img-thumbnail mt-2" style="max-width: 300px; max-height: 200px; object-fit: contain;">`
        : "";

      html += `
      <tr class="question-row">
        <td class="text-center align-top">${index + 1}</td>
        <td class="align-top">
          <strong>${question.content}</strong>
          ${questionImage}
        </td>
        <td></td>
        <td></td>
        <td class="text-center align-top">
          <div class="btn-group">
            <button class="btn btn-sm btn-alt-secondary btn-edit-reading-question" data-id="${index}">
                <i class="fa fa-pencil-alt"></i>
            </button>
            <button class="btn btn-sm btn-alt-secondary btn-delete-reading-question" data-id="${index}">
                <i class="fa fa-times"></i>
            </button>
          </div>
        </td>
      </tr>`;

      question.options.forEach((opt, i) => {
        const optionLetter = String.fromCharCode(65 + i);
        const optImage = opt.image
          ? `<img src="${opt.image}" class="img-thumbnail mt-1" style="max-width: 100px; height: 60px; object-fit: contain;">`
          : "";

        html += `
        <tr class="option-row">
          <td></td>
          <td></td>
          <td class="ps-4">
            ${optionLetter}. ${opt.content}
            ${optImage}
          </td>
          <td class="text-center">
            <input type="radio" name="reading-da-${index}" class="correct-radio" ${
          opt.check ? "checked" : ""
        } disabled>
          </td>
          <td></td>
        </tr>`;
      });
    });

    $("#reading-questions-list").html(html);
  }

  // Reset Reading Question Form
  function resetReadingQuestionForm() {
    CKEDITOR.instances["reading-question-content"].setData("");
    $("#reading-question-options").empty();
  }

  // Edit Reading Question
  $(document).on("click", ".btn-edit-reading-question", function () {
    let index = $(this).data("id");
    let q = readingQuestions[index];

    CKEDITOR.instances["reading-question-content"].setData(q.content);
    $("#reading-question-options").empty();

    q.options.forEach((opt) => {
      let optionHtml = `
<div class="mb-2 reading-option-item d-flex align-items-start gap-2">
  <div class="form-check mt-2">
    <input type="radio" name="reading-correct" class="form-check-input" ${
      opt.check ? "checked" : ""
    }>
    <label class="form-check-label">Đáp án đúng</label>
  </div>
  <textarea class="form-control reading-option-content" rows="2">${
    opt.content
  }</textarea>
  <button type="button" class="btn btn-sm btn-danger btn-remove-reading-option mt-1">Xóa</button>
</div>`;
      $("#reading-question-options").append(optionHtml);
    });

    $("#add_reading_question").collapse("show");
    readingQuestions.splice(index, 1);
    showReadingQuestions();
    setTimeout(() => {
      document.getElementById("add_reading_question").scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  });

  // Delete Reading Question
  $(document).on("click", ".btn-delete-reading-question", function () {
    let index = $(this).data("id");
    Swal.fire({
      title: "Are you sure?",
      text: "Bạn có chắc chắn muốn xoá câu hỏi này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Vâng, tôi chắc chắn!",
      cancelButtonText: "Huỷ",
    }).then((result) => {
      if (result.isConfirmed) {
        readingQuestions.splice(index, 1);
        showReadingQuestions();
        Swal.fire("Deleted!", "Xóa câu hỏi thành công!", "success");
      }
    });
  });

  // Load subjects
  $.get(
    "./subject/getSubjectAssignment",
    function (data) {
      let html = '<option value="0">Tất cả chương</option>';
      data.forEach((item) => {
        html += `<option value="${item.mamonhoc}">${item.tenmonhoc}</option>`;
      });
      $(".data-monhoc").html(html);
      $("#main-page-monhoc").html(html).val("").trigger("change");
    },
    "json"
  );

  // Load chapters
  $(".data-monhoc").on("change", function () {
    let selectedValue = $(this).val();
    let id = $(this).data("tab");
    let html = '<option value="0">Tất cả chương</option>';
    $.ajax({
      type: "post",
      url: "./subject/getAllChapter",
      data: {
        mamonhoc: selectedValue,
      },
      dataType: "json",
      success: function (data) {
        data.forEach((item) => {
          html += `<option value="${item.machuong}">${item.tenchuong}</option>`;
        });
        $(`.data-chuong[data-tab="${id}"]`)
          .html(html)
          .val("0")
          .trigger("change");
      },
    });
  });

  // Filter by subject
  $("#main-page-monhoc").on("change", function () {
    let mamonhoc = $(this).val();
    let id = $(this).data("tab");
    let html = '<option value="0">Tất cả chương</option>';
    $.ajax({
      type: "post",
      url: "./subject/getAllChapter",
      data: {
        mamonhoc: mamonhoc,
      },
      dataType: "json",
      success: function (data) {
        data.forEach((item) => {
          html += `<option value="${item.machuong}">${item.tenchuong}</option>`;
        });
        // main page chapter select has id #main-page-chuong — update it directly and refresh select2
        $("#main-page-chuong").html(html).val("0").trigger("change");
      },
    });

    $("#main-page-dokho").val(0).trigger("change");
    mainPagePagination.option.filter = {};
    mainPagePagination.option.filter.mamonhoc = mamonhoc;
    mainPagePagination.getPagination(
      mainPagePagination.option,
      mainPagePagination.valuePage.curPage
    );
  });

  // Filter by chapter
  $("#main-page-chuong").on("change", function () {
    const machuong = $(this).val();
    mainPagePagination.option.filter.machuong = machuong;
    mainPagePagination.getPagination(
      mainPagePagination.option,
      mainPagePagination.valuePage.curPage
    );
  });

  // Filter by difficulty
  $("#main-page-dokho").on("change", function () {
    const dokho = +$(this).val();
    mainPagePagination.option.filter.dokho = dokho;
    mainPagePagination.getPagination(
      mainPagePagination.option,
      mainPagePagination.valuePage.curPage
    );
  });

  // Filter by question type
  $("#main-page-loai").on("change", function () {
    const loai = $(this).val();
    mainPagePagination.option.filter.loai = loai && loai !== "0" ? loai : "";
    mainPagePagination.getPagination(
      mainPagePagination.option,
      mainPagePagination.valuePage.curPage
    );
  });

  // Load môn học cho modal nhập file
  function loadMonHocForFileImport() {
    $.get(
      "./subject/getSubjectAssignment",
      function (data) {
        let html = '<option value="">Chọn môn học</option>';
        data.forEach((item) => {
          html += `<option value="${item.mamonhoc}">${item.tenmonhoc}</option>`;
        });
        $("#monhocfile").html(html).val("").trigger("change");
      },
      "json"
    );
  }

  // Load chương khi chọn môn trong modal nhập file
  $("#monhocfile").on("change", function () {
    const mamonhoc = $(this).val();
    let html = '<option value="">Chọn chương</option>';

    if (!mamonhoc) {
      $("#chuongfile").html(html);
      return;
    }

    $.post(
      "./subject/getAllChapter",
      { mamonhoc: mamonhoc },
      function (data) {
        data.forEach((item) => {
          html += `<option value="${item.machuong}">${item.tenchuong}</option>`;
        });
        $("#chuongfile").html(html);
      },
      "json"
    );
  });

  // Gọi khi mở modal nhập file
  $("#modal-add-question").on("shown.bs.modal", function () {
    if (
      $("#btabs-alt-static-file").hasClass("active") ||
      $("#content-file").is(":visible")
    ) {
      loadMonHocForFileImport();
    }
  });

  // =================== AUTO SAVE KHI SỬA TRÊN PREVIEW ===================
  function autoSaveChanges() {
    isModified = true;

    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
      if (questions.length === 0) return;

      $.post(
        "./question/updateQuestionJSON",
        {
          questions: JSON.stringify(questions),
        },
        function (res) {
          if (res.status === "success") {
            questions = res.questions || questions;
            Dashmix.helpers("jq-notify", {
              type: "success",
              icon: "fa fa-check-circle me-1",
              message: "Đã lưu thay đổi tự động!",
            });
          }
        },
        "json"
      ).fail(() => {
        Dashmix.helpers("jq-notify", {
          type: "danger",
          message: "Lỗi tự động lưu!",
        });
      });
    }, 1200);
  }

  // Gắn event cho preview edits
  $("#preview-cau-hoi").on(
    "change input",
    `
    .level-select,
    .level-select-passage,
    .answer-radio,
    input[type="text"],
    textarea,
    input[data-type="title"],
    textarea[data-type="passage"],
    input[data-type="question"],
    textarea[data-type="question"],
    input[data-type="option"]
  `,
    autoSaveChanges
  );

  // =================== UPLOAD FILE .DOCX ===================
  $("#file-cau-hoi").on("change", function (e) {
    const file = this.files[0];
    const loaiCauHoi = $("#loaicauhoifile").val();

    if (!loaiCauHoi) {
      Dashmix.helpers("jq-notify", {
        type: "warning",
        message: "Chọn loại câu hỏi trước khi thêm file!",
      });
      this.value = "";
      return;
    }
    if (!file || !file.name.toLowerCase().endsWith(".docx")) {
      Dashmix.helpers("jq-notify", {
        type: "danger",
        message: "Chỉ chấp nhận file .docx!",
      });
      this.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("fileToUpload", file);

    const urlMap = {
      reading: "./question/xulydoanvan",
      mcq: "./question/xulytracnghiem",
      essay: "./question/xulytuluan",
    };

    Dashmix.layout("header_loader_on");
    $("#preview-cau-hoi").empty().hide();
    $("#nhap-file").prop("disabled", true).html("Đang xử lý...");

    $.ajax({
      url: urlMap[loaiCauHoi] || urlMap.mcq,
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      cache: false,
      dataType: "json",
      success: function (res) {
        if (!Array.isArray(res) || res.length === 0) {
          Dashmix.helpers("jq-notify", {
            type: "warning",
            message: "File trống hoặc sai định dạng!",
          });
          return;
        }
        Dashmix.helpers("jq-notify", {
          type: "success",
          icon: "fa fa-check me-1",
          message: "Đã đọc file thành công!",
        });

        questions = JSON.parse(JSON.stringify(res));
        isModified = false;
        renderPreview(questions);
        enableImportButton(res.length);
      },
      error: function (xhr) {
        let msg = "Lỗi xử lý file Word!";
        try {
          msg += " " + JSON.parse(xhr.responseText).error;
        } catch (e) {}
        Dashmix.helpers("jq-notify", { type: "danger", message: msg });
      },
      complete: () => {
        Dashmix.layout("header_loader_off");
        // Reset nút import về trạng thái ban đầu nếu không success đầy đủ
        if (questions.length === 0) {
          // Chỉ reset nếu chưa có questions mới (error hoặc empty)
          $("#nhap-file")
            .prop("disabled", true)
            .html("Thêm vào hệ thống")
            .removeClass("btn-success fw-bold")
            .addClass("btn-secondary");
        }
      },
    });
  });

  // =================== RENDER PREVIEW ===================
  function renderPreview(data) {
    const levelText = {
      1: "Dễ",
      2: "TB",
      3: "Khó",
    };

    let html = `
<div class="block block-rounded border border-2 border-success shadow mb-4">
  <div class="block-header bg-success-subtle">
    <h3 class="block-title text-success fw-bold">
      <i class="fa fa-check-double me-2"></i>
      Đã thêm thành công ${data.length} mục từ file Word
    </h3>
  </div>
  <div class="block-content">`;

    data.forEach((item, idx) => {
      if (item.type === "reading") {
        html += `
<div class="mb-5 p-4 bg-light rounded border-start border-primary border-5 shadow">
  <div class="mb-3 d-flex align-items-center justify-content-between">
    <div>
      <label class="form-label fw-bold text-primary">Tiêu đề đoạn văn:</label>
      <input type="text" class="form-control mb-2" value="${escapeHtml(
        item.title || ""
      )}" data-type="title" data-index="${idx}">
    </div>
    <div>
      <label class="form-label fw-bold text-primary">Mức độ đọc hiểu:</label>
      <select class="form-select level-select-passage" data-index="${idx}">
        ${[1, 2, 3]
          .map(
            (l) =>
              `<option value="${l}" ${item.level === l ? "selected" : ""}>${
                levelText[l]
              }</option>`
          )
          .join("")}
      </select>
    </div>
  </div>
  <div class="mb-3">
    <label class="form-label fw-bold">Đoạn văn:</label>
    <textarea class="form-control mb-2" rows="5" data-type="passage" data-index="${idx}">${escapeHtml(
          item.passage
        )}</textarea>
  </div>
  <div class="mb-3">
    <table class="table table-bordered table-striped">
      <thead class="table-light">
        <tr>
          <th>#</th>
          <th>Câu hỏi</th>
          <th>Phương án & Đáp án</th>
          <th>Mức độ</th>
        </tr>
      </thead>
      <tbody>`;

        item.questions.forEach((q, qidx) => {
          html += `
<tr>
  <td>${idx + 1}.${qidx + 1}</td>
  <td>
    <input type="text" class="form-control" value="${escapeHtml(
      q.question
    )}" data-type="question" data-index="${idx}" data-qindex="${qidx}">
  </td>
  <td>
    ${q.option
      .map((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        const isAnswer = q.answer === i + 1;
        return `
      <div class="d-flex align-items-center mb-1 p-1 rounded ${
        isAnswer ? "border border-3 border-primary" : ""
      }">
        <input class="form-check-input me-2 answer-radio" type="radio" name="answer-${idx}-${qidx}" data-index="${idx}" data-qindex="${qidx}" data-oid="${i}" ${
          isAnswer ? "checked" : ""
        }>
        <span class="me-2 fw-bold">${letter}</span>
        <input type="text" class="form-control" data-type="option" data-index="${idx}" data-qindex="${qidx}" data-oid="${i}" value="${escapeHtml(
          opt
        )}">
      </div>`;
      })
      .join("")}
  </td>
  <td class="text-center">
    <span class="fw-bold text-primary display-level">${
      levelText[q.level]
    }</span>
  </td>
</tr>`;
        });

        html += `</tbody></table></div></div>`;
      } else if (item.type === "mcq") {
        html += `
<div class="mb-4 p-3 bg-light rounded border-start border-success border-5 shadow">
  <div class="mb-2 fw-bold text-success">Câu ${idx + 1} 
  (Trắc nghiệm, Mức độ <span class="display-level">${
    levelText[item.level]
  }</span>):</div>
  
  <input type="text" class="form-control mb-2" data-type="question" data-index="${idx}" value="${escapeHtml(
          item.question
        )}">

  <div class="mb-2">
    ${item.option
      .map((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        const isAnswer = item.answer === i + 1;
        return `
      <div class="d-flex align-items-center mb-1 p-1 rounded ${
        isAnswer ? "border border-3 border-primary" : ""
      }">
        <input class="form-check-input me-2 answer-radio" type="radio" name="answer-${idx}" data-index="${idx}" data-oid="${i}" ${
          isAnswer ? "checked" : ""
        }>
        <span class="me-2 fw-bold">${letter}</span>
        <input type="text" class="form-control" data-type="option" data-index="${idx}" data-oid="${i}" value="${escapeHtml(
          opt
        )}">
      </div>`;
      })
      .join("")}
  </div>

  <div class="mb-2">
    <label>Mức độ:</label>
    <select class="form-select level-select" data-index="${idx}">
      ${[1, 2, 3]
        .map(
          (l) =>
            `<option value="${l}" ${item.level === l ? "selected" : ""}>${
              levelText[l]
            }</option>`
        )
        .join("")}
    </select>
  </div>
</div>`;
      } else if (item.type === "essay") {
        html += `
<div class="mb-3 p-3 bg-light rounded border-start border-warning border-5 shadow">
  <div class="fw-bold text-warning">Câu ${
    idx + 1
  } (Tự luận, Mức độ <span class="display-level">${
          levelText[item.level]
        }</span>):</div>

  <textarea class="form-control mt-1" rows="3" data-type="question" data-index="${idx}">${escapeHtml(
          item.question
        )}</textarea>

  <div class="mt-1">
    <label>Mức độ:</label>
    <select class="form-select level-select" data-index="${idx}">
      ${[1, 2, 3]
        .map(
          (l) =>
            `<option value="${l}" ${item.level === l ? "selected" : ""}>${
              levelText[l]
            }</option>`
        )
        .join("")}
    </select>
  </div>
</div>`;
      }
    });

    html += `</div></div>`;
    $("#preview-cau-hoi").html(html).slideDown();

    $("#preview-cau-hoi").on("change", "input[data-type='title']", function () {
      const idx = $(this).data("index");
      questions[idx].title = $(this).val();
      autoSaveChanges();
    });

    $("#preview-cau-hoi").on(
      "change",
      "textarea[data-type='passage']",
      function () {
        const idx = $(this).data("index");
        questions[idx].passage = $(this).val();
        autoSaveChanges();
      }
    );

    $("#preview-cau-hoi").on(
      "change",
      "input[data-type='question'], textarea[data-type='question']",
      function () {
        const idx = $(this).data("index");
        const qidx = $(this).data("qindex");
        const newVal = $(this).val();

        if (qidx !== undefined) {
          questions[idx].questions[qidx].question = newVal;
        } else {
          questions[idx].question = newVal;
        }
        autoSaveChanges();
      }
    );

    $("#preview-cau-hoi").on(
      "change",
      "input[data-type='option']",
      function () {
        const idx = $(this).data("index");
        const qidx = $(this).data("qindex");
        const oid = $(this).data("oid");
        const newVal = $(this).val();

        if (qidx !== undefined) {
          questions[idx].questions[qidx].option[oid] = newVal;
        } else {
          questions[idx].option[oid] = newVal;
        }
        autoSaveChanges();
      }
    );

    $("#preview-cau-hoi").on(
      "change",
      ".level-select, .level-select-passage",
      function () {
        const idx = $(this).data("index");
        const qidx = $(this).data("qindex");
        const newLevel = parseInt($(this).val());

        if (qidx !== undefined) {
          questions[idx].questions[qidx].level = newLevel;
        } else {
          questions[idx].level = newLevel;
        }

        $(this)
          .closest("div.mb-4, div.mb-3, div.mb-5")
          .find(".display-level")
          .first()
          .text(levelText[newLevel]);

        $(this)
          .closest(".mb-5")
          .find("tbody .display-level")
          .text(levelText[newLevel]);

        autoSaveChanges();
      }
    );

    $("#preview-cau-hoi").on("change", ".answer-radio", function () {
      const idx = $(this).data("index");
      const qidx = $(this).data("qindex");
      const oid = $(this).data("oid");

      if (qidx !== undefined) {
        questions[idx].questions[qidx].answer = oid + 1;
        $(this)
          .closest("td")
          .find(".d-flex")
          .removeClass("border border-3 border-primary");
        $(this).parent().addClass("border border-3 border-primary");
      } else {
        questions[idx].answer = oid + 1;
        $(this)
          .closest("div.mb-2")
          .find(".d-flex")
          .removeClass("border border-3 border-primary");
        $(this).parent().addClass("border border-3 border-primary");
      }
      autoSaveChanges();
    });
  }

  // =================== BẬT NÚT IMPORT ===================
  function enableImportButton(count) {
    const $btn = $("#nhap-file");
    $btn.prop("disabled", false);
    $btn
      .html(
        `<i class="fa fa-cloud-arrow-up me-1"></i> Thêm vào hệ thống (${count} mục)`
      )
      .removeClass("btn-secondary")
      .addClass("btn-success fw-bold");
  }

  // =================== NÚT THÊM VÀO HỆ THỐNG ===================
  $("#nhap-file")
    .off("click")
    .on("click", function (e) {
      e.preventDefault();

      if (questions.length === 0) {
        Dashmix.helpers("jq-notify", {
          type: "warning",
          message: "Chưa có dữ liệu!",
        });
        return;
      }

      const monhoc = $("#monhocfile").val();
      const chuong = $("#chuongfile").val();
      if (!monhoc || !chuong) {
        Dashmix.helpers("jq-notify", {
          type: "warning",
          message: "Chọn môn học và chương!",
        });
        return;
      }

      const $btn = $(this);
      $btn
        .prop("disabled", true)
        .html('<i class="fa fa-spinner fa-spin"></i> Đang thêm...');
      Dashmix.layout("header_loader_on");
      console.log("📤 Sending questions:", JSON.stringify(questions));

      $.ajax({
        url: "./question/addQuesFile",
        type: "POST",
        data: {
          monhoc: monhoc,
          chuong: chuong,
          questions: JSON.stringify(questions),
        },
        dataType: "json",
        timeout: 120000,
        success: function (res) {
          if (res.status === "success") {
            Dashmix.helpers("jq-notify", {
              type: "success",
              message: `Thêm thành công ${
                res.inserted || questions.length
              } câu hỏi!`,
            });

            questions = [];
            isModified = false;
            $("#preview-cau-hoi").empty().hide();
            $("#file-cau-hoi").val("");
            $("#form-upload")[0]?.reset();
            $btn.prop("disabled", true).html("Thêm vào hệ thống");
            $("#modal-add-question").modal("hide");
            reloadQuestionList();
          } else {
            Dashmix.helpers("jq-notify", {
              type: "danger",
              message: res.message || "Lỗi server!",
            });
          }
        },
        error: function () {
          Dashmix.helpers("jq-notify", {
            type: "danger",
            message: "Lỗi kết nối hoặc timeout!",
          });
        },
        complete: () => {
          $btn.prop("disabled", false);
          Dashmix.layout("header_loader_off");
        },
      });
    });

  // Helper escape HTML
  function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Load questions
  function loadQuestion() {
    $.get(
      "./question/getQuestion",
      {
        page: page,
        selected: $(".btn-filter").text(),
        content: $("#search-input").val().trim(),
      },
      function (data) {
        showData(data);
      },
      "json"
    );
  }

  // Add question
  $("#add_question").click(function (e) {
    e.preventDefault();
    for (let name in CKEDITOR.instances) {
      CKEDITOR.instances[name].updateElement();
    }

    let qtype = $("#loai-cau-hoi").val();
    let noidung = CKEDITOR.instances["js-ckeditor"]?.getData() || "";
    let passage = CKEDITOR.instances["passage-content"]?.getData() ?? "";
    let cautraloi = qtype === "reading" ? readingQuestions : options;
    let questionImage = $("#question-image")[0]?.files[0];

    let hasError = false;
    let errorMessage = "";

    if (qtype === "mcq") {
      if (options.length === 0 || !options.some((opt) => opt.check)) {
        hasError = true;
        errorMessage = "Vui lòng chọn ít nhất một đáp án đúng cho câu hỏi!";
      }
    }

    if (qtype === "reading") {
      if (readingQuestions.length === 0) {
        hasError = true;
        errorMessage = "Vui lòng thêm ít nhất một câu hỏi con!";
      } else {
        for (let i = 0; i < readingQuestions.length; i++) {
          const subQ = readingQuestions[i];
          const subOptions = subQ.options || [];

          // Kiểm tra nội dung câu hỏi con (tùy chọn, có thể bắt buộc)
          // if (!subQ.content.trim()) {
          //   hasError = true;
          //   errorMessage = `Câu hỏi con số ${i + 1}: Chưa nhập nội dung câu hỏi!`;
          //   break;
          // }

          if (subOptions.length === 0 || !subOptions.some((opt) => opt.check)) {
            hasError = true;
            errorMessage = `Câu hỏi con số ${i + 1}: Chưa chọn đáp án đúng!`;
            break;
          }
        }
      }
    }

    // Nếu có lỗi → báo và dừng lại
    if (hasError) {
      Dashmix.helpers("jq-notify", {
        type: "danger",
        message: errorMessage,
      });
      return;
    }

    let formData = new FormData();
    formData.append("loai", qtype);
    formData.append("noidung", qtype === "reading" ? passage : noidung);
    formData.append("doanvan_noidung", passage);
    let passageTitle = $("#passage-title").val() || "";
    formData.append("doanvan_tieude", passageTitle);
    formData.append("mamon", $("#mon-hoc").val());
    formData.append("machuong", $("#chuong").val());
    formData.append("dokho", $("#dokho").val());

    if (questionImage) formData.append("hinhanh", questionImage);

    // Chuẩn hóa đáp án với delete_image
    let answersToSend = cautraloi.map((item) => {
      let base = {
        content: item.content,
        check: item.check ? 1 : 0,
        delete_image: item.delete_image ? 1 : 0,
        image: item.image || null, // GIỮ ẢNH CŨ
      };

      if (qtype === "reading") {
        base.options = (item.options || []).map((opt) => ({
          content: opt.content,
          check: opt.check ? 1 : 0,
          delete_image: opt.delete_image ? 1 : 0,
        }));
      }
      return base;
    });
    formData.append("cautraloi", JSON.stringify(answersToSend));

    // Append ảnh, chỉ nếu có file mới; placeholder "" để khớp index
    cautraloi.forEach((opt) => {
      formData.append("option_hinhanh[]", opt.file || "");
    });

    $.ajax({
      url: "./question/addQues",
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (res) {
        let response = typeof res === "string" ? JSON.parse(res) : res;
        if (response.status === "success") {
          Dashmix.helpers("jq-notify", {
            type: "success",
            message: "Thêm câu hỏi thành công!",
          });
          $("#modal-add-question").modal("hide");
          reloadQuestionList();
        } else {
          Dashmix.helpers("jq-notify", {
            type: "danger",
            message: response.message,
          });
        }
      },
      error: function () {
        Dashmix.helpers("jq-notify", {
          type: "danger",
          message: "Lỗi server!",
        });
      },
    });
  });

  function checkSOption(data) {
    if (!Array.isArray(data)) return false;
    return data.some((item) =>
      Array.isArray(item.options)
        ? item.options.some((opt) => opt.check)
        : item.check
    );
  }

  // KHI BẤM SỬA CÂU HỎI
  $("#modal-add-question").on("shown.bs.modal", function () {
    $(document).removeData("delete_question_image");
    const isEditing =
      $("#edit_question").is(":visible") || $("#question_id").val() !== "";

    $(this)
      .find(".modal-title")
      .first()
      .html(
        isEditing
          ? '<i class="fa fa-pencil-alt text-warning me-2"></i> Chỉnh sửa câu hỏi'
          : '<i class="fa fa-plus text-success me-2"></i> Thêm câu hỏi mới'
      );

    const homeTab = $("#btabs-alt-static-home-tab");
    homeTab.html(
      isEditing
        ? '<i class="fa fa-pencil-alt text-warning me-1"></i> Chỉnh sửa câu hỏi'
        : '<i class="fa fa-edit text-primary me-1"></i> Thêm thủ công'
    );

    const fileTab = $('[data-bs-target="#btabs-alt-static-profile"]').closest(
      ".nav-item"
    );
    isEditing ? fileTab.hide() : fileTab.show();

    homeTab.tab("show");
  });

  $(document).on("click", ".btn-edit-question", function () {
    const id = $(this).data("id");

    options = [];
    readingQuestions = [];
    $("#list-options, #reading-questions-list").html("");

    $("#add_question").hide();
    $("#edit_question").show();
    $("#question_id").val(id);

    $("#modal-add-question").modal("show");

    setTimeout(() => getQuestionById(id), 150);
  });

  $("#addquestionnew").click(function () {
    $("#mon-hoc, #chuong, #dokho, #loai-cau-hoi").val("").trigger("change");
    $("#monhocfile, #chuongfile, #loaicauhoifile").val("").trigger("change");
    $("#passage-title").val("");

    CKEDITOR.instances["js-ckeditor"]?.setData("");
    CKEDITOR.instances["passage-content"]?.setData("");
    CKEDITOR.instances["option-content"]?.setData("");

    options = [];
    readingQuestions = [];
    $("#list-options, #reading-questions-list").html("");
    $("#add_option, #add_reading_question").collapse("hide");
    $("#question-image").val("");
    $("#question-image-preview").hide().attr("src", "");

    $("#add_question").show();
    $("#edit_question").hide();
    $("#question_id").val("");
    $("#file-cau-hoi").val("");

    $("#modal-add-question").modal("show");
  });

  // Edit question

  $("#edit_question").click(function () {
    let id = $("#question_id").val();
    let qtype = $("#loai-cau-hoi").val();
    let hasError = false;
    let errorMessage = "";

    // === KIỂM TRA BẮT BUỘC CÓ ĐÁP ÁN ĐÚNG ===
    if (qtype === "mcq") {
      // MCQ thường hoặc essay (nếu có chọn đáp án)
      if (options.length === 0 || !options.some((opt) => opt.check)) {
        hasError = true;
        errorMessage = "Chọn ít nhất một đáp án đúng cho câu hỏi!";
      }
    }

    if (qtype === "reading") {
      // Với Reading: kiểm tra TỪNG câu hỏi con
      for (let i = 0; i < readingQuestions.length; i++) {
        const subQ = readingQuestions[i];
        const subOptions = subQ.options || [];

        if (subOptions.length === 0 || !subOptions.some((opt) => opt.check)) {
          hasError = true;
          errorMessage = `Câu hỏi con số ${
            i + 1
          }: Vui lòng chọn ít nhất một đáp án đúng!`;
          break; // dừng ngay khi tìm thấy lỗi
        }
      }
    }

    // Nếu có lỗi → báo và dừng
    if (hasError) {
      Dashmix.helpers("jq-notify", {
        type: "danger",
        message: errorMessage,
      });
      return;
    }

    // Lấy dữ liệu từ CKEditor
    let rawData =
      qtype === "reading"
        ? CKEDITOR.instances["passage-content"].getData()
        : CKEDITOR.instances["js-ckeditor"].getData();

    // Loại bỏ div/p wrap ngoài cùng
    rawData = rawData.replace(/^<(div|p)[^>]*>|<\/(div|p)>$/gi, "").trim();

    let cautraloi = qtype === "reading" ? readingQuestions : options;

    let formData = new FormData();
    formData.append("id", id);
    formData.append("mamon", $("#mon-hoc").val());
    formData.append("machuong", $("#chuong").val());
    formData.append("dokho", $("#dokho").val());
    formData.append("loai", qtype);

    // Gửi đúng trường PHP đang check
    if (qtype === "reading") {
      formData.append("doanvan_noidung", rawData); // <--- quan trọng
      formData.append("doanvan_tieude", $("#passage-title").val() || "");
    } else {
      formData.append("noidung", rawData);
    }

    // Hình ảnh câu hỏi
    if ($("#question-image")[0]?.files[0]) {
      formData.append("hinhanh", $("#question-image")[0].files[0]);
    }

    // Chuẩn hóa đáp án với delete_image
    let answersToSend = cautraloi.map((item) => {
      let base = {
        content: item.content,
        check: item.check ? 1 : 0,
        delete_image: item.delete_image ? 1 : 0,
        image: item.image || null, // GIỮ ẢNH CŨ
      };

      if (qtype === "reading") {
        base.options = (item.options || []).map((opt) => ({
          content: opt.content,
          check: opt.check ? 1 : 0,
          delete_image: opt.delete_image ? 1 : 0,
        }));
      }
      return base;
    });
    formData.append("cautraloi", JSON.stringify(answersToSend));

    // Append ảnh, chỉ nếu có file mới; placeholder "" để khớp index
    // Gửi ảnh đúng nguồn dữ liệu (options hoặc readingQuestions)
    if (qtype === "mcq" || qtype === "essay") {
      options.forEach((opt, i) => {
        if (opt.file instanceof File) {
          console.log("Append option file", i, opt.file);
          formData.append("option_hinhanh[]", opt.file);
        } else {
          formData.append("option_hinhanh[]", "");
        }
      });
    }

    if (qtype === "reading") {
      readingQuestions.forEach((subQ, i) => {
        if (subQ.file instanceof File) {
          formData.append("option_hinhanh[]", subQ.file);
        } else {
          formData.append("option_hinhanh[]", "");
        }

        subQ.options.forEach((opt, j) => {
          if (opt.file instanceof File) {
            formData.append("option_hinhanh[]", opt.file);
          } else {
            formData.append("option_hinhanh[]", "");
          }
        });
      });
    }

    if ($(document).data("delete_question_image") === "1") {
      formData.append("delete_question_image", "1");
    }

    // Gửi Ajax
    $.ajax({
      url: "./question/editQuesion",
      type: "POST",
      data: formData,
      contentType: false,
      processData: false,
      success: function (res) {
        if (typeof res === "string") res = JSON.parse(res);
        if (res.status === "success") {
          Dashmix.helpers("jq-notify", {
            type: "success",
            message: "Cập nhật thành công!",
          });
          $("#modal-add-question").modal("hide");
          reloadQuestionList();
          $(document).removeData("delete_question_image");
        } else {
          Dashmix.helpers("jq-notify", {
            type: "danger",
            message: res.message || "Lỗi cập nhật",
          });
        }
      },
      error: function () {
        Dashmix.helpers("jq-notify", {
          type: "danger",
          message: "Lỗi kết nối server",
        });
      },
    });
  });

  function resetQuestionUI() {
    // Xóa dữ liệu cũ
    $("#js-ckeditor").val("");
    CKEDITOR.instances["js-ckeditor"].setData("");
    CKEDITOR.instances["passage-content"].setData("");
    $("#question-image-preview").html(
      "<small class='text-muted'>Không có ảnh</small>"
    );
    $("#list-options").html("");
    options = [];
    readingQuestions = [];
  }

  function getQuestionById(id) {
    resetQuestionUI();
    $(document).removeData("delete_question_image");

    $.ajax({
      type: "post",
      url: "./question/getQuestionById",
      data: { id: id },
      dataType: "json",
      success: function (data) {
        if (!data || !data.loai) {
          Dashmix.helpers("jq-notify", {
            type: "danger",
            message: "Không tìm thấy câu hỏi!",
          });
          return;
        }

        const loai = data.loai;

        $("#mon-hoc").val(data.mamonhoc).trigger("change");
        $("#dokho").val(data.dokho).trigger("change");
        $("#loai-cau-hoi").val(loai).trigger("change");

        setTimeout(() => {
          $("#chuong").val(data.machuong).trigger("change");
        }, 500);

        toggleQuestionType(loai);

        function safeSetData(editorName, content = "") {
          if (!CKEDITOR.instances[editorName]) {
            setTimeout(() => safeSetData(editorName, content), 100);
            return;
          }

          if (CKEDITOR.instances[editorName].status !== "ready") {
            CKEDITOR.instances[editorName].once("instanceReady", function () {
              this.setData(content);
            });
          } else {
            CKEDITOR.instances[editorName].setData(content);
          }
        }

        if (loai === "reading") {
          safeSetData("passage-content", data.noidung || "");
          safeSetData("js-ckeditor", "");
          $("#passage-title").val(data.tieude || "");
        } else {
          safeSetData("js-ckeditor", data.noidung || "");
          safeSetData("passage-content", "");
        }

        updateQuestionImagePreview(data.question_image_base64 || null);

        $.ajax({
          type: "post",
          url: "./question/getAnswerById",
          data: { id: id },
          dataType: "json",
          success: function (response) {
            console.log("Raw answer data from server:", response);
            options = [];
            readingQuestions = [];

            if (loai === "reading") {
              // Nhóm câu hỏi con theo macauhoicon
              const subMap = {};
              response.forEach((item) => {
                const subId = item.macauhoicon;
                if (!subMap[subId]) {
                  subMap[subId] = {
                    content: item.noidung_con || "",
                    image: item.question_image_base64 || null,
                    file: null,
                    delete_image: false,
                    options: [],
                  };
                }
                subMap[subId].options.push({
                  content: item.noidungtl || "",
                  check: item.ladapan == 1,
                  image: item.option_image_base64 || null,
                  file: null,
                  delete_image: false,
                });
              });

              readingQuestions = Object.values(subMap);
              showReadingQuestions();
            } else if (loai === "essay") {
              $("#essay-answer").val(response[0]?.noidungtl || "");
            } else {
              // MCQ hoặc các loại khác
              response.forEach((opt) => {
                options.push({
                  content: opt.noidungtl || "",
                  check: opt.ladapan == 1,
                  image: opt.option_image_base64 || null,
                  file: null,
                  delete_image: false,
                });
              });
              showOptions(options);
            }
          },
          error: function () {
            Dashmix.helpers("jq-notify", {
              type: "danger",
              message: "Lỗi lấy đáp án!",
            });
          },
        });
      },
      error: function () {
        Dashmix.helpers("jq-notify", {
          type: "danger",
          message: "Lỗi kết nối server!",
        });
      },
    });
  }
  // XÓA ẢNH CÂU HỎI CHÍNH (khi bấm nút X)
  $(document).on("click", ".btn-delete-question-image", function () {
    $("#question-image-preview")
      .html('<small class="text-muted">Không có ảnh</small>')
      .show();

    $("#question-image").val("");
    $(document).data("delete_question_image", "1");

    Dashmix.helpers("jq-notify", {
      type: "info",
      icon: "fa fa-info-circle me-1",
      message: "Ảnh câu hỏi sẽ bị xóa khi lưu.",
    });
  });
  // Hàm hiển thị ảnh câu hỏi chính – CÓ NÚT XÓA
  function updateQuestionImagePreview(src = null) {
    const $preview = $("#question-image-preview");

    if (src && src.startsWith("data:")) {
      $preview.html(`
            <div class="position-relative d-inline-block border border-2 border-success rounded shadow-sm">
                <img src="${src}" class="img-fluid rounded" style="max-width: 420px; max-height: 280px; object-fit: contain;">
                <button type="button" class="btn btn-danger btn-sm rounded-circle position-absolute top-0 end-0 btn-delete-question-image"
                        style="transform: translate(50%, -50%); width: 36px; height: 36px; z-index: 10;">
                    <i class="fa fa-times fa-lg"></i>
                </button>
            </div>
        `);
    } else {
      $preview.html('<small class="text-muted">Không có ảnh</small>');
    }
  }
  // Khi chọn ảnh mới
  $("#question-image").on("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        updateQuestionImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      updateQuestionImagePreview();
    }
  });
  // Xóa ảnh đáp án MCQ (trong danh sách options)
  $(document).on("click", ".btn-delete-option-image", function () {
    const index = $(this).data("id");
    options[index].image = null;
    options[index].file = null;
    options[index].delete_image = true; // Set flag delete
    showOptions(options);
  });

  // Xóa ảnh câu hỏi con Reading
  $(document).on("click", ".btn-delete-reading-question-image", function () {
    const index = $(this).data("id");
    readingQuestions[index].image = null;
    readingQuestions[index].file = null;
    readingQuestions[index].delete_image = true;
    showReadingQuestions();
  });

  // Xóa ảnh đáp án con trong Reading
  $(document).on("click", ".btn-delete-reading-option-image", function () {
    const qid = $(this).data("qid");
    const oid = $(this).data("oid");
    readingQuestions[qid].options[oid].image = null;
    readingQuestions[qid].options[oid].file = null;
    readingQuestions[qid].options[oid].delete_image = true;
    showReadingQuestions();
  });

  // Delete question
  $(document).on("click", ".btn-delete-question", function () {
    let trid = $(this).data("id");
    let e = Swal.mixin({
      buttonsStyling: false,
      target: "#page-container",
      customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-danger m-1",
        input: "form-control",
      },
    });

    e.fire({
      title: "Are you sure?",
      text: "Bạn có chắc chắn muốn xoá câu hỏi này?",
      icon: "warning",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-danger m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Vâng, tôi chắc chắn!",
      html: false,
      preConfirm: () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 50);
        }),
    }).then((result) => {
      if (result.value) {
        $.ajax({
          type: "post",
          url: "./question/delete",
          data: {
            macauhoi: trid,
          },
          success: function (response) {
            e.fire("Deleted!", "Xóa câu hỏi thành công!", "success");
            mainPagePagination.getPagination(
              mainPagePagination.option,
              mainPagePagination.valuePage.curPage
            );
          },
        });
      }
    });
  });

  // Load questions
  var page = 1;
  var select = "Tất cả";
  loadQuestion();
  // Preview ảnh khi chọn file mới
  $("#question-image").on("change", function (e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        $("#question-image-preview")
          .html(
            `<img src="${e.target.result}" class="img-thumbnail" style="max-width:350px; max-height:220px; object-fit:contain; border:2px solid #28a745; border-radius:8px;">`
          )
          .show();
      };
      reader.readAsDataURL(file);
    }
  });
});

function reloadQuestionList() {
  mainPagePagination.getPagination(
    mainPagePagination.option,
    mainPagePagination.valuePage.curPage
  );
}

// Get current user ID
const container = document.querySelector(".content");
const currentUser = container.dataset.id;
delete container.dataset.id;

// Pagination
const mainPagePagination = new Pagination();
mainPagePagination.option.controller = "question";
mainPagePagination.option.model = "CauHoiModel";
mainPagePagination.option.limit = 10;
mainPagePagination.option.id = currentUser;
mainPagePagination.option.filter = {};
mainPagePagination.getPagination(
  mainPagePagination.option,
  mainPagePagination.valuePage.curPage
);
