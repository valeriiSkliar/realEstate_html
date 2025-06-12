import { Dropdown } from "bootstrap";

export function updateUrlParams(params, { force = false } = {}) {
  const url = new URL(window.location.href);

  if (force) {
    url.search = "";
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined || value === "") {
      url.searchParams.delete(key);
    } else if (Array.isArray(value)) {
      url.searchParams.delete(key);
      value.forEach(v => url.searchParams.append(key, v));
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

  const searchForm = document.querySelector(".search-bar-brand");
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const input = this.querySelector('input[name="search"]');
      const value = input.value.trim();

      // собираем все текущие GET-параметры
      const params = Object.fromEntries(
          new URL(window.location).searchParams.entries()
      );
      // обновляем или удаляем параметр search
      (value) ? params.search = value : delete params.search;
      // перенаправляем на новый URL
      updateUrlParams(params);
    });
  }
};

export { initSearchSortButton };
