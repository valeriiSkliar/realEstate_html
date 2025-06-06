// src/js/pages/subscriptions.js - Скрипты для страницы подписок
import { initSubscriptionsPage } from "../temp/subscriptions";

document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".subscriptions-page")) {
    initSubscriptionsPage();
  }
});
