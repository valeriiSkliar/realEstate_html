import { Offcanvas } from "bootstrap";
import $ from "jquery";
import "select2";

import { updateUrlParams } from "./search-sort-button";

const initSidebarFilters = () => {
  const sidebarFilterForm = document.getElementById("sidebarFilterForm");
  const resetFormButton = document.getElementById("resetForm");
  const offcanvasEl = document.getElementById("mobileFilterSidebar");

  if (sidebarFilterForm) {
    sidebarFilterForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(this);
      const params = {};
      formData.forEach((value, key) => {
          if (params[key]) {
            params[key] = Array.isArray(params[key])
                ? [...params[key], value]
                : [params[key], value];
          } else {
            params[key] = value;
          }
      });

      // Текущая сортировка из URL, если есть
      const urlParams = new URL(window.location).searchParams;
      const sk = urlParams.get("sort_key");
      const sd = urlParams.get("sort_direction");
      if (sk) params.sort_key = sk;
      if (sd) params.sort_direction = sd;

      // Скрываем sidebar
      const offcanvasInstance = Offcanvas.getInstance(offcanvasEl);
      if (offcanvasInstance) offcanvasInstance.hide();
      // И перенаправляем с новыми параметрами
      updateUrlParams(params);
    });
  }

  if (resetFormButton) {
    resetFormButton.addEventListener("click", function (e) {
      e.preventDefault();
      sidebarFilterForm.reset();
      $("#district-select").val(null).trigger("change");
      $("#complex-select").val(null).trigger("change");
      $("#rooms-number-select").val(null).trigger("change");
      console.log("Filters cleared");
    });
  }

  // Select2…
  function initializeSelect2(selector, placeholderText) {
    $(selector).select2({
      language: {
        inputTooShort: () => `Пожалуйста, введите ещё хотя бы 1 символ`,
        noResults: () => "Совпадений не найдено",
        searching: () => "Поиск...",
      },
      theme: "bootstrap-5",
      allowClear: true,
      multiple: true,
      placeholder: placeholderText,
      minimumResultsForSearch: 7,
      width: "100%",
      dropdownParent: $("#mobileFilterSidebar"),
    });
  }

  initializeSelect2("#district-select", "Выберите район(ы)");
  initializeSelect2("#complex-select", "Выберите ЖК");
  initializeSelect2("#rooms-number-select", "Выберите количество комнат");

  if (offcanvasEl) {
    offcanvasEl.addEventListener("shown.bs.offcanvas", () => {
      $(window).trigger("resize.select2");
    });
  }
};

export { initSidebarFilters };
