import {
  addPropertyToCollection,
  favoriteCollectionId,
  getCollectionById,
  removePropertyFromCollection
} from "../../components/collections/api/collections-manager.js";


import {
  createAndShowToast,
  hideModal,
  showModal,
} from "../../utils/uiHelpers";

import {
  removeCollectionToast,
  showCollectionSelectorPopup,
} from "../../components/collections/collection-selector-popup/collection-selector-popup.js";

/**
 * Initialize collection page functionality
 */
export const initCollectionPage = () => {
  console.log("Collection page initialized");

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

  // Initialize page header actions
  initPageHeaderActions(collectionId);

  // Load collection data
  loadCollectionData(collectionId);

  // Initialize remove property functionality
  initRemovePropertyButtons();

  // Initialize add to favorite functionality
  initAddToFavorite();

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

    // Set collection name
    const collectionNameElement = document.querySelector(".collection-name");
    if (collectionNameElement) {
      collectionNameElement.textContent = collection.name;
    }

    // Set collection notes
    const form = document.querySelector("#collectionId");
    if (form && collection.id !== favoriteCollectionId && collection.notes) {
      const collectionNotesElement = document.createElement("section");
      collectionNotesElement.className = "forms-section";
      collectionNotesElement.innerHTML = `
        <div class="form-field mb-1">
          <p
            class="js-collection-notes collection-notes d-inline-block col-12 form-input text-brand-dark-navy-50 form-input text-truncate-4 border-0 mb-0 p-0"
          >
            ${collection.notes}
          </p>
        </div>
      `;
      form.append(collectionNotesElement);
    }

    // Load current properties
    loadCurrentProperties(collection.properties || []);
  }

  /**
   * Load current properties in the collection
   * @param {Array} propertyIds - Array of property IDs
   */
  function loadCurrentProperties(propertyIds) {
    const currentPropertiesContainer = document.querySelector(
      ".js-current-properties",
    );
    const currentPropertiesSearch = document.querySelector(
      ".js-current-properties-search",
    );
    const emptyCollectionMessage = document.querySelector(
      ".js-empty-collection",
    );
    const currentCountElement = document.querySelector(".current-count");

    if (currentCountElement) {
      currentCountElement.textContent = propertyIds.length;
    }

    if (propertyIds.length === 0) {
      // Show empty collection message
      if (emptyCollectionMessage) {
        emptyCollectionMessage.style.display = "flex";
        if (currentPropertiesContainer) {
          currentPropertiesContainer.style.display = "none";
        }
        if (currentPropertiesSearch) {
          currentPropertiesSearch.style.display = "none";
        }
      }
      return;
    }

    // Hide empty collection message
    if (emptyCollectionMessage) {
      emptyCollectionMessage.style.display = "none";
    }

    // For demo purposes, we'll create sample property cards based on IDs
    propertyIds.forEach((id) => {
      //TODO: Get sample property data based on ID
      // const property = getSamplePropertyById(id);

      const property = {
        id: id,
        title: "Студия, 28 м2 | ГМР",
        price: "₽ 4 900 000",
        complexName: "ЖК «Стрижи»",
        street: "Автолюбителей ул.",
        state: "С ремонтом",
        agentName: "Алексей",
        phone: "+7 (918) 254-25-36",
      };

      const favCollection = getCollectionById(favoriteCollectionId);
      const isFavorite = favCollection?.properties.includes(id);
      if (property) {
        const propertyCard = createPropertyCard(property, id, isFavorite);
        currentPropertiesContainer.appendChild(propertyCard);
      }
    });

    // Initialize add to collection buttons
    initAddToCollectionPropertyButtons();
  }

  /**
   * Create a property card element
   * @param {Object} property - Property data
   * @param {string} id - Property ID
   * @param {string} collectionId - Current collection ID
   * @param {boolean} isFavorite - Is property in favorite collection
   * @returns {HTMLElement} Property card element
   */
  function createPropertyCard(property, id, isFavorite) {
    const propertyCard = document.createElement("div");
    propertyCard.className = "col-12";
    
    propertyCard.innerHTML = `
      <div class="property-card" data-property-id="${id}">
        <div class="property-summary-card">
          <div
            class="property-summary-card__favorite-icon js-add-to-favorite ${isFavorite ? 'property-summary-card__favorite-icon--active' : ''}"
            role="button"
            aria-label="${isFavorite ? 'Добавить в избранное' : 'Удалить из избранного'}"
            tabindex="0"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="${isFavorite ? 'var(--brand-bright-pink)' : 'none'}"
              stroke="var(--brand-bright-pink)"
              stroke-width="2"
            >
              <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              ></path>
            </svg>
          </div>

          <h3 class="property-summary-card__title text-light-gray-30">
            <a href="/property-view-standalone.html">${property.title}</a>
          </h3>
          <p class="property-summary-card__price">${property.price}</p>
          <ul class="property-summary-card__details-list">
            <li class="property-summary-card__detail-item">
              <span class="property-summary-card__detail-label">Название комплекса</span>
              <span class="property-summary-card__detail-value">${property.complexName}</span>
            </li>
            <li class="property-summary-card__detail-item">
              <span class="property-summary-card__detail-label">Улица</span>
              <span class="property-summary-card__detail-value">${property.street}</span>
            </li>
            <li class="property-summary-card__detail-item">
              <span class="property-summary-card__detail-label">Состояние</span>
              <span class="property-summary-card__detail-value">${property.state}</span>
            </li>
          </ul>

          <div class="property-summary-card__phone">
            <span class="property-summary-card__phone-label">Агент:</span>
            <span class="property-summary-card__phone-agent-name">${property.agentName}</span>
            <a href="tel:${property.phone}" class="property-summary-card__phone-link">
              📞 ${property.phone}
            </a>
          </div>
          <div class="property-summary-card__footer property-summary-card__footer--actions-right">
            <div class="d-flex flex-wrap gap-2 p-2 w-100">
              ${collectionId === favoriteCollectionId
                ? `<button class="w-100 d-block brand-button brand-button--solid js-add-to-collection" data-property-id="${id}">
                     Добавить в подборку
                   </button>`
                : `<button class="w-100 d-block brand-button brand-button--outline brand-button--pink js-remove-from-collection" data-property-id="${id}">
                     Удалить из подборки
                   </button>`
              }
            </div>
          </div>
        </div>
      </div>
    `;

    return propertyCard;
  }

  /**
   * Initialize add to collection property buttons
   */
  function initAddToCollectionPropertyButtons() {
    const addToCollectionButtons = document.querySelectorAll(
      ".js-add-to-collection",
    );

    addToCollectionButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        // Get property ID
        const propertyId = button.getAttribute("data-property-id");
        const propertyTitleElement = document.querySelector(
          ".property-summary-card__title a",
        );
        const propertyTitle = propertyTitleElement
          ? propertyTitleElement.textContent
          : "Объект недвижимости";
        if (propertyId) {
          // Set property ID in modal
          removeCollectionToast();
          showCollectionSelectorPopup(propertyId, propertyTitle);
        }
      });
    });
  }

  /**
   * Remove property from UI and update counts
   * @param {string} propertyId - ID of the property to remove
   */
  function removePropertyFromUI(propertyId) {
    // Remove property card from DOM
    const propertyCard = document.querySelector(
      `[data-property-id="${propertyId}"]`,
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
          ".js-empty-collection",
        );
        const currentPropertiesContainer = document.querySelector(
          ".js-current-properties",
        );
        const currentPropertiesSearch = document.querySelector(
          ".js-current-properties-search",
        );

        if (emptyCollectionMessage) {
          emptyCollectionMessage.style.display = "flex";
        }
        if (currentPropertiesContainer) {
          currentPropertiesContainer.style.display = "none";
        }
        if (currentPropertiesSearch) {
          currentPropertiesSearch.style.display = "none";
        }
      }
    }
  }

  /**
   * Initialize remove property buttons
   */
  function initRemovePropertyButtons() {
    const removeButtons = document.querySelectorAll(
      ".js-remove-from-collection",
    );

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
      ".js-confirm-remove-property",
    );
    if (confirmRemoveButton) {
      confirmRemoveButton.addEventListener("click", () => {
        const propertyId = document.getElementById("removePropertyId").value;
        const collectionId = document.getElementById("collectionId").value;

        if (propertyId && collectionId) {
          // Remove property from collection
          const success = removePropertyFromCollection(
            collectionId,
            propertyId,
          );

          if (success) {
            // Use reusable function to update UI
            removePropertyFromUI(propertyId);

            // Show success message
            createAndShowToast("Объект удален из подборки", "success");
          } else {
            // Show error message
            createAndShowToast(
              "Не удалось удалить объект из подборки",
              "error",
            );
          }

          // Hide modal
          hideModal("removePropertyModal");
        }
      });
    }
  }

  /**
   * Initialize add to favorite functionality
   */
  function initAddToFavorite() {
    const addToFavoriteButtons = document.querySelectorAll(
      ".js-add-to-favorite",
    );

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
        button.classList.add("property-summary-card__favorite-icon--active");
      } else {
        button.classList.remove("property-summary-card__favorite-icon--active");
      }

      // Обновляем aria-label для доступности
      button.setAttribute(
        "aria-label",
        isFavorite ? "Удалить из избранного" : "Добавить в избранное",
      );
    };

    addToFavoriteButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const propertyCard = button.closest(".property-card");
        if (!propertyCard) return;
        const isFavorite = button.classList.contains(
          "property-summary-card__favorite-icon--active",
        );
        // Get property ID
        const propertyId = propertyCard.getAttribute("data-property-id");

        if (propertyId) {
          // Set property ID in modal
          if (isFavorite) {
            removePropertyFromCollection(favoriteCollectionId, propertyId);
            updateFavoriteIcon(button, false);
            createAndShowToast("Объект удален из избранного", "success");
          } else {
            addPropertyToCollection(favoriteCollectionId, propertyId);
            updateFavoriteIcon(button, true);
            createAndShowToast("Объект добавлен в избранное", "success");
          }
        }
      });
    });
  }



  /**
   * Initialize page header actions
   * @param {string} collectionId - ID of the collection
   */
  function initPageHeaderActions(collectionId) { 
    const pageHeaderActions = document.querySelector(".js-page-header-actions");
    if (pageHeaderActions && collectionId !== favoriteCollectionId) {
      const editCollectionButton = document.createElement("div");
      editCollectionButton.className = "js-edit-collection collection-item__actions justify-content-center items-center gap-0 d-flex brand-button h-100 brand-button--solid brand-button--lime-green";
      editCollectionButton.innerHTML = `
        <a href="/collections-edit.html?id=${collectionId}" class="text-brand-dark-navy">
          <i class="bi bi-pencil"></i>
        </a>
      `;
      pageHeaderActions.appendChild(editCollectionButton);
    }
  }
};
