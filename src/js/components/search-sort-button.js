import { Dropdown } from "bootstrap";
import $ from "jquery";

// JavaScript to initialize Bootstrap dropdowns and handle state
const initSearchSortButton = () => {
  // Initialize all dropdowns on the page
  var dropdownElementList = [].slice.call(
    document.querySelectorAll(".dropdown-toggle")
  );
  var dropdownList = dropdownElementList.map(function (dropdownToggleEl) {
    return new Dropdown(dropdownToggleEl);
  });

  // Optional: Handle sort selection and update button/icon accordingly
  const sortDropdown = document.getElementById("search-sort-dropdown");
  if (sortDropdown) {
    const sortItems = sortDropdown.querySelectorAll(".dropdown-item");
    const sortButtonIcon = sortDropdown.querySelector(".sort-icon");

    sortItems.forEach((item) => {
      item.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default link behavior

        // Remove active class from all items
        sortItems.forEach((i) => i.classList.remove("active"));
        // Add active class to the clicked item
        this.classList.add("active");

        const sortType = this.dataset.sort;
        const sortDirection = this.dataset.direction;

        console.log("Sorting by:", sortType, "Direction:", sortDirection);

        // Example: Update icon based on direction (optional)
        // You might want a more sophisticated way to manage the icon state
        if (sortButtonIcon) {
          if (sortDirection === "asc") {
            // Update SVG or class for ascending icon
            // e.g., sortButtonIcon.innerHTML = '<path d="m3 8 4-4 4 4"/><path d="M7 4v16"/>';
            // For the provided icon, you might need two SVGs or manipulate paths
            console.log("Set to ASC icon");
          } else {
            // Update SVG or class for descending icon
            // e.g., sortButtonIcon.innerHTML =  '<path d="m3 16 4 4 4-4"/><path d="M7 20V4"/>';
            console.log("Set to DESC icon");
          }
        }

        // Close the dropdown manually if needed, though Bootstrap usually handles this
        var dropdownInstance = bootstrap.Dropdown.getInstance(
          sortDropdown.querySelector(".dropdown-toggle")
        );
        if (dropdownInstance) {
          dropdownInstance.hide();
        }

        // Here you would typically trigger the actual sorting function
        // with the selected sortType and sortDirection
      });
    });
  }
};

export { initSearchSortButton };
