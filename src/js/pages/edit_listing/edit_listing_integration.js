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
 * Имитация данных из базы для предзаполнения формы
 */
const mockListingData = {
  id: 123,
  propertyType: "apartment",
  tradeType: "sale", 
  propertyName: "Уютная 2-комнатная квартира в центре города",
  locality: "krasnodar",
  district: "center",
  address: "ул. Красная, 123",
  propertyArea: "65.5",
  floor: "5",
  condition: "euro-renovation",
  price: "4500000",
  cleanDescription: "Отличная 2-комнатная квартира в самом центре города. Квартира после качественного евроремонта, со всей необходимой мебелью и техникой. Большие светлые комнаты, просторная кухня-гостиная. В доме есть лифт, охрана и подземная парковка. Рядом парк, школы, детские сады, остановки общественного транспорта. Отличное место для комфортной жизни в центре города.",
  building_elevator: true,
  building_parking: true,
  building_security: true,
  status: "published"
};

/**
 * Настройка условных полей (та же логика)
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
 * Настройка загрузки файлов (та же логика)
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
    
    if (files.length === 0) return;

    // Добавляем новые файлы к существующим
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
              <div class="text-muted small">${(file.size / 1024).toFixed(1)} KB</div>
            </div>
          `;
        };
        reader.readAsDataURL(file);
      } else {
        fileItem.innerHTML = `
          <div class="file-icon me-2">📄</div>
          <div>
            <div class="fw-bold">${file.name}</div>
            <div class="text-muted small">${(file.size / 1024).toFixed(1)} KB</div>
          </div>
        `;
      }

      previewContainer.appendChild(fileItem);
    });

    // Обновляем счетчик файлов
    const totalFiles = previewContainer.querySelectorAll('.selected-file').length;
    const placeholderText = form.querySelector(".form-file-placeholder");
    if (placeholderText) {
      placeholderText.textContent = `Загружено изображений: ${totalFiles}`;
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
 * Предзаполнение формы данными
 */
function populateFormWithData(form, data) {
  console.log("🔧 Предзаполнение формы данными:", data);

  Object.entries(data).forEach(([fieldName, value]) => {
    const field = form.querySelector(`[name="${fieldName}"]`);
    
    if (!field) return;

    if (field.type === "checkbox") {
      field.checked = Boolean(value);
    } else if (field.type === "radio") {
      const radioButton = form.querySelector(`[name="${fieldName}"][value="${value}"]`);
      if (radioButton) radioButton.checked = true;
    } else if (field.tagName === "SELECT") {
      field.value = value;
      // Триггерим событие change для select2
      if (field.hasAttribute("data-select2")) {
        field.dispatchEvent(new Event("change"));
      }
    } else {
      field.value = value;
    }
  });

  console.log("✅ Форма предзаполнена");
}

/**
 * Обработчики для редактирования объявления
 */
const editListingHandler = {
  async onSubmit(data, formData) {
    console.log("📝 Сохранение изменений...", data);

    // Имитация отправки на сервер
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("✅ Изменения успешно сохранены");
        resolve({ success: true, listingId: mockListingData.id });
      }, 1500);
    });
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
  // Кнопка "Снять с публикации"
  const unpublishBtn = form.querySelector("#unpublishBtn");
  if (unpublishBtn) {
    unpublishBtn.addEventListener("click", async () => {
      console.log("📤 Снятие с публикации...");
      
      // Имитация запроса
      unpublishBtn.disabled = true;
      unpublishBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Снимаем...';
      
      setTimeout(() => {
        unpublishBtn.disabled = false;
        unpublishBtn.innerHTML = '<i class="bi bi-eye-slash me-2"></i>Снять с публикации';
        createAndShowToast("Объявление снято с публикации", "info");
        
        // Обновляем статус в UI
        const statusBadge = document.querySelector(".listing-status .badge");
        if (statusBadge) {
          statusBadge.className = "badge bg-secondary";
          statusBadge.textContent = "Снято с публикации";
        }
      }, 1000);
    });
  }

  // Обработчик кнопки "Сохранить как черновик"
  const saveAsDraftBtn = form.querySelector("#saveAsDraftBtn");
  if (saveAsDraftBtn) {
    saveAsDraftBtn.addEventListener("click", () => {
      createAndShowToast("Изменения сохранены как черновик", "info");
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
    // Предзаполняем форму данными
    populateFormWithData(form, mockListingData);

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
  const isEditPage = window.location.pathname.includes('listings-edit') || 
                     document.querySelector('.edit-listing-page') ||
                     (document.querySelector('.add-listing-page') && window.location.search.includes('edit'));
  
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
  mockListingData,
};