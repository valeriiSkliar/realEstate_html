import {
  addPropertyToCollection,
  favoriteCollectionId,
  getCollectionById,
  removePropertyFromCollection,
  updateCollection,
} from "./collections-manager";

import {
  createForm,
  validators,
} from "../forms/index.js";

import { createAndShowToast } from '../utils/uiHelpers';

import { removeCollectionToast, showCollectionSelectorPopup } from "../components/collection-selector-popup/collection-selector-popup.js";
import { ensureFavoriteCollection } from './collections-manager.js';

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

  ensureFavoriteCollection();

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
    
    // Initialize remove property functionality
    initRemovePropertyButtons();

    // Initialize add to favorite functionality
    initAddToFavorite();
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
  document.getElementById("collectionNotes").value =
    collection.description || "";

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
  const currentPropertiesSearch = document.querySelector(
    ".js-current-properties-search"
  );
  const emptyCollectionMessage = document.querySelector(".js-empty-collection");
  const currentCountElement = document.querySelector(".current-count");

  if (currentCountElement) {
    currentCountElement.textContent = propertyIds.length;
  }

  // if (!currentPropertiesContainer) return;

  // Clear container
  // currentPropertiesContainer.innerHTML = "";

  if (propertyIds.length === 0) {
    // Show empty collection message
    if (emptyCollectionMessage) {
      const title = document.querySelector(".card-title");
      
      emptyCollectionMessage.style.display = "flex";
      currentPropertiesContainer.style.display = "none";
      currentPropertiesSearch.style.display = "none";
      title.style.display = "none";
    }
    return;
  }

  // Hide empty collection message
  if (emptyCollectionMessage) {
    emptyCollectionMessage.style.display = "none";
  }

  // For demo purposes, we'll create sample property cards based on IDs
  // propertyIds.forEach((id) => {
  //   // Get sample property data based on ID
  //   const property = getSamplePropertyById(id);

  //   if (property) {
  //     const propertyCard = createPropertyCard(property, id);
  //     currentPropertiesContainer.appendChild(propertyCard);
  //   }
  // });
  
  // Initialize add to collection buttons
  initAddToCollectionPropertyButtons();
};

/**
 * Initialize add to collection property buttons
 */
function initAddToCollectionPropertyButtons() {
  const addToCollectionButtons = document.querySelectorAll(".js-add-to-collection");

  addToCollectionButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Get property ID
      const propertyId = button.getAttribute("data-property-id");
      const propertyTitleElement = document.querySelector('.property-summary-card__title a');
      const propertyTitle = propertyTitleElement ? propertyTitleElement.textContent : 'Объект недвижимости';
      if (propertyId) {
        // Set property ID in modal
        removeCollectionToast();
        showCollectionSelectorPopup(propertyId, propertyTitle);
      }
    });
  });
  };
  
  /**
 * Initialize remove property buttons
 */
  function initRemovePropertyButtons() {
    const removeButtons = document.querySelectorAll(".js-remove-from-collection");
    const collectionId = document.getElementById("collectionId").value;
    removeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Get collection ID
        const collectionId = document.getElementById("collectionId").value;

        if (!collectionId) return;

        // Get property ID
        const propertyId = button.getAttribute("data-property-id");
        
        if (propertyId) {
          // Set property ID in modal
          const res = removePropertyFromCollection(collectionId, propertyId);

          if (res) {
            createAndShowToast("Объект удален из подборки", "success");
          } else {
            createAndShowToast("Не удалось удалить объект из подборки", "error");
          }
        }
      });
    });
  }


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
        createAndShowToast("Подборка успешно обновлена", "success");
      } else {
        createAndShowToast("Не удалось обновить подборку", "error");
      }
    });
  }
};
};

function initAddToFavorite() {
  const addToFavoriteButtons = document.querySelectorAll(".js-add-to-favorite");


  // Новый метод для обновления только иконки избранного
  const updateFavoriteIcon = (button, isFavorite) => {

    if (!button) return;

    // SVG иконки сердечка
    const heartIconEmpty = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brand-bright-pink)" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    `;

    const heartIconFilled = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--brand-bright-pink)" stroke="var(--brand-bright-pink)" stroke-width="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
    `;

    // Обновляем иконку
    button.innerHTML = isFavorite ? heartIconFilled : heartIconEmpty;

    // Обновляем CSS класс
    if (isFavorite) {
      button.classList.add(
        "property-summary-card__favorite-icon--active"
      );
    } else {
      button.classList.remove(
        "property-summary-card__favorite-icon--active"
      );
    }

    // Обновляем aria-label для доступности
    button.setAttribute(
      "aria-label",
      isFavorite ? "Удалить из избранного" : "Добавить в избранное"
    );
  }


  addToFavoriteButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      const propertyCard = button.closest(".property-card");
      if (!propertyCard) return;
      const isFavorite = button.classList.contains("property-summary-card__favorite-icon--active");
      // Get property ID
      const propertyId = propertyCard.getAttribute("data-property-id");
      
      if (propertyId) {
        // Set property ID in modal
        if(isFavorite) {
          removePropertyFromCollection(favoriteCollectionId, propertyId);
          updateFavoriteIcon(button, false);
        } else {
          addPropertyToCollection(favoriteCollectionId, propertyId);
          updateFavoriteIcon(button, true)
        }
      }
    });
  });
}