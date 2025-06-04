import { ensureFavoriteCollection } from '../temp/collections-manager.js';

// Инициализация после загрузки
document.addEventListener("DOMContentLoaded", function () {
  // Убеждаемся, что коллекция избранного существует при загрузке страницы
  ensureFavoriteCollection();
});
