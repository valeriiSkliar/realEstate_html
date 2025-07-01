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
  const { action, id, archiveHref, deleteHref, restoreHref, editHref } =
    event.detail;
  console.log(`Listing action: ${action} for ID: ${id}`);

  switch (action) {
    case "edit":
      handleEditListing(id, editHref);
      break;
    case "delete":
      handleDeleteListing(id, deleteHref);
      break;
    case "archive":
      handleArchiveListing(id, archiveHref);
      break;
    case "restore":
      handleRestoreListing(id, restoreHref);
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
function handleEditListing(id, editHref) {
  // Переход на страницу редактирования
  window.location.href = editHref;
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
function handleDeleteListing(id, deleteHref) {
  if (deleteHref) {
    if (
      confirm(
        "Вы уверены, что хотите удалить это объявление? Это действие нельзя отменить."
      )
    ) {
      window.location.href = deleteHref;
    }
  } else {
    console.warn("Delete href not provided for listing:", id);
  }
}

/**
 * Архивирование объявления
 */
function handleArchiveListing(id, archiveHref) {
  if (archiveHref) {
    if (confirm("Вы уверены, что хотите архивировать это объявление?")) {
      window.location.href = archiveHref;
    }
  } else {
    console.warn("Archive href not provided for listing:", id);
  }
}

/**
 * Восстановление объявления из архива
 */
function handleRestoreListing(id, restoreHref) {
  if (
    confirm("Вы уверены, что хотите восстановить это объявление из архива?")
  ) {
    // Здесь можно добавить логику восстановления или перенаправление
    window.location.href = restoreHref;
    console.log(`Restore listing ${id}`);
  } else {
    console.warn("Restore href not provided for listing:", id);
  }
}

/**
 * Активация черновика объявления
 */
function handleActivateListing(id) {
  if (confirm("Вы уверены, что хотите активировать этот черновик?")) {
    // Здесь можно добавить логику активации или перенаправление
    console.log(`Activate listing ${id}`);
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

      const href = button.dataset.href;
      if (href) {
        window.location.href = href;
      }
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
