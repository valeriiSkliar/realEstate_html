import { createFetcher } from '../../../utils/fetcher.js';

/**
 * Collections manager component
 * Encapsulates logic for managing collections functionality
 */


// async function fetcher(url, options = {}) {
//   const csrfToken = document
//   .querySelector('meta[name="csrf-token"]')
//     ?.getAttribute('content');
  
//   try {
//     const response = await fetch(url, {
//       ...options,
//       headers: {
//         'Content-Type': 'application/json',
//         ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
//         ...options.headers
//       },
//       // Include signal if provided for abort functionality
//       ...(options.signal && { signal: options.signal })
//     });
    
//     if (!response.ok) {
//       const error = await response.json();
//       throw new Error(error.message ?? 'Ошибка при запросе к серверу');
//     }
    
//     return response.json();
//   } catch (error) {
//     // Handle abort error specifically
//     if (error.name === 'AbortError') {
//       throw error; // Re-throw abort errors to be handled by caller
//     }
    
//     // If USE_MOCK_DATA is enabled, return mock data instead of showing error
//     if (USE_MOCK_DATA) {
//       console.warn("API request failed, using mock data for:", url);
//       return handleMockRequest(url, options);
//     }
//     console.error("Error in fetcher collections-manager.js:", error);
//     return {
//       errors: error.message ?? "Ошибка при запросе к серверу"
//     };

//   }
// }

const collectionFetcher = createFetcher({
  headers: {
    'Content-Type': 'application/json',
  }
});


/**
 * Create new collection
 * @param {string} url - Collection API URL
 * @param {Object} collectionData - Collection data
 * @param {AbortSignal} signal - Optional AbortSignal for cancellation
 * @returns {Object} Created collection object
 */
export const createCollection = async (url, collectionData, signal = null) => {
  return collectionFetcher(url, {
    method: 'POST',
    body: JSON.stringify(collectionData),
    ...(signal && { signal })
  });
};

/**
 * Update existing collection
 * @param {string} url - Collection API URL
 * @param {Object} updateData - Data to update
 * @returns {Object|null} Updated collection object or null if not found
 */
export const updateCollection = async (url, updateData) => {
  return collectionFetcher(url, {
    method: 'PATCH',
    body: JSON.stringify(updateData)
  });
};

/**
 * Delete collection
 * @param {string} url - Collection API URL
 * @returns {boolean} Success status
 */
export const deleteCollection = async (url) => {
  return collectionFetcher(url, {
    method: 'DELETE'
  });
};

/**
 * Add a property to a collection using URL from markup
 * @param {string} url - API URL for adding property to collection
 * @param {AbortSignal} signal - Optional AbortSignal for cancellation
 * @returns {boolean} True if the property was added successfully
 */
export const addPropertyToCollection = async (url, signal = null) => {
  return collectionFetcher(url, {
    method: 'POST',
    ...(signal && { signal })
  });
};

/**
 * Remove a property from a collection using URL from markup
 * @param {string} url - API URL for removing property from collection
 * @returns {boolean} True if the property was removed successfully
 */
export const removePropertyFromCollection = async (url) => {
  return collectionFetcher(url, {
    method: 'DELETE'
  });
};

/**
 * Bulk update property collections using URL from markup
 * @param {string} url - API URL for bulk updating property's collections
 * @param {Array} collectionStates - Array of {collectionId, shouldInclude} objects
 * @param {AbortSignal} signal - Optional AbortSignal for cancellation
 * @returns {Object} Result of the bulk update operation
 */
export const updatePropertyCollections = async (url, collectionStates, signal = null) => {
  return collectionFetcher(url, {
    method: 'PUT',
    body: JSON.stringify(collectionStates),
    ...(signal && { signal })
  });
};

/**
 * Get collection selector HTML markup with current states using URL from markup
 * @param {string} url - API URL for getting collection selector markup
 * @returns {string} HTML markup for collection selector
 */
export const getCollectionSelectorMarkup = async (url) => {
  return collectionFetcher(url);
};