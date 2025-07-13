export class SimplePagination extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ["current-page", "total-pages", "page-href-template"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    if (!this.hasAttribute("current-page")) {
      this.setAttribute("current-page", "1");
    }
    if (!this.hasAttribute("total-pages")) {
      this.setAttribute("total-pages", "1");
    }
    this.render();
  }

  get currentPage() {
    return parseInt(this.getAttribute("current-page"), 10) || 1;
  }

  get totalPages() {
    return parseInt(this.getAttribute("total-pages"), 10) || 1;
  }

  get pageHrefTemplate() {
    return this.getAttribute("page-href-template") || "#";
  }

  _getPageHref(pageNumber) {
    if (this.pageHrefTemplate === "#") return "#";
    return this.pageHrefTemplate.replace("{page_num}", pageNumber);
  }

  render() {
    const currentPage = this.currentPage;
    const totalPages = this.totalPages;

    if (totalPages <= 0) {
      this.innerHTML = "";
      return;
    }

    const pageNumbers = this._generatePageNumbersArray(currentPage, totalPages);

    let itemsHtml = "";

    // First Page
    itemsHtml += `
      <li class="pagination__item ${
        currentPage === 1 ? "pagination__item--disabled" : ""
      }">
        <a class="pagination__link" href="${this._getPageHref(
          1
        )}" data-page="1" aria-label="First">
          <i class="bi bi-chevron-bar-left"></i>
        </a>
      </li>
    `;

    // Previous Page
    itemsHtml += `
      <li class="pagination__item ${
        currentPage === 1 ? "pagination__item--disabled" : ""
      }">
        <a class="pagination__link" href="${this._getPageHref(
          currentPage - 1
        )}" data-page="${currentPage - 1}" aria-label="Previous">
          <i class="bi bi-chevron-left"></i>
        </a>
      </li>
    `;

    // Page Numbers
    pageNumbers.forEach((page) => {
      itemsHtml += `
        <li class="pagination__item ${
          page === currentPage ? "pagination__item--active" : ""
        }">
          <a class="pagination__link" href="${this._getPageHref(
            page
          )}" data-page="${page}" ${
        page === currentPage ? 'aria-current="page"' : ""
      }>${page}</a>
        </li>
      `;
    });

    // Next Page
    itemsHtml += `      <li class="pagination__item ${
      currentPage === totalPages ? "pagination__item--disabled" : ""
    }">
        <a class="pagination__link" href="${this._getPageHref(
          currentPage + 1
        )}" data-page="${currentPage + 1}" aria-label="Next">
          <i class="bi bi-chevron-right"></i>
        </a>
      </li>
    `;

    // Last Page
    itemsHtml += `
      <li class="pagination__item ${
        currentPage === totalPages ? "pagination__item--disabled" : ""
      }">
        <a class="pagination__link" href="${this._getPageHref(
          totalPages
        )}" data-page="${totalPages}" aria-label="Last">
          <i class="bi bi-chevron-bar-right"></i>
        </a>
      </li>
    `;

    // Рендерим в общий DOM без Shadow DOM и встроенных стилей
    this.innerHTML = `
      <nav class="pagination-wrapper" aria-label="Page navigation" data-component="pagination">
        <ul class="pagination">
          ${itemsHtml}
        </ul>
      </nav>
    `;

    // Привязываем события к ссылкам
    this.querySelectorAll(".pagination__link[data-page]").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (link.closest(".pagination__item--disabled")) {
          event.preventDefault();
          return;
        }
        const page = parseInt(link.getAttribute("data-page"), 10);
        if (page && page !== this.currentPage) {
          this.dispatchEvent(
            new CustomEvent("page-change", {
              detail: { page: page },
              bubbles: true,
              composed: true,
            })
          );
        }
        if (this.pageHrefTemplate === "#") {
          event.preventDefault();
        }
      });
    });
  }

  _generatePageNumbersArray(currentPage, totalPages) {
    const pageNumbers = [];

    if (totalPages <= 0) return pageNumbers;

    // Если страниц 3 или меньше - показываем все
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
      return pageNumbers;
    }

    // Логика для показа 3 страниц: активная + соседние
    if (currentPage === 1) {
      // Первая страница: показываем 1, 2, 3
      pageNumbers.push(1, 2, 3);
    } else if (currentPage === totalPages) {
      // Последняя страница: показываем (total-2), (total-1), total
      pageNumbers.push(totalPages - 2, totalPages - 1, totalPages);
    } else {
      // Средние страницы: показываем (current-1), current, (current+1)
      pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
    }

    return pageNumbers;
  }
}
