// src/js/index.js
import "bootstrap";
import $ from "jquery";
import { format } from "date-fns";

// Import the styles - make sure this line is not commented out
import "../scss/main.scss";

import { initMobileMenu, setCurrentYear } from "./menu";
import { initProfilePage } from "./profile";
import { initHomePage } from "./home";
import { initSupportPage } from "./support";
import { initSubscriptionsPage } from "./subscriptions";
import { initFavoritesPage } from "./favorites";
import { initFavoriteButtons } from "./components/favorite-button";

// Initialize components when DOM is ready
$(document).ready(function () {
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

  // Additional initialization code here
  console.log("Styles should be loaded!");
});
