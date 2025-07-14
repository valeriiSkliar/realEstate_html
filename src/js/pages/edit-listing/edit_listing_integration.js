import { Dropzone } from "dropzone"; // Добавляем импорт Dropzone
import { createForm, validators } from "../../forms/index.js";
import { fetcher } from "../../utils/fetcher.js";
import {
  processPriceBeforeSubmit,
  setupPriceFormatting,
} from "../../utils/priceFormatter.js";
import { createAndShowToast } from "../../utils/uiHelpers.js";

/**
 * Схема валидации для редактирования (та же что и для создания)
 */
const editListingSchema = {
  propertyType: [validators.required("Выберите тип объекта")],
  tradeType: [validators.required("Выберите тип сделки")],
  locality: [validators.required("Выберите населенный пункт")],
  // address теперь не обязательно для всех типов
  // complex не обязательно для всех типов
  // floor не обязательно (управляется через setupConditionalFields)
  rooms: [
    // Условная валидация - обязательно для квартир, НЕ обязательно для домов
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
};

/**
 * Настройка условных полей
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

    // Показываем поле "Количество комнат" только для квартир и домов (НЕ обязательно)
    if (roomsContainer) {
      if (propertyType === "apartment" || propertyType === "house") {
        roomsContainer.style.display = "block";
        if (roomsField) roomsField.required = false; // Не обязательно
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
 * Настройка загрузки файлов с использованием Dropzone.js
 * Упрощенная реализация с поддержкой Telegram Mini App
 */
function setupFileUpload(form) {
  console.log("🚀 Инициализация Dropzone для загрузки файлов");

  const fileInput = form.querySelector("#imageUploadInput");
  const previewContainer = form.querySelector("#imagePreviews");
  const uploadButton = form.querySelector(".form-file-button");
  const placeholderText = form.querySelector(".form-file-placeholder");

  if (!fileInput) {
    console.warn("❌ Поле загрузки файлов не найдено");
    return;
  }

  // Определяем платформу для Telegram Mini App интеграции
  const userAgent = navigator.userAgent;
  const isAndroid = /Android/.test(userAgent);
  const isIOS = /iPhone|iPad/.test(userAgent);
  const isTelegramMiniApp = window.Telegram && window.Telegram.WebApp;

  console.log("🔍 Платформа:", { isAndroid, isIOS, isTelegramMiniApp });

  // Инициализация Telegram Web App
  if (isTelegramMiniApp) {
    console.log("📱 Инициализация Telegram Web App");
    try {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    } catch (error) {
      console.warn("⚠️ Ошибка инициализации Telegram Web App:", error);
    }
  }

  /**
   * Haptic feedback для улучшения UX в Telegram
   */
  function triggerHapticFeedback(type = "light") {
    if (isTelegramMiniApp && window.Telegram.WebApp.HapticFeedback) {
      try {
        switch (type) {
          case "light":
            window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
            break;
          case "success":
            window.Telegram.WebApp.HapticFeedback.notificationOccurred(
              "success"
            );
            break;
          case "error":
            window.Telegram.WebApp.HapticFeedback.notificationOccurred("error");
            break;
          case "warning":
            window.Telegram.WebApp.HapticFeedback.notificationOccurred(
              "warning"
            );
            break;
        }
        console.log(`📳 Haptic feedback: ${type}`);
      } catch (error) {
        console.warn("⚠️ Ошибка haptic feedback:", error);
      }
    }
  }

  // Создаем контейнер для Dropzone
  const dropzoneContainer = document.createElement("div");
  dropzoneContainer.className = "dropzone-container";
  dropzoneContainer.innerHTML = `
    <div class="dropzone dz-clickable" id="file-dropzone">
      <div class="dz-message needsclick">
        <i class="bi bi-cloud-upload display-4 text-muted mb-3"></i>
        <h5>Перетащите файлы сюда или нажмите для выбора</h5>
        <span class="note needsclick">Поддерживаются форматы: JPG, PNG, WEBP. Максимум 10 файлов, до 5 МБ каждый.</span>
      </div>
    </div>
  `;

  // Заменяем существующий интерфейс загрузки
  const fileWrapper = fileInput.closest(".form-file");
  if (fileWrapper) {
    fileWrapper.parentNode.insertBefore(dropzoneContainer, fileWrapper);
    fileWrapper.style.display = "none";
  }

  // Отключаем автоматическое обнаружение Dropzone
  Dropzone.autoDiscover = false;

  // Инициализируем Dropzone
  const myDropzone = new Dropzone("#file-dropzone", {
    url: "#", // Не используем автозагрузку
    autoProcessQueue: false, // Отключаем автоматическую загрузку
    uploadMultiple: false,
    parallelUploads: 1,
    maxFiles: 10,
    maxFilesize: 5, // MB
    acceptedFiles: "image/png,image/jpeg,image/webp",
    addRemoveLinks: true,
    dictDefaultMessage: `
      <i class="bi bi-cloud-upload display-4 text-muted mb-3"></i>
      <h5>Нажмите для выбора</h5>
      <span class="note needsclick">Поддерживаются форматы: JPG, PNG, WEBP. Максимум 10 файлов, до 5 МБ каждый.</span>
    `,
    dictRemoveFile: "Удалить",
    dictFileTooBig:
      "Файл слишком большой ({{filesize}}МБ). Максимальный размер: {{maxFilesize}}МБ.",
    dictInvalidFileType: "Недопустимый тип файла.",
    dictMaxFilesExceeded:
      "Превышено максимальное количество файлов ({{maxFiles}}).",

    init: function () {
      const dropzoneInstance = this;

      console.log("✅ Dropzone инициализирован");

      // Обработчик добавления файла
      this.on("addedfile", function (file) {
        console.log("📁 Файл добавлен:", file.name);
        triggerHapticFeedback("light");
        updateFileInput();
        updatePlaceholder();
      });

      // Обработчик удаления файла
      this.on("removedfile", function (file) {
        console.log("🗑️ Файл удален:", file.name);
        triggerHapticFeedback("light");
        updateFileInput();
        updatePlaceholder();
      });

      // Обработчик ошибок
      this.on("error", function (file, errorMessage) {
        console.error("❌ Ошибка загрузки:", errorMessage);
        triggerHapticFeedback("error");
        createAndShowToast(errorMessage, "danger");
      });

      // Обработчик превышения максимального количества файлов
      this.on("maxfilesexceeded", function (file) {
        console.warn("⚠️ Превышено максимальное количество файлов");
        triggerHapticFeedback("warning");
        this.removeFile(file);
        createAndShowToast("Максимальное количество файлов: 10", "warning");
      });

      // Обработчик успешной загрузки (не используется, но оставляем для будущего)
      this.on("success", function (file, response) {
        console.log("✅ Файл успешно загружен:", file.name);
        triggerHapticFeedback("success");
      });

      /**
       * Обновление скрытого file input для совместимости с формой
       */
      function updateFileInput() {
        try {
          const dt = new DataTransfer();
          dropzoneInstance.files.forEach((file) => {
            // Добавляем только обычные файлы (не мок-файлы)
            if (file instanceof File) {
              dt.items.add(file);
            }
          });
          fileInput.files = dt.files;
          console.log(`🔄 File input обновлен: ${dt.files.length} файлов`);
        } catch (error) {
          console.warn("⚠️ Не удалось обновить file input:", error);
        }
      }

      /**
       * Обновление текста placeholder
       */
      function updatePlaceholder() {
        if (placeholderText) {
          const fileCount = dropzoneInstance.files.length;
          placeholderText.textContent =
            fileCount > 0
              ? `Выбрано файлов: ${fileCount}`
              : "Выберите несколько изображений";
        }
      }

      // Специальная обработка для Android в Telegram
      if (isAndroid && isTelegramMiniApp) {
        console.log("🤖 Настройка для Android Telegram");

        // Обработчик focus для восстановления файлов после возврата из диалога выбора
        window.addEventListener("focus", () => {
          setTimeout(() => {
            // Проверяем, если в скрытом input появились файлы, добавляем их в Dropzone
            if (
              fileInput.files &&
              fileInput.files.length > 0 &&
              dropzoneInstance.files.length === 0
            ) {
              console.log("🔄 Восстановление файлов после focus (Android)");
              Array.from(fileInput.files).forEach((file) => {
                dropzoneInstance.addFile(file);
              });
            }
          }, 200);
        });
      }

      // Специальная обработка для iOS в Telegram
      if (isIOS && isTelegramMiniApp) {
        console.log("🍎 Настройка для iOS Telegram");

        // Обработчик изменения видимости страницы
        document.addEventListener("visibilitychange", () => {
          if (!document.hidden) {
            setTimeout(() => {
              // Проверяем, если в скрытом input появились файлы, добавляем их в Dropzone
              if (
                fileInput.files &&
                fileInput.files.length > 0 &&
                dropzoneInstance.files.length === 0
              ) {
                console.log(
                  "🔄 Восстановление файлов после visibility change (iOS)"
                );
                Array.from(fileInput.files).forEach((file) => {
                  dropzoneInstance.addFile(file);
                });
              }
            }, 300);
          }
        });
      }
    },
  });

  // Обработчик клика по кнопке загрузки (fallback)
  if (uploadButton) {
    uploadButton.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("🖱️ Клик по кнопке загрузки - открываем Dropzone");
      triggerHapticFeedback("light");
      document.querySelector("#file-dropzone").click();
    });
  }

  console.log("✅ Dropzone настроен для Telegram Mini App");

  // Возвращаем API для внешнего использования
  return {
    dropzone: myDropzone,
    addFiles: (files) => {
      Array.from(files).forEach((file) => myDropzone.addFile(file));
    },
    clearFiles: () => {
      myDropzone.removeAllFiles();
    },
    getFiles: () => myDropzone.files,
    triggerHapticFeedback,
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
 * Обработчики для редактирования объявления
 */
const editListingHandler = {
  async onSubmit(data, formData) {
    console.log("📝 Сохранение изменений...", data);

    // Обрабатываем цену - убираем пробелы перед отправкой
    processPriceBeforeSubmit(formData);

    // Получаем тип действия из скрытого поля
    const actionType = formData.get("actionType");
    console.log("🎯 Тип действия:", actionType);

    if (!actionType) {
      console.warn(
        "⚠️ Тип действия не установлен, используется обновление по умолчанию"
      );
    }

    // Получаем URL из атрибута data-action-url формы
    const form = document.getElementById("editListingForm");
    if (!form) {
      throw new Error("Форма не найдена");
    }

    let actionUrl;

    // Выбираем URL в зависимости от типа действия
    if (actionType === "archive") {
      actionUrl = form.getAttribute("data-secondary-action-url");
      console.log("🗂️ Используется URL для архивирования:", actionUrl);
    } else {
      actionUrl = form.getAttribute("data-action-url");
      console.log("💾 Используется URL для обновления:", actionUrl);
    }

    if (!actionUrl) {
      const errorMsg =
        actionType === "archive"
          ? "URL для архивирования не найден в атрибуте data-secondary-action-url"
          : "URL для отправки данных не найден в атрибуте data-action-url";
      throw new Error(errorMsg);
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
    const form = document.getElementById("editListingForm");
    if (!form) {
      console.error("Форма не найдена");
      return;
    }

    if (result.status) {
      const successUrl = form.getAttribute("data-success-url");
      if (successUrl) {
        // Получаем тип действия для показа соответствующего сообщения
        const actionType = document.getElementById("actionType")?.value;
        if (successUrl) {
          window.location.href = successUrl;
        } else {
          console.error("URL успеха не найден");
        }
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
 * Настройка обработчиков кнопок для установки типа действия
 */
function setupActionButtons(form) {
  const actionTypeField = form.querySelector("#actionType");
  const unpublishBtn = form.querySelector("#unpublishBtn");
  const saveChangesBtn = form.querySelector("#saveChangesBtn");

  if (!actionTypeField) {
    console.warn("Поле actionType не найдено");
    return;
  }

  // Обработчик для кнопки "В архив"
  if (unpublishBtn) {
    unpublishBtn.addEventListener("click", (e) => {
      const actionType = unpublishBtn.getAttribute("data-action");
      actionTypeField.value = actionType;
      console.log("🗂️ Установлен тип действия для архивирования:", actionType);
    });
  }

  // Обработчик для кнопки "Сохранить изменения"
  if (saveChangesBtn) {
    saveChangesBtn.addEventListener("click", (e) => {
      const actionType = saveChangesBtn.getAttribute("data-action");
      actionTypeField.value = actionType;
      console.log("💾 Установлен тип действия для обновления:", actionType);
    });
  }

  // Обработчик отправки формы для установки типа действия по умолчанию
  form.addEventListener("submit", (e) => {
    if (!actionTypeField.value) {
      actionTypeField.value = "update";
      console.log("🔧 Установлен тип действия по умолчанию: update");
    }
  });
}

/**
 * Настройка дополнительных кнопок
 */
function setupAdditionalButtons(form) {
  // Все кнопки теперь работают через onSubmit и setupActionButtons
  // Эта функция оставлена для совместимости, но можно добавить
  // дополнительную логику если потребуется

  console.log("Дополнительные кнопки настроены");
}

/**
 * Основная функция инициализации редактирования
 */
export const initEditListingForm = () => {
  const form = document.getElementById("editListingForm");

  if (!form) {
    console.warn("❌ Форма не найдена");
    return null;
  }

  if (form.dataset.initialized === "true") {
    console.warn("⚠️ Форма уже инициализирована");
    return form.formManager;
  }

  console.log("🚀 Инициализация формы редактирования...");

  try {
    // Создаем FormManager
    const formManager = createForm(form, editListingSchema, {
      onSubmit: editListingHandler.onSubmit.bind(editListingHandler),
      onSuccess: editListingHandler.onSuccess.bind(editListingHandler),
      onError: editListingHandler.onError.bind(editListingHandler),
      onNetworkError:
        editListingHandler.onNetworkError.bind(editListingHandler),
      validateOnBlur: true,
      validateOnChange: true,
    });

    // Настраиваем дополнительную логику
    setupConditionalFields(form);
    setupFileUpload(form);
    setupComplexSelect2(form);
    setupDistrictSelect2(form);
    setupAdditionalButtons(form);
    setupActionButtons(form);
    setupPriceFormatting(form); // Добавляем настройку форматирования цены

    form.dataset.initialized = "true";
    form.formManager = formManager;

    console.log("✅ Форма редактирования инициализирована");
    return formManager;
  } catch (error) {
    console.error("❌ Ошибка инициализации:", error);
    return null;
  }
};

/**
 * Инициализация при загрузке DOM
 */
document.addEventListener("DOMContentLoaded", () => {
  // Проверяем URL или наличие специального класса для страницы редактирования
  const isEditPage = document.querySelector(".edit-listing-page");

  if (isEditPage) {
    console.log("✏️ Найдена страница редактирования объявления");
    setTimeout(() => {
      initEditListingForm();
    }, 100);
  }
});

export default {
  initEditListingForm,
  editListingSchema,
  editListingHandler,
};
