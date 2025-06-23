import { createCollection } from "../../components/collections/api/collections-manager.js";
import {
  createForm,
  validators,
} from "../../forms/index.js";
import { createAndShowToast } from "../../utils/uiHelpers";

const collectionsCreateSchema = {
  name: [
    validators.required("Введите название подборки"),
    validators.minLength(3, "Название должно содержать минимум 3 символа"),
    validators.maxLength(50, "Название не должно превышать 50 символов"),
  ],
};

/**
 * Обработчик для формы добавления объявления
 */
const collectionsCreateHandler = {
  async onSubmit(data, formData) {
      // Create collection
      await createCollection(data);

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
 * Initialize collections create page functionality
 */
export const initCollectionsCreatePage = () => {
  console.log("Collections create page initialized");

  // Initialize collection save functionality
  initSaveCollection();


/**
 * Initialize collection save functionality
 */
function initSaveCollection() {
  const saveButton = document.querySelector(".js-save-collection");
  const form = document.getElementById("collectionsCreateForm");

  if (saveButton && form) {
    // Initialize form validation
    const formManager = createForm(form, collectionsCreateSchema, {
      onSubmit: collectionsCreateHandler.onSubmit.bind(collectionsCreateHandler),
      onSuccess: collectionsCreateHandler.onSuccess,
      onError: collectionsCreateHandler.onError,
      onServerError: collectionsCreateHandler.onServerError,
      validateOnBlur: true,
      validateOnChange: false,
      scrollToError: true,
    });
  }
};

};