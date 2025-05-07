/**
 * Collections manager component
 * Encapsulates logic for managing collections functionality
 */

// Local storage key for collections
const COLLECTIONS_STORAGE_KEY = "realEstateCollections";

/**
 * Get all collections from local storage
 * @returns {Array} Array of collection objects
 */
export const getCollections = () => {
  try {
    const collectionsJson = localStorage.getItem(COLLECTIONS_STORAGE_KEY);
    return collectionsJson ? JSON.parse(collectionsJson) : [];
  } catch (error) {
    console.error("Error retrieving collections:", error);
    return [];
  }
};

/**
 * Save collections to local storage
 * @param {Array} collections - Array of collection objects
 */
const saveCollections = (collections) => {
  try {
    localStorage.setItem(COLLECTIONS_STORAGE_KEY, JSON.stringify(collections));
  } catch (error) {
    console.error("Error saving collections:", error);
  }
};

/**
 * Create a new collection
 * @param {Object} collectionData - Collection data object
 * @returns {string} ID of the created collection
 */
export const createCollection = (collectionData) => {
  try {
    console.log(`Creating new collection: ${collectionData.name}`);

    // Get current collections
    const collections = getCollections();

    // Create new collection with unique ID
    const newCollection = {
      id: `coll_${Date.now()}`,
      name: collectionData.name,
      clientName: collectionData.clientName,
      description: collectionData.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      properties: collectionData.properties || [],
      parameters: collectionData.parameters || {}
    };

    // Add to collections and save
    collections.push(newCollection);
    saveCollections(collections);

    return newCollection.id;
  } catch (error) {
    console.error("Error creating collection:", error);
    return null;
  }
};

/**
 * Update an existing collection
 * @param {string} collectionId - ID of the collection to update
 * @param {Object} collectionData - Updated collection data
 * @returns {boolean} True if the collection was updated successfully
 */
export const updateCollection = (collectionId, collectionData) => {
  try {
    console.log(`Updating collection ${collectionId}`);

    // Get current collections
    const collections = getCollections();

    // Find the collection
    const index = collections.findIndex(c => c.id === collectionId);
    if (index === -1) {
      console.error(`Collection ${collectionId} not found`);
      return false;
    }

    // Update collection data
    collections[index] = {
      ...collections[index],
      ...collectionData,
      updatedAt: new Date().toISOString()
    };

    // Save updated collections
    saveCollections(collections);
    return true;
  } catch (error) {
    console.error("Error updating collection:", error);
    return false;
  }
};

/**
 * Delete a collection
 * @param {string} collectionId - ID of the collection to delete
 * @returns {boolean} True if the collection was deleted successfully
 */
export const deleteCollection = (collectionId) => {
  try {
    console.log(`Deleting collection ${collectionId}`);

    // Get current collections
    const collections = getCollections();

    // Filter out the collection to delete
    const updatedCollections = collections.filter(c => c.id !== collectionId);

    // Check if a collection was actually removed
    if (collections.length === updatedCollections.length) {
      console.error(`Collection ${collectionId} not found`);
      return false;
    }

    // Save updated collections
    saveCollections(updatedCollections);
    return true;
  } catch (error) {
    console.error("Error deleting collection:", error);
    return false;
  }
};

/**
 * Get a single collection by ID
 * @param {string} collectionId - ID of the collection to retrieve
 * @returns {Object|null} The collection object or null if not found
 */
export const getCollectionById = (collectionId) => {
  try {
    const collections = getCollections();
    return collections.find(c => c.id === collectionId) || null;
  } catch (error) {
    console.error("Error retrieving collection:", error);
    return null;
  }
};

/**
 * Add a property to a collection
 * @param {string} collectionId - ID of the collection
 * @param {string} propertyId - ID of the property to add
 * @returns {boolean} True if the property was added successfully
 */
export const addPropertyToCollection = (collectionId, propertyId) => {
  try {
    console.log(`Adding property ${propertyId} to collection ${collectionId}`);

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
      console.log(`Property ${propertyId} already in collection ${collectionId}`);
      return false;
    }

    // Add property to collection
    collections[index].properties.push(propertyId);
    collections[index].updatedAt = new Date().toISOString();

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
 * @param {string} propertyId - ID of the property to remove
 * @returns {boolean} True if the property was removed successfully
 */
export const removePropertyFromCollection = (collectionId, propertyId) => {
  try {
    console.log(`Removing property ${propertyId} from collection ${collectionId}`);

    // Get current collections
    const collections = getCollections();

    // Find the collection
    const index = collections.findIndex(c => c.id === collectionId);
    if (index === -1) {
      console.error(`Collection ${collectionId} not found`);
      return false;
    }

    // Find and remove the property
    const propertyIndex = collections[index].properties.indexOf(propertyId);
    if (propertyIndex === -1) {
      console.error(`Property ${propertyId} not found in collection ${collectionId}`);
      return false;
    }

    // Remove property from collection
    collections[index].properties.splice(propertyIndex, 1);
    collections[index].updatedAt = new Date().toISOString();

    // Save updated collections
    saveCollections(collections);
    return true;
  } catch (error) {
    console.error("Error removing property from collection:", error);
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
    console.log(`Adding ${propertyIds.length} properties to collection ${collectionId}`);

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

    // Save updated collections
    saveCollections(collections);
    return true;
  } catch (error) {
    console.error("Error adding properties to collection:", error);
    return false;
  }
};
