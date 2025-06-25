import {
  favoriteCollectionId,
  removePropertyFromCollection
} from "../components/collections/api/collections-manager";
import {
  addPropertyToFavorite,
  removeCollectionToast,
} from "../components/collections/collection-selector-popup/collection-selector-popup.js";
import { createAndShowToast } from "../utils/uiHelpers";

// Инициализация после загрузки
document.addEventListener("DOMContentLoaded", function () {

  const propertyCards = document.querySelectorAll("property-summary-card");

  propertyCards.forEach((card) => {
    card.addEventListener("favorite-changed", async (e) => {
      console.log("favorite-changed", e.detail);
      if (e.detail.isFavorite) {
        // Добавляем свойство в избранное и показываем попап выбора подборок
        await addPropertyToFavorite(
          e.detail.propertyId,
          e.detail.propertyTitle,
          true,
        );
      } else {
        // Удаляем тост если он есть
        removeCollectionToast();
        // Удаляем свойство из избранного
        await removePropertyFromCollection(favoriteCollectionId, e.detail.propertyId);
        // Показываем тост
        createAndShowToast(
          `${e.detail.propertyTitle} удалено из избранного`,
          "success",
        );
      }
    });
  });
});
