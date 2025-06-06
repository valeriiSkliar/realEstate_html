import {
  AppConfirmModal,
  AppEmptyState,
  AppFavoriteProperty,
  AppFooter,
  AppHeader,
  AppMobileMenu,
  BrandButton,
  CustomBreadcrumb,
  MyAdvertisementCard,
  MyPropertyCard,
  PropertyListComponent,
  PropertySummaryCard,
  SimplePagination,
} from "./index";

/**
 * Проверяет, зарегистрирован ли кастомный элемент
 * @param {string} tagName - имя тега элемента
 * @returns {boolean}
 */
function isElementDefined(tagName) {
  return customElements.get(tagName) !== undefined;
}

/**
 * Регистрирует кастомный элемент только если он еще не зарегистрирован
 * @param {string} tagName - имя тега
 * @param {Function} elementClass - класс элемента
 */
function safeDefine(tagName, elementClass) {
  if (!isElementDefined(tagName)) {
    customElements.define(tagName, elementClass);
  }
}

/**
 * Регистрирует все custom elements
 */
export function registerCustomElements() {
  // Основные компоненты
  safeDefine("app-header", AppHeader);
  safeDefine("app-mobile-menu", AppMobileMenu);
  safeDefine("app-footer", AppFooter);
  safeDefine("app-favorite-property", AppFavoriteProperty);
  safeDefine("app-confirm-modal", AppConfirmModal);
  safeDefine("app-empty-state", AppEmptyState);

  // Дополнительные компоненты
  safeDefine("brand-button", BrandButton);
  safeDefine("custom-breadcrumb", CustomBreadcrumb);
  safeDefine("my-advertisement-card", MyAdvertisementCard);
  safeDefine("my-property-card", MyPropertyCard);
  safeDefine("simple-pagination", SimplePagination);
  safeDefine("property-list-component", PropertyListComponent);
  safeDefine("property-summary-card", PropertySummaryCard);
}
