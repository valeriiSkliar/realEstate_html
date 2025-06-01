// src/js/pages/collections.js - Скрипты для страниц коллекций
import { initCollectionsPage } from "../temp/collections";
import { initCollectionsCreatePage } from "../temp/collections-create";
import { initCollectionsEditPage } from "../temp/collections-edit";

document.addEventListener("DOMContentLoaded", function () {
  // Initialize collections page
  if (document.querySelector(".collections-page")) {
    initCollectionsPage();
  }

  if (document.querySelector(".collections-create-page")) {
    initCollectionsCreatePage();
  }

  if (document.querySelector(".collections-edit-page")) {
    initCollectionsEditPage();
  }
});
