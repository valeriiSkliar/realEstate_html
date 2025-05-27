// src/js/pages/profile.js - Скрипты для страницы профиля
import { initProfilePage } from "../profile";

document.addEventListener("DOMContentLoaded", function () {
  if (document.querySelector(".profile-page")) {
    initProfilePage();
  }
});
