export default class URLSearchBuilder {
  constructor() {
    this.url = new URL(window.location.href);
  }

  /**
   * Update URL search parameters based on the provided object
   * @param {Object} params - Object containing search parameters
   * @returns {string} - Updated URL string
   */
  updateParams(params) {
    // Create new URLSearchParams (clear existing parameters)
    const searchParams = new URLSearchParams();

    // Process each parameter in the object
    for (const [key, value] of Object.entries(params)) {
      this.processParam(searchParams, key, value);
    }

    // Update the URL object
    this.url.search = searchParams.toString();
    
    return this.url.toString();
  }

  /**
   * Process individual parameter
   * @param {URLSearchParams} searchParams - URLSearchParams object
   * @param {string} key - Parameter key
   * @param {*} value - Parameter value
   */
  processParam(searchParams, key, value) {
    // Handle array parameters (like rooms-number[])
    if (Array.isArray(value)) {
      // Remove existing array parameters
      this.removeArrayParams(searchParams, key);
      
      // Add new array values if array is not empty
      if (value.length > 0) {
        value.forEach(item => {
          if (item !== null && item !== undefined && item !== '') {
            searchParams.append(key, item.toString());
          }
        });
      }
    } 
    // Handle regular parameters
    else {
      if (value === null || value === undefined || value === '') {
        // Remove parameter if value is empty
        searchParams.delete(key);
      } else {
        // Set parameter value
        searchParams.set(key, value.toString());
      }
    }
  }

  /**
   * Remove all instances of an array parameter
   * @param {URLSearchParams} searchParams - URLSearchParams object
   * @param {string} key - Parameter key to remove
   */
  removeArrayParams(searchParams, key) {
    searchParams.delete(key);
  }

  /**
   * Apply the updated URL to the browser (updates the address bar)
   * @param {Object} params - Object containing search parameters
   * @param {boolean} replace - Whether to replace current history entry (default: false)
   */
  applyToURL(params, replace = false) {
    const newURL = this.updateParams(params);
    
    if (replace) {
      window.history.replaceState({}, '', newURL);
    } else {
      window.history.pushState({}, '', newURL);
    }
    
    return newURL;
  }

  /**
   * Get current URL with updated parameters (without applying to browser)
   * @param {Object} params - Object containing search parameters
   * @returns {string} - Updated URL string
   */
  buildURL(params) {
    return this.updateParams(params);
  }

  /**
   * Reset to original URL
   */
  reset() {
    this.url = new URL(window.location.href);
  }

  /**
   * Get current search parameters as an object
   * @returns {Object} - Current search parameters
   */
  getCurrentParams() {
    const params = {};
    const searchParams = new URLSearchParams(this.url.search);
    
    for (const [key, value] of searchParams.entries()) {
      if (params[key]) {
        // Convert to array if multiple values exist
        if (!Array.isArray(params[key])) {
          params[key] = [params[key]];
        }
        params[key].push(value);
      } else {
        params[key] = value;
      }
    }
    
    return params;
  }
}
