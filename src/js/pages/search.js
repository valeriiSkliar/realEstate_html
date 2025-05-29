// src/js/pages/search.js - Скрипты для страницы поиска
import { initSearchSortButton, initSidebarFilters } from "../components";
import { initSearchPage } from "../search";

document.addEventListener("DOMContentLoaded", function () {
  // Initialize search page
  if (document.querySelector(".search-page")) {
    initSearchPage();
  }

  // Initialize search sort button
  if (document.querySelector("#search-sort-dropdown")) {
    initSearchSortButton();
  }

  // Initialize sidebar filters
  initSidebarFilters();
});
