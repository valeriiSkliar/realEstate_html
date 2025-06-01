/**
 * Breadcrumb Component - Minimal Frontend Functionality
 * Хлебные крошки рендерятся на сервере, JS только для дополнительного функционала
 */

/**
 * Инициализация breadcrumb компонента (если нужен дополнительный функционал)
 */
export function initBreadcrumb(container) {
  if (!container) return null;

  // Добавляем обработчик клика для аналитики или других фронтенд задач
  container.addEventListener("click", (e) => {
    const breadcrumbLink = e.target.closest(".breadcrumb-link");
    if (breadcrumbLink) {
      const href = breadcrumbLink.getAttribute("href");
      const text = breadcrumbLink.textContent.trim();

      // Здесь можно добавить аналитику, логирование и т.д.
      console.log("Breadcrumb clicked:", { href, text });

      // Можно добавить отправку событий в аналитику
      // analytics.track('breadcrumb_click', { href, text });
    }
  });

  return {
    container,
    // Методы для дополнительного функционала, если понадобятся
    destroy() {
      // Очистка обработчиков событий при необходимости
    },
  };
}

/**
 * Утилита для получения текущего пути breadcrumb (если нужно на фронтенде)
 */
export function getCurrentBreadcrumbPath(container) {
  if (!container) return [];

  const items = container.querySelectorAll(".breadcrumb-item");
  return Array.from(items).map((item) => {
    const link = item.querySelector(".breadcrumb-link");
    const text = item.querySelector(".breadcrumb-text");

    return {
      text: (link || text)?.textContent.trim(),
      href: link?.getAttribute("href"),
      active: item.classList.contains("active-page"),
    };
  });
}
