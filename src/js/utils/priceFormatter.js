/**
 * Утилиты для форматирования цены
 */

/**
 * Форматирует цену с пробелами для улучшения читаемости
 * @param {string|number} value - Значение цены
 * @returns {string} Отформатированная цена с пробелами
 * @example
 * formatPrice('3000000') // '3 000 000'
 * formatPrice('400000') // '400 000'
 * formatPrice('20000') // '20 000'
 * formatPrice('1000') // '1 000'
 */
export function formatPrice(value) {
  // Приводим к строке и убираем все нечисловые символы кроме цифр
  const numericValue = String(value).replace(/\D/g, "");

  // Если значение пустое, возвращаем пустую строку
  if (!numericValue) return "";

  // Форматируем с пробелами каждые 3 цифры справа
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Получает числовое значение цены без пробелов и других символов
 * @param {string} value - Отформатированная цена
 * @returns {string} Числовое значение без пробелов
 * @example
 * getNumericPrice('3 000 000') // '3000000'
 * getNumericPrice('400 000') // '400000'
 */
export function getNumericPrice(value) {
  return String(value).replace(/\D/g, "");
}

/**
 * Настраивает форматирование цены для поля ввода
 * @param {HTMLElement} form - Форма, содержащая поле цены
 * @param {string} fieldSelector - Селектор поля цены (по умолчанию '#price')
 */
export function setupPriceFormatting(form, fieldSelector = "#price") {
  // Проверяем, что form существует и является DOM-элементом
  if (!form || typeof form.querySelector !== "function") {
    console.warn(`Форма не найдена или не является DOM-элементом:`, form);
    return;
  }

  const priceField = form.querySelector(fieldSelector);

  if (!priceField) {
    console.warn(`Поле цены не найдено: ${fieldSelector} в форме:`, form);
    return;
  }

  // Форматируем при вводе
  priceField.addEventListener("input", (e) => {
    const cursorPosition = e.target.selectionStart;
    const oldValue = e.target.value;
    const newValue = formatPrice(oldValue);

    // Обновляем значение
    e.target.value = newValue;

    // Восстанавливаем позицию курсора с учетом добавленных пробелов
    const oldValueWithoutSpaces = oldValue.replace(/\s/g, "");
    const newValueWithoutSpaces = newValue.replace(/\s/g, "");
    const spacesAdded = newValue.length - newValueWithoutSpaces.length;
    const oldSpaces = oldValue.length - oldValueWithoutSpaces.length;
    const newCursorPosition = cursorPosition + (spacesAdded - oldSpaces);

    e.target.setSelectionRange(newCursorPosition, newCursorPosition);
  });

  // Форматируем при потере фокуса
  priceField.addEventListener("blur", (e) => {
    e.target.value = formatPrice(e.target.value);
  });

  // Форматируем начальное значение если оно есть
  if (priceField.value) {
    priceField.value = formatPrice(priceField.value);
  }

  console.log(`✅ Форматирование цены настроено для поля: ${fieldSelector}`);
}

/**
 * Обрабатывает цену перед отправкой формы
 * @param {FormData} formData - Данные формы
 * @param {string} fieldName - Имя поля цены (по умолчанию 'price')
 */
export function processPriceBeforeSubmit(formData, fieldName = "price") {
  // Проверяем, что formData существует и является FormData
  if (!formData || typeof formData.get !== "function") {
    console.warn(
      `FormData не найдена или не является FormData объектом:`,
      formData
    );
    return;
  }

  const priceValue = formData.get(fieldName);
  if (priceValue) {
    const numericPrice = getNumericPrice(priceValue);
    formData.set(fieldName, numericPrice);
    console.log(
      `Цена обработана (${fieldName}):`,
      priceValue,
      "→",
      numericPrice
    );
  }
}

/**
 * Безопасно инициализирует форматирование цены для формы
 * Проверяет существование формы и полей перед настройкой
 * @param {string} formSelector - Селектор формы
 * @param {string[]} fieldSelectors - Массив селекторов полей цены
 */
export function safeSetupPriceFormatting(
  formSelector,
  fieldSelectors = ["#price"]
) {
  const form = document.querySelector(formSelector);

  if (!form) {
    console.warn(`Форма не найдена: ${formSelector}`);
    return false;
  }

  let setupCount = 0;
  fieldSelectors.forEach((fieldSelector) => {
    const field = form.querySelector(fieldSelector);
    if (field) {
      setupPriceFormatting(form, fieldSelector);
      setupCount++;
    } else {
      console.warn(
        `Поле цены не найдено: ${fieldSelector} в форме ${formSelector}`
      );
    }
  });

  console.log(
    `✅ Настроено форматирование для ${setupCount} полей цены в форме ${formSelector}`
  );
  return setupCount > 0;
}

export default {
  formatPrice,
  getNumericPrice,
  setupPriceFormatting,
  processPriceBeforeSubmit,
  safeSetupPriceFormatting,
};
