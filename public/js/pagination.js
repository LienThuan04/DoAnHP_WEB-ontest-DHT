class Pagination {
  constructor(container, searchForm, successCallback) {
    this.container =
      container || document.querySelector(".pagination-container");
    this.pg = this.container.querySelector(".list-page");
    this.btnPrevPg = this.container.querySelector("a.prev-page");
    this.btnNextPg = this.container.querySelector("a.next-page");
    this.btnFirstPg = this.container.querySelector("a.first-page");
    this.btnLastPg = this.container.querySelector("a.last-page");
    this.searchForm =
      searchForm || document.getElementById("search-form") || null;
    this.successCallback = successCallback || showData;

    this.valuePage = {
      truncate: true,
      curPage: 1,
      numLinksTwoSide: 1,
      totalPages: 0,
    };

    this.option = {
      custom: {},
    };

    this.container.addEventListener("click", this.containerHandler.bind(this));
    this.pg.addEventListener("click", this.listPageHandler.bind(this));
    this.searchForm?.addEventListener(
      "input",
      this.searchFormHandler.bind(this)
    );
  }

  renderPage(index, active = "") {
    let style = "";
    if (index === 1 || index === this.valuePage.totalPages) {
      style = `style="border-radius:0;"`;
    }
    return `<li class="page-item ${active}">
          <a class="page-link" href="javascript:void(0)" ${
            style ? style : ""
          } data-page="${index}">${index}</a>
      </li>`;
  }

  handleButtonLeft() {
    if (this.valuePage.curPage === 1 || this.valuePage.totalPages <= 1) {
      this.btnPrevPg.classList.add("disabled");
      this.btnFirstPg.classList.add("disabled");
    } else {
      this.btnPrevPg.classList.remove("disabled");
      this.btnFirstPg.classList.remove("disabled");
    }
  }

  handleButtonRight() {
    if (
      this.valuePage.curPage === this.valuePage.totalPages ||
      this.valuePage.totalPages <= 1
    ) {
      this.btnNextPg.classList.add("disabled");
      this.btnLastPg.classList.add("disabled");
    } else {
      this.btnNextPg.classList.remove("disabled");
      this.btnLastPg.classList.remove("disabled");
    }
  }

  handleButton(element) {
    if (element.classList.contains("first-page")) {
      this.valuePage.curPage = 1;
    } else if (element.classList.contains("last-page")) {
      this.valuePage.curPage = this.valuePage.totalPages;
    } else if (element.classList.contains("prev-page")) {
      if (this.valuePage.curPage === 1) return;
      this.valuePage.curPage--;
      this.btnNextPg.classList.remove("disabled");
      this.btnLastPg.classList.remove("disabled");
    } else if (element.classList.contains("next-page")) {
      if (this.valuePage.curPage === this.valuePage.totalPages) return;
      this.valuePage.curPage++;
      this.btnPrevPg.classList.remove("disabled");
      this.btnFirstPg.classList.remove("disabled");
    }

    this.pagination();
    this.handleButtonLeft();
    this.handleButtonRight();
  }

  pagination() {
    const {
      totalPages,
      curPage,
      truncate,
      numLinksTwoSide: delta,
    } = this.valuePage;

    const range = delta + 4; // use for handle visible number of links left side

    let render = "";
    let renderTwoSide = "";
    let dot = `<li class="page-item"><a class="page-link" href="javascript:void(0)">...</a></li>`;
    let countTruncate = 0; // use for ellipsis - truncate left side or right side

    // use for truncate two side
    const numberTruncateLeft = curPage - delta;
    const numberTruncateRight = curPage + delta;

    let active = "";
    for (let pos = 1; pos <= totalPages; pos++) {
      active = pos === curPage ? "active" : "";

      // truncate
      if (totalPages >= 2 * range - 1 && truncate) {
        if (
          numberTruncateLeft > 3 &&
          numberTruncateRight < totalPages - 3 + 1
        ) {
          // truncate 2 side
          if (pos >= numberTruncateLeft && pos <= numberTruncateRight) {
            renderTwoSide += this.renderPage(pos, active);
          }
        } else {
          // truncate left side or right side
          if (
            (curPage < range && pos <= range) ||
            (curPage > totalPages - range && pos >= totalPages - range + 1) ||
            pos === totalPages ||
            pos === 1
          ) {
            render += this.renderPage(pos, active);
          } else {
            countTruncate++;
            if (countTruncate === 1) render += dot;
          }
        }
      } else {
        // not truncate
        render += this.renderPage(pos, active);
      }
    }

    if (renderTwoSide) {
      renderTwoSide =
        this.renderPage(1) +
        dot +
        renderTwoSide +
        dot +
        this.renderPage(totalPages);
      this.pg.innerHTML = renderTwoSide;
    } else {
      this.pg.innerHTML = render;
    }

    this.handleButtonLeft();
    this.handleButtonRight();
  }

  fetchData(args, page) {
    args.page = page;
    args.limit = 10; // Thêm limit
    console.log("Tham số gửi đi (fetchData):", JSON.stringify(args));
    let self = this;
    const { controller } = args;
    $.ajax({
      url: `./${controller}/pagination`,
      method: "post",
      data: {
        args: JSON.stringify(args),
      },
      dataType: "json",
      success: function (data) {
        console.log("Dữ liệu phân trang:", data);
        self.successCallback(data);
        if (data.length > 0 && self.valuePage.totalPages === 0) {
          console.warn(
            "Dữ liệu tồn tại nhưng totalPages = 0, điều chỉnh totalPages"
          );
          // Ước tính totalPages dựa trên dữ liệu
          self.valuePage.totalPages = Math.ceil(data.length / args.limit) || 1;
          self.pagination();
        }
      },
      error: function (err) {
        console.error("Lỗi lấy dữ liệu:", err.responseText);
        self.successCallback([]);
      },
    });
  }
  getPagination(args, page) {
    args.page = page;
    args.limit = this.option.limit || 10;
    console.log("Tham số gửi đi (getTotalPages):", JSON.stringify(args));
    const { controller } = args;
    let self = this;
    $.ajax({
      url: `./${controller}/getTotalPages`,
      method: "post",
      data: {
        args: JSON.stringify(args),
      },
      dataType: "json",
      success: function (response) {
        console.log("Tổng số bản ghi và trang:", response);
        self.valuePage.totalPages = response.totalPages || response || 0;
        if (
          self.valuePage.totalPages === 1 ||
          (self.valuePage.totalPages !== 0 &&
            self.valuePage.totalPages < self.valuePage.curPage)
        ) {
          self.valuePage.curPage = self.valuePage.totalPages;
        }
        self.pagination();
        self.fetchData(args, self.valuePage.curPage);
      },
      error: function (err) {
        console.error("Lỗi lấy tổng số trang:", err.responseText);
        self.successCallback([]);
        self.pagination();
      },
    });
  }

  searchFormHandler(e) {
    e.preventDefault();
    const input = this.searchForm.querySelector("#search-input");
    if (input.value == "") {
      // remove both possible keys to ensure no leftover filters
      delete this.option.input;
      delete this.option.content;
    } else {
      // set both 'input' (current) and 'content' (legacy pages) so server-side
      // pagination code can read either key
      this.option.input = input.value;
      this.option.content = input.value;
      this.valuePage.curPage = 1;
    }
    this.getPagination(this.option, this.valuePage.curPage);
  }

  containerHandler(e) {
    if (e.target.closest(".page-link")) {
      this.handleButton(e.target.closest(".page-link"));
      this.getPagination(this.option, this.valuePage.curPage);
    }
  }

  listPageHandler(e) {
    const el = e.target;

    if (el.dataset.page) {
      const pageNumber = parseInt(el.dataset.page, 10);
      this.valuePage.curPage = pageNumber;
      this.pagination();
      this.handleButtonLeft();
      this.handleButtonRight();
    }
  }
}

// Get class names
const divClassName = document.getElementsByClassName("pagination-class-name");
const classNameJSON = divClassName[0].dataset.paginationClassName;
const paginationClassName = JSON.parse(classNameJSON);

Array.from(divClassName).forEach((div) => {
  div.remove();
});
