// src/js/pages/add-listing-complete.js - Полная интеграция формы добавления объявления

import "../../forms/index.js"; // Подключаем систему форм
import { AddListingEnhancements } from "./add_listing_enhancements.js";
import { initAddListingForm } from "./add_listing_integration.js";

/**
 * Полная инициализация страницы добавления объявления
 */
class AddListingPageManager {
  constructor() {
    this.form = null;
    this.formManager = null;
    this.enhancements = null;

    this.init();
  }

  async init() {
    try {
      // Ждем полной загрузки DOM
      if (document.readyState === "loading") {
        await new Promise((resolve) => {
          document.addEventListener("DOMContentLoaded", resolve);
        });
      }

      // Проверяем, что мы на правильной странице
      if (!document.querySelector(".add-listing-page")) {
        return;
      }

      console.log("🏠 Initializing Add Listing Page...");

      // Инициализируем основную форму
      this.formManager = initAddListingForm();
      this.form = document.getElementById("addListingForm");

      if (!this.form || !this.formManager) {
        throw new Error("Form or FormManager not found");
      }

      // Инициализируем улучшения
      this.enhancements = new AddListingEnhancements(this.form);

      // Настраиваем дополнительные обработчики
      this.setupAdditionalHandlers();

      // Настраиваем мониторинг производительности
      this.setupPerformanceMonitoring();

      // Настраиваем аналитику
      this.setupAnalytics();

      console.log("✅ Add Listing Page initialized successfully");
    } catch (error) {
      console.error("❌ Error initializing Add Listing Page:", error);
      this.showErrorMessage(
        "Ошибка инициализации формы. Перезагрузите страницу."
      );
    }
  }

  /**
   * Настройка дополнительных обработчиков
   */
  setupAdditionalHandlers() {
    // Обработчик для предотвращения потери данных
    this.setupBeforeUnloadHandler();

    // Обработчик для автоматического сохранения
    this.setupAutoSave();

    // Обработчик для восстановления сессии
    this.setupSessionRecovery();

    // Обработчик для оптимизации изображений
    this.setupImageHandling();
  }

  /**
   * Предотвращение потери данных при закрытии страницы
   */
  setupBeforeUnloadHandler() {
    let formChanged = false;

    // Отслеживаем изменения в форме
    this.form.addEventListener("input", () => {
      formChanged = true;
    });

    this.form.addEventListener("change", () => {
      formChanged = true;
    });

    // Сбрасываем флаг при отправке формы
    this.form.addEventListener("submit", () => {
      formChanged = false;
    });

    // Предупреждаем о потере данных
    window.addEventListener("beforeunload", (e) => {
      if (formChanged) {
        e.preventDefault();
        e.returnValue =
          "У вас есть несохраненные изменения. Покинуть страницу?";
        return e.returnValue;
      }
    });
  }

  /**
   * Автоматическое сохранение формы
   */
  setupAutoSave() {
    let autoSaveInterval;
    const AUTOSAVE_INTERVAL = 30000; // 30 секунд

    const startAutoSave = () => {
      autoSaveInterval = setInterval(() => {
        this.autoSaveForm();
      }, AUTOSAVE_INTERVAL);
    };

    const stopAutoSave = () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
      }
    };

    // Запускаем автосохранение при первом изменении
    this.form.addEventListener(
      "input",
      () => {
        if (!autoSaveInterval) {
          startAutoSave();
        }
      },
      { once: true }
    );

    // Останавливаем при отправке формы
    this.form.addEventListener("submit", stopAutoSave);

    // Останавливаем при уходе со страницы
    window.addEventListener("beforeunload", stopAutoSave);
  }

  async autoSaveForm() {
    try {
      const formData = new FormData(this.form);
      const data = {};

      // Собираем только базовые данные (без файлов)
      for (const [key, value] of formData.entries()) {
        if (key !== "imageUploadInput") {
          data[key] = value;
        }
      }

      // Отправляем на сервер как черновик
      const response = await fetch("/api/listings/autosave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      });

      if (response.ok) {
        this.showAutoSaveIndicator();
      }
    } catch (error) {
      console.warn("Autosave failed:", error);
    }
  }

  showAutoSaveIndicator() {
    // Показываем ненавязчивый индикатор автосохранения
    let indicator = document.querySelector(".autosave-indicator");

    if (!indicator) {
      indicator = document.createElement("div");
      indicator.className = "autosave-indicator";
      indicator.innerHTML = '<i class="bi bi-cloud-check"></i> Автосохранено';
      document.body.appendChild(indicator);
    }

    indicator.style.display = "block";
    indicator.style.opacity = "1";

    setTimeout(() => {
      indicator.style.opacity = "0";
      setTimeout(() => {
        indicator.style.display = "none";
      }, 300);
    }, 2000);
  }

  /**
   * Восстановление сессии
   */
  setupSessionRecovery() {
    // Проверяем, есть ли сохраненная сессия на сервере
    this.checkForSavedSession();
  }

  async checkForSavedSession() {
    try {
      const response = await fetch("/api/listings/check-session", {
        method: "GET",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      if (response.ok) {
        const sessionData = await response.json();

        if (sessionData.hasSavedData) {
          this.showSessionRecoveryDialog(sessionData);
        }
      }
    } catch (error) {
      console.warn("Session check failed:", error);
    }
  }

  showSessionRecoveryDialog(sessionData) {
    const modal = document.createElement("div");
    modal.className = "modal fade";
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Восстановить сессию?</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p>Найдена несохраненная форма от ${new Date(
              sessionData.timestamp
            ).toLocaleString()}.</p>
            <p>Восстановить данные?</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Нет</button>
            <button type="button" class="btn btn-primary" onclick="this.restoreSession()">Восстановить</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Показываем модальное окно
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    // Обработчик восстановления
    modal.querySelector(".btn-primary").onclick = () => {
      this.restoreSessionData(sessionData.data);
      bootstrapModal.hide();
      modal.remove();
    };

    // Удаляем модальное окно после закрытия
    modal.addEventListener("hidden.bs.modal", () => {
      modal.remove();
    });
  }

  restoreSessionData(data) {
    Object.entries(data).forEach(([name, value]) => {
      const field = this.form.querySelector(`[name="${name}"]`);
      if (field) {
        if (field.type === "checkbox") {
          field.checked = value;
        } else {
          field.value = value;
        }

        // Триггерим события для обновления UI
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    this.showSuccessMessage("Данные восстановлены");
  }

  /**
   * Обработка изображений
   */
  setupImageHandling() {
    const fileInput = document.getElementById("imageUploadInput");

    if (fileInput) {
      // Добавляем обработчик для валидации файлов
      fileInput.addEventListener("change", (e) => {
        this.validateImages(e.target.files);
      });

      // Добавляем поддержку paste для изображений
      document.addEventListener("paste", (e) => {
        const items = e.clipboardData?.items;
        if (items) {
          for (const item of items) {
            if (item.type.startsWith("image/")) {
              const file = item.getAsFile();
              if (file) {
                this.addImageToInput(file);
              }
            }
          }
        }
      });
    }
  }

  validateImages(files) {
    const maxFiles = 10;
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    let validFiles = 0;
    let errors = [];

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: неподдерживаемый формат`);
      } else if (file.size > maxSize) {
        errors.push(`${file.name}: файл слишком большой`);
      } else {
        validFiles++;
      }
    });

    if (validFiles > maxFiles) {
      errors.push(`Максимум ${maxFiles} изображений`);
    }

    if (errors.length > 0) {
      this.showErrorMessage(`Ошибки в файлах:\n${errors.join("\n")}`);
    }

    return errors.length === 0;
  }

  addImageToInput(file) {
    const fileInput = document.getElementById("imageUploadInput");
    const dt = new DataTransfer();

    // Добавляем существующие файлы
    Array.from(fileInput.files).forEach((f) => dt.items.add(f));

    // Добавляем новый файл
    dt.items.add(file);

    fileInput.files = dt.files;

    // Триггерим событие change
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));
  }

  /**
   * Мониторинг производительности
   */
  setupPerformanceMonitoring() {
    // Измеряем время инициализации
    performance.mark("form-init-complete");
    performance.measure(
      "form-initialization",
      "form-init-start",
      "form-init-complete"
    );

    // Отслеживаем время валидации
    this.form.addEventListener("submit", () => {
      performance.mark("form-validation-start");
    });

    // Отслеживаем производительность загрузки изображений
    const fileInput = document.getElementById("imageUploadInput");
    if (fileInput) {
      fileInput.addEventListener("change", () => {
        performance.mark("image-processing-start");

        setTimeout(() => {
          performance.mark("image-processing-end");
          performance.measure(
            "image-processing",
            "image-processing-start",
            "image-processing-end"
          );
        }, 100);
      });
    }
  }

  /**
   * Настройка аналитики
   */
  setupAnalytics() {
    // Отслеживаем события формы для аналитики
    const trackEvent = (action, label, value) => {
      if (window.gtag) {
        window.gtag("event", action, {
          event_category: "add_listing_form",
          event_label: label,
          value: value,
        });
      }
    };

    // Отслеживаем начало заполнения формы
    this.form.addEventListener(
      "input",
      () => {
        trackEvent("form_start", "user_started_filling_form");
      },
      { once: true }
    );

    // Отслеживаем прогресс заполнения
    let lastProgressPercent = 0;
    this.form.addEventListener("input", () => {
      const progress = this.calculateFormProgress();
      const progressPercent = Math.floor(progress / 10) * 10; // Округляем до 10%

      if (progressPercent > lastProgressPercent && progressPercent >= 50) {
        trackEvent(
          "form_progress",
          `progress_${progressPercent}`,
          progressPercent
        );
        lastProgressPercent = progressPercent;
      }
    });

    // Отслеживаем отправку формы
    this.form.addEventListener("submit", () => {
      trackEvent("form_submit", "form_submitted");
    });

    // Отслеживаем ошибки валидации
    this.form.addEventListener(
      "invalid",
      (e) => {
        trackEvent("validation_error", e.target.name);
      },
      true
    );
  }

  calculateFormProgress() {
    const requiredFields = this.form.querySelectorAll("[required]");
    let filledFields = 0;

    requiredFields.forEach((field) => {
      if (field.type === "checkbox") {
        if (field.checked) filledFields++;
      } else if (field.value.trim() !== "") {
        filledFields++;
      }
    });

    return (filledFields / requiredFields.length) * 100;
  }

  /**
   * Утилитарные методы для показа сообщений
   */
  showSuccessMessage(message) {
    if (window.createAndShowToast) {
      window.createAndShowToast(message, "success");
    } else {
      alert(message);
    }
  }

  showErrorMessage(message) {
    if (window.createAndShowToast) {
      window.createAndShowToast(message, "error");
    } else {
      alert(message);
    }
  }

  showInfoMessage(message) {
    if (window.createAndShowToast) {
      window.createAndShowToast(message, "info");
    } else {
      alert(message);
    }
  }

  /**
   * Публичные методы для внешнего управления
   */
  getFormData() {
    return this.enhancements ? this.enhancements.getFormData() : null;
  }
}

export default AddListingPageManager;
