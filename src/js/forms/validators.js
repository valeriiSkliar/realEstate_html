const validators = {
  required: (message = "Это поле обязательно") => ({
    validate: (value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "string") return value.trim().length > 0;
      return value !== null && value !== undefined;
    },
    message,
  }),

  minLength: (min, message) => ({
    validate: (value) => value && value.length >= min,
    message: message || `Минимальная длина ${min} символов`,
  }),

  maxLength: (max, message) => ({
    validate: (value) => !value || value.length <= max,
    message: message || `Максимальная длина ${max} символов`,
  }),

  min: (min, message) => ({
    validate: (value) => value !== "" && Number(value) >= min,
    message: message || `Минимальное значение ${min}`,
  }),

  max: (max, message) => ({
    validate: (value) => value !== "" && Number(value) <= max,
    message: message || `Максимальное значение ${max}`,
  }),

  email: (message = "Неверный формат email") => ({
    validate: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  phone: (message = "Неверный формат телефона") => ({
    validate: (value) => !value || /^[\d\s\-\+\(\)]+$/.test(value),
    message,
  }),

  pattern: (pattern, message = "Неверный формат") => ({
    validate: (value) => !value || pattern.test(value),
    message,
  }),

  custom: (validateFn, message = "Неверное значение") => ({
    validate: validateFn,
    message,
  }),

  // Составные валидаторы
  between: (min, max, message) => ({
    validate: (value) => {
      const num = Number(value);
      return value === "" || (num >= min && num <= max);
    },
    message: message || `Значение должно быть от ${min} до ${max}`,
  }),

  oneOf: (values, message) => ({
    validate: (value) => values.includes(value),
    message: message || `Значение должно быть одним из: ${values.join(", ")}`,
  }),

  // Асинхронные валидаторы
  asyncCustom: (validateFn, message = "Проверка не пройдена") => ({
    validate: validateFn,
    message,
    async: true,
  }),
};

export { validators };
