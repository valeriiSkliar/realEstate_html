/**
 * Адаптеры для интеграции форм с различными библиотеками и фреймворками
 */

/**
 * Адаптер для Bootstrap
 */
export const bootstrapAdapter = {
  /**
   * Применяет стили Bootstrap к форме
   */
  applyStyles(formElement) {
    // Добавляем Bootstrap классы к элементам формы
    const inputs = formElement.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      if (!input.classList.contains("form-check-input")) {
        input.classList.add("form-control");
      }
    });

    // Стилизуем кнопки
    const buttons = formElement.querySelectorAll(
      'button[type="submit"], button[type="reset"]'
    );
    buttons.forEach((button) => {
      if (!button.classList.contains("btn")) {
        button.classList.add("btn", "btn-primary");
      }
    });

    // Добавляем классы к контейнерам полей
    const fieldContainers = formElement.querySelectorAll(".form-field");
    fieldContainers.forEach((container) => {
      container.classList.add("mb-3");
    });
  },

  /**
   * Настройка валидации в стиле Bootstrap
   */
  setupValidation(formManager) {
    return {
      ...formManager.options,
      errorClass: "is-invalid",
      validClass: "is-valid",
      errorMessageClass: "invalid-feedback",
      showErrors: true,
    };
  },
};

/**
 * Адаптер для Select2
 */
export const select2Adapter = {
  /**
   * Инициализирует Select2 для всех select элементов в форме
   */
  init(formElement, options = {}) {
    if (typeof $ === "undefined" || !$.fn.select2) {
      console.warn("Select2 is not available");
      return;
    }

    const selects = formElement.querySelectorAll("select");
    selects.forEach((select) => {
      const $select = $(select);

      // Безопасно уничтожаем существующий экземпляр Select2 если он есть
      try {
        if ($select.hasClass("select2-hidden-accessible")) {
          $select.select2("destroy");
        }
      } catch (error) {
        console.warn("Error destroying existing Select2:", error);
        // Если не удалось уничтожить, попробуем убрать классы вручную
        $select.removeClass("select2-hidden-accessible");
        const container = $select.next(".select2-container");
        if (container.length) {
          container.remove();
        }
      }

      const selectOptions = {
        theme: "bootstrap-5",
        width: "100%",
        ...options,
      };

      // Добавляем специфичные опции для мультиселекта
      if (select.multiple) {
        selectOptions.closeOnSelect = false;
      }

      try {
        $select.select2(selectOptions);
      } catch (error) {
        console.warn("Error initializing Select2 for", select, error);
      }
    });
  },

  /**
   * Обновляет значения Select2 элементов
   */
  updateValues(formElement, data) {
    if (typeof $ === "undefined" || !$.fn.select2) {
      return;
    }

    Object.entries(data).forEach(([name, value]) => {
      const select = formElement.querySelector(`select[name="${name}"]`);
      if (select) {
        $(select).val(value).trigger("change");
      }
    });
  },

  /**
   * Уничтожает все Select2 экземпляры в форме
   */
  destroy(formElement) {
    if (typeof $ === "undefined" || !$.fn.select2) {
      return;
    }

    const selects = formElement.querySelectorAll("select");
    selects.forEach((select) => {
      if ($(select).hasClass("select2-hidden-accessible")) {
        $(select).select2("destroy");
      }
    });
  },
};

/**
 * Адаптер для работы с датами (Date Picker)
 */
export const datePickerAdapter = {
  /**
   * Инициализирует date picker для всех полей с типом date
   */
  init(formElement, options = {}) {
    const dateInputs = formElement.querySelectorAll('input[type="date"]');

    dateInputs.forEach((input) => {
      // Если доступен flatpickr
      if (typeof flatpickr !== "undefined") {
        flatpickr(input, {
          dateFormat: "Y-m-d",
          locale: "ru",
          ...options,
        });
      }
    });
  },
};

/**
 * Адаптер для загрузки файлов
 */
export const fileUploadAdapter = {
  /**
   * Инициализирует продвинутую загрузку файлов
   */
  init(formElement, options = {}) {
    const fileInputs = formElement.querySelectorAll('input[type="file"]');

    fileInputs.forEach((input) => {
      this.enhanceFileInput(input, options);
    });
  },

  /**
   * Улучшает стандартный input[type="file"]
   */
  enhanceFileInput(input, options = {}) {
    const wrapper = document.createElement("div");
    wrapper.className = "file-upload-wrapper";

    input.parentNode.insertBefore(wrapper, input);
    wrapper.appendChild(input);

    // Создаем область для drag & drop
    const dropArea = document.createElement("div");
    dropArea.className = "file-drop-area";
    dropArea.innerHTML = `
        <div class="file-drop-message">
          <i class="bi bi-cloud-upload"></i>
          <p>Перетащите файлы сюда или <span class="file-browse-link">выберите файлы</span></p>
        </div>
        <div class="file-list"></div>
      `;

    wrapper.appendChild(dropArea);

    // Скрываем оригинальный input
    input.style.display = "none";

    // Обработчики событий
    const browseLink = dropArea.querySelector(".file-browse-link");
    browseLink.addEventListener("click", () => input.click());

    // Drag & Drop
    dropArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropArea.classList.add("dragover");
    });

    dropArea.addEventListener("dragleave", () => {
      dropArea.classList.remove("dragover");
    });

    dropArea.addEventListener("drop", (e) => {
      e.preventDefault();
      dropArea.classList.remove("dragover");

      const files = e.dataTransfer.files;
      this.handleFiles(files, input, dropArea);
    });

    // Обычный выбор файлов
    input.addEventListener("change", (e) => {
      this.handleFiles(e.target.files, input, dropArea);
    });
  },

  /**
   * Обрабатывает выбранные файлы
   */
  handleFiles(files, input, dropArea) {
    const fileList = dropArea.querySelector(".file-list");
    fileList.innerHTML = "";

    Array.from(files).forEach((file, index) => {
      const fileItem = document.createElement("div");
      fileItem.className = "file-item";
      fileItem.innerHTML = `
          <div class="file-info">
            <span class="file-name">${file.name}</span>
            <span class="file-size">${this.formatFileSize(file.size)}</span>
          </div>
          <button type="button" class="file-remove" data-index="${index}">
            <i class="bi bi-x"></i>
          </button>
        `;

      // Обработчик удаления файла
      const removeBtn = fileItem.querySelector(".file-remove");
      removeBtn.addEventListener("click", () => {
        fileItem.remove();
        // TODO: Удалить файл из input (требует дополнительной логики)
      });

      fileList.appendChild(fileItem);
    });
  },

  /**
   * Форматирует размер файла
   */
  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },
};

/**
 * Адаптер для маскирования ввода
 */
export const inputMaskAdapter = {
  /**
   * Применяет маски к полям ввода
   */
  init(formElement, masks = {}) {
    // Стандартные маски
    const defaultMasks = {
      phone: "+7 (999) 999-99-99",
      date: "99.99.9999",
      time: "99:99",
      creditCard: "9999 9999 9999 9999",
    };

    Object.entries({ ...defaultMasks, ...masks }).forEach(([type, mask]) => {
      const inputs = formElement.querySelectorAll(`input[data-mask="${type}"]`);
      inputs.forEach((input) => {
        this.applyMask(input, mask);
      });
    });
  },

  /**
   * Применяет маску к конкретному полю
   */
  applyMask(input, mask) {
    // Простая реализация маски (для production лучше использовать библиотеку типа IMask)
    input.addEventListener("input", (e) => {
      let value = e.target.value.replace(/\D/g, "");
      let maskedValue = "";
      let valueIndex = 0;

      for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
        if (mask[i] === "9") {
          maskedValue += value[valueIndex];
          valueIndex++;
        } else {
          maskedValue += mask[i];
        }
      }

      e.target.value = maskedValue;
    });
  },
};

/**
 * Адаптер для автосохранения формы
 */
export const autosaveAdapter = {
  /**
   * Инициализирует автосохранение формы
   */
  init(formElement, options = {}) {
    const settings = {
      interval: 30000, // 30 секунд
      storageKey: `autosave_${formElement.id || "form"}`,
      excludeFields: ["password", "confirmPassword"],
      ...options,
    };

    // Загружаем сохраненные данные
    this.loadSavedData(formElement, settings);

    // Настраиваем автосохранение
    this.setupAutosave(formElement, settings);
  },

  /**
   * Загружает сохраненные данные
   */
  loadSavedData(formElement, settings) {
    try {
      const savedData = localStorage.getItem(settings.storageKey);
      if (savedData) {
        const data = JSON.parse(savedData);

        Object.entries(data).forEach(([name, value]) => {
          if (settings.excludeFields.includes(name)) return;

          const field = formElement.querySelector(`[name="${name}"]`);
          if (field) {
            if (field.type === "checkbox") {
              field.checked = value;
            } else {
              field.value = value;
            }
          }
        });
      }
    } catch (error) {
      console.warn("Error loading autosaved data:", error);
    }
  },

  /**
   * Настраивает автосохранение
   */
  setupAutosave(formElement, settings) {
    const saveData = () => {
      const formData = new FormData(formElement);
      const data = {};

      for (const [name, value] of formData.entries()) {
        if (!settings.excludeFields.includes(name)) {
          data[name] = value;
        }
      }

      try {
        localStorage.setItem(settings.storageKey, JSON.stringify(data));
      } catch (error) {
        console.warn("Error saving form data:", error);
      }
    };

    // Сохраняем при изменении полей
    formElement.addEventListener("input", saveData);
    formElement.addEventListener("change", saveData);

    // Периодическое сохранение
    const interval = setInterval(saveData, settings.interval);

    // Очищаем данные при успешной отправке
    formElement.addEventListener("submit", () => {
      setTimeout(() => {
        localStorage.removeItem(settings.storageKey);
        clearInterval(interval);
      }, 100);
    });
  },
};

/**
 * Объект со всеми адаптерами
 */
export const formAdapters = {
  bootstrap: bootstrapAdapter,
  select2: select2Adapter,
  datePicker: datePickerAdapter,
  fileUpload: fileUploadAdapter,
  inputMask: inputMaskAdapter,
  autosave: autosaveAdapter,
};
