import { createAndShowToast } from "../../../utils/uiHelpers";


/**
 * Collections manager component
 * Encapsulates logic for managing collections functionality
 */


// Local storage key for collections
export const STORAGE_KEY = 'realEstateCollections';
export const favoriteCollectionId = 'favorite';



  async function fetcher(url, options = {}) {
    const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
      .getAttribute('content');
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error(error);
        throw new Error(error.message);
      }
      
      return response.json(); 
    } catch (error) {
      console.error("Error in fetcher:", error);
      createAndShowToast('Ошибка при запросе к серверу', "error");
      throw error;
    }
  }



/**
 * Get all collections from localStorage
 * @returns Array of collection objects
 */
export const getCollections = async () => {
  return fetcher('/api/collections');
};


/**
 * Get collection by ID
 * @param {string} id - Collection ID
 * @returns {Object|null} Collection object or null if not found
 */
export const getCollectionById = async (id) => {
  return fetcher(`/api/collections/${id}`);
};

/**
 * Create new collection
 * @param {Object} collectionData - Collection data
 * @returns {Object} Created collection object
 */
export const createCollection = async (collectionData) => {
  // Create new collection object
  const newCollection = {
    name: collectionData.name,
    notes: collectionData.notes || '',
    properties: [],
    isFavorite: false, // Initialize as non-favorite
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  return fetcher('/api/collections', {
    method: 'POST',
    body: JSON.stringify(newCollection)
  });
};

/**
 * Update existing collection
 * @param {string} id - Collection ID
 * @param {Object} updateData - Data to update
 * @returns {Object|null} Updated collection object or null if not found
 */
export const updateCollection = async (id, updateData) => {

  return fetcher(`/api/collections/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updateData)
  });
};

/**
 * Delete collection
 * @param {string} id - Collection ID
 * @returns {boolean} Success status
 */
export const deleteCollection = async (id) => {
  return fetcher(`/api/collections/${id}`, {
    method: 'DELETE'
  });
};

/**
 * Add a property to a collection
 * @param {string} collectionId - ID of the collection
 * @default collectionId = 'favorite'
 * @param {string} propertyId - ID of the property to add
 * @returns {boolean} True if the property was added successfully
 */
export const addPropertyToCollection = async (collectionId = favoriteCollectionId, propertyId) => {
    return fetcher(`/api/collections/${collectionId}/properties`, {
      method: 'POST',
      body: JSON.stringify({ propertyId })
    });
};

/**
 * Remove a property from a collection
 * @param {string} collectionId - ID of the collection
 * @default collectionId = 'favorite'
 * @param {string} propertyId - ID of the property to remove
 * @returns {boolean} True if the property was removed successfully
 */
export const removePropertyFromCollection = async (collectionId=favoriteCollectionId, propertyId) => {
    return fetcher(`/api/collections/${collectionId}/properties/${propertyId}`, {
      method: 'DELETE'
    });
};

/**
 * Get all collections that contain a specific property
 * @param {string} propertyId - ID of the property to check
 * @returns {Array} Array of collection objects containing the property
 */
export const getCollectionsWithProperty = async (propertyId) => {
    return fetcher(`/api/properties/${propertyId}/collections`);
};