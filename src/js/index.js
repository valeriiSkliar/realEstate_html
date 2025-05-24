// src/js/index.js
import "bootstrap";
import "select2";

// Import the styles - make sure this line is not commented out
import "../scss/main.scss";

// Import custom elements for previews
import {
  AppConfirmModal,
  AppEmptyState,
  AppFavoriteProperty,
  AppFooter,
  AppHeader,
  AppMobileMenu,
} from "./custom_elements_for_preview";
// Register custom elements for previews
customElements.define("app-header", AppHeader);
customElements.define("app-mobile-menu", AppMobileMenu);
customElements.define("app-footer", AppFooter);
customElements.define("app-favorite-property", AppFavoriteProperty);
customElements.define("app-confirm-modal", AppConfirmModal);
customElements.define("app-empty-state", AppEmptyState);

import { initFavoriteButtons } from "./components/favorite-button";
import { initPropertyCardExample } from "./components/property-card-example";
import { initFavoritesPage } from "./favorites";
import { initMobileMenu, setCurrentYear } from "./menu";
import { initProfilePage } from "./profile";
import { initSearchPage } from "./search";
import { initSubscriptionsPage } from "./subscriptions";
import { initSupportPage } from "./support";

import { initCollectionsPage } from "./collections";
import { initCollectionsCreatePage } from "./collections-create";
import { initCollectionsEditPage } from "./collections-edit";
import { initSearchSortButton, initSidebarFilters } from "./components";
import { showModal } from "./utils/uiHelpers";
// import { initCollectionButtons } from "./components/collection-button";

// Initialize components when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Initialize home page
  if (document.querySelector(".search-page")) {
    initSearchPage();
  }
  // Initialize mobile menu
  initMobileMenu();

  // Set current year in footer
  setCurrentYear();

  if (document.querySelector(".profile-page")) {
    initProfilePage();
  }

  if (document.querySelector(".support-page")) {
    initSupportPage();
  }

  // Initialize subscriptions page if we're on that page
  if (document.querySelector(".subscriptions-page")) {
    initSubscriptionsPage();
  }

  if (document.querySelector(".favorites-page")) {
    initFavoritesPage();
  }

  // Initialize favorite buttons globally
  initFavoriteButtons();

  // Initialize property card example
  initPropertyCardExample();

  // Initialize collections pages
  if (document.querySelector(".collections-page")) {
    initCollectionsPage();
  }

  if (document.querySelector(".collections-create-page")) {
    initCollectionsCreatePage();
  }

  if (document.querySelector(".collections-edit-page")) {
    initCollectionsEditPage();
  }

  // Initialize search sort button
  if (document.querySelector("#search-sort-dropdown")) {
    initSearchSortButton();
  }

  // Initialize sidebar filters
  initSidebarFilters();
  // initCollectionButtons();

  document.body.addEventListener("listingAction", function (event) {
    const { action, id } = event.detail;
    console.log(`Listing action: ${action} for ID: ${id}`);
    // Based on 'action', show the corresponding modal
    // For example:
    if (action === "delete") {
      document.getElementById("deleteListingId").value = id;
      // Assuming you have a utility function showModal
      // import { showModal } from './utils/uiHelpers'; (if not already imported)
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
      window.location.href = `/listings-edit.html?id=${id}`; // Or your edit route
    }
  });
});
