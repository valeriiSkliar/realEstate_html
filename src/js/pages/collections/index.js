// src/js/pages/collections.js - Скрипты для страниц коллекций
import { initCollectionPage } from "./collection-page";
import { initCollectionsCreatePage } from "./collections-create";
import { initCollectionsEditPage } from "./collections-edit";
import { initCollectionsPage } from "./collections-page";

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

  if (document.querySelector(".collection-page")) {
    initCollectionPage();
  }
});
