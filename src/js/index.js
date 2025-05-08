// src/js/index.js
// import "bootstrap";
// import * as bootstrap from "bootstrap";

import $ from "jquery";
import { format } from "date-fns";

// Import the styles - make sure this line is not commented out
import "../scss/main.scss";

// Import custom elements for previews
import {
  AppHeader,
  AppMobileMenu,
  AppFooter,
  AppFavoriteProperty,
  AppConfirmModal,
  AppEmptyState,
} from "./custom_elements_for_preview";
// Register custom elements for previews
customElements.define("app-header", AppHeader);
customElements.define("app-mobile-menu", AppMobileMenu);
customElements.define("app-footer", AppFooter);
customElements.define("app-favorite-property", AppFavoriteProperty);
customElements.define("app-confirm-modal", AppConfirmModal);
customElements.define("app-empty-state", AppEmptyState);

import { initMobileMenu, setCurrentYear } from "./menu";
import { initProfilePage } from "./profile";
import { initHomePage } from "./home";
import { initSupportPage } from "./support";
import { initSubscriptionsPage } from "./subscriptions";
import { initFavoritesPage } from "./favorites";
import { initFavoriteButtons } from "./components/favorite-button";
import { initPropertyCardExample } from "./components/property-card-example";

import { initCollectionsPage } from "./collections";
import { initCollectionsCreatePage } from "./collections-create";
import { initCollectionsEditPage } from "./collections-edit";
// import { initCollectionButtons } from "./components/collection-button";

// Initialize components when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Initialize home page
  if (document.querySelector(".home-page")) {
    initHomePage();
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

  // Initialize collection buttons globally
  // initCollectionButtons();

  console.log("Styles should be loaded!");
});
