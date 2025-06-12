// src/js/pages/support.js - Скрипты для страницы поддержки
import { createAndShowToast, showModal } from "../utils/uiHelpers";

/**
 * Initialize support page functionality
 */
export const initSupportPage = () => {
  const supportForm = document.getElementById("supportForm");

  if (supportForm) {
    supportForm.addEventListener("submit", handleSupportFormSubmit);
  }
};

/**
 * Handle support form submission
 * @param {Event} event - The form submit event
 */
const handleSupportFormSubmit = (event) => {
  event.preventDefault();

  // Get form values
  const name = document.getElementById("supportName").value;
  const email = document.getElementById("supportEmail").value;
  const subject = document.getElementById("supportSubject").value;
  const message = document.getElementById("supportMessage").value;

  try {
    // TODO: send this data to the server
    console.log("Support form submitted", { name, email, subject, message });

    // Randomly throw error for testing (50% chance)
    if (Math.random() < 0.5) {
      throw new Error("Random server error");
    }
  } catch (error) {
    console.error("Error submitting support form", error);
    // TODO: show fail request modal
    if (document.getElementById("supportFailRequestModal")) {
      // If modal exists, show it
      showModal("supportFailRequestModal");
    } else {
      // Otherwise, show a toast notification
      createAndShowToast("Произошла ошибка при отправке запроса", "error");
    }
  }

  // TODO: show success modal

  // Reset the form
  supportForm.reset();
};

document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".support-page")) {
    initSupportPage();
  }
});
