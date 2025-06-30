import {
  deleteCollection
} from "../../components/collections/api/collections-manager.js";
import {
  createAndShowToast,
  hideModal,
  showModal,
} from "../../utils/uiHelpers";

/**
 * Initialize collections page functionality
 */
export const initCollectionsPage = async () => {
  console.log("Collections page initialized");

  // Check if we have collections and show/hide empty state

  initDeleteButtons();
  // Initialize delete collection functionality
  initDeleteCollection();
};


/**
 * Initialize delete buttons
 */
function initDeleteButtons() {
  const deleteButtons = document.querySelectorAll(".js-delete-collection");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Get collection ID
      const apiUrl = button.getAttribute("data-api-url");

      if (apiUrl) {
        // Set collection ID in modal
        const deleteCollectionApiUrlInput =
          document.getElementById("deleteCollectionApiUrl");
        if (deleteCollectionApiUrlInput) {
          deleteCollectionApiUrlInput.value = apiUrl;
        }

        // Show confirmation modal
        showModal("deleteCollectionModal");
      }
    });
  });
};

/**
 * Initialize delete collection functionality
 */
const initDeleteCollection = async () => {
  const confirmDeleteButton = document.querySelector(".js-confirm-delete");

  if (confirmDeleteButton) {
    confirmDeleteButton.addEventListener("click", async () => {
      // Get collection ID from hidden input
      const apiUrl = document.getElementById("deleteCollectionApiUrl").value;

      if (apiUrl) {
        console.log(`Deleting collection ${apiUrl}`);

        // Delete collection
        try {
          const success = await deleteCollection(apiUrl);
          if (success.status) {
            // Show success message
            window.location.reload();
          } else {
            // Show error message
            createAndShowToast("Не удалось удалить коллекцию", "error");
          }
        } catch (error) {
          console.error("Error deleting collection", error);
          createAndShowToast("Не удалось удалить коллекцию", "error");
        }

        // Hide modal
        hideModal("deleteCollectionModal");
      }
    });
  }
};
