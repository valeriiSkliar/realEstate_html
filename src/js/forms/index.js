// Импорт для использования внутри файла
import { validators } from "./validators";

// Экспорт основных классов
export { FormBuilder } from "./FormBuilder";
export { FormManager } from "./FormManager";

// Экспорт валидаторов и схем
export { schemas } from "./schemas";
export { validators } from "./validators";

// Экспорт адаптеров и обработчиков
export { formAdapters } from "./adapters";
export { formHandlers } from "./handlers";

// Константы и конфигурация
export const FORM_CONFIG = {
  DEFAULT_ERROR_CLASS: "is-invalid",
  DEFAULT_VALID_CLASS: "is-valid",
  DEFAULT_ERROR_MESSAGE_CLASS: "form-feedback is-invalid",
  DEFAULT_SUBMIT_LOADING_TEXT: "Отправка...",
  DEFAULT_VALIDATION_DEBOUNCE: 300,
  DEFAULT_SCROLL_BEHAVIOR: "smooth",
};

// Утилитарные функции для форм
export function setFormLoading(form, isLoading) {
  const submitBtn = form.querySelector('button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading
      ? FORM_CONFIG.DEFAULT_SUBMIT_LOADING_TEXT
      : submitBtn.dataset.originalText || "Отправить";
  }
}

export function createAndShowToast(message, type = "info") {
  // Простая реализация Toast уведомлений
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

export function createForm(formElement, options = {}) {
  // Базовая функция создания формы
  if (!formElement) return null;

  return {
    element: formElement,
    validate: () => formElement.checkValidity(),
    submit: () => formElement.submit(),
    reset: () => formElement.reset(),
  };
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
