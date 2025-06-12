import Swiper from "swiper";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

// Import Swiper styles

import { createAndShowToast, showModal } from "../utils/uiHelpers";

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

    // Основные настройки для отображения одной карточки
    slidesPerView: 1,
    spaceBetween: 20,

    // Enable pagination
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },

    loop: true,

    // Enable navigation arrows
    navigation: {
      nextEl: ".subscription-carousel-next",
      prevEl: ".subscription-carousel-prev",
    },

    // Configure autoplay (optional)
    // autoplay: {
    //   delay: 5000,
    //   disableOnInteraction: false,
    //   pauseOnMouseEnter: true,
    // },

    // Responsive breakpoints - везде по одной карточке
    breakpoints: {
      // Mobile
      320: {
        slidesPerView: 1,
        spaceBetween: 15,
      },
      // Tablet
      768: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      // Desktop
      1024: {
        slidesPerView: 1,
        spaceBetween: 25,
      },
    },

    // Убираем centeredSlides для корректного позиционирования
    centeredSlides: false,
    rewind: true,
  });

  console.log("[Debug] Swiper instance created:", swiper);
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
      name: "Специалист",
      price: "990₽",
    },
    expert: {
      name: "Эксперт",
      price: "1990₽",
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
      // TODO: send the request to the server
      // to process the subscription upgrade
      try {
        // TODO: send the request to the server
        // to process the subscription upgrade
        if (Math.random() < 0.5) {
          throw new Error("Test error");
        }
      } catch (error) {
        console.error("[Debug] Error upgrading subscription", error);
        // TODO: show fail request toast
        createAndShowToast("Произошла ошибка при обновлении подписки", "error");
      }

      createAndShowToast("Подписка успешно обновлена!", "success");

      // Hide modal - используем кнопку закрытия вместо bootstrap API
      const modal = document.getElementById("upgradePlanModal");
      const closeButton = modal.querySelector('[data-bs-dismiss="modal"]');
      if (closeButton) {
        closeButton.click();
      }

      // Update current plan info (for demo)
      const currentPlanNameEl = document.querySelector(".current-plan-name");
      if (currentPlanNameEl) {
        currentPlanNameEl.textContent = planName;
      }

      const cancelButton = document.querySelector(".js-cancel-subscription");
      if (cancelButton) {
        cancelButton.disabled = false;
      }

      // Enable the current plan button on the newly selected plan
      // and disable the upgrade button
      const upgradeButtons = document.querySelectorAll(".js-upgrade-plan");
      upgradeButtons.forEach((button) => {
        const buttonPlan = button.getAttribute("data-plan");

        if (buttonPlan && buttonPlan.toLowerCase() === planName.toLowerCase()) {
          // Change button to "Current Plan"
          button.textContent = "Текущий план";
          button.disabled = true;
          button.classList.add("js-current-plan");
          button.classList.remove("js-upgrade-plan");
        } else {
          // Reset other buttons
          button.textContent = "Обновить";
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
          // send a request to the server
          "Are you sure you want to cancel your subscription? This action cannot be undone."
        )
      ) {
        try {
          // send a request to the server
          console.log("[Debug] Subscription cancellation confirmed.");
          // For demo purposes, we'll just show a success toast
          createAndShowToast("Your subscription has been canceled.", "success");
        } catch (error) {
          console.error("[Debug] Error canceling subscription", error);
          // TODO: show fail request toast
          createAndShowToast("Произошла ошибка при отмене подписки", "error");
        }

        // Reset current plan to Free
        document.querySelector(".current-plan-name").textContent = "Бесплатный";

        cancelSubscriptionButton.disabled = true;

        // Reset buttons - исправляем селекторы для brand-button
        const upgradeButtons = document.querySelectorAll(".js-upgrade-plan");
        const freeCardButton =
          document.querySelector('[data-plan="free"]') ||
          document.querySelector(
            ".subscription-card:first-child .brand-button"
          );

        upgradeButtons.forEach((button) => {
          button.textContent = "Обновить";
          button.disabled = false;
          button.classList.add("js-upgrade-plan");
          button.classList.remove("js-current-plan");
        });

        // Устанавливаем кнопку бесплатного плана как текущую
        if (freeCardButton) {
          freeCardButton.textContent = "Текущий план";
          freeCardButton.disabled = true;
          freeCardButton.classList.remove("js-upgrade-plan");
          freeCardButton.classList.add("js-current-plan");
        }
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
