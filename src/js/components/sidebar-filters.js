import { Offcanvas } from "bootstrap";
import $ from "jquery";
import "select2";

import {
  processPriceBeforeSubmit,
  setupPriceFormatting,
} from "../utils/priceFormatter";
import { updateUrlParams } from "./search-sort-button";

const initSidebarFilters = () => {
  const sidebarFilterForm = document.getElementById("sidebarFilterForm");
  const resetFormButton = document.getElementById("resetForm");
  const offcanvasEl = document.getElementById("mobileFilterSidebar");
  const priceMinSelector = '[name="price_min"]';
  const priceMaxSelector = '[name="price_max"]';

  // Проверяем существование формы перед настройкой форматирования цены
  if (sidebarFilterForm) {
    // Форматирование цены 1000000 -> 1 000 000
    setupPriceFormatting(sidebarFilterForm, priceMinSelector);
    setupPriceFormatting(sidebarFilterForm, priceMaxSelector);
  } else {
    console.warn("Форма sidebarFilterForm не найдена на странице");
  }

  if (sidebarFilterForm) {
    sidebarFilterForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(e.target);
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

      // Обработка цены 1 000 000 -> 1000000
      processPriceBeforeSubmit(formData, "price_min");
      processPriceBeforeSubmit(formData, "price_max");

      // Текущая сортировка из URL, если есть
      const urlParams = new URL(window.location).searchParams;
      const sk = urlParams.get("sort_key");
      const sd = urlParams.get("sort_direction");
      const sch = urlParams.get("search");
      if (sk) params.sort_key = sk;
      if (sd) params.sort_direction = sd;
      if (sch) params.search = sch;

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

      sidebarFilterForm
        .querySelectorAll(
          "input:not([type=checkbox]):not([type=radio]), textarea"
        )
        .forEach((el) => (el.value = ""));

      sidebarFilterForm
        .querySelectorAll("input[type=checkbox], input[type=radio]")
        .forEach((el) => (el.checked = false));

      sidebarFilterForm
        .querySelectorAll("select")
        .forEach((el) => $(el).val(null).trigger("change"));

      const sellRadio = sidebarFilterForm.querySelector(
        'input[name="deal_type"][value="sale"]'
      );
      if (sellRadio) sellRadio.checked = true;

      const propSelect = sidebarFilterForm.querySelector(
        'select[name="property_type"]'
      );
      if (propSelect) {
        $(propSelect).val(null).trigger("change");
      }

      toggleFilterVisibility();

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

  // Initialize all Select2 for sidebar filters with class select2-sidebar-filter
  const select2Class = ".select2-sidebar-filter";
  const sidebarFilters = document.querySelectorAll(select2Class);
  sidebarFilters.forEach(() => {
    initializeSelect2(select2Class);
  });

  if (offcanvasEl) {
    offcanvasEl.addEventListener("shown.bs.offcanvas", () => {
      $(window).trigger("resize.select2");
    });
  }

  // Generic filter visibility toggle based on property type
  const propertyType = document.getElementById("property_type_select");

  function toggleFilterVisibility() {
    if (!propertyType) return;

    const currentPropertyType = propertyType.value;

    // Find all elements with data-show-for-property-type attribute
    const conditionalFilters = document.querySelectorAll(
      "[data-show-for-property-type]"
    );

    conditionalFilters.forEach((filter) => {
      const showForTypes = filter.dataset.showForPropertyType;
      const allowedTypes = showForTypes
        ? showForTypes.split(",").map((type) => type.trim())
        : [];

      const shouldShow = allowedTypes.includes(currentPropertyType);

      if (shouldShow) {
        filter.classList.remove("d-none");
      } else {
        filter.classList.add("d-none");

        // Reset form fields when hiding filter
        const inputs = filter.querySelectorAll("input, select, textarea");
        inputs.forEach((input) => {
          if (input.type === "checkbox" || input.type === "radio") {
            input.checked = false;
          } else if (input.tagName === "SELECT") {
            $(input).val(null).trigger("change");
          } else {
            input.value = "";
          }
        });
      }
    });
  }

  if (propertyType) {
    // Initial visibility check
    toggleFilterVisibility();

    // Listen for changes
    propertyType.addEventListener("change", toggleFilterVisibility);
  }
};

export { initSidebarFilters };
