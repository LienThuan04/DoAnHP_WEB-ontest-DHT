// ==================== LẤY MÃ ĐỀ TỪ URL ====================
const url = location.href.split("/");
const made = url[url.length - 1];

// ==================== BIẾN TOÀN CỤC ====================
let infoTest = null;
let arrQuestion = [];
let currentQuestionLists = [];
let arrQuestionOriginal = [];

// ==================== HẰNG SỬ DỤNG ====================
const dokhoText = ["", "Dễ", "TB", "Khó"];
const dokhoColor = ["", "success", "warning", "danger"];

// ==================== LẤY DỮ LIỆU CƠ BẢN ====================
function getInfoTest() {
  return $.ajax({
    type: "post",
    url: "./test/getDetail",
    data: { made },
    dataType: "json",
    success: (data) => {
      if (data?.made) infoTest = data;
    },
    error: () =>
      Dashmix.helpers("jq-notify", {
        type: "danger",
        message: "Lỗi lấy thông tin đề thi!",
      }),
  });
}

function getQuestionOfTest() {
  return $.ajax({
    type: "post",
    url: "./test/getQuestionOfTestManual",
    data: { made },
    dataType: "json",
    success: (response) => {
      const questions = response || [];
      arrQuestion = questions.map((q) => {
        if (q.loai === "reading" || q.loai === "doanvan") {
          q.doanvan_noidung = q.doanvan_noidung || q.noidungplaintext || "";
        }
        return q;
      });
      arrQuestionOriginal = [...arrQuestion]; // LƯU LẠI DỮ LIỆU GỐC
    },
    error: () =>
      Dashmix.helpers("jq-notify", {
        type: "danger",
        message: "Lỗi lấy câu hỏi của đề!",
      }),
  });
}
// ==================== LẤY ĐÁP ÁN CHO NHIỀU CÂU HỎI ====================
function getAnswerListForQuestion(questions, forceEditMode = false) {
  if (!questions || questions.length === 0) {
    $("#list-question").html(
      '<p class="text-center text-muted">Không có câu hỏi</p>'
    );
    if (forceEditMode) showListQuestionOfTest(arrQuestion);
    return;
  }

  const arrMaCauHoi = questions.map((q) => q.macauhoi);

  $.ajax({
    type: "post",
    url: "./question/getAnswersForMultipleQuestions",
    data: { questions: arrMaCauHoi },
    dataType: "json",
    // Trong success của AJAX
    success: function (answers) {
      if (!Array.isArray(answers)) answers = [];

      currentQuestionLists = questions.map((originalQuestion) => {
        const cautraloi = answers
          .filter(
            (a) => String(a.macauhoi) === String(originalQuestion.macauhoi)
          )
          .map((a) => ({
            macautl: a.macautl,
            macauhoi: a.macauhoi,
            noidungtl: a.noidungtl,
            ladapan: a.ladapan, // giữ nguyên, thường là "1" hoặc "0"
          }));

        return {
          ...originalQuestion,
          cautraloi: cautraloi,
        };
      });

      // LUÔN CẬP NHẬT DANH SÁCH BÊN TRÁI
      showListQuestion(currentQuestionLists);

      // KHI LÀ CHỈNH SỬA ĐỀ CŨ → CẬP NHẬT arrQuestion + RENDER LẠI BÊN PHẢI
      if (forceEditMode) {
        // GÁN LẠI ĐÁP ÁN CHO arrQuestion
        arrQuestion = arrQuestion.map((q) => {
          const found = currentQuestionLists.find(
            (x) => x.macauhoi == q.macauhoi
          );
          return found ? { ...q, cautraloi: found.cautraloi || [] } : q;
        });

        // QUAN TRỌNG: GỌI LẠI RENDER BÊN PHẢI SAU KHI ĐÃ CÓ ĐÁP ÁN
        showListQuestionOfTest(arrQuestion);
        updateQuestionSummary();
      }
    },
    error: function (xhr, status, error) {
      // ... giữ nguyên phần error

      if (forceEditMode && arrQuestion.length > 0) {
        showListQuestionOfTest(arrQuestion); // vẫn hiển thị dù lỗi
      }
    },
  });
}
// ==================== HIỂN THỊ DANH SÁCH CÂU HỎI (BÊN TRÁI) ====================
function showListQuestion(questions) {
  let html = "";

  const dokhoText = ["", "Dễ", "TB", "Khó"];
  const dokhoColor = ["", "success", "warning", "danger"];

  if (!questions || questions.length === 0) {
    $("#list-question").html(`
      <p class="text-muted text-center py-5">
        <i class="fa fa-info-circle me-2"></i> Không có câu hỏi
      </p>`);
    return;
  }

  const questionItems = questions.filter((q) => q.noidungplaintext?.trim());

  questionItems.forEach((q) => {
    const checked = arrQuestion.some((x) => x.macauhoi == q.macauhoi)
      ? "checked"
      : "";

    const level = parseInt(q.dokho) || 0;
    const levelColor = dokhoColor[level];

    // Xác định loại + màu
    let loaiHienThi = "Câu hỏi";
    let loaiColor = "secondary";
    if (q.loai === "reading" || q.loai === "doanvan") {
      loaiHienThi = "Đọc hiểu";
      loaiColor = "info";
    } else if (q.loai === "mcq") {
      loaiHienThi = "Trắc nghiệm";
      loaiColor = "primary";
    } else if (q.loai === "essay") {
      loaiHienThi = "Tự luận";
      loaiColor = "dark";
    }

    html += `
      <li class="list-group-item px-3 py-3 border-start-0 border-end-0">
        <div class="form-check d-flex align-items-start gap-3">
          <input class="form-check-input item-question mt-1 flex-shrink-0"
                 type="checkbox"
                 id="q-${q.macauhoi}"
                 data-id="${q.macauhoi}"
                 ${checked}>

          <label class="form-check-label flex-grow-1" for="q-${q.macauhoi}">
            <div class="fw-medium">
              ${sanitizeHTML(decodeHtmlEntities(q.noidungplaintext))}
            </div>

            <div class="mt-2">
              <span class="badge bg-${loaiColor} rounded-pill px-2 py-1">
                ${loaiHienThi}
              </span>
              <span class="badge bg-${levelColor} rounded-pill px-2 py-1 ms-2">
                ${dokhoText[level]}
              </span>
            </div>
          </label>
        </div>
      </li>`;
  });

  $("#list-question").html(html);
}
// ==================== HIỂN THỊ DANH SÁCH CÂU HỎI ĐÃ CHỌN (BÊN PHẢI) ====================
function showListQuestionOfTest(questions) {
  if (!questions || !questions.length) {
    $("#list-question-of-test").html(
      `<div class="text-center py-5">
         <p class="text-muted fs-5">Chưa có câu hỏi nào được chọn</p>
       </div>`
    );
    return;
  }

  // === Cấu hình loại câu hỏi ===
  const loaiConfig = {
    mcq: { label: "Trắc nghiệm", color: "primary", icon: "fa-list-ul" },
    essay: { label: "Tự luận", color: "dark", icon: "fa-pen-fancy" },
    reading: { label: "Đọc hiểu", color: "info", icon: "fa-book-open" },
    matching: { label: "Ghép nối", color: "warning", icon: "fa-link" },
    truefalse: {
      label: "Đúng/Sai",
      color: "secondary",
      icon: "fa-check-square",
    },
    fill: { label: "Điền khuyết", color: "success", icon: "fa-fill" },
  };

  const doKhoConfig = [
    { label: "Dễ", color: "success", short: "Dễ" },
    { label: "Trung bình", color: "primary", short: "TB" },
    { label: "Khó", color: "danger", short: "Khó" },
  ];

  // === Nhóm câu hỏi reading theo madv ===
  const groups = {};
  questions.forEach((q) => {
    const key =
      q.loai === "reading" && q.madv ? `dv_${q.madv}` : `q_${q.macauhoi}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(q);
  });

  let html = "";
  let globalIndex = 0;

  // === Render đáp án đẹp, kèm ảnh nếu có ===
  const renderAnswers = (answers, type) => {
    if (!answers || !answers.length)
      return '<small class="text-muted">Chưa có đáp án</small>';

    return answers
      .sort((a, b) => a.macautl - b.macautl)
      .map((da, i) => {
        const letter = String.fromCharCode(65 + i);
        const isCorrect = da.ladapan === "1";
        console.log("ladapan:", da.ladapan, "type:", typeof da.ladapan);

        let content = sanitizeHTML(decodeHtmlEntities(da.noidungtl));
        if (da.hinhanhtl) {
          content += `<div class="mt-1"><img src="${da.hinhanhtl}" class="img-fluid rounded" style="max-height:150px;"></div>`;
        }

        if (type === "truefalse") {
          const text = da.noidungtl.toLowerCase().includes("đúng")
            ? "Đúng"
            : "Sai";
          return `<span class="badge me-2 ${
            isCorrect ? "bg-success" : "bg-light text-dark"
          }">${text}${isCorrect ? " ✓" : ""}</span>`;
        }

        return `
          <div class="d-flex align-items-start mb-2 ${
            isCorrect ? "text-success fw-bold" : ""
          }">
            <span class="me-2 fw-bold">${letter}.</span>
            <span class="${
              isCorrect ? "bg-success text-white px-2 py-1 rounded small" : ""
            }">
              ${content}${isCorrect ? " ✓" : ""}
            </span>
          </div>`;
      })
      .join("");
  };

  const controlButtons = (index) => `
    <div class="btn-group-vertical btn-group-sm" role="group">
      <button type="button" class="btn btn-outline-secondary btn-up" data-index="${index}" title="Di chuyển lên"><i class="fa fa-arrow-up"></i></button>
      <button type="button" class="btn btn-outline-secondary btn-down" data-index="${index}" title="Di chuyển xuống"><i class="fa fa-arrow-down"></i></button>
      <button type="button" class="btn btn-outline-danger btn-delete" data-index="${index}" title="Xóa câu hỏi"><i class="fa fa-trash"></i></button>
    </div>`;

  for (const key in groups) {
    const group = groups[key];
    const q = group[0];
    const loai = loaiConfig[q.loai] || {
      label: "Khác",
      color: "secondary",
      icon: "fa-question",
    };
    const dokho = doKhoConfig[parseInt(q.dokho) || 0] || doKhoConfig[2];

    // --- Reading ---
    if (q.loai === "reading" && q.madv) {
      html += `
        <div class="card border-info mb-4 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h6 class="text-info fw-bold mb-0"><i class="fa fa-book-open me-2"></i> Đoạn văn đọc hiểu</h6>
              ${controlButtons(globalIndex)}
            </div>
            <div class="bg-light p-3 rounded mb-4 border" style="line-height:1.7;">
              ${
                q.doanvan_noidung
                  ? sanitizeHTML(decodeHtmlEntities(q.doanvan_noidung))
                  : '<p class="text-muted fst-italic">Không có đoạn văn</p>'
              }
            </div>
            <div class="ps-3">
              ${group
                .map((sq) => {
                  globalIndex++;
                  let questionImg = sq.hinhanh
                    ? `<div class="mb-2"><img src="${sq.hinhanh}" class="img-fluid rounded" style="max-height:150px;"></div>`
                    : "";
                  return `
                  <div class="mb-4 pb-3 border-bottom last:border-0">
                    <div class="d-flex align-items-start gap-3">
                      <strong class="fs-5 text-primary">${globalIndex}.</strong>
                      <div class="flex-grow-1">
                        <div class="mb-2">
                          ${sanitizeHTML(
                            decodeHtmlEntities(
                              sq.noidungplaintext || "Câu hỏi không có nội dung"
                            )
                          )}
                          ${questionImg}
                        </div>
                        <div class="small text-muted">
                          <span class="badge bg-${
                            loai.color
                          } rounded-pill me-1 fs-6"><i class="fa ${
                    loai.icon
                  } fa-fw"></i> ${loai.label}</span>
                          <span class="badge bg-${
                            dokho.color
                          } rounded-pill fs-6">${dokho.short}</span>
                        </div>
                        ${
                          sq.cautraloi?.length
                            ? `<div class="mt-2 ps-4">${renderAnswers(
                                sq.cautraloi,
                                sq.loai
                              )}</div>`
                            : ""
                        }
                      </div>
                    </div>
                  </div>`;
                })
                .join("")}
            </div>
          </div>
        </div>`;
      continue;
    }

    // --- Câu hỏi thường ---
    globalIndex++;
    let questionImg = q.hinhanh
      ? `<div class="mb-2"><img src="${q.hinhanh}" class="img-fluid rounded" style="max-height:150px;"></div>`
      : "";
    html += `
      <div class="card mb-3 shadow-sm border-start border-4 border-${
        loai.color
      }">
        <div class="card-body py-3">
          <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
              <div class="d-flex align-items-start gap-3">
                <strong class="fs-5 text-primary">${globalIndex}.</strong>
                <div>
                  <div class="mb-2">
                    ${sanitizeHTML(
                      decodeHtmlEntities(q.noidungplaintext || q.noidung)
                    )}
                    ${questionImg}
                  </div>
                  <div class="small text-muted">
                    <span class="badge bg-${
                      loai.color
                    } rounded-pill me-1 fs-6"><i class="fa ${
      loai.icon
    } fa-fw"></i> ${loai.label}</span>
                    <span class="badge bg-${dokho.color} rounded-pill fs-6">${
      dokho.short
    }</span>
                  </div>
                  ${
                    q.cautraloi?.length
                      ? `<div class="mt-2 ps-4 border-start border-2 border-success ms-4">${renderAnswers(
                          q.cautraloi,
                          q.loai
                        )}</div>`
                      : ""
                  }
                </div>
              </div>
            </div>
            ${controlButtons(globalIndex - 1)}
          </div>
        </div>
      </div>`;
  }

  $("#list-question-of-test").html(html);
}

// ==================== CẬP NHẬT THỐNG KÊ THEO BẢNG dethi (9 ô) ====================
function updateQuestionSummary() {
  const selected = {
    mcq: { de: 0, tb: 0, kho: 0 },
    essay: { de: 0, tb: 0, kho: 0 },
    reading: { de: 0, tb: 0, kho: 0 },
  };

  // Tính số lượng câu hỏi đã chọn
  arrQuestion.forEach((q) => {
    const level = parseInt(q.dokho) || 0;
    const loai = q.loai === "doanvan" ? "reading" : q.loai;
    const muc = level === 1 ? "de" : level === 2 ? "tb" : "kho";
    if (selected[loai]) selected[loai][muc]++;
  });

  const mapping = [
    { loai: "mcq", prefix: "mcq", colors: ["success", "warning", "danger"] },
    {
      loai: "essay",
      prefix: "essay",
      colors: ["success", "warning", "danger"],
    },
    {
      loai: "reading",
      prefix: "reading",
      colors: ["success", "warning", "danger"],
    },
  ];

  mapping.forEach((m) => {
    ["de", "tb", "kho"].forEach((level, i) => {
      const sel = selected[m.loai][level];
      const totalNum = parseInt(infoTest[`${m.prefix}_${level}`]) || 0;

      const slElem = $(`#sl_${m.prefix}_${level}`);
      const ttElem = $(`#tt_${m.prefix}_${level}`);
      const btn = slElem.closest("button");
      const badge = slElem.parent();

      // Cập nhật số
      slElem.text(sel);
      ttElem.text(totalNum);

      // ======= ẨN / HIỆN THEO SỐ LƯỢNG =======
      if (totalNum > 0) {
        btn.hide();
      } else {
        btn.show(); 
        btn.prop("disabled", sel <= 0);
      }

      // Giữ màu nút
      btn
        .removeClass("btn-outline-secondary")
        .addClass(`btn-outline-${m.colors[i]}`);

      // Giữ màu badge
      badge
        .removeClass("bg-secondary text-white")
        .addClass(
          `bg-${m.colors[i]} ${
            m.colors[i] === "warning" ? "text-dark" : "text-white"
          }`
        );
    });
  });

  // Kiểm tra điều kiện lưu
  const isComplete = mapping.every((m) =>
    ["de", "tb", "kho"].every(
      (level) =>
        selected[m.loai][level] >=
        (parseInt(infoTest[`${m.prefix}_${level}`]) || 0)
    )
  );

  $("#save-test").prop("disabled", !isComplete);
}

// ==================== SỰ KIỆN CHECKBOX ====================
$(document).on("change", ".item-question", function () {
  const id = +this.dataset.id;
  const question = currentQuestionLists.find((q) => q.macauhoi == id);
  if (!question) return;

  const level = parseInt(question.dokho) || 0; // 1=Dễ, 2=TB, 3=Khó
  const loai = question.loai === "doanvan" ? "reading" : question.loai;
  const muc = level === 1 ? "de" : level === 2 ? "tb" : "kho";

  const loaiText = {
    mcq: "Trắc nghiệm",
    essay: "Tự luận",
    reading: "Đọc hiểu",
  };

  // Đếm số câu đã chọn cùng loại + độ khó
  const daChon = arrQuestion.filter((q) => {
    const qLoai = q.loai === "doanvan" ? "reading" : q.loai;
    const qLevel = parseInt(q.dokho) || 0;
    return qLoai === loai && qLevel === level;
  }).length;

  const gioiHan = infoTest[`${loai}_${muc}`] || 0;

  if (this.checked) {
    if (daChon >= gioiHan) {
      this.checked = false;

      // MÀU THÔNG BÁO THEO ĐỘ KHÓ
      const colorMap = ["", "success", "warning", "danger"];
      const notifyColor = colorMap[level]; // Dễ → success, TB → warning, Khó → danger

      const levelText = dokhoText[level];

      Dashmix.helpers("jq-notify", {
        type: notifyColor,
        icon: "fa fa-exclamation-triangle me-1",
        message: `<strong>Phần ${loaiText[loai]} - ${levelText}</strong> đã đủ <strong>${gioiHan}</strong> câu!`,
        allow_dismiss: true,
        delay: 5000,
      });
      return;
    }

    // Nếu chưa đủ → thêm bình thường
    arrQuestion.push({
      ...question,
      cautraloi: question.cautraloi || [],
    });
  } else {
    // Bỏ chọn
    const idx = arrQuestion.findIndex((q) => q.macauhoi == id);
    if (idx > -1) arrQuestion.splice(idx, 1);
  }

  // Cập nhật UI
  showListQuestionOfTest(arrQuestion);
  updateQuestionSummary();
});

// ==================== NÚT SẮP XẾP & XÓA ====================
$(document).on("click", ".btn-up", function () {
  const i = +this.dataset.index;
  if (i <= 0) return;
  [arrQuestion[i], arrQuestion[i - 1]] = [arrQuestion[i - 1], arrQuestion[i]];
  showListQuestionOfTest(arrQuestion);
  updateQuestionSummary();
});

$(document).on("click", ".btn-down", function () {
  const i = +this.dataset.index;
  if (i >= arrQuestion.length - 1) return;
  [arrQuestion[i], arrQuestion[i + 1]] = [arrQuestion[i + 1], arrQuestion[i]];
  showListQuestionOfTest(arrQuestion);
  updateQuestionSummary();
});

$(document).on("click", ".btn-delete", function () {
  const i = +this.dataset.index;
  const q = arrQuestion[i];
  $(`#q-${q.macauhoi}`).prop("checked", false);
  arrQuestion.splice(i, 1);
  showListQuestionOfTest(arrQuestion);
  updateQuestionSummary();
});

// ==================== LƯU ĐỀ THI ====================
$("#save-test").click(function (e) {
  e.preventDefault();
  if (arrQuestion.length === 0) {
    Dashmix.helpers("jq-notify", {
      type: "danger",
      message: "Chưa chọn câu hỏi nào!",
    });
    return;
  }

  const data = arrQuestion.map((q, i) => ({
    macauhoi: String(q.macauhoi),
    thutu: i + 1,
  }));

  $.post(
    "./test/addDetail",
    {
      made: infoTest.made,
      cauhoi: data,
      action: "create",
    },
    function (res) {
      if (res?.success) {
        Dashmix.helpers("jq-notify", {
          type: "success",
          message: "Lưu đề thi thành công!",
        });
        setTimeout(() => (location.href = "./test"), 1500);
      } else {
        Dashmix.helpers("jq-notify", {
          type: "danger",
          message: res?.error || "Lưu thất bại!",
        });
      }
    },
    "json"
  );
});

// ==================== TẢI CHƯƠNG & PHÂN TRANG ====================
function loadDataChapter(mamon) {
  $.ajax({
    type: "POST",
    url: "./subject/getAllChapter",
    data: { mamonhoc: mamon },
    dataType: "json",
    success: function (data) {
      console.log("DATA chapter:", data);

      let html = `
        <a class="dropdown-item active data-chapter" href="javascript:void(0)" data-id="0">
          Tất cả
        </a>
      `;

      if (Array.isArray(data)) {
        data.forEach((c) => {
          html += `
            <a class="dropdown-item data-chapter" href="javascript:void(0)" data-id="${c.machuong}">
              ${c.tenchuong}
            </a>`;
        });
      } else {
        console.error("DATA NOT ARRAY:", data);
      }

      $("#list-chapter").html(html);
    },
    error: function (xhr) {
      console.error("ERROR loadDataChapter:", xhr.responseText);
    },
  });
}

//TÌM KIỂM + LỌC
$("#search-input").on("input", function () {
  const keyword = this.value.trim();
  mainPagePagination.option.filter.keyword = keyword || undefined;
  mainPagePagination.getPagination(mainPagePagination.option, 1);
});

// 2. Lọc theo chương
$(document).on("click", ".data-chapter", function () {
  $(".data-chapter").removeClass("active");
  $(this).addClass("active");
  const id = this.dataset.id;
  if (id === "0") delete mainPagePagination.option.filter.machuong;
  else mainPagePagination.option.filter.machuong = parseInt(id);
  mainPagePagination.getPagination(mainPagePagination.option, 1);
});

// 3. Lọc theo độ khó
$(document).on("click", ".data-dokho", function () {
  $(".data-dokho").removeClass("active");
  $(this).addClass("active");
  const id = this.dataset.id;
  if (id === "0") delete mainPagePagination.option.filter.dokho;
  else mainPagePagination.option.filter.dokho = parseInt(id);
  mainPagePagination.getPagination(mainPagePagination.option, 1);
});

// 4. Lọc theo loại câu hỏi (MỚI THÊN BỊ THIẾU)
$(document).on("click", ".data-loai", function () {
  $(".data-loai").removeClass("active");
  $(this).addClass("active");
  const id = this.dataset.id;
  if (!id) delete mainPagePagination.option.filter.loai;
  else mainPagePagination.option.filter.loai = id;
  mainPagePagination.getPagination(mainPagePagination.option, 1);
});

// ==================== KHỞI ĐỘNG ====================
$.when(getInfoTest(), getQuestionOfTest()).done(() => {
  if (!infoTest) return;

  $("#name-test").text(infoTest.tende);
  $("#test-time").text(infoTest.thoigianthi + " phút");
  loadDataChapter(infoTest.monthi);

  mainPagePagination.option.mamonhoc = infoTest.monthi;
  mainPagePagination.option.id = infoTest.nguoitao;
  mainPagePagination.getPagination(mainPagePagination.option, 1);

  if (arrQuestionOriginal.length > 0) {
    getAnswerListForQuestion(arrQuestionOriginal, true);
  } else {
    showListQuestionOfTest([]);
  }

  updateQuestionSummary();
  if (infoTest.made) {
    $("#save-test span.fw-semibold").text("Cập nhật đề thi");
  }
});

const mainPagePagination = new Pagination(null, null, getAnswerListForQuestion);
mainPagePagination.option = {
  controller: "test",
  model: "DeThiModel",
  limit: 10,
  filter: {},
  custom: { function: "getQuestionsForTest" },
};

// ==================== HÀM HỖ TRỢ ====================
function sanitizeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function decodeHtmlEntities(str) {
  if (!str) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}
