import { removePropertyFromCollection } from '../components/collections/api/collections-manager.js';
import { addPropertyToFavorite, removeCollectionToast, showCollectionSelectorPopup } from "../components/collections/collection-selector-popup/collection-selector-popup.js";
import { initReportModal } from "../components/property-page/report-modal.js";
import { createAndShowToast } from '../utils/uiHelpers.js';


document.addEventListener("DOMContentLoaded", function () {
  if (!document.querySelector(".property-detail-page")) {
    return false;
  }

  // Инициализируем модальное окно жалобы
  initReportModal();

  // Функция сбора изображений из DOM
  function collectImagesFromDOM() {
    const images = [];

    // Собираем изображения из thumbnails
    const thumbnailItems = document.querySelectorAll(
      ".thumbnail-item img, .gallery-thumbnails img"
    );
    thumbnailItems.forEach((img, index) => {
      images.push({
        src: img.dataset.fullSrc || img.dataset.largeSrc || img.src, // Поддерживаем разные атрибуты
        thumb: img.src,
        alt: img.alt || `Изображение ${index + 1}`,
      });
    });

    // Если нет thumbnails, собираем из галереи изображений
    if (images.length === 0) {
      const galleryImages = document.querySelectorAll(
        ".property-gallery img, .image-gallery img"
      );
      galleryImages.forEach((img, index) => {
        images.push({
          src: img.dataset.fullSrc || img.dataset.largeSrc || img.src,
          thumb: img.src,
          alt: img.alt || `Изображение ${index + 1}`,
        });
      });
    }

    // Если все еще нет изображений, пробуем собрать из основного изображения
    if (images.length === 0) {
      const mainImage = document.getElementById("main-gallery-image");
      if (mainImage) {
        images.push({
          src:
            mainImage.dataset.fullSrc ||
            mainImage.dataset.largeSrc ||
            mainImage.src,
          thumb: mainImage.src,
          alt: mainImage.alt || "Основное изображение",
        });
      }
    }

    return images;
  }

  // Собираем изображения с сервера
  const galleryImages = collectImagesFromDOM();

  let currentImageIndex = 0;
  const mainImage = document.getElementById("main-gallery-image");
  let thumbnails = document.querySelectorAll(".thumbnail-item");
  const prevBtn = document.getElementById("gallery-prev");
  const nextBtn = document.getElementById("gallery-next");

  // Инициализируем thumbnails из собранных данных, если их нет
  function initializeThumbnails() {
    const thumbnailContainer = document.querySelector(".thumbnail-gallery");
    if (
      thumbnailContainer &&
      thumbnails.length === 0 &&
      galleryImages.length > 1
    ) {
      galleryImages.forEach((image, index) => {
        const thumbnailItem = document.createElement("div");
        thumbnailItem.className = "thumbnail-item";
        if (index === 0) thumbnailItem.classList.add("active");

        const thumbnailImg = document.createElement("img");
        thumbnailImg.src = image.thumb;
        thumbnailImg.alt = image.alt;
        thumbnailImg.loading = "lazy";

        thumbnailItem.appendChild(thumbnailImg);
        thumbnailContainer.appendChild(thumbnailItem);
      });

      // Обновляем коллекцию thumbnails
      thumbnails = document.querySelectorAll(".thumbnail-item");
    }
  }

  // Инициализируем thumbnails если нужно
  initializeThumbnails();

  // Проверяем наличие изображений и основных элементов галереи
  if (galleryImages.length === 0 || !mainImage) {
    console.log(
      "No gallery images found or main image element missing, skipping gallery initialization"
    );
    // Если нет изображений, инициализируем только функциональность описания
    initDescriptionToggle();
    return;
  }

  // Устанавливаем первое изображение как основное
  function initializeMainImage() {
    if (galleryImages.length > 0) {
      mainImage.src = galleryImages[0].src;
      mainImage.alt = galleryImages[0].alt;
    }
  }

  // Инициализируем основное изображение
  initializeMainImage();

  // Modal elements
  const imageModal = document.getElementById("imageModal");
  let modalImage,
    modalCounter,
    modalCloseBtn,
    modalOverlay,
    modalPrevBtn,
    modalNextBtn;

  // Инициализируем модальные элементы только если главный контейнер существует
  if (imageModal) {
    modalImage = document.getElementById("modalImage");
    modalCounter = document.getElementById("modalCounter");
    modalCloseBtn = imageModal.querySelector(".image-modal__close");
    modalOverlay = imageModal.querySelector(".image-modal__overlay");
    modalPrevBtn = imageModal.querySelector(".image-modal__nav--prev");
    modalNextBtn = imageModal.querySelector(".image-modal__nav--next");
  }

  // Function to update main image
  function updateMainImage(index) {
    if (index < 0 || index >= galleryImages.length) return;

    currentImageIndex = index;
    mainImage.src = galleryImages[index].src;
    mainImage.alt = galleryImages[index].alt;

    // Update active thumbnail - обновляем для динамических элементов
    const currentThumbnails = document.querySelectorAll(".thumbnail-item");
    currentThumbnails.forEach((thumb, i) => {
      thumb.classList.toggle("active", i === index);
    });
  }

  // Modal functions
  function openModal(index) {
    if (!imageModal || index < 0 || index >= galleryImages.length) return;

    currentImageIndex = index;
    modalImage.src = galleryImages[index].src;
    modalImage.alt = galleryImages[index].alt;
    modalCounter.textContent = `${index + 1} / ${galleryImages.length}`;

    imageModal.classList.add("active");
    imageModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden"; // Prevent body scroll
  }

  function closeModal() {
    if (!imageModal) return;

    imageModal.classList.remove("active");
    imageModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = ""; // Restore body scroll
  }

  function updateModalImage(index) {
    if (!imageModal || index < 0 || index >= galleryImages.length) return;

    currentImageIndex = index;
    modalImage.src = galleryImages[index].src;
    modalImage.alt = galleryImages[index].alt;
    modalCounter.textContent = `${index + 1} / ${galleryImages.length}`;

    // Also update the main gallery
    updateMainImage(index);
  }

  // Main image click to open modal - только если модаль существует
  if (imageModal) {
    mainImage.addEventListener("click", () => {
      openModal(currentImageIndex);
    });
  }

  // Modal navigation - только если элементы существуют
  if (modalPrevBtn) {
    modalPrevBtn.addEventListener("click", () => {
      const newIndex =
        currentImageIndex > 0
          ? currentImageIndex - 1
          : galleryImages.length - 1;
      updateModalImage(newIndex);
    });
  }

  if (modalNextBtn) {
    modalNextBtn.addEventListener("click", () => {
      const newIndex =
        currentImageIndex < galleryImages.length - 1
          ? currentImageIndex + 1
          : 0;
      updateModalImage(newIndex);
    });
  }

  // Modal close handlers
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeModal);
  }

  // Improved modal overlay click handler
  if (imageModal) {
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
    if (modalContainer) {
      modalContainer.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }
  }

  // Thumbnail click handlers - используем делегирование событий для динамических элементов
  const thumbnailContainer = document.querySelector(".thumbnail-gallery");
  if (thumbnailContainer) {
    thumbnailContainer.addEventListener("click", (e) => {
      const thumbnailItem = e.target.closest(".thumbnail-item");
      if (thumbnailItem) {
        const thumbnailItems = Array.from(
          thumbnailContainer.querySelectorAll(".thumbnail-item")
        );
        const index = thumbnailItems.indexOf(thumbnailItem);
        if (index !== -1) {
          updateMainImage(index);
        }
      }
    });
  }

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
    if (imageModal && imageModal.classList.contains("active")) {
      // Modal is open
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowLeft" && modalPrevBtn) {
        modalPrevBtn.click();
      } else if (e.key === "ArrowRight" && modalNextBtn) {
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
  if (imageModal) {
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

    // Получаем полный текст без HTML тегов
    const fullText = fullTextContainer.textContent.trim();
    const maxLength = 250; // Максимальная длина для превью
    let isExpanded = false;

    // Убираем изначальную видимость полного текста
    fullTextContainer.style.display = "none";

    // Если текст короткий, скрываем кнопку и показываем весь текст
    if (fullText.length <= maxLength) {
      previewContainer.innerHTML = fullTextContainer.innerHTML;
      previewContainer.style.display = "block";
      toggleContainer.style.display = "none";
      return;
    }

    // Создаем обрезанный текст для превью с сохранением форматирования
    function createPreviewText() {
      // Создаем временный контейнер для работы с HTML
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = fullTextContainer.innerHTML;

      // Функция для получения только текстового содержимого и подсчета символов
      function getTextLength(element) {
        let textLength = 0;
        function traverse(node) {
          if (node.nodeType === Node.TEXT_NODE) {
            textLength += node.textContent.length;
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Для <br> добавляем символ переноса строки при подсчете
            if (node.tagName === "BR") {
              textLength += 1;
            }
            for (let child of node.childNodes) {
              traverse(child);
            }
          }
        }
        traverse(element);
        return textLength;
      }

      // Функция для обрезки HTML до определенного количества символов
      function truncateHTML(element, maxChars) {
        let charCount = 0;
        let lastGoodNode = null;
        let lastGoodOffset = 0;

        function traverse(node) {
          if (charCount >= maxChars) return false;

          if (node.nodeType === Node.TEXT_NODE) {
            const nodeLength = node.textContent.length;
            if (charCount + nodeLength <= maxChars) {
              charCount += nodeLength;
              lastGoodNode = node;
              lastGoodOffset = nodeLength;
              return true;
            } else {
              // Находим последний пробел перед лимитом
              const remainingChars = maxChars - charCount;
              const partialText = node.textContent.substring(0, remainingChars);
              const lastSpaceIndex = partialText.lastIndexOf(" ");

              if (lastSpaceIndex > 0) {
                node.textContent = partialText.substring(0, lastSpaceIndex);
                charCount += lastSpaceIndex;
                lastGoodNode = node;
                lastGoodOffset = lastSpaceIndex;
              }
              return false;
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === "BR") {
              if (charCount + 1 <= maxChars) {
                charCount += 1;
                return true;
              } else {
                return false;
              }
            }

            for (let i = 0; i < node.childNodes.length; i++) {
              if (!traverse(node.childNodes[i])) {
                // Удаляем все следующие узлы
                while (node.childNodes.length > i + 1) {
                  node.removeChild(node.lastChild);
                }
                break;
              }
            }
            return charCount < maxChars;
          }
          return true;
        }

        traverse(element);

        // Добавляем многоточие к последнему текстовому узлу
        if (
          lastGoodNode &&
          lastGoodNode.nodeType === Node.TEXT_NODE &&
          charCount >= maxChars - 3
        ) {
          lastGoodNode.textContent = lastGoodNode.textContent.trimEnd() + "...";
        }

        return element;
      }

      // Проверяем, нужно ли обрезать
      const fullTextLength = getTextLength(tempDiv);
      if (fullTextLength > maxLength) {
        const truncated = truncateHTML(tempDiv, maxLength - 3); // -3 для многоточия
        previewContainer.innerHTML = truncated.innerHTML;
      } else {
        previewContainer.innerHTML = fullTextContainer.innerHTML;
      }
    }

    // Инициализация
    createPreviewText();
    previewContainer.style.display = "block";

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

  // Favorite button toggle
  const favoriteButton = document.getElementById('favorite-button');
  const addToCollectionsButton = document.querySelector('.js-add-to-collection');

    favoriteButton?.addEventListener('click', async function(e) {
      const propertyId = this.getAttribute('data-property-id');
      const addRemoveToFavoriteUrl = this.getAttribute('data-add-to-favorite-url');

      const propertyTitleElement = document.querySelector('.property-title');
      const propertyTitle = propertyTitleElement ? propertyTitleElement.textContent : 'Объект недвижимости';

      const heartIcon = this.querySelector('i');
      const isFavoriteIconSolid = heartIcon.classList.contains('bi-heart-fill');
      
      const urls = {
        addToFavoriteUrl: addRemoveToFavoriteUrl,
      }

      try{
        if (!isFavoriteIconSolid) { 
          await addPropertyToFavorite(propertyId, propertyTitle, urls, false);
          heartIcon.classList.remove('bi-heart');
          heartIcon.classList.add('bi-heart-fill');
        } else { 
          // Generate remove URL
          await removePropertyFromCollection(urls.addToFavoriteUrl);
          heartIcon.classList.remove('bi-heart-fill');
          heartIcon.classList.add('bi-heart');

          removeCollectionToast();
          createAndShowToast(`${propertyTitle} удалено из избранного`, 'success');
        }
      }catch(error){
        console.error(error);
        createAndShowToast(`${propertyTitle} не удалось изменить статус избранного`, 'error');
      }
    });

  addToCollectionsButton?.addEventListener('click', function () {
    removeCollectionToast();
    
    // Get URLs from data attributes
    const propertyId = this.getAttribute('data-property-id');
    const getCollectionsListUrl = this.getAttribute('data-get-collections-list-url');
    const updateCollectionsUrl = this.getAttribute('data-update-collections-url');
    const createCollectionUrl = this.getAttribute('data-create-collection-url');
    
    const propertyTitleElement = document.querySelector('.property-detail-header__title');
    const propertyTitle = propertyTitleElement ? propertyTitleElement.textContent : 'Объект недвижимости';
    
    if (propertyId && getCollectionsListUrl && updateCollectionsUrl) {
      showCollectionSelectorPopup(
        propertyId, 
        propertyTitle, 
        {
          getCollectionsListUrl,
          updateCollectionsUrl,
          createCollectionUrl
        }
      );
    }
  });

});
