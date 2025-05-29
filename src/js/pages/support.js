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

  // In a real application, you would send this data to the server
  console.log("Support form submitted", { name, email, subject, message });

  // Show success message
  if (document.getElementById("supportSuccessModal")) {
    // If modal exists, show it
    showModal("supportSuccessModal");
  } else {
    // Otherwise, show a toast notification
    createAndShowToast("Your message has been sent successfully!", "success");
  }

  // Reset the form
  supportForm.reset();
};

document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".support-page")) {
    initSupportPage();
  }
});
