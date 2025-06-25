/**
 * Collection Selector Popup Component
 * Allows users to add properties to collections
 */
import {
  addPropertyToCollection,
  createCollection,
  favoriteCollectionId,
  getCollections,
  getCollectionsWithProperty
} from "../api/collections-manager";

import { clearAllToasts, createAndShowToast } from "../../../utils/uiHelpers";

// DOM element IDs and classes
const POPUP_ID = "collection-selector-popup";
const POPUP_CONTAINER_CLASS = "collection-selector-popup-container";
const POPUP_BACKDROP_CLASS = "collection-selector-popup-backdrop";

// Variable to track if user has interacted with popup
let userInteracted = false;

// Timer for auto-removal
let autoRemoveTimerToast = null;

/**
 * Create and show the collection selector popup
 * @param {string} propertyId - ID of the property to add to collection
 * @param {string} propertyTitle - Title of the property (for display in toast)
 */
export const showCollectionSelectorPopup = async (propertyId, propertyTitle) => {
  // Clear any existing toasts
  clearAllToasts();

  // Get all collections (excluding favorites for the popup display)
  let collections = await getCollections();
  // Get collections that already contain this property
  let collectionsWithProperty = await getCollectionsWithProperty(propertyId)
    

    if (!collections || !collectionsWithProperty) {
      createAndShowToast("Не удалось загрузить коллекции", "error");
      return;
    }
    
    
  // Filter out favorite collections
  collections = collections.filter(
    (collection) => !collection.isFavorite
  );

  // Filter out favorite collections
  collectionsWithProperty = collectionsWithProperty.filter(
    (collection) => !collection.isFavorite
  );

  const collectionsWithPropertyIds = collectionsWithProperty.map((c) => c.id);

  // Find existing popup elements
  const popupContainer = document.getElementById(POPUP_ID);
  const backdrop = document.querySelector(`.${POPUP_BACKDROP_CLASS}`);
  
  if (!popupContainer || !backdrop) {
    console.error("Popup elements not found in DOM");
    return;
  }

  // Get popup content elements
  const listContainer = popupContainer.querySelector(".collection-selector-popup__list-container");
  const emptyContainer = popupContainer.querySelector(".collection-selector-popup__empty");
  const listElement = popupContainer.querySelector(".collection-selector-popup__list");
  const createNewContainer = popupContainer.querySelector(".collection-selector-popup__create-new-container");
  const newCollectionNameInput = popupContainer.querySelector("#newCollectionNameInput");

  // Update list content
  if (collections.length === 0) {
    if (emptyContainer) emptyContainer.style.display = "block";
    if (listElement) listElement.style.display = "none";
  } else {
    if (emptyContainer) emptyContainer.style.display = "none";
    if (listElement) {
      listElement.style.display = "block";
      listElement.innerHTML = collections
        .map(
          (collection) => `
            <div class="collection-selector-popup__item" data-collection-id="${
              collection.id
            }">
              <div class="collection-selector-popup__item-checkbox">
                <input type="checkbox" id="collection-${collection.id}" 
                  ${
                    collectionsWithPropertyIds.includes(collection.id)
                      ? "checked"
                      : ""
                  }
                  ${
                    collection.isFavorite &&
                    collectionsWithPropertyIds.includes(collection.id)
                      ? "disabled"
                      : ""
                  }
                >
                <label for="collection-${collection.id}"></label>
              </div>
              <div class="collection-selector-popup__item-info">
                <div class="collection-selector-popup__item-name">
                  ${
                    collection.isFavorite
                      ? '<i class="bi bi-star-fill"></i> '
                      : ""
                  }${collection.name}
                </div>
                <div class="collection-selector-popup__item-count">
                  <i class="bi bi-building"></i> ${
                    collection.properties ? collection.properties.length : 0
                  } объектов
                </div>
              </div>
            </div>
          `
        )
        .join("");
    }
  }

  // Reset create new container
  if (createNewContainer) createNewContainer.style.display = "none";
  if (newCollectionNameInput) newCollectionNameInput.value = "";

  // Get control elements
  const closeBtn = popupContainer.querySelector(".collection-selector-popup__close");
  const createNewBtn = popupContainer.querySelector(".collection-selector-popup__create-new-btn");
  const cancelBtn = popupContainer.querySelector(".collection-selector-popup__cancel-btn");
  const saveBtn = popupContainer.querySelector(".collection-selector-popup__save-btn");

  // Reset button states
  if (createNewBtn) createNewBtn.style.display = "inline-block";
  if (saveBtn) saveBtn.textContent = "Готово";

  // Remove existing event listeners by cloning elements
  const cloneAndReplace = (element) => {
    if (element) {
      const newElement = element.cloneNode(true);
      element.parentNode.replaceChild(newElement, element);
      return newElement;
    }
    return null;
  };

  const newCloseBtn = cloneAndReplace(closeBtn);
  const newCreateNewBtn = cloneAndReplace(createNewBtn);
  const newCancelBtn = cloneAndReplace(cancelBtn);
  const newSaveBtn = cloneAndReplace(saveBtn);
  const newBackdrop = cloneAndReplace(backdrop);

  let isCreateMode = false;

  const switchToCreateMode = () => {
    isCreateMode = true;
    if (listContainer) listContainer.style.display = "none";
    if (createNewContainer) createNewContainer.style.display = "block";
    if (newCreateNewBtn) newCreateNewBtn.style.display = "none";
    if (newSaveBtn) newSaveBtn.textContent = "Сохранить и добавить";
    if (newCollectionNameInput) {
      newCollectionNameInput.value = ""; // Clear previous input
      // newCollectionNameInput.focus();
    }
  };

  const switchToViewMode = () => {
    isCreateMode = false;
    if (listContainer) listContainer.style.display = "block";
    if (createNewContainer) createNewContainer.style.display = "none";
    if (newCreateNewBtn) newCreateNewBtn.style.display = "inline-block";
    if (newSaveBtn) newSaveBtn.textContent = "Готово";
  };

  // Add event listeners
  if (newCloseBtn) {
    newCloseBtn.addEventListener("click", removeExistingPopup);
  }

  if (newBackdrop) {
    newBackdrop.addEventListener("click", removeExistingPopup);
  }

  if (newCreateNewBtn) {
    newCreateNewBtn.addEventListener("click", switchToCreateMode);
  }

  if (newCancelBtn) {
    newCancelBtn.addEventListener("click", () => {
      if (isCreateMode) {
        switchToViewMode();
      } else {
        removeExistingPopup();
      }
    });
  }

  if (newSaveBtn) {
    newSaveBtn.addEventListener("click", () => {
      if (isCreateMode) {
        const newName = newCollectionNameInput
          ? newCollectionNameInput.value.trim()
          : "";
        if (newName) {
          try {
            const newCollection = createCollection({ name: newName });
            if (newCollection && newCollection.id) {
              addPropertyToCollection(newCollection.id, propertyId);

              createAndShowToast(
                `Объект "${propertyTitle}" добавлен в новую подборку "${newName}"`,
                "success"
              );
            } else {
              console.error(
                "Failed to create new collection or new collection has no ID.",
                newCollection
              );
              createAndShowToast(`Ошибка при создании подборки`, "error");
            }
          } catch (error) {
            console.error(
              "Error creating collection or adding property:",
              error
            );
            createAndShowToast(`Ошибка: ${error.message}`, "error");
          }
          removeExistingPopup();
        } else {
          console.warn("New collection name is empty.");
          // if (newCollectionNameInput) newCollectionNameInput.focus();
          createAndShowToast("Название подборки не может быть пустым", "error");
        }
      } else {
        saveCollectionSelections(propertyId, propertyTitle);
      }
    });
  }

  // Add event listeners for collection items
  const collectionItems = popupContainer.querySelectorAll(
    ".collection-selector-popup__item"
  );
  collectionItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      // Don't toggle if clicking on the checkbox itself
      if (e.target.tagName === "INPUT") return;

      const checkbox = item.querySelector('input[type="checkbox"]');
      // Don't toggle if checkbox is disabled (favorite collection)
      if (checkbox && checkbox.disabled) return;

      if (checkbox) checkbox.checked = !checkbox.checked;
    });
  });

  // Show popup with animation
  popupContainer.style.display = "block";
  backdrop.style.display = "block";
  
  setTimeout(() => {
    backdrop.style.opacity = "1";
    popupContainer.style.opacity = "1";
    popupContainer.style.transform = "translateY(0)";
  }, 10);
};

/**
 * Save collection selections and close popup
 * @param {string} propertyId - ID of the property
 * @param {string} propertyTitle - Title of the property for toast message
 */
const saveCollectionSelections = async (propertyId, propertyTitle) => {
  const popup = document.getElementById(POPUP_ID);
  if (!popup) return;

  const checkboxes = popup.querySelectorAll('input[type="checkbox"]');
  let addedToAny = false;
  let addedToFavorite = false;

  // Get all collections and collections with property to compare states
  const allCollections = await getCollections();
  const collectionsWithProperty = await getCollectionsWithProperty(propertyId);

  if (!allCollections || !collectionsWithProperty) {
    createAndShowToast("Не удалось сохранить изменения", "error");
    return;
  }

  checkboxes.forEach(async (checkbox) => {
    const collectionId = checkbox.id.replace("collection-", "");
    const collection = allCollections.find((c) => c.id === collectionId);
    if (!collection) return;

    const wasInCollection = collectionsWithProperty.find((c) => c.id === collectionId && c.properties.find((p) => p.id === propertyId));
    const shouldBeInCollection = checkbox.checked;

    if (shouldBeInCollection && !wasInCollection) {
      // Add to collection
      await addPropertyToCollection(collectionId, propertyId);
      addedToAny = true;

      if (collection.isFavorite) {
        addedToFavorite = true;
      }
    } else if (
      !shouldBeInCollection &&
      wasInCollection &&
      !collection.isFavorite
    ) {
      // Remove from collection (but not from favorite)
      // This is handled in a separate function
      // await removePropertyFromCollection(collectionId, propertyId);
    }
  });

  // Show success message
  if (addedToAny) {
    createAndShowToast(
      addedToFavorite
        ? `Объект "${propertyTitle}" добавлен в избранное`
        : `Объект "${propertyTitle}" добавлен в подборку`,
      "success"
    );
  }

  // Close popup
  removeExistingPopup();
};

/**
 * Remove existing popup if any
 */
const removeExistingPopup = () => {
  const existingPopup = document.getElementById(POPUP_ID);
  const existingBackdrop = document.querySelector(`.${POPUP_BACKDROP_CLASS}`);

  if (existingPopup) {
    existingPopup.style.opacity = "0";
    existingPopup.style.transform = "translateY(20px)";

    setTimeout(() => {
      existingPopup.style.display = "none";
      // Reset popup content
      const listElement = existingPopup.querySelector(".collection-selector-popup__list");
      const emptyContainer = existingPopup.querySelector(".collection-selector-popup__empty");
      const createNewContainer = existingPopup.querySelector(".collection-selector-popup__create-new-container");
      const newCollectionNameInput = existingPopup.querySelector("#newCollectionNameInput");
      
      if (listElement) listElement.innerHTML = "";
      if (emptyContainer) emptyContainer.style.display = "block";
      if (createNewContainer) createNewContainer.style.display = "none";
      if (newCollectionNameInput) newCollectionNameInput.value = "";
    }, 300);
  }

  if (existingBackdrop) {
    existingBackdrop.style.opacity = "0";

    setTimeout(() => {
      existingBackdrop.style.display = "none";
    }, 300);
  }
};

/**
 * Clear the toast timer and remove any existing toast
 * Call this function when user clicks another like button
 */
export const removeCollectionToast = () => {
  if (autoRemoveTimerToast) {
    clearTimeout(autoRemoveTimerToast);
    autoRemoveTimerToast = null;
  }

  const existingToast = document.querySelector(".interactive-toast-bar");

  if (existingToast) {
    existingToast.style.opacity = "0";
    existingToast.style.transform = "translateY(20px)";
    setTimeout(() => {
      if (existingToast.parentNode) {
        existingToast.parentNode.removeChild(existingToast);
      }
    }, 305);
  }
};

/**
 * Function to show the interactive toast for adding to collections
 */
const showInteractiveAddToCollectionToast = (propertyId, propertyTitle) => {
  clearAllToasts();
  removeCollectionToast();
  // Remove any existing interactive toast first
  const existingToast = document.querySelector(".interactive-toast-bar");
  if (existingToast) {
    existingToast.remove();
  }

  const toastBar = document.createElement("div");
  toastBar.className = "interactive-toast-bar";

  const messageElement = document.createElement("span");
  messageElement.className = "interactive-toast-bar__message";
  messageElement.textContent = "Объявление можно добавить в подборку";
  toastBar.appendChild(messageElement);

  const addButton = document.createElement("button");
  addButton.className = "interactive-toast-bar__button";
  addButton.textContent = "Добавить";
  toastBar.appendChild(addButton);

  document.body.appendChild(toastBar);

  // Trigger the slide-in animation
  setTimeout(() => {
    toastBar.classList.add("show");
  }, 10); // Small delay to ensure transition triggers

  // Function to mark user interaction
  const markInteraction = () => {
    userInteracted = true;
    if (autoRemoveTimerToast) {
      clearTimeout(autoRemoveTimerToast);
      autoRemoveTimerToast = null;
    }
  };

  // Set timer for auto-removal if no interaction
  autoRemoveTimerToast = setTimeout(() => {
    if (userInteracted === false) {
      const existingToast = document.querySelector(".interactive-toast-bar");
      if (existingToast) {
        existingToast.style.opacity = "0";
        existingToast.style.transform = "translateY(20px)";
        setTimeout(() => {
          existingToast.remove();
        }, 305);
      }
      removeExistingPopup();
    }
  }, 50000);

  // Add interaction listeners to the popup
  toastBar.addEventListener("mouseover", markInteraction);
  toastBar.addEventListener("click", markInteraction);
  toastBar.addEventListener("touchstart", markInteraction);

  addButton.addEventListener("click", () => {
    showCollectionSelectorPopup(propertyId, propertyTitle);
    toastBar.classList.remove("show");
    // Remove after animation
    setTimeout(() => {
      toastBar.remove();
    }, 300); // Match transition duration
  });

  // Optional: Auto-hide the toast after some time
  setTimeout(() => {
    if (
      document.body.contains(toastBar) &&
      toastBar.classList.contains("show")
    ) {
      toastBar.classList.remove("show");
      setTimeout(() => {
        toastBar.remove();
      }, 300);
    }
  }, 7000); // Auto-hide after 7 seconds
};

/**
 * Add property to favorite collection
 * @param {string} propertyId - ID of the property to add
 * @param {string} propertyTitle - Title of the property (for display in toast)
 * @param {boolean} showPopup - Whether to show the collection selector popup
 * @returns {object} - Detailed status of the operation
 */
export const addPropertyToFavorite = async (
  propertyId,
  propertyTitle,
  showToast = true
) => {
    // Property is not in 'Избранное', so add it
    const added = await addPropertyToCollection(favoriteCollectionId, propertyId);
    if (added) {
      if (showToast) {
        showInteractiveAddToCollectionToast(propertyId, propertyTitle);
      }
      return { action: "added", success: true, isFavorite: true };
    } else {
      console.warn(
        `Failed to add property ${propertyId} to 'Избранное' (ID: ${favoriteCollectionId})`
      );
      return { action: "add_failed", success: false, isFavorite: false };
    }
};
