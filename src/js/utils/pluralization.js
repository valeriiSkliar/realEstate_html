/**
 * Russian Pluralization Utilities
 * Handles complex Russian plural forms based on numbers
 */

/**
 * Gets the correct plural form for Russian words based on count
 * @param {number} count - The number to determine plural form for
 * @param {string} singular - Singular form (1, 21, 31, 41, 51, etc.)
 * @param {string} few - Few form (2-4, 22-24, 32-34, 42-44, etc.)
 * @param {string} many - Many form (0, 5-20, 25-30, 35-40, etc.)
 * @returns {string} - The correct plural form
 */
export function getPlural(count, singular, few, many) {
  const absCount = Math.abs(count);
  const lastDigit = absCount % 10;
  const lastTwoDigits = absCount % 100;

  // Special case for 11-14 (always use "many" form)
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return many;
  }

  // Check last digit
  if (lastDigit === 1) {
    return singular;
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return few;
  } else {
    return many;
  }
}

/**
 * Gets plural form for "объект" (object/property)
 * @param {number} count - Number of objects
 * @returns {string} - Correct plural form
 */
export function getObjectPlural(count) {
  return getPlural(count, 'объект', 'объекта', 'объектов');
}

/**
 * Gets formatted plural form for Russian words based on count
 * @param {number} count - The number to determine plural form for
 * @param {string} singular - Singular form (1, 21, 31, 41, 51, etc.)
 * @param {string} few - Few form (2-4, 22-24, 32-34, 42-44, etc.)
 * @param {string} many - Many form (0, 5-20, 25-30, 35-40, etc.)
 * @returns {string} - The formatted plural form
 */
export function getFormattedPlural(count, singular, few, many) {
  const plural = getPlural(count, singular, few, many);
  return `${count} ${plural}`;
}