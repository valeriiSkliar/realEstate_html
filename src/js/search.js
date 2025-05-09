import {
  showModal,
  hideModal,
  showToast,
  createAndShowToast,
} from "./utils/uiHelpers";
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
};
