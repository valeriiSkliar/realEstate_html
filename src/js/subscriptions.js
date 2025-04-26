import Swiper from "swiper";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

// Import Swiper styles

import { showModal, createAndShowToast } from "./utils/uiHelpers";

// Initialize Subscriptions page functionality
export const initSubscriptionsPage = () => {
  console.log("[Debug] Initializing Subscriptions Page...");
  // Initialize Swiper carousel
  initSubscriptionCarousel();

  // Initialize plan upgrade
  initPlanUpgrade();

  // Initialize payment provider selection
  initPaymentProviderSelection();
};

/**
 * Initialize the subscription plans carousel
 */
const initSubscriptionCarousel = () => {
  console.log("[Debug] Initializing Subscription Carousel...");
  const swiper = new Swiper(".subscription-carousel", {
    modules: [Navigation, Pagination, Autoplay],
    // Enable pagination
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },

    // Enable navigation arrows
    navigation: {
      nextEl: ".subscription-carousel-next",
      prevEl: ".subscription-carousel-prev",
    },

    // Configure autoplay (optional)
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },

    // Responsive breakpoints
    breakpoints: {
      // Mobile
      320: {
        slidesPerView: 1,
        spaceBetween: 10,
      },
      // Tablet
      768: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      // Desktop
      1024: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
    },

    // Keep slides centered
    centeredSlides: true,
    loop: true,
  });

  console.log("[Debug] Swiper instance created:", swiper);

  // Return to beginning of loop after 3 slides to always show all plans
  swiper.on("slideChange", function () {
    if (swiper.realIndex > 2) {
      swiper.slideTo(0, 0);
    }
  });
};

/**
 * Initialize the plan upgrade functionality
 */
const initPlanUpgrade = () => {
  console.log("[Debug] Initializing Plan Upgrade functionality...");
  // Get all upgrade buttons
  const upgradeButtons = document.querySelectorAll(".js-upgrade-plan");
  const confirmUpgradeButton = document.querySelector(".js-confirm-upgrade");

  // Plan details for modal
  const planDetails = {
    specialist: {
      name: "Specialist",
      price: "$19.99",
    },
    expert: {
      name: "Expert",
      price: "$39.99",
    },
  };

  // Add click event listener to each upgrade button
  upgradeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const planType = button.getAttribute("data-plan");
      console.log(`[Debug] Upgrade button clicked for plan: ${planType}`);
      const plan = planDetails[planType];

      if (plan) {
        // Update modal content with selected plan details
        document.getElementById("upgradePlanName").textContent = plan.name;
        document.getElementById("upgradePlanPrice").textContent = plan.price;
        document.getElementById(
          "summaryPlanName"
        ).textContent = `${plan.name} Plan`;
        document.getElementById(
          "summaryAmount"
        ).textContent = `${plan.price}/month`;

        // Update payment method based on selected provider
        const selectedPaymentMethod = document.querySelector(
          'input[name="paymentProvider"]:checked'
        );
        if (selectedPaymentMethod) {
          const paymentMethodName =
            selectedPaymentMethod.nextElementSibling.querySelector(
              ".payment-provider-name"
            ).textContent;
          console.log(
            `[Debug] Payment provider selected: ${paymentMethodName}`
          );
          document.getElementById("summaryPaymentMethod").textContent =
            paymentMethodName;
        }

        console.log("[Debug] Showing upgrade plan modal...");
        // Show modal
        showModal("upgradePlanModal");
      }
    });
  });

  // Handle confirmation button click
  if (confirmUpgradeButton) {
    confirmUpgradeButton.addEventListener("click", () => {
      const planName = document.getElementById("upgradePlanName").textContent;
      console.log(`[Debug] Confirming upgrade to plan: ${planName}`);
      // In a real application, here you would send the request to the server
      // to process the subscription upgrade

      // For demo purposes, we'll just show a success toast
      createAndShowToast(
        "Your subscription has been successfully upgraded!",
        "success"
      );

      // Hide modal using Bootstrap's API
      const modal = document.getElementById("upgradePlanModal");
      const bootstrapModal = bootstrap.Modal.getInstance(modal);
      if (bootstrapModal) {
        bootstrapModal.hide();
      }

      // Update current plan info (for demo)
      document.querySelector(".current-plan-name").textContent = planName;
      const nextBillingDate = getNextBillingDate();
      console.log(`[Debug] Setting next billing date to: ${nextBillingDate}`);
      document.querySelector(".detail-value").textContent = nextBillingDate;
      document.querySelectorAll(".detail-value")[1].textContent =
        document.getElementById("summaryPaymentMethod").textContent;
      document.querySelector(".js-cancel-subscription").disabled = false;

      // Enable the current plan button on the newly selected plan
      // and disable the upgrade button
      const upgradeButtons = document.querySelectorAll(".js-upgrade-plan");
      upgradeButtons.forEach((button) => {
        const buttonPlan = button.getAttribute("data-plan");

        if (buttonPlan.toLowerCase() === planName.toLowerCase()) {
          // Find the parent card
          const card = button.closest(".subscription-card");

          // Change button to "Current Plan"
          button.textContent = "Current Plan";
          button.disabled = true;
          button.classList.remove("btn-primary");
          button.classList.add("btn-outline-primary");
          button.classList.add("js-current-plan");
          button.classList.remove("js-upgrade-plan");
        } else {
          // Reset other buttons
          button.textContent = "Upgrade";
          button.disabled = false;
        }
      });
    });
  }

  // Initialize cancel subscription button
  const cancelSubscriptionButton = document.querySelector(
    ".js-cancel-subscription"
  );
  if (cancelSubscriptionButton) {
    cancelSubscriptionButton.addEventListener("click", () => {
      console.log("[Debug] Cancel subscription button clicked.");
      if (
        confirm(
          "Are you sure you want to cancel your subscription? This action cannot be undone."
        )
      ) {
        console.log("[Debug] Subscription cancellation confirmed.");
        // In a real application, you would send a request to the server
        // For demo purposes, we'll just show a success toast
        createAndShowToast("Your subscription has been canceled.", "success");

        // Reset current plan to Free
        document.querySelector(".current-plan-name").textContent = "Free";
        document.querySelector(".detail-value").textContent = "-";
        document.querySelectorAll(".detail-value")[1].textContent = "-";
        cancelSubscriptionButton.disabled = true;

        // Reset buttons
        document
          .querySelectorAll(".subscription-card__button")
          .forEach((button) => {
            const isFreeButton =
              button
                .closest(".subscription-card")
                .querySelector(".subscription-card__title").textContent ===
              "Free";

            if (isFreeButton) {
              button.textContent = "Current Plan";
              button.disabled = true;
              button.classList.remove("btn-primary");
              button.classList.add("btn-outline-primary");
            } else {
              button.textContent = "Upgrade";
              button.disabled = false;
              button.classList.add("btn-primary");
              button.classList.remove("btn-outline-primary");
              button.classList.add("js-upgrade-plan");
              button.classList.remove("js-current-plan");
            }
          });
      }
    });
  }
};

/**
 * Initialize payment provider selection
 */
const initPaymentProviderSelection = () => {
  console.log("[Debug] Initializing Payment Provider Selection...");
  const paymentProviders = document.querySelectorAll(
    'input[name="paymentProvider"]'
  );

  paymentProviders.forEach((provider) => {
    provider.addEventListener("change", () => {
      if (provider.checked) {
        const paymentMethodName = provider.nextElementSibling.querySelector(
          ".payment-provider-name"
        ).textContent;
        console.log(
          `[Debug] Payment provider changed to: ${paymentMethodName}`
        );
        document.getElementById("summaryPaymentMethod").textContent =
          paymentMethodName;
      }
    });
  });
};

/**
 * Helper function to get next billing date (30 days from now)
 * @returns {string} Formatted date string
 */
const getNextBillingDate = () => {
  console.log("[Debug] Calculating next billing date...");
  const date = new Date();
  date.setDate(date.getDate() + 30);

  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  console.log(`[Debug] Calculated next billing date: ${formattedDate}`);
  return formattedDate;
};
