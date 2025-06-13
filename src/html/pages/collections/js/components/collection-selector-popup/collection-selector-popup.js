/**
 * Collection Selector Popup Component
 * Allows users to add properties to collections
 */
import {
  addPropertyToCollection,
  createCollection,
  getCollections,
  getCollectionsWithProperty,
  isPropertyInCollection,
  removePropertyFromCollection, // Added for removing from favorites
  updateCollection, // Added for managing 'isFavorite' flag
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
export const showCollectionSelectorPopup = (propertyId, propertyTitle) => {
  // Remove any existing popup
  removeExistingPopup();
  clearAllToasts();

  // Get all collections (excluding favorites for the popup display)
  const collections = getCollections().filter(
    (collection) => !collection.isFavorite
  );

  // Get collections that already contain this property
  const collectionsWithProperty = getCollectionsWithProperty(propertyId).filter(
    (collection) => !collection.isFavorite
  );
  const collectionsWithPropertyIds = collectionsWithProperty.map((c) => c.id);

  // Create popup container
  const popupContainer = document.createElement("div");
  popupContainer.className = POPUP_CONTAINER_CLASS;
  popupContainer.id = POPUP_ID;

  // Create backdrop
  const backdrop = document.createElement("div");
  backdrop.className = POPUP_BACKDROP_CLASS;
  backdrop.addEventListener("click", removeExistingPopup);

  // Create popup content
  popupContainer.innerHTML = `
    <div class="collection-selector-popup">
      <div class="collection-selector-popup__header">
        <h5 class="collection-selector-popup__title">Добавить в подборку</h5>
        <button class="collection-selector-popup__close" aria-label="Закрыть">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="collection-selector-popup__body">
        <div class="collection-selector-popup__list-container">
          ${
            collections.length === 0
              ? `<div class="collection-selector-popup__empty">
              <p>У вас пока нет подборок.</p>
            </div>`
              : `<div class="collection-selector-popup__list">
              ${collections
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
                .join("")}
            </div>`
          }
        </div>
        <div class="collection-selector-popup__create-new-container" style="display: none;">
          <div class="form-group mb-3">
            <label for="newCollectionNameInput" class="form-label visually-hidden">Название новой подборки</label>
            <input type="text" class="form-control" id="newCollectionNameInput" placeholder="Название новой подборки">
          </div>
        </div>
      </div>
      <div class="collection-selector-popup__footer">
        <button class="btn btn-outline-secondary collection-selector-popup__create-new-btn">Создать новую</button>
        <button class="btn btn-outline-brand-turquoise collection-selector-popup__cancel-btn">Отмена</button>
        <button class="btn btn-brand-lime collection-selector-popup__save-btn">Готово</button> 
      </div>
    </div>
  `;

  // Append popup and backdrop to body
  document.body.appendChild(backdrop);
  document.body.appendChild(popupContainer);

  // Add event listeners
  const closeBtn = popupContainer.querySelector(
    ".collection-selector-popup__close"
  );
  closeBtn.addEventListener("click", removeExistingPopup);

  const createNewBtn = popupContainer.querySelector(
    ".collection-selector-popup__create-new-btn"
  );
  const listContainer = popupContainer.querySelector(
    ".collection-selector-popup__list-container"
  );
  const createNewContainer = popupContainer.querySelector(
    ".collection-selector-popup__create-new-container"
  );
  const newCollectionNameInput = popupContainer.querySelector(
    "#newCollectionNameInput"
  );

  const cancelBtn = popupContainer.querySelector(
    ".collection-selector-popup__cancel-btn"
  );
  const saveBtn = popupContainer.querySelector(
    ".collection-selector-popup__save-btn"
  );

  let isCreateMode = false;

  const switchToCreateMode = () => {
    isCreateMode = true;
    if (listContainer) listContainer.style.display = "none";
    if (createNewContainer) createNewContainer.style.display = "block";
    if (createNewBtn) createNewBtn.style.display = "none";
    if (saveBtn) saveBtn.textContent = "Сохранить и добавить";
    if (newCollectionNameInput) {
      newCollectionNameInput.value = ""; // Clear previous input
      // newCollectionNameInput.focus();
    }
  };

  const switchToViewMode = () => {
    isCreateMode = false;
    if (listContainer) listContainer.style.display = "block";
    if (createNewContainer) createNewContainer.style.display = "none";
    if (createNewBtn) createNewBtn.style.display = "inline-block";
    if (saveBtn) saveBtn.textContent = "Готово";
  };

  if (createNewBtn) {
    createNewBtn.addEventListener("click", switchToCreateMode);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      if (isCreateMode) {
        switchToViewMode();
      } else {
        removeExistingPopup();
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
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
      if (checkbox.disabled) return;

      checkbox.checked = !checkbox.checked;
    });
  });

  // Show popup with animation
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
const saveCollectionSelections = (propertyId, propertyTitle) => {
  const popup = document.getElementById(POPUP_ID);
  if (!popup) return;

  const checkboxes = popup.querySelectorAll('input[type="checkbox"]');
  let addedToAny = false;
  let addedToFavorite = false;

  checkboxes.forEach((checkbox) => {
    const collectionId = checkbox.id.replace("collection-", "");
    const collection = getCollections().find((c) => c.id === collectionId);

    if (!collection) return;

    const wasInCollection = isPropertyInCollection(collectionId, propertyId);
    const shouldBeInCollection = checkbox.checked;

    if (shouldBeInCollection && !wasInCollection) {
      // Add to collection
      addPropertyToCollection(collectionId, propertyId);
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
      if (existingPopup.parentNode) {
        existingPopup.parentNode.removeChild(existingPopup);
      }
    }, 300);
  }

  if (existingBackdrop) {
    existingBackdrop.style.opacity = "0";

    setTimeout(() => {
      if (existingBackdrop.parentNode) {
        existingBackdrop.parentNode.removeChild(existingBackdrop);
      }
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
export const addPropertyToFavorite = (
  propertyId,
  propertyTitle,
  showToast = true
) => {
  let allCollections = getCollections();
  let favoriteCollection = allCollections.find((c) => c.isFavorite);

  // Ensure 'Избранное' collection exists and is properly flagged
  if (!favoriteCollection) {
    favoriteCollection = allCollections.find((c) => c.name === "Избранное");
    if (favoriteCollection) {
      if (!favoriteCollection.isFavorite) {
        const updated = updateCollection(favoriteCollection.id, {
          isFavorite: true,
        });
        if (updated) favoriteCollection.isFavorite = true;
        else
          console.warn(
            `Could not update 'Избранное' (ID: ${favoriteCollection.id}) to set isFavorite=true`
          );
      }
    } else {
      favoriteCollection = createCollection({
        name: "Избранное",
        notes: "Автоматически созданная подборка для избранных объектов",
      });
      if (favoriteCollection && favoriteCollection.id) {
        const updated = updateCollection(favoriteCollection.id, {
          isFavorite: true,
        });
        if (updated) favoriteCollection.isFavorite = true;
        else
          console.warn(
            `Could not update newly created 'Избранное' (ID: ${favoriteCollection.id}) to set isFavorite=true`
          );
      } else {
        console.error("Failed to create 'Избранное' collection.");
        return {
          action: "error",
          success: false,
          isFavorite: false,
          message: "Failed to create favorite collection.",
        };
      }
    }
  }

  if (!favoriteCollection || !favoriteCollection.id) {
    console.error("'Избранное' collection ID is missing after setup.");
    return {
      action: "error",
      success: false,
      isFavorite: false,
      message: "Favorite collection ID missing.",
    };
  }

  const isAlreadyFavorite = isPropertyInCollection(
    favoriteCollection.id,
    propertyId
  );

  if (isAlreadyFavorite) {
    // Property is in 'Избранное', so remove it
    const removed = removePropertyFromCollection(
      favoriteCollection.id,
      propertyId
    );
    if (removed) {
      // createAndShowToast(`Объект "${propertyTitle}" удален из избранного`, "info");
      return { action: "removed", success: true, isFavorite: false };
    } else {
      console.warn(
        `Failed to remove property ${propertyId} from 'Избранное' (ID: ${favoriteCollection.id})`
      );
      return { action: "remove_failed", success: false, isFavorite: true }; // Still favorite as removal failed
    }
  } else {
    // Property is not in 'Избранное', so add it
    const added = addPropertyToCollection(favoriteCollection.id, propertyId);
    if (added) {
      if (showToast) {
        showInteractiveAddToCollectionToast(propertyId, propertyTitle);
      }
      return { action: "added", success: true, isFavorite: true };
    } else {
      console.warn(
        `Failed to add property ${propertyId} to 'Избранное' (ID: ${favoriteCollection.id})`
      );
      return { action: "add_failed", success: false, isFavorite: false };
    }
  }
};
