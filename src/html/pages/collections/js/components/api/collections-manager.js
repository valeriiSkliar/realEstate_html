/**
 * Collections manager component
 * Encapsulates logic for managing collections functionality
 */

// Local storage key for collections
export const STORAGE_KEY = 'realEstateCollections';
export const favoriteCollectionId = 'favorite';


/**
 * Get all collections from localStorage
 * @returns {Array} Array of collection objects
 */
export const getCollections = () => {
  // TODO: Replace localStorage with API call to fetch collections from server
  // Example: const response = await fetch('/api/collections', { method: 'GET' });
  // return response.json();
  
  const collections = localStorage.getItem(STORAGE_KEY);
  return collections ? JSON.parse(collections) : [];
};

/**
 * Save collections to localStorage
 * @param {Array} collections - Array of collection objects
 */
export const saveCollections = (collections) => {
  try {
    // TODO: Replace localStorage with API call to sync collections to server
    // Example: await fetch('/api/collections', { 
    //   method: 'PUT', 
    //   body: JSON.stringify(collections),
    //   headers: { 'Content-Type': 'application/json' }
    // });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  } catch (e) {
    console.error('[CollectionsManager] Error saving collections to localStorage:', e);
    throw e; // Re-throw if we want calling functions to handle it, or handle differently
  }
};


// Проверяем наличие избранной коллекции, создаем если нет
export function ensureFavoriteCollection() {
  let collections = getCollections(); // Get initial list
  const favoriteCollection = collections.find(c => c.isFavorite);

  if (!favoriteCollection) {
    const favoriteCollectionData = {
      name: 'Избранное',
      notes: 'Автоматически созданная коллекция для избранных объектов',
      isFavorite: true
    };

    const newCollection = {
      id: favoriteCollectionId,
      name: favoriteCollectionData.name,
      notes: favoriteCollectionData.notes || '',
      properties: [],
      isFavorite: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    collections.push(newCollection); // Add to the existing array
    
    // TODO: Add API call to create favorite collection on server
    // Example: await fetch('/api/collections', {
    //   method: 'POST',
    //   body: JSON.stringify(newCollection),
    //   headers: { 'Content-Type': 'application/json' }
    // });
    
    saveCollections(collections); // Save updated array
    return newCollection;
  }
  return favoriteCollection;
}

/**
 * Get collection by ID
 * @param {string} id - Collection ID
 * @returns {Object|null} Collection object or null if not found
 */
export const getCollectionById = (id) => {
  // TODO: Replace with direct API call to fetch specific collection
  // Example: const response = await fetch(`/api/collections/${id}`);
  // return response.ok ? response.json() : null;
  
  const collections = getCollections();
  return collections.find(collection => collection.id === id) || null;
};

/**
 * Create new collection
 * @param {Object} collectionData - Collection data
 * @returns {Object} Created collection object
 */
export const createCollection = (collectionData) => {
  const collections = getCollections();
  
  // Generate unique ID
  const id = 'coll_' + Date.now();
  
  // Create new collection object
  const newCollection = {
    id,
    name: collectionData.name,
    notes: collectionData.notes || '',
    properties: [],
    isFavorite: false, // Initialize as non-favorite
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // TODO: Replace localStorage operations with API call to create collection on server
  // Example: const response = await fetch('/api/collections', {
  //   method: 'POST',
  //   body: JSON.stringify(newCollection),
  //   headers: { 'Content-Type': 'application/json' }
  // });
  // const createdCollection = await response.json();
  
  // Add to collections array
  collections.push(newCollection);
  
  // Save to localStorage
  saveCollections(collections);
  
  return newCollection;
};

/**
 * Update existing collection
 * @param {string} id - Collection ID
 * @param {Object} updateData - Data to update
 * @returns {Object|null} Updated collection object or null if not found
 */
export const updateCollection = (id, updateData) => {
  const collections = getCollections();
  const index = collections.findIndex(collection => collection.id === id);
  
  if (index === -1) return null;
  
  // Don't allow updating favorite status or name/notes of favorite collection
  if (collections[index].isFavorite) {
    const { isFavorite, name, notes, ...allowedUpdates } = updateData;
    updateData = allowedUpdates;
  }
  
  // Update collection
  collections[index] = {
    ...collections[index],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  // TODO: Add API call to update collection on server
  // Example: await fetch(`/api/collections/${id}`, {
  //   method: 'PATCH',
  //   body: JSON.stringify(updateData),
  //   headers: { 'Content-Type': 'application/json' }
  // });
  
  // Save to localStorage
  saveCollections(collections);
  
  return collections[index];
};

/**
 * Delete collection
 * @param {string} id - Collection ID
 * @returns {boolean} Success status
 */
export const deleteCollection = (id) => {
  const collections = getCollections();
  const collection = collections.find(c => c.id === id);
  
  // Don't allow deleting favorite collection
  if (collection && collection.isFavorite) {
    return false;
  }
  
  const filteredCollections = collections.filter(collection => collection.id !== id);
  
  if (filteredCollections.length === collections.length) {
    return false;
  }
  
  // TODO: Add API call to delete collection from server
  // Example: await fetch(`/api/collections/${id}`, { method: 'DELETE' });
  
  saveCollections(filteredCollections);
  return true;
};

/**
 * Toggle favorite status of a collection
 * @param {string} id - Collection ID
 * @returns {Object|null} Updated collection object or null if not found
 */
export const toggleCollectionFavorite = (id) => {
  const collections = getCollections();
  
  // Find target collection
  const targetCollection = collections.find(c => c.id === id);
  if (!targetCollection) return null;
  
  if (targetCollection.isFavorite) {
    // If collection is currently favorite, remove favorite status
    targetCollection.isFavorite = false;
  } else {
    // If setting as favorite, remove favorite from all other collections first
    collections.forEach(collection => {
      collection.isFavorite = false;
    });
    // Then set this collection as favorite
    targetCollection.isFavorite = true;
  }
  
  // TODO: Add API call to update favorite status on server
  // Example: await fetch(`/api/collections/${id}/favorite`, {
  //   method: 'PATCH',
  //   body: JSON.stringify({ isFavorite: targetCollection.isFavorite }),
  //   headers: { 'Content-Type': 'application/json' }
  // });
  
  // Save changes
  saveCollections(collections);
  return targetCollection;
};

/**
 * Add a property to a collection
 * @param {string} collectionId - ID of the collection
 * @default collectionId = 'favorite'
 * @param {string} propertyId - ID of the property to add
 * @returns {boolean} True if the property was added successfully
 */
export const addPropertyToCollection = (collectionId = favoriteCollectionId, propertyId) => {
  try {
    // Get current collections
    const collections = getCollections();

    // Find the collection
    const index = collections.findIndex(c => c.id === collectionId);
    if (index === -1) {
      console.error(`Collection ${collectionId} not found`);
      return false;
    }

    // Check if property already exists in collection
    if (collections[index].properties.includes(propertyId)) {
      return false;
    }

    // Add property to collection
    collections[index].properties.push(propertyId);
    collections[index].updatedAt = new Date().toISOString();

    // TODO: Add API call to add property to collection on server
    // Example: await fetch(`/api/collections/${collectionId}/properties`, {
    //   method: 'POST',
    //   body: JSON.stringify({ propertyId }),
    //   headers: { 'Content-Type': 'application/json' }
    // });

    // Save updated collections
    saveCollections(collections);
    return true;
  } catch (error) {
    console.error("Error adding property to collection:", error);
    return false;
  }
};

/**
 * Remove a property from a collection
 * @param {string} collectionId - ID of the collection
 * @default collectionId = 'favorite'
 * @param {string} propertyId - ID of the property to remove
 * @returns {boolean} True if the property was removed successfully
 */
export const removePropertyFromCollection = (collectionId=favoriteCollectionId, propertyId) => {
  try {
    const collections = getCollections();
    const collectionIndex = collections.findIndex(c => c.id === collectionId);

    if (collectionIndex === -1) {
      return false;
    }

    const targetCollection = collections[collectionIndex];

    const propertyIdx = targetCollection.properties.indexOf(propertyId);
    if (propertyIdx === -1) {
      //TODO: Depending on desired behavior, you might return true here if the goal is idempotency (property is not there, so it's 'as if' removed)
      // For now, returning false to indicate no change was made / property wasn't there to be removed.
      return false; 
    }

    // Remove property from collection
    targetCollection.properties.splice(propertyIdx, 1);
    targetCollection.updatedAt = new Date().toISOString();

    // TODO: Add API call to remove property from collection on server
    // Example: await fetch(`/api/collections/${collectionId}/properties/${propertyId}`, {
    //   method: 'DELETE'
    // });

    // Save updated collections
    saveCollections(collections);
    return true; // Successfully removed
  } catch (error) {
    console.error("[CollectionsManager] Error in removePropertyFromCollection:", error);
    return false;
  }
};

/**
 * Check if a property is in a specific collection
 * @param {string} collectionId - ID of the collection
 * @param {string} propertyId - ID of the property to check
 * @returns {boolean} True if the property is in the collection
 */
export const isPropertyInCollection = (collectionId, propertyId) => {
  try {
    // TODO: Consider adding direct API call for efficiency
    // Example: const response = await fetch(`/api/collections/${collectionId}/properties/${propertyId}`);
    // return response.ok;
    
    const collection = getCollectionById(collectionId);
    return collection ? collection.properties.includes(propertyId) : false;
  } catch (error) {
    console.error("Error checking property in collection:", error);
    return false;
  }
};

/**
 * Get all collections that contain a specific property
 * @param {string} propertyId - ID of the property to check
 * @returns {Array} Array of collection objects containing the property
 */
export const getCollectionsWithProperty = (propertyId) => {
  try {
    // TODO: Add dedicated API endpoint to get collections by property
    // Example: const response = await fetch(`/api/properties/${propertyId}/collections`);
    // return response.json();
    
    const collections = getCollections();
    return collections.filter(c => c.properties.includes(propertyId));
  } catch (error) {
    console.error("Error retrieving collections with property:", error);
    return [];
  }
};

/**
 * Add multiple properties to a collection
 * @param {string} collectionId - ID of the collection
 * @param {Array} propertyIds - Array of property IDs to add
 * @returns {boolean} True if the properties were added successfully
 */
export const addPropertiesToCollection = (collectionId, propertyIds) => {
  try {
    // Get current collections
    const collections = getCollections();

    // Find the collection
    const index = collections.findIndex(c => c.id === collectionId);
    if (index === -1) {
      console.error(`Collection ${collectionId} not found`);
      return false;
    }

    // Add properties to collection (avoid duplicates)
    const currentProperties = new Set(collections[index].properties);
    propertyIds.forEach(id => currentProperties.add(id));
    
    collections[index].properties = Array.from(currentProperties);
    collections[index].updatedAt = new Date().toISOString();

    // TODO: Add API call to bulk add properties to collection
    // Example: await fetch(`/api/collections/${collectionId}/properties/bulk`, {
    //   method: 'POST',
    //   body: JSON.stringify({ propertyIds }),
    //   headers: { 'Content-Type': 'application/json' }
    // });

    // Save updated collections
    saveCollections(collections);
    return true;
  } catch (error) {
    console.error("Error adding properties to collection:", error);
    return false;
  }
};