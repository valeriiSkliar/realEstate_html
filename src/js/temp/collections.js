import { createAndShowToast, hideModal, showModal } from "../utils/uiHelpers";
import {
  deleteCollection,
  getCollections,
  toggleCollectionFavorite,
} from "./collections-manager";

/**
 * Initialize collections page functionality
 */
export const initCollectionsPage = () => {
  console.log("Collections page initialized");

  // Check if we have collections and show/hide empty state
  updateCollectionsView();

  // Initialize delete collection functionality
  initDeleteCollection();

  // Initialize search/filter functionality
  // initCollectionSearch();

    // Initialize favorite collection functionality
    initFavoriteCollection();
};

/**
 * Update the collections view based on current collections
 */
const updateCollectionsView = () => {
  const collections = getCollections();
  const emptyState = document.querySelector(".js-empty-collections");
  const collectionsControls = document.querySelector(
    ".js-collections-controls"
  );
  const collectionsList = document.querySelector(".js-collections-list");
  if (collectionsList) {
    collectionsList.style.display = "block";
    renderCollections(collections);
  }
  // Show empty state if no collections
  if (!collections || collections.length === 0) {
    if (emptyState) emptyState.style.display = "flex";
    if (collectionsControls) collectionsControls.style.display = "none";
    if (collectionsList) collectionsList.style.display = "none";
  } else {
    if (emptyState) emptyState.style.display = "none";
    if (collectionsControls) collectionsControls.style.display = "flex";
    if (collectionsList) {
      collectionsList.style.display = "block";

      // Populate collections list
      renderCollections(collections);
    }
  }
};

/**
 * Render collections list
 * @param {Array} collections - Array of collection objects
 */
const renderCollections = (collections) => {
  const collectionsList = document.querySelector(".js-collections-list");

  if (!collectionsList) return;

  // Clear current list
  collectionsList.innerHTML = "";
  
  // Check if collections is null or empty
  if (!collections || collections.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "collections-empty-state";
    emptyState.innerHTML = `
      <div class="collections-empty-state__icon">
        <i class="bi bi-folder"></i>
      </div>
      <h3 class="collections-empty-state__title">У вас пока нет коллекций</h3>
      <p class="collections-empty-state__text">Создайте свою первую коллекцию объектов недвижимости</p>
      <a href="/collections-create.html" class="btn btn-brand-lime">Создать коллекцию</a>
    `;
    collectionsList.appendChild(emptyState);
    return;
  }

  // Sort collections by favorite first, then by updated date
  const sortedCollections = [...collections].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  // Create collection items
  sortedCollections.forEach((collection) => {
    const collectionItem = document.createElement("div");
    collectionItem.className = `collection-item ${collection.isFavorite ? 'is-favorite' : ''}`;
    collectionItem.setAttribute("data-collection-id", collection.id);

    // Format date
    const updatedDate = new Date(collection.updatedAt);
    const formattedDate = updatedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // Calculate property count
    const propertyCount = collection.properties
      ? collection.properties.length
      : 0;

    // Create HTML for collection item
    collectionItem.innerHTML = `
                <div class="collection-item__main">
                  <a href="/collections-edit.html?id=${collection.id}">
                  <h3 class="collection-item__name">
                    ${collection.name}
                  </h3>
                  <div class="collection-item__info">
                    <div class="collection-item__count">
                      <i class="bi bi-building"></i> ${propertyCount} объектов
                    </div>
                    <div class="collection-item__date">
                      <i class="bi bi-calendar"></i> Обновлено ${formattedDate}
                    </div>
                  </div>
                  </a>
                </div>
                <div class="collection-item__actions">
                                <a href="/collections-edit.html?id=${collection.id}" class="btn btn-outline-brand-turquoise">
                                  <i class="bi bi-pencil"></i>
                                </a>
                                <button class="btn btn-outline-brand-bright-pink js-delete-collection" data-collection-id="${collection.id}">
                                  <i class="bi bi-trash"></i>
                                </button>
                </div>`;

    collectionsList.appendChild(collectionItem);
  });

  // Re-initialize delete buttons
  initDeleteButtons();
};

/**
 * Initialize delete buttons
 */
const initDeleteButtons = () => {
  const deleteButtons = document.querySelectorAll(".js-delete-collection");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Get collection ID
      const collectionId = button.getAttribute("data-collection-id");

      if (collectionId) {
        // Set collection ID in modal
        const deleteCollectionIdInput =
          document.getElementById("deleteCollectionId");
        if (deleteCollectionIdInput) {
          deleteCollectionIdInput.value = collectionId;
        }

        // Show confirmation modal
        showModal("deleteCollectionModal");
      }
    });
  });
};

/**
 * Initialize delete collection functionality
 */
const initDeleteCollection = () => {
  const confirmDeleteButton = document.querySelector(".js-confirm-delete");

  if (confirmDeleteButton) {
    confirmDeleteButton.addEventListener("click", () => {
      // Get collection ID from hidden input
      const collectionId = document.getElementById("deleteCollectionId").value;

      if (collectionId) {
        console.log(`Deleting collection ${collectionId}`);

        // Delete collection
        const success = deleteCollection(collectionId);

        if (success) {
          // Show success message
          createAndShowToast("Коллекция успешно удалена", "success");

          // Update view
          updateCollectionsView();
        } else {
          // Show error message
          createAndShowToast("Не удалось удалить коллекцию", "error");
        }

        // Hide modal
        hideModal("deleteCollectionModal");
      }
    });
  }
};

/**
 * Initialize favorite collection functionality
 */
const initFavoriteCollection = () => {
  document.addEventListener('click', (e) => {
    if (e.target.closest('.js-toggle-favorite')) {
      const button = e.target.closest('.js-toggle-favorite');
      const collectionId = button.getAttribute('data-collection-id');
      
      const updatedCollection = toggleCollectionFavorite(collectionId);
      
      if (updatedCollection) {
        createAndShowToast(
          updatedCollection.isFavorite ? 
          "Коллекция отмечена как избранная" : 
          "Коллекция больше не избранная",
          "success"
        );
        updateCollectionsView();
      }
    }
  });
};

