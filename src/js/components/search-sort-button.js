import { Dropdown } from "bootstrap";

export function updateUrlParams(params) {
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  });
  window.location.href = url.toString();
}

const initSearchSortButton = () => {
  // Инициализируем все dropdown'ы Bootstrap
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
  dropdownToggles.forEach((el) => new Dropdown(el));

  const sortDropdown = document.getElementById("search-sort-dropdown");
  if (!sortDropdown) return;

  const sortItems = sortDropdown.querySelectorAll(".dropdown-item");

  sortItems.forEach((item) => {
    item.addEventListener("click", function (event) {
      event.preventDefault();
      // сбрасываем/включаем active
      sortItems.forEach((i) => i.classList.remove("active"));
      this.classList.add("active");

      const sortKey = this.dataset.sort;
      const sortDir = this.dataset.direction;

      // Читаем все текущие GET-параметры (включая фильтры)
      const currentParams = Object.fromEntries(
          new URL(window.location).searchParams.entries()
      );
      // Перезаписываем только сортировку
      currentParams.sort_key = sortKey;
      currentParams.sort_direction = sortDir;
      // Перенаправляем на новый URL
      updateUrlParams(currentParams);
    });
  });
};

export { initSearchSortButton };
