/**
 * Collection Selector Popup Component
 * Allows users to add properties to collections
 */
import {
  addPropertyToCollection,
  createCollection,
  favoriteCollectionId,
  getCollectionSelectorMarkup,
  updatePropertyCollections
} from "../api/collections-manager";

import { getPlural } from "../../../utils/pluralization";
import { clearAllToasts, createAndShowToast } from "../../../utils/uiHelpers";

// DOM element IDs and classes
const POPUP_ID = "collection-selector-popup";
const POPUP_BACKDROP_CLASS = "collection-selector-popup-backdrop";

// Variable to track if user has interacted with popup
let userInteracted = false;

// Timer for auto-removal
let autoRemoveTimerToast = null;

// Variable to track current abort controller for cancellable operations
let currentAbortController = null;

/**
 * Switch popup between create and view modes
 * @param {boolean} isCreateMode - Whether to switch to create mode (true) or view mode (false)
 * @param {Object} elements - Object containing DOM elements
 * @param {HTMLElement} elements.listContainer - Container for collection list
 * @param {HTMLElement} elements.createNewContainer - Container for create new collection form
 * @param {HTMLElement} elements.createNewBtn - Create new collection button
 * @param {HTMLElement} elements.saveBtn - Save button
 * @param {HTMLElement} elements.collectionNameInput - Input field for collection name
 */
const switchPopupMode = (isCreateMode, elements) => {
  const {
    listContainer,
    createNewContainer,
    createNewBtn,
    saveBtn,
    collectionNameInput
  } = elements;

  if (isCreateMode) {
    // Switch to create mode
    if (listContainer) listContainer.style.display = "none";
    if (createNewContainer) createNewContainer.style.display = "block";
    if (createNewBtn) createNewBtn.style.display = "none";
    if (saveBtn && !saveBtn.disabled) {
      saveBtn.textContent = "Сохранить и добавить";
    }
    if (collectionNameInput) {
      collectionNameInput.value = ""; // Clear previous input
      // collectionNameInput.focus();
    }
  } else {
    // Switch to view mode
    if (listContainer) listContainer.style.display = "block";
    if (createNewContainer) createNewContainer.style.display = "none";
    if (createNewBtn) createNewBtn.style.display = "inline-block";
    if (saveBtn && !saveBtn.disabled) {
      saveBtn.textContent = "Готово";
    }
  }
};

/**
 * Create and show the collection selector popup
 * @param {string} propertyId - ID of the property to add to collection
 * @param {string} propertyTitle - Title of the property (for display in toast)
 */
export const showCollectionSelectorPopup = async (propertyId, propertyTitle) => {
  // Clear any existing toasts
  clearAllToasts();
  await removeExistingPopup();

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

  // Show loading state immediately
  if (listContainer) {
    listContainer.innerHTML = `
      <div class="collection-selector-popup__loading text-center py-4">
        <div class="spinner-border text-brand-turquoise mb-3" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
        <p class="mb-0 text-muted">Загружаем подборки...</p>
      </div>
    `;
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
  if (createNewBtn) {
    createNewBtn.style.display = "inline-block";
    createNewBtn.disabled = true; // Disable during loading
  }
  if (saveBtn) {
    saveBtn.innerHTML = 'Готово';
    saveBtn.disabled = true; // Disable during loading
  }

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

  // Ensure the new buttons are also disabled initially
  if (newCreateNewBtn) {
    newCreateNewBtn.disabled = true;
  }
  if (newSaveBtn) {
    newSaveBtn.innerHTML = 'Готово';
    newSaveBtn.disabled = true;
  }

  let isCreateMode = false;

  const switchToCreateMode = () => {
    isCreateMode = true;
    switchPopupMode(true, {
      listContainer,
      createNewContainer,
      createNewBtn: newCreateNewBtn,
      saveBtn: newSaveBtn,
      collectionNameInput: newCollectionNameInput
    });
  };

  const switchToViewMode = () => {
    isCreateMode = false;
    switchPopupMode(false, {
      listContainer,
      createNewContainer,
      createNewBtn: newCreateNewBtn,
      saveBtn: newSaveBtn,
      collectionNameInput: newCollectionNameInput
    });
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
    newCancelBtn.addEventListener("click", async () => {
      // Abort any ongoing fetch operation
      if (currentAbortController) {
        currentAbortController.abort();
        currentAbortController = null;
      }
      
      if (isCreateMode) {
        switchToViewMode();
      } else {
        await removeExistingPopup();
      }
    });
  }

  if (newSaveBtn) {
    newSaveBtn.addEventListener("click", async () => {
      const apiUrlCreateCollection = popupContainer.dataset.apiUrlCreateCollection;
      if (!apiUrlCreateCollection) {
        console.error("apiUrlCreateCollection, is not set");
        createAndShowToast("Не удалось сохранить изменения", "error");
        return;
      }
      if (isCreateMode) {
        const newName = newCollectionNameInput
          ? newCollectionNameInput.value.trim()
          : "";
        if (newName) {
          // Disable buttons during create operation
          if (newSaveBtn) {
            newSaveBtn.disabled = true;
            newSaveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Создание...';
          }
          if (newCreateNewBtn) {
            newCreateNewBtn.disabled = true;
          }

          // Create abort controller for this operation
          currentAbortController = new AbortController();

          try {
            const newCollection = await createCollection(apiUrlCreateCollection, { name: newName, properties: [propertyId] }, currentAbortController.signal);
            if (newCollection && newCollection.id) {
              await addPropertyToCollection(newCollection.id, propertyId, currentAbortController.signal);

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
            if (error.name === 'AbortError') {
              console.log("Collection creation was cancelled by user");
              createAndShowToast("Операция отменена", "info");
            } else {
              console.error(
                "Error creating collection or adding property:",
                error
              );
              createAndShowToast(`Ошибка: ${error.message}`, "error");
            }
          } finally {
            // Re-enable buttons and clear abort controller
            if (newSaveBtn) {
              newSaveBtn.disabled = false;
              newSaveBtn.innerHTML = 'Сохранить и добавить';
            }
            if (newCreateNewBtn) {
              newCreateNewBtn.disabled = false;
            }
            currentAbortController = null;
          }
          await removeExistingPopup();
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

  // Show popup with animation immediately
  popupContainer.style.display = "block";
  backdrop.style.display = "block";
  
  setTimeout(() => {
    backdrop.style.opacity = "1";
    popupContainer.style.opacity = "1";
    popupContainer.style.transform = "translateY(0)";
  }, 10);

  // Load data asynchronously after showing the popup
  try {
    // Get collection selector markup from backend with current states
    const markup = await getCollectionSelectorMarkup(propertyId);
    
    if (!markup) {
      throw new Error("Не удалось загрузить коллекции");
    }
    
    // Insert the backend-generated markup
    if (listContainer) {
      listContainer.innerHTML = markup;
      
      // Add event listeners for collection items
      const collectionItems = popupContainer.querySelectorAll(
        ".collection-selector-popup__item"
      );
      collectionItems.forEach((item) => {
        item.addEventListener("click", (e) => {
          // Don't toggle if clicking on the checkbox itself
          if (e.target.tagName === "INPUT") return;

          const checkbox = item.querySelector('input[type="checkbox"]');
          if (checkbox) checkbox.checked = !checkbox.checked;
        });
      });
    }

    // Re-enable buttons after successful loading
    if (newCreateNewBtn) {
      newCreateNewBtn.disabled = false;
    }
    if (newSaveBtn) {
      newSaveBtn.disabled = false;
      newSaveBtn.textContent = "Готово";
    }

  } catch (error) {
    console.error("Error loading collections:", error);
    
    // Show error state in the popup
    if (listContainer) {
      listContainer.innerHTML = `
        <div class="collection-selector-popup__error text-center py-4">
          <i class="bi bi-exclamation-triangle text-warning mb-3" style="font-size: 2rem;"></i>
          <p class="mb-2 text-muted">Не удалось загрузить подборки</p>
        </div>
      `;
    }
  }
};

/**
 * Save collection selections and close popup
 * @param {string} propertyId - ID of the property
 * @param {string} propertyTitle - Title of the property for toast message
 */
const saveCollectionSelections = async (propertyId, propertyTitle) => {
  const popup = document.getElementById(POPUP_ID);
  if (!popup) return;

  const checkboxNodes = popup.querySelectorAll('input[type="checkbox"]');
  if (!checkboxNodes) return;

  const checkboxes = Array.from(checkboxNodes);

  // Get button elements for disabling during fetch
  const saveBtn = popup.querySelector(".collection-selector-popup__save-btn");
  const createNewBtn = popup.querySelector(".collection-selector-popup__create-new-btn");

  // Collect all collection states from checkboxes
  const collectionStates = [];
  let hasAnyChanges = false;

  for (const checkbox of checkboxes) {
    const collectionId = checkbox.id.replace("collection-", "");
    const shouldBeInCollection = checkbox.checked;
    
    collectionStates.push({
      collectionId,
      shouldInclude: shouldBeInCollection
    });
    
    if (shouldBeInCollection) {
      hasAnyChanges = true;
    }
  }

  if (!hasAnyChanges) {
    createAndShowToast("Выберите хотя бы одну подборку", "warning");
    return;
  }

  // Disable buttons during fetch
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Сохранение...';
  }
  if (createNewBtn) {
    createNewBtn.disabled = true;
  }

  // Create abort controller for this operation
  currentAbortController = new AbortController();

  try {
    // Make a single request to update all collection states
    const result = await updatePropertyCollections(propertyId, collectionStates, currentAbortController.signal);
    
    if (!result || result.error) {
      throw new Error(result?.error || 'Failed to update collections');
    }
    
    // Show appropriate success message
    const addedCount = collectionStates.filter(state => state.shouldInclude).length;
    if (addedCount > 0) {
      const pluralForm = getPlural(addedCount, 'подборку', 'подборки', 'подборок');
      createAndShowToast(`Объект "${propertyTitle}" добавлен в ${addedCount} ${pluralForm}`, "success");
    }

  } catch (error) {
    if (error.name === 'AbortError') {
      console.log("Collection update was cancelled by user");
      createAndShowToast("Операция отменена", "info");
    } else {
      console.error("Error updating collections:", error);
      createAndShowToast("Не удалось сохранить изменения", "error");
    }
  } finally {
    // Re-enable buttons and clear abort controller
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = 'Готово';
    }
    if (createNewBtn) {
      createNewBtn.disabled = false;
    }
    currentAbortController = null;
  }

  // Close popup
  await removeExistingPopup();
};

/**
 * Remove existing popup if any
 */
export const removeExistingPopup = async () => {
  // Abort any ongoing fetch operation when closing popup
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }

  const existingPopup = document.getElementById(POPUP_ID);
  const existingBackdrop = document.querySelector(`.${POPUP_BACKDROP_CLASS}`);

  return new Promise((resolve) => {
  if (existingPopup) {
    existingPopup.style.opacity = "0";
    existingPopup.style.transform = "translateY(20px)";

    setTimeout(() => {
      existingPopup.style.display = "none";
      
      // Reset popup content and mode after closing
      const listElement = existingPopup.querySelector(".collection-selector-popup__list");
      const emptyContainer = existingPopup.querySelector(".collection-selector-popup__empty");
      const listContainer = existingPopup.querySelector(".collection-selector-popup__list-container");
      const createNewContainer = existingPopup.querySelector(".collection-selector-popup__create-new-container");
      const createNewBtn = existingPopup.querySelector(".collection-selector-popup__create-new-btn");
      const saveBtn = existingPopup.querySelector(".collection-selector-popup__save-btn");
      const collectionNameInput = existingPopup.querySelector("#newCollectionNameInput");
      
      // Reset content
      if (listElement) listElement.innerHTML = "";
      if (emptyContainer) emptyContainer.style.display = "block";
      
      // Reset to view mode
      switchPopupMode(false, {
        listContainer,
        createNewContainer,
        createNewBtn,
        saveBtn,
        collectionNameInput
      });
      resolve();
    }, 300);
  }

  if (existingBackdrop) {
    existingBackdrop.style.opacity = "0";

    setTimeout(() => {
      existingBackdrop.style.display = "none";
      resolve();
    }, 300);
  }

  if (!existingPopup) {
    resolve();
  }
});
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
const showInteractiveAddToCollectionToast = async (propertyId, propertyTitle) => {
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
  autoRemoveTimerToast = setTimeout(async () => {
    if (userInteracted === false) {
      const existingToast = document.querySelector(".interactive-toast-bar");
      if (existingToast) {
        existingToast.style.opacity = "0";
        existingToast.style.transform = "translateY(20px)";
        setTimeout(() => {
          existingToast.remove();
        }, 305);
      }
      await removeExistingPopup();
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
  setTimeout(async () => {
    if (
      document.body.contains(toastBar) &&
      toastBar.classList.contains("show")
    ) {
      toastBar.classList.remove("show");
      setTimeout(() => {
        toastBar.remove();
      }, 300);
      await removeExistingPopup();
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
  await removeExistingPopup();
    if (added) {
      if (showToast) {
        showInteractiveAddToCollectionToast(propertyId, propertyTitle);
      }else{
        createAndShowToast(`${propertyTitle} добавлено в избранное`, 'success');
      }
      return { action: "added", success: true, isFavorite: true };
    } else {
      console.warn(
        `Failed to add property ${propertyId} to 'Избранное' (ID: ${favoriteCollectionId})`
      );
      return { action: "add_failed", success: false, isFavorite: false };
    }
};
