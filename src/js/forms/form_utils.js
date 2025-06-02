/**
 * Утилиты для упрощения работы с формами
 */

import { FormManager } from "./FormManager.js";
import { validators } from "./validators.js";

/**
 * Быстрое создание FormManager для существующей формы
 */
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

/**
 * Создание валидатора с предустановленными правилами
 */
export const createValidator = (type, customMessage) => {
  const validatorMap = {
    required: () => validators.required(customMessage),
    email: () => validators.email(customMessage),
    phone: () => validators.phone(customMessage),
    password: () =>
      validators.minLength(
        8,
        customMessage || "Пароль должен содержать минимум 8 символов"
      ),
    number: (min, max) => {
      const rules = [];
      if (min !== undefined) rules.push(validators.min(min));
      if (max !== undefined) rules.push(validators.max(max));
      return rules;
    },
  };

  return validatorMap[type] ? validatorMap[type]() : [];
};

/**
 * Сериализация формы в объект
 */
export const serializeForm = (form) => {
  const formData = new FormData(form);
  const data = {};

  for (const [key, value] of formData.entries()) {
    // Обработка множественных значений (checkbox, select multiple)
    if (data[key]) {
      if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  }

  return data;
};

/**
 * Заполнение формы данными
 */
export const populateForm = (form, data) => {
  Object.entries(data).forEach(([name, value]) => {
    const field = form.querySelector(`[name="${name}"]`);

    if (field) {
      if (field.type === "checkbox") {
        field.checked = Boolean(value);
      } else if (field.type === "radio") {
        const radioButton = form.querySelector(
          `[name="${name}"][value="${value}"]`
        );
        if (radioButton) {
          radioButton.checked = true;
        }
      } else if (field.tagName === "SELECT" && field.multiple) {
        Array.from(field.options).forEach((option) => {
          option.selected = Array.isArray(value)
            ? value.includes(option.value)
            : false;
        });
      } else {
        field.value = value;
      }
    }
  });
};

/**
 * Очистка формы
 */
export const clearForm = (form) => {
  form.reset();

  // Дополнительная очистка для кастомных элементов
  const customElements = form.querySelectorAll("[data-custom-clear]");
  customElements.forEach((element) => {
    element.dispatchEvent(new CustomEvent("clear"));
  });
};

/**
 * Блокировка/разблокировка формы
 */
export const toggleFormState = (form, disabled = true) => {
  const elements = form.querySelectorAll("input, select, textarea, button");

  elements.forEach((element) => {
    element.disabled = disabled;
  });

  if (disabled) {
    form.classList.add("form-disabled");
  } else {
    form.classList.remove("form-disabled");
  }
};

/**
 * Добавление индикатора загрузки к форме
 */
export const setFormLoading = (form, loading = true) => {
  const submitButton = form.querySelector('[type="submit"]');

  if (loading) {
    // Блокируем форму
    toggleFormState(form, true);

    // Добавляем спиннер к кнопке отправки
    if (submitButton) {
      submitButton.dataset.originalText = submitButton.textContent;
      submitButton.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2" role="status"></span>
        Отправка...
      `;
    }
  } else {
    // Разблокируем форму
    toggleFormState(form, false);

    // Восстанавливаем текст кнопки
    if (submitButton && submitButton.dataset.originalText) {
      submitButton.textContent = submitButton.dataset.originalText;
      delete submitButton.dataset.originalText;
    }
  }
};

/**
 * Валидация отдельного поля без FormManager
 */
export const validateField = async (value, rules) => {
  for (const rule of rules) {
    try {
      const isValid = rule.async
        ? await rule.validate(value)
        : rule.validate(value);

      if (!isValid) {
        return { isValid: false, message: rule.message };
      }
    } catch (error) {
      return { isValid: false, message: error.message || rule.message };
    }
  }

  return { isValid: true, message: null };
};
