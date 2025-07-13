import { createForm, validators } from "../../forms/index.js";
import { fetcher } from "../../utils/fetcher.js";
import { FileUploadLogger } from "../../utils/fileUploadLogger.js";
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
 * Настройка загрузки файлов для Telegram Mini App
 * Улучшенная реализация с поддержкой видимого overlay для Android WebView
 * С детекцией типа интерфейса, haptic feedback и расширенным логированием
 */
function setupFileUpload(form) {
  // Инициализируем логгер
  const logger = new FileUploadLogger("EditListing");

  const fileInput = form.querySelector("#imageUploadInput");
  const fileLabel = form.querySelector('label[for="imageUploadInput"]');
  const previewContainer = form.querySelector("#imagePreviews");
  const uploadButton = form.querySelector(".form-file-button");
  const placeholderText = form.querySelector(".form-file-placeholder");

  logger.log("🔍 Поиск элементов формы", {
    fileInput: !!fileInput,
    fileLabel: !!fileLabel,
    previewContainer: !!previewContainer,
    uploadButton: !!uploadButton,
    placeholderText: !!placeholderText,
  });

  if (!fileInput) {
    logger.log("❌ Поле загрузки файлов не найдено");
    return;
  }

  // Определяем платформу и окружение
  const userAgent = navigator.userAgent;
  const isAndroid = /Android/.test(userAgent);
  const isIOS = /iPhone|iPad/.test(userAgent);
  const isTelegramMiniApp = window.Telegram && window.Telegram.WebApp;
  const isTelegramWebView =
    userAgent.includes("TelegramBot") || userAgent.includes("Telegram");

  logger.log("🔍 Определение платформы и окружения", {
    isAndroid,
    isIOS,
    isTelegramMiniApp,
    isTelegramWebView,
    userAgent: userAgent.substring(0, 100) + "...",
  });

  // Массив выбранных файлов
  let selectedFiles = [];
  let interfaceType = "unknown"; // 'telegram', 'system', 'unknown'
  let lastInteractionTime = 0;

  // Инициализация Telegram WebApp
  if (isTelegramMiniApp) {
    logger.log("📱 Инициализация Telegram Web App");
    try {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      // Включаем haptic feedback если доступен
      if (window.Telegram.WebApp.HapticFeedback) {
        logger.log("✅ Haptic Feedback доступен");
      }
      logger.log("✅ Telegram Web App инициализирован");
    } catch (error) {
      logger.logError(error, "Telegram Web App initialization");
    }
  }

  /**
   * Haptic feedback для улучшения UX
   */
  function triggerHapticFeedback(type = "light") {
    if (isTelegramMiniApp && window.Telegram.WebApp.HapticFeedback) {
      try {
        switch (type) {
          case "light":
            window.Telegram.WebApp.HapticFeedback.impactOccurred("light");
            break;
          case "medium":
            window.Telegram.WebApp.HapticFeedback.impactOccurred("medium");
            break;
          case "heavy":
            window.Telegram.WebApp.HapticFeedback.impactOccurred("heavy");
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
          case "selection":
            window.Telegram.WebApp.HapticFeedback.selectionChanged();
            break;
        }
        logger.log(`📳 Haptic feedback: ${type}`);
      } catch (error) {
        logger.logError(error, "Haptic feedback");
      }
    }
  }

  /**
   * Создание видимого file input overlay для Android WebView
   */
  function createVisibleFileInputOverlay() {
    logger.log("🎯 Создание видимого file input overlay для Android");

    // Создаем контейнер для overlay
    const overlayContainer = document.createElement("div");
    overlayContainer.className = "telegram-file-overlay";

    // Создаем видимый file input
    const visibleFileInput = document.createElement("input");
    visibleFileInput.type = "file";
    visibleFileInput.accept = fileInput.accept || "image/*";
    visibleFileInput.multiple = fileInput.multiple || false;
    visibleFileInput.className = "telegram-file-overlay__input";

    // Создаем контейнер для контента
    const contentContainer = document.createElement("div");
    contentContainer.className = "telegram-file-overlay__content";

    // Создаем иконку загрузки
    const uploadIcon = document.createElement("span");
    uploadIcon.className = "telegram-file-overlay__icon";
    uploadIcon.innerHTML = "📤";

    // Создаем текст кнопки
    const buttonText = document.createElement("span");
    buttonText.className = "telegram-file-overlay__text";
    buttonText.textContent = "Загрузить фото";

    // Собираем компоненты
    contentContainer.appendChild(uploadIcon);
    contentContainer.appendChild(buttonText);
    overlayContainer.appendChild(visibleFileInput);
    overlayContainer.appendChild(contentContainer);

    // Hover эффекты
    overlayContainer.addEventListener("mouseenter", () => {
      overlayContainer.style.transform = "scale(1.02)";
      overlayContainer.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    });

    overlayContainer.addEventListener("mouseleave", () => {
      overlayContainer.style.transform = "scale(1)";
      overlayContainer.style.boxShadow = "none";
    });

    // Touch эффекты для мобильных устройств
    overlayContainer.addEventListener("touchstart", () => {
      overlayContainer.style.transform = "scale(0.98)";
      triggerHapticFeedback("light");
    });

    overlayContainer.addEventListener("touchend", () => {
      setTimeout(() => {
        overlayContainer.style.transform = "scale(1)";
      }, 150);
    });

    // Обработчик изменения файлов
    visibleFileInput.addEventListener("change", (event) => {
      logger.log("📁 Overlay file input change event", {
        filesCount: event.target.files ? event.target.files.length : 0,
        timestamp: Date.now(),
      });

      interfaceType = "telegram"; // Определяем как Telegram интерфейс

      // Показываем состояние загрузки
      overlayContainer.classList.add("loading");

      if (event.target.files && event.target.files.length > 0) {
        triggerHapticFeedback("success");

        handleFileSelection({
          target: event.target,
          type: "overlay-change",
        });

        // Обновляем текст кнопки
        const fileCount = event.target.files.length;
        buttonText.textContent = `Выбрано: ${fileCount} ${
          fileCount === 1 ? "файл" : "файлов"
        }`;
        uploadIcon.innerHTML = "✅";

        // Показываем состояние успеха
        setTimeout(() => {
          overlayContainer.classList.remove("loading");
          overlayContainer.classList.add("success");

          // Возвращаем обычное состояние через 2 секунды
          setTimeout(() => {
            overlayContainer.classList.remove("success");
          }, 2000);
        }, 500);
      } else {
        triggerHapticFeedback("error");

        // Показываем состояние ошибки
        setTimeout(() => {
          overlayContainer.classList.remove("loading");
          overlayContainer.classList.add("error");

          setTimeout(() => {
            overlayContainer.classList.remove("error");
          }, 2000);
        }, 500);
      }
    });

    // Заменяем оригинальную кнопку на overlay
    if (uploadButton && uploadButton.parentNode) {
      uploadButton.parentNode.insertBefore(overlayContainer, uploadButton);
      uploadButton.style.display = "none";
      logger.log("✅ Видимый overlay создан и установлен");
    }

    return { overlayContainer, visibleFileInput };
  }

  /**
   * Детекция типа интерфейса загрузки файлов
   */
  function detectFileInterface() {
    logger.log("🔍 Детекция типа интерфейса загрузки файлов");

    const startTime = Date.now();
    lastInteractionTime = startTime;

    // Создаем тестовый клик для определения типа интерфейса
    const testInput = document.createElement("input");
    testInput.type = "file";
    testInput.style.position = "absolute";
    testInput.style.left = "-9999px";
    testInput.style.opacity = "0";

    document.body.appendChild(testInput);

    // Слушаем события для определения типа интерфейса
    const cleanup = () => {
      document.body.removeChild(testInput);
    };

    testInput.addEventListener("change", () => {
      const responseTime = Date.now() - startTime;

      if (responseTime < 100) {
        interfaceType = "system";
        logger.log("🏛️ Определен системный интерфейс", { responseTime });
      } else {
        interfaceType = "telegram";
        logger.log("📱 Определен Telegram интерфейс", { responseTime });
      }

      cleanup();
    });

    // Если за 5 секунд ничего не произошло - считаем что интерфейс не работает
    setTimeout(() => {
      if (interfaceType === "unknown") {
        interfaceType = "blocked";
        logger.log("🚫 Интерфейс заблокирован или не работает");
        cleanup();
      }
    }, 5000);

    // Программный клик для тестирования
    try {
      testInput.click();
    } catch (error) {
      logger.logError(error, "Test click failed");
      interfaceType = "blocked";
      cleanup();
    }
  }

  /**
   * Обновление превью файлов
   */
  function updatePreview() {
    const startTime = Date.now();
    logger.log("🖼️ Начало обновления превью", {
      selectedFilesCount: selectedFiles.length,
      previewContainerExists: !!previewContainer,
      interfaceType,
    });

    if (!previewContainer) {
      logger.log("❌ Контейнер превью не найден");
      return;
    }

    previewContainer.innerHTML = "";

    if (selectedFiles.length === 0) {
      previewContainer.innerHTML =
        '<div class="text-muted">Файлы не выбраны</div>';
      if (placeholderText) {
        placeholderText.textContent = "Выберите несколько изображений";
      }
      logger.log("📝 Показан пустой статус");
      return;
    }

    selectedFiles.forEach((file, index) => {
      logger.log(`🖼️ Создание превью для файла ${index}`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      const fileItem = document.createElement("div");
      fileItem.className =
        "selected-file d-flex align-items-center mb-2 p-2 border rounded";

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "btn btn-sm btn-outline-danger ms-auto";
      deleteBtn.innerHTML = '<i class="bi bi-x"></i>';
      deleteBtn.title = "Удалить файл";
      deleteBtn.addEventListener("click", () => {
        logger.log(`🗑️ Клик по кнопке удаления файла ${index}`);
        triggerHapticFeedback("light");
        removeFile(index);
      });

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          logger.log(`✅ FileReader загрузил изображение ${index}`);
          fileItem.innerHTML = `
            <img src="${e.target.result}" 
                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 10px;">
            <div class="flex-grow-1">
              <div class="fw-bold">${file.name}</div>
              <div class="text-muted small">${(file.size / 1024).toFixed(
                1
              )} KB</div>
              <div class="text-muted small">Интерфейс: ${interfaceType}</div>
            </div>
          `;
          fileItem.appendChild(deleteBtn);
        };
        reader.onerror = (e) => {
          logger.logError(
            new Error(`FileReader error for file ${index}`),
            "FileReader"
          );
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
            <div class="text-muted small">Интерфейс: ${interfaceType}</div>
          </div>
        `;
        fileItem.appendChild(deleteBtn);
      }

      previewContainer.appendChild(fileItem);
    });

    if (placeholderText) {
      const newText = `Выбрано файлов: ${selectedFiles.length} (${interfaceType})`;
      placeholderText.textContent = newText;
      logger.log("📝 Обновлен текст placeholder", { newText });
    }

    // Обновляем FileList в input
    updateFileInputFiles();

    logger.logTiming("updatePreview", startTime);
  }

  /**
   * Обновление FileList в input элементе
   */
  function updateFileInputFiles() {
    const startTime = Date.now();
    logger.log("🔄 Начало обновления FileList", {
      selectedFilesCount: selectedFiles.length,
      hasDataTransfer: "DataTransfer" in window,
      interfaceType,
    });

    try {
      const dt = new DataTransfer();
      selectedFiles.forEach((file, index) => {
        logger.log(`➕ Добавление файла ${index} в DataTransfer`, {
          fileName: file.name,
          fileSize: file.size,
        });
        dt.items.add(file);
      });

      const oldFilesCount = fileInput.files ? fileInput.files.length : 0;
      fileInput.files = dt.files;
      const newFilesCount = fileInput.files ? fileInput.files.length : 0;

      logger.logDataTransferOperation(
        "updateFileInputFiles",
        selectedFiles,
        true
      );
      logger.log("✅ FileList успешно обновлен", {
        oldCount: oldFilesCount,
        newCount: newFilesCount,
        expectedCount: selectedFiles.length,
        interfaceType,
      });

      // Дополнительная проверка состояния после обновления
      logger.logElementState(fileInput, "fileInput-after-update");
    } catch (error) {
      logger.logDataTransferOperation(
        "updateFileInputFiles",
        selectedFiles,
        false,
        error
      );
      logger.logError(error, "updateFileInputFiles");
    }

    logger.logTiming("updateFileInputFiles", startTime);
  }

  /**
   * Удаление файла
   */
  function removeFile(index) {
    logger.log(`🗑️ Удаление файла ${index}`, {
      fileName: selectedFiles[index]?.name,
      totalFilesBefore: selectedFiles.length,
      interfaceType,
    });

    const oldFiles = [...selectedFiles];
    selectedFiles.splice(index, 1);

    logger.logFileListUpdate(oldFiles, selectedFiles, "removeFile");
    updatePreview();
  }

  /**
   * Добавление файлов
   */
  function addFiles(newFiles) {
    if (!newFiles || newFiles.length === 0) {
      logger.log("⚠️ Попытка добавить пустой список файлов");
      return;
    }

    logger.logFileSelection(newFiles, "addFiles");

    const oldFiles = [...selectedFiles];
    let addedCount = 0;
    let duplicateCount = 0;

    Array.from(newFiles).forEach((file, index) => {
      logger.log(`🔍 Проверка файла ${index}`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        lastModified: file.lastModified,
        interfaceType,
      });

      // Проверка на дубликаты
      const isDuplicate = selectedFiles.some(
        (existingFile) =>
          existingFile.name === file.name &&
          existingFile.size === file.size &&
          existingFile.lastModified === file.lastModified
      );

      if (!isDuplicate) {
        selectedFiles.push(file);
        addedCount++;
        logger.log(`✅ Файл добавлен: ${file.name}`);
      } else {
        duplicateCount++;
        logger.log(`⚠️ Дублированный файл: ${file.name}`);
      }
    });

    logger.log("📊 Итоги добавления файлов", {
      totalNewFiles: newFiles.length,
      addedCount,
      duplicateCount,
      totalFilesAfter: selectedFiles.length,
      interfaceType,
    });

    // Haptic feedback при успешном добавлении файлов
    if (addedCount > 0) {
      triggerHapticFeedback("success");
    } else if (duplicateCount > 0) {
      triggerHapticFeedback("warning");
    }

    logger.logFileListUpdate(oldFiles, selectedFiles, "addFiles");
    updatePreview();
  }

  /**
   * Основной обработчик выбора файлов
   */
  function handleFileSelection(event) {
    const startTime = Date.now();
    logger.logEvent("handleFileSelection", event.target, {
      eventType: event.type,
      isTrusted: event.isTrusted,
      interfaceType,
    });

    const files = event.target.files;
    logger.log("📂 Обработка выбора файлов", {
      filesExists: !!files,
      filesLength: files ? files.length : 0,
      eventType: event.type,
      targetId: event.target.id,
      interfaceType,
    });

    // Логируем состояние input после события
    logger.logElementState(event.target, "fileInput-after-selection");

    if (files && files.length > 0) {
      logger.logFileSelection(files, "handleFileSelection");
      addFiles(files);
    } else {
      logger.log("⚠️ Файлы не найдены в событии");
      triggerHapticFeedback("error");
    }

    logger.logTiming("handleFileSelection", startTime);
  }

  /**
   * Обработчик клика по кнопке загрузки (fallback)
   */
  function handleUploadClick(event) {
    const startTime = Date.now();
    event.preventDefault();

    logger.logEvent("handleUploadClick", event.target, {
      eventType: event.type,
      isTrusted: event.isTrusted,
      interfaceType,
    });

    triggerHapticFeedback("light");

    // Логируем состояние перед очисткой
    logger.logElementState(fileInput, "fileInput-before-clear");

    // Очищаем input перед открытием диалога
    fileInput.value = "";

    // Логируем состояние после очистки
    logger.logElementState(fileInput, "fileInput-after-clear");

    // Программно открываем диалог выбора файлов
    logger.log("🖱️ Программный клик по file input");
    try {
      fileInput.click();
    } catch (error) {
      logger.logError(error, "Programmatic click failed");
      triggerHapticFeedback("error");
    }

    logger.logTiming("handleUploadClick", startTime);
  }

  // Основная инициализация
  logger.log("🔗 Установка основных обработчиков событий");

  // Создаем видимый overlay для Android в Telegram
  let overlayComponents = null;
  if (isAndroid && isTelegramMiniApp) {
    overlayComponents = createVisibleFileInputOverlay();
    logger.log("✅ Видимый overlay создан для Android");
  }

  // Основные обработчики событий для оригинального input
  fileInput.addEventListener("change", (event) => {
    logger.logEvent("change", fileInput);
    handleFileSelection(event);
  });

  // Дополнительный обработчик для некоторых WebView
  fileInput.addEventListener("input", (event) => {
    logger.logEvent("input", fileInput);
    handleFileSelection(event);
  });

  // Обработчик кнопки загрузки (fallback)
  if (uploadButton && !overlayComponents) {
    uploadButton.addEventListener("click", handleUploadClick);
    logger.log("✅ Обработчик кнопки загрузки установлен");
  } else if (!overlayComponents) {
    logger.log("⚠️ Кнопка загрузки не найдена");
  }

  // Обработчик label (для случаев когда кнопка не работает)
  if (fileLabel && !overlayComponents) {
    fileLabel.addEventListener("click", (event) => {
      logger.logEvent("label-click", fileLabel);
      triggerHapticFeedback("light");
    });
    logger.log("✅ Обработчик label установлен");
  } else if (!overlayComponents) {
    logger.log("⚠️ Label не найден");
  }

  // Специальные обработчики для iOS
  if (isIOS && isTelegramMiniApp) {
    logger.logIOSSpecific("Установка обработчиков для iOS");

    // Обработчик touch событий
    fileInput.addEventListener("touchend", (event) => {
      logger.logEvent("touchend", fileInput);
      setTimeout(() => {
        if (fileInput.files && fileInput.files.length > 0) {
          logger.log(
            "👆 Touch end: обнаружены файлы, запуск handleFileSelection"
          );
          handleFileSelection({ target: fileInput, type: "touchend" });
        } else {
          logger.log("👆 Touch end: файлы не обнаружены");
        }
      }, 100);
    });

    // Обработчик изменения видимости страницы
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        logger.logIOSSpecific("Страница стала видимой", {
          hasFiles: !!(fileInput.files && fileInput.files.length > 0),
        });
        setTimeout(() => {
          if (fileInput.files && fileInput.files.length > 0) {
            logger.log(
              "👁️ Visibility change: обнаружены файлы, запуск handleFileSelection"
            );
            handleFileSelection({
              target: fileInput,
              type: "visibilitychange",
            });
          }
        }, 200);
      }
    });
  }

  // Специальные обработчики для Android (дополнительные)
  if (isAndroid && isTelegramMiniApp && !overlayComponents) {
    logger.logAndroidSpecific(
      "Установка дополнительных обработчиков для Android"
    );

    // Обработчик focus событий
    fileInput.addEventListener("focus", (event) => {
      logger.logEvent("focus", fileInput);
      logger.logAndroidSpecific("File input получил фокус");
    });

    // Обработчик blur событий
    fileInput.addEventListener("blur", (event) => {
      logger.logEvent("blur", fileInput);
      logger.logAndroidSpecific("File input потерял фокус", {
        hasFiles: !!(fileInput.files && fileInput.files.length > 0),
      });

      // Проверяем файлы после потери фокуса
      setTimeout(() => {
        if (
          fileInput.files &&
          fileInput.files.length > 0 &&
          selectedFiles.length === 0
        ) {
          logger.logAndroidSpecific("Blur: обнаружены новые файлы");
          handleFileSelection({ target: fileInput, type: "blur-delayed" });
        }
      }, 100);
    });

    // Обработчик window focus
    window.addEventListener("focus", () => {
      logger.logAndroidSpecific("Window получил фокус");
      setTimeout(() => {
        if (
          fileInput.files &&
          fileInput.files.length > 0 &&
          selectedFiles.length === 0
        ) {
          logger.logAndroidSpecific("Window focus: обнаружены новые файлы");
          handleFileSelection({ target: fileInput, type: "window-focus" });
        }
      }, 150);
    });

    // Периодическая проверка состояния для Android
    let androidCheckInterval = setInterval(() => {
      if (
        fileInput.files &&
        fileInput.files.length > 0 &&
        selectedFiles.length === 0
      ) {
        logger.logAndroidSpecific(
          "Периодическая проверка: найдены неучтенные файлы"
        );
        handleFileSelection({ target: fileInput, type: "periodic-check" });
        clearInterval(androidCheckInterval);
      }
    }, 500);

    // Очищаем интервал через 30 секунд
    setTimeout(() => {
      clearInterval(androidCheckInterval);
      logger.logAndroidSpecific("Периодическая проверка завершена");
    }, 30000);
  }

  // Инициализация превью
  updatePreview();

  // Запускаем детекцию интерфейса через некоторое время
  if (!overlayComponents) {
    setTimeout(() => {
      detectFileInterface();
    }, 1000);
  }

  logger.log("✅ Загрузка файлов настроена для Telegram Mini App", {
    hasOverlay: !!overlayComponents,
    platform: isAndroid ? "Android" : isIOS ? "iOS" : "Unknown",
    isTelegramMiniApp,
    interfaceType,
  });

  // Добавляем глобальную функцию для экспорта логов (для отладки)
  window.exportFileUploadLogs = () => {
    return logger.exportLogs();
  };

  // Возвращаем API для внешнего использования
  return {
    addFiles,
    updatePreview,
    removeFile,
    getSelectedFiles: () => selectedFiles,
    clearFiles: () => {
      const oldFiles = [...selectedFiles];
      selectedFiles = [];
      logger.logFileListUpdate(oldFiles, selectedFiles, "clearFiles");
      updatePreview();
    },
    getInterfaceType: () => interfaceType,
    triggerHapticFeedback,
    logger, // Возвращаем логгер для дополнительной диагностики
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
