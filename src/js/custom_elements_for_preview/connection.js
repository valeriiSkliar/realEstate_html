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
 * Регистрирует все custom elements
 */
export function registerCustomElements() {
  // Основные компоненты
  customElements.define("app-header", AppHeader);
  customElements.define("app-mobile-menu", AppMobileMenu);
  customElements.define("app-footer", AppFooter);
  customElements.define("app-favorite-property", AppFavoriteProperty);
  customElements.define("app-confirm-modal", AppConfirmModal);
  customElements.define("app-empty-state", AppEmptyState);

  // Дополнительные компоненты
  customElements.define("brand-button", BrandButton);
  customElements.define("custom-breadcrumb", CustomBreadcrumb);
  customElements.define("my-advertisement-card", MyAdvertisementCard);
  customElements.define("my-property-card", MyPropertyCard);
  customElements.define("simple-pagination", SimplePagination);
  customElements.define("property-list-component", PropertyListComponent);
  customElements.define("property-summary-card", PropertySummaryCard);
}
