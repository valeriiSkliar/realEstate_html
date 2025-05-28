document.addEventListener("DOMContentLoaded", function () {
  if (!document.querySelector(".property-detail-page")) {
    return false;
  }
  // Gallery images data
  const galleryImages = [
    {
      src: "images/property_view_example/1.jpg",
      thumb: "images/property_view_example/1.jpg",
      alt: "Изображение 1",
    },
    {
      src: "images/property_view_example/2.jpg",
      thumb: "images/property_view_example/2.jpg",
      alt: "Изображение 2",
    },
    {
      src: "images/property_view_example/3.jpg",
      thumb: "images/property_view_example/3.jpg",
      alt: "Изображение 3",
    },
    {
      src: "images/property_view_example/4.jpg",
      thumb: "images/property_view_example/4.jpg",
      alt: "Изображение 4",
    },
    {
      src: "images/property_view_example/5.jpg",
      thumb: "images/property_view_example/5.jpg",
      alt: "Изображение 5",
    },
    {
      src: "images/property_view_example/6.jpg",
      thumb: "images/property_view_example/6.jpg",
      alt: "Изображение 5",
    },
    {
      src: "images/property_view_example/7.jpg",
      thumb: "images/property_view_example/7.jpg",
      alt: "Изображение 5",
    },
  ];

  let currentImageIndex = 0;
  const mainImage = document.getElementById("main-gallery-image");
  const thumbnails = document.querySelectorAll(".thumbnail-item");
  const prevBtn = document.getElementById("gallery-prev");
  const nextBtn = document.getElementById("gallery-next");

  // Modal elements
  const imageModal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const modalCounter = document.getElementById("modalCounter");
  const modalCloseBtn = imageModal.querySelector(".image-modal__close");
  const modalOverlay = imageModal.querySelector(".image-modal__overlay");
  const modalPrevBtn = imageModal.querySelector(".image-modal__nav--prev");
  const modalNextBtn = imageModal.querySelector(".image-modal__nav--next");

  // Function to update main image
  function updateMainImage(index) {
    if (index < 0 || index >= galleryImages.length) return;

    currentImageIndex = index;
    mainImage.src = galleryImages[index].src;
    mainImage.alt = galleryImages[index].alt;

    // Update active thumbnail
    thumbnails.forEach((thumb, i) => {
      thumb.classList.toggle("active", i === index);
    });
  }

  // Modal functions
  function openModal(index) {
    if (index < 0 || index >= galleryImages.length) return;

    currentImageIndex = index;
    modalImage.src = galleryImages[index].src;
    modalImage.alt = galleryImages[index].alt;
    modalCounter.textContent = `${index + 1} / ${galleryImages.length}`;

    imageModal.classList.add("active");
    imageModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // Prevent body scroll
  }

  function closeModal() {
    imageModal.classList.remove("active");
    imageModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // Restore body scroll
  }

  function updateModalImage(index) {
    if (index < 0 || index >= galleryImages.length) return;

    currentImageIndex = index;
    modalImage.src = galleryImages[index].src;
    modalImage.alt = galleryImages[index].alt;
    modalCounter.textContent = `${index + 1} / ${galleryImages.length}`;

    // Also update the main gallery
    updateMainImage(index);
  }

  // Main image click to open modal
  mainImage.addEventListener("click", () => {
    openModal(currentImageIndex);
  });

  // Modal navigation
  modalPrevBtn.addEventListener("click", () => {
    const newIndex =
      currentImageIndex > 0 ? currentImageIndex - 1 : galleryImages.length - 1;
    updateModalImage(newIndex);
  });

  modalNextBtn.addEventListener("click", () => {
    const newIndex =
      currentImageIndex < galleryImages.length - 1 ? currentImageIndex + 1 : 0;
    updateModalImage(newIndex);
  });

  // Modal close handlers
  modalCloseBtn.addEventListener("click", closeModal);

  // Improved modal overlay click handler
  imageModal.addEventListener("click", (e) => {
    // Close modal if clicked outside the image container
    if (
      !e.target.closest(".image-modal__container") ||
      e.target.classList.contains("image-modal__overlay")
    ) {
      console.log("closeModal");
      closeModal();
    }
  });

  // Prevent modal from closing when clicking on modal content
  const modalContainer = imageModal.querySelector(".image-modal__container");
  modalContainer.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Thumbnail click handlers
  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener("click", () => {
      updateMainImage(index);
    });
  });

  // Navigation buttons
  prevBtn.addEventListener("click", () => {
    const newIndex =
      currentImageIndex > 0 ? currentImageIndex - 1 : galleryImages.length - 1;
    updateMainImage(newIndex);
  });

  nextBtn.addEventListener("click", () => {
    const newIndex =
      currentImageIndex < galleryImages.length - 1 ? currentImageIndex + 1 : 0;
    updateMainImage(newIndex);
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (imageModal.classList.contains("active")) {
      // Modal is open
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowLeft") {
        modalPrevBtn.click();
      } else if (e.key === "ArrowRight") {
        modalNextBtn.click();
      }
    } else {
      // Modal is closed, normal gallery navigation
      if (e.key === "ArrowLeft") {
        prevBtn.click();
      } else if (e.key === "ArrowRight") {
        nextBtn.click();
      }
    }
  });

  // Touch/Swipe navigation
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;
  const minSwipeDistance = 50; // Минимальная дистанция для срабатывания свайпа
  const maxVerticalDistance = 100; // Максимальное вертикальное смещение для горизонтального свайпа

  const mainImageWrapper = document.querySelector(".main-image-wrapper");

  if (mainImageWrapper) {
    // Начало касания
    mainImageWrapper.addEventListener(
      "touchstart",
      (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      },
      { passive: true }
    );

    // Конец касания
    mainImageWrapper.addEventListener(
      "touchend",
      (e) => {
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
        handleSwipe();
      },
      { passive: true }
    );
  }

  // Функция обработки свайпа
  function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = Math.abs(touchEndY - touchStartY);

    // Проверяем, что это горизонтальный свайп достаточной длины
    if (Math.abs(deltaX) > minSwipeDistance && deltaY < maxVerticalDistance) {
      if (deltaX > 0) {
        // Свайп вправо - предыдущее изображение
        prevBtn.click();
      } else {
        // Свайп влево - следующее изображение
        nextBtn.click();
      }
    }
  }

  // Modal touch events for mobile
  let modalTouchStartX = 0;
  let modalTouchStartY = 0;
  let modalTouchEndX = 0;
  let modalTouchEndY = 0;

  // Touch events for modal overlay to close on tap outside
  imageModal.addEventListener(
    "touchstart",
    (e) => {
      modalTouchStartX = e.touches[0].clientX;
      modalTouchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  imageModal.addEventListener(
    "touchend",
    (e) => {
      modalTouchEndX = e.changedTouches[0].clientX;
      modalTouchEndY = e.changedTouches[0].clientY;

      // Check if it's a tap (not a swipe)
      const deltaX = Math.abs(modalTouchEndX - modalTouchStartX);
      const deltaY = Math.abs(modalTouchEndY - modalTouchStartY);
      const isTap = deltaX < 10 && deltaY < 10; // Small threshold for tap detection

      if (isTap && !e.target.closest(".image-modal__container")) {
        closeModal();
      }
    },
    { passive: true }
  );

  // Favorite button toggle
  const favoriteButton = document.querySelector(
    ".property-detail-header__favorite-btn"
  );
  if (favoriteButton) {
    favoriteButton.addEventListener("click", function () {
      const icon = this.querySelector("i");
      icon.classList.toggle("bi-heart");
      icon.classList.toggle("bi-heart-fill");
      // Дополнительно можно менять title
      if (icon.classList.contains("bi-heart-fill")) {
        this.title = "Удалить из избранного";
        this.setAttribute("aria-label", "Удалить из избранного");
      } else {
        this.title = "Добавить в избранное";
        this.setAttribute("aria-label", "Добавить в избранное");
      }
    });
  }

  // Description read more functionality
  function initDescriptionToggle() {
    const descriptionContainer = document.getElementById(
      "property-description"
    );
    const fullTextContainer = descriptionContainer.querySelector(
      ".description-full-text"
    );
    const previewContainer = descriptionContainer.querySelector(
      ".description-preview"
    );
    const toggleContainer = document.getElementById("description-toggle");
    const toggleBtn = document.getElementById("description-toggle-btn");
    const toggleText = toggleBtn.querySelector(".toggle-text");

    if (!fullTextContainer || !previewContainer || !toggleBtn) return;

    // Получаем полный текст
    const fullText = fullTextContainer.textContent.trim();
    const maxLength = 250; // Максимальная длина для превью
    let isExpanded = false;

    // Если текст короткий, скрываем кнопку
    if (fullText.length <= maxLength) {
      previewContainer.innerHTML = fullTextContainer.innerHTML;
      toggleContainer.classList.add(
        "property-characteristics__description-more--hidden"
      );
      return;
    }

    // Создаем обрезанный текст для превью
    function createPreviewText() {
      const truncatedText = fullText.substring(0, maxLength);
      const lastSpaceIndex = truncatedText.lastIndexOf(" ");
      const previewText = truncatedText.substring(0, lastSpaceIndex) + "...";

      // Сохраняем HTML структуру
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = fullTextContainer.innerHTML;
      const textContent = tempDiv.textContent || tempDiv.innerText;

      if (textContent.length > maxLength) {
        // Находим позицию обрезки в HTML
        let charCount = 0;
        let truncatedHTML = "";
        const walker = document.createTreeWalker(
          tempDiv,
          NodeFilter.SHOW_TEXT,
          null,
          false
        );

        let node;
        while ((node = walker.nextNode())) {
          const nodeText = node.textContent;
          if (charCount + nodeText.length > lastSpaceIndex) {
            const remainingChars = lastSpaceIndex - charCount;
            if (remainingChars > 0) {
              node.textContent = nodeText.substring(0, remainingChars) + "...";
            } else {
              node.textContent = "";
            }
            break;
          }
          charCount += nodeText.length;
        }

        previewContainer.innerHTML = tempDiv.innerHTML;
      } else {
        previewContainer.innerHTML = fullTextContainer.innerHTML;
      }
    }

    // Инициализация
    createPreviewText();

    // Обработчик клика по кнопке
    toggleBtn.addEventListener("click", function () {
      isExpanded = !isExpanded;

      if (isExpanded) {
        // Показываем полный текст
        previewContainer.style.display = "none";
        fullTextContainer.style.display = "block";
        toggleText.textContent = "Скрыть";
        toggleBtn.classList.add("expanded");
      } else {
        // Показываем превью
        fullTextContainer.style.display = "none";
        previewContainer.style.display = "block";
        toggleText.textContent = "Читать далее";
        toggleBtn.classList.remove("expanded");
      }
    });
  }

  // Инициализируем функциональность описания
  initDescriptionToggle();
});
