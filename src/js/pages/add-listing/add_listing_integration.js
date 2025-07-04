import { createForm, validators } from "../../forms/index.js";
import { fetcher } from "../../utils/fetcher.js";
import { createAndShowToast } from "../../utils/uiHelpers.js";
/**
 * Упрощенная схема валидации
 */
const addListingSchema = {
  propertyType: [validators.required("Выберите тип объекта")],
  tradeType: [validators.required("Выберите тип сделки")],
  locality: [validators.required("Выберите населенный пункт")],
  address: [validators.required("Введите адрес объекта")],
  rooms: [
    validators.required("Выберите количество комнат"),
    validators.min(1, "Количество комнат должно быть больше 0"),
    validators.max(10, "Количество комнат не может превышать 10"),
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
    validators.min(1, "Цена должна быть больше 0"),
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

  if (!propertyTypeSelect) return;

  const floorContainer = floorField?.closest(".form-field");
  const propertyAreaContainer = propertyAreaField?.closest(".form-field");
  const landAreaContainer = landAreaField?.closest(".form-field");
  const roomsContainer = roomsField?.closest(".form-field");

  const toggleFields = () => {
    const propertyType = propertyTypeSelect.value;

    // Показываем поле "Этаж" только для квартир
    if (floorContainer) {
      if (propertyType === "apartment") {
        floorContainer.style.display = "block";
        if (floorField) floorField.required = true;
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
        if (roomsField) roomsField.required = true;
      } else {
        roomsContainer.style.display = "none";
        if (roomsField) {
          roomsField.required = false;
          roomsField.value = "";
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
 * Исправленная настройка загрузки файлов с функциональностью удаления
 */
function setupFileUpload(form) {
  const fileInput = form.querySelector("#imageUploadInput");
  const fileLabel = form.querySelector('label[for="imageUploadInput"]');
  const previewContainer = form.querySelector("#imagePreviews");

  console.log("setupFileUpload:", { fileInput, fileLabel, previewContainer });

  if (!fileInput) {
    console.warn("Поле загрузки файлов не найдено");
    return;
  }

  // Массив для хранения файлов (FileList нельзя изменять напрямую)
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

    // Создаем превью для каждого файла
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
      placeholderText.textContent = `Выбрано файлов: ${selectedFiles.length}`;
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
      }
    });
    updatePreview();
  }

  // Если нет label, создаем обработчик на кнопку
  const uploadButton = form.querySelector(".form-file-button");
  if (uploadButton) {
    uploadButton.addEventListener("click", (e) => {
      e.preventDefault();
      fileInput.click();
    });
  }

  // Обработчик изменения файлов
  fileInput.addEventListener("change", (e) => {
    console.log("Files selected:", e.target.files);

    if (e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  });

  // Drag & Drop
  const fileArea = form.querySelector(".form-file");
  if (fileArea) {
    fileArea.addEventListener("dragover", (e) => {
      e.preventDefault();
      fileArea.classList.add("drag-over");
    });

    fileArea.addEventListener("dragleave", () => {
      fileArea.classList.remove("drag-over");
    });

    fileArea.addEventListener("drop", (e) => {
      e.preventDefault();
      fileArea.classList.remove("drag-over");

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        addFiles(files);
      }
    });
  }

  // Инициализируем пустой превью
  updatePreview();
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
      placeholder: "Выберите жилой комплекс",
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
    setupActionButtons(form);

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
