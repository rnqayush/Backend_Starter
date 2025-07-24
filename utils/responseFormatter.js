/**
 * Format API response consistently
 * @param {boolean} success - Whether the operation was successful
 * @param {string} message - Response message
 * @param {any} data - Response data
 * @param {object} meta - Additional metadata (pagination, etc.)
 * @returns {object} Formatted response object
 */
export const formatResponse = (success, message, data = null, meta = null) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString(),
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return response;
};

/**
 * Format success response
 * @param {string} message - Success message
 * @param {any} data - Response data
 * @param {object} meta - Additional metadata
 * @returns {object} Formatted success response
 */
export const successResponse = (message, data = null, meta = null) => {
  return formatResponse(true, message, data, meta);
};

/**
 * Format error response
 * @param {string} message - Error message
 * @param {any} errors - Error details
 * @returns {object} Formatted error response
 */
export const errorResponse = (message, errors = null) => {
  return formatResponse(false, message, errors);
};

/**
 * Format paginated response
 * @param {string} message - Response message
 * @param {array} data - Array of items
 * @param {object} pagination - Pagination info
 * @returns {object} Formatted paginated response
 */
export const paginatedResponse = (message, data, pagination) => {
  return formatResponse(true, message, data, { pagination });
};

