import { createAndShowToast, hideModal, showModal } from "../utils/uiHelpers";
import {
  getFavorites,
  removeFromFavorites,
} from "./components/favorites-manager";

/**
 * Initialize favorites page functionality
 */
export const initFavoritesPage = () => {
  console.log("Favorites page initialized");

  // Check if we have favorites and show/hide empty state
  // updateFavoritesView();

  // Initialize remove from favorites functionality
  initRemoveFavorites();
};

/**
 * Update the favorites view based on current favorites
 */
const updateFavoritesView = () => {
  const favorites = getFavorites();
  const emptyState = document.querySelector(".js-empty-favorites");
  const favoritesList = document.querySelector(".js-favorites-list");

  // Show empty state if no favorites
  if (!favorites || favorites.length === 0) {
    if (emptyState) emptyState.style.display = "flex";
    if (favoritesList) favoritesList.style.display = "none";
  } else {
    if (emptyState) emptyState.style.display = "none";
    if (favoritesList) favoritesList.style.display = "block";
  }
};

/**
 * Initialize the remove from favorites functionality
 */
const initRemoveFavorites = () => {
  // Get all remove buttons
  const removeButtons = document.querySelectorAll(".js-remove-favorite");
  const confirmRemoveButton = document.querySelector(".js-confirm-remove");
  let currentPropertyId = null;

  // Add click handler to each remove button
  removeButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Get property ID from data attribute
      currentPropertyId = button.getAttribute("data-property-id");

      // Show confirmation modal
      showModal("removeFavoriteModal");
    });
  });

  // Handle confirmation button click
  if (confirmRemoveButton) {
    confirmRemoveButton.addEventListener("click", () => {
      if (currentPropertyId) {
        console.log(`Removing property ${currentPropertyId} from favorites`);

        // Remove from favorites
        removeFromFavorites(currentPropertyId);

        // Remove the property card from DOM
        const propertyCard = document.querySelector(
          `[data-property-id="${currentPropertyId}"]`
        );
        if (propertyCard) {
          propertyCard.remove();

          // Show success message
          createAndShowToast("Property removed from favorites", "success");

          // Update view (check if we need to show empty state)
          updateFavoritesView();
        }

        // Hide modal
        hideModal("removeFavoriteModal");

        // Reset current property ID
        currentPropertyId = null;
      }
    });
  }
};
