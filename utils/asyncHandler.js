/**
 * Async handler wrapper to catch errors and pass them to error middleware
 * This eliminates the need for try-catch blocks in every async controller
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

