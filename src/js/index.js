// src/js/index.js - Главный файл для импорта всех скриптов
import "../scss/main.scss";
import "./bootstrap";
import {
  initBackButton,
  setDefaultBackHandler
} from "./components/tg-mini-app/back-button";

function initTgMiniAppBackButton() {
  initBackButton();
  setDefaultBackHandler();
}

initTgMiniAppBackButton();

// // Import and register custom elements
import { registerCustomElements } from "./custom_elements_for_preview/connection";

// // Register all custom elements
registerCustomElements();

// components
import "./components/index";

// Импортируем страничные скрипты
import { initHeader } from "./components/index";
import { initializeReportForm } from "./components/property-page/report-form";
import "./pages/add-listing";
import "./pages/collections"; // logic for collections pages
import "./pages/edit-listing";
import "./pages/my-advertisements";
import "./pages/profile";
import "./pages/property-page";
import "./pages/property-view-logic"; // logic for add to favorite && add to collection
import "./pages/search";
import "./pages/search-page-logic"; // logic for add to favorite && add to collection
import "./pages/subscriptions";
import "./pages/support";

document.addEventListener("DOMContentLoaded", function () {
  initHeader(document.querySelector("body"));
});

document.addEventListener("DOMContentLoaded", () => {
  initializeReportForm();
  // initSelect2();
});
