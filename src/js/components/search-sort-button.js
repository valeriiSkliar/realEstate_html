import { Dropdown } from "bootstrap";
import URLSearchBuilder from "../utils/URLSearchBuilder";

export function updateUrlParams(params, { force = false } = {}) {
  const urlBuilder = new URLSearchBuilder();
  if (force) {
    window.location.href = urlBuilder.reset();
    return;
  }
  window.location.href = urlBuilder.buildURL(params);
}

const initSearchSortButton = () => {
  // Инициализируем все dropdown'ы Bootstrap
  const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
  dropdownToggles.forEach((el) => new Dropdown(el));

  const sortDropdown = document.getElementById("search-sort-dropdown");
  if (!sortDropdown) return;

  const sortItems = sortDropdown.querySelectorAll(".dropdown-item");

  function collectParamsWithArrays() {
    const url = new URL(window.location);
    const params = {};
    // перебираем каждый уникальный ключ
    for (const key of url.searchParams.keys()) {
      const allValues = url.searchParams.getAll(key);
      // если значений больше одного — отдадим массив, иначе — скаляр
      params[key] = (allValues.length > 1) ? allValues : allValues[0];
    }
    return params;
  }

  sortItems.forEach((item) => {
    item.addEventListener("click", function (event) {
      event.preventDefault();
      // сбрасываем/включаем active
      sortItems.forEach((i) => i.classList.remove("active"));
      this.classList.add("active");

      const sortKey = this.dataset.sort;
      const sortDir = this.dataset.direction;

      const params = collectParamsWithArrays();
      params.sort_key = sortKey;
      params.sort_direction = sortDir;
      // Перенаправляем на новый URL
      updateUrlParams(params);
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
