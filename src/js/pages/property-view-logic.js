import { ensureFavoriteCollection, favoriteCollectionId, removePropertyFromCollection } from '../components/collections/api/collections-manager.js';
import { addPropertyToFavorite, removeCollectionToast, showCollectionSelectorPopup } from "../components/collections/collection-selector-popup/collection-selector-popup.js";
import { createAndShowToast } from '../utils/uiHelpers.js';


document.addEventListener("DOMContentLoaded", function () {
  // Убеждаемся, что коллекция избранного существует
  ensureFavoriteCollection();

  const favoriteButton = document.getElementById('favorite-button');
  const addToCollectionsButton = document.getElementById('add-to-collections-button');

    favoriteButton?.addEventListener('click', function() {
      const propertyId = this.getAttribute('data-property-id');

      const propertyTitleElement = document.querySelector('.property-title');
      const propertyTitle = propertyTitleElement ? propertyTitleElement.textContent : 'Объект недвижимости';


      const heartIcon = this.querySelector('i');
      const isFavoriteIconSolid = heartIcon.classList.contains('bi-heart-fill');

      if (!isFavoriteIconSolid) { 
        heartIcon.classList.remove('bi-heart');
        heartIcon.classList.add('bi-heart-fill');
        addPropertyToFavorite(propertyId, propertyTitle, true);
      } else { 
        heartIcon.classList.remove('bi-heart-fill');
        heartIcon.classList.add('bi-heart');
        // TODO: Implement actual removal from 'Избранное' collection in collections-manager.js
        // This requires a new function, e.g., removePropertyFromFavoriteCollection(propertyId)
        removePropertyFromCollection(favoriteCollectionId, propertyId);
        removeCollectionToast();
        createAndShowToast(`${propertyTitle} удалено из избранного`, 'success');
      }
    });

  
  
  addToCollectionsButton?.addEventListener('click', function () {
      removeCollectionToast();
      const propertyId = this.getAttribute('data-property-id');
      const propertyTitleElement = document.querySelector('.property-detail-header__title');
      const propertyTitle = propertyTitleElement ? propertyTitleElement.textContent : 'Объект недвижимости';
      showCollectionSelectorPopup(propertyId, propertyTitle);
    });
});
