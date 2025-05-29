import { copyToClipboard } from "../utils/clipboard";
import { createAndShowToast } from "../utils/uiHelpers";

/**
 * Initialize profile page functionality
 */
export const initProfilePage = () => {
  // Toggle info cards
  initInfoCardToggles();

  // Initialize referral link copy functionality
  initReferralCopy();
};

/**
 * Initialize the info card toggle functionality
 */
const initInfoCardToggles = () => {
  const cardToggles = document.querySelectorAll(".js-card-toggle");

  cardToggles.forEach((toggle) => {
    // Find the content and icon elements
    const card = toggle.closest(".info-card");
    const content = card.querySelector(".info-card__content");
    const icon = toggle.querySelector(".info-card__icon");

    // Set first card to be open by default
    if (card === cardToggles[0].closest(".info-card")) {
      content.classList.add("is-active");
      icon.classList.add("is-active");
    }

    // Add click event listener
    toggle.addEventListener("click", () => {
      // Toggle active class on content and icon
      content.classList.toggle("is-active");
      icon.classList.toggle("is-active");
    });
  });
};

/**
 * Initialize referral link copy functionality
 */
const initReferralCopy = () => {
  const copyButton = document.querySelector(".js-copy-referral");

  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      // Find the input element
      const referralLinkInput = document.querySelector(".referral-link-input");
      const textToCopy = referralLinkInput.value;

      // Copy the text using our utility
      const success = await copyToClipboard(textToCopy);

      // Visual feedback
      const originalIcon = copyButton.innerHTML;

      if (success) {
        copyButton.innerHTML = '<i class="bi bi-check"></i>';

        // Show a small toast notification using the helper
        createAndShowToast("Link copied to clipboard!", "success");
      } else {
        copyButton.innerHTML = '<i class="bi bi-x"></i>';
        // Show error toast using the helper
        createAndShowToast("Failed to copy link", "error");
      }

      // Reset after a short delay
      setTimeout(() => {
        copyButton.innerHTML = originalIcon;
      }, 2000);
    });
  }
};
document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".profile-page")) {
    initProfilePage();
  }
});
