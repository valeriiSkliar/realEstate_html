import { 
  getCollectionById, 
  updateCollection, 
  removePropertyFromCollection 
} from './components/collections-manager';
import { showModal, hideModal, createAndShowToast } from './utils/uiHelpers';

/**
 * Initialize collections edit page functionality
 */
export const initCollectionsEditPage = () => {
  console.log("Collections edit page initialized");

  // Get collection ID from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const collectionId = urlParams.get('id');
  
  if (!collectionId) {
    // No collection ID provided, redirect to collections page
    window.location.href = '/collections.html';
    return;
  }
  
  // Store collection ID in hidden field
  document.getElementById('collectionId').value = collectionId;
  
  // Load collection data
  loadCollectionData(collectionId);

  // Initialize step navigation
  initStepNavigation();

  // Initialize property management
  initPropertyManagement();

  // Initialize collection save functionality
  initSaveCollection();
};

/**
 * Load collection data
 * @param {string} collectionId - ID of the collection to load
 */
const loadCollectionData = (collectionId) => {
  const collection = getCollectionById(collectionId);
  
  if (!collection) {
    // Collection not found, redirect to collections page
    createAndShowToast('Collection not found', 'error');
    window.location.href = '/collections.html';
    return;
  }
  
  // Populate form fields with collection data
  document.getElementById('collectionName').value = collection.name || '';
  document.getElementById('clientName').value = collection.clientName || '';
  document.getElementById('clientEmail').value = collection.clientEmail || '';
  document.getElementById('clientPhone').value = collection.clientPhone || '';
  document.getElementById('collectionNotes').value = collection.description || '';
  
  // Populate search parameters
  if (collection.parameters) {
    const params = collection.parameters;
    
    if (params.propertyType) {
      document.getElementById('propertyType').value = params.propertyType;
    }
    
    if (params.dealType) {
      document.getElementById('dealType').value = params.dealType;
    }
    
    if (params.location) {
      document.getElementById('location').value = params.location;
    }
    
    if (params.size) {
      if (params.size.min) document.getElementById('propertySizeMin').value = params.size.min;
      if (params.size.max) document.getElementById('propertySizeMax').value = params.size.max;
    }
    
    if (params.price) {
      if (params.price.min) document.getElementById('priceMin').value = params.price.min;
      if (params.price.max) document.getElementById('priceMax').value = params.price.max;
    }
    
    if (params.rooms) {
      if (params.rooms.min) document.getElementById('roomsMin').value = params.rooms.min;
      if (params.rooms.max) document.getElementById('roomsMax').value = params.rooms.max;
    }
  }
  
  // Load current properties
  loadCurrentProperties(collection.properties || []);
};

/**
 * Load current properties in the collection
 * @param {Array} propertyIds - Array of property IDs
 */
const loadCurrentProperties = (propertyIds) => {
  const currentPropertiesContainer = document.querySelector('.js-current-properties');
  const emptyCollectionMessage = document.querySelector('.js-empty-collection');
  const currentCountElement = document.querySelector('.current-count');
  
  if (currentCountElement) {
    currentCountElement.textContent = propertyIds.length;
  }
  
  if (!currentPropertiesContainer) return;
  
  // Clear container
  currentPropertiesContainer.innerHTML = '';
  
  if (propertyIds.length === 0) {
    // Show empty collection message
    if (emptyCollectionMessage) {
      emptyCollectionMessage.style.display = 'flex';
    }
    return;
  }
  
  // Hide empty collection message
  if (emptyCollectionMessage) {
    emptyCollectionMessage.style.display = 'none';
  }
  
  // For demo purposes, we'll create sample property cards based on IDs
  propertyIds.forEach(id => {
    // Get sample property data based on ID
    const property = getSamplePropertyById(id);
    
    if (property) {
      const propertyCard = createPropertyCard(property, id);
      currentPropertiesContainer.appendChild(propertyCard);
    }
  });
  
  // Initialize remove property buttons
  initRemovePropertyButtons();
};

/**
 * Get sample property data by ID (for demo purposes)
 * @param {string} propertyId - ID of the property
 * @returns {Object|null} Property data or null if not found
 */
const getSamplePropertyById = (propertyId) => {
  // This is just for demo - in a real application, this would be an API call
  const properties = {
    'prop123': {
      id: 'prop123',
      title: 'Modern Apartment',
      location: 'City Center',
      price: 120000,
      size: 85,
      rooms: 2,
      type: 'apartment',
      dealType: 'sale',
      image: '/images/place-holder.jpg'
    },
    'prop456': {
      id: 'prop456',
      title: 'Family House with Garden',
      location: 'Suburban Area',
      price: 250000,
      size: 180,
      rooms: 4,
      type: 'house',
      dealType: 'sale',
      image: '/images/place-holder.jpg'
    },
    'prop789': {
      id: 'prop789',
      title: 'Studio Apartment',
      location: 'North District',
      price: 90000,
      size: 45,
      rooms: 1,
      type: 'apartment',
      dealType: 'sale',
      image: '/images/place-holder.jpg'
    },
    'prop101': {
      id: 'prop101',
      title: 'Commercial Space',
      location: 'Business District',
      price: 350000,
      size: 120,
      rooms: 3,
      type: 'commercial',
      dealType: 'sale',
      image: '/images/place-holder.jpg'
    },
    'prop102': {
      id: 'prop102',
      title: 'Luxury Penthouse',
      location: 'City Center',
      price: 500000,
      size: 200,
      rooms: 4,
      type: 'apartment',
      dealType: 'sale',
      image: '/images/place-holder.jpg'
    },
    'prop103': {
      id: 'prop103',
      title: 'Cozy Apartment for Rent',
      location: 'West Area',
      price: 1200,
      size: 65,
      rooms: 2,
      type: 'apartment',
      dealType: 'rent',
      image: '/images/place-holder.jpg'
    }
  };
  
  return properties[propertyId] || null;
};

/**
 * Create a property card element for the collection
 * @param {Object} property - Property data
 * @param {string} propertyId - Property ID
 * @returns {HTMLElement} The created property card element
 */
const createPropertyCard = (property, propertyId) => {
  const col = document.createElement('div');
  col.className = 'col-md-6 col-lg-4';
  col.setAttribute('data-property-id', propertyId);

  const card = document.createElement('div');
  card.className = 'card property-card';
  
  // Add remove button
  const removeButton = document.createElement('button');
  removeButton.className = 'property-remove-btn js-remove-property';
  removeButton.setAttribute('data-property-id', propertyId);
  removeButton.innerHTML = '<i class="bi bi-x-lg"></i>';
  
  card.appendChild(removeButton);

  // Card content
  card.innerHTML += `
    <img src="${property.image}" class="card-img-top" alt="${property.title}">
    <div class="card-body">
      <h5 class="card-title">${property.title}</h5>
      <p class="card-text text-muted">${property.location}</p>
      <div class="d-flex justify-content-between align-items-center">
        <span class="property-price">$${property.price.toLocaleString()}</span>
        <div class="property-stats">
          <span class="me-2"><i class="bi bi-rulers"></i> ${property.size}m²</span>
          <span><i class="bi bi-door-open"></i> ${property.rooms}</span>
        </div>
      </div>
    </div>
  `;

  col.appendChild(card);
  return col;
};

/**
 * Initialize remove property buttons
 */
const initRemovePropertyButtons = () => {
  const removeButtons = document.querySelectorAll('.js-remove-property');
  
  removeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Get property ID
      const propertyId = button.getAttribute('data-property-id');
      
      if (propertyId) {
        // Set property ID in modal
        document.getElementById('removePropertyId').value = propertyId;
        
        // Show confirmation modal
        showModal('removePropertyModal');
      }
    });
  });
  
  // Handle confirm remove button
  const confirmRemoveButton = document.querySelector('.js-confirm-remove-property');
  if (confirmRemoveButton) {
    confirmRemoveButton.addEventListener('click', () => {
      const propertyId = document.getElementById('removePropertyId').value;
      const collectionId = document.getElementById('collectionId').value;
      
      if (propertyId && collectionId) {
        // Remove property from collection
        const success = removePropertyFromCollection(collectionId, propertyId);
        
        if (success) {
          // Remove property card from DOM
          const propertyCard = document.querySelector(`[data-property-id="${propertyId}"]`);
          if (propertyCard) {
            propertyCard.remove();
          }
          
          // Update property count
          const currentCount = document.querySelector('.current-count');
          if (currentCount) {
            const count = parseInt(currentCount.textContent) - 1;
            currentCount.textContent = count;
            
            // Show empty collection message if no properties left
            if (count === 0) {
              const emptyCollectionMessage = document.querySelector('.js-empty-collection');
              if (emptyCollectionMessage) {
                emptyCollectionMessage.style.display = 'flex';
              }
            }
          }
          
          // Show success message
          createAndShowToast('Property removed from collection', 'success');
        } else {
          // Show error message
          createAndShowToast('Failed to remove property', 'error');
        }
        
        // Hide modal
        hideModal('removePropertyModal');
      }
    });
  }
};

/**
 * Initialize step navigation
 */
const initStepNavigation = () => {
  // Next step buttons
  const nextButtons = document.querySelectorAll('.js-next-step');
  nextButtons.forEach(button => {
    button.addEventListener('click', () => {
      const nextStepNumber = button.getAttribute('data-next');
      goToStep(nextStepNumber);
    });
  });

  // Previous step buttons
  const prevButtons = document.querySelectorAll('.js-prev-step');
  prevButtons.forEach(button => {
    button.addEventListener('click', () => {
      const prevStepNumber = button.getAttribute('data-prev');
      goToStep(prevStepNumber);
    });
  });
};

/**
 * Go to a specific step
 * @param {string} stepNumber - The step number to navigate to
 */
const goToStep = (stepNumber) => {
  // Hide all step content
  document.querySelectorAll('.step-content').forEach(content => {
    content.classList.remove('active');
  });

  // Show selected step content
  const selectedContent = document.getElementById(`step${stepNumber}`);
  if (selectedContent) {
    selectedContent.classList.add('active');
  }

  // Update step indicator
  document.querySelectorAll('.step').forEach(step => {
    step.classList.remove('active');
  });
  
  const selectedIndicator = document.querySelector(`.step[data-step="${stepNumber}"]`);
  if (selectedIndicator) {
    selectedIndicator.classList.add('active');
  }
};

/**
 * Initialize property management
 */
const initPropertyManagement = () => {
  // Search more properties button
  const searchMoreButton = document.querySelector('.js-search-more');
  if (searchMoreButton) {
    searchMoreButton.addEventListener('click', () => {
      // Hide current properties section
      const currentPropertiesSection = document.querySelector('.current-properties-section');
      if (currentPropertiesSection) {
        currentPropertiesSection.style.display = 'none';
      }
      
      // Show search more section
      const searchMoreSection = document.querySelector('.search-more-section');
      if (searchMoreSection) {
        searchMoreSection.style.display = 'block';
      }
      
      // Initialize quick search
      initQuickSearch();
    });
  }
  
  // Back to collection button
  const backToCollectionButton = document.querySelector('.js-back-to-collection');
  if (backToCollectionButton) {
    backToCollectionButton.addEventListener('click', () => {
      // Hide search more section
      const searchMoreSection = document.querySelector('.search-more-section');
      if (searchMoreSection) {
        searchMoreSection.style.display = 'none';
      }
      
      // Show current properties section
      const currentPropertiesSection = document.querySelector('.current-properties-section');
      if (currentPropertiesSection) {
        currentPropertiesSection.style.display = 'block';
      }
    });
  }
};

/**
 * Initialize quick search
 */
const initQuickSearch = () => {
  // Quick search button
  const quickSearchButton = document.querySelector('.js-quick-search-btn');
  if (quickSearchButton) {
    quickSearchButton.addEventListener('click', () => {
      performQuickSearch();
    });
  }
  
  // Quick search input (enter key)
  const quickSearchInput = document.querySelector('.js-quick-search-input');
  if (quickSearchInput) {
    quickSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        performQuickSearch();
      }
    });
  }
};

/**
 * Perform quick search for properties
 */
const performQuickSearch = () => {
  const quickSearchInput = document.querySelector('.js-quick-search-input');
  if (!quickSearchInput) return;
  
  const searchTerm = quickSearchInput.value.trim().toLowerCase();
  
  // Show loading indicator
  const loadingIndicator = document.querySelector('.search-results-loading');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'flex';
  }
  
  // Hide no results message
  const noResultsMessage = document.querySelector('.js-no-search-results');
  if (noResultsMessage) {
    noResultsMessage.style.display = 'none';
  }
  
  // Clear results container
  const resultsContainer = document.querySelector('.js-results-container');
  if (resultsContainer) {
    resultsContainer.innerHTML = '';
  }
  
  // For demo purposes, we'll simulate an API call with a timeout
  setTimeout(() => {
    // Hide loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }
    
    // Get all sample properties
    const allProperties = [
      getSamplePropertyById('prop123'),
      getSamplePropertyById('prop456'),
      getSamplePropertyById('prop789'),
      getSamplePropertyById('prop101'),
      getSamplePropertyById('prop102'),
      getSamplePropertyById('prop103')
    ].filter(p => p !== null);
    
    // Filter properties by search term
    const filteredProperties = allProperties.filter(property => {
      return (
        property.title.toLowerCase().includes(searchTerm) ||
        property.location.toLowerCase().includes(searchTerm) ||
        property.type.toLowerCase().includes(searchTerm) ||
        property.dealType.toLowerCase().includes(searchTerm)
      );
    });
    
    if (filteredProperties.length > 0) {
      // Get current collection ID and properties
      const collectionId = document.getElementById('collectionId').value;
      const collection = getCollectionById(collectionId);
      const currentPropertyIds = collection ? collection.properties || [] : [];
      
      // Populate results
      filteredProperties.forEach(property => {
        // Skip properties already in collection
        if (currentPropertyIds.includes(property.id)) return;
        
        const propertyCard = createSearchResultCard(property);
        if (resultsContainer) {
          resultsContainer.appendChild(propertyCard);
        }
      });
      
      // Initialize add to collection buttons
      initAddToCollectionButtons();
    } else {
      // Show no results message
      if (noResultsMessage) {
        noResultsMessage.style.display = 'flex';
      }
    }
  }, 1000); // Simulate API delay
};

/**
 * Create a search result property card
 * @param {Object} property - Property data
 * @returns {HTMLElement} The created property card element
 */
const createSearchResultCard = (property) => {
  const col = document.createElement('div');
  col.className = 'col-md-6 col-lg-4';

  const card = document.createElement('div');
  card.className = 'card property-card';
  
  // Add to collection button
  const addButton = document.createElement('button');
  addButton.className = 'property-add-btn js-add-to-collection-btn';
  addButton.setAttribute('data-property-id', property.id);
  addButton.innerHTML = '<i class="bi bi-plus-lg"></i>';
  
  card.appendChild(addButton);

  // Card content
  card.innerHTML += `
    <img src="${property.image}" class="card-img-top" alt="${property.title}">
    <div class="card-body">
      <h5 class="card-title">${property.title}</h5>
      <p class="card-text text-muted">${property.location}</p>
      <div class="d-flex justify-content-between align-items-center">
        <span class="property-price">$${property.price.toLocaleString()}</span>
        <div class="property-stats">
          <span class="me-2"><i class="bi bi-rulers"></i> ${property.size}m²</span>
          <span><i class="bi bi-door-open"></i> ${property.rooms}</span>
        </div>
      </div>
    </div>
  `;

  col.appendChild(card);
  return col;
};

/**
 * Initialize add to collection buttons
 */
const initAddToCollectionButtons = () => {
  const addButtons = document.querySelectorAll('.js-add-to-collection-btn');
  
  addButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Get property ID and collection ID
      const propertyId = button.getAttribute('data-property-id');
      const collectionId = document.getElementById('collectionId').value;
      
      if (propertyId && collectionId) {
        // Get collection
        const collection = getCollectionById(collectionId);
        if (!collection) return;
        
        // Add property to collection (temporary, will be saved when collection is saved)
        if (!collection.properties.includes(propertyId)) {
          collection.properties.push(propertyId);
          
          // Remove the property card from search results
          const propertyCard = button.closest('.col-md-6');
          if (propertyCard) {
            propertyCard.remove();
          }
          
          // Update collection in session storage for temporary persistence
          sessionStorage.setItem(`collection_${collectionId}_temp`, JSON.stringify(collection));
          
          // Show success message
          createAndShowToast('Property added to collection (not saved yet)', 'success');
          
          // Update property count
          const currentCount = document.querySelector('.current-count');
          if (currentCount) {
            currentCount.textContent = collection.properties.length;
          }
        }
      }
    });
  });
};

/**
 * Initialize collection save functionality
 */
const initSaveCollection = () => {
  const saveButton = document.querySelector('.js-save-collection');
  
  if (saveButton) {
    saveButton.addEventListener('click', () => {
      // Get collection ID
      const collectionId = document.getElementById('collectionId').value;
      
      if (!collectionId) return;
      
      // Get collection data
      const collection = getCollectionById(collectionId);
      if (!collection) return;
      
      // Get form data
      const collectionName = document.getElementById('collectionName').value.trim();
      const clientName = document.getElementById('clientName').value.trim();
      
      // Validate required fields
      if (!collectionName || !clientName) {
        createAndShowToast('Please fill in all required fields', 'warning');
        goToStep('1'); // Go back to step 1
        return;
      }
      
      // Get updated collection data
      const clientEmail = document.getElementById('clientEmail')?.value || '';
      const clientPhone = document.getElementById('clientPhone')?.value || '';
      const collectionNotes = document.getElementById('collectionNotes')?.value || '';
      
      // Get search parameters
      const propertyType = document.getElementById('propertyType')?.value || '';
      const dealType = document.getElementById('dealType')?.value || '';
      const location = document.getElementById('location')?.value || '';
      const minSize = document.getElementById('propertySizeMin')?.value || '';
      const maxSize = document.getElementById('propertySizeMax')?.value || '';
      const minPrice = document.getElementById('priceMin')?.value || '';
      const maxPrice = document.getElementById('priceMax')?.value || '';
      const minRooms = document.getElementById('roomsMin')?.value || '';
      const maxRooms = document.getElementById('roomsMax')?.value || '';
      
      // Get temporary collection data if exists
      const tempCollection = sessionStorage.getItem(`collection_${collectionId}_temp`);
      let properties = collection.properties;
      if (tempCollection) {
        properties = JSON.parse(tempCollection).properties;
        // Clear temporary collection
        sessionStorage.removeItem(`collection_${collectionId}_temp`);
      }
      
      // Create updated collection object
      const updatedCollectionData = {
        name: collectionName,
        clientName: clientName,
        description: collectionNotes,
        properties: properties,
        clientEmail: clientEmail,
        clientPhone: clientPhone,
        parameters: {
          propertyType,
          dealType,
          location,
          size: { min: minSize, max: maxSize },
          price: { min: minPrice, max: maxPrice },
          rooms: { min: minRooms, max: maxRooms }
        }
      };
      
      // Update collection
      const success = updateCollection(collectionId, updatedCollectionData);
      
      if (success) {
        // Show success modal
        showModal('collectionUpdateSuccessModal');
        
        // Reload current properties to reflect changes
        loadCurrentProperties(properties);
      } else {
        // Show error message
        createAndShowToast('Failed to update collection', 'error');
      }
    });
  }
};
