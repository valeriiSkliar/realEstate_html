import { createForm, validators } from "../../forms/index.js";
import { createAndShowToast } from "../../utils/uiHelpers.js";

/**
 * Упрощенная схема валидации
 */
const addListingSchema = {
  propertyType: [validators.required("Выберите тип объекта")],
  tradeType: [validators.required("Выберите тип сделки")],
  propertyName: [
    validators.required("Введите заголовок объявления"),
    validators.minLength(10, "Заголовок должен содержать минимум 10 символов"),
  ],
  locality: [validators.required("Выберите населенный пункт")],
  address: [validators.required("Введите адрес объекта")],
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
    // Условная валидация - обязательно только для земельных участков
    {
      validate: (value, formData) => {
        const propertyType = formData.get("propertyType");
        if (propertyType !== "land") return true;
        return validators.required("Укажите площадь участка").validate(value);
      },
    },
    {
      validate: (value, formData) => {
        const propertyType = formData.get("propertyType");
        if (propertyType !== "land" || !value || value.trim() === "")
          return true;
        return validators
          .min(0.01, "Площадь участка должна быть больше 0")
          .validate(value);
      },
    },
    {
      validate: (value, formData) => {
        const propertyType = formData.get("propertyType");
        if (propertyType !== "land" || !value || value.trim() === "")
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

  if (!propertyTypeSelect) return;

  const floorContainer = floorField?.closest(".form-field");
  const propertyAreaContainer = propertyAreaField?.closest(".form-field");
  const landAreaContainer = landAreaField?.closest(".form-field");

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
 * Обработчики формы без показа ошибок под полями
 */
const addListingHandler = {
  async onSubmit(data, formData) {
    console.log("📝 Отправка формы...", data);

    // Простая имитация отправки
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ Форма успешно отправлена");
        resolve({ success: true, listingId: 123 });
      }, 1500);
    });
  },

  onSuccess(result) {
    console.log("🎉 Успех!", result);
    createAndShowToast("Объявление успешно создано!", "success");
  },

  onError(errors) {
    console.log("⚠️ Ошибки валидации:", errors);

    // Находим первое поле с ошибкой и фокусируемся на нем
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const field = document.querySelector(`[name="${firstErrorField}"]`);
      if (field) {
        field.focus();
        field.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    createAndShowToast("Заполните обязательные поля", "warning");
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
      onSubmit: addListingHandler.onSubmit,
      onSuccess: addListingHandler.onSuccess,
      onError: addListingHandler.onError,
      validateOnBlur: true,
      validateOnChange: true,
    });

    // Настраиваем дополнительную логику
    setupConditionalFields(form);
    setupFileUpload(form);

    // Обработчик кнопки "Сохранить как черновик"
    const saveAsDraftBtn = form.querySelector("#saveAsDraftBtn");
    if (saveAsDraftBtn) {
      saveAsDraftBtn.addEventListener("click", () => {
        createAndShowToast("Черновик сохранен", "info");
      });
    }

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
