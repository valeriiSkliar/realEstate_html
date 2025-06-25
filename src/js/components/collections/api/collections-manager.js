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
   * Generate API path to bulk update property collections
   * @param {string} propertyId - Property ID
   * @returns {string} API path for bulk updating property's collections
   */
  updatePropertyCollections: (propertyId) => `/api/properties/${propertyId}/collections`,
  /**
   * Generate API path to get collection selector HTML markup
   * @param {string} propertyId - Property ID
   * @returns {string} API path for getting collection selector markup
   */
  getCollectionSelectorMarkup: (propertyId) => `/api/properties/${propertyId}/collection-selector-markup`
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
      },
      // Include signal if provided for abort functionality
      ...(options.signal && { signal: options.signal })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message ?? 'Ошибка при запросе к серверу');
    }
    
    return response.json();
  } catch (error) {
    // Handle abort error specifically
    if (error.name === 'AbortError') {
      throw error; // Re-throw abort errors to be handled by caller
    }
    
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
  
  // Handle bulk update property collections (PUT /api/properties/{propertyId}/collections)
  if (collectionsWithPropertyMatch && method === 'PUT') {
    const [, propertyId] = collectionsWithPropertyMatch;
    const { collections: collectionStates } = JSON.parse(options.body);
    
    let updatedCount = 0;
    
    for (const state of collectionStates) {
      const { collectionId, shouldInclude } = state;
      const collectionIndex = collections.findIndex(c => c.id === collectionId);
      
      if (collectionIndex !== -1) {
        const collection = collections[collectionIndex];
        const hasProperty = collection.properties.includes(propertyId);
        
        if (shouldInclude && !hasProperty) {
          // Add property to collection
          collection.properties.push(propertyId);
          collection.updatedAt = new Date().toISOString();
          updatedCount++;
        } else if (!shouldInclude && hasProperty) {
          // Remove property from collection
          const propertyIndex = collection.properties.indexOf(propertyId);
          collection.properties.splice(propertyIndex, 1);
          collection.updatedAt = new Date().toISOString();
          updatedCount++;
        }
      }
    }
    
    saveMockCollectionsToStorage(collections);
    return { 
      success: true, 
      updatedCount,
      message: `Property updated in ${updatedCount} collections`
    };
  }
  
  // Handle add property to multiple collections (POST /api/properties/{propertyId}/add-to-collections)
  const addToCollectionsMatch = url.match(/^\/api\/properties\/([^\/]+)\/add-to-collections$/);
  if (addToCollectionsMatch && method === 'POST') {
    const [, propertyId] = addToCollectionsMatch;
    const { collectionIds } = JSON.parse(options.body);
    
    let addedCount = 0;
    
    for (const collectionId of collectionIds) {
      const collectionIndex = collections.findIndex(c => c.id === collectionId);
      
      if (collectionIndex !== -1) {
        const collection = collections[collectionIndex];
        if (!collection.properties.includes(propertyId)) {
          collection.properties.push(propertyId);
          collection.updatedAt = new Date().toISOString();
          addedCount++;
        }
      }
    }
    
    saveMockCollectionsToStorage(collections);
    return { 
      success: true, 
      addedCount,
      message: `Property added to ${addedCount} collections`
    };
  }
  
  // Handle get collection selector markup (GET /api/properties/{propertyId}/collection-selector-markup)
  const markupMatch = url.match(/^\/api\/properties\/([^\/]+)\/collection-selector-markup$/);
  if (markupMatch && method === 'GET') {
    const [, propertyId] = markupMatch;
    
    // Filter out favorite collections
    const nonFavoriteCollections = collections.filter(c => !c.isFavorite);
    
    if (nonFavoriteCollections.length === 0) {
      return {
        html: `
          <div class="collection-selector-popup__empty">
            <p>У вас пока нет подборок.</p>
          </div>
        `
      };
    }
    
    // Generate HTML markup with current states
    const html = `
      <div class="collection-selector-popup__list">
        ${nonFavoriteCollections
          .map(collection => {
            const isChecked = collection.properties.includes(propertyId);
            return `
              <div class="collection-selector-popup__item" data-collection-id="${collection.id}">
                <div class="collection-selector-popup__item-checkbox">
                  <input type="checkbox" id="collection-${collection.id}"${isChecked ? ' checked' : ''}>
                  <label for="collection-${collection.id}"></label>
                </div>
                <div class="collection-selector-popup__item-info">
                  <div class="collection-selector-popup__item-name">
                    ${collection.name}
                  </div>
                  <div class="collection-selector-popup__item-count">
                    <i class="bi bi-building"></i> ${collection.properties ? collection.properties.length : 0} объектов
                  </div>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    `;
    
    return { html };
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
 * @param {AbortSignal} signal - Optional AbortSignal for cancellation
 * @returns {Object} Created collection object
 */
export const createCollection = async (url, collectionData, signal = null) => {
  // Create new collection object
  
  return fetcher(url, {
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
 * @param {AbortSignal} signal - Optional AbortSignal for cancellation
 * @returns {boolean} True if the property was added successfully
 */
export const addPropertyToCollection = async (collectionId = favoriteCollectionId, propertyId, signal = null) => {
    return fetcher(API_PATHS.addPropertyToCollection(collectionId, propertyId), {
      method: 'POST',
      ...(signal && { signal })
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

/**
 * Bulk update property collections
 * @param {string} propertyId - ID of the property
 * @param {Array} collectionStates - Array of {collectionId, shouldInclude} objects
 * @param {AbortSignal} signal - Optional AbortSignal for cancellation
 * @returns {Object} Result of the bulk update operation
 */
export const updatePropertyCollections = async (propertyId, collectionStates, signal = null) => {
    return fetcher(API_PATHS.updatePropertyCollections(propertyId), {
        method: 'PUT',
        body: JSON.stringify({ collections: collectionStates }),
        ...(signal && { signal })
    });
};
/**
 * Get collection selector HTML markup with current states
 * @param {string} propertyId - ID of the property
 * @returns {string} HTML markup for collection selector
 */
export const getCollectionSelectorMarkup = async (propertyId) => {
  const response = await fetcher(API_PATHS.getCollectionSelectorMarkup(propertyId));
  if (response.errors) {
    throw new Error("Ошибка при запросе к серверу");
  }
    return response.html || response; // Handle both {html: "..."} and direct string responses
};