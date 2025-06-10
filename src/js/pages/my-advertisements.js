import { createAndShowToast } from "../utils/uiHelpers";

document.addEventListener("DOMContentLoaded", function () {
  // Специфическая логика для страницы моих объявлений
  if (
    document.querySelector(".my-advertisements-page") ||
    document.querySelector(".my-listings-page")
  ) {
    console.log("My advertisements page loaded");

    // Инициализация обработчиков событий
    initMyAdvertisementsHandlers();
  }
});

/**
 * Инициализация обработчиков событий для страницы объявлений
 */
function initMyAdvertisementsHandlers() {
  // Обработчик для событий от карточек объявлений
  document.body.addEventListener("listingAction", handleListingAction);

  // Обработчик для кнопок сортировки
  initSortButtons();

  console.log("My advertisements handlers initialized");
}

/**
 * Обработчик основных действий с объявлениями
 */
function handleListingAction(event) {
  const { action, id } = event.detail;
  console.log(`Listing action: ${action} for ID: ${id}`);

  switch (action) {
    case "edit":
      handleEditListing(id);
      break;
    case "delete":
      handleDeleteListing(id);
      break;
    case "archive":
      handleArchiveListing(id);
      break;
    case "restore":
      handleRestoreListing(id);
      break;
    case "activate":
      handleActivateListing(id);
      break;
    case "view":
      handleViewListing(id);
      break;
    default:
      console.warn(`Unknown action: ${action}`);
  }
}

/**
 * Переход к редактированию объявления
 */
function handleEditListing(id) {
  // Переход на страницу редактирования
  window.location.href = `/listings-edit.html?id=${id}`;
}

/**
 * Просмотр объявления
 */
function handleViewListing(id) {
  // Переход на страницу просмотра объявления
  window.location.href = `../previews/property-view-standalone.html?id=${id}`;
}

/**
 * Удаление объявления
 */
function handleDeleteListing(id) {
  if (
    confirm(
      "Вы уверены, что хотите удалить это объявление? Действие нельзя отменить."
    )
  ) {
    // Показываем загрузку
    createAndShowToast("Удаление объявления...", "info");

    // Имитация API запроса
    setTimeout(() => {
      try {
        // Здесь будет реальный API запрос
        // await deleteListingAPI(id);

        // Удаляем карточку из DOM
        const listingCard = document.querySelector(
          `my-property-card[listing-id="${id}"]`
        );
        if (listingCard) {
          listingCard.remove();
          createAndShowToast("Объявление успешно удалено", "success");
        } else {
          createAndShowToast("Объявление не найдено", "error");
        }
      } catch (error) {
        console.error("Error deleting listing:", error);
        createAndShowToast("Ошибка при удалении объявления", "error");
      }
    }, 1000);
  }
}

/**
 * Архивирование объявления
 */
function handleArchiveListing(id) {
  if (confirm("Вы уверены, что хотите архивировать это объявление?")) {
    createAndShowToast("Архивирование объявления...", "info");

    setTimeout(() => {
      try {
        // Здесь будет реальный API запрос
        // await archiveListingAPI(id);

        // Обновляем статус карточки
        const listingCard = document.querySelector(
          `my-property-card[listing-id="${id}"]`
        );
        if (listingCard) {
          listingCard.setAttribute("status", "archived");
          createAndShowToast("Объявление перемещено в архив", "success");
        } else {
          createAndShowToast("Объявление не найдено", "error");
        }
      } catch (error) {
        console.error("Error archiving listing:", error);
        createAndShowToast("Ошибка при архивировании объявления", "error");
      }
    }, 1000);
  }
}

/**
 * Восстановление объявления из архива
 */
function handleRestoreListing(id) {
  if (
    confirm("Вы уверены, что хотите восстановить это объявление из архива?")
  ) {
    createAndShowToast("Восстановление объявления...", "info");

    setTimeout(() => {
      try {
        // Здесь будет реальный API запрос
        // await restoreListingAPI(id);

        // Обновляем статус карточки
        const listingCard = document.querySelector(
          `my-property-card[listing-id="${id}"]`
        );
        if (listingCard) {
          listingCard.setAttribute("status", "active");
          createAndShowToast("Объявление восстановлено", "success");
        } else {
          createAndShowToast("Объявление не найдено", "error");
        }
      } catch (error) {
        console.error("Error restoring listing:", error);
        createAndShowToast("Ошибка при восстановлении объявления", "error");
      }
    }, 1000);
  }
}

/**
 * Активация черновика объявления
 */
function handleActivateListing(id) {
  if (confirm("Вы уверены, что хотите активировать этот черновик?")) {
    createAndShowToast("Активация объявления...", "info");

    setTimeout(() => {
      try {
        // Здесь будет реальный API запрос
        // await activateListingAPI(id);

        // Обновляем статус карточки
        const listingCard = document.querySelector(
          `my-property-card[listing-id="${id}"]`
        );
        if (listingCard) {
          listingCard.setAttribute("status", "active");
          createAndShowToast("Объявление активировано", "success");
        } else {
          createAndShowToast("Объявление не найдено", "error");
        }
      } catch (error) {
        console.error("Error activating listing:", error);
        createAndShowToast("Ошибка при активации объявления", "error");
      }
    }, 1000);
  }
}

/**
 * Инициализация кнопок сортировки
 */
function initSortButtons() {
  const sortButtons = document.querySelectorAll(".my-listings-sort-group .btn");

  sortButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      // Убираем активный класс со всех кнопок
      sortButtons.forEach((btn) => btn.classList.remove("active"));

      // Добавляем активный класс к нажатой кнопке
      button.classList.add("active");

      // Определяем тип сортировки по иконке
      const icon = button.querySelector("span");
      let sortType = "date"; // по умолчанию

      if (icon && icon.dataset.sortType) {
        sortType = icon.dataset.sortType;
      }

      console.log(`Sorting by: ${sortType}`);
      createAndShowToast(`Сортировка по ${getSortTypeName(sortType)}`, "info");

      // Здесь можно добавить логику сортировки карточек
      // sortListings(sortType);
    });
  });
}

/**
 * Получение названия типа сортировки
 */
function getSortTypeName(sortType) {
  const names = {
    date: "дате",
    price: "цене",
    status: "статусу",
  };
  return names[sortType] || "дате";
}

/**
 * Показ уведомлений пользователю
 */
function showNotification(message, type = "info") {
  // Создаем контейнер для уведомлений если его нет
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className =
      "toast-container position-fixed bottom-0 end-0 p-3";
    document.body.appendChild(toastContainer);
  }

  // Создаем уведомление
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${getBootstrapColor(
    type
  )} border-0`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  toastContainer.appendChild(toast);

  // Инициализируем и показываем toast
  const bsToast = new bootstrap.Toast(toast, {
    autohide: true,
    delay: 3000,
  });
  bsToast.show();

  // Удаляем toast после скрытия
  toast.addEventListener("hidden.bs.toast", () => {
    toast.remove();
  });
}

/**
 * Преобразование типа уведомления в Bootstrap цвет
 */
function getBootstrapColor(type) {
  const colors = {
    success: "success",
    error: "danger",
    warning: "warning",
    info: "info",
  };
  return colors[type] || "info";
}
