// src/js/pages/search.js - Скрипты для страницы поиска
import "../../scss/pages/_search.scss";
import { initSearchSortButton, initSidebarFilters } from "../components";

export const initSearchPage = () => {
  const propertyType = document.querySelector("#property_type_select");
  const propertyRooms = document.querySelector("#property-rooms");

  function toggleRoomsVisibility() {
    propertyRooms.classList.toggle(
      "d-none",
      !["apartment", "house"].includes(propertyType.value)
    );
  }

  if (propertyType && propertyRooms) {
    toggleRoomsVisibility();

    propertyType.addEventListener("change", toggleRoomsVisibility);
  }

  if (document.querySelector("#search-sort-dropdown")) {
    initSearchSortButton();
  }

  initSidebarFilters();
};

initSearchPage();
