import {
  updateCollection
} from "../../components/collections/api/collections-manager.js";

import { createForm, validators } from "../../forms/index.js";

import { createAndShowToast } from "../../utils/uiHelpers";

const collectionsEditSchema = {
  name: [
    validators.required("Введите название подборки"),
    validators.minLength(3, "Название должно содержать минимум 3 символа"),
    validators.maxLength(50, "Название не должно превышать 50 символов"),
  ],
};

const collectionsEditHandler = {
  async onSubmit(data, formData) {
    const apiUrl = document.querySelector("#saveCollectionChanges").getAttribute("data-api-url");

    if (!apiUrl) {
      console.error("No apiUrl");
      return {
        errors: "Не удалось обновить подборку"
      };
    }

        // Update collection
        try {
          const collection = await updateCollection(apiUrl, data);
          return collection;
        } catch (error) {
          throw new Error("Не удалось обновить подборку");
        }
  },

  onSuccess(collection) {
    createAndShowToast("Коллекция успешно обновлена!", "success");

    const successUrlRedirect = document.querySelector("#saveCollectionChanges").getAttribute("data-success-url-redirect");

    if (successUrlRedirect) {
      setTimeout(() => {
        window.location.href = successUrlRedirect;
      }, 500);
    } else {
      console.error("No successUrlRedirect");
    }
  },

  onError(errors) {
    console.log("⚠️ Ошибки валидации:", errors);
    const firstErrorField = Object.keys(errors)[0];
    if (firstErrorField) {
      const field = document.querySelector(`[name="${firstErrorField}"]`);
      if (field) {
        field.focus();
        field.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    createAndShowToast("Проверьте заполнение полей", "warning");
  },

  onServerError(errors) {
    console.log("💥 Серверные ошибки:", errors);
    createAndShowToast("Ошибка сервера", "danger");
  },
};

/**
 * Initialize collections edit page functionality
 */
export const initCollectionsEditPage = () => {
  console.log("Collections edit page initialized");

  const form = document.querySelector("#collectionId");
  
  const formManager = createForm(form, collectionsEditSchema, {
    onSubmit: collectionsEditHandler.onSubmit.bind(collectionsEditHandler),
    onSuccess: collectionsEditHandler.onSuccess,
    onError: collectionsEditHandler.onError,
    onServerError: collectionsEditHandler.onServerError,
    validateOnBlur: true,
    validateOnChange: false,
    scrollToError: true,
  });

  formManager.init();

};
