/**
 * @file favorites.js
 * @description Manages the UI and interactions for the Favorites page.
 * This module is responsible for displaying favorited properties, handling their removal,
 * and updating the view accordingly. The main entry point for this module is the
 * `initFavoritesPage()` function, which should be called when the favorites page loads.
 *
 * Key functionalities:
 * - Displaying the list of favorited properties or an 'empty' state.
 * - Initializing event listeners for 'remove from favorites' buttons.
 * - Handling the confirmation modal for removals.
 * - Interacting with `favorites-manager.js` for data operations (get/remove favorites).
 * - Using `uiHelpers.js` for common UI tasks like toasts and modals.
 */

import { createAndShowToast, hideModal, showModal } from "../utils/uiHelpers";
import {
  getFavorites,
  removeFromFavorites,
} from "./components/favorites-manager";

// --- MAIN INITIALIZATION --- //

/**
 * Initializes all functionality for the Favorites page.
 * This is the primary entry point for this module.
 * It sets up the initial view and initializes event listeners for user interactions.
 */
export const initFavoritesPage = () => {
  console.log("[FavoritesPage] Initializing...");

  // Set the initial state of the favorites list (empty or populated)
  updateFavoritesView();

  // Initialize functionality for removing items from favorites
  initRemoveFavorites();

  console.log("[FavoritesPage] Initialization complete.");
};

// --- SUB-INITIALIZERS & EVENT HANDLERS --- //

/**
 * Initialize the 'remove from favorites' functionality.
 * Sets up event listeners for all 'remove' buttons on property cards and the confirmation modal.
 */
const initRemoveFavorites = () => {
  const removeButtons = document.querySelectorAll(".js-remove-favorite");
  const confirmRemoveButton = document.querySelector(".js-confirm-remove");
  const removeFavoriteModalElement = document.getElementById("removeFavoriteModal");

  if (!removeFavoriteModalElement) {
    console.error("[FavoritesPage] Remove confirmation modal (ID: removeFavoriteModal) not found. Cannot init remove functionality.");
    return;
  }
  if (!confirmRemoveButton) {
     console.warn("[FavoritesPage] Confirm remove button (.js-confirm-remove) not found. Modal might not function correctly.");
     // Decide if this is critical enough to return, or just log.
  }

  // Add click handler to each 'remove' button on property cards
  removeButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const propertyId = button.getAttribute("data-property-id");
      if (propertyId) {
        removeFavoriteModalElement.setAttribute("data-property-to-remove", propertyId);
        showModal("removeFavoriteModal");
        console.log(`[FavoritesPage] Confirmation requested for removing property ${propertyId}.`);
      } else {
        console.warn("[FavoritesPage] Remove button clicked, but no data-property-id found.");
      }
    });
  });

  // Handle the click on the 'confirm removal' button in the modal
  // Ensure confirmRemoveButton exists before adding listener to prevent errors if it's missing
  if (confirmRemoveButton) {
    confirmRemoveButton.addEventListener("click", () => {
      const propertyId = removeFavoriteModalElement.getAttribute("data-property-to-remove");
      if (propertyId) { // Ensure propertyId was actually set
        handleConfirmedRemoveFavorite(propertyId);
        removeFavoriteModalElement.removeAttribute("data-property-to-remove");
      } else {
        console.warn("[FavoritesPage] Confirm remove clicked, but no propertyId found on modal. Hiding modal.");
        hideModal("removeFavoriteModal"); // Hide modal to prevent being stuck
      }
    });
  } 
  // No 'else' needed here if the warning for missing confirmRemoveButton is sufficient above.
};

/**
 * Handles the actual process of removing a favorite property after user confirmation.
 * This function is called when the user clicks 'confirm' in the removal modal.
 * @param {string} propertyId - The ID of the property to remove.
 */
const handleConfirmedRemoveFavorite = (propertyId) => {
  // PropertyId is already checked by the caller in the event listener, 
  // but a defensive check here wouldn't hurt if this function were to be called from elsewhere.
  // if (!propertyId) {
  //   console.error("[FavoritesPage] handleConfirmedRemoveFavorite called without propertyId.");
  //   return;
  // }

  console.log(`[FavoritesPage] Confirmed removal for property ${propertyId}.`);

  // Step 1: Remove from data storage (e.g., localStorage)
  const success = removeFromFavorites(propertyId);

  if (!success) {
    console.warn(`[FavoritesPage] Failed to remove property ${propertyId} from favorites data store.`);
    createAndShowToast("Ошибка при удалении из избранного. Попробуйте еще раз.", "error");
    // Do not hide modal here, user might want to retry or see the state.
    return; // Exit early if data removal failed
  }

  // Step 2: Remove the property card from the DOM
  const propertyCard = document.querySelector(`[data-property-id="${propertyId}"]`);
  if (propertyCard) {
    propertyCard.remove();
    console.log(`[FavoritesPage] Property card ${propertyId} removed from DOM.`);
  } else {
    console.warn(`[FavoritesPage] Property card ${propertyId} not found in DOM for removal, but data was removed.`);
  }

  // Step 3: Show success message to the user
  createAndShowToast("Объект удален из избранного", "success");

  // Step 4: Update the overall favorites view (e.g., show 'empty' state if no favorites left)
  updateFavoritesView();

  // Step 5: Hide the confirmation modal as the process is complete
  hideModal("removeFavoriteModal");
};

// --- VIEW UPDATERS / UTILITIES --- //

/**
 * Updates the favorites page view based on the current number of favorites.
 * Shows an 'empty state' message if no favorites exist, otherwise displays the list.
 */
const updateFavoritesView = () => {
  const favorites = getFavorites(); // Assumes this returns an array
  const emptyStateElement = document.querySelector(".js-empty-favorites");
  const favoritesListElement = document.querySelector(".js-favorites-list");

  if (!emptyStateElement || !favoritesListElement) {
    console.warn("[FavoritesPage] Empty state or favorites list element not found. Cannot update view.");
    return;
  }

  if (!favorites || favorites.length === 0) {
    emptyStateElement.style.display = "flex"; // Or 'block', depending on CSS
    favoritesListElement.style.display = "none";
    console.log("[FavoritesPage] No favorites to display. Showing empty state.");
  } else {
    emptyStateElement.style.display = "none";
    favoritesListElement.style.display = "block"; // Or 'grid'/'flex' etc., depending on layout
    console.log(`[FavoritesPage] Displaying ${favorites.length} favorited items.`);
  }
};
