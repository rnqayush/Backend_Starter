/**
 * Utility functions for generating URL-friendly slugs
 */

/**
 * Generate a URL-friendly slug from a string
 * @param {string} text - The text to convert to slug
 * @param {object} options - Configuration options
 * @returns {string} - URL-friendly slug
 */
export const generateSlug = (text, options = {}) => {
  const {
    lowercase = true,
    separator = '-',
    maxLength = 100,
    removeSpecialChars = true
  } = options;

  if (!text || typeof text !== 'string') {
    return '';
  }

  let slug = text.trim();

  // Convert to lowercase if specified
  if (lowercase) {
    slug = slug.toLowerCase();
  }

  // Replace spaces and multiple separators with single separator
  slug = slug.replace(/[\s_]+/g, separator);

  // Remove special characters if specified
  if (removeSpecialChars) {
    slug = slug.replace(/[^\w\-]/g, '');
  }

  // Remove multiple consecutive separators
  slug = slug.replace(new RegExp(`${separator}+`, 'g'), separator);

  // Remove leading and trailing separators
  slug = slug.replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '');

  // Truncate to max length
  if (maxLength && slug.length > maxLength) {
    slug = slug.substring(0, maxLength);
    // Remove trailing separator if truncation created one
    slug = slug.replace(new RegExp(`${separator}+$`, 'g'), '');
  }

  return slug;
};

/**
 * Generate a unique slug by appending a number if the slug already exists
 * @param {string} baseSlug - The base slug to make unique
 * @param {Function} checkExists - Async function to check if slug exists
 * @param {number} maxAttempts - Maximum number of attempts to find unique slug
 * @returns {Promise<string>} - Unique slug
 */
export const generateUniqueSlug = async (baseSlug, checkExists, maxAttempts = 100) => {
  let slug = baseSlug;
  let counter = 1;

  while (counter <= maxAttempts) {
    const exists = await checkExists(slug);
    if (!exists) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // If we couldn't find a unique slug, append timestamp
  return `${baseSlug}-${Date.now()}`;
};

/**
 * Generate slug for vendor based on business name and category
 * @param {string} businessName - Name of the business
 * @param {string} category - Business category
 * @param {string} city - City name (optional)
 * @returns {string} - Generated slug
 */
export const generateVendorSlug = (businessName, category, city = '') => {
  const parts = [businessName];
  
  if (city) {
    parts.push(city);
  }
  
  if (category) {
    parts.push(category);
  }

  const combinedText = parts.join(' ');
  return generateSlug(combinedText, { maxLength: 60 });
};

/**
 * Generate slug for product/service
 * @param {string} name - Product/service name
 * @param {string} category - Category name (optional)
 * @param {string} brand - Brand name (optional)
 * @returns {string} - Generated slug
 */
export const generateProductSlug = (name, category = '', brand = '') => {
  const parts = [name];
  
  if (brand) {
    parts.push(brand);
  }
  
  if (category) {
    parts.push(category);
  }

  const combinedText = parts.join(' ');
  return generateSlug(combinedText, { maxLength: 80 });
};

/**
 * Generate slug for hotel room
 * @param {string} roomName - Room name
 * @param {string} hotelName - Hotel name
 * @param {string} roomType - Room type (optional)
 * @returns {string} - Generated slug
 */
export const generateRoomSlug = (roomName, hotelName, roomType = '') => {
  const parts = [roomName, hotelName];
  
  if (roomType) {
    parts.push(roomType);
  }

  const combinedText = parts.join(' ');
  return generateSlug(combinedText, { maxLength: 70 });
};

/**
 * Generate slug for vehicle
 * @param {string} make - Vehicle make
 * @param {string} model - Vehicle model
 * @param {number} year - Vehicle year
 * @param {string} variant - Vehicle variant (optional)
 * @returns {string} - Generated slug
 */
export const generateVehicleSlug = (make, model, year, variant = '') => {
  const parts = [make, model, year.toString()];
  
  if (variant) {
    parts.push(variant);
  }

  const combinedText = parts.join(' ');
  return generateSlug(combinedText, { maxLength: 80 });
};

/**
 * Validate if a string is a valid slug
 * @param {string} slug - The slug to validate
 * @returns {boolean} - True if valid slug
 */
export const isValidSlug = (slug) => {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  // Check if slug matches the pattern: lowercase letters, numbers, and hyphens only
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug);
};

/**
 * Clean and validate slug input
 * @param {string} slug - The slug to clean
 * @returns {string} - Cleaned slug
 */
export const cleanSlug = (slug) => {
  if (!slug) return '';
  
  return generateSlug(slug, {
    lowercase: true,
    separator: '-',
    maxLength: 100,
    removeSpecialChars: true
  });
};

/**
 * Generate SEO-friendly slug with keywords
 * @param {string} title - Main title
 * @param {Array<string>} keywords - SEO keywords to include
 * @param {number} maxLength - Maximum length of slug
 * @returns {string} - SEO-optimized slug
 */
export const generateSEOSlug = (title, keywords = [], maxLength = 80) => {
  const titleSlug = generateSlug(title);
  
  if (!keywords.length) {
    return titleSlug.substring(0, maxLength);
  }

  // Add relevant keywords that aren't already in the title
  const titleWords = titleSlug.split('-');
  const relevantKeywords = keywords
    .filter(keyword => !titleWords.includes(generateSlug(keyword)))
    .slice(0, 3); // Limit to 3 additional keywords

  const parts = [titleSlug, ...relevantKeywords.map(k => generateSlug(k))];
  const combinedSlug = parts.join('-');

  return combinedSlug.substring(0, maxLength);
};

export default {
  generateSlug,
  generateUniqueSlug,
  generateVendorSlug,
  generateProductSlug,
  generateRoomSlug,
  generateVehicleSlug,
  isValidSlug,
  cleanSlug,
  generateSEOSlug
};
