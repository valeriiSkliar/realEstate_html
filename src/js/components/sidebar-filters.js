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
          .querySelectorAll('input:not([type=checkbox]):not([type=radio]), textarea')
          .forEach(el => el.value = '');

      sidebarFilterForm
          .querySelectorAll('input[type=checkbox], input[type=radio]')
          .forEach(el => el.checked = false);

      sidebarFilterForm
          .querySelectorAll('select')
          .forEach(el => $(el).val(null).trigger('change'));

      const sellRadio = sidebarFilterForm.querySelector('input[name="deal_type"][value="sale"]');
      if (sellRadio) sellRadio.checked = true;

      const propSelect = sidebarFilterForm.querySelector('select[name="property_type"]');
      if (propSelect) {
        $(propSelect).val('apartment').trigger('change');
      }

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

  // Generic filter visibility toggle based on property type
  const propertyType = document.getElementById("property_type_select");
  
  function toggleFilterVisibility() {
    if (!propertyType) return;
    
    const currentPropertyType = propertyType.value;
    
    // Find all elements with data-show-for-property-type attribute
    const conditionalFilters = document.querySelectorAll("[data-show-for-property-type]");
    
    conditionalFilters.forEach(filter => {
      const showForTypes = filter.dataset.showForPropertyType;
      const allowedTypes = showForTypes ? showForTypes.split(",").map(type => type.trim()) : [];
      
      const shouldShow = allowedTypes.includes(currentPropertyType);
      
      if (shouldShow) {
        filter.classList.remove("d-none");
      } else {
        filter.classList.add("d-none");
        
        // Reset form fields when hiding filter
        const inputs = filter.querySelectorAll("input, select, textarea");
        inputs.forEach(input => {
          if (input.type === "checkbox" || input.type === "radio") {
            input.checked = false;
          } else if (input.tagName === "SELECT") {
            $(input).val(null).trigger('change');
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
