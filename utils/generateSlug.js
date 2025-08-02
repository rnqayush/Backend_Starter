const slugify = require('slugify');

/**
 * Generate a URL-friendly slug from text
 * @param {String} text - Text to convert to slug
 * @param {Object} options - Slugify options
 * @returns {String} Generated slug
 */
const generateSlug = (text, options = {}) => {
  const defaultOptions = {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
    ...options
  };

  return slugify(text, defaultOptions);
};

/**
 * Generate a unique slug by appending a number if needed
 * @param {String} text - Text to convert to slug
 * @param {Function} checkExists - Function to check if slug exists (should return boolean)
 * @param {Object} options - Slugify options
 * @returns {String} Unique slug
 */
const generateUniqueSlug = async (text, checkExists, options = {}) => {
  let baseSlug = generateSlug(text, options);
  let slug = baseSlug;
  let counter = 1;

  // Keep checking and incrementing until we find a unique slug
  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

/**
 * Generate slug for vendor business name
 * @param {String} businessName - Business name to convert
 * @param {Function} checkExists - Function to check if slug exists
 * @returns {String} Unique vendor slug
 */
const generateVendorSlug = async (businessName, checkExists) => {
  return generateUniqueSlug(businessName, checkExists, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
};

/**
 * Generate slug for product name
 * @param {String} productName - Product name to convert
 * @param {Function} checkExists - Function to check if slug exists
 * @returns {String} Unique product slug
 */
const generateProductSlug = async (productName, checkExists) => {
  return generateUniqueSlug(productName, checkExists, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
};

/**
 * Generate slug for category name
 * @param {String} categoryName - Category name to convert
 * @returns {String} Category slug
 */
const generateCategorySlug = (categoryName) => {
  return generateSlug(categoryName, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  });
};

/**
 * Clean and validate slug
 * @param {String} slug - Slug to clean and validate
 * @returns {String} Cleaned slug
 */
const cleanSlug = (slug) => {
  if (!slug || typeof slug !== 'string') {
    throw new Error('Slug must be a non-empty string');
  }

  // Remove any characters that shouldn't be in a slug
  let cleanedSlug = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!cleanedSlug) {
    throw new Error('Slug cannot be empty after cleaning');
  }

  return cleanedSlug;
};

/**
 * Validate slug format
 * @param {String} slug - Slug to validate
 * @returns {Boolean} True if valid slug format
 */
const isValidSlug = (slug) => {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  // Slug should only contain lowercase letters, numbers, and hyphens
  // Should not start or end with hyphen
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Generate random slug suffix
 * @param {Number} length - Length of random suffix
 * @returns {String} Random string
 */
const generateRandomSuffix = (length = 6) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate slug with timestamp
 * @param {String} text - Text to convert to slug
 * @returns {String} Slug with timestamp
 */
const generateSlugWithTimestamp = (text) => {
  const baseSlug = generateSlug(text);
  const timestamp = Date.now().toString(36); // Convert to base36 for shorter string
  return `${baseSlug}-${timestamp}`;
};

/**
 * Generate slug with random suffix
 * @param {String} text - Text to convert to slug
 * @param {Number} suffixLength - Length of random suffix
 * @returns {String} Slug with random suffix
 */
const generateSlugWithRandom = (text, suffixLength = 6) => {
  const baseSlug = generateSlug(text);
  const randomSuffix = generateRandomSuffix(suffixLength);
  return `${baseSlug}-${randomSuffix}`;
};

module.exports = {
  generateSlug,
  generateUniqueSlug,
  generateVendorSlug,
  generateProductSlug,
  generateCategorySlug,
  cleanSlug,
  isValidSlug,
  generateRandomSuffix,
  generateSlugWithTimestamp,
  generateSlugWithRandom
};
