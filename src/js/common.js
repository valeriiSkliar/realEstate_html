// src/js/common.js - Общие скрипты для всех страниц
import "bootstrap";
import $ from "jquery";
import "select2";

// Глобально экспортируем jQuery для совместимости
window.$ = window.jQuery = $;

// Import the global styles
import "../scss/main.scss";

// Import common custom elements
import {
  AppConfirmModal,
  AppEmptyState,
  AppFavoriteProperty,
  AppFooter,
  AppHeader,
  AppMobileMenu,
} from "./custom_elements_for_preview";

// Register common custom elements
customElements.define("app-header", AppHeader);
customElements.define("app-mobile-menu", AppMobileMenu);
customElements.define("app-footer", AppFooter);
customElements.define("app-favorite-property", AppFavoriteProperty);
customElements.define("app-confirm-modal", AppConfirmModal);
customElements.define("app-empty-state", AppEmptyState);

// Import and initialize common components
import { setCurrentYear } from "./menu";
import { showModal } from "./utils/uiHelpers";

// Initialize common functionality when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Set current year in footer
  setCurrentYear();

  // Global listing action handler
  document.body.addEventListener("listingAction", function (event) {
    const { action, id } = event.detail;
    console.log(`Listing action: ${action} for ID: ${id}`);

    if (action === "delete") {
      document.getElementById("deleteListingId").value = id;
      showModal("deleteListingModal");
    } else if (action === "archive") {
      document.getElementById("archiveListingId").value = id;
      showModal("archiveListingModal");
    } else if (action === "restore") {
      document.getElementById("restoreListingId").value = id;
      showModal("restoreListingModal");
    } else if (action === "activate") {
      document.getElementById("activateListingId").value = id;
      showModal("activateListingModal");
    } else if (action === "edit") {
      window.location.href = `/listings-edit.html?id=${id}`;
    }
  });
});
