/**
 * Favorites manager component
 * Encapsulates logic for managing favorites functionality
 */

// Local storage key for favorites
const FAVORITES_STORAGE_KEY = "realEstateFavorites";

/**
 * Get all favorites from local storage
 * @returns {Array} Array of favorite property IDs
 */
export const getFavorites = () => {
  try {
    const favoritesJson = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return favoritesJson ? JSON.parse(favoritesJson) : [];
  } catch (error) {
    console.error("Error retrieving favorites:", error);
    return [];
  }
};

/**
 * Save favorites to local storage
 * @param {Array} favorites - Array of favorite property IDs
 */
const saveFavorites = (favorites) => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error("Error saving favorites:", error);
  }
};

/**
 * Check if a property is in favorites
 * @param {string} propertyId - The ID of the property to check
 * @returns {boolean} True if the property is in favorites
 */
export const isInFavorites = (propertyId) => {
  const favorites = getFavorites();
  return favorites.includes(propertyId);
};

/**
 * Add a property to favorites
 * @param {string} propertyId - The ID of the property to add
 * @returns {boolean} True if the property was added successfully
 */
export const addToFavorites = (propertyId) => {
  try {
    console.log(`Adding property ${propertyId} to favorites`);

    // Get current favorites
    const favorites = getFavorites();

    // Only add if not already in favorites
    if (!favorites.includes(propertyId)) {
      favorites.push(propertyId);
      saveFavorites(favorites);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return false;
  }
};

/**
 * Remove a property from favorites
 * @param {string} propertyId - The ID of the property to remove
 * @returns {boolean} True if the property was removed successfully
 */
export const removeFromFavorites = (propertyId) => {
  try {
    console.log(`Removing property ${propertyId} from favorites`);

    // Get current favorites
    const favorites = getFavorites();

    // Find and remove the property
    const index = favorites.indexOf(propertyId);
    if (index !== -1) {
      favorites.splice(index, 1);
      saveFavorites(favorites);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return false;
  }
};

/**
 * Toggle a property's favorite status
 * @param {string} propertyId - The ID of the property to toggle
 * @returns {boolean} True if the property is now a favorite, false if it was removed
 */
export const toggleFavorite = (propertyId) => {
  try {
    const isFavorite = isInFavorites(propertyId);

    if (isFavorite) {
      removeFromFavorites(propertyId);
      return false;
    } else {
      addToFavorites(propertyId);
      return true;
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return isInFavorites(propertyId);
  }
};
