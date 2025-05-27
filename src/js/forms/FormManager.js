class FormManager {
  constructor(formElement, options = {}) {
    this.form =
      typeof formElement === "string"
        ? document.querySelector(formElement)
        : formElement;

    if (!this.form) {
      throw new Error("Form element not found");
    }

    this.options = {
      schema: {},
      onSubmit: async (data) => console.log("Form submitted:", data),
      onSuccess: null,
      onError: (errors) => console.error("Validation errors:", errors),
      onServerError: null,
      validateOnBlur: true,
      validateOnChange: false,
      showErrors: true,
      showGeneralError: false,
      generalErrorTimeout: 5000,
      errorClass: "is-invalid",
      validClass: "is-valid",
      errorMessageClass: "form-feedback is-invalid",
      submitButton: null,
      resetOnSuccess: false,
      scrollToError: true,
      ...options,
    };

    this.errors = {};
    this.touched = new Set();
    this.isSubmitting = false;

    this.init();
  }

  init() {
    // Предотвращаем стандартную отправку формы
    this.form.addEventListener("submit", this.handleSubmit.bind(this));

    // Добавляем обработчики для валидации
    if (this.options.validateOnBlur) {
      this.form.addEventListener("blur", this.handleBlur.bind(this), true);
    }

    if (this.options.validateOnChange) {
      this.form.addEventListener("input", this.handleChange.bind(this), true);
    }

    // Находим кнопку отправки
    this.submitButton = this.options.submitButton
      ? document.querySelector(this.options.submitButton)
      : this.form.querySelector('[type="submit"]');
  }

  async handleSubmit(event) {
    event.preventDefault();

    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.setSubmitState(true);

    const formData = new FormData(this.form);

    // Валидируем все поля
    const isValid = await this.validateForm(formData);

    if (isValid) {
      try {
        const result = await this.options.onSubmit(
          this.getFormValues(formData),
          formData
        );

        // Проверяем, есть ли ошибки валидации с сервера
        if (result && result.errors) {
          this.handleServerErrors(result.errors);

          if (this.options.scrollToError) {
            this.scrollToFirstError();
          }
        } else {
          // Успешная отправка
          if (this.options.onSuccess) {
            this.options.onSuccess(result);
          }

          if (this.options.resetOnSuccess) {
            this.reset();
          }
        }
      } catch (error) {
        // Обработка ошибок сети или других критических ошибок
        if (error.validationErrors) {
          // Если ошибка содержит данные валидации
          this.handleServerErrors(error.validationErrors);
        } else {
          // Общая ошибка
          console.error("Form submission error:", error);

          if (this.options.onError) {
            this.options.onError({
              submit: error.message || "Произошла ошибка при отправке формы",
            });
          }

          // Показываем общую ошибку, если настроено
          if (this.options.showGeneralError) {
            this.showGeneralError(
              error.message || "Произошла ошибка при отправке формы"
            );
          }
        }
      }
    } else {
      if (this.options.onError) {
        this.options.onError(this.errors);
      }

      if (this.options.scrollToError) {
        this.scrollToFirstError();
      }
    }

    this.isSubmitting = false;
    this.setSubmitState(false);
  }

  handleServerErrors(serverErrors) {
    // Очищаем предыдущие ошибки
    this.errors = {};

    // Обрабатываем различные форматы ошибок с сервера
    if (Array.isArray(serverErrors)) {
      // Формат: [{field: 'email', message: 'Email уже зарегистрирован'}]
      serverErrors.forEach((error) => {
        if (error.field && error.message) {
          this.errors[error.field] = error.message;
          this.touched.add(error.field);
        }
      });
    } else if (typeof serverErrors === "object") {
      // Формат: {email: 'Email уже зарегистрирован', phone: 'Неверный формат'}
      // или: {email: ['Ошибка 1', 'Ошибка 2']}
      Object.entries(serverErrors).forEach(([field, message]) => {
        if (Array.isArray(message)) {
          this.errors[field] = message.join(". ");
        } else {
          this.errors[field] = message;
        }
        this.touched.add(field);
      });
    }

    // Отображаем ошибки
    if (this.options.showErrors) {
      this.displayAllErrors();
    }

    // Вызываем callback для ошибок
    if (this.options.onServerError) {
      this.options.onServerError(this.errors);
    }
  }

  showGeneralError(message) {
    let errorContainer = this.form.querySelector(".form-general-error");

    if (!errorContainer) {
      errorContainer = document.createElement("div");
      errorContainer.className = "form-general-error alert alert-danger";
      this.form.insertBefore(errorContainer, this.form.firstChild);
    }

    errorContainer.textContent = message;
    errorContainer.style.display = "block";

    // Автоматически скрываем через некоторое время
    if (this.options.generalErrorTimeout) {
      setTimeout(() => {
        errorContainer.style.display = "none";
      }, this.options.generalErrorTimeout);
    }
  }

  hideGeneralError() {
    const errorContainer = this.form.querySelector(".form-general-error");
    if (errorContainer) {
      errorContainer.style.display = "none";
    }
  }

  async handleBlur(event) {
    const field = event.target;
    if (!field.name || !this.options.schema[field.name]) return;

    this.touched.add(field.name);
    await this.validateField(field.name, field.value);
  }

  async handleChange(event) {
    const field = event.target;
    if (!field.name || !this.options.schema[field.name]) return;

    if (this.touched.has(field.name)) {
      await this.validateField(field.name, field.value);
    }
  }

  async validateForm(formData) {
    this.errors = {};
    const validationPromises = [];

    for (const [fieldName, rules] of Object.entries(this.options.schema)) {
      const value = this.getFieldValue(fieldName, formData);
      validationPromises.push(
        this.validateFieldRules(fieldName, value, rules, formData)
      );
    }

    await Promise.all(validationPromises);

    if (this.options.showErrors) {
      this.displayAllErrors();
    }

    return Object.keys(this.errors).length === 0;
  }

  async validateField(fieldName, value) {
    const rules = this.options.schema[fieldName];
    if (!rules) return true;

    delete this.errors[fieldName];

    const formData = new FormData(this.form);
    await this.validateFieldRules(fieldName, value, rules, formData);

    if (this.options.showErrors) {
      this.displayFieldError(fieldName);
    }

    return !this.errors[fieldName];
  }

  async validateFieldRules(fieldName, value, rules, formData) {
    for (const rule of rules) {
      try {
        const isValid = rule.async
          ? await rule.validate(value, formData)
          : rule.validate(value, formData);

        if (!isValid) {
          this.errors[fieldName] = rule.message;
          break;
        }
      } catch (error) {
        this.errors[fieldName] = error.message || rule.message;
        break;
      }
    }
  }

  getFieldValue(fieldName, formData) {
    const field = this.form.elements[fieldName];

    if (!field) return formData.get(fieldName);

    // Обработка различных типов полей
    if (field.type === "checkbox") {
      if (field.name.endsWith("[]")) {
        // Multiple checkboxes
        return formData.getAll(fieldName);
      }
      return field.checked ? field.value : null;
    }

    if (field.type === "radio") {
      const checked = this.form.querySelector(
        `input[name="${fieldName}"]:checked`
      );
      return checked ? checked.value : null;
    }

    if (field.multiple) {
      return formData.getAll(fieldName);
    }

    return formData.get(fieldName);
  }

  getFormValues(formData) {
    const values = {};

    for (const [key, value] of formData.entries()) {
      if (key.endsWith("[]")) {
        const realKey = key.slice(0, -2);
        if (!values[realKey]) values[realKey] = [];
        values[realKey].push(value);
      } else if (!values[key]) {
        values[key] = value;
      }
    }

    return values;
  }

  displayAllErrors() {
    // Сначала очищаем все ошибки
    this.clearAllErrors();

    // Отображаем текущие ошибки
    for (const fieldName in this.errors) {
      this.displayFieldError(fieldName);
    }
  }

  displayFieldError(fieldName) {
    const field = this.form.elements[fieldName];
    if (!field) return;

    const fields = field.length ? Array.from(field) : [field];

    fields.forEach((f) => {
      // Удаляем предыдущие классы
      f.classList.remove(this.options.errorClass, this.options.validClass);

      if (this.errors[fieldName]) {
        f.classList.add(this.options.errorClass);
        this.showErrorMessage(f, this.errors[fieldName]);
      } else if (this.touched.has(fieldName)) {
        f.classList.add(this.options.validClass);
        this.hideErrorMessage(f);
      }
    });
  }

  showErrorMessage(field, message) {
    let errorElement = this.getErrorElement(field);

    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.className = this.options.errorMessageClass;

      const parent = field.closest(".form-field") || field.parentElement;
      parent.appendChild(errorElement);
    }

    errorElement.textContent = message;
    errorElement.style.display = "block";
  }

  hideErrorMessage(field) {
    const errorElement = this.getErrorElement(field);
    if (errorElement) {
      errorElement.style.display = "none";
    }
  }

  getErrorElement(field) {
    const parent = field.closest(".form-field") || field.parentElement;
    return parent.querySelector(
      `.${this.options.errorMessageClass.split(" ")[0]}`
    );
  }

  clearAllErrors() {
    const errorElements = this.form.querySelectorAll(
      `.${this.options.errorMessageClass.split(" ")[0]}`
    );
    errorElements.forEach((el) => (el.style.display = "none"));

    const fields = this.form.querySelectorAll(`.${this.options.errorClass}`);
    fields.forEach((field) => {
      field.classList.remove(this.options.errorClass);
    });
  }

  scrollToFirstError() {
    const firstError = this.form.querySelector(`.${this.options.errorClass}`);
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      firstError.focus();
    }
  }

  setSubmitState(isSubmitting) {
    if (this.submitButton) {
      this.submitButton.disabled = isSubmitting;

      if (isSubmitting) {
        this.submitButton.dataset.originalText = this.submitButton.textContent;
        this.submitButton.innerHTML =
          '<span class="spinner-border spinner-border-sm me-2"></span>Отправка...';
      } else {
        this.submitButton.textContent =
          this.submitButton.dataset.originalText || "Отправить";
      }
    }
  }

  reset() {
    this.form.reset();
    this.errors = {};
    this.touched.clear();
    this.clearAllErrors();
    this.hideGeneralError();
  }

  setFieldError(fieldName, message) {
    this.errors[fieldName] = message;
    this.displayFieldError(fieldName);
  }

  clearFieldError(fieldName) {
    delete this.errors[fieldName];
    this.displayFieldError(fieldName);
  }

  getErrors() {
    return { ...this.errors };
  }

  isValid() {
    return Object.keys(this.errors).length === 0;
  }
}
