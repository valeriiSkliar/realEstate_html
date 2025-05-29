export class SimplePagination extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return [
      "current-page",
      "total-pages",
      "max-page-links",
      "page-href-template",
    ];
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
    if (!this.hasAttribute("max-page-links")) {
      this.setAttribute("max-page-links", "5");
    }
    this.render();
  }

  get currentPage() {
    return parseInt(this.getAttribute("current-page"), 10) || 1;
  }

  get totalPages() {
    return parseInt(this.getAttribute("total-pages"), 10) || 1;
  }

  get maxPageLinks() {
    return parseInt(this.getAttribute("max-page-links"), 10) || 5;
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
      this.innerHTML = ""; // Очищаем содержимое если нет страниц
      return;
    }

    const pageNumbers = this._generatePageNumbersArray(
      currentPage,
      totalPages,
      this.maxPageLinks
    );

    let itemsHtml = "";

    // First Page
    itemsHtml += `
      <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
        <a class="page-link" href="${this._getPageHref(
          1
        )}" data-page="1" aria-label="First">
          <i class="bi bi-chevron-bar-left"></i>
        </a>
      </li>
    `;

    // Previous Page
    itemsHtml += `
      <li class="page-item ${currentPage === 1 ? "disabled" : ""}">
        <a class="page-link" href="${this._getPageHref(
          currentPage - 1
        )}" data-page="${currentPage - 1}" aria-label="Previous">
          <i class="bi bi-chevron-left"></i>
        </a>
      </li>
    `;

    // Page Numbers
    pageNumbers.forEach((page) => {
      if (page === "...") {
        itemsHtml += `<li class="page-item disabled"><span class="page-link ellipsis">...</span></li>`;
      } else {
        itemsHtml += `
          <li class="page-item ${page === currentPage ? "active" : ""}">
            <a class="page-link" href="${this._getPageHref(
              page
            )}" data-page="${page}" ${
          page === currentPage ? 'aria-current="page"' : ""
        }>${page}</a>
          </li>
        `;
      }
    });

    // Next Page
    itemsHtml += `
      <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
        <a class="page-link" href="${this._getPageHref(
          currentPage + 1
        )}" data-page="${currentPage + 1}" aria-label="Next">
          <i class="bi bi-chevron-right"></i>
        </a>
      </li>
    `;

    // Last Page
    itemsHtml += `
      <li class="page-item ${currentPage === totalPages ? "disabled" : ""}">
        <a class="page-link" href="${this._getPageHref(
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
    this.querySelectorAll(".page-link[data-page]").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (link.closest(".page-item.disabled")) {
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
          event.preventDefault(); // Предотвращаем переход по хешу если используем только события
        }
      });
    });
  }

  _generatePageNumbersArray(currentPage, totalPages, maxPageLinks) {
    const pageNumbers = [];
    if (totalPages <= 0) return pageNumbers;

    if (totalPages <= maxPageLinks) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage, endPage;
      const halfMax = Math.floor(maxPageLinks / 2);
      const hasLeftEllipsis = currentPage > halfMax + 1;
      const hasRightEllipsis = currentPage < totalPages - halfMax;

      if (!hasLeftEllipsis && hasRightEllipsis) {
        // Near the start
        startPage = 1;
        endPage = maxPageLinks - 1; // -1 for ellipsis
        pageNumbers.push(
          ...Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          )
        );
        pageNumbers.push("...");
      } else if (hasLeftEllipsis && !hasRightEllipsis) {
        // Near the end
        startPage = totalPages - (maxPageLinks - 2); // -2 for first page and ellipsis
        endPage = totalPages;
        pageNumbers.push("...");
        pageNumbers.push(
          ...Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          )
        );
      } else if (hasLeftEllipsis && hasRightEllipsis) {
        // In the middle
        startPage = currentPage - Math.floor((maxPageLinks - 3) / 2); // -3 for 1, ..., ... N
        endPage = currentPage + Math.ceil((maxPageLinks - 3) / 2);
        pageNumbers.push("...");
        pageNumbers.push(
          ...Array.from(
            { length: endPage - startPage + 1 },
            (_, i) => startPage + i
          )
        );
        pageNumbers.push("...");
      } else {
        // Very few pages, should be caught by the first if, but as a fallback
        for (let i = 1; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      }

      // To better match the image (e.g., 1 2), if maxPageLinks is small
      if (maxPageLinks <= 2) {
        pageNumbers.length = 0; // Clear previous
        if (currentPage === 1) {
          pageNumbers.push(1);
          if (totalPages >= 2) pageNumbers.push(2);
        } else if (currentPage === totalPages && totalPages > 1) {
          pageNumbers.push(totalPages - 1);
          pageNumbers.push(totalPages);
        } else {
          // current page is somewhere in middle, but we only show 2
          pageNumbers.push(currentPage);
          if (currentPage < totalPages) pageNumbers.push(currentPage + 1);
          else if (currentPage > 1) pageNumbers.unshift(currentPage - 1); //add to beginning
        }
      }
    }

    // Ensure unique numbers and filter out invalid ones if logic gets complex
    return [
      ...new Set(
        pageNumbers.filter(
          (p) =>
            (typeof p === "number" && p > 0 && p <= totalPages) || p === "..."
        )
      ),
    ];
  }
}
