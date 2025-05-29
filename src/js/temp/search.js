import { createAndShowToast, showModal } from "../utils/uiHelpers";
// Home page specific JavaScript

/**
 * Initialize profile page functionality
 */
export const initSearchPage = () => {
  createAndShowToast("Test toast for home page!", "success");

  const testModalButton = document.querySelector(".js-test-modal-trigger");
  if (testModalButton) {
    testModalButton.addEventListener("click", () => {
      showModal("testModal");
    });
  }

  // Toggle rooms visibility based on property type
  const propertyType = document.querySelector("#property_type_select");
  const propertyRooms = document.querySelector("#property-rooms");

  function toggleRoomsVisibility() {
    propertyRooms.classList.toggle(
      "d-none",
      !["apartment", "house"].includes(propertyType.value)
    );
  }

  if (propertyType && propertyRooms) {
    // Initial visibility check
    toggleRoomsVisibility();

    // Listen for changes
    propertyType.addEventListener("change", toggleRoomsVisibility);
  }
};
