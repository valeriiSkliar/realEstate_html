/**
 * Property Summary Card Interactive Module
 * Обеспечивает интерактивность для карточек недвижимости
 */

class PropertySummaryCardManager {
  constructor() {
    this.favoriteCards = new Set();
    this.init();
  }

  /**
   * Инициализация модуля
   */
  init() {
    if (!document.querySelector(".search-page")) {
      console.warn("No property summary cards found on the page.");
      return;
    }
    this.bindEvents();
    this.loadFavoritesFromStorage();
  }

  /**
   * Привязка событий к карточкам
   */
  bindEvents() {
    // Используем делегирование событий для динамически добавляемых карточек
    document.addEventListener("click", this.handleFavoriteClick.bind(this));
    document.addEventListener("keydown", this.handleFavoriteKeydown.bind(this));
  }

  /**
   * Обработка клика по иконке избранного
   */
  handleFavoriteClick(event) {
    const favoriteIcon = event.target.closest(
      ".property-summary-card__favorite-icon"
    );
    if (!favoriteIcon) return;

    event.preventDefault();
    this.toggleFavorite(favoriteIcon);
  }

  /**
   * Обработка нажатия клавиш для доступности
   */
  handleFavoriteKeydown(event) {
    const favoriteIcon = event.target.closest(
      ".property-summary-card__favorite-icon"
    );
    if (!favoriteIcon) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.toggleFavorite(favoriteIcon);
    }
  }

  /**
   * Переключение состояния избранного
   */
  toggleFavorite(favoriteIcon) {
    const card = favoriteIcon.closest(".property-summary-card");
    const propertyId = card.dataset.propertyId;

    if (!propertyId) {
      console.warn("Property ID not found for card");
      return;
    }

    const currentState = favoriteIcon.dataset.favorite === "true";
    const newState = !currentState;

    // Обновляем визуальное состояние
    this.updateFavoriteVisual(favoriteIcon, newState);

    // Обновляем данные
    favoriteIcon.dataset.favorite = newState.toString();

    if (newState) {
      this.favoriteCards.add(propertyId);
    } else {
      this.favoriteCards.delete(propertyId);
    }

    // Сохраняем в localStorage
    this.saveFavoritesToStorage();

    // Отправляем событие для других компонентов
    this.dispatchFavoriteEvent(card, propertyId, newState);

    // Анимация
    this.animateFavoriteToggle(favoriteIcon);
  }

  /**
   * Обновление визуального состояния иконки избранного
   */
  updateFavoriteVisual(favoriteIcon, isFavorite) {
    const emptyHeart = favoriteIcon.querySelector(
      ".property-summary-card__heart-empty"
    );
    const filledHeart = favoriteIcon.querySelector(
      ".property-summary-card__heart-filled"
    );

    if (isFavorite) {
      favoriteIcon.classList.add(
        "property-summary-card__favorite-icon--active"
      );
      favoriteIcon.setAttribute("aria-label", "Удалить из избранного");
      emptyHeart.style.display = "none";
      filledHeart.style.display = "block";
    } else {
      favoriteIcon.classList.remove(
        "property-summary-card__favorite-icon--active"
      );
      favoriteIcon.setAttribute("aria-label", "Добавить в избранное");
      emptyHeart.style.display = "block";
      filledHeart.style.display = "none";
    }
  }

  /**
   * Анимация переключения избранного
   */
  animateFavoriteToggle(favoriteIcon) {
    favoriteIcon.classList.add("property-summary-card__favorite-icon--animate");

    setTimeout(() => {
      favoriteIcon.classList.remove(
        "property-summary-card__favorite-icon--animate"
      );
    }, 300);
  }

  /**
   * Отправка кастомного события
   */
  dispatchFavoriteEvent(card, propertyId, isFavorite) {
    const event = new CustomEvent("property-favorite-changed", {
      detail: {
        propertyId,
        isFavorite,
        card,
      },
      bubbles: true,
    });

    card.dispatchEvent(event);
  }

  /**
   * Загрузка избранного из localStorage
   */
  loadFavoritesFromStorage() {
    try {
      const stored = localStorage.getItem("property-favorites");
      if (stored) {
        this.favoriteCards = new Set(JSON.parse(stored));
        this.updateAllCardsFromStorage();
      }
    } catch (error) {
      console.warn("Error loading favorites from storage:", error);
    }
  }

  /**
   * Сохранение избранного в localStorage
   */
  saveFavoritesToStorage() {
    try {
      localStorage.setItem(
        "property-favorites",
        JSON.stringify([...this.favoriteCards])
      );
    } catch (error) {
      console.warn("Error saving favorites to storage:", error);
    }
  }

  /**
   * Обновление всех карточек на основе данных из localStorage
   */
  updateAllCardsFromStorage() {
    const cards = document.querySelectorAll(".property-summary-card");

    cards.forEach((card) => {
      const propertyId = card.dataset.propertyId;
      const favoriteIcon = card.querySelector(
        ".property-summary-card__favorite-icon"
      );

      if (propertyId && favoriteIcon) {
        const isFavorite = this.favoriteCards.has(propertyId);
        favoriteIcon.dataset.favorite = isFavorite.toString();
        this.updateFavoriteVisual(favoriteIcon, isFavorite);
      }
    });
  }

  /**
   * Публичный метод для добавления карточки в избранное
   */
  addToFavorites(propertyId) {
    const card = document.querySelector(`[data-property-id="${propertyId}"]`);
    if (card) {
      const favoriteIcon = card.querySelector(
        ".property-summary-card__favorite-icon"
      );
      if (favoriteIcon && favoriteIcon.dataset.favorite !== "true") {
        this.toggleFavorite(favoriteIcon);
      }
    }
  }

  /**
   * Публичный метод для удаления карточки из избранного
   */
  removeFromFavorites(propertyId) {
    const card = document.querySelector(`[data-property-id="${propertyId}"]`);
    if (card) {
      const favoriteIcon = card.querySelector(
        ".property-summary-card__favorite-icon"
      );
      if (favoriteIcon && favoriteIcon.dataset.favorite === "true") {
        this.toggleFavorite(favoriteIcon);
      }
    }
  }

  /**
   * Получение списка избранных объектов
   */
  getFavorites() {
    return [...this.favoriteCards];
  }

  /**
   * Проверка, находится ли объект в избранном
   */
  isFavorite(propertyId) {
    return this.favoriteCards.has(propertyId);
  }
}

// Инициализация при загрузке DOM
let propertyCardManager;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    propertyCardManager = new PropertySummaryCardManager();
  });
} else {
  propertyCardManager = new PropertySummaryCardManager();
}

// Экспорт для использования в других модулях
export { PropertySummaryCardManager };

// Глобальный доступ для совместимости
window.PropertySummaryCardManager = PropertySummaryCardManager;
window.propertyCardManager = propertyCardManager;
