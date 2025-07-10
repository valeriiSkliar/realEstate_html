/**
 * Утилита для управления кнопкой "Назад" в Telegram Mini App
 */

class BackButtonManager {
  sessionStorageKey = "_tg_mini_app_back_button_state";

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
    // Каждая инициализация увеличивает номер страницы на 1
    const currentPage = this.getBackButtonState();
    if (currentPage) {
      this.setBackButtonState(currentPage + 1);
    }

    if (this.isInitialized || !this.webApp) {
      return;
    }

    this.isInitialized = true;
    this.updateBackButtonState();
  }

  /**
   * Получает состояние кнопки "Назад" из sessionStorage
   * @returns {number}
   */
  getBackButtonState() {
    const state = sessionStorage.getItem(this.sessionStorageKey);
    if (!state || state <= 1) {
      this.hide();
      return 1;
    }
    return JSON.parse(state);
  }

  /**
   * Устанавливает состояние кнопки "Назад" в sessionStorage
   * @param {number} state
   */
  setBackButtonState(state) {
    if (state <= 1) {
      sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(1));
      this.hide();
    } else {
      sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(state));
    }
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
    const currentPage = this.getBackButtonState();
    if (!currentPage || currentPage <= 1) {
      this.setBackButtonState(1);
      return false;
    } else {
      return currentPage > 1;
    }
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
   * Выполняет переход назад
   */
  goBack() {
    if (typeof window !== 'undefined' && this.canGoBack) {
      this.setBackButtonState(this.getBackButtonState() - 1);
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
export const setDefaultBackHandler = () => backButtonManager.setDefaultHandler();

// Экспортируем сам менеджер для продвинутого использования
export default backButtonManager; 