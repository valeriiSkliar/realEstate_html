// src/js/index.js - Главный файл для импорта всех скриптов
import "../scss/main.scss";
import "./bootstrap";

// // Импортируем общие скрипты
// import "./common";

// // Импортируем страничные скрипты
// import "./pages/collections";
// import "./pages/favorites";
// import "./pages/my-advertisements";
// import "./pages/search";
// import "./pages/subscriptions";

// import "bootstrap";
// import "select2";

// // Import the styles - make sure this line is not commented out

// // Import and register custom elements
import { registerCustomElements } from "./custom_elements_for_preview/connection";

// // Register all custom elements
registerCustomElements();

// import { initFavoritesPage } from "./favorites";
// import { setCurrentYear } from "./menu";
// import { initSearchPage } from "./search";
// import { initSubscriptionsPage } from "./subscriptions";
// import { initSupportPage } from "./support";

// import { initCollectionsPage } from "./collections";
// import { initCollectionsCreatePage } from "./collections-create";
// import { initCollectionsEditPage } from "./collections-edit";
// import { initSearchSortButton, initSidebarFilters } from "./components";
// import { showModal } from "./utils/uiHelpers";
// // import { initCollectionButtons } from "./components/collection-button";

// // Initialize components when DOM is ready
// document.addEventListener("DOMContentLoaded", function () {
//   // Initialize home page
//   if (document.querySelector(".search-page")) {
//     initSearchPage();
//   }

//   // Set current year in footer
//   setCurrentYear();

//   if (document.querySelector(".support-page")) {
//     initSupportPage();
//   }

//   // Initialize subscriptions page if we're on that page
//   if (document.querySelector(".subscriptions-page")) {
//     initSubscriptionsPage();
//   }

//   if (document.querySelector(".favorites-page")) {
//     initFavoritesPage();
//   }

//   // Initialize collections pages
//   if (document.querySelector(".collections-page")) {
//     initCollectionsPage();
//   }

//   if (document.querySelector(".collections-create-page")) {
//     initCollectionsCreatePage();
//   }

//   if (document.querySelector(".collections-edit-page")) {
//     initCollectionsEditPage();
//   }

//   // Initialize search sort button
//   if (document.querySelector("#search-sort-dropdown")) {
//     initSearchSortButton();
//   }

//   // Initialize sidebar filters
//   initSidebarFilters();
//   // initCollectionButtons();

//   document.body.addEventListener("listingAction", function (event) {
//     const { action, id } = event.detail;
//     console.log(`Listing action: ${action} for ID: ${id}`);
//     // Based on 'action', show the corresponding modal
//     // For example:
//     if (action === "delete") {
//       document.getElementById("deleteListingId").value = id;
//       // Assuming you have a utility function showModal
//       // import { showModal } from './utils/uiHelpers'; (if not already imported)
//       showModal("deleteListingModal");
//     } else if (action === "archive") {
//       document.getElementById("archiveListingId").value = id;
//       showModal("archiveListingModal");
//     } else if (action === "restore") {
//       document.getElementById("restoreListingId").value = id;
//       showModal("restoreListingModal");
//     } else if (action === "activate") {
//       document.getElementById("activateListingId").value = id;
//       showModal("activateListingModal");
//     } else if (action === "edit") {
//       window.location.href = `/listings-edit.html?id=${id}`; // Or your edit route
//     }
//   });
// });

// components
import "./components/index";
import { initializeReportForm } from "./components/report-form.js";

document.addEventListener("DOMContentLoaded", () => {
  initializeReportForm();
  // initSelect2();
});

// Импортируем страничные скрипты
import { initHeader } from "./components/index";
import "./pages/add-listing";
import "./pages/collections";
import "./pages/my-advertisements";
import "./pages/profile";
import "./pages/property-page";
import "./pages/search";
import "./pages/subscriptions";
import "./pages/support";

document.addEventListener("DOMContentLoaded", function () {
  initHeader(document.querySelector("body"));
});
