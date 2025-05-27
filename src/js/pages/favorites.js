// src/js/pages/favorites.js - Скрипты для страницы избранного
import { initFavoritesPage } from "../favorites";

document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".favorites-page")) {
    initFavoritesPage();
  }
});
