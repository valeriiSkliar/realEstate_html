import {
  getCollectionById,
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
    console.log("📝 Отправка формы...", data);
    console.log("📝 Отправка формы...", formData);

    // Get collection ID
    const collectionId = document.getElementById("collectionId").value;

    if (!collectionId) {
      createAndShowToast("Не удалось обновить подборку", "error");
      return;
    }

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        // Update collection
        try {
          reject({
            name: "Не удалось обновить подборку",
          });
          const collection = await updateCollection(collectionId, data);
          resolve(collection);
        } catch (error) {
          reject({
            name: "Не удалось обновить подборку",
          });
        }
      }, 1000);
    });
  },

  onSuccess(collection) {
    console.log("🎉 Успех!", collection);
    createAndShowToast("Коллекция успешно обновлена!", "success");

    setTimeout(() => {
      window.location.href = "/collection.html?id=" + collection.id;
    }, 500);
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

  // Get collection ID from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const collectionId = urlParams.get("id");

  if (!collectionId) {
    // No collection ID provided, redirect to collections page
    window.location.href = "/collections.html";
    return;
  }

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

  // Store collection ID in hidden field
  document.getElementById("collectionId").value = collectionId;

  // Load collection data
  loadCollectionData(collectionId);

  /**
   * Load collection data
   * @param {string} collectionId - ID of the collection to load
   */
  async function loadCollectionData(collectionId) {
    const collection = await getCollectionById(collectionId);

    if (!collection) {
      // Collection not found, redirect to collections page
      createAndShowToast("Collection not found", "error");
      window.location.href = "/collections.html";
      return;
    }

    form[0].value = collection.name;
    form[1].value = collection.notes;
  }
};
