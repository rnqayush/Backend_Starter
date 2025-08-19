/**
 * Determines the status of an article based on its properties
 * 
 * @param {Object} article - The article object
 * @returns {string|null} - The status of the article or null if no special status
 */
export const getArticleStatus = (article) => {
  if (!article || !article.publishedAt) {
    return null;
  }

  // In a real app, this would come from the API or be determined by business logic
  // For now, we'll use a deterministic approach based on article properties
  const now = new Date();
  const publishDate = new Date(article.publishedAt);
  const hoursSincePublished = (now - publishDate) / (1000 * 60 * 60);
  
  // Use a deterministic value based on article URL or title instead of Math.random()
  // This ensures the same article always gets the same status
  const getHashCode = (str) => {
    let hash = 0;
    if (!str) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  // Get a deterministic value between 0 and 1 based on article URL or title
  const hashValue = article.url || article.title ? 
    (getHashCode(article.url || article.title) % 100) / 100 : 0;
  
  // Breaking news: very recent and important
  if (hoursSincePublished < 2 && article.title && 
      (article.title.toLowerCase().includes('breaking') || 
       article.title.toLowerCase().includes('urgent') || 
       hashValue < 0.1)) {
    return 'breaking';
  }
  
  // Trending: popular articles
  if (hoursSincePublished < 12 && hashValue < 0.2) {
    return 'trending';
  }
  
  // New: recent articles
  if (hoursSincePublished < 6) {
    return 'new';
  }
  
  // Updated: articles that have been updated
  if (hoursSincePublished < 24 && hashValue < 0.15) {
    return 'updated';
  }
  
  // No special status
  return null;
};

/**
 * Gets the display text for a status
 * 
 * @param {string} status - The status code
 * @returns {string} - The display text for the status
 */
export const getStatusText = (status) => {
  switch (status) {
    case 'breaking':
      return 'Breaking';
    case 'trending':
      return 'Trending';
    case 'new':
      return 'New';
    case 'updated':
      return 'Updated';
    default:
      return status;
  }
};

/**
 * Gets the icon for a status
 * 
 * @param {string} status - The status code
 * @returns {string} - The icon class for the status
 */
export const getStatusIcon = (status) => {
  switch (status) {
    case 'breaking':
      return 'fa-bolt';
    case 'trending':
      return 'fa-chart-line';
    case 'new':
      return 'fa-star';
    case 'updated':
      return 'fa-sync-alt';
    default:
      return 'fa-info-circle';
  }
};

// Create a simple cache for article statuses to prevent recalculation
const statusCache = new Map();

/**
 * Memoized version of getArticleStatus that caches results
 * 
 * @param {Object} article - The article object
 * @returns {string|null} - The cached status of the article
 */
export const getMemoizedArticleStatus = (article) => {
  if (!article || !article.url) {
    return getArticleStatus(article);
  }
  
  // Use article URL as cache key
  const cacheKey = article.url;
  
  if (!statusCache.has(cacheKey)) {
    // Calculate and cache the status
    const status = getArticleStatus(article);
    statusCache.set(cacheKey, status);
    return status;
  }
  
  // Return cached status
  return statusCache.get(cacheKey);
};

export default {
  getArticleStatus,
  getMemoizedArticleStatus,
  getStatusText,
  getStatusIcon,
};

