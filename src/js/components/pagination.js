/**
 * Pagination Interactive Module
 * Обеспечивает интерактивность для серверной пагинации
 * Только отслеживание кликов и отправка событий
 */

class PaginationManager {
  constructor() {
    this.init();
  }

  /**
   * Инициализация модуля
   */
  init() {
    this.bindEvents();
  }

  /**
   * Привязка событий к пагинации
   */
  bindEvents() {
    // Используем делегирование событий для всех пагинаций на странице
    document.addEventListener("click", this.handlePageClick.bind(this));
    document.addEventListener("keydown", this.handlePageKeydown.bind(this));
  }

  /**
   * Обработка клика по ссылке страницы
   */
  handlePageClick(event) {
    const pageLink = event.target.closest(".page-link");
    if (!pageLink) return;

    const pageItem = pageLink.closest(".page-item");
    const pagination = pageLink.closest('[data-component="pagination"]');

    // Игнорируем отключенные элементы
    if (pageItem && pageItem.classList.contains("disabled")) {
      event.preventDefault();
      return;
    }

    // Игнорируем активную страницу
    if (pageItem && pageItem.classList.contains("active")) {
      event.preventDefault();
      return;
    }

    // Игнорируем многоточие
    if (pageLink.classList.contains("ellipsis")) {
      event.preventDefault();
      return;
    }

    // Извлекаем номер страницы
    const pageNumber = this.extractPageNumber(pageLink);

    if (pageNumber && pagination) {
      // Отправляем кастомное событие для аналитики или других нужд
      this.dispatchPageChangeEvent(pagination, pageNumber, pageLink);
    }

    // Для серверной пагинации позволяем обычный переход по ссылке
    // Не вызываем preventDefault() - браузер сам перейдет по href
  }

  /**
   * Обработка нажатия клавиш для доступности
   */
  handlePageKeydown(event) {
    const pageLink = event.target.closest(".page-link");
    if (!pageLink) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      pageLink.click();
    }
  }

  /**
   * Извлечение номера страницы из ссылки
   */
  extractPageNumber(pageLink) {
    // Сначала пробуем получить из data-атрибута
    const dataPage = pageLink.getAttribute("data-page");
    if (dataPage) {
      return parseInt(dataPage, 10);
    }

    // Затем из href
    const href = pageLink.getAttribute("href");
    if (href) {
      const pageMatch = href.match(/[?&]page=(\d+)/);
      if (pageMatch) {
        return parseInt(pageMatch[1], 10);
      }
    }

    // Наконец, из текста ссылки (для числовых страниц)
    const text = pageLink.textContent.trim();
    const pageFromText = parseInt(text, 10);
    if (!isNaN(pageFromText)) {
      return pageFromText;
    }

    return null;
  }

  /**
   * Отправка кастомного события изменения страницы
   * Полезно для аналитики, GTM и других интеграций
   */
  dispatchPageChangeEvent(pagination, pageNumber, pageLink) {
    const event = new CustomEvent("pagination-change", {
      detail: {
        page: pageNumber,
        pageLink: pageLink,
        pagination: pagination,
        href: pageLink.getAttribute("href"),
      },
      bubbles: true,
    });

    pagination.dispatchEvent(event);

    // Также отправляем глобальное событие для аналитики
    if (window.gtag) {
      window.gtag("event", "page_change", {
        page_number: pageNumber,
        event_category: "pagination",
      });
    }
  }
}

// Инициализация при загрузке DOM
let paginationManager;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    paginationManager = new PaginationManager();
  });
} else {
  paginationManager = new PaginationManager();
}

// Экспорт для использования в других модулях
export { PaginationManager };

// Глобальный доступ для совместимости
window.PaginationManager = PaginationManager;
window.paginationManager = paginationManager;
