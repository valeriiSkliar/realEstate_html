/**
 * Утилита для управления кнопкой "Назад" в Telegram Mini App
 */

class BackButtonManager {
  sessionStorageKey = "_tg_mini_app_back_button_state";
  sessionStorageEventKey = "_tg_mini_app_back_button_event";

  constructor() {
    this.isInitialized = false;
    this.backHandler = null;
    this.canGoBack = false;
    this.isProcessing = false; // Prevent multiple simultaneous operations
    
    // Проверяем доступность Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;
      this.backButton = this.webApp.BackButton;
    } else {
      console.warn('Telegram WebApp is not available, back button will not be initialized');
    }
  }

  /**
   * Инициализация менеджера кнопки "Назад"
   */
  init() {
    try {
      const isFirstInit = window.history.length === 1 && Boolean(window.location.hash);
      const currentPage = this.getBackButtonState();
      const event = this.getBackButtonEvent();
      
      if (event) {
        // Если страница была открыта с помощью кнопки "Назад", то сбрасываем флаг события
        this.setBackButtonEvent(false);
      } else {
        if(isFirstInit) {
         // Если это первая инициализация, то сбрасываем состояние кнопки "Назад"
          this.reset();
        } else {
          this.setBackButtonState(currentPage + 1);
        }
      }

      if (this.isInitialized || !this.webApp || !this.backButton) {
        return;
      }

      this.isInitialized = true;
      this.updateBackButtonState();
    } catch (error) {
      console.warn('BackButtonManager init error:', error);
    }
  }

  /**
   * Получает состояние кнопки "Назад" из sessionStorage
   * @returns {number}
   */
  getBackButtonState() {
    try {
      const state = sessionStorage.getItem(this.sessionStorageKey);
      if (!state) {
        this.setBackButtonState(1);
        return 1;
      }
      const parsedState = JSON.parse(state);
      return typeof parsedState === 'number' && parsedState >= 1 ? parsedState : 1;
    } catch (error) {
      console.warn('Error getting back button state:', error);
      return 1;
    }
  }

  /**
   * Устанавливает состояние кнопки "Назад" в sessionStorage
   * @param {number} state
   */
  setBackButtonState(state) {
    try {
      const normalizedState = Math.max(1, Math.floor(state));
      sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(normalizedState));
    } catch (error) {
      console.warn('Error setting back button state:', error);
    }
  }

  /**
   * Получает событие кнопки "Назад" из sessionStorage
   * @returns {boolean}
   */
  getBackButtonEvent() {
    try {
      const event = sessionStorage.getItem(this.sessionStorageEventKey);
      if (!event) {
        return false;
      }
      return JSON.parse(event) === true;
    } catch (error) {
      console.warn('Error getting back button event:', error);
      return false;
    }
  }

  /**
   * Устанавливает событие кнопки "Назад" в sessionStorage
   * @param {boolean} booleanState
   */
  setBackButtonEvent(booleanState) {
    try {
      sessionStorage.setItem(this.sessionStorageEventKey, JSON.stringify(Boolean(booleanState)));
    } catch (error) {
      console.warn('Error setting back button event:', error);
    }
  }

  /**
   * Устанавливает обработчик для кнопки "Назад"
   * @param {Function} handler - функция-обработчик
   */
  setBackHandler(handler) {
    if (!this.backButton || typeof handler !== 'function') return;

    try {
      // Удаляем предыдущий обработчик
      if (this.backHandler) {
        this.backButton.offClick(this.backHandler);
      }

      this.backHandler = handler;
      this.backButton.onClick(this.backHandler);
    } catch (error) {
      console.warn('Error setting back handler:', error);
    }
  }

  /**
   * Показывает кнопку "Назад"
   */
  show() {
    if (!this.backButton) return;
    
    try {
      this.backButton.show();
    } catch (error) {
      console.warn('Error showing back button:', error);
    }
  }

  /**
   * Скрывает кнопку "Назад"
   */
  hide() {
    if (!this.backButton) return;
    
    try {
      this.backButton.hide();
    } catch (error) {
      console.warn('Error hiding back button:', error);
    }
  }

  /**
   * Проверяет, можно ли вернуться назад
   * @returns {boolean}
   */
  getCanGoBack() {
    if (typeof window === 'undefined') return false;
    
    try {
      const currentPage = this.getBackButtonState();
      return currentPage > 1;
    } catch (error) {
      console.warn('Error checking can go back:', error);
      return false;
    }
  }

  /**
   * Обновляет состояние кнопки "Назад" в зависимости от истории
   */
  updateBackButtonState() {
    try {
      this.canGoBack = this.getCanGoBack();
      
      if (this.canGoBack) {
        this.show();
      } else {
        this.hide();
      }
    } catch (error) {
      console.warn('Error updating back button state:', error);
    }
  }

  /**
   * Выполняет переход назад
   */
  goBack() {
    if (typeof window === 'undefined' || this.isProcessing) return;
    
    try {
      this.isProcessing = true;
      const currentPage = this.getBackButtonState();
      
      if (currentPage > 1) {
        this.setBackButtonState(currentPage - 1);
        this.setBackButtonEvent(true);
        
        // Небольшая задержка для предотвращения race conditions
        setTimeout(() => {
          window.history.back();
          this.isProcessing = false;
        }, 10);
      } else {
        this.hide();
        this.isProcessing = false;
      }
    } catch (error) {
      console.warn('Error going back:', error);
      this.isProcessing = false;
    }
  }

  /**
   * Очищает все обработчики и скрывает кнопку
   */
  cleanup() {
    try {
      if (this.backHandler && this.backButton) {
        this.backButton.offClick(this.backHandler);
      }
      this.hide();
      this.backHandler = null;
      this.isInitialized = false;
      this.isProcessing = false;
    } catch (error) {
      console.warn('Error during cleanup:', error);
    }
  }

  /**
   * Устанавливает обработчик по умолчанию (обычный переход назад)
   */
  setDefaultHandler() {
    this.setBackHandler(() => this.goBack());
  }

  /**
   * Сбрасывает состояние кнопки "Назад"
   */
  reset() {
    try {
      this.setBackButtonState(1);
      this.setBackButtonEvent(false);
      this.updateBackButtonState();
    } catch (error) {
      console.warn('Error resetting back button:', error);
    }
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
export const resetBackButton = () => backButtonManager.reset();

// Экспортируем сам менеджер для продвинутого использования
export default backButtonManager; 