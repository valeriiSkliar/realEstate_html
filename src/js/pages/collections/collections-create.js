import { createCollection } from "../../components/collections/api/collections-manager.js";
import {
  createForm,
  validators,
} from "../../forms/index.js";
import { createAndShowToast } from "../../utils/uiHelpers";

const collectionsCreateSchema = {
  collectionName: [
    validators.required("Введите название коллекции"),
    validators.minLength(3, "Название должно содержать минимум 3 символа"),
    validators.maxLength(50, "Название не должно превышать 50 символов"),
  ],
};

/**
 * Обработчик для формы добавления объявления
 */
const collectionsCreateHandler = {
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
    window.location.href = "/collections.html";
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

};

/**
 * Initialize collection save functionality
 */
const initSaveCollection = () => {
  const saveButton = document.querySelector(".js-save-collection");
  const form = document.getElementById("clientInfoForm");
console.log(form);

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

    saveButton.addEventListener("click", async (e) => {
      formManager.handleSubmit(e);
      const isValid = formManager.isValid();
      if (!isValid) return;

      // Get selected properties
      const selectedProperties = [];
      document
        .querySelectorAll(".property-checkbox:checked")
        .forEach((checkbox) => {
          selectedProperties.push(checkbox.getAttribute("data-property-id"));
        });

      // Add pending property if exists
      const clientInfoForm = document.getElementById("clientInfoForm");
      const pendingPropertyId = clientInfoForm?.getAttribute(
        "data-pending-property-id"
      );

      if (
        pendingPropertyId &&
        !selectedProperties.includes(pendingPropertyId)
      ) {
        selectedProperties.push(pendingPropertyId);
      }

      // Get form data
      const collectionName = document.getElementById("collectionName")?.value.trim() || "";
      
      // Get other collection data
      const collectionNotes =
        document.getElementById("collectionNotes")?.value.trim() || "";


      // Create collection object
      const collectionData = {
        name: collectionName,
        description: collectionNotes,
      };

      // Create collection
      const collectionId = createCollection(collectionData);

      if (collectionId) {
        // Set view collection link
        const viewCollectionLink = document.querySelector(
          ".js-view-collection"
        );
        if (viewCollectionLink) {
          viewCollectionLink.href = `/collections-edit.html?id=${collectionId}`;
        }

      } else {
        // Show error message
        createAndShowToast("Failed to create collection", "error");
      }
    });
  }
};
