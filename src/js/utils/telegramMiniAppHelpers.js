/**
 * Вспомогательные функции для работы с Telegram Mini App
 */

/**
 * Проверяет, запущено ли приложение в Telegram Mini App
 */
export const isTelegramMiniApp = () => {
  return !!(window.Telegram && window.Telegram.WebApp);
};

/**
 * Получает информацию о Telegram WebApp
 */
export const getTelegramWebApp = () => {
  if (!isTelegramMiniApp()) return null;
  return window.Telegram.WebApp;
};

/**
 * Расширенная настройка file input для Telegram Mini App
 * @param {HTMLInputElement} fileInput - элемент input[type="file"]
 * @param {Function} onFilesChange - callback функция при изменении файлов
 * @param {Object} options - дополнительные опции
 */
export const setupTelegramFileInput = (
  fileInput,
  onFilesChange,
  options = {}
) => {
  const {
    pollInterval = 500,
    maxPollDuration = 30000,
    enableDetailedLogging = true,
  } = options;

  if (!fileInput || typeof onFilesChange !== "function") {
    console.error("❌ setupTelegramFileInput: неверные параметры");
    return null;
  }

  const log = enableDetailedLogging ? console.log : () => {};

  log("🚀 Настройка Telegram-совместимого file input");

  // Массив обработчиков событий для очистки
  const eventListeners = [];

  // Последнее состояние файлов
  let lastFileCount = 0;
  let lastFileSignature = "";

  // Функция создания уникальной подписи файлов
  const createFileSignature = (files) => {
    if (!files || files.length === 0) return "";
    return Array.from(files)
      .map((file) => `${file.name}-${file.size}-${file.lastModified}`)
      .join("|");
  };

  // Функция проверки изменений файлов
  const checkFileChanges = () => {
    if (!fileInput.files) return false;

    const currentCount = fileInput.files.length;
    const currentSignature = createFileSignature(fileInput.files);

    if (
      currentCount !== lastFileCount ||
      currentSignature !== lastFileSignature
    ) {
      log(`📊 Изменение файлов: ${lastFileCount} -> ${currentCount}`);

      lastFileCount = currentCount;
      lastFileSignature = currentSignature;

      if (currentCount > 0) {
        log("✅ Вызываем callback с новыми файлами");
        onFilesChange(fileInput.files);
        return true;
      }
    }
    return false;
  };

  // Основной обработчик change
  const handleChange = (e) => {
    log("📁 Событие change:", e.target.files);
    if (e.target.files && e.target.files.length > 0) {
      onFilesChange(e.target.files);
    }
  };

  // Дополнительный обработчик input
  const handleInput = (e) => {
    log("⌨️ Событие input:", e.target.files);
    if (e.target.files && e.target.files.length > 0) {
      onFilesChange(e.target.files);
    }
  };

  // Обработчик focus/blur для отладки
  const handleFocus = () => log("🎯 File input получил фокус");
  const handleBlur = () => log("💨 File input потерял фокус");

  // Добавляем основные обработчики
  fileInput.addEventListener("change", handleChange);
  fileInput.addEventListener("input", handleInput);
  fileInput.addEventListener("focus", handleFocus);
  fileInput.addEventListener("blur", handleBlur);

  eventListeners.push(
    { element: fileInput, event: "change", handler: handleChange },
    { element: fileInput, event: "input", handler: handleInput },
    { element: fileInput, event: "focus", handler: handleFocus },
    { element: fileInput, event: "blur", handler: handleBlur }
  );

  // MutationObserver для отслеживания изменений
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "files"
      ) {
        log("🔍 MutationObserver: изменения обнаружены");
        checkFileChanges();
      }
    });
  });

  observer.observe(fileInput, { attributes: true });

  // Периодическая проверка (fallback для Telegram)
  const pollInterval_ = setInterval(() => {
    if (checkFileChanges()) {
      // Останавливаем проверку после успешного обнаружения
      clearInterval(pollInterval_);
      log("⏰ Периодическая проверка завершена (файлы найдены)");
    }
  }, pollInterval);

  // Автоматическая остановка через максимальное время
  const pollTimeout = setTimeout(() => {
    clearInterval(pollInterval_);
    log("⏰ Периодическая проверка остановлена (тайм-аут)");
  }, maxPollDuration);

  // Специальные обработчики для Telegram Mini App
  if (isTelegramMiniApp()) {
    log("📱 Настройка дополнительных обработчиков для Telegram");

    // Обработчик изменения видимости страницы
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        log("👁️ Страница стала видимой");
        setTimeout(checkFileChanges, 100);
      }
    };

    // Обработчик фокуса окна
    const handleWindowFocus = () => {
      log("🔄 Окно получило фокус");
      setTimeout(checkFileChanges, 100);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    eventListeners.push(
      {
        element: document,
        event: "visibilitychange",
        handler: handleVisibilityChange,
      },
      { element: window, event: "focus", handler: handleWindowFocus }
    );

    // Обработчики Telegram WebApp событий
    const webApp = getTelegramWebApp();
    if (webApp && webApp.onEvent) {
      const handleViewportChange = () => {
        log("📱 Telegram viewport изменился");
        setTimeout(checkFileChanges, 100);
      };

      webApp.onEvent("viewportChanged", handleViewportChange);

      // Сохраняем для очистки (специальный формат для Telegram)
      eventListeners.push({
        isTelegramEvent: true,
        eventName: "viewportChanged",
        handler: handleViewportChange,
      });
    }
  }

  // Функция очистки всех обработчиков
  const cleanup = () => {
    log("🧹 Очистка обработчиков file input");

    // Очищаем обычные обработчики
    eventListeners.forEach(
      ({ element, event, handler, isTelegramEvent, eventName }) => {
        if (isTelegramEvent) {
          // Очистка Telegram событий
          const webApp = getTelegramWebApp();
          if (webApp && webApp.offEvent) {
            webApp.offEvent(eventName, handler);
          }
        } else if (element && event && handler) {
          element.removeEventListener(event, handler);
        }
      }
    );

    // Очищаем наблюдатель
    if (observer) {
      observer.disconnect();
    }

    // Очищаем интервалы
    clearInterval(pollInterval_);
    clearTimeout(pollTimeout);
  };

  // Возвращаем объект с методами управления
  return {
    cleanup,
    checkFileChanges,
    getLastFileCount: () => lastFileCount,
    getLastFileSignature: () => lastFileSignature,
  };
};

/**
 * Создает универсальный обработчик для кнопки/label файла
 * @param {HTMLElement} trigger - элемент, по которому кликают
 * @param {HTMLInputElement} fileInput - input[type="file"]
 */
export const setupFileTrigger = (trigger, fileInput) => {
  if (!trigger || !fileInput) {
    console.error("❌ setupFileTrigger: неверные параметры");
    return null;
  }

  const handleClick = (e) => {
    e.preventDefault();
    console.log("🖱️ Клик по триггеру файлов, открываем диалог");

    // Для некоторых случаев в Telegram может потребоваться задержка
    if (isTelegramMiniApp()) {
      setTimeout(() => fileInput.click(), 10);
    } else {
      fileInput.click();
    }
  };

  trigger.addEventListener("click", handleClick);

  return {
    cleanup: () => trigger.removeEventListener("click", handleClick),
  };
};

/**
 * Настройка Drag & Drop с улучшенной поддержкой для мобильных устройств
 * @param {HTMLElement} dropArea - область для drag & drop
 * @param {Function} onFileDrop - callback при сбросе файлов
 */
export const setupDragDrop = (dropArea, onFileDrop) => {
  if (!dropArea || typeof onFileDrop !== "function") {
    console.error("❌ setupDragDrop: неверные параметры");
    return null;
  }

  const eventListeners = [];

  // Проверяем поддержку drag & drop
  const supportsDragDrop =
    "draggable" in document.createElement("div") &&
    "ondrop" in document.createElement("div");

  if (!supportsDragDrop) {
    console.warn("⚠️ Drag & Drop не поддерживается в этом браузере");
    return null;
  }

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.add("drag-over");
    console.log("🔄 Dragover");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove("drag-over");
    console.log("🔄 Dragleave");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropArea.classList.remove("drag-over");

    const files = e.dataTransfer.files;
    console.log("🎯 Drop event:", files);

    if (files && files.length > 0) {
      onFileDrop(files);
    }
  };

  // Добавляем обработчики
  dropArea.addEventListener("dragover", handleDragOver);
  dropArea.addEventListener("dragenter", handleDragOver);
  dropArea.addEventListener("dragleave", handleDragLeave);
  dropArea.addEventListener("drop", handleDrop);

  eventListeners.push(
    { element: dropArea, event: "dragover", handler: handleDragOver },
    { element: dropArea, event: "dragenter", handler: handleDragOver },
    { element: dropArea, event: "dragleave", handler: handleDragLeave },
    { element: dropArea, event: "drop", handler: handleDrop }
  );

  return {
    cleanup: () => {
      eventListeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
    },
  };
};

/**
 * Универсальная функция для настройки полноценной загрузки файлов
 * @param {Object} config - конфигурация
 */
export const setupUniversalFileUpload = (config) => {
  const {
    fileInput,
    uploadButton,
    fileLabel,
    dropArea,
    onFilesChange,
    options = {},
  } = config;

  if (!fileInput || !onFilesChange) {
    console.error(
      "❌ setupUniversalFileUpload: отсутствуют обязательные параметры"
    );
    return null;
  }

  console.log("🚀 Настройка универсальной загрузки файлов");

  const cleanupFunctions = [];

  // Настраиваем основной file input
  const fileInputSetup = setupTelegramFileInput(
    fileInput,
    onFilesChange,
    options
  );
  if (fileInputSetup) {
    cleanupFunctions.push(fileInputSetup.cleanup);
  }

  // Настраиваем кнопку загрузки
  if (uploadButton) {
    const buttonSetup = setupFileTrigger(uploadButton, fileInput);
    if (buttonSetup) {
      cleanupFunctions.push(buttonSetup.cleanup);
    }
  }

  // Настраиваем label
  if (fileLabel) {
    const labelSetup = setupFileTrigger(fileLabel, fileInput);
    if (labelSetup) {
      cleanupFunctions.push(labelSetup.cleanup);
    }
  }

  // Настраиваем drag & drop
  if (dropArea) {
    const dragDropSetup = setupDragDrop(dropArea, onFilesChange);
    if (dragDropSetup) {
      cleanupFunctions.push(dragDropSetup.cleanup);
    }
  }

  return {
    cleanup: () => {
      console.log("🧹 Очистка универсальной загрузки файлов");
      cleanupFunctions.forEach((cleanup) => cleanup());
    },
    fileInputSetup,
  };
};

/**
 * Настройка обработки телефонных ссылок в Telegram Mini App
 * Исправляет проблемы с tel: ссылками на iOS в Telegram
 */

/**
 * Обработчик клика по телефонной ссылке
 * @param {Event} event - событие клика
 */
const handleTelClick = (event) => {
  event.preventDefault();
  event.stopPropagation();

  const telUrl = event.currentTarget.href;

  // Используем Telegram WebApp API для открытия ссылки
  try {
    // Telegram WebApp автоматически откроет системный диалер
    window.Telegram.WebApp.openLink(telUrl);
    console.log("📞 Открыта tel: ссылка через Telegram WebApp:", telUrl);
  } catch (error) {
    console.error("❌ Ошибка при открытии tel: ссылки через Telegram:", error);

    // Fallback: пытаемся открыть через window.open
    try {
      window.open(telUrl, "_system");
      console.log("📞 Открыта tel: ссылка через window.open:", telUrl);
    } catch (fallbackError) {
      console.error("❌ Fallback также не сработал:", fallbackError);

      // Последний вариант: показываем номер пользователю
      const phoneNumber = telUrl
        .replace("tel:", "")
        .replace(/[^\d+\-\s()]/g, "");
      alert("Позвонить по номеру: " + phoneNumber);
    }
  }
};

/**
 * Применяет обработчики к телефонным ссылкам
 * @param {HTMLElement} container - контейнер для поиска ссылок (по умолчанию document)
 */
export const setupTelLinks = (container = document) => {
  if (!isTelegramMiniApp()) {
    console.log("ℹ️ Не Telegram Mini App, пропускаем настройку tel: ссылок");
    return null;
  }

  const telLinks = container.querySelectorAll('a[href^="tel:"]');

  telLinks.forEach((link) => {
    // Удаляем старые обработчики если есть
    link.removeEventListener("click", handleTelClick);

    // Добавляем новый обработчик с capture=true для приоритета
    link.addEventListener("click", handleTelClick, true);
  });

  console.log(`📞 Настроено ${telLinks.length} tel: ссылок в контейнере`);

  return {
    linksCount: telLinks.length,
    cleanup: () => {
      telLinks.forEach((link) => {
        link.removeEventListener("click", handleTelClick, true);
      });
    },
  };
};

/**
 * Инициализирует автоматическую обработку телефонных ссылок с отслеживанием изменений DOM
 * @param {Object} options - опции настройки
 */
export const initTelegramTelLinksHandler = (options = {}) => {
  const {
    autoSetup = true,
    watchDOMChanges = true,
    container = document.body,
    enableLogging = true,
  } = options;

  if (!isTelegramMiniApp()) {
    if (enableLogging) {
      console.log(
        "ℹ️ Не Telegram Mini App, обработчик tel: ссылок не инициализирован"
      );
    }
    return null;
  }

  const log = enableLogging ? console.log : () => {};
  log("🚀 Инициализация Telegram Tel Links Handler");

  let observer = null;
  let setupResult = null;

  // Функция для переинициализации обработчиков
  const reinitializeHandlers = () => {
    if (setupResult && setupResult.cleanup) {
      setupResult.cleanup();
    }
    setupResult = setupTelLinks(container);
  };

  // Начальная настройка
  if (autoSetup) {
    setupResult = setupTelLinks(container);
  }

  // Настройка отслеживания изменений DOM
  if (watchDOMChanges) {
    observer = new MutationObserver((mutations) => {
      let shouldReinitialize = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // Element node
              if (
                node.tagName === "A" &&
                node.href &&
                node.href.startsWith("tel:")
              ) {
                shouldReinitialize = true;
              } else if (
                node.querySelector &&
                node.querySelector('a[href^="tel:"]')
              ) {
                shouldReinitialize = true;
              }
            }
          });
        }
      });

      if (shouldReinitialize) {
        log("🔄 Обнаружены новые tel: ссылки, переинициализация...");
        reinitializeHandlers();
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
    });

    log("👁️ MutationObserver для tel: ссылок активирован");
  }

  // Возвращаем объект управления
  return {
    reinitialize: reinitializeHandlers,
    setupTelLinks: (customContainer) => setupTelLinks(customContainer),
    cleanup: () => {
      if (observer) {
        observer.disconnect();
        log("🧹 MutationObserver для tel: ссылок отключен");
      }
      if (setupResult && setupResult.cleanup) {
        setupResult.cleanup();
        log("🧹 Обработчики tel: ссылок очищены");
      }
    },
    getLinksCount: () => (setupResult ? setupResult.linksCount : 0),
  };
};

/**
 * Простая функция для быстрой настройки tel: ссылок в конкретных элементах
 * Удобно для использования в компонентах
 * @param {string} selector - CSS селектор для поиска ссылок
 * @param {HTMLElement} container - контейнер для поиска (по умолчанию document)
 */
export const setupTelLinksForSelector = (selector, container = document) => {
  if (!isTelegramMiniApp()) return null;

  const elements = container.querySelectorAll(selector);
  let totalLinks = 0;

  elements.forEach((element) => {
    const result = setupTelLinks(element);
    if (result) {
      totalLinks += result.linksCount;
    }
  });

  console.log(
    `📞 Настроено ${totalLinks} tel: ссылок для селектора "${selector}"`
  );

  return { totalLinks };
};

/**
 * Автоматическая инициализация при загрузке страницы
 * Вызывается автоматически если модуль импортирован
 */
const autoInitTelLinks = () => {
  // Проверяем готовность DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initTelegramTelLinksHandler();
    });
  } else {
    // DOM уже загружен
    if (isTelegramMiniApp()) {
      initTelegramTelLinksHandler();
    } else {
      // Ждем загрузки Telegram WebApp
      let attempts = 0;
      const maxAttempts = 50; // 5 секунд максимум

      const checkTelegram = setInterval(() => {
        attempts++;
        if (isTelegramMiniApp()) {
          clearInterval(checkTelegram);
          initTelegramTelLinksHandler();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkTelegram);
          console.warn("⚠️ Telegram WebApp не загрузился за отведенное время");
        }
      }, 100);
    }
  }
};

// Автоматическая инициализация (можно отключить, экспортировав переменную)
if (typeof window !== "undefined" && !window.DISABLE_AUTO_TEL_LINKS_INIT) {
  autoInitTelLinks();
}
