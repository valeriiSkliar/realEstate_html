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

      // Toggle rooms visibility based on property type
  const propertyType = document.getElementById("property_type_select");
  const propertyRooms = document.getElementById("property-rooms");
  
  function toggleRoomsVisibility() {
    propertyRooms.classList.toggle("d-none", !["apartment"].includes(propertyType.value));
  }

  if (propertyType && propertyRooms) {
    // Initial visibility check
    toggleRoomsVisibility();
    
    // Listen for changes
    propertyType.addEventListener("change", toggleRoomsVisibility);
    
  }

  // Toggle square units according to property type
  const areaFilter = document.getElementById("area-filter");
  const landAreaFilter = document.getElementById("land-area-filter");
  const landTypes = ["other", "land"];
  function toggleAreaUnits() {
    if (landTypes.includes(propertyType.value)) {
      // hide area filter
      areaFilter.classList.add("d-none");
      // Reset area filter
      areaFilter.querySelector("input[name='area_min']").value = "";
      areaFilter.querySelector("input[name='area_max']").value = "";
      // show land area filter
      landAreaFilter.classList.remove("d-none");
    } else {
      // Reset land area filter and hide it
      landAreaFilter.classList.add("d-none");
      landAreaFilter.querySelector("input[name='land_area_min']").value = "";
      landAreaFilter.querySelector("input[name='land_area_max']").value = "";

      // show area filter
      areaFilter.classList.remove("d-none");
    }
  }

  if (propertyType && areaFilter && landAreaFilter) {
    toggleAreaUnits();
    propertyType.addEventListener("change", toggleAreaUnits);
  }
};

export { initSidebarFilters };
