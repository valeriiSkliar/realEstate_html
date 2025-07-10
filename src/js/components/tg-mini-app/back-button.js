/**
 * Утилита для управления кнопкой "Назад" в Telegram Mini App
 */

class BackButtonManager {
  constructor() {
    this.isInitialized = false;
    this.backHandler = null;
    this.canGoBack = false;
    
    // Проверяем доступность Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;
      this.backButton = this.webApp.BackButton;
    }
  }

  /**
   * Инициализация менеджера кнопки "Назад"
   */
  init() {
    if (this.isInitialized || !this.webApp) {
      return;
    }

    this.isInitialized = true;
    this.updateBackButtonState();
    
    // Слушаем изменения в истории браузера
    this.listenToHistoryChanges();
  }

  /**
   * Устанавливает обработчик для кнопки "Назад"
   * @param {Function} handler - функция-обработчик
   */
  setBackHandler(handler) {
    if (!this.backButton) return;

    // Удаляем предыдущий обработчик
    if (this.backHandler) {
      this.backButton.offClick(this.backHandler);
    }

    this.backHandler = handler;
    this.backButton.onClick(this.backHandler);
  }

  /**
   * Показывает кнопку "Назад"
   */
  show() {
    if (this.backButton) {
      this.backButton.show();
    }
  }

  /**
   * Скрывает кнопку "Назад"
   */
  hide() {
    if (this.backButton) {
      this.backButton.hide();
    }
  }

  /**
   * Проверяет, можно ли вернуться назад
   * @returns {boolean}
   */
  getCanGoBack() {
    if (typeof window === 'undefined') return false;
    
    return window.history.state && window.history.state.idx > 0;
  }

  /**
   * Обновляет состояние кнопки "Назад" в зависимости от истории
   */
  updateBackButtonState() {
    this.canGoBack = this.getCanGoBack();
    
    if (this.canGoBack) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * Слушает изменения в истории браузера
   */
  listenToHistoryChanges() {
    if (typeof window === 'undefined') return;

    // Слушаем события popstate
    window.addEventListener('popstate', () => {
      this.updateBackButtonState();
    });

    // Переопределяем методы history для отслеживания изменений
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      // Небольшая задержка для обновления состояния
      setTimeout(() => {
        backButtonManager.updateBackButtonState();
      }, 0);
    };

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      setTimeout(() => {
        backButtonManager.updateBackButtonState();
      }, 0);
    };
  }

  /**
   * Выполняет переход назад
   */
  goBack() {
    if (typeof window !== 'undefined' && this.canGoBack) {
      window.history.back();
    }
  }

  /**
   * Очищает все обработчики и скрывает кнопку
   */
  cleanup() {
    if (this.backHandler && this.backButton) {
      this.backButton.offClick(this.backHandler);
    }
    this.hide();
    this.backHandler = null;
    this.isInitialized = false;
  }

  /**
   * Устанавливает кастомный обработчик для конкретного маршрута
   * @param {string} path - путь маршрута
   * @param {Function} handler - обработчик для этого маршрута
   */
  setRouteHandler(path, handler) {
    if (typeof window === 'undefined') return;
    
    const currentPath = window.location.pathname;
    if (currentPath === path) {
      this.setBackHandler(handler);
    }
  }

  /**
   * Устанавливает обработчик по умолчанию (обычный переход назад)
   */
  setDefaultHandler() {
    this.setBackHandler(() => this.goBack());
  }
}

// Создаем единственный экземпляр менеджера
const backButtonManager = new BackButtonManager();

// Экспортируем функции для удобного использования
export const initBackButton = () => backButtonManager.init();
export const setBackHandler = (handler) => backButtonManager.setBackHandler(handler);
export const showBackButton = () => backButtonManager.show();
export const hideBackButton = () => backButtonManager.hide();
export const updateBackButtonState = () => backButtonManager.updateBackButtonState();
export const goBack = () => backButtonManager.goBack();
export const cleanupBackButton = () => backButtonManager.cleanup();
export const setRouteHandler = (path, handler) => backButtonManager.setRouteHandler(path, handler);
export const setDefaultBackHandler = () => backButtonManager.setDefaultHandler();

// Экспортируем сам менеджер для продвинутого использования
export default backButtonManager; 