import { Offcanvas } from "bootstrap";
import $ from "jquery";
import "select2";
const initSidebarFilters = () => {
  // Sidebar form reset logic
  var sidebarPreserveParams = ["search", "sort", "direction"]; // Parameters to keep on reset
  var sidebarFilterForm = document.getElementById("sidebarFilterForm");

  if (sidebarFilterForm) {
    sidebarFilterForm.addEventListener("submit", function (e) {
      // Optional: Disable empty fields before submission if desired
      // Array.from(this.elements).forEach(el => {
      //   if (el.value !== undefined && el.value.trim() === '' && el.type !== 'radio' && el.type !== 'checkbox') {
      //       el.disabled = true;
      //   }
      // });
      // For demo, we prevent actual submission
      e.preventDefault();
      console.log("Filter form submitted (demo - no actual submission)");
      // Hide sidebar after "applying" filters
      var offcanvasElement = document.getElementById("mobileFilterSidebar");
      var offcanvasInstance = Offcanvas.getInstance(offcanvasElement);
      if (offcanvasInstance) {
        offcanvasInstance.hide();
      }
    });
  }

  var resetFormButton = document.getElementById("resetForm");
  if (resetFormButton) {
    resetFormButton.addEventListener("click", function (e) {
      e.preventDefault();

      if (sidebarFilterForm) {
        sidebarFilterForm.reset(); // Reset the form fields
        // Reset Select2 fields
        $("#district-select").val(null).trigger("change");
        $("#complex-select").val(null).trigger("change");
        // Re-enable any potentially disabled fields (if you disable them on submit)
        // Array.from(sidebarFilterForm.elements).forEach(el => el.disabled = false);
      }
      console.log("Filters cleared");

      // Optionally, you might want to auto-submit or redirect after clearing
      // For demo, we just log it.
      // To redirect while preserving some params:
      /*
      const urlParams = new URLSearchParams(window.location.search);
      let resetUrl = window.location.pathname; // Keep current path
      const paramsToPreserve = {};
      sidebarPreserveParams.forEach(param => {
        if (urlParams.has(param)) {
          paramsToPreserve[param] = urlParams.get(param);
        }
      });
      if (Object.keys(paramsToPreserve).length > 0) {
        const preservedParams = new URLSearchParams(paramsToPreserve);
        resetUrl += '?' + preservedParams.toString();
      }
      // window.location.href = resetUrl;
      */
    });
  }

  // Select2 initialization
  function initializeSelect2(selector, placeholderText) {
    $(selector).select2({
      language: {
        inputTooShort: function () {
          return `Пожалуйста, введите ещё хотя бы 1 символ`;
        },
        noResults: function () {
          return "Совпадений не найдено";
        },
        searching: function () {
          return "Поиск...";
        },
      },
      theme: "bootstrap-5",
      allowClear: true,
      multiple: true,
      placeholder: placeholderText,
      minimumInputLength: 0, // Adjust if you want users to type before seeing results
      minimumResultsForSearch: 7, // Show search box if more than 7 options
      width: "100%",
      dropdownParent: $("#mobileFilterSidebar"), // Attach dropdown to the offcanvas body
    });
  }

  initializeSelect2("#district-select", "Выберите район(ы)");
  initializeSelect2("#complex-select", "Выберите ЖК");
  initializeSelect2("#rooms-number-select", "Выберите количество комнат");

  // Ensure Select2 dropdowns are correctly positioned when sidebar opens
  var mobileSidebarElement = document.getElementById("mobileFilterSidebar");
  if (mobileSidebarElement) {
    mobileSidebarElement.addEventListener("shown.bs.offcanvas", function () {
      // May need to re-trigger layout for Select2 if it doesn't position correctly
      $(window).trigger("resize.select2");
    });
  }
};

export { initSidebarFilters };
