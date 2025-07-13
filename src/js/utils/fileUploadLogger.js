/**
 * Модуль для детального логирования загрузки файлов
 * Специально для диагностики проблем на Android устройствах
 */

class FileUploadLogger {
  constructor(context = "FileUpload") {
    this.context = context;
    this.startTime = Date.now();
    this.events = [];
    this.platform = this.detectPlatform();

    this.log("🚀 Инициализация FileUploadLogger", {
      context: this.context,
      platform: this.platform,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }

  detectPlatform() {
    const userAgent = navigator.userAgent;
    const isAndroid = /Android/.test(userAgent);
    const isIOS = /iPhone|iPad/.test(userAgent);
    const isTelegramMiniApp = window.Telegram && window.Telegram.WebApp;

    return {
      isAndroid,
      isIOS,
      isTelegramMiniApp,
      userAgent,
      webViewVersion: this.extractWebViewVersion(userAgent),
    };
  }

  extractWebViewVersion(userAgent) {
    // Извлекаем версию WebView для Android
    const webViewMatch = userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
    const androidMatch = userAgent.match(/Android (\d+\.\d+)/);

    return {
      chrome: webViewMatch ? webViewMatch[1] : "unknown",
      android: androidMatch ? androidMatch[1] : "unknown",
    };
  }

  log(message, data = {}) {
    const timestamp = Date.now() - this.startTime;
    const logEntry = {
      timestamp,
      message,
      data,
      platform: this.platform.isAndroid
        ? "Android"
        : this.platform.isIOS
        ? "iOS"
        : "Other",
    };

    // Сохраняем в массив событий
    this.events.push(logEntry);

    // Выводим в консоль с цветовой кодировкой
    const prefix = this.platform.isAndroid
      ? "🤖 [ANDROID]"
      : this.platform.isIOS
      ? "🍎 [iOS]"
      : "💻 [OTHER]";

    console.log(`${prefix} [${timestamp}ms] ${message}`, data);
  }

  logEvent(eventName, element, eventData = {}) {
    this.log(`📅 Событие: ${eventName}`, {
      element: element
        ? {
            tagName: element.tagName,
            id: element.id,
            className: element.className,
            type: element.type,
          }
        : null,
      eventData,
      filesCount: element && element.files ? element.files.length : 0,
    });
  }

  logFileSelection(files, source = "unknown") {
    const fileDetails = files
      ? Array.from(files).map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        }))
      : [];

    this.log(`📂 Выбор файлов из: ${source}`, {
      filesCount: files ? files.length : 0,
      files: fileDetails,
      totalSize: fileDetails.reduce((sum, file) => sum + file.size, 0),
    });
  }

  logFileListUpdate(before, after, operation = "unknown") {
    this.log(`🔄 Обновление списка файлов: ${operation}`, {
      before: {
        count: before.length,
        names: before.map((f) => f.name),
      },
      after: {
        count: after.length,
        names: after.map((f) => f.name),
      },
      operation,
    });
  }

  logElementState(element, stateName) {
    if (!element) {
      this.log(`❌ Элемент отсутствует для проверки состояния: ${stateName}`);
      return;
    }

    const state = {
      exists: !!element,
      visible: element.offsetParent !== null,
      disabled: element.disabled,
      readonly: element.readOnly,
      value: element.value,
      filesCount: element.files ? element.files.length : 0,
      accept: element.accept,
      multiple: element.multiple,
      style: {
        display: getComputedStyle(element).display,
        visibility: getComputedStyle(element).visibility,
        opacity: getComputedStyle(element).opacity,
      },
    };

    this.log(`🔍 Состояние элемента (${stateName}):`, state);
  }

  logDataTransferOperation(operation, files, success = true, error = null) {
    this.log(`🔀 DataTransfer операция: ${operation}`, {
      operation,
      filesCount: files ? files.length : 0,
      success,
      error: error ? error.message : null,
      supportsDataTransfer: "DataTransfer" in window,
    });
  }

  logAndroidSpecific(action, data = {}) {
    if (!this.platform.isAndroid) return;

    this.log(`🤖 Android специфично: ${action}`, {
      ...data,
      webViewVersion: this.platform.webViewVersion,
      hasTouchEvents: "ontouchstart" in window,
      hasFileAPI: "File" in window && "FileList" in window,
      hasDataTransfer: "DataTransfer" in window,
    });
  }

  logIOSSpecific(action, data = {}) {
    if (!this.platform.isIOS) return;

    this.log(`🍎 iOS специфично: ${action}`, {
      ...data,
      isTelegramWebApp: this.platform.isTelegramMiniApp,
      hasFileAPI: "File" in window && "FileList" in window,
      hasDataTransfer: "DataTransfer" in window,
    });
  }

  logError(error, context = "general") {
    this.log(`❌ Ошибка в ${context}:`, {
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
    });
  }

  logTiming(operation, startTime, endTime = Date.now()) {
    const duration = endTime - startTime;
    this.log(`⏱️ Время выполнения ${operation}: ${duration}ms`);
  }

  // Метод для получения полного отчета о событиях
  getReport() {
    return {
      platform: this.platform,
      totalEvents: this.events.length,
      duration: Date.now() - this.startTime,
      events: this.events,
      summary: this.generateSummary(),
    };
  }

  generateSummary() {
    const eventTypes = {};
    this.events.forEach((event) => {
      const type = event.message.split(":")[0];
      eventTypes[type] = (eventTypes[type] || 0) + 1;
    });

    return {
      eventTypes,
      hasErrors: this.events.some((e) => e.message.includes("❌")),
      hasFileSelection: this.events.some((e) => e.message.includes("📂")),
      hasDataTransferOps: this.events.some((e) => e.message.includes("🔀")),
    };
  }

  // Метод для экспорта логов (для отправки в поддержку)
  exportLogs() {
    const report = this.getReport();
    const exportData = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...report,
    };

    console.log("📊 Полный отчет о загрузке файлов:", exportData);
    return JSON.stringify(exportData, null, 2);
  }

  // Метод для создания альтернативного способа загрузки файлов на Android
  createAndroidFileUploadFallback(container, fileInput, onFilesSelected) {
    if (!this.platform.isAndroid) return null;

    this.log("🤖 Создание альтернативного способа загрузки для Android");

    // Создаем видимую кнопку для пользовательского клика
    const fallbackButton = document.createElement("button");
    fallbackButton.type = "button";
    fallbackButton.className = "btn btn-outline-primary btn-sm mt-2";
    fallbackButton.innerHTML = "📁 Выбрать файлы (Android)";
    fallbackButton.style.display = "block";
    fallbackButton.style.width = "100%";

    // Создаем скрытый input для этой кнопки
    const hiddenInput = document.createElement("input");
    hiddenInput.type = "file";
    hiddenInput.accept = fileInput.accept;
    hiddenInput.multiple = fileInput.multiple;
    hiddenInput.style.display = "none";

    hiddenInput.addEventListener("change", (e) => {
      this.logAndroidSpecific("Альтернативная кнопка: файлы выбраны", {
        filesCount: e.target.files ? e.target.files.length : 0,
      });

      if (e.target.files && e.target.files.length > 0) {
        onFilesSelected(e.target.files);
      }
    });

    fallbackButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.logAndroidSpecific("Клик по альтернативной кнопке");
      hiddenInput.click();
    });

    // Добавляем элементы в контейнер
    container.appendChild(hiddenInput);
    container.appendChild(fallbackButton);

    this.log("✅ Альтернативная кнопка загрузки создана");

    return {
      button: fallbackButton,
      input: hiddenInput,
      remove: () => {
        container.removeChild(fallbackButton);
        container.removeChild(hiddenInput);
        this.log("🗑️ Альтернативная кнопка удалена");
      },
    };
  }
}

export { FileUploadLogger };
