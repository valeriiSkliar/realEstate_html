import { FormManager } from "./FormManager";
import { validators } from "./validators";

/**
 * FormBuilder - класс для программного создания форм
 * Позволяет создавать формы через JavaScript API
 */
export class FormBuilder {
  constructor(container) {
    this.container =
      typeof container === "string"
        ? document.querySelector(container)
        : container;

    if (!this.container) {
      throw new Error("Container element not found");
    }

    this.fields = [];
    this.schema = {};
    this.options = {
      formClass: "form",
      fieldContainerClass: "form-field mb-3",
      labelClass: "form-label",
      inputClass: "form-control",
      errorClass: "form-feedback is-invalid",
      submitButtonClass: "btn btn-primary",
      resetButtonClass: "btn btn-secondary",
    };

    this.formElement = null;
    this.formManager = null;
  }

  /**
   * Настройка опций билдера
   */
  setOptions(options) {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Добавление текстового поля
   */
  addTextField(config) {
    return this.addField({
      type: "text",
      ...config,
    });
  }

  /**
   * Добавление поля email
   */
  addEmailField(config) {
    return this.addField({
      type: "email",
      validators: [validators.required(), validators.email()],
      ...config,
    });
  }

  /**
   * Добавление поля пароля
   */
  addPasswordField(config) {
    return this.addField({
      type: "password",
      validators: [
        validators.required(),
        validators.minLength(8, "Пароль должен содержать минимум 8 символов"),
      ],
      ...config,
    });
  }

  /**
   * Добавление поля телефона
   */
  addPhoneField(config) {
    return this.addField({
      type: "tel",
      validators: [validators.phone()],
      ...config,
    });
  }

  /**
   * Добавление числового поля
   */
  addNumberField(config) {
    return this.addField({
      type: "number",
      ...config,
    });
  }

  /**
   * Добавление textarea
   */
  addTextAreaField(config) {
    return this.addField({
      type: "textarea",
      ...config,
    });
  }

  /**
   * Добавление select
   */
  addSelectField(config) {
    if (!config.options) {
      throw new Error("Select field requires options array");
    }

    return this.addField({
      type: "select",
      ...config,
    });
  }

  /**
   * Добавление checkbox
   */
  addCheckboxField(config) {
    return this.addField({
      type: "checkbox",
      ...config,
    });
  }

  /**
   * Добавление radio группы
   */
  addRadioField(config) {
    if (!config.options) {
      throw new Error("Radio field requires options array");
    }

    return this.addField({
      type: "radio",
      ...config,
    });
  }

  /**
   * Добавление поля файла
   */
  addFileField(config) {
    return this.addField({
      type: "file",
      ...config,
    });
  }

  /**
   * Добавление скрытого поля
   */
  addHiddenField(config) {
    return this.addField({
      type: "hidden",
      ...config,
    });
  }

  /**
   * Добавление произвольного поля
   */
  addField(config) {
    if (!config.name) {
      throw new Error("Field name is required");
    }

    // Проверяем уникальность имени поля
    if (this.fields.find((field) => field.name === config.name)) {
      throw new Error(`Field with name "${config.name}" already exists`);
    }

    const field = {
      type: "text",
      name: config.name,
      label: config.label || config.name,
      placeholder: config.placeholder || "",
      required: config.required || false,
      validators: config.validators || [],
      value: config.value || "",
      attributes: config.attributes || {},
      options: config.options || null, // для select и radio
      ...config,
    };

    this.fields.push(field);

    // Добавляем валидаторы в схему
    if (field.validators.length > 0) {
      this.schema[field.name] = field.validators;
    }

    return this;
  }

  /**
   * Добавление кнопки отправки
   */
  addSubmitButton(text = "Отправить", className = null) {
    this.submitButton = {
      text,
      className: className || this.options.submitButtonClass,
    };
    return this;
  }

  /**
   * Добавление кнопки сброса
   */
  addResetButton(text = "Сбросить", className = null) {
    this.resetButton = {
      text,
      className: className || this.options.resetButtonClass,
    };
    return this;
  }

  /**
   * Создание HTML элемента поля
   */
  createFieldElement(field) {
    const container = document.createElement("div");
    container.className = this.options.fieldContainerClass;

    // Создаем label (кроме hidden и checkbox)
    if (field.type !== "hidden" && field.type !== "checkbox") {
      const label = document.createElement("label");
      label.className = this.options.labelClass;
      label.setAttribute("for", field.name);
      label.textContent = field.label;

      if (field.required) {
        label.innerHTML += ' <span class="text-danger">*</span>';
      }

      container.appendChild(label);
    }

    let input;

    switch (field.type) {
      case "textarea":
        input = document.createElement("textarea");
        input.className = this.options.inputClass;
        if (field.rows) input.rows = field.rows;
        break;

      case "select":
        input = document.createElement("select");
        input.className = this.options.inputClass;

        // Добавляем опции
        if (field.placeholder) {
          const placeholderOption = document.createElement("option");
          placeholderOption.value = "";
          placeholderOption.textContent = field.placeholder;
          placeholderOption.disabled = true;
          placeholderOption.selected = true;
          input.appendChild(placeholderOption);
        }

        field.options.forEach((option) => {
          const optionElement = document.createElement("option");
          optionElement.value = option.value;
          optionElement.textContent = option.label;
          if (option.value === field.value) {
            optionElement.selected = true;
          }
          input.appendChild(optionElement);
        });
        break;

      case "radio":
        // Для radio создаем несколько input'ов
        field.options.forEach((option, index) => {
          const radioContainer = document.createElement("div");
          radioContainer.className = "form-check";

          const radioInput = document.createElement("input");
          radioInput.type = "radio";
          radioInput.className = "form-check-input";
          radioInput.name = field.name;
          radioInput.id = `${field.name}_${index}`;
          radioInput.value = option.value;

          if (option.value === field.value) {
            radioInput.checked = true;
          }

          const radioLabel = document.createElement("label");
          radioLabel.className = "form-check-label";
          radioLabel.setAttribute("for", `${field.name}_${index}`);
          radioLabel.textContent = option.label;

          radioContainer.appendChild(radioInput);
          radioContainer.appendChild(radioLabel);
          container.appendChild(radioContainer);
        });
        return container;

      case "checkbox":
        const checkContainer = document.createElement("div");
        checkContainer.className = "form-check";

        input = document.createElement("input");
        input.type = "checkbox";
        input.className = "form-check-input";
        if (field.value) input.checked = true;

        const checkLabel = document.createElement("label");
        checkLabel.className = "form-check-label";
        checkLabel.setAttribute("for", field.name);
        checkLabel.textContent = field.label;

        checkContainer.appendChild(input);
        checkContainer.appendChild(checkLabel);
        container.appendChild(checkContainer);
        break;

      default:
        input = document.createElement("input");
        input.type = field.type;
        input.className =
          field.type === "hidden" ? "" : this.options.inputClass;
        break;
    }

    if (input && field.type !== "radio") {
      // Устанавливаем основные атрибуты
      input.name = field.name;
      input.id = field.name;

      if (field.placeholder && field.type !== "checkbox") {
        input.placeholder = field.placeholder;
      }

      if (field.value && field.type !== "checkbox") {
        input.value = field.value;
      }

      if (field.required) {
        input.required = true;
      }

      // Добавляем дополнительные атрибуты
      Object.entries(field.attributes).forEach(([key, value]) => {
        input.setAttribute(key, value);
      });

      container.appendChild(input);
    }

    return container;
  }

  /**
   * Сборка и отрисовка формы
   */
  build() {
    // Создаем элемент формы
    this.formElement = document.createElement("form");
    this.formElement.className = this.options.formClass;
    this.formElement.setAttribute("novalidate", ""); // Отключаем браузерную валидацию

    // Добавляем поля
    this.fields.forEach((field) => {
      const fieldElement = this.createFieldElement(field);
      this.formElement.appendChild(fieldElement);
    });

    // Добавляем кнопки
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "form-buttons mt-3";

    if (this.submitButton) {
      const submitBtn = document.createElement("button");
      submitBtn.type = "submit";
      submitBtn.className = this.submitButton.className;
      submitBtn.textContent = this.submitButton.text;
      buttonsContainer.appendChild(submitBtn);
    }

    if (this.resetButton) {
      const resetBtn = document.createElement("button");
      resetBtn.type = "reset";
      resetBtn.className = this.resetButton.className;
      resetBtn.textContent = this.resetButton.text;
      buttonsContainer.appendChild(resetBtn);
    }

    if (buttonsContainer.children.length > 0) {
      this.formElement.appendChild(buttonsContainer);
    }

    // Очищаем контейнер и добавляем форму
    this.container.innerHTML = "";
    this.container.appendChild(this.formElement);

    return this;
  }

  /**
   * Инициализация FormManager для созданной формы
   */
  init(options = {}) {
    if (!this.formElement) {
      throw new Error("Form must be built before initialization");
    }

    const formOptions = {
      schema: this.schema,
      ...options,
    };

    this.formManager = new FormManager(this.formElement, formOptions);
    return this.formManager;
  }

  /**
   * Получение созданной формы
   */
  getForm() {
    return this.formElement;
  }

  /**
   * Получение менеджера формы
   */
  getFormManager() {
    return this.formManager;
  }

  /**
   * Утилитарный метод для создания формы одним вызовом
   */
  static create(container) {
    return new FormBuilder(container);
  }
}

export default FormBuilder;
