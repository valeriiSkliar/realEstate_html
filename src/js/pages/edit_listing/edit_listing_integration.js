import {
  createAndShowToast,
  createForm,
  validators,
} from "../../forms/index.js";

/**
 * Схема валидации для редактирования (та же что и для создания)
 */
const editListingSchema = {
  propertyType: [validators.required("Выберите тип объекта")],
  tradeType: [validators.required("Выберите тип сделки")],
  propertyName: [
    validators.required("Введите заголовок объявления"),
    validators.minLength(10, "Заголовок должен содержать минимум 10 символов"),
  ],
  locality: [validators.required("Выберите населенный пункт")],
  address: [validators.required("Введите адрес объекта")],
  propertyArea: [
    validators.required("Укажите площадь объекта"),
    validators.min(1, "Площадь должна быть больше 0"),
    validators.max(10000, "Площадь не может превышать 10,000 м²"),
  ],
  price: [
    validators.required("Укажите цену"),
    validators.min(1, "Цена должна быть больше 0"),
  ],
};

/**
 * Настройка условных полей
 */
function setupConditionalFields(form) {
  const propertyTypeSelect = form.querySelector("#propertyType");
  const floorField = form.querySelector("#floor");

  if (!propertyTypeSelect) return;

  const floorContainer = floorField?.closest(".form-field");

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
  };

  propertyTypeSelect.addEventListener("change", toggleFields);
  toggleFields();
}

/**
 * Настройка загрузки файлов
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

  // Обработчик клика на кнопку загрузки
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

  // Инициализируем превью
  updatePreview();
}

/**
 * Обработчики для редактирования объявления
 */
const editListingHandler = {
  async onSubmit(data, formData) {
    console.log("📝 Сохранение изменений...", data);

    // Получаем URL из атрибута data-action формы
    const form = document.getElementById("addListingForm");
    const actionUrl = form?.getAttribute("data-action");

    if (!actionUrl) {
      throw new Error(
        "URL для отправки данных не найден в атрибуте data-action"
      );
    }

    try {
      const response = await fetch(actionUrl, {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Ошибка при отправке данных:", error);
      throw error;
    }
  },

  onSuccess(result) {
    console.log("🎉 Успех!", result);
    createAndShowToast("Изменения успешно сохранены!", "success");
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
 * Настройка дополнительных кнопок
 */
function setupAdditionalButtons(form) {
  // Кнопка "В архив" (бывшая "Снять с публикации")
  const unpublishBtn = form.querySelector("#unpublishBtn");
  if (unpublishBtn) {
    unpublishBtn.addEventListener("click", async () => {
      console.log("📤 Перемещение в архив...");

      // Здесь должен быть реальный запрос к серверу
      createAndShowToast("Функция архивирования не реализована", "info");
    });
  }

  // Обработчик кнопки "Сохранить как черновик"
  const saveAsDraftBtn = form.querySelector("#saveAsDraftBtn");
  if (saveAsDraftBtn) {
    saveAsDraftBtn.addEventListener("click", () => {
      createAndShowToast("Функция сохранения черновика не реализована", "info");
    });
  }
}

/**
 * Основная функция инициализации редактирования
 */
export const initEditListingForm = () => {
  const form = document.getElementById("addListingForm");

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
      onSubmit: editListingHandler.onSubmit,
      onSuccess: editListingHandler.onSuccess,
      onError: editListingHandler.onError,
      validateOnBlur: true,
      validateOnChange: true,
    });

    // Настраиваем дополнительную логику
    setupConditionalFields(form);
    setupFileUpload(form);
    setupAdditionalButtons(form);

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
  const isEditPage =
    window.location.pathname.includes("listings-edit") ||
    document.querySelector(".edit-listing-page") ||
    (document.querySelector(".add-listing-page") &&
      window.location.search.includes("edit"));

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
