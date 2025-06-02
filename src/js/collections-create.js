import { createCollection } from './components/collections-manager';
import { createAndShowToast, showModal } from './utils/uiHelpers';

/**
 * Initialize collections create page functionality
 */
export const initCollectionsCreatePage = () => {
  console.log("Collections create page initialized");

  // Initialize step navigation
  initStepNavigation();

  // Initialize property search
  initPropertySearch();

  // Initialize collection save functionality
  initSaveCollection();

  // Check if we have a pending property to add from another page
  checkPendingProperty();

  const form = document.getElementById('collectionInfoForm');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = {
        name: document.getElementById('collectionName').value,
        notes: document.getElementById('collectionNotes').value
      };
      
      const newCollection = createCollection(formData);
      
      if (newCollection) {
        createAndShowToast('Коллекция успешно создана', 'success');
        window.location.href = `/collections-edit.html?id=${newCollection.id}`;
      } else {
        createAndShowToast('Ошибка при создании коллекции', 'error');
      }
    });
  }
};

/**
 * Check if there's a pending property to add to the collection
 * (Used when redirected from the "Add to Collection" modal)
 */
const checkPendingProperty = () => {
  const pendingPropertyId = sessionStorage.getItem('pendingPropertyForCollection');
  
  if (pendingPropertyId) {
    console.log(`Found pending property ID: ${pendingPropertyId}`);
    
    // Clear the pending property from session storage
    sessionStorage.removeItem('pendingPropertyForCollection');
    
    // Store it in a data attribute on the form for later use
    const clientInfoForm = document.getElementById('clientInfoForm');
    if (clientInfoForm) {
      clientInfoForm.setAttribute('data-pending-property-id', pendingPropertyId);
    }
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

  // Special handling for step 3 (property search)
  if (stepNumber === '3') {
    // Perform property search
    searchProperties();
  }
};

/**
 * Initialize property search functionality
 */
const initPropertySearch = () => {
  // Search button
  const searchButton = document.querySelector('.js-search-properties');
  if (searchButton) {
    searchButton.addEventListener('click', () => {
      goToStep('3');
    });
  }

  // Select all button
  const selectAllButton = document.querySelector('.js-select-all');
  if (selectAllButton) {
    selectAllButton.addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('.property-checkbox:not(:checked)');
      checkboxes.forEach(checkbox => {
        checkbox.checked = true;
      });
      updateSelectedCount();
    });
  }

  // Clear selection button
  const clearSelectionButton = document.querySelector('.js-clear-selection');
  if (clearSelectionButton) {
    clearSelectionButton.addEventListener('click', () => {
      const checkboxes = document.querySelectorAll('.property-checkbox:checked');
      checkboxes.forEach(checkbox => {
        checkbox.checked = false;
      });
      updateSelectedCount();
    });
  }
};

/**
 * Search for properties based on form parameters
 */
const searchProperties = () => {
  // Show loading indicator
  const loadingIndicator = document.querySelector('.property-results-loading');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'flex';
  }
  
  // Hide results container and no results message
  const resultsContainer = document.querySelector('.js-results-container');
  if (resultsContainer) {
    resultsContainer.style.display = 'none';
  }
  
  const noResultsMessage = document.querySelector('.js-no-results');
  if (noResultsMessage) {
    noResultsMessage.style.display = 'none';
  }

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

  // Log search parameters
  console.log('Searching properties with parameters:', {
    propertyType,
    dealType,
    location,
    size: { min: minSize, max: maxSize },
    price: { min: minPrice, max: maxPrice },
    rooms: { min: minRooms, max: maxRooms }
  });

  // For demo purposes, we'll simulate an API call with a timeout
  setTimeout(() => {
    // Hide loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }

    // Generate sample properties based on search parameters
    const sampleProperties = generateSampleProperties(
      propertyType,
      dealType,
      location
    );

    if (sampleProperties.length > 0) {
      // Show results container
      if (resultsContainer) {
        resultsContainer.style.display = 'flex';
        
        // Populate results
        resultsContainer.innerHTML = '';
        
        sampleProperties.forEach(property => {
          const propertyCard = createPropertyCard(property, true);
          resultsContainer.appendChild(propertyCard);
        });
        
        // Initialize property selection
        initPropertySelection();
      }
    } else {
      // Show no results message
      if (noResultsMessage) {
        noResultsMessage.style.display = 'flex';
      }
    }
  }, 1500); // Simulate API delay
};

/**
 * Generate sample properties for demo purposes
 * @param {string} propertyType - Type of property
 * @param {string} dealType - Type of deal (sale/rent)
 * @param {string} location - Location
 * @returns {Array} Array of property objects
 */
const generateSampleProperties = (propertyType, dealType, location) => {
  // This is just for demo - in a real application, this would be an API call
  const properties = [
    {
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
    {
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
    {
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
    {
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
    {
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
    {
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
  ];

  // Filter properties based on search parameters
  return properties.filter(property => {
    if (propertyType && property.type !== propertyType) return false;
    if (dealType && property.dealType !== dealType) return false;
    if (location && !property.location.toLowerCase().includes(location.toLowerCase())) return false;
    return true;
  });
};

/**
 * Create a property card element
 * @param {Object} property - Property data
 * @param {boolean} selectable - Whether the property card should have a selection checkbox
 * @returns {HTMLElement} The created property card element
 */
const createPropertyCard = (property, selectable = false) => {
  const col = document.createElement('div');
  col.className = 'col-md-6 col-lg-4';

  const card = document.createElement('div');
  card.className = 'card property-card';
  
  // Add checkbox for selectable cards
  if (selectable) {
    const checkboxContainer = document.createElement('div');
    checkboxContainer.className = 'property-checkbox-container';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'property-checkbox';
    checkbox.setAttribute('data-property-id', property.id);
    
    checkboxContainer.appendChild(checkbox);
    card.appendChild(checkboxContainer);
  }

  // Card content
  card.innerHTML += `
    <img src="${property.image}" class="card-img-top" alt="${property.title}">
    <div class="card-body">
      <h5 class="card-title">${property.title}</h5>
      <p class="card-text text-muted">${property.location}</p>
      <div class="d-flex justify-content-between align-items-center">
        <span class="property-price">${property.price.toLocaleString()}</span>
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
 * Initialize property selection functionality
 */
const initPropertySelection = () => {
  // Add event listener to checkboxes
  const checkboxes = document.querySelectorAll('.property-checkbox');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', updateSelectedCount);
  });

  // Update selected count initially
  updateSelectedCount();
};

/**
 * Update the selected properties count
 */
const updateSelectedCount = () => {
  const checkedCheckboxes = document.querySelectorAll('.property-checkbox:checked');
  const selectedCount = document.querySelector('.selected-count');
  
  if (selectedCount) {
    selectedCount.textContent = checkedCheckboxes.length;
  }
};

/**
 * Initialize collection save functionality
 */
const initSaveCollection = () => {
  const saveButton = document.querySelector('.js-save-collection');
  
  if (saveButton) {
    saveButton.addEventListener('click', () => {
      // Get collection name and client name
      const collectionName = document.getElementById('collectionName').value.trim();
      
      // Validate required fields
      if (!collectionName) {
        createAndShowToast('Пожалуйста, заполните все обязательные поля', 'warning');
        return;
      }
      
      // Get selected properties
      const selectedProperties = [];
      document.querySelectorAll('.property-checkbox:checked').forEach(checkbox => {
        selectedProperties.push(checkbox.getAttribute('data-property-id'));
      });
      
      // Add pending property if exists
      const clientInfoForm = document.getElementById('clientInfoForm');
      const pendingPropertyId = clientInfoForm?.getAttribute('data-pending-property-id');
      
      if (pendingPropertyId && !selectedProperties.includes(pendingPropertyId)) {
        selectedProperties.push(pendingPropertyId);
      }
      
      // Get other collection data
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
      
      // Create collection object
      const collectionData = {
        name: collectionName,
        description: collectionNotes,
        properties: selectedProperties,
        clientEmail: clientEmail || '',
        clientPhone: clientPhone || '',
        parameters: {
          propertyType,
          dealType,
          location,
          size: { min: minSize, max: maxSize },
          price: { min: minPrice, max: maxPrice },
          rooms: { min: minRooms, max: maxRooms }
        }
      };
      
      // Create collection
      const collectionId = createCollection(collectionData);
      
      if (collectionId) {
        // Set view collection link
        const viewCollectionLink = document.querySelector('.js-view-collection');
        if (viewCollectionLink) {
          viewCollectionLink.href = `/collections-edit.html?id=${collectionId}`;
        }
        
        // Show success modal
        showModal('collectionSuccessModal');
      } else {
        // Show error message
        createAndShowToast('Не удалось создать коллекцию', 'error');
      }
    });
  }
};
