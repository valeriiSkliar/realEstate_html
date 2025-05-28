/**
 * Footer Component - Minimal Frontend Functionality
 * Footer рендерится на сервере, JS только для дополнительного функционала
 */

/**
 * Инициализация footer компонента
 */
export function initFooter(container) {
  if (!container) return null;

  // Обновляем текущий год
  updateCurrentYear(container);

  // Добавляем обработчик клика для аналитики (если нужно)
  container.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (link) {
      const href = link.getAttribute("href");
      const text = link.textContent.trim();

      // Здесь можно добавить аналитику для кликов в footer
      console.log("Footer link clicked:", { href, text });

      // Можно добавить отправку событий в аналитику
      // analytics.track('footer_link_click', { href, text });
    }
  });

  return {
    container,
    updateYear: () => updateCurrentYear(container),
    destroy() {
      // Очистка обработчиков событий при необходимости
    },
  };
}

/**
 * Обновление текущего года в footer
 */
function updateCurrentYear(container) {
  const yearElement = container.querySelector(".js-current-year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

/**
 * Утилита для автоматического обновления года во всех footer на странице
 */
export function updateAllFooterYears() {
  const footers = document.querySelectorAll(".footer");
  footers.forEach((footer) => {
    updateCurrentYear(footer);
  });
}
