import { addPropertyToFavorite, showCollectionSelectorPopup } from "../components/collection-selector-popup/collection-selector-popup.js";
import { getCollections } from '../temp/collections-manager.js';
import { createAndShowToast } from '../utils/uiHelpers.js';

// Проверяем наличие избранной коллекции, создаем если нет
function ensureFavoriteCollection() {
  let collections = getCollections(); // Get initial list
  const favoriteCollection = collections.find(c => c.isFavorite);

  if (!favoriteCollection) {
    const favoriteCollectionData = {
      name: 'Избранное',
      notes: 'Автоматически созданная коллекция для избранных объектов',
      isFavorite: true
    };
    console.log('Creating favorite collection (simulated)');
    const id = 'favorite'; // Simplified ID for this example

    const newCollection = {
      id,
      name: favoriteCollectionData.name,
      notes: favoriteCollectionData.notes || '',
      properties: [],
      isFavorite: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    collections.push(newCollection); // Add to the existing array
    localStorage.setItem('realEstateCollections', JSON.stringify(collections)); // Save updated array
    return newCollection;
  }
  return favoriteCollection;
}

// Styles for collection selector popup are now globally managed via SCSS.

document.addEventListener("DOMContentLoaded", function () {
  console.log("Property view page logic loaded via index.js");
  // Убеждаемся, что коллекция избранного существует
  ensureFavoriteCollection();

  const favoriteButton = document.getElementById('favorite-button');
  const addToCollectionsButton = document.getElementById('add-to-collections-button');

  if (favoriteButton) {
    favoriteButton.addEventListener('click', function() {
      const propertyId = this.getAttribute('data-property-id');
      const propertyTitleElement = document.querySelector('.property-title');
      const propertyTitle = propertyTitleElement ? propertyTitleElement.textContent : 'Объект недвижимости';
      const heartIcon = this.querySelector('i');
      const isFavoriteIconSolid = heartIcon.classList.contains('fas');

      if (!isFavoriteIconSolid) { 
        heartIcon.classList.remove('far');
        heartIcon.classList.add('fas', 'text-danger');
        addPropertyToFavorite(propertyId, propertyTitle, true);
      } else { 
        heartIcon.classList.remove('fas', 'text-danger');
        heartIcon.classList.add('far');
        // TODO: Implement actual removal from 'Избранное' collection in collections-manager.js
        // This requires a new function, e.g., removePropertyFromFavoriteCollection(propertyId)
        createAndShowToast(`Объект "${propertyTitle}" удален из избранного (визуально). Логика удаления из коллекции не реализована.`, "info");
      }
    });
  }

  if (addToCollectionsButton) {
    addToCollectionsButton.addEventListener('click', function() {
      const propertyId = this.getAttribute('data-property-id');
      const propertyTitleElement = document.querySelector('.property-title');
      const propertyTitle = propertyTitleElement ? propertyTitleElement.textContent : 'Объект недвижимости';
      showCollectionSelectorPopup(propertyId, propertyTitle);
    });
  }
});
