/**
 * Mobile sidebar functionality
 */
$(function () {
  // Toggle sidebar when menu button is clicked
  $(document).on('click', '#mobileSidebarToggle', function(e) {
    e.preventDefault();
    toggleSidebar();
  });
  
  // Close sidebar when close button is clicked
  $(document).on('click', '#closeSidebar', function() {
    closeSidebar();
  });
  
  // Close sidebar when overlay is clicked
  $(document).on('click', '#sidebarOverlay', function() {
    closeSidebar();
  });
  
  // Close sidebar when ESC key is pressed
  $(document).on('keydown', function(event) {
    if (event.key === 'Escape') {
      closeSidebar();
    }
  });
  
  /**
   * Toggle sidebar visibility
   */
  function toggleSidebar() {
    $('#mobileSidebar').toggleClass('show');
    $('#sidebarOverlay').toggleClass('show');
    $('body').toggleClass('sidebar-open');
  }
  
  /**
   * Close sidebar
   */
  function closeSidebar() {
    $('#mobileSidebar').removeClass('show');
    $('#sidebarOverlay').removeClass('show');
    $('body').removeClass('sidebar-open');
  }

});

/**
 * Sidebar filters
 * Reset form functionality
 */

var sidebarPreserveParams = ['search', 'sort', 'direction'];
var sidebarFilterForm = document.getElementById('sidebarFilterForm');


if (sidebarFilterForm) {
  sidebarFilterForm.addEventListener('submit', function(e) {
    Array.from(this.elements).forEach(el => {
      if (!el.value.trim()) el.disabled = true;
    });
  });
}

var resetForm = document.getElementById('resetForm');

if (resetForm) {
  resetForm.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Get current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    let resetUrl = '/';
    
    // Check if we need to preserve any parameters
    const paramsToPreserve = {};
    
    // Check if we need to preserve any parameters
    sidebarPreserveParams.forEach(param => {
      if (urlParams.has(param)) {
        paramsToPreserve[param] = urlParams.get(param);
      }
    });
    
    // Build the URL with preserved parameters
    if (Object.keys(paramsToPreserve).length > 0) {
      const preservedParams = new URLSearchParams(paramsToPreserve);
      resetUrl = '/?' + preservedParams.toString();
    }
    
    // Redirect to the reset URL
    window.location.href = resetUrl;
  });
}



/**
 * Select2 initialization for sidebar filters
 */

$(function () {
  function initializeSelect2(selector, options) {
    const minInputLength = 0;
    const defaultOptions = {
      language: {
        inputTooShort: function () {
          return `Пожалуйста, введите ещё хотя бы ${minInputLength} символа`;
        },
        noResults: function () {
          return "Совпадений не найдено";
        },
        removeAllItems: function () {
          return "Удалить все элементы";
        },
        removeItem: function () {
          return "Удалить элемент";
        },
      },
      theme: "bootstrap-5",
      allowClear: true,
      multiple: true,
      minimumInputLength: minInputLength,
      minimumResultsForSearch: 10,
      width: "100%",
    };

    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };

    // Initialize Select2
    $(selector).select2(mergedOptions);
  }

  // Initialize complex select
  initializeSelect2("#complex-select", {
    dropdownParent: $('.location-option[data-option-type="complex"]'),
  });

  // Initialize district select
  initializeSelect2("#district-select", {
    dropdownParent: $('.location-option[data-option-type="district"]'),
  });
});