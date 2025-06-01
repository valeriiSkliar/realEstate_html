// src/js/pages/add-listing.js - Интеграция формы добавления объявления

import {
  createForm,
  formAdapters,
  setFormLoading,
  validators,
} from "../../forms/index.js";
import { createAndShowToast as showToast } from "../../utils/uiHelpers.js";

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
  roomQuantity: [
    validators.custom((value, formData) => {
      const propertyType = formData.get("propertyType");
      // Для квартир и домов количество комнат обязательно
      if (["apartment", "house"].includes(propertyType)) {
        return value && parseInt(value) > 0;
      }
      return true;
    }, "Укажите количество комнат"),
  ],
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

  // Описание
  cleanDescription: [
    validators.minLength(50, "Описание должно содержать минимум 50 символов"),
    validators.maxLength(2000, "Описание не должно превышать 2000 символов"),
  ],
};

/**
 * Обработчик для формы добавления объявления
 */
const addListingHandler = {
  async onSubmit(data, formData) {
    try {
      // Показываем индикатор загрузки
      setFormLoading(document.getElementById("addListingForm"), true);

      // Подготавливаем данные для отправки
      const listingData = {
        ...data,
        // Обрабатываем чекбоксы удобств
        amenities: this.getSelectedAmenities(formData),
        // Обрабатываем файлы
        images: formData
          .getAll("imageUploadInput")
          .filter((file) => file.size > 0),
      };

      // Создаем FormData для отправки файлов
      const submitFormData = new FormData();

      // Добавляем основные данные
      Object.entries(listingData).forEach(([key, value]) => {
        if (key === "images") {
          // Добавляем файлы
          value.forEach((file) => submitFormData.append("images[]", file));
        } else if (Array.isArray(value)) {
          // Добавляем массивы
          value.forEach((item) => submitFormData.append(`${key}[]`, item));
        } else {
          submitFormData.append(key, value);
        }
      });

      // Отправляем данные на сервер
      const response = await fetch("/api/listings", {
        method: "POST",
        body: submitFormData,
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (errorData.errors) {
          return { errors: errorData.errors };
        }

        throw new Error(errorData.message || "Ошибка создания объявления");
      }

      const result = await response.json();

      return result;
    } catch (error) {
      console.error("Add listing error:", error);
      throw error;
    } finally {
      // Убираем индикатор загрузки
      setFormLoading(document.getElementById("addListingForm"), false);
    }
  },

  getSelectedAmenities(formData) {
    const amenities = [];
    const checkboxes = document.querySelectorAll(
      'input[type="checkbox"]:checked'
    );

    checkboxes.forEach((checkbox) => {
      if (checkbox.id.startsWith("building_")) {
        amenities.push(checkbox.id.replace("building_", ""));
      }
    });

    return amenities;
  },

  onSuccess(result) {
    showToast("Объявление успешно создано!", "success");

    // Перенаправляем на страницу просмотра объявления
    if (result.listingId) {
      setTimeout(() => {
        window.location.href = `/property/${result.listingId}`;
      }, 2000);
    } else {
      // Или на страницу "Мои объявления"
      setTimeout(() => {
        window.location.href = "/my-advertisements.html";
      }, 2000);
    }
  },

  onError(errors) {
    console.log("Listing validation errors:", errors);

    // Показываем общую ошибку если есть
    if (errors.general) {
      showToast(errors.general, "error");
    }
  },

  onServerError(errors) {
    console.log("Server errors:", errors);

    // Обрабатываем специфичные серверные ошибки
    if (errors.images) {
      showToast(`Ошибка загрузки изображений: ${errors.images}`, "error");
    }
  },
};

/**
 * Кастомный адаптер для формы добавления объявления
 */
const addListingAdapter = {
  init(form) {
    this.setupConditionalFields(form);
    this.setupImageUpload(form);
    this.setupSaveAsDraft(form);
    this.setupFieldDependencies(form);
  },

  /**
   * Настройка условных полей в зависимости от типа объекта
   */
  setupConditionalFields(form) {
    const propertyTypeSelect = form.querySelector("#propertyType");
    const roomQuantityField = form
      .querySelector("#roomQuantity")
      .closest(".form-field");
    const floorField = form.querySelector("#floor").closest(".form-field");

    const toggleFields = () => {
      const propertyType = propertyTypeSelect.value;

      // Показываем/скрываем поле "Количество комнат"
      if (["apartment", "house"].includes(propertyType)) {
        roomQuantityField.style.display = "block";
        roomQuantityField.querySelector("input").required = true;
      } else {
        roomQuantityField.style.display = "none";
        roomQuantityField.querySelector("input").required = false;
      }

      // Показываем/скрываем поле "Этаж"
      if (propertyType === "apartment") {
        floorField.style.display = "block";
        floorField.querySelector("input").required = true;
      } else {
        floorField.style.display = "none";
        floorField.querySelector("input").required = false;
      }
    };

    propertyTypeSelect.addEventListener("change", toggleFields);
    toggleFields(); // Инициализация
  },

  /**
   * Настройка загрузки изображений с предпросмотром
   */
  setupImageUpload(form) {
    const fileInput = form.querySelector("#imageUploadInput");
    const previewContainer = form.querySelector("#imagePreviews");
    const dropZone = form.querySelector(".form-file");

    // Drag & Drop
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.add("drag-over");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove("drag-over");
      });
    });

    dropZone.addEventListener("drop", (e) => {
      const files = e.dataTransfer.files;
      this.handleFiles(files, fileInput, previewContainer);
    });

    // Обычный выбор файлов
    fileInput.addEventListener("change", (e) => {
      this.handleFiles(e.target.files, fileInput, previewContainer);
    });
  },

  handleFiles(files, fileInput, previewContainer) {
    const maxFiles = 10;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    const validFiles = Array.from(files).filter((file) => {
      // Проверяем тип файла
      if (!allowedTypes.includes(file.type)) {
        showToast(`Файл ${file.name} имеет неподдерживаемый формат`, "warning");
        return false;
      }

      // Проверяем размер файла
      if (file.size > maxSize) {
        showToast(
          `Файл ${file.name} слишком большой (максимум 5MB)`,
          "warning"
        );
        return false;
      }

      return true;
    });

    // Проверяем общее количество файлов
    const currentFiles =
      previewContainer.querySelectorAll(".image-preview").length;
    if (currentFiles + validFiles.length > maxFiles) {
      showToast(`Максимальное количество изображений: ${maxFiles}`, "warning");
      return;
    }

    // Создаем превью для каждого файла
    validFiles.forEach((file, index) => {
      this.createImagePreview(file, previewContainer, index);
    });

    this.updateFileInput(fileInput, validFiles);
  },

  createImagePreview(file, container, index) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const previewElement = document.createElement("div");
      previewElement.className = "image-preview";
      previewElement.innerHTML = `
        <img src="${e.target.result}" alt="Preview ${index + 1}">
        <button type="button" class="image-preview-remove" data-index="${index}">
          <i class="bi bi-x"></i>
        </button>
        <div class="image-preview-info">
          <span class="image-preview-name">${file.name}</span>
          <span class="image-preview-size">${this.formatFileSize(
            file.size
          )}</span>
        </div>
      `;

      // Обработчик удаления изображения
      previewElement
        .querySelector(".image-preview-remove")
        .addEventListener("click", () => {
          previewElement.remove();
          this.updateFileInputAfterRemove();
        });

      container.appendChild(previewElement);
    };

    reader.readAsDataURL(file);
  },

  updateFileInput(fileInput, newFiles) {
    // Создаем новый DataTransfer для обновления файлов в input
    const dt = new DataTransfer();

    // Добавляем существующие файлы
    if (fileInput.files) {
      Array.from(fileInput.files).forEach((file) => dt.items.add(file));
    }

    // Добавляем новые файлы
    newFiles.forEach((file) => dt.items.add(file));

    fileInput.files = dt.files;
  },

  updateFileInputAfterRemove() {
    // При удалении изображения нужно обновить FileList
    // Это сложная операция, поэтому можно использовать скрытый input для хранения файлов
    console.log("Image removed, consider implementing file management");
  },

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  /**
   * Настройка сохранения как черновик
   */
  setupSaveAsDraft(form) {
    const saveButton = form.querySelector('button[type="button"]');

    saveButton.addEventListener("click", async () => {
      try {
        setFormLoading(form, true);

        const formData = new FormData(form);
        const data = {};

        // Собираем данные формы
        for (const [key, value] of formData.entries()) {
          if (key !== "imageUploadInput") {
            data[key] = value;
          }
        }

        // Отправляем как черновик
        const response = await fetch("/api/listings/draft", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          showToast("Черновик сохранен", "success");
        } else {
          throw new Error("Ошибка сохранения черновика");
        }
      } catch (error) {
        console.error("Save draft error:", error);
        showToast("Ошибка сохранения черновика", "error");
      } finally {
        setFormLoading(form, false);
      }
    });
  },

  /**
   * Настройка зависимостей между полями
   */
  setupFieldDependencies(form) {
    const localitySelect = form.querySelector("#locality");
    const districtSelect = form.querySelector("#district");

    // При изменении города обновляем список районов
    localitySelect.addEventListener("change", () => {
      this.updateDistrictOptions(localitySelect.value, districtSelect);
    });
  },

  updateDistrictOptions(locality, districtSelect) {
    // Словарь районов для каждого города
    const districtsByLocality = {
      krasnodar: [
        { value: "center", label: "Центральный" },
        { value: "karasunsky", label: "Карасунский" },
        { value: "priKubansky", label: "Прикубанский" },
        { value: "zapadny", label: "Западный" },
      ],
      sochi: [
        { value: "central", label: "Центральный" },
        { value: "khostinsky", label: "Хостинский" },
        { value: "adlersky", label: "Адлерский" },
        { value: "lazarevsky", label: "Лазаревский" },
      ],
      anapa: [
        { value: "center", label: "Центр" },
        { value: "pionersky", label: "Пионерский проспект" },
        { value: "vitjazevo", label: "Витязево" },
      ],
    };

    // Очищаем текущие опции
    districtSelect.innerHTML = '<option value="">Выберите район</option>';

    // Добавляем новые опции
    const districts = districtsByLocality[locality] || [];
    districts.forEach((district) => {
      const option = document.createElement("option");
      option.value = district.value;
      option.textContent = district.label;
      districtSelect.appendChild(option);
    });

    // Обновляем Select2 если он инициализирован
    if (window.$ && $(districtSelect).hasClass("select2-hidden-accessible")) {
      $(districtSelect).trigger("change");
    }
  },
};

/**
 * Инициализация формы добавления объявления
 */
export const initAddListingForm = () => {
  const form = document.getElementById("addListingForm");

  if (!form) {
    console.warn("Add listing form not found");
    return;
  }

  // Проверяем, не была ли форма уже инициализирована
  if (form.dataset.initialized === "true") {
    console.warn("Add listing form already initialized");
    return form.formManager;
  }

  console.log("Initializing add listing form...");

  // Создаем FormManager с нашей схемой и обработчиками
  const formManager = createForm(form, addListingSchema, {
    onSubmit: addListingHandler.onSubmit.bind(addListingHandler),
    onSuccess: addListingHandler.onSuccess,
    onError: addListingHandler.onError,
    onServerError: addListingHandler.onServerError,
    validateOnBlur: true,
    validateOnChange: false,
    scrollToError: true,
  });

  // Применяем адаптеры
  formAdapters.bootstrap.applyStyles(form);

  // Инициализируем Select2 для select элементов (временно отключено для отладки)
  // formAdapters.select2.init(form, {
  //   theme: "bootstrap-5",
  //   width: "100%",
  //   allowClear: true,
  // });
  console.log("Select2 initialization skipped for debugging");

  // Применяем кастомный адаптер
  addListingAdapter.init(form);

  // Автосохранение формы
  formAdapters.autosave.init(form, {
    interval: 30000, // Сохраняем каждые 30 секунд
    storageKey: "add_listing_draft",
    excludeFields: ["imageUploadInput"], // Не сохраняем файлы в localStorage
  });

  // Отмечаем что форма инициализирована
  form.dataset.initialized = "true";
  form.formManager = formManager;

  // Возвращаем formManager для дальнейшего использования
  return formManager;
};

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, checking for add-listing-page...");

  if (document.querySelector(".add-listing-page")) {
    console.log("Add listing page found, initializing form...");
    initAddListingForm();
  } else {
    console.log("Add listing page not found");
  }
});

export default {
  initAddListingForm,
  addListingSchema,
  addListingHandler,
  addListingAdapter,
};
