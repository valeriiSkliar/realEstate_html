// src/js/pages/search.js - Скрипты для страницы поиска
import "../../scss/pages/_search.scss";
import { initSearchSortButton, initSidebarFilters } from "../components";
import { initPropertyCardExample } from "../components/property-card-example";
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

  // Initialize property card example
  initPropertyCardExample();
});
