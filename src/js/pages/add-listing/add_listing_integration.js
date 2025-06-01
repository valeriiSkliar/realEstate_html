import {
  createAndShowToast,
  createForm,
  validators,
} from "../../forms/index.js";

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
 *  настройка условных полей
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
 * Исправленная настройка загрузки файлов
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

    if (!previewContainer) return;

    const files = e.target.files;
    previewContainer.innerHTML = "";

    if (files.length === 0) {
      previewContainer.innerHTML =
        '<div class="text-muted">Файлы не выбраны</div>';
      return;
    }

    // Показываем выбранные файлы
    Array.from(files).forEach((file, index) => {
      const fileItem = document.createElement("div");
      fileItem.className = "selected-file d-flex align-items-center mb-2";

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          fileItem.innerHTML = `
            <img src="${e.target.result}" 
                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; margin-right: 10px;">
            <div>
              <div class="fw-bold">${file.name}</div>
              <div class="text-muted small">${(file.size / 1024).toFixed(
                1
              )} KB</div>
            </div>
          `;
        };
        reader.readAsDataURL(file);
      } else {
        fileItem.innerHTML = `
          <div class="file-icon me-2">📄</div>
          <div>
            <div class="fw-bold">${file.name}</div>
            <div class="text-muted small">${(file.size / 1024).toFixed(
              1
            )} KB</div>
          </div>
        `;
      }

      previewContainer.appendChild(fileItem);
    });

    // Обновляем текст кнопки
    const placeholderText = form.querySelector(".form-file-placeholder");
    if (placeholderText) {
      placeholderText.textContent = `Выбрано файлов: ${files.length}`;
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
      fileInput.files = files;
      fileInput.dispatchEvent(new Event("change"));
    });
  }
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
