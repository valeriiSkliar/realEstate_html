/**
 * Утилиты для упрощения работы с формами
 */

import FormManager from './FormManager';
import { FormBuilder } from './FormBuilder';
import { validators } from './validators';
import { schemas } from './schemas';
import { formHandlers } from './handlers';
import { formAdapters } from './adapters';

/**
 * Быстрое создание FormManager для существующей формы
 */
export const createForm = (formSelector, schema, options = {}) => {
  const form = typeof formSelector === 'string' 
    ? document.querySelector(formSelector) 
    : formSelector;

  if (!form) {
    throw new Error(`Form not found: ${formSelector}`);
  }

  const formOptions = {
    schema: schema || {},
    ...options
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
    password: () => validators.minLength(8, customMessage || 'Пароль должен содержать минимум 8 символов'),
    number: (min, max) => {
      const rules = [];
      if (min !== undefined) rules.push(validators.min(min));
      if (max !== undefined) rules.push(validators.max(max));
      return rules;
    }
  };

  return validatorMap[type] ? validatorMap[type]() : [];
};

/**
 * Создание схемы валидации из объекта конфигурации
 */
export const createSchema = (config) => {
  const schema = {};

  Object.entries(config).forEach(([fieldName, rules]) => {
    schema[fieldName] = [];

    if (Array.isArray(rules)) {
      schema[fieldName] = rules;
    } else if (typeof rules === 'object') {
      // Обрабатываем объект с правилами
      if (rules.required) {
        schema[fieldName].push(validators.required(rules.requiredMessage));
      }
      
      if (rules.email) {
        schema[fieldName].push(validators.email(rules.emailMessage));
      }
      
      if (rules.minLength) {
        schema[fieldName].push(validators.minLength(rules.minLength, rules.minLengthMessage));
      }
      
      if (rules.maxLength) {
        schema[fieldName].push(validators.maxLength(rules.maxLength, rules.maxLengthMessage));
      }
      
      if (rules.min !== undefined) {
        schema[fieldName].push(validators.min(rules.min, rules.minMessage));
      }
      
      if (rules.max !== undefined) {
        schema[fieldName].push(validators.max(rules.max, rules.maxMessage));
      }
      
      if (rules.pattern) {
        schema[fieldName].push(validators.pattern(rules.pattern, rules.patternMessage));
      }
      
      if (rules.custom) {
        schema[fieldName].push(validators.custom(rules.custom, rules.customMessage));
      }
    }
  });

  return schema;
};

/**
 * Инициализация формы с предустановленными настройками
 */
export const initForm = (formSelector, type, options = {}) => {
  const form = typeof formSelector === 'string' 
    ? document.querySelector(formSelector) 
    : formSelector;

  if (!form) {
    throw new Error(`Form not found: ${formSelector}`);
  }

  // Получаем предустановленную схему и обработчики
  const schema = schemas[type] || {};
  const handler = formHandlers[type] || {};

  // Объединяем с пользовательскими настройками
  const formOptions = {
    schema,
    onSubmit: handler.onSubmit,
    onSuccess: handler.onSuccess,
    onError: handler.onError,
    onServerError: handler.onServerError,
    ...options
  };

  const formManager = new FormManager(form, formOptions);

  // Применяем адаптеры если указаны
  if (options.adapters) {
    options.adapters.forEach(adapterName => {
      const adapter = formAdapters[adapterName];
      if (adapter && adapter.init) {
        adapter.init(form, options.adapterOptions?.[adapterName] || {});
      }
    });
  }

  return formManager;
};

/**
 * Создание формы с помощью FormBuilder
 */
export const buildForm = (container, config) => {
  const builder = new FormBuilder(container);

  // Устанавливаем опции если есть
  if (config.options) {
    builder.setOptions(config.options);
  }

  // Добавляем поля
  config.fields.forEach(field => {
    switch (field.type) {
      case 'email':
        builder.addEmailField(field);
        break;
      case 'password':
        builder.addPasswordField(field);
        break;
      case 'phone':
        builder.addPhoneField(field);
        break;
      case 'number':
        builder.addNumberField(field);
        break;
      case 'textarea':
        builder.addTextAreaField(field);
        break;
      case 'select':
        builder.addSelectField(field);
        break;
      case 'checkbox':
        builder.addCheckboxField(field);
        break;
      case 'radio':
        builder.addRadioField(field);
        break;
      case 'file':
        builder.addFileField(field);
        break;
      case 'hidden':
        builder.addHiddenField(field);
        break;
      default:
        builder.addTextField(field);
    }
  });

  // Добавляем кнопки
  if (config.submitButton) {
    builder.addSubmitButton(config.submitButton.text, config.submitButton.className);
  }

  if (config.resetButton) {
    builder.addResetButton(config.resetButton.text, config.resetButton.className);
  }

  // Строим форму
  builder.build();

  // Инициализируем с обработчиками
  const formManager = builder.init(config.formOptions || {});

  // Применяем адаптеры
  if (config.adapters) {
    config.adapters.forEach(adapterName => {
      const adapter = formAdapters[adapterName];
      if (adapter && adapter.init) {
        adapter.init(builder.getForm(), config.adapterOptions?.[adapterName] || {});
      }
    });
  }

  return { builder, formManager };
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
      if (field.type === 'checkbox') {
        field.checked = Boolean(value);
      } else if (field.type === 'radio') {
        const radioButton = form.querySelector(`[name="${name}"][value="${value}"]`);
        if (radioButton) {
          radioButton.checked = true;
        }
      } else if (field.tagName === 'SELECT' && field.multiple) {
        Array.from(field.options).forEach(option => {
          option.selected = Array.isArray(value) ? value.includes(option.value) : false;
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
  const customElements = form.querySelectorAll('[data-custom-clear]');
  customElements.forEach(element => {
    element.dispatchEvent(new CustomEvent('clear'));
  });
};

/**
 * Блокировка/разблокировка формы
 */
export const toggleFormState = (form, disabled = true) => {
  const elements = form.querySelectorAll('input, select, textarea, button');
  
  elements.forEach(element => {
    element.disabled = disabled;
  });

  if (disabled) {
    form.classList.add('form-disabled');
  } else {
    form.classList.remove('form-disabled');
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
 * Создание дебаунс функции для валидации
 */
export const createValidationDebounce = (validationFn, delay = 300) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => validationFn(...args), delay);
  };
};

/**
 * Конфигурации для быстрого создания популярных типов форм
 */
export const FORM_TEMPLATES = {
  registration: {
    fields: [
      { type: 'text', name: 'firstName', label: 'Имя', required: true },
      { type: 'text', name: 'lastName', label: 'Фамилия', required: true },
      { type: 'email', name: 'email', label: 'Email', required: true },
      { type: 'phone', name: 'phone', label: 'Телефон' },
      { type: 'password', name: 'password', label: 'Пароль', required: true },
      { type: 'password', name: 'confirmPassword', label: 'Подтверждение пароля', required: true },
      { type: 'checkbox', name: 'agreement', label: 'Согласие с условиями', required: true }
    ],
    submitButton: { text: 'Зарегистрироваться' },
    formOptions: {
      onSubmit: formHandlers.registration.onSubmit,
      onSuccess: formHandlers.registration.onSuccess,
      onError: formHandlers.registration.onError
    }
  },

  contact: {
    fields: [
      { type: 'text', name: 'name', label: 'Имя', required: true },
      { type: 'email', name: 'email', label: 'Email', required: true },
      { type: 'text', name: 'subject', label: 'Тема' },
      { type: 'textarea', name: 'message', label: 'Сообщение', required: true, rows: 5 }
    ],
    submitButton: { text: 'Отправить сообщение' },
    formOptions: {
      onSubmit: formHandlers.contact.onSubmit,
      onSuccess: formHandlers.contact.onSuccess
    }
  },

  search: {
    fields: [
      { type: 'text', name: 'query', label: 'Поиск', placeholder: 'Что ищете?' },
      { 
        type: 'select', 
        name: 'category', 
        label: 'Категория',
        options: [
          { value: '', label: 'Все категории' },
          { value: 'apartment', label: 'Квартиры' },
          { value: 'house', label: 'Дома' },
          { value: 'commercial', label: 'Коммерческая недвижимость' }
        ]
      },
      { type: 'number', name: 'priceMin', label: 'Цена от' },
      { type: 'number', name: 'priceMax', label: 'Цена до' }
    ],
    submitButton: { text: 'Найти' },
    formOptions: {
      onSubmit: formHandlers.search.onSubmit
    }
  }
};

/**
 * Быстрое создание формы по шаблону
 */
export const createFormFromTemplate = (container, templateName, customConfig = {}) => {
  const template = FORM_TEMPLATES[templateName];
  
  if (!template) {
    throw new Error(`Template "${templateName}" not found`);
  }

  // Объединяем шаблон с пользовательской конфигурацией
  const config = {
    ...template,
    ...customConfig,
    fields: [...template.fields, ...(customConfig.fields || [])],
    formOptions: {
      ...template.formOptions,
      ...customConfig.formOptions
    }
  };

  return buildForm(container, config);
};