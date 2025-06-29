/**
 * Collection Selector Popup Component
 * Allows users to add properties to collections
 */
import {
  addPropertyToCollection,
  createCollection,
  getCollectionSelectorMarkup,
  updatePropertyCollections
} from "../api/collections-manager";

import { getPlural } from "../../../utils/pluralization";
import { clearAllToasts, createAndShowToast } from "../../../utils/uiHelpers";

// ===========================
// CONSTANTS AND STATE
// ===========================

const POPUP_ID = "collection-selector-popup";
const POPUP_BACKDROP_CLASS = "collection-selector-popup-backdrop";

// Global state variables
let userInteracted = false;
let autoRemoveTimerToast = null;
let currentAbortController = null;

// ===========================
// UTILITY FUNCTIONS
// ===========================

/**
 * Button state management utilities
 */
const ButtonStateManager = {
  /**
   * Disable button with loading state
   * @param {HTMLElement} button - Button element
   * @param {string} loadingText - Text to show during loading
   */
  setLoading(button, loadingText) {
    if (!button) return;
    button.disabled = true;
    button.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>${loadingText}`;
  },

  /**
   * Enable button and restore text
   * @param {HTMLElement} button - Button element
   * @param {string} normalText - Normal button text
   */
  setNormal(button, normalText) {
    if (!button) return;
    button.disabled = false;
    button.innerHTML = normalText;
  },

  /**
   * Disable button without loading state
   * @param {HTMLElement} button - Button element
   */
  disable(button) {
    if (button) button.disabled = true;
  },

  /**
   * Enable button
   * @param {HTMLElement} button - Button element
   */
  enable(button) {
    if (button) button.disabled = false;
  }
};

/**
 * Error handling utilities
 */
const ErrorHandler = {
  /**
   * Handle operation errors with appropriate user feedback
   * @param {Error} error - The error object
   * @param {string} defaultMessage - Default error message
   */
  handle(error, defaultMessage = "Произошла ошибка") {
    if (error.name === 'AbortError') {
      console.log("Operation was cancelled by user");
      createAndShowToast("Операция отменена", "info");
    } else {
      console.error("Operation error:", error);
      createAndShowToast(error.message || defaultMessage, "error");
    }
  }
};

/**
 * DOM helper utilities
 */
const DOMHelpers = {
  /**
   * Clone element and replace to remove event listeners
   * @param {HTMLElement} element - Element to clone
   * @returns {HTMLElement} New element
   */
  cloneAndReplace(element) {
    if (!element) return null;
    const newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);
    return newElement;
  },

  /**
   * Get popup elements
   * @param {HTMLElement} popup - Popup container
   * @returns {Object} Object containing popup elements
   */
  getPopupElements(popup) {
    return {
      listContainer: popup.querySelector(".collection-selector-popup__list-container"),
      emptyContainer: popup.querySelector(".collection-selector-popup__empty"),
      listElement: popup.querySelector(".collection-selector-popup__list"),
      createNewContainer: popup.querySelector(".collection-selector-popup__create-new-container"),
      newCollectionNameInput: popup.querySelector("#newCollectionNameInput"),
      closeBtn: popup.querySelector(".collection-selector-popup__close"),
      createNewBtn: popup.querySelector(".collection-selector-popup__create-new-btn"),
      cancelBtn: popup.querySelector(".collection-selector-popup__cancel-btn"),
      saveBtn: popup.querySelector(".collection-selector-popup__save-btn")
    };
  }
};

// ===========================
// POPUP STATE MANAGEMENT
// ===========================

/**
 * Popup state manager
 */
const PopupStateManager = {
  /**
   * Switch popup between create and view modes
   * @param {boolean} isCreateMode - Whether to switch to create mode
   * @param {Object} elements - Popup elements
   */
  switchMode(isCreateMode, elements) {
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
        collectionNameInput.value = "";
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
  },

  /**
   * Abort current operation if any
   */
  abortCurrentOperation() {
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
  },

  /**
   * Create new abort controller
   * @returns {AbortController} New abort controller
   */
  createAbortController() {
    currentAbortController = new AbortController();
    return currentAbortController;
  }
};

// ===========================
// EVENT HANDLERS
// ===========================

/**
 * Event handler factory
 */
const EventHandlers = {
  /**
   * Create close handler
   * @returns {Function} Close event handler
   */
  createCloseHandler() {
    return () => removeExistingPopup();
  },

  /**
   * Create mode switch handler
   * @param {Object} elements - Popup elements
   * @returns {Function} Mode switch event handler
   */
  createModeHandler(elements) {
    let isCreateMode = false;
    
    return {
      switchToCreate() {
        isCreateMode = true;
        PopupStateManager.switchMode(true, elements);
      },
      
      switchToView() {
        isCreateMode = false;
        PopupStateManager.switchMode(false, elements);
      },

      getCurrentMode() {
        return isCreateMode;
      }
    };
  },

  /**
   * Create cancel handler
   * @param {Object} modeHandler - Mode handler object
   * @returns {Function} Cancel event handler
   */
  createCancelHandler(modeHandler) {
    
    return async () => {
      PopupStateManager.abortCurrentOperation();
      
      if (modeHandler.getCurrentMode()) {
        modeHandler.switchToView();
      } else {
        await removeExistingPopup();
      }
    };
  },

  /**
   * Create save handler
   * @param {string} propertyId - Property ID
   * @param {string} propertyTitle - Property title
   * @param {Object} elements - Popup elements
   * @param {Object} modeHandler - Mode handler object
   * @param {Object} urls - URL configuration object
   * @returns {Function} Save event handler
   */
  createSaveHandler(propertyId, propertyTitle, elements, modeHandler, urls) {
    return async () => {
      if (!urls.createCollectionUrl) {
        console.error("createCollectionUrl is not set");
        createAndShowToast("Не удалось сохранить изменения", "error");
        return;
      }

      if (modeHandler.getCurrentMode()) {
        await Operations.createNewCollection(propertyId, propertyTitle, elements, urls.createCollectionUrl);
      } else {
        await Operations.saveCollectionSelections(propertyId, propertyTitle, elements, urls.updateCollectionsUrl);
      }
    };
  }
};

// ===========================
// CORE OPERATIONS
// ===========================

/**
 * Core operations
 */
const Operations = {
  /**
   * Create new collection operation
   * @param {string} propertyId - Property ID
   * @param {string} propertyTitle - Property title
   * @param {Object} elements - Popup elements
   * @param {string} createCollectionUrl - API URL for creating collection
   */
  async createNewCollection(propertyId, propertyTitle, elements, createCollectionUrl) {
    const { newCollectionNameInput, saveBtn, createNewBtn } = elements;
    const newName = newCollectionNameInput?.value.trim() || "";
    
    if (!newName) {
      createAndShowToast("Название подборки не может быть пустым", "error");
      return;
    }

    // Set loading state
    ButtonStateManager.setLoading(saveBtn, "Создание...");
    ButtonStateManager.disable(createNewBtn);

    const abortController = PopupStateManager.createAbortController();

    try {
      await createCollection(
        createCollectionUrl, 
        { name: newName, properties: [propertyId] }, 
        abortController.signal
      );
        createAndShowToast(
          `Объект "${propertyTitle}" добавлен в новую подборку "${newName}"`,
          "success"
        );
    } catch (error) {
      ErrorHandler.handle(error, "Ошибка при создании подборки");
    } finally {
      // Restore button states
      ButtonStateManager.setNormal(saveBtn, "Сохранить и добавить");
      ButtonStateManager.enable(createNewBtn);
      currentAbortController = null;
    }

    await removeExistingPopup();
  },

  /**
   * Save collection selections operation
   * @param {string} propertyId - Property ID
   * @param {string} propertyTitle - Property title
   * @param {Object} elements - Popup elements
   * @param {string} updateCollectionsUrl - API URL for updating collections
   */
  async saveCollectionSelections(propertyId, propertyTitle, elements, updateCollectionsUrl) {
    const popup = document.getElementById(POPUP_ID);
    if (!popup) return;

    const checkboxes = Array.from(popup.querySelectorAll('input[type="checkbox"]'));
    const { saveBtn, createNewBtn } = elements;

    // Collect collection states
    const collectionStates = checkboxes.map(checkbox => ({
      collectionId: checkbox.id.replace("collection-", ""),
      shouldInclude: checkbox.checked
    }));

    const hasAnyChanges = collectionStates.some(state => state.shouldInclude);
    if (!hasAnyChanges) {
      createAndShowToast("Выберите хотя бы одну подборку", "warning");
      return;
    }

    // Set loading state
    ButtonStateManager.setLoading(saveBtn, "Сохранение...");
    ButtonStateManager.disable(createNewBtn);

    const abortController = PopupStateManager.createAbortController();

    try {
      const result = await updatePropertyCollections(updateCollectionsUrl, collectionStates, abortController.signal);
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      // Show success message
      const addedCount = collectionStates.filter(state => state.shouldInclude).length;
      if (addedCount > 0) {
        const pluralForm = getPlural(addedCount, 'подборку', 'подборки', 'подборок');
        createAndShowToast(`Объект "${propertyTitle}" добавлен в ${addedCount} ${pluralForm}`, "success");
      }
    } catch (error) {
      ErrorHandler.handle(error, "Не удалось сохранить изменения");
    } finally {
      // Restore button states
      ButtonStateManager.setNormal(saveBtn, "Готово");
      ButtonStateManager.enable(createNewBtn);
      currentAbortController = null;
    }

    await removeExistingPopup();
  },

  /**
   * Load collection markup
   * @param {string} getCollectionsListUrl - API URL for getting collections list
   * @param {Object} elements - Popup elements
   */
  async loadCollectionMarkup(getCollectionsListUrl, elements) {
    const { listContainer } = elements;
    
    try {
      const markup = await getCollectionSelectorMarkup(getCollectionsListUrl);
      
      if (!markup) {
        throw new Error("Не удалось загрузить коллекции");
      }
      
      if (listContainer) {
        listContainer.innerHTML = markup;
        this.setupCollectionItemListeners(listContainer);
      }
      
      return true;
    } catch (error) {
      console.error("Error loading collections:", error);
      
      if (listContainer) {
        listContainer.innerHTML = `
          <div class="collection-selector-popup__error text-center py-4">
            <i class="bi bi-exclamation-triangle text-warning mb-3" style="font-size: 2rem;"></i>
            <p class="mb-2 text-muted">Не удалось загрузить подборки</p>
          </div>
        `;
      }
      
      return false;
    }
  },

  /**
   * Setup collection item event listeners
   * @param {HTMLElement} container - Container element
   */
  setupCollectionItemListeners(container) {
    const collectionItems = container.querySelectorAll(".collection-selector-popup__item");
    
    collectionItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        if (e.target.tagName === "INPUT") return;
        
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox) checkbox.checked = !checkbox.checked;
      });
    });
  }
};

// ===========================
// POPUP DISPLAY FUNCTIONS
// ===========================

/**
 * Show loading state in popup
 * @param {HTMLElement} listContainer - List container element
 */
const showLoadingState = (listContainer) => {
  if (!listContainer) return;
  
  listContainer.innerHTML = `
    <div class="collection-selector-popup__loading text-center py-4">
      <div class="spinner-border text-brand-turquoise mb-3" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
      <p class="mb-0 text-muted">Загружаем подборки...</p>
    </div>
  `;
};

/**
 * Setup popup animation
 * @param {HTMLElement} popup - Popup element
 * @param {HTMLElement} backdrop - Backdrop element
 */
const setupPopupAnimation = (popup, backdrop) => {
  popup.style.display = "block";
  backdrop.style.display = "block";
  
  setTimeout(() => {
    backdrop.style.opacity = "1";
    popup.style.opacity = "1";
    popup.style.transform = "translateY(0)";
  }, 10);
};

// ===========================
// MAIN POPUP FUNCTIONS
// ===========================

/**
 * Create and show the collection selector popup
 * @param {string} propertyId - ID of the property to add to collection
 * @param {string} propertyTitle - Title of the property (for display in toast)
 * @param {Object} urls - URL configuration object
 * @param {string} urls.getCollectionsListUrl - URL for getting collections list
 * @param {string} urls.updateCollectionsUrl - URL for updating collections
 * @param {string} urls.createCollectionUrl - URL for creating new collection
 */
export const showCollectionSelectorPopup = async (propertyId, propertyTitle, urls) => {
  clearAllToasts();
  await removeExistingPopup();

  const popupContainer = document.getElementById(POPUP_ID);
  const backdrop = document.querySelector(`.${POPUP_BACKDROP_CLASS}`);
  
  if (!popupContainer || !backdrop) {
    console.error("Popup elements not found in DOM");
    return;
  }

  // Get popup elements
  const elements = DOMHelpers.getPopupElements(popupContainer);
  
  // Show loading state immediately
  showLoadingState(elements.listContainer);
  
  // Reset create new container
  if (elements.createNewContainer) elements.createNewContainer.style.display = "none";
  if (elements.newCollectionNameInput) elements.newCollectionNameInput.value = "";

  // Clone elements to remove old event listeners
  const newElements = {
    ...elements,
    closeBtn: DOMHelpers.cloneAndReplace(elements.closeBtn),
    createNewBtn: DOMHelpers.cloneAndReplace(elements.createNewBtn),
    cancelBtn: DOMHelpers.cloneAndReplace(elements.cancelBtn),
    saveBtn: DOMHelpers.cloneAndReplace(elements.saveBtn)
  };
  
  const newBackdrop = DOMHelpers.cloneAndReplace(backdrop);

  // Reset button states
  ButtonStateManager.disable(newElements.createNewBtn);
  ButtonStateManager.disable(newElements.saveBtn);
  if (newElements.saveBtn) newElements.saveBtn.innerHTML = 'Готово';

  // Setup event handlers
  const modeHandler = EventHandlers.createModeHandler(newElements);
  
  if (newElements.closeBtn) {
    newElements.closeBtn.addEventListener("click", EventHandlers.createCloseHandler());
  }
  
  if (newBackdrop) {
    newBackdrop.addEventListener("click", EventHandlers.createCloseHandler());
  }
  
  if (newElements.createNewBtn) {
    newElements.createNewBtn.addEventListener("click", modeHandler.switchToCreate);
  }
  
  if (newElements.cancelBtn) {
    newElements.cancelBtn.addEventListener("click", EventHandlers.createCancelHandler(modeHandler));
  }
  
  if (newElements.saveBtn) {
    newElements.saveBtn.addEventListener("click", 
      EventHandlers.createSaveHandler(propertyId, propertyTitle, newElements, modeHandler, urls)
    );
  }

  // Show popup with animation
  setupPopupAnimation(popupContainer, newBackdrop);

  // Load data asynchronously
  const loadSuccess = await Operations.loadCollectionMarkup(urls.getCollectionsListUrl, newElements);
  
  if (loadSuccess) {
    ButtonStateManager.enable(newElements.createNewBtn);
    ButtonStateManager.enable(newElements.saveBtn);
  }
};

/**
 * Remove existing popup if any
 */
export const removeExistingPopup = async () => {
  PopupStateManager.abortCurrentOperation();

  const existingPopup = document.getElementById(POPUP_ID);
  const existingBackdrop = document.querySelector(`.${POPUP_BACKDROP_CLASS}`);

  return new Promise((resolve) => {
    if (existingPopup) {
      existingPopup.style.opacity = "0";
      existingPopup.style.transform = "translateY(20px)";

      setTimeout(() => {
        existingPopup.style.display = "none";
        
        // Reset popup content and mode after closing
        const elements = DOMHelpers.getPopupElements(existingPopup);
        
        if (elements.listElement) elements.listElement.innerHTML = "";
        if (elements.emptyContainer) elements.emptyContainer.style.display = "block";
        
        PopupStateManager.switchMode(false, elements);
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

// ===========================
// TOAST MANAGEMENT
// ===========================

/**
 * Clear the toast timer and remove any existing toast
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
 * Show interactive toast for adding to collections
 * @param {string} propertyId - Property ID
 * @param {string} propertyTitle - Property title
 * @param {Object} urls - URL configuration object
 */
const showInteractiveAddToCollectionToast = async (propertyId, propertyTitle, urls) => {
  clearAllToasts();
  removeCollectionToast();
  
  const existingToast = document.querySelector(".interactive-toast-bar");
  if (existingToast) existingToast.remove();

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

  // Trigger animation
  setTimeout(() => toastBar.classList.add("show"), 10);

  // Setup interaction tracking
  const markInteraction = () => {
    userInteracted = true;
    if (autoRemoveTimerToast) {
      clearTimeout(autoRemoveTimerToast);
      autoRemoveTimerToast = null;
    }
  };

  // Auto-removal timer
  autoRemoveTimerToast = setTimeout(async () => {
    if (!userInteracted) {
      const existingToast = document.querySelector(".interactive-toast-bar");
      if (existingToast) {
        existingToast.style.opacity = "0";
        existingToast.style.transform = "translateY(20px)";
        setTimeout(() => existingToast.remove(), 305);
      }
      await removeExistingPopup();
    }
  }, 50000);

  // Event listeners
  toastBar.addEventListener("mouseover", markInteraction);
  toastBar.addEventListener("click", markInteraction);
  toastBar.addEventListener("touchstart", markInteraction);

  addButton.addEventListener("click", () => {
    showCollectionSelectorPopup(propertyId, propertyTitle, urls);
    toastBar.classList.remove("show");
    setTimeout(() => toastBar.remove(), 300);
  });

  // Auto-hide timer
  setTimeout(async () => {
    if (document.body.contains(toastBar) && toastBar.classList.contains("show")) {
      toastBar.classList.remove("show");
      setTimeout(() => toastBar.remove(), 300);
      await removeExistingPopup();
    }
  }, 7000);
};

// ===========================
// PUBLIC API
// ===========================

/**
 * Add property to favorite collection
 * @param {string} propertyId - ID of the property to add
 * @param {string} propertyTitle - Title of the property
 * @param {string} addToFavoriteUrl - URL for adding to favorites
 * @param {boolean} showToast - Whether to show the collection selector popup
 * @param {Object} urls - URL configuration object for toast
 * @returns {object} - Detailed status of the operation
 */
export const addPropertyToFavorite = async (propertyId, propertyTitle, urls = {}, showToast = true) => {
  try {
    const added = await addPropertyToCollection(urls.addToFavoriteUrl);
    await removeExistingPopup();
    
    if (added) {
      if (showToast && urls.getCollectionsListUrl) {
        await showInteractiveAddToCollectionToast(propertyId, propertyTitle, urls);
      }
      return { action: "added", success: true, isFavorite: true };
    } else {
      console.warn(`Failed to add property ${propertyId} to 'Избранное'`);
      return { action: "add_failed", success: false, isFavorite: false };
    }
  } catch (error) {
    console.error("Error adding property to favorite:", error);
    return { action: "add_failed", success: false, isFavorite: false };
  }
};
