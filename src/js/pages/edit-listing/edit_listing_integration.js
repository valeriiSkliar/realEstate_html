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
 * Настройка загрузки файлов (усовершенствованная для Telegram Mini App)
 */
function setupFileUpload(form) {
  const fileInput = form.querySelector("#imageUploadInput");
  const previewContainer = form.querySelector("#imagePreviews");

  console.log("setupFileUpload:", { fileInput, previewContainer });

  if (!fileInput) {
    console.warn("Поле загрузки файлов не найдено");
    return;
  }

  // Массив для хранения файлов
  let selectedFiles = [];

  // Функция для создания нового FileList
  function createFileList(files) {
    const dt = new DataTransfer();
    files.forEach((file) => dt.items.add(file));
    return dt.files;
  }

  // Функция для обновления превью файлов
  function updatePreview() {
    if (!previewContainer) return;

    previewContainer.innerHTML = "";

    if (selectedFiles.length === 0) {
      previewContainer.innerHTML =
        '<div class="text-muted">Файлы не выбраны</div>';
      // Обновляем текст кнопки
      const placeholderText = form.querySelector(".form-file-placeholder");
      if (placeholderText) {
        placeholderText.textContent = "Выберите несколько изображений";
      }
      return;
    }

    // Отображаем выбранные файлы
    selectedFiles.forEach((file, index) => {
      const fileItem = document.createElement("div");
      fileItem.className =
        "selected-file d-flex align-items-center mb-2 p-2 border rounded";
      fileItem.style.position = "relative";

      // Кнопка удаления
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn btn-sm btn-outline-danger ms-auto";
      deleteBtn.innerHTML = '<i class="bi bi-x"></i>';
      deleteBtn.title = "Удалить файл";
      deleteBtn.style.minWidth = "32px";

      deleteBtn.addEventListener("click", () => {
        removeFile(index);
      });

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileItem.innerHTML = `
            <img src="${e.target.result}" 
                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 10px;">
            <div class="flex-grow-1">
              <div class="fw-bold">${file.name}</div>
              <div class="text-muted small">${(file.size / 1024).toFixed(
                1
              )} KB</div>
            </div>
          `;
          fileItem.appendChild(deleteBtn);
        };
        reader.readAsDataURL(file);
      } else {
        fileItem.innerHTML = `
          <div class="file-icon me-2">📄</div>
          <div class="flex-grow-1">
            <div class="fw-bold">${file.name}</div>
            <div class="text-muted small">${(file.size / 1024).toFixed(
              1
            )} KB</div>
          </div>
        `;
        fileItem.appendChild(deleteBtn);
      }

      previewContainer.appendChild(fileItem);
    });

    // Обновляем текст кнопки
    const placeholderText = form.querySelector(".form-file-placeholder");
    if (placeholderText) {
      placeholderText.textContent = `Загружено изображений: ${selectedFiles.length}`;
    }

    // Обновляем FileList в input
    fileInput.files = createFileList(selectedFiles);
  }

  // Функция удаления файла
  function removeFile(index) {
    selectedFiles.splice(index, 1);
    updatePreview();
    console.log(`Файл удален. Осталось файлов: ${selectedFiles.length}`);
  }

  // Функция добавления файлов
  function addFiles(newFiles) {
    console.log("🔄 addFiles вызвана с файлами:", newFiles);
    Array.from(newFiles).forEach((file) => {
      // Проверяем, не добавлен ли уже такой файл
      const isDuplicate = selectedFiles.some(
        (existingFile) =>
          existingFile.name === file.name &&
          existingFile.size === file.size &&
          existingFile.lastModified === file.lastModified
      );

      if (!isDuplicate) {
        selectedFiles.push(file);
        console.log(`✅ Файл добавлен: ${file.name}`);
      } else {
        console.log(`⚠️ Дублированный файл: ${file.name}`);
      }
    });
    updatePreview();
  }

  // Обработчик клика на кнопку загрузки
  const uploadButton = form.querySelector(".form-file-button");
  if (uploadButton) {
    uploadButton.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("🖱️ Клик по кнопке загрузки, открываем диалог файлов");
      fileInput.click();
    });
  }

  // Обработчик клика на label (дополнительный для Telegram)
  const fileLabel = form.querySelector('label[for="imageUploadInput"]');
  if (fileLabel) {
    fileLabel.addEventListener("click", (e) => {
      console.log("🏷️ Клик по label, открываем диалог файлов");
      // Не предотвращаем событие по умолчанию, позволяем label работать
    });
  }

  // Основной обработчик изменения файлов
  fileInput.addEventListener("change", (e) => {
    console.log("📁 Событие change сработало:", e.target.files);
    console.log("📁 Количество файлов:", e.target.files.length);

    if (e.target.files.length > 0) {
      addFiles(e.target.files);
    } else {
      console.warn("⚠️ Файлы не выбраны или недоступны");
    }
  });

  // Дополнительный обработчик input для Telegram Mini App
  fileInput.addEventListener("input", (e) => {
    console.log("⌨️ Событие input сработало:", e.target.files);

    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  });

  // Обработчик focus для отладки
  fileInput.addEventListener("focus", () => {
    console.log("🎯 File input получил фокус");
  });

  // Обработчик blur для отладки
  fileInput.addEventListener("blur", () => {
    console.log("💨 File input потерял фокус");
  });

  // Добавляем обработчик для MutationObserver чтобы отслеживать изменения files
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "files"
      ) {
        console.log("🔍 MutationObserver: изменения в файлах обнаружены");
        if (fileInput.files && fileInput.files.length > 0) {
          addFiles(fileInput.files);
        }
      }
    });
  });

  // Наблюдаем за изменениями атрибутов
  observer.observe(fileInput, { attributes: true });

  // Периодическая проверка для Telegram Mini App (fallback)
  let lastFileCount = 0;
  const checkFilesInterval = setInterval(() => {
    if (fileInput.files && fileInput.files.length !== lastFileCount) {
      console.log(
        "⏰ Периодическая проверка: изменение количества файлов обнаружено"
      );
      console.log(
        `📊 Было: ${lastFileCount}, стало: ${fileInput.files.length}`
      );

      lastFileCount = fileInput.files.length;

      if (fileInput.files.length > 0) {
        addFiles(fileInput.files);
        // Очищаем интервал после успешной загрузки
        clearInterval(checkFilesInterval);
      }
    }
  }, 500);

  // Очищаем интервал через 30 секунд чтобы не засорять память
  setTimeout(() => {
    clearInterval(checkFilesInterval);
    console.log("⏰ Периодическая проверка файлов отключена");
  }, 30000);

  // Drag & Drop
  const fileArea = form.querySelector(".form-file");
  if (fileArea) {
    fileArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      fileArea.classList.add("drag-over");
      console.log("🔄 Dragover event");
    });

    fileArea.addEventListener("dragleave", () => {
      fileArea.classList.remove("drag-over");
      console.log("🔄 Dragleave event");
    });

    fileArea.addEventListener("drop", (e) => {
      e.preventDefault();
      fileArea.classList.remove("drag-over");
      console.log("🎯 Drop event:", e.dataTransfer.files);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        addFiles(files);
      }
    });
  }

  // Детектор Telegram Mini App
  const isTelegramMiniApp = window.Telegram && window.Telegram.WebApp;
  if (isTelegramMiniApp) {
    console.log("📱 Обнаружен Telegram Mini App");

    // Дополнительные обработчики для Telegram
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && fileInput.files && fileInput.files.length > 0) {
        console.log("👁️ Страница стала видимой, проверяем файлы");
        addFiles(fileInput.files);
      }
    });

    // Обработчик для Telegram WebApp событий
    if (window.Telegram.WebApp.onEvent) {
      window.Telegram.WebApp.onEvent("viewportChanged", () => {
        console.log("📱 Telegram viewport изменился, проверяем файлы");
        if (fileInput.files && fileInput.files.length > 0) {
          addFiles(fileInput.files);
        }
      });
    }
  }

  // Обработчик для общих WebView проблем
  window.addEventListener("focus", () => {
    setTimeout(() => {
      if (
        fileInput.files &&
        fileInput.files.length > 0 &&
        selectedFiles.length === 0
      ) {
        console.log(
          "🔄 Window focus: обнаружены новые файлы после возврата в приложение"
        );
        addFiles(fileInput.files);
      }
    }, 100);
  });

  // Инициализируем превью
  updatePreview();

  console.log("✅ File upload setup завершен");

  // Возвращаем функции для внешнего использования
  return {
    addFiles,
    updatePreview,
    removeFile,
    getSelectedFiles: () => selectedFiles,
  };
}
/**
 * Инициализация Select2 для поля "Жилой комплекс"
 */
function setupComplexSelect2(form) {
  const complexSelect = form.querySelector("#complex");

  if (!complexSelect) {
    console.warn("Поле 'complex' не найдено");
    return;
  }

  const placeholder = complexSelect.dataset.placeholder;

  // Проверяем, что jQuery и Select2 доступны
  if (typeof $ === "undefined" || !$.fn.select2) {
    console.warn("jQuery или Select2 не загружены");
    // Пытаемся инициализировать через некоторое время
    setTimeout(() => setupComplexSelect2(form), 500);
    return;
  }

  try {
    // Инициализируем Select2 напрямую для поля "Жилой комплекс"
    $(complexSelect).select2({
      language: {
        inputTooShort: () => "Пожалуйста, введите ещё хотя бы 1 символ",
        noResults: () => "Совпадений не найдено",
        searching: () => "Поиск...",
      },
      theme: "bootstrap-5",
      allowClear: true,
      multiple: false, // Одиночный выбор
      placeholder: placeholder || "Выберите жилой комплекс",
      minimumResultsForSearch: 0, // Показывать поиск сразу
      width: "100%",
    });

    console.log("✅ Select2 инициализирован для поля 'Жилой комплекс'");
  } catch (error) {
    console.error("❌ Ошибка инициализации Select2 для поля 'complex':", error);
    console.log("Используем обычный select без Select2");
  }
}

/**
 * Инициализация Select2 для поля "Район"
 */
function setupDistrictSelect2(form) {
  const districtSelect = form.querySelector("#district");

  if (!districtSelect) {
    console.warn("Поле 'district' не найдено");
    return;
  }

  // Проверяем, что jQuery и Select2 доступны
  if (typeof $ === "undefined" || !$.fn.select2) {
    console.warn("jQuery или Select2 не загружены");
    // Пытаемся инициализировать через некоторое время
    setTimeout(() => setupComplexSelect2(form), 500);
    return;
  }
  const placeholder = districtSelect.dataset.placeholder;
  try {
    // Инициализируем Select2 напрямую для поля "Жилой комплекс"
    $(districtSelect).select2({
      language: {
        inputTooShort: () => "Пожалуйста, введите ещё хотя бы 1 символ",
        noResults: () => "Совпадений не найдено",
        searching: () => "Поиск...",
      },
      theme: "bootstrap-5",
      allowClear: true,
      multiple: false, // Одиночный выбор
      placeholder: placeholder || "Выберите район",
      minimumResultsForSearch: 0, // Показывать поиск сразу
      width: "100%",
    });

    console.log("✅ Select2 инициализирован для поля 'Район'");
  } catch (error) {
    console.error("❌ Ошибка инициализации Select2 для поля 'Район':", error);
    console.log("Используем обычный select без Select2");
  }
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
    console.log("Action type:", actionType);

    // Получаем URL из атрибута data-action-url формы
    const form = document.getElementById("editListingForm");
    if (!form) {
      throw new Error("Форма не найдена");
    }

    let actionUrl;

    // Выбираем URL в зависимости от типа действия
    if (actionType === "archive") {
      actionUrl = form.getAttribute("data-secondary-action-url");
    } else {
      actionUrl = form.getAttribute("data-action-url");
    }

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
  // if (unpublishBtn) {
  //   unpublishBtn.addEventListener("click", (e) => {
  //     const actionType = unpublishBtn.getAttribute("data-action");
  //     actionTypeField.value = actionType;
  //     console.log("Установлен тип действия:", actionType);
  //   });
  // }

  // // Обработчик для кнопки "Сохранить изменения"
  // if (saveChangesBtn) {
  //   saveChangesBtn.addEventListener("click", (e) => {
  //     const actionType = saveChangesBtn.getAttribute("data-action");
  //     actionTypeField.value = actionType;
  //     console.log("Установлен тип действия:", actionType);
  //   });
  // }
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
