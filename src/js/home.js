import {
  showModal,
  hideModal,
  showToast,
  createAndShowToast,
} from "./utils/uiHelpers";
// Home page specific JavaScript
console.log("Home page loaded");

/**
 * Initialize profile page functionality
 */
export const initHomePage = () => {
  createAndShowToast("Test toast for home page!", "success");

  const testModalButton = document.querySelector(".js-test-modal-trigger");
  if (testModalButton) {
    testModalButton.addEventListener("click", () => {
      showModal("testModal");
    });
  }
};
