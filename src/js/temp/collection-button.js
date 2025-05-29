import { createAndShowToast, hideModal, showModal } from "../utils/uiHelpers";
import { addPropertyToCollection, getCollections } from "./collections-manager";

/**
 * Initialize Collection buttons functionality throughout the application
 * @param {string} selector - CSS selector for collection buttons
 */
export const initCollectionButtons = (selector = ".js-collection-btn") => {
  const collectionButtons = document.querySelectorAll(selector);

  collectionButtons.forEach((button) => {
    const propertyId = button.getAttribute("data-property-id");

    if (propertyId) {
      // Add click event listener
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        handleCollectionClick(propertyId);
      });
    }
  });

  // Initialize the Add to Collection modal functionality
  initAddToCollectionModal();
};

/**
 * Create a new collection button element
 * @param {string} propertyId - The ID of the property
 * @returns {HTMLElement} The created button element
 */
export const createCollectionButton = (propertyId) => {
  // Create button element
  const button = document.createElement("div");
  button.className = "collection-btn js-collection-btn";
  button.setAttribute("data-property-id", propertyId);

  // Create icon
  const icon = document.createElement("i");
  icon.className = "bi bi-collection";
  button.appendChild(icon);

  // Add event listener
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    handleCollectionClick(propertyId);
  });

  return button;
};

/**
 * Handle collection button click
 * @param {string} propertyId - The ID of the property
 */
const handleCollectionClick = (propertyId) => {
  console.log(`Collection button clicked for property ${propertyId}`);

  // Get all collections to populate the modal
  const collections = getCollections();

  // Set property ID to hidden input in modal
  const propertyIdInput = document.getElementById("collectionPropertyId");
  if (propertyIdInput) {
    propertyIdInput.value = propertyId;
  }

  // Clear previous collection list in modal
  const collectionsList = document.querySelector(".collections-list");
  if (collectionsList) {
    collectionsList.innerHTML = "";

    // Populate collections list in modal
    if (collections.length > 0) {
      collections.forEach((collection) => {
        const listItem = document.createElement("div");
        listItem.className = "form-check collection-option";

        const input = document.createElement("input");
        input.className = "form-check-input";
        input.type = "radio";
        input.name = "collectionId";
        input.id = `collection-${collection.id}`;
        input.value = collection.id;

        const label = document.createElement("label");
        label.className = "form-check-label";
        label.htmlFor = `collection-${collection.id}`;
        label.textContent = collection.name;

        listItem.appendChild(input);
        listItem.appendChild(label);
        collectionsList.appendChild(listItem);
      });

      // Show the collections list
      document.querySelector(".collections-container").style.display = "block";
      document.querySelector(".no-collections-message").style.display = "none";
    } else {
      // Show "no collections" message
      document.querySelector(".collections-container").style.display = "none";
      document.querySelector(".no-collections-message").style.display = "block";
    }
  }

  // Show the modal
  showModal("addToCollectionModal");
};

/**
 * Initialize the Add to Collection modal functionality
 */
const initAddToCollectionModal = () => {
  // Handle Add to Collection button click in modal
  const addToCollectionButton = document.querySelector(".js-add-to-collection");
  if (addToCollectionButton) {
    addToCollectionButton.addEventListener("click", () => {
      // Get property ID from hidden input
      const propertyId = document.getElementById("collectionPropertyId").value;

      // Get selected collection
      const selectedCollection = document.querySelector(
        'input[name="collectionId"]:checked'
      );

      if (selectedCollection) {
        const collectionId = selectedCollection.value;

        // Add property to collection
        const success = addPropertyToCollection(collectionId, propertyId);

        // Show notification
        if (success) {
          createAndShowToast("Property added to collection", "success");
        } else {
          createAndShowToast("Property already in this collection", "info");
        }

        // Hide modal
        hideModal("addToCollectionModal");
      } else {
        // No collection selected
        createAndShowToast("Please select a collection", "warning");
      }
    });
  }

  // Handle Create New Collection button click in modal
  const createCollectionButton = document.querySelector(
    ".js-create-collection"
  );
  if (createCollectionButton) {
    createCollectionButton.addEventListener("click", () => {
      // Get property ID from hidden input
      const propertyId = document.getElementById("collectionPropertyId").value;

      // Store property ID in session storage for use in collection creation form
      if (propertyId) {
        sessionStorage.setItem("pendingPropertyForCollection", propertyId);
      }

      // Hide current modal
      hideModal("addToCollectionModal");

      // Redirect to collection creation page
      window.location.href = "/collections-create.html";
    });
  }
};
