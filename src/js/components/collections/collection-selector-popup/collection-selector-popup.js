/**
 * Collection Selector Popup Component
 * Allows users to add properties to collections
 */
import {
  addPropertyToCollection,
  createCollection,
  favoriteCollectionId,
  getCollections,
  getCollectionsWithProperty,
  removePropertyFromCollection
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
      const apiUrlAddPropertyToCollection = popupContainer.dataset.apiUrlAddPropertyToCollection;
      const apiUrlRemovePropertyFromCollection = popupContainer.dataset.apiUrlRemovePropertyFromCollection;
      const apiUrlGetCollectionsWithProperty = popupContainer.dataset.apiUrlGetCollectionsWithProperty;
      if (!apiUrlCreateCollection || !apiUrlAddPropertyToCollection || !apiUrlRemovePropertyFromCollection || !apiUrlGetCollectionsWithProperty) {
        console.error("apiUrlCreateCollection, apiUrlAddPropertyToCollection, apiUrlRemovePropertyFromCollection, apiUrlGetCollectionsWithProperty is not set");
        createAndShowToast("Не удалось сохранить изменения", "error");
        return;
      }
      if (isCreateMode) {
        const newName = newCollectionNameInput
          ? newCollectionNameInput.value.trim()
          : "";
        if (newName) {
          try {
            const newCollection = createCollection(apiUrlCreateCollection, { name: newName, properties: [propertyId] });
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
    // Get all collections (excluding favorites for the popup display)
    let collections = await getCollections();
    // Get collections that already contain this property
    let collectionsWithProperty = await getCollectionsWithProperty(propertyId);
    
    if (!collections || !collectionsWithProperty) {
      throw new Error("Не удалось загрузить коллекции");
    }
    
    console.log("collections", collections);
    // Filter out favorite collections
    collections = collections.filter(
      (collection) => !collection.isFavorite
    );
  
    // Filter out favorite collections
    collectionsWithProperty = collectionsWithProperty.filter(
      (collection) => !collection.isFavorite
    );
  
    const collectionsWithPropertyIds = collectionsWithProperty.map((c) => c.id);

    // Update list content after loading
    if (collections.length === 0) {
      if (listContainer) {
        listContainer.innerHTML = `
          <div class="collection-selector-popup__empty">
            <p>У вас пока нет подборок.</p>
          </div>
        `;
      }
    } else {
      if (listContainer) {
        listContainer.innerHTML = `
          <div class="collection-selector-popup__list">
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
          </div>
        `;
      }
    }

         // Add event listeners for collection items after they're loaded
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

  let addedToAny = false;
  let addedToFavorite = false;
  let removeFromAny = false;

  // Get all collections and collections with property to compare states
  const allCollections = await getCollections();
  const collectionsWithProperty = await getCollectionsWithProperty(propertyId);

  if (!allCollections || !collectionsWithProperty) {
    createAndShowToast("Не удалось сохранить изменения", "error");
    return;
  }

  for (let i = 0; i < checkboxes.length; i++) {
    const checkbox = checkboxes[i];
    const collectionId = checkbox.id.replace("collection-", "");
    const collection = allCollections.find((c) => c.id === collectionId);
    if (!collection) return;

    const wasInCollection = collectionsWithProperty.find((c) => {
      return c.id === collectionId && c.properties.find((pId) => pId === propertyId);
    });
    const shouldBeInCollection = checkbox.checked;

    if (shouldBeInCollection && !wasInCollection) {
      // Add to collection
      try {
        await addPropertyToCollection(collectionId, propertyId);
      } catch (error) {
        console.error("Error adding property to collection", error);
        createAndShowToast(`Ошибка при добавлении объекта в подборку`, "error");
      }
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
      try {
        await removePropertyFromCollection(collectionId, propertyId);
      } catch (error) {
        console.error("Error removing property from collection", error);
        createAndShowToast(`Ошибка при удалении объекта из подборки`, "error");
      }
      removeFromAny = true;
    }
  };

  // Show success message
  switch (true) {
    case addedToAny && !removeFromAny:
      createAndShowToast(`Объект "${propertyTitle}" добавлен в подборку`, "success");
      break;
    case addedToAny && removeFromAny:
      createAndShowToast(`Объект "${propertyTitle}" подборки обновлены`, "success");
      window.location.reload();
      break;
    case !addedToAny && removeFromAny:
      createAndShowToast(`Объект "${propertyTitle}" удален из подборки`, "success");
      window.location.reload();
      break;
    default:
      break;
  }

  // Close popup
  await removeExistingPopup();
};

/**
 * Remove existing popup if any
 */
export const removeExistingPopup = async () => {
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
  await removeExistingPopup();
  // Property is not in 'Избранное', so add it
    const added = await addPropertyToCollection(favoriteCollectionId, propertyId);
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
