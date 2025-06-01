// Исправленный forms/index.js
import { formAdapters } from "./adapters.js";
import { FormBuilder } from "./FormBuilder.js";
import { FormManager } from "./FormManager.js";
import { formHandlers } from "./handlers.js";
import { schemas } from "./schemas.js";
import { validators } from "./validators.js";

// Экспорт основных классов
export { FormBuilder, FormManager };

// Экспорт валидаторов и схем
export { schemas, validators };

// Экспорт адаптеров и обработчиков
export { formAdapters, formHandlers };

// Константы и конфигурация
export const FORM_CONFIG = {
  DEFAULT_ERROR_CLASS: "is-invalid",
  DEFAULT_VALID_CLASS: "is-valid",
  DEFAULT_ERROR_MESSAGE_CLASS: "invalid-feedback",
  DEFAULT_SUBMIT_LOADING_TEXT: "Отправка...",
  DEFAULT_VALIDATION_DEBOUNCE: 300,
  DEFAULT_SCROLL_BEHAVIOR: "smooth",
};

// Быстрое создание FormManager для существующей формы
export const createForm = (formSelector, schema, options = {}) => {
  const form =
    typeof formSelector === "string"
      ? document.querySelector(formSelector)
      : formSelector;

  if (!form) {
    throw new Error(`Form not found: ${formSelector}`);
  }

  const formOptions = {
    schema: schema || {},
    ...options,
  };

  return new FormManager(form, formOptions);
};

// Утилитарные функции для форм
export function setFormLoading(form, isLoading) {
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = isLoading;
    if (isLoading) {
      submitBtn.dataset.originalText = submitBtn.textContent;
      submitBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2"></span>Отправка...';
    } else {
      submitBtn.textContent = submitBtn.dataset.originalText || "Отправить";
    }
  }
}

export function createAndShowToast(message, type = "info") {
  // Простая реализация Toast уведомлений
  const toast = document.createElement("div");
  toast.className = `alert alert-${type} position-fixed`;
  toast.style.cssText = `
    top: 20px; 
    right: 20px; 
    z-index: 9999; 
    min-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// Готовые наборы валидаторов для частых случаев
export const COMMON_VALIDATORS = {
  // Для регистрации
  registration: {
    email: [validators.required(), validators.email()],
    password: [
      validators.required(),
      validators.minLength(8),
      validators.pattern(
        /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/,
        "Пароль должен содержать цифры, строчные и заглавные буквы"
      ),
    ],
    confirmPassword: [
      validators.required(),
      validators.custom((value, formData) => {
        return value === formData.get("password");
      }, "Пароли не совпадают"),
    ],
  },

  // Для обратной связи
  contact: {
    name: [validators.required()],
    email: [validators.required(), validators.email()],
    message: [validators.required(), validators.minLength(10)],
  },

  // Для недвижимости
  property: {
    title: [
      validators.required(),
      validators.minLength(5),
      validators.maxLength(100),
    ],
    price: [validators.required(), validators.min(0)],
    area: [validators.required(), validators.min(1)],
  },
};
