import { getCollections } from '../temp/collections-manager.js';

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

// Обработчик событий избранного
document.addEventListener("favorite-changed", function (event) {
  const propertyId = event.detail.propertyId;
  const propertyTitle = event.detail.propertyTitle;
  const isFavorite = event.detail.isFavorite;

  // Убеждаемся, что коллекция избранного существует
  ensureFavoriteCollection();

  // Логирование для отладки
  console.log(
    `Property "${propertyTitle}" ${isFavorite ? "added to" : "removed from"} favorites`
  );
});

// Демонстрационный код для тестирования телефонных ссылок
document.addEventListener("click", function (event) {
  if (event.target.closest(".property-summary-card__phone-link")) {
    const phoneLink = event.target.closest(
      ".property-summary-card__phone-link"
    );
    const phoneNumber = phoneLink.textContent.trim();
    console.log(`Calling ${phoneNumber}`);
  }
});

// Инициализация после загрузки
document.addEventListener("DOMContentLoaded", function () {
  console.log("Search page logic loaded via index.js");

  // Убеждаемся, что коллекция избранного существует при загрузке страницы
  ensureFavoriteCollection();
});
