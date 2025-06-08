// src/js/uiHelpers.js
import { Modal, Toast } from "bootstrap";

/**
 * Показывает модальное окно Bootstrap по его ID.
 * @param {string} modalId - ID HTML-элемента модального окна (без #).
 */
export function showModal(modalId) {
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    const modalInstance = Modal.getOrCreateInstance(modalElement);
    modalInstance.show();
  } else {
    console.error(`Modal with id "${modalId}" not found.`);
  }
}

/**
 * Скрывает модальное окно Bootstrap по его ID.
 * @param {string} modalId - ID HTML-элемента модального окна (без #).
 */
export function hideModal(modalId) {
  const modalElement = document.getElementById(modalId);
  if (modalElement) {
    const modalInstance = Modal.getInstance(modalElement);
    if (modalInstance) {
      modalInstance.hide();
    }
  } else {
    console.error(`Modal with id "${modalId}" not found.`);
  }
}

/**
 * Показывает тост Bootstrap.
 * @param {string} toastId - ID HTML-элемента тоста (без #).
 * @param {object} [options] - Опции для конструктора Toast (необязательно).
 */
export function showToast(toastId, options = {}) {
  const toastElement = document.getElementById(toastId);
  if (toastElement) {
    const toastInstance = Toast.getOrCreateInstance(toastElement, options);
    toastInstance.show();
  } else {
    console.error(`Toast with id "${toastId}" not found.`);
  }
}

/**
 * Динамически создает и показывает тост с сообщением.
 * Требует наличия контейнера для тостов в HTML, например:
 * <div class="toast-container position-fixed bottom-0 end-0 p-3"></div>
 * @param {string} message - Текст сообщения.
 * @param {'success'|'error'|'warning'|'info'|'danger'} type - Тип тоста для стилизации.
 * @param {number} [delay=5000] - Задержка перед автоматическим скрытием.
 */
export function createAndShowToast(message, type = "info", delay = 5000) {
  const toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    console.error('Toast container ".toast-container" not found in the DOM.');
    return;
  }

  // Нормализация типа для совместимости
  const normalizedType = type === "error" ? "danger" : type;

  // Иконки для разных типов toast
  const icons = {
    success: '<i class="bi bi-check-circle-fill me-2"></i>',
    danger: '<i class="bi bi-exclamation-triangle-fill me-2"></i>',
    warning: '<i class="bi bi-exclamation-circle-fill me-2"></i>',
    info: '<i class="bi bi-info-circle-fill me-2"></i>',
  };

  const toastId = `toast-${Date.now()}`;
  const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-bg-${normalizedType} border-0" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="${delay}">
            <div class="d-flex">
                <div class="toast-body d-flex align-items-center">
                    ${icons[normalizedType] || ""}${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
  toastContainer.insertAdjacentHTML("beforeend", toastHTML);
  const toastElement = document.getElementById(toastId);
  const toastInstance = Toast.getOrCreateInstance(toastElement);
  toastInstance.show();

  // Удаляем элемент тоста из DOM после его скрытия
  toastElement.addEventListener("hidden.bs.toast", () => {
    toastElement.remove();
  });
}
