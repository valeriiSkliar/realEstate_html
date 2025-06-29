import {
  addPropertyToCollection,
  favoriteCollectionId,
  generateRemovePropertyFromCollectionUrl,
  removePropertyFromCollection
} from "../../components/collections/api/collections-manager.js";

import {
  createAndShowToast,
  hideModal,
  showModal,
} from "../../utils/uiHelpers";

import { getObjectPlural } from "../../utils/pluralization";

import {
  removeCollectionToast,
  removeExistingPopup,
  showCollectionSelectorPopup
} from "../../components/collections/collection-selector-popup/collection-selector-popup.js";

/**
 * Initialize collection page functionality
 */
export const initCollectionPage = () => {
  // Initialize remove property functionality
  initRemovePropertyButtons();

  // Initialize add to favorite functionality
  initAddToFavorite();

  initAddToCollectionPropertyButtons();

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

        // Get URLs from data attributes
        const getCollectionsListUrl = button.getAttribute("data-get-collections-list-url");
        const updateCollectionsUrl = button.getAttribute("data-update-collections-url");
        const createCollectionUrl = button.getAttribute("data-create-collection-url");
        
        // Get property info
        const propertyId = button.getAttribute("data-property-id");
        const propertyTitleElement = document.querySelector(
          ".property-summary-card__title a",
        );
        const propertyTitle = propertyTitleElement
          ? propertyTitleElement.textContent
          : "Объект недвижимости";
          
        if (propertyId && getCollectionsListUrl && updateCollectionsUrl) {
          // Set property ID in modal
          removeCollectionToast();
          showCollectionSelectorPopup(
            propertyId, 
            propertyTitle, 
            {
              getCollectionsListUrl,
              updateCollectionsUrl,
              createCollectionUrl
            }
          );
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
    const currentCountText = document.querySelector(".js-current-count-text");
    if (currentCount) {
      const count = parseInt(currentCount.textContent) - 1;
      currentCount.textContent = count;
      currentCountText.textContent = getObjectPlural(count);

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
        removeExistingPopup();
        
        // Get property ID and remove URL from data attributes
        const propertyId = button.getAttribute("data-property-id");
        const removeUrl = button.getAttribute("data-remove-url");
        
        if (propertyId && removeUrl) {
          // Set property ID and URL in modal
          document.getElementById("removePropertyId").value = propertyId;
          document.getElementById("removePropertyUrl").value = removeUrl;

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
      confirmRemoveButton.addEventListener("click", async () => {
        const propertyId = document.getElementById("removePropertyId").value;
        const removeUrl = document.getElementById("removePropertyUrl").value;

        try {
          if (propertyId && removeUrl) {
            // Remove property from collection using URL from markup
            const success = await removePropertyFromCollection(removeUrl);
  
            if (success && !success.error) {
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
          }
        } catch (error) {
          console.error("Error removing property from collection", error);

          createAndShowToast(
            "Не удалось удалить объект из подборки",
            "error",
          );
        }
        
        // Hide modal
        hideModal("removePropertyModal");
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
      button.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        await removeExistingPopup();

        const propertyCard = button.closest(".property-card");
        if (!propertyCard) return;
        
        const isFavorite = button.classList.contains(
          "property-summary-card__favorite-icon--active",
        );
        
        // Get property ID and favorite URL from data attributes
        const propertyId = propertyCard.getAttribute("data-property-id");
        const addToFavoriteUrl = button.getAttribute("data-add-to-favorite-url");

        if (propertyId && addToFavoriteUrl) {
          if (isFavorite) {
            // For removing from favorites, we need to construct the URL or get it from markup
            // Using legacy function for now - could be improved by adding data-remove-from-favorite-url
            const removeFromFavoriteUrl = generateRemovePropertyFromCollectionUrl(favoriteCollectionId, propertyId);
            await removePropertyFromCollection(removeFromFavoriteUrl);
            updateFavoriteIcon(button, false);
            createAndShowToast("Объект удален из избранного", "success");
          } else {
            await addPropertyToCollection(addToFavoriteUrl);
            updateFavoriteIcon(button, true);
            createAndShowToast("Объект добавлен в избранное", "success");
          }
        }
      });
    });
  }
};
