// src/js/pages/search.js - Скрипты для страницы поиска
import "../../scss/pages/_search.scss";
import { initSearchSortButton, initSidebarFilters } from "../components";
import { createAndShowToast } from "../utils/uiHelpers";

export const initSearchPage = () => {
  const propertyType = document.querySelector("#property_type_select");
  const propertyRooms = document.querySelector("#property-rooms");

  function toggleRoomsVisibility() {
    propertyRooms.classList.toggle(
      "d-none",
      !["apartment"].includes(propertyType.value)
    );
  }

  if (propertyType && propertyRooms) {
    toggleRoomsVisibility();

    propertyType.addEventListener("change", toggleRoomsVisibility);
  }

  // Инициализация функциональности кнопки очистки поиска
  const searchInput = document.querySelector(".search-input");
  const clearBtn = document.querySelector(".search-clear-btn");

  if (searchInput && clearBtn) {
    // Функция для отображения/скрытия кнопки очистки
    function toggleClearButton() {
      if (searchInput.value.trim().length > 0) {
        clearBtn.classList.add("show");
      } else {
        clearBtn.classList.remove("show");
      }
    }

    // Проверка при загрузке страницы
    toggleClearButton();

    // Обработчики событий для поля поиска
    searchInput.addEventListener("input", toggleClearButton);
    searchInput.addEventListener("keyup", toggleClearButton);
    searchInput.addEventListener("paste", () => {
      // Небольшая задержка для обработки paste
      setTimeout(toggleClearButton, 10);
    });

    // Обработчик клика по кнопке очистки
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      toggleClearButton();
      searchInput.focus();
    });
  }

  if (document.querySelector("#search-sort-dropdown")) {
    initSearchSortButton();
  }

  initSidebarFilters();

  // Инициализация кнопки тестирования toast
  const testToastBtn = document.querySelector("#testToastBtn");
  if (testToastBtn) {
    let toastCounter = 0;
    const toastTypes = ["success", "error", "warning", "info"];
    const toastMessages = [
      "Успешное выполнение операции!",
      "Произошла ошибка при выполнении",
      "Внимание! Проверьте введенные данные",
      "Информационное сообщение",
    ];

    testToastBtn.addEventListener("click", () => {
      const typeIndex = toastCounter % toastTypes.length;
      createAndShowToast(toastMessages[typeIndex], toastTypes[typeIndex], 3000);
      toastCounter++;
    });
  }
};

initSearchPage();
