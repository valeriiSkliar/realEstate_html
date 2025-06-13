import {
  ensureFavoriteCollection,
  favoriteCollectionId,
  removePropertyFromCollection,
} from "../components/api/collections-manager";
import {
  addPropertyToFavorite,
  removeCollectionToast,
} from "../components/collection-selector-popup/collection-selector-popup.js";
import { createAndShowToast } from "../utils/uiHelpers";

// Инициализация после загрузки
document.addEventListener("DOMContentLoaded", function () {
  // Убеждаемся, что коллекция избранного существует при загрузке страницы
  ensureFavoriteCollection();

  const propertyCards = document.querySelectorAll("property-summary-card");

  propertyCards.forEach((card) => {
    card.addEventListener("favorite-changed", (e) => {
      if (e.detail.isFavorite) {
        // Добавляем свойство в избранное и показываем попап выбора подборок
        addPropertyToFavorite(
          e.detail.propertyId,
          e.detail.propertyTitle,
          true,
        );
      } else {
        // Удаляем тост если он есть
        removeCollectionToast();
        // Удаляем свойство из избранного
        removePropertyFromCollection(favoriteCollectionId, e.detail.propertyId);
        // Показываем тост
        createAndShowToast(
          `${e.detail.propertyTitle} удалено из избранного`,
          "success",
        );
      }
    });
  });
});
