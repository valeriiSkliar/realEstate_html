/**
 * Enhanced fetcher utility with proper error handling and consistent API
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} options.headers - Additional headers
 * @param {AbortSignal} options.signal - Abort signal for cancellation
 * @param {string} options.method - HTTP method (default: GET)
 * @param {string} options.body - Request body
 * @returns {Promise<any>} Parsed JSON response
 * @throws {Error} On network errors, HTTP errors, or parsing errors
 */
export async function fetcher(url, options = {}) {
  // Get CSRF token from meta tag
  const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content');

  // Prepare headers
  const headers = new Headers(options.headers);

  // Add CSRF token only if it exists
  if (csrfToken) {
    headers.set('X-CSRF-Token', csrfToken);
  }

  try {
    const response = await fetch(url, {
      method: 'GET', // Default method
      ...options,
      headers,
      // Include signal if provided for abort functionality
      ...(options.signal && { signal: options.signal })
    });

    // Handle HTTP errors
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        // Try to parse error response as JSON
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (parseError) {
        // If JSON parsing fails, use status text
        console.warn('Failed to parse error response as JSON:', parseError);
      }
      
      const error = new Error(errorMessage);
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }

    // Parse JSON response
    try {
      return await response.json();
    } catch (parseError) {
      throw new Error(`Failed to parse response as JSON: ${parseError.message}`);
    }

  } catch (error) {
    // Handle abort error specifically
    if (error.name === 'AbortError') {
      console.log('Request was aborted');
      throw error; // Re-throw abort errors to be handled by caller
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = new Error('Network error: Please check your internet connection');
      networkError.originalError = error;
      throw networkError;
    }

    // Re-throw other errors (HTTP errors, parsing errors, etc.)
    console.error(`Fetcher error for ${url}:`, error);
    throw error;
  }
}

/**
 * Fetcher with built-in retry logic for network failures
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retry attempts (default: 2)
 * @param {number} retryDelay - Delay between retries in ms (default: 1000)
 * @returns {Promise<any>} Parsed JSON response
 */
export async function fetcherWithRetry(url, options = {}, retries = 2, retryDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fetcher(url, options);
    } catch (error) {
      lastError = error;
      
      // Don't retry on abort, HTTP 4xx errors, or parsing errors
      if (
        error.name === 'AbortError' ||
        (error.status && error.status >= 400 && error.status < 500) ||
        error.message.includes('parse')
      ) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === retries) {
        break;
      }
      
      console.warn(`Fetch attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`, error.message);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  throw lastError;
}

/**
 * Create a fetcher instance with default options
 * @param {Object} defaultOptions - Default options to apply to all requests
 * @returns {Function} Configured fetcher function
 */
export function createFetcher(defaultOptions = {}) {
  return function(url, options = {}) {
    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      }
    };
    
    return fetcher(url, mergedOptions);
  };
}