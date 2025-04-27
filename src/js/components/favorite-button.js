import { isInFavorites, toggleFavorite } from "./favorites-manager";
import { createAndShowToast } from "../utils/uiHelpers";

/**
 * Initialize Favorite buttons functionality throughout the application
 * @param {string} selector - CSS selector for favorite buttons
 */
export const initFavoriteButtons = (selector = ".js-favorite-btn") => {
  const favoriteButtons = document.querySelectorAll(selector);

  favoriteButtons.forEach((button) => {
    const propertyId = button.getAttribute("data-property-id");

    // Set initial state
    if (propertyId) {
      updateButtonState(button, isInFavorites(propertyId));

      // Add click event listener
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        handleFavoriteClick(button, propertyId);
      });
    }
  });
};

/**
 * Create a new favorite button element
 * @param {string} propertyId - The ID of the property
 * @param {boolean} [initialState=false] - Initial favorite state
 * @returns {HTMLElement} The created button element
 */
export const createFavoriteButton = (propertyId, initialState = false) => {
  // Create button element
  const button = document.createElement("div");
  button.className = "favorite-btn js-favorite-btn";
  button.setAttribute("data-property-id", propertyId);

  // Create icon
  const icon = document.createElement("i");
  icon.className = "bi bi-heart";
  button.appendChild(icon);

  // Set initial state
  updateButtonState(button, initialState);

  // Add event listener
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    handleFavoriteClick(button, propertyId);
  });

  return button;
};

/**
 * Handle favorite button click
 * @param {HTMLElement} button - The button element
 * @param {string} propertyId - The ID of the property
 */
const handleFavoriteClick = (button, propertyId) => {
  console.log(`Favorite button clicked for property ${propertyId}`);

  // Toggle favorite status
  const isFavorite = toggleFavorite(propertyId);

  // Update button state
  updateButtonState(button, isFavorite);

  // Show notification
  if (isFavorite) {
    createAndShowToast("Added to favorites", "success");
  } else {
    createAndShowToast("Removed from favorites", "info");
  }
};

/**
 * Update button state based on favorite status
 * @param {HTMLElement} button - The button element
 * @param {boolean} isFavorite - Whether the property is a favorite
 */
const updateButtonState = (button, isFavorite) => {
  const icon = button.querySelector("i");

  if (isFavorite) {
    button.classList.add("is-active");
    if (icon) {
      icon.className = "bi bi-heart-fill";
    }
  } else {
    button.classList.remove("is-active");
    if (icon) {
      icon.className = "bi bi-heart";
    }
  }
};
