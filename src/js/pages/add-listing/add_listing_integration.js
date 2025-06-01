// Упрощенная версия add_listing_integration.js без Select2
import {
  createAndShowToast,
  createForm,
  validators,
} from "../../forms/index.js";

/**
 * Схема валидации для формы добавления объявления
 */
const addListingSchema = {
  // Основная информация
  propertyType: [validators.required("Выберите тип объекта")],
  tradeType: [validators.required("Выберите тип сделки")],
  propertyName: [
    validators.required("Введите заголовок объявления"),
    validators.minLength(10, "Заголовок должен содержать минимум 10 символов"),
    validators.maxLength(100, "Заголовок не должен превышать 100 символов"),
  ],

  // Местоположение
  locality: [validators.required("Выберите населенный пункт")],
  address: [
    validators.required("Введите адрес объекта"),
    validators.minLength(5, "Адрес слишком короткий"),
  ],

  // Характеристики
  propertyArea: [
    validators.required("Укажите площадь объекта"),
    validators.min(1, "Площадь должна быть больше 0"),
    validators.max(10000, "Площадь не может превышать 10,000 м²"),
  ],
  // roomQuantity: [
  //   validators.custom((value, formData) => {
  //     const propertyType = formData.get("propertyType");
  //     // Для квартир и домов количество комнат обязательно
  //     if (["apartment", "house"].includes(propertyType)) {
  //       return value && parseInt(value) > 0;
  //     }
  //     return true;
  //   }, "Укажите количество комнат"),
  // ],
  floor: [
    validators.custom((value, formData) => {
      const propertyType = formData.get("propertyType");
      // Для квартир этаж обязателен
      if (propertyType === "apartment" && (!value || parseInt(value) < 1)) {
        return false;
      }
      return true;
    }, "Укажите этаж для квартиры"),
  ],

  // Цена
  price: [
    validators.required("Укажите цену"),
    validators.min(1, "Цена должна быть больше 0"),
    validators.max(1000000000, "Цена слишком высокая"),
  ],

  // Описание (не обязательное, но если заполнено - проверяем длину)
  cleanDescription: [
    validators.custom((value) => {
      if (!value || value.trim() === "") return true; // Пустое описание разрешено
      return value.length >= 50;
    }, "Описание должно содержать минимум 50 символов"),
    validators.maxLength(2000, "Описание не должно превышать 2000 символов"),
  ],
};

/**
 * Обработчик для формы добавления объявления
 */
const addListingHandler = {
  async onSubmit(data, formData) {
    try {
      console.log("📝 Отправка формы...", data);

      // Имитируем отправку на сервер
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log("✅ Форма успешно отправлена");
          resolve({ success: true, listingId: 123 });
        }, 1000);
      });
    } catch (error) {
      console.error("❌ Ошибка отправки:", error);
      throw error;
    }
  },

  onSuccess(result) {
    console.log("🎉 Успех!", result);
    createAndShowToast("Объявление успешно создано!", "success");
  },

  onError(errors) {
    console.log("⚠️ Ошибки валидации:", errors);
    createAndShowToast("Проверьте заполнение полей", "warning");
  },

  onServerError(errors) {
    console.log("💥 Серверные ошибки:", errors);
    createAndShowToast("Ошибка сервера", "danger");
  },
};

/**
 * Настройка условных полей
 */
function setupConditionalFields(form) {
  const propertyTypeSelect = form.querySelector("#propertyType");
  const roomQuantityField = form.querySelector("#roomQuantity");
  const floorField = form.querySelector("#floor");

  if (!propertyTypeSelect) {
    console.warn("Поле propertyType не найдено");
    return;
  }

  const roomQuantityContainer = roomQuantityField?.closest(".form-field");
  const floorContainer = floorField?.closest(".form-field");

  const toggleFields = () => {
    const propertyType = propertyTypeSelect.value;

    // Поле "Количество комнат"
    if (roomQuantityContainer) {
      if (["apartment", "house"].includes(propertyType)) {
        roomQuantityContainer.style.display = "block";
        if (roomQuantityField) roomQuantityField.required = true;
      } else {
        roomQuantityContainer.style.display = "none";
        if (roomQuantityField) {
          roomQuantityField.required = false;
          roomQuantityField.value = "";
        }
      }
    }

    // Поле "Этаж"
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
  toggleFields(); // Инициализация
}

/**
 * Настройка превью файлов
 */
function setupFileUpload(form) {
  const fileInput = form.querySelector("#imageUploadInput");
  const previewContainer = form.querySelector("#imagePreviews");

  if (!fileInput || !previewContainer) {
    console.warn("Элементы для загрузки файлов не найдены");
    return;
  }

  fileInput.addEventListener("change", (e) => {
    const files = e.target.files;
    previewContainer.innerHTML = "";

    if (files.length === 0) return;

    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = document.createElement("div");
          preview.className = "image-preview d-inline-block me-2 mb-2";
          preview.innerHTML = `
            <img src="${e.target.result}" 
                 style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;">
            <small class="d-block text-muted text-center mt-1" style="font-size: 10px;">
              ${
                file.name.length > 15
                  ? file.name.substring(0, 12) + "..."
                  : file.name
              }
            </small>
          `;
          previewContainer.appendChild(preview);
        };
        reader.readAsDataURL(file);
      }
    });
  });
}

/**
 * Инициализация формы добавления объявления
 */
export const initAddListingForm = () => {
  const form = document.getElementById("addListingForm");

  if (!form) {
    console.warn("❌ Add listing form not found");
    return null;
  }

  // Проверяем, не была ли форма уже инициализирована
  if (form.dataset.initialized === "true") {
    console.warn("⚠️ Add listing form already initialized");
    return form.formManager;
  }

  console.log("🚀 Initializing add listing form...");

  try {
    // Создаем FormManager
    const formManager = createForm(form, addListingSchema, {
      onSubmit: addListingHandler.onSubmit.bind(addListingHandler),
      onSuccess: addListingHandler.onSuccess,
      onError: addListingHandler.onError,
      onServerError: addListingHandler.onServerError,
      validateOnBlur: true,
      validateOnChange: false,
      scrollToError: true,
    });

    // Настраиваем дополнительную логику
    setupConditionalFields(form);
    setupFileUpload(form);

    // Отмечаем что форма инициализирована
    form.dataset.initialized = "true";
    form.formManager = formManager;

    console.log("✅ Add listing form initialized successfully");
    return formManager;
  } catch (error) {
    console.error("❌ Error initializing form:", error);
    return null;
  }
};

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  console.log("📄 DOM loaded, checking for add-listing-page...");

  if (document.querySelector(".add-listing-page")) {
    console.log("🏠 Add listing page found, initializing form...");
    setTimeout(() => {
      initAddListingForm();
    }, 100);
  } else {
    console.log("🔍 Add listing page not found");
  }
});

export default {
  initAddListingForm,
  addListingSchema,
  addListingHandler,
};
