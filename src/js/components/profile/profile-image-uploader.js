import { createAndShowToast } from "../../utils/uiHelpers";

/**
 * Initialize photo uploader functionality
 */
export const initPhotoUploader = () => {
  const avatarContainer = document.querySelector(".js-avatar-container");
  const avatarUpload = document.querySelector(".js-avatar-upload");
  const avatarInput = document.querySelector(".js-avatar-input");
  const avatarImage = document.querySelector(".js-avatar-image");
  if (!avatarContainer || !avatarUpload || !avatarInput || !avatarImage) {
    return;
  }

  // Load existing avatar if available
  loadExistingAvatar();

  // Click handler for upload overlay
  avatarUpload.addEventListener("click", () => {
    avatarInput.click();
  });

  // File input change handler
  avatarInput.addEventListener("change", handleAvatarUpload);
};

/**
 * Load existing avatar from backend
 */
const loadExistingAvatar = async () => {
  try {
    // Симуляция запроса к бекенду для получения существующего фото
    // В реальном проекте здесь будет запрос к API
    // const response = await fetch("/api/user/avatar");

    // Для демонстрации - проверяем есть ли кастомный аватар
    // В реальном приложении это будет настоящий API запрос
    const response = {
      ok: true,
      json: async () => ({
        // Возвращаем null если у пользователя нет кастомного аватара
        // или URL кастомного аватара если есть
        avatarUrl: "/images/default-avatar.png", // Симуляция сохраненного аватара
      }),
    };
    console.log("response", response);

    if (response.ok) {
      const data = await response.json();
      if (data.avatarUrl && data.avatarUrl !== "/images/default-avatar.png") {
        displayAvatar(data.avatarUrl);
      }
      // Если avatarUrl null или это дефолтное изображение, не меняем ничего
    }
  } catch (error) {
    console.log("No existing avatar found or error loading avatar");
  }
};

/**
 * Handle avatar file upload
 */
const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    createAndShowToast("Пожалуйста, выберите изображение", "error");
    return;
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    createAndShowToast("Размер файла не должен превышать 5MB", "error");
    return;
  }

  try {
    // Optimistic update - show preview immediately
    const previewUrl = URL.createObjectURL(file);
    displayAvatar(previewUrl);

    // createAndShowToast("Загружаем фото...", "info", 3000);

    // Upload to backend
    const uploadSuccess = await uploadAvatarToBackend(file);

    if (uploadSuccess.success) {
      // Update with actual URL from backend
      displayAvatar(uploadSuccess.avatarUrl);
      createAndShowToast("Фото профиля обновлено!", "success");
    } else {
      throw new Error(uploadSuccess.error || "Upload failed");
    }
  } catch (error) {
    // Revert optimistic update on error
    revertToPlaceholder();
    createAndShowToast("Ошибка загрузки фото. Попробуйте еще раз.", "error");
    console.error("Avatar upload error:", error);
  }
};

/**
 * Upload avatar to backend
 */
const uploadAvatarToBackend = async (file) => {
  try {
    const formData = new FormData();
    formData.append("avatar", file);

    console.log("formData", formData);

    // const response = await fetch("/api/user/avatar", {
    //   method: "POST",
    //   body: formData,
    //   // headers with auth token if needed
    // });
    const response = {
      ok: true,
      json: async () => ({
        avatarUrl: "/images/updated-avatar.jpg",
      }),
    };

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return {
      success: true,
      avatarUrl: result.avatarUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Display avatar image
 */
const displayAvatar = (url) => {
  console.log("displayAvatar", url);
  const avatarImage = document.querySelector(".js-avatar-image");

  if (avatarImage) {
    avatarImage.src = url;
    avatarImage.style.display = "block";
  }
};

/**
 * Revert to default avatar when upload fails
 */
const revertToPlaceholder = () => {
  const avatarImage = document.querySelector(".js-avatar-image");

  if (avatarImage) {
    // Revert to default avatar image
    avatarImage.src = "/images/default-avatar.png";
    avatarImage.style.display = "block";
  }
};
