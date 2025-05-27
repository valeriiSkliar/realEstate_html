// src/js/pages/support.js - Скрипты для страницы поддержки
import { initSupportPage } from "../support";

document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".support-page")) {
    initSupportPage();
  }
});
