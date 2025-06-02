import { hideModal, showModal } from "../utils/uiHelpers";
import {
  getCollectionById,
  removePropertyFromCollection,
  updateCollection,
} from "./collections-manager";

import {
  createAndShowToast,
  createForm,
  validators,
} from "../forms/index.js";

const collectionsEditSchema = {
  collectionName: [
    validators.required("Введите название коллекции"),
    validators.minLength(3, "Название должно содержать минимум 3 символа"),
    validators.maxLength(50, "Название не должно превышать 50 символов"),
  ],
};


const collectionsEditHandler = {
  async onSubmit(data, formData) {
    console.log("📝 Отправка формы...", data);
  },
  onSuccess(result) {
    console.log("🎉 Успех!", result);
    createAndShowToast("Коллекция успешно обновлена!", "success");
    window.location.href = "/collections.html";
  },

  onError(errors) {
    console.log("⚠️ Ошибки валидации:", errors);
    createAndShowToast("Проверьте заполнение полей", "warning");
  },

  onServerError(errors) {
    console.log("💥 Серверные ошибки:", errors);
    createAndShowToast("Ошибка сервера", "danger");
  },
};




/**
 * Initialize collections edit page functionality
 */
export const initCollectionsEditPage = () => {
  console.log("Collections edit page initialized");

  // Get collection ID from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const collectionId = urlParams.get("id");

  if (!collectionId) {
    // No collection ID provided, redirect to collections page
    window.location.href = "/collections.html";
    return;
  }

  // Store collection ID in hidden field
  document.getElementById("collectionId").value = collectionId;

  const saveButton = document.querySelector(".js-save-collection");
  const form = document.getElementById("collectionId");
console.log(form);

  if (saveButton && form) {
    // Initialize form validation
    const formManager = createForm(form, collectionsEditSchema, {
      onSubmit: collectionsEditHandler.onSubmit.bind(collectionsEditHandler),
      onSuccess: collectionsEditHandler.onSuccess,
      onError: collectionsEditHandler.onError,
      onServerError: collectionsEditHandler.onServerError,
      validateOnBlur: true,
      validateOnChange: false,
      scrollToError: true,
    });

    formManager.init();

  // Load collection data
  loadCollectionData(collectionId);

  // Initialize collection save functionality
  initSaveCollection(formManager);
};

/**
 * Load collection data
 * @param {string} collectionId - ID of the collection to load
 */
function loadCollectionData(collectionId) {
  const collection = getCollectionById(collectionId);

  if (!collection) {
    // Collection not found, redirect to collections page
    createAndShowToast("Collection not found", "error");
    window.location.href = "/collections.html";
    return;
  }

  if (collection.isFavorite) {
    const inputCollectionName = document.getElementById('collectionName');
    inputCollectionName.disabled = true;
  }

  // Populate form fields with collection data
  document.getElementById("collectionName").value = collection.name || "";
  // document.getElementById("clientName").value = collection.clientName || "";
  // document.getElementById("clientEmail").value = collection.clientEmail || "";
  // document.getElementById("clientPhone").value = collection.clientPhone || "";
  document.getElementById("collectionNotes").value =
    collection.description || "";

  // Populate search parameters
  if (collection.parameters) {
    const params = collection.parameters;

    if (params.propertyType) {
      document.getElementById("propertyType").value = params.propertyType;
    }

    if (params.dealType) {
      document.getElementById("dealType").value = params.dealType;
    }

    if (params.location) {
      document.getElementById("location").value = params.location;
    }

    if (params.size) {
      if (params.size.min)
        document.getElementById("propertySizeMin").value = params.size.min;
      if (params.size.max)
        document.getElementById("propertySizeMax").value = params.size.max;
    }

    if (params.price) {
      if (params.price.min)
        document.getElementById("priceMin").value = params.price.min;
      if (params.price.max)
        document.getElementById("priceMax").value = params.price.max;
    }

    if (params.rooms) {
      if (params.rooms.min)
        document.getElementById("roomsMin").value = params.rooms.min;
      if (params.rooms.max)
        document.getElementById("roomsMax").value = params.rooms.max;
    }
  }

  // Load current properties
  loadCurrentProperties(collection.properties || []);
};

/**
 * Load current properties in the collection
 * @param {Array} propertyIds - Array of property IDs
 */
function loadCurrentProperties(propertyIds) {
  const currentPropertiesContainer = document.querySelector(
    ".js-current-properties"
  );
  const emptyCollectionMessage = document.querySelector(".js-empty-collection");
  const currentCountElement = document.querySelector(".current-count");

  if (currentCountElement) {
    currentCountElement.textContent = propertyIds.length;
  }

  if (!currentPropertiesContainer) return;

  // Clear container
  currentPropertiesContainer.innerHTML = "";

  if (propertyIds.length === 0) {
    // Show empty collection message
    if (emptyCollectionMessage) {
      emptyCollectionMessage.style.display = "flex";
    }
    return;
  }

  // Hide empty collection message
  if (emptyCollectionMessage) {
    emptyCollectionMessage.style.display = "none";
  }

  // For demo purposes, we'll create sample property cards based on IDs
  propertyIds.forEach((id) => {
    // Get sample property data based on ID
    const property = getSamplePropertyById(id);

    if (property) {
      const propertyCard = createPropertyCard(property, id);
      currentPropertiesContainer.appendChild(propertyCard);
    }
  });

  // Initialize remove property buttons
  initRemovePropertyButtons();
};

/**
 * Initialize remove property buttons
 */
function initRemovePropertyButtons() {
  const removeButtons = document.querySelectorAll(".js-remove-property");

  removeButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Get property ID
      const propertyId = button.getAttribute("data-property-id");

      if (propertyId) {
        // Set property ID in modal
        document.getElementById("removePropertyId").value = propertyId;

        // Show confirmation modal
        showModal("removePropertyModal");
      }
    });
  });

  // Handle confirm remove button
  const confirmRemoveButton = document.querySelector(
    ".js-confirm-remove-property"
  );
  if (confirmRemoveButton) {
    confirmRemoveButton.addEventListener("click", () => {
      const propertyId = document.getElementById("removePropertyId").value;
      const collectionId = document.getElementById("collectionId").value;

      if (propertyId && collectionId) {
        // Remove property from collection
        const success = removePropertyFromCollection(collectionId, propertyId);

        if (success) {
          // Remove property card from DOM
          const propertyCard = document.querySelector(
            `[data-property-id="${propertyId}"]`
          );
          if (propertyCard) {
            propertyCard.remove();
          }

          // Update property count
          const currentCount = document.querySelector(".current-count");
          if (currentCount) {
            const count = parseInt(currentCount.textContent) - 1;
            currentCount.textContent = count;

            // Show empty collection message if no properties left
            if (count === 0) {
              const emptyCollectionMessage = document.querySelector(
                ".js-empty-collection"
              );
              if (emptyCollectionMessage) {
                emptyCollectionMessage.style.display = "flex";
              }
            }
          }

          // Show success message
          createAndShowToast("Property removed from collection", "success");
        } else {
          // Show error message
          createAndShowToast("Failed to remove property", "error");
        }

        // Hide modal
        hideModal("removePropertyModal");
      }
    });
  }
};


/**
 * Initialize collection save functionality
 */
function initSaveCollection(formManagerProps) {
  const saveButton = document.querySelector(".js-save-collection");

  if (saveButton) {
    saveButton.addEventListener("click", (e) => {

      formManagerProps.handleSubmit(e);
      const isValid = formManagerProps.isValid();
      if (!isValid) return;

      // Get collection ID
      const collectionId = document.getElementById("collectionId").value;

      if (!collectionId) return;

      // Get collection data
      const collection = getCollectionById(collectionId);
      if (!collection) return;

      // Get form data
      const collectionName = document
        .getElementById("collectionName")
        .value.trim();

      const collectionNotes =
        document.getElementById("collectionNotes")?.value || "";

      // Create updated collection object
      const updatedCollectionData = {
        name: collectionName,
        description: collectionNotes,
        properties: collection.properties,
      };

      // Update collection
      const success = updateCollection(collectionId, updatedCollectionData);

      if (success) {
        // Show success modal
        // showModal("collectionUpdateSuccessModal");

      } else {
        // Show error message
        createAndShowToast("Failed to update collection", "error");
      }
    });
  }
};
};