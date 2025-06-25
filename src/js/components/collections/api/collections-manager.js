/**
 * Collections manager component
 * Encapsulates logic for managing collections functionality
 */


// Local storage key for collections
export const STORAGE_KEY = 'realEstateCollections';
export const favoriteCollectionId = 'favorite';

// Mock data for development/fallback
const MOCK_COLLECTIONS = [
  {
    "id": "favorite",
    "name": "Избранное",
    "notes": "Автоматически созданная коллекция для избранных объектов",
    "properties": ["property_1750692508023"],
    "isFavorite": true,
    "createdAt": "2025-06-23T15:17:57.905Z",
    "updatedAt": "2025-06-23T15:28:28.024Z"
  },
  {
    "id": "coll_2",
    "name": "ddddd",
    "notes": "",
    "properties": ["1"],
    "isFavorite": false,
    "createdAt": "2025-06-23T15:18:13.609Z",
    "updatedAt": "2025-06-23T15:18:13.610Z"
  },
  {
    "id": "coll_1750691937265",
    "name": "fffff",
    "notes": "",
    "properties": ["1"],
    "isFavorite": false,
    "createdAt": "2025-06-23T15:18:57.265Z",
    "updatedAt": "2025-06-23T15:18:57.265Z"
  },
  {
    "id": "coll_1750692558200",
    "name": "fdgdfgdfgdf",
    "notes": "",
    "properties": ["property_1750692508023"],
    "isFavorite": false,
    "createdAt": "2025-06-23T15:29:18.200Z",
    "updatedAt": "2025-06-23T15:29:18.200Z"
  },
  {
    "id": "coll_1750692589219",
    "name": "цйцуйу",
    "notes": "",
    "properties": ["1", "2"],
    "isFavorite": false,
    "createdAt": "2025-06-23T15:29:49.219Z",
    "updatedAt": "2025-06-23T15:29:49.220Z"
  }
];

const API_PATHS = {
  getAllCollections: '/api/collections',
  /**
   * Generate API path for a specific collection
   * @param {string} id - Collection ID
   * @returns {string} API path for the collection
   */
  getCollectionById: (id) => `/api/collections/${id}`,
  /**
   * Generate API path for addPropertyToCollection
   * @param {string} id - Collection ID
   * @returns {string} API path for collection properties
   */
  addPropertyToCollection: (collectionId, propertyId) => `/api/collections/${collectionId}/properties/${propertyId}`,
  /**
   * Generate API path for a specific property within a collection
   * @param {string} collectionId - Collection ID
   * @param {string} propertyId - Property ID
   * @returns {string} API path for the specific property in collection
   */
  removePropertyFromCollection: (collectionId, propertyId) => `/api/collections/${collectionId}/properties/${propertyId}`,
  /**
   * Generate API path to get all collections containing a specific property
   * @param {string} propertyId - Property ID
   * @returns {string} API path for property's collections
   */
  getCollectionsWithProperty: (propertyId) => `/api/properties/${propertyId}/collections`
};

// Flag to enable/disable mock mode
const USE_MOCK_DATA = true;

// Helper function to get mock collections from localStorage or use default
const getMockCollectionsFromStorage = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [...MOCK_COLLECTIONS];
};

// Helper function to save mock collections to localStorage
const saveMockCollectionsToStorage = (collections) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
};

// Helper function to generate unique ID
const generateId = () => `coll_${Date.now()}`;

async function fetcher(url, options = {}) {
  const csrfToken = document
  .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content');
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(csrfToken && { 'X-CSRF-Token': csrfToken }),
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message ?? 'Ошибка при запросе к серверу');
    }
    
    return response.json(); 
  } catch (error) {
    // If USE_MOCK_DATA is enabled, return mock data instead of showing error
    if (USE_MOCK_DATA) {
      console.warn("API request failed, using mock data for:", url);
      return handleMockRequest(url, options);
    }
    console.error("Error in fetcher collections-manager.js:", error);
    return {
      errors: error.message ?? "Ошибка при запросе к серверу"
    };

  }
}

// Mock request handler
const handleMockRequest = (url, options = {}) => {
  const method = options.method || 'GET';
  const collections = getMockCollectionsFromStorage();
  
  // Handle get all collections
  if (url === API_PATHS.getAllCollections) {
    if (method === 'GET') {
      return collections;
    } else if (method === 'POST') {
      const newCollection = {
        id: generateId(),
        ...JSON.parse(options.body),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      collections.push(newCollection);
      saveMockCollectionsToStorage(collections);
      return newCollection;
    }
  }
  
  // Handle collection by ID operations
  const collectionByIdMatch = url.match(/^\/api\/collections\/([^\/]+)$/);
  if (collectionByIdMatch) {
    const collectionId = collectionByIdMatch[1];
    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    
    if (method === 'GET') {
      return collections.find(c => c.id === collectionId) || null;
    } else if (method === 'PATCH' && collectionIndex !== -1) {
      const updateData = JSON.parse(options.body);
      collections[collectionIndex] = {
        ...collections[collectionIndex],
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      saveMockCollectionsToStorage(collections);
      return collections[collectionIndex];
    } else if (method === 'DELETE' && collectionIndex !== -1) {
      collections.splice(collectionIndex, 1);
      saveMockCollectionsToStorage(collections);
      return { success: true };
    }
  }
  
  // Handle add property to collection (POST /api/collections/{collectionId}/properties/{propertyId})
  const addPropertyMatch = url.match(/^\/api\/collections\/([^\/]+)\/properties\/([^\/]+)$/);
  if (addPropertyMatch && method === 'POST') {
    const [, collectionId, propertyId] = addPropertyMatch;
    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    
    if (collectionIndex !== -1) {
      if (!collections[collectionIndex].properties.includes(propertyId)) {
        collections[collectionIndex].properties.push(propertyId);
        collections[collectionIndex].updatedAt = new Date().toISOString();
        saveMockCollectionsToStorage(collections);
      }
      return { success: true };
    }
    return { error: 'Collection not found' };
  }
  
  // Handle remove property from collection (DELETE /api/collections/{collectionId}/properties/{propertyId})
  const removePropertyMatch = url.match(/^\/api\/collections\/([^\/]+)\/properties\/([^\/]+)$/);
  if (removePropertyMatch && method === 'DELETE') {
    const [, collectionId, propertyId] = removePropertyMatch;
    const collectionIndex = collections.findIndex(c => c.id === collectionId);
    
    if (collectionIndex !== -1) {
      const propertyIndex = collections[collectionIndex].properties.indexOf(propertyId);
      if (propertyIndex !== -1) {
        collections[collectionIndex].properties.splice(propertyIndex, 1);
        collections[collectionIndex].updatedAt = new Date().toISOString();
        saveMockCollectionsToStorage(collections);
      }
      return { success: true };
    }
    return { error: 'Collection not found' };
  }
  
  // Handle get collections with property (GET /api/properties/{propertyId}/collections)
  const collectionsWithPropertyMatch = url.match(/^\/api\/properties\/([^\/]+)\/collections$/);
  if (collectionsWithPropertyMatch && method === 'GET') {
    const [, propertyId] = collectionsWithPropertyMatch;
    return collections.filter(collection => 
      collection.properties.includes(propertyId)
    );
  }
  
  console.warn(`Mock handler: Unhandled request ${method} ${url}`);
  return null;
};

/**
 * Get all collections from localStorage
 * @returns Array of collection objects
 */
export const getCollections = async () => {
  return fetcher(API_PATHS.getAllCollections);
};


/**
 * Get collection by ID
 * @param {string} id - Collection ID
 * @returns {Object|null} Collection object or null if not found
 */
export const getCollectionById = async (id) => {
  return fetcher(API_PATHS.getCollectionById(id));
};

/**
 * Create new collection
 * @param {string} url - Collection API URL
 * @param {Object} collectionData - Collection data
 * @returns {Object} Created collection object
 */
export const createCollection = async (url, collectionData) => {
  // Create new collection object
  
  return fetcher(url, {
    method: 'POST',
    body: JSON.stringify(collectionData)
  });
};

/**
 * Update existing collection
 * @param {string} url - Collection API URL
 * @param {Object} updateData - Data to update
 * @returns {Object|null} Updated collection object or null if not found
 */
export const updateCollection = async (url, updateData) => {

  return fetcher(url, {
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
  return fetcher(url, {
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
    return fetcher(API_PATHS.addPropertyToCollection(collectionId, propertyId), {
      method: 'POST',
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
    return fetcher(API_PATHS.removePropertyFromCollection(collectionId, propertyId), {
      method: 'DELETE'
    });
};

/**
 * Get all collections that contain a specific property
 * @param {string} propertyId - ID of the property to check
 * @returns {Array} Array of collection objects containing the property
 */
export const getCollectionsWithProperty = async (propertyId) => {
    return fetcher(API_PATHS.getCollectionsWithProperty(propertyId));
};