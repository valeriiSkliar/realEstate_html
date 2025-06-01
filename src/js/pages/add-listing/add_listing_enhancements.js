// src/js/pages/add-listing-enhancements.js - Дополнительные улучшения формы

import { createAndShowToast } from "../../utils/uiHelpers.js";

/**
 * Класс для дополнительных улучшений формы добавления объявления
 */
export class AddListingEnhancements {
  constructor(form) {
    this.form = form;
    this.validationProgress = document.getElementById("validationProgress");

    this.init();
  }

  init() {
    this.setupCharacterCounters();
    this.setupValidationProgress();
    this.setupFieldAnimations();
    this.setupTooltips();
    this.setupRealTimeValidation();
    this.setupFormPersistence();
    this.setupKeyboardShortcuts();
  }

  /**
   * Настройка счетчиков символов
   */
  setupCharacterCounters() {
    const fields = [
      { id: "propertyName", counterId: "propertyNameCounter", max: 100 },
      { id: "cleanDescription", counterId: "descriptionCounter", max: 2000 },
    ];

    fields.forEach(({ id, counterId, max }) => {
      const field = document.getElementById(id);
      const counter = document.getElementById(counterId);

      if (field && counter) {
        field.addEventListener("input", () => {
          const length = field.value.length;
          counter.textContent = length;

          // Изменяем цвет счетчика в зависимости от заполненности
          const counterElement = counter.parentElement;
          counterElement.classList.remove("warning", "success");

          if (length > max * 0.9) {
            counterElement.classList.add("warning");
          } else if (length > max * 0.5) {
            counterElement.classList.add("success");
          }
        });
      }
    });
  }

  /**
   * Настройка прогресса валидации
   */
  setupValidationProgress() {
    if (!this.validationProgress) return;

    const requiredFields = this.form.querySelectorAll("[required]");
    let lastProgress = 0;

    const updateProgress = () => {
      let filledFields = 0;

      requiredFields.forEach((field) => {
        if (field.type === "checkbox") {
          if (field.checked) filledFields++;
        } else if (field.value.trim() !== "") {
          filledFields++;
        }
      });

      const progress = (filledFields / requiredFields.length) * 100;

      // Плавная анимация прогресса
      this.animateProgress(lastProgress, progress);
      lastProgress = progress;
    };

    // Обновляем прогресс при изменении полей
    requiredFields.forEach((field) => {
      field.addEventListener("input", updateProgress);
      field.addEventListener("change", updateProgress);
    });

    // Инициализация
    updateProgress();
  }

  animateProgress(from, to) {
    const duration = 500; // ms
    const start = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const current = from + (to - from) * easeProgress;
      this.validationProgress.style.width = `${current}%`;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Настройка анимаций полей
   */
  setupFieldAnimations() {
    const fields = this.form.querySelectorAll(".form-input, .form-select");

    fields.forEach((field) => {
      // Анимация фокуса
      field.addEventListener("focus", () => {
        field.parentElement.classList.add("field-focused");
      });

      field.addEventListener("blur", () => {
        field.parentElement.classList.remove("field-focused");
      });

      // Анимация для ошибок
      field.addEventListener("invalid", () => {
        const fieldContainer = field.closest(".form-field");
        if (fieldContainer) {
          fieldContainer.classList.add("has-error");
          setTimeout(() => {
            fieldContainer.classList.remove("has-error");
          }, 500);
        }
      });
    });
  }

  /**
   * Настройка тултипов
   */
  setupTooltips() {
    const tooltips = this.form.querySelectorAll(".field-tooltip");

    tooltips.forEach((tooltip) => {
      const trigger = tooltip.querySelector(".tooltip-trigger");
      const content = tooltip.querySelector(".tooltip-content");

      if (trigger && content) {
        // Показываем тултип при клике на мобильных устройствах
        trigger.addEventListener("click", (e) => {
          e.preventDefault();

          // Скрываем другие тултипы
          document.querySelectorAll(".tooltip-content").forEach((t) => {
            if (t !== content) {
              t.style.opacity = "0";
              t.style.visibility = "hidden";
            }
          });

          // Переключаем текущий тултип
          const isVisible = content.style.opacity === "1";
          content.style.opacity = isVisible ? "0" : "1";
          content.style.visibility = isVisible ? "hidden" : "visible";
        });

        // Автоматическое скрытие тултипа при клике вне его
        document.addEventListener("click", (e) => {
          if (!tooltip.contains(e.target)) {
            content.style.opacity = "0";
            content.style.visibility = "hidden";
          }
        });
      }
    });
  }

  /**
   * Настройка валидации в реальном времени
   */
  setupRealTimeValidation() {
    // Валидация цены
    const priceField = document.getElementById("price");
    if (priceField) {
      priceField.addEventListener("input", () => {
        const value = parseFloat(priceField.value);
        const feedback =
          priceField.parentElement.querySelector(".invalid-feedback");

        if (value && value > 0) {
          // Форматируем цену с разделителями
          const formatted = new Intl.NumberFormat("ru-RU").format(value);

          // Показываем отформатированную цену в подсказке
          if (!priceField.parentElement.querySelector(".price-preview")) {
            const preview = document.createElement("div");
            preview.className = "price-preview form-text";
            preview.textContent = `${formatted} ₽`;
            priceField.parentElement.appendChild(preview);
          } else {
            priceField.parentElement.querySelector(
              ".price-preview"
            ).textContent = `${formatted} ₽`;
          }
        }
      });
    }

    // Валидация площади
    const areaField = document.getElementById("propertyArea");
    if (areaField) {
      areaField.addEventListener("input", () => {
        const value = parseFloat(areaField.value);

        if (value) {
          // Показываем примерную планировку
          let suggestion = "";
          if (value < 30) suggestion = "Студия или малогабаритная квартира";
          else if (value < 50) suggestion = "1-комнатная квартира";
          else if (value < 70) suggestion = "2-комнатная квартира";
          else if (value < 90) suggestion = "3-комнатная квартира";
          else suggestion = "Многокомнатная квартира или дом";

          if (!areaField.parentElement.querySelector(".area-suggestion")) {
            const suggestionEl = document.createElement("div");
            suggestionEl.className =
              "area-suggestion form-text text-brand-turquoise";
            suggestionEl.textContent = suggestion;
            areaField.parentElement.appendChild(suggestionEl);
          } else {
            areaField.parentElement.querySelector(
              ".area-suggestion"
            ).textContent = suggestion;
          }
        }
      });
    }
  }

  /**
   * Настройка сохранения состояния формы
   */
  setupFormPersistence() {
    const STORAGE_KEY = "add_listing_form_state";
    const SAVE_INTERVAL = 10000; // 10 секунд

    // Загружаем сохраненное состояние
    this.loadFormState();

    // Автосохранение
    setInterval(() => {
      this.saveFormState();
    }, SAVE_INTERVAL);

    // Сохраняем при изменении полей
    this.form.addEventListener("input", () => {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => {
        this.saveFormState();
      }, 2000);
    });

    // Очищаем состояние при успешной отправке
    this.form.addEventListener("submit", () => {
      setTimeout(() => {
        localStorage.removeItem(STORAGE_KEY);
      }, 1000);
    });

    // Показываем уведомление о восстановлении
    if (localStorage.getItem(STORAGE_KEY)) {
      this.showRestoreNotification();
    }
  }

  saveFormState() {
    const formData = new FormData(this.form);
    const state = {};

    for (const [key, value] of formData.entries()) {
      // Не сохраняем файлы
      if (key !== "imageUploadInput") {
        state[key] = value;
      }
    }

    // Сохраняем состояние чекбоксов
    const checkboxes = this.form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
      state[checkbox.name] = checkbox.checked;
    });

    try {
      localStorage.setItem(
        "add_listing_form_state",
        JSON.stringify({
          data: state,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.warn("Could not save form state:", error);
    }
  }

  loadFormState() {
    try {
      const saved = localStorage.getItem("add_listing_form_state");
      if (!saved) return;

      const { data, timestamp } = JSON.parse(saved);

      // Проверяем, не слишком ли старые данные (24 часа)
      if (Date.now() - timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem("add_listing_form_state");
        return;
      }

      // Восстанавливаем данные
      Object.entries(data).forEach(([name, value]) => {
        const field = this.form.querySelector(`[name="${name}"]`);
        if (field) {
          if (field.type === "checkbox") {
            field.checked = value;
          } else {
            field.value = value;
          }
        }
      });

      // Обновляем зависимые поля
      this.form.dispatchEvent(new Event("input", { bubbles: true }));
    } catch (error) {
      console.warn("Could not load form state:", error);
      localStorage.removeItem("add_listing_form_state");
    }
  }

  showRestoreNotification() {
    const notification = document.createElement("div");
    notification.className =
      "alert alert-info alert-dismissible fade show mb-3";
    notification.innerHTML = `
      <i class="bi bi-info-circle me-2"></i>
      Восстановлен черновик формы.
      <button type="button" class="btn btn-sm btn-outline-danger ms-3" onclick="this.clearDraft()">
        Удалить черновик
      </button>
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Метод для очистки черновика
    notification.querySelector("button").onclick = () => {
      localStorage.removeItem("add_listing_form_state");
      this.form.reset();
      notification.remove();
      createAndShowToast("Черновик удален", "info");
    };

    this.form.insertBefore(notification, this.form.firstChild);
  }

  /**
   * Настройка горячих клавиш
   */
  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Ctrl/Cmd + S - сохранить как черновик
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        const saveBtn = document.getElementById("saveAsDraftBtn");
        if (saveBtn) {
          saveBtn.click();
        }
      }

      // Ctrl/Cmd + Enter - опубликовать
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        const publishBtn = document.getElementById("publishBtn");
        if (publishBtn) {
          publishBtn.click();
        }
      }

      // Escape - очистить фокус
      if (e.key === "Escape") {
        if (document.activeElement && document.activeElement.blur) {
          document.activeElement.blur();
        }
      }
    });
  }

  /**
   * Добавляем методы для работы с изображениями
   */
  setupImageOptimization() {
    const fileInput = document.getElementById("imageUploadInput");

    if (fileInput) {
      fileInput.addEventListener("change", async (e) => {
        const files = Array.from(e.target.files);
        const optimizedFiles = [];

        for (const file of files) {
          if (file.type.startsWith("image/")) {
            try {
              const optimized = await this.optimizeImage(file);
              optimizedFiles.push(optimized);
            } catch (error) {
              console.warn("Image optimization failed:", error);
              optimizedFiles.push(file); // Используем оригинал
            }
          } else {
            optimizedFiles.push(file);
          }
        }

        // Обновляем FileList (это сложно, поэтому просто показываем прогресс)
        this.showOptimizationProgress(files.length, optimizedFiles.length);
      });
    }
  }

  async optimizeImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Вычисляем новые размеры
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Устанавливаем размеры canvas
        canvas.width = width;
        canvas.height = height;

        // Рисуем изображение
        ctx.drawImage(img, 0, 0, width, height);

        // Конвертируем в blob
        canvas.toBlob(resolve, "image/jpeg", quality);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  showOptimizationProgress(total, completed) {
    const progress = (completed / total) * 100;
    createAndShowToast(
      `Оптимизация изображений: ${completed}/${total}`,
      "info"
    );
  }

  /**
   * Публичные методы для управления формой
   */
  resetForm() {
    this.form.reset();
    localStorage.removeItem("add_listing_form_state");

    // Сбрасываем счетчики
    // document.querySelectorAll(".character-counter span").forEach((counter) => {
    //   counter.textContent = "0";
    // });

    // Сбрасываем прогресс
    if (this.validationProgress) {
      this.validationProgress.style.width = "0%";
    }

    createAndShowToast("Форма очищена", "info");
  }

  getFormData() {
    const formData = new FormData(this.form);
    const data = {};

    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }

    return data;
  }

  validateForm() {
    return this.form.checkValidity();
  }

  /**
   * Деструктор для очистки ресурсов
   */
  destroy() {
    clearTimeout(this.saveTimeout);

    // Удаляем обработчики событий
    document.removeEventListener("keydown", this.keyboardHandler);

    // Очищаем URLs для изображений
    document.querySelectorAll(".image-preview img").forEach((img) => {
      if (img.src.startsWith("blob:")) {
        URL.revokeObjectURL(img.src);
      }
    });
  }
}

// Экспорт для использования в других модулях
export default AddListingEnhancements;
