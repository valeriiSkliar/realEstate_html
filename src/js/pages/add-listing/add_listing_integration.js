import { createForm, validators } from "../../forms/index.js";
import { fetcher } from "../../utils/fetcher.js";
import {
  processPriceBeforeSubmit,
  setupPriceFormatting,
} from "../../utils/priceFormatter.js";
import { createAndShowToast } from "../../utils/uiHelpers.js";
/**
 * Упрощенная схема валидации
 */
const addListingSchema = {
  propertyType: [validators.required("Выберите тип объекта")],
  tradeType: [validators.required("Выберите тип сделки")],
  locality: [validators.required("Выберите населенный пункт")],
  // address теперь не обязательно для всех типов
  // complex не обязательно для всех типов
  floor: [
    {
      validate: (value, formData) => {
        const propertyType = formData.get("propertyType");
        if (propertyType !== "apartment") return true;
        return validators.required("Выберите этаж").validate(value);
      },
    },
  ],
  rooms: [
    // Условная валидация - обязательно для квартир, не обязательно для домов
    {
      validate: (value, formData) => {
        const propertyType = formData.get("propertyType");
        if (propertyType === "apartment") {
          return validators
            .required("Выберите количество комнат")
            .validate(value);
        }
        if (propertyType === "house") return true; // Для домов не обязательно
        return true; // Для остальных типов не показываем поле
      },
    },
    {
      validate: (value, formData) => {
        const propertyType = formData.get("propertyType");
        if (
          (propertyType !== "apartment" && propertyType !== "house") ||
          !value ||
          value.trim() === ""
        )
          return true;
        return validators
          .min(1, "Количество комнат должно быть больше 0")
          .validate(value);
      },
    },
    {
      validate: (value, formData) => {
        const propertyType = formData.get("propertyType");
        if (
          (propertyType !== "apartment" && propertyType !== "house") ||
          !value ||
          value.trim() === ""
        )
          return true;
        return validators
          .max(10, "Количество комнат не может превышать 10")
          .validate(value);
      },
    },
  ],
  condition: [
    // Условная валидация - НЕ обязательно для земельных участков, коммерции и гаражей
    {
      validate: (value, formData) => {
        const propertyType = formData.get("propertyType");
        if (
          propertyType === "land" ||
          propertyType === "commercial" ||
          propertyType === "garage"
        )
          return true;
        return validators.required("Выберите состояние").validate(value);
      },
    },
  ],
  propertyArea: [
    // Условная валидация - обязательно для всех типов кроме земельных участков
    {
      validate: (value, formData) => {
        const propertyType = formData.get("propertyType");
        if (propertyType === "land") return true;
        return validators.required("Укажите площадь объекта").validate(value);
      },
    },
    {
      validate: (value, formData) => {
        const propertyType = formData.get("propertyType");
        if (propertyType === "land" || !value || value.trim() === "")
          return true;
        return validators
          .min(1, "Площадь должна быть больше 0")
          .validate(value);
      },
    },
    {
      validate: (value, formData) => {
        const propertyType = formData.get("propertyType");
        if (propertyType === "land" || !value || value.trim() === "")
          return true;
        return validators
          .max(10000, "Площадь не может превышать 10,000 м²")
          .validate(value);
      },
    },
  ],
  landArea: [
    // Условная валидация - обязательно для земельных участков и домов
    {
      validate: (value, formData) => {
        const propertyType = formData.get("propertyType");
        if (propertyType !== "land" && propertyType !== "house") return true;
        return validators.required("Укажите площадь участка").validate(value);
      },
    },
    {
      validate: (value, formData) => {
        const propertyType = formData.get("propertyType");
        if (
          (propertyType !== "land" && propertyType !== "house") ||
          !value ||
          value.trim() === ""
        )
          return true;
        return validators
          .min(0.01, "Площадь участка должна быть больше 0")
          .validate(value);
      },
    },
    {
      validate: (value, formData) => {
        const propertyType = formData.get("propertyType");
        if (
          (propertyType !== "land" && propertyType !== "house") ||
          !value ||
          value.trim() === ""
        )
          return true;
        return validators
          .max(1000, "Площадь участка не может превышать 1000 соток")
          .validate(value);
      },
    },
  ],
  price: [
    validators.required("Укажите цену"),
    {
      validate: (value) => {
        if (!value || value.trim() === "") return true;
        const numericValue = value.replace(/\D/g, "");
        return numericValue && Number(numericValue) >= 1;
      },
      message: "Цена должна быть больше 0",
    },
  ],
  cleanDescription: [
    validators.required("Добавьте описание объекта"),
    validators.minLength(10, "Описание должно содержать минимум 10 символов"),
  ],
};

/**
 *  настройка условных полей
 */
function setupConditionalFields(form) {
  const propertyTypeSelect = form.querySelector("#propertyType");
  const floorField = form.querySelector("#floor");
  const propertyAreaField = form.querySelector("#propertyArea");
  const landAreaField = form.querySelector("#landArea");
  const roomsField = form.querySelector("#rooms");
  const conditionField = form.querySelector("#condition");

  if (!propertyTypeSelect) return;

  const floorContainer = floorField?.closest(".form-field");
  const propertyAreaContainer = propertyAreaField?.closest(".form-field");
  const landAreaContainer = landAreaField?.closest(".form-field");
  const roomsContainer = roomsField?.closest(".form-field");
  const conditionContainer = conditionField?.closest(".form-field");

  // Находим опцию "Студия" в списке комнат
  const studioOption = roomsField?.querySelector('option[value="0"]');

  const toggleFields = () => {
    const propertyType = propertyTypeSelect.value;

    // Показываем поле "Этаж" только для квартир (НЕ обязательно)
    if (floorContainer) {
      if (propertyType === "apartment") {
        floorContainer.style.display = "block";
        if (floorField) floorField.required = false; // Не обязательно для квартир
      } else {
        floorContainer.style.display = "none";
        if (floorField) {
          floorField.required = false;
          floorField.value = "";
        }
      }
    }

    // Показываем поле "Количество комнат" только для квартир и домов
    if (roomsContainer) {
      if (propertyType === "apartment" || propertyType === "house") {
        roomsContainer.style.display = "block";
        if (roomsField) {
          // Для квартир обязательно, для домов - нет
          roomsField.required = propertyType === "apartment";
        }
      } else {
        roomsContainer.style.display = "none";
        if (roomsField) {
          roomsField.required = false;
          roomsField.value = "";
        }
      }
    }

    // Управление видимостью опции "Студия" в зависимости от типа недвижимости
    if (studioOption) {
      if (propertyType === "apartment") {
        // Показываем опцию "Студия" только для квартир
        studioOption.style.display = "block";
      } else {
        // Скрываем опцию "Студия" для всех остальных типов
        studioOption.style.display = "none";
        // Если была выбрана студия, сбрасываем выбор
        if (roomsField && roomsField.value === "0") {
          roomsField.value = "";
        }
      }
    }

    // Показываем поле "Состояние" только для квартир и домов (НЕ для участков, коммерции и гаражей)
    if (conditionContainer) {
      if (propertyType === "apartment" || propertyType === "house") {
        conditionContainer.style.display = "block";
        if (conditionField) conditionField.required = true;
      } else {
        conditionContainer.style.display = "none";
        if (conditionField) {
          conditionField.required = false;
          conditionField.value = "";
        }
      }
    }

    // Управление полями площади в зависимости от типа недвижимости
    if (propertyAreaContainer && landAreaContainer) {
      if (propertyType === "land") {
        // Для земельных участков показываем только поле площади участка
        propertyAreaContainer.style.display = "none";
        landAreaContainer.style.display = "block";

        if (propertyAreaField) {
          propertyAreaField.required = false;
          propertyAreaField.value = "";
        }
        if (landAreaField) {
          landAreaField.required = true;
        }
      } else if (propertyType === "house") {
        // Для домов показываем оба поля площади
        propertyAreaContainer.style.display = "block";
        landAreaContainer.style.display = "block";

        if (propertyAreaField) {
          propertyAreaField.required = true;
        }
        if (landAreaField) {
          landAreaField.required = true;
        }
      } else {
        // Для остальных типов показываем площадь объекта, скрываем участок
        propertyAreaContainer.style.display = "block";
        landAreaContainer.style.display = "none";

        if (propertyAreaField) {
          propertyAreaField.required = true;
        }
        if (landAreaField) {
          landAreaField.required = false;
          landAreaField.value = "";
        }
      }
    }
  };

  propertyTypeSelect.addEventListener("change", toggleFields);
  toggleFields();
}

/**
 * Настройка загрузки файлов с поддержкой Telegram Mini App
 */
function setupFileUpload(form) {
  console.log("🚀 Инициализация загрузки файлов");

  const fileInput = form.querySelector("#imageUploadInput");
  const fileCounter = form.querySelector("#fileCounter");
  const fileCounterText = form.querySelector("#fileCounterText");
  const fileLabel = form.querySelector('label[for="imageUploadInput"]');

  if (!fileInput) {
    console.warn("❌ Поле загрузки файлов не найдено");
    return;
  }

  // Проверяем, запущено ли в Telegram Mini App
  const isTelegramMiniApp = !!(window.Telegram && window.Telegram.WebApp);
  console.log(
    "🔍 Среда выполнения:",
    isTelegramMiniApp ? "Telegram Mini App" : "Обычный браузер"
  );

  // Массив для хранения накопленных файлов (для Telegram)
  let accumulatedFiles = [];

  /**
   * Обновляет счетчик выбранных файлов
   */
  const updateFileCounter = (filesCount) => {
    if (!fileCounter || !fileCounterText) return;

    if (filesCount > 0) {
      fileCounterText.textContent = `Выбрано файлов: ${filesCount}`;
      fileCounter.style.display = "block";
    } else {
      fileCounter.style.display = "none";
    }
  };

  /**
   * Создает кнопку для добавления дополнительных файлов в Telegram
   */
  const createAddMoreButton = () => {
    if (!isTelegramMiniApp || accumulatedFiles.length === 0) return;

    let addMoreBtn = form.querySelector("#addMoreFilesBtn");
    if (!addMoreBtn) {
      addMoreBtn = document.createElement("button");
      addMoreBtn.type = "button";
      addMoreBtn.id = "addMoreFilesBtn";
      addMoreBtn.className = "btn btn-outline-primary btn-sm mt-2";
      addMoreBtn.innerHTML =
        '<i class="bi bi-plus-circle me-1"></i> Добавить еще файлы';

      addMoreBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("🔄 Добавление дополнительных файлов");

        // Создаем временный input для добавления файлов
        const tempInput = document.createElement("input");
        tempInput.type = "file";
        tempInput.accept = fileInput.accept;
        tempInput.multiple = false; // В Telegram можем выбрать только один за раз
        tempInput.style.display = "none";

        tempInput.addEventListener("change", (e) => {
          if (e.target.files && e.target.files.length > 0) {
            const newFile = e.target.files[0];
            console.log("➕ Добавляем новый файл:", newFile.name);

            // Проверяем, не добавлен ли уже этот файл
            const isDuplicate = accumulatedFiles.some(
              (file) =>
                file.name === newFile.name &&
                file.size === newFile.size &&
                file.lastModified === newFile.lastModified
            );

            if (!isDuplicate) {
              accumulatedFiles.push(newFile);
              updateAccumulatedFiles();
            } else {
              console.warn("⚠️ Файл уже добавлен:", newFile.name);
            }
          }
          document.body.removeChild(tempInput);
        });

        document.body.appendChild(tempInput);
        tempInput.click();
      });

      fileCounter.parentNode.insertBefore(addMoreBtn, fileCounter.nextSibling);
    }

    addMoreBtn.style.display = "block";
  };

  /**
   * Создает список файлов с возможностью удаления
   */
  const createFilesList = () => {
    if (!isTelegramMiniApp || accumulatedFiles.length === 0) return;

    let filesList = form.querySelector("#selectedFilesList");
    if (!filesList) {
      filesList = document.createElement("div");
      filesList.id = "selectedFilesList";
      filesList.className = "selected-files-list mt-2";
      fileCounter.parentNode.insertBefore(filesList, fileCounter.nextSibling);
    }

    filesList.innerHTML = accumulatedFiles
      .map(
        (file, index) => `
      <div class="selected-file-item d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
        <div class="file-info">
          <small class="text-muted d-block">${file.name}</small>
          <small class="text-muted">${(file.size / 1024 / 1024).toFixed(
            2
          )} МБ</small>
        </div>
        <button type="button" class="btn btn-sm btn-outline-danger remove-file-btn" data-index="${index}">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `
      )
      .join("");

    // Добавляем обработчики удаления
    filesList.querySelectorAll(".remove-file-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        console.log("🗑️ Удаляем файл с индексом:", index);
        accumulatedFiles.splice(index, 1);
        updateAccumulatedFiles();
      });
    });
  };

  /**
   * Обновляет накопленные файлы и интерфейс
   */
  const updateAccumulatedFiles = () => {
    console.log(`📊 Обновление интерфейса: ${accumulatedFiles.length} файлов`);
    updateFileCounter(accumulatedFiles.length);
    createFilesList();
    createAddMoreButton();

    // Обновляем скрытый input с файлами (для совместимости с FormData)
    const dt = new DataTransfer();
    accumulatedFiles.forEach((file) => dt.items.add(file));
    fileInput.files = dt.files;
  };

  // Основной обработчик изменения файлов
  const handleFileChange = (files) => {
    console.log(`📁 Обработка файлов: ${files.length}`);

    if (isTelegramMiniApp) {
      // В Telegram добавляем файлы в накопленный массив
      if (files && files.length > 0) {
        const newFiles = Array.from(files);

        // Добавляем только новые файлы (избегаем дубликатов)
        newFiles.forEach((newFile) => {
          const isDuplicate = accumulatedFiles.some(
            (file) =>
              file.name === newFile.name &&
              file.size === newFile.size &&
              file.lastModified === newFile.lastModified
          );

          if (!isDuplicate) {
            accumulatedFiles.push(newFile);
          }
        });

        updateAccumulatedFiles();
      }
    } else {
      // В обычном браузере работаем как обычно
      updateFileCounter(files ? files.length : 0);
    }
  };

  // Обработчик change события
  fileInput.addEventListener("change", (e) => {
    handleFileChange(e.target.files);
  });

  // Дополнительные обработчики для Telegram Mini App
  if (isTelegramMiniApp) {
    console.log("📱 Настройка дополнительных обработчиков для Telegram");

    // Обработчик для восстановления файлов при возврате фокуса
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(() => {
          if (fileInput.files && fileInput.files.length > 0) {
            console.log("🔄 Восстановление файлов после смены видимости");
            handleFileChange(fileInput.files);
          }
        }, 100);
      }
    };

    const handleWindowFocus = () => {
      setTimeout(() => {
        if (fileInput.files && fileInput.files.length > 0) {
          console.log("🔄 Восстановление файлов после получения фокуса");
          handleFileChange(fileInput.files);
        }
      }, 100);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    // Обновляем текст для Telegram
    if (fileLabel) {
      const placeholder = fileLabel.querySelector(".form-file-placeholder");
      if (placeholder) {
        placeholder.textContent =
          "Выберите изображение (можно добавить несколько)";
      }
    }
  }

  console.log("✅ Загрузка файлов настроена");

  return {
    getFiles: () => (isTelegramMiniApp ? accumulatedFiles : fileInput.files),
    clearFiles: () => {
      fileInput.value = "";
      if (isTelegramMiniApp) {
        accumulatedFiles = [];
        const filesList = form.querySelector("#selectedFilesList");
        const addMoreBtn = form.querySelector("#addMoreFilesBtn");
        if (filesList) filesList.remove();
        if (addMoreBtn) addMoreBtn.remove();
      }
      updateFileCounter(0);
    },
    updateCounter: updateFileCounter,
    addFiles: (files) => {
      if (isTelegramMiniApp) {
        Array.from(files).forEach((file) => accumulatedFiles.push(file));
        updateAccumulatedFiles();
      }
    },
    isTelegramMode: isTelegramMiniApp,
  };
}

/**
 * Универсальная функция инициализации Select2
 */
function setupSelect2(form, fieldId, fieldName) {
  const selectElement = form.querySelector(`#${fieldId}`);

  if (!selectElement) {
    console.warn(`Поле '${fieldId}' не найдено`);
    return;
  }

  // Проверяем, что jQuery и Select2 доступны
  if (typeof $ === "undefined" || !$.fn.select2) {
    console.warn("jQuery или Select2 не загружены");
    // Пытаемся инициализировать через некоторое время
    setTimeout(() => setupSelect2(form, fieldId, fieldName), 500);
    return;
  }

  const placeholder = selectElement.dataset.placeholder;

  try {
    // Проверяем, не инициализирован ли уже Select2
    if ($(selectElement).hasClass("select2-hidden-accessible")) {
      console.log(
        `🔄 Select2 уже инициализирован для поля '${fieldName}', уничтожаем...`
      );
      $(selectElement).select2("destroy");
    }

    // Инициализируем Select2
    $(selectElement).select2({
      language: {
        inputTooShort: () => "Пожалуйста, введите ещё хотя бы 1 символ",
        noResults: () => "Совпадений не найдено",
        searching: () => "Поиск...",
      },
      theme: "bootstrap-5",
      allowClear: true,
      multiple: false, // Одиночный выбор
      placeholder: placeholder || `Выберите ${fieldName.toLowerCase()}`,
      minimumResultsForSearch: 0, // Показывать поиск сразу
      width: "100%",
    });

    console.log(`✅ Select2 инициализирован для поля '${fieldName}'`);
  } catch (error) {
    console.error(
      `❌ Ошибка инициализации Select2 для поля '${fieldName}':`,
      error
    );
    console.log(
      `Используем обычный select без Select2 для поля '${fieldName}'`
    );
  }
}

/**
 * Инициализация Select2 для поля "Жилой комплекс"
 */
function setupComplexSelect2(form) {
  setupSelect2(form, "complex", "Жилой комплекс");
}

/**
 * Инициализация Select2 для поля "Район"
 */
function setupDistrictSelect2(form) {
  setupSelect2(form, "district", "Район");
}

/**
 * Настройка обработчиков кнопок для установки типа действия
 */
function setupActionButtons(form) {
  const actionTypeField = form.querySelector("#actionType");
  const saveAsDraftBtn = form.querySelector("#saveAsDraftBtn");
  const publishBtn = form.querySelector("#publishBtn");

  if (!actionTypeField) {
    console.warn("Поле actionType не найдено");
    return;
  }

  // Обработчик для кнопки "Сохранить как черновик"
  if (saveAsDraftBtn) {
    saveAsDraftBtn.addEventListener("click", (e) => {
      const actionType = saveAsDraftBtn.getAttribute("data-action");
      actionTypeField.value = actionType;
      console.log("Установлен тип действия:", actionType);
    });
  }

  // Обработчик для кнопки "Опубликовать"
  if (publishBtn) {
    publishBtn.addEventListener("click", (e) => {
      const actionType = publishBtn.getAttribute("data-action");
      actionTypeField.value = actionType;
      console.log("Установлен тип действия:", actionType);
    });
  }
}

/**
 * Обработчики формы без показа ошибок под полями
 */
const addListingHandler = {
  async onSubmit(data, formData) {
    console.log("📝 Отправка формы...", data);

    // Обрабатываем цену - убираем пробелы перед отправкой
    processPriceBeforeSubmit(formData);

    // Получаем тип действия из скрытого поля
    const actionType = formData.get("actionType");
    console.log("Action type:", actionType);

    // Получаем URL из атрибута data-action-url формы
    const form = document.getElementById("addListingForm");
    if (!form) {
      throw new Error("Форма не найдена");
    }

    let actionUrl;

    // Выбираем URL в зависимости от типа действия
    if (actionType === "draft") {
      actionUrl = form.getAttribute("data-secondary-action-url");
    } else {
      actionUrl = form.getAttribute("data-action-url");
    }

    console.log("Form element:", form);
    console.log("Action URL:", actionUrl);

    if (!actionUrl) {
      throw new Error(
        "URL для отправки данных не найден в атрибуте data-action-url"
      );
    }

    try {
      return await fetcher(actionUrl, {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);

      // Проверяем, является ли это сетевой ошибкой
      if (
        error.isNetworkError ||
        error.name === "TypeError" ||
        error.message.includes("fetch")
      ) {
        error.isNetworkError = true;
      }

      throw error;
    }
  },

  onSuccess(result) {
    console.log("🎉 Успех!", result);

    // Получаем форму
    const form = document.getElementById("addListingForm");
    if (!form) {
      console.error("Форма не найдена");
      return;
    }

    if (result.status) {
      const successUrl = form.getAttribute("data-success-url");
      if (successUrl) {
        window.location.href = successUrl;
      } else {
        console.error("URL успеха не найден");
      }
    } else {
      createAndShowToast(result.errors, "danger");
    }
  },

  onError(errors) {
    console.log("⚠️ Ошибки валидации:", errors);

    // Проверяем, что errors существует и является объектом
    if (!errors || typeof errors !== "object") {
      console.error("Некорректный формат ошибок:", errors);
      createAndShowToast("Произошла ошибка валидации", "warning");
      return;
    }

    // Обрабатываем случай, когда ошибки приходят в разных форматах
    const errorFields = errors.errors || errors;

    // Находим первое поле с ошибкой и фокусируемся на нем
    const firstErrorField = Object.keys(errorFields)[0];
    if (firstErrorField) {
      const field = document.querySelector(`[name="${firstErrorField}"]`);
      if (field) {
        field.focus();
        field.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    createAndShowToast("Заполните обязательные поля", "warning");
  },

  onNetworkError(error) {
    console.log("🌐 Ошибка сети:", error);

    let message = "Ошибка отправки формы";

    if (error.status === 404) {
      message = "Страница не найдена. Обратитесь к администратору";
    } else if (error.status === 500) {
      message = "Ошибка сервера. Попробуйте позже";
    } else if (error.status === 403) {
      message = "Доступ запрещен";
    } else if (error.status === 422) {
      message = "Некорректные данные формы";
    } else if (error.name === "TypeError" || error.message.includes("fetch")) {
      message = "Проблема с подключением к серверу";
    }

    createAndShowToast(message, "danger");
  },
};

/**
 * Основная функция инициализации
 */
export const initAddListingForm = () => {
  const form = document.getElementById("addListingForm");

  if (!form) {
    console.warn("❌ Форма не найдена");
    return null;
  }

  if (form.dataset.initialized === "true") {
    console.warn("⚠️ Форма уже инициализирована");
    return form.formManager;
  }

  console.log("🚀 Инициализация формы...");

  try {
    // Создаем FormManager с отключенным показом ошибок
    const formManager = createForm(form, addListingSchema, {
      onSubmit: addListingHandler.onSubmit.bind(addListingHandler),
      onSuccess: addListingHandler.onSuccess.bind(addListingHandler),
      onError: addListingHandler.onError.bind(addListingHandler),
      onNetworkError: addListingHandler.onNetworkError.bind(addListingHandler),
      validateOnBlur: true,
      validateOnChange: true,
    });

    // Настраиваем дополнительную логику
    setupConditionalFields(form);
    setupFileUpload(form);
    setupComplexSelect2(form);
    setupDistrictSelect2(form);
    setupActionButtons(form);
    setupPriceFormatting(form); // Добавляем вызов для форматирования цены

    form.dataset.initialized = "true";
    form.formManager = formManager;

    console.log("✅ Форма инициализирована");
    return formManager;
  } catch (error) {
    console.error("❌ Ошибка инициализации:", error);
    return null;
  }
};

// Инициализация при загрузке DOM
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".add-listing-page")) {
    console.log("🏠 Найдена страница добавления объявления");
    setTimeout(() => {
      initAddListingForm();
    }, 100);
  }
});

export default {
  initAddListingForm,
  addListingSchema,
  addListingHandler,
};
