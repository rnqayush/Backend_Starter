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
  // For now, we'll use a combination of time and content to determine status
  const now = new Date();
  const publishDate = new Date(article.publishedAt);
  const hoursSincePublished = (now - publishDate) / (1000 * 60 * 60);
  
  // Breaking news: very recent and important
  if (hoursSincePublished < 2 && article.title && 
      (article.title.toLowerCase().includes('breaking') || 
       article.title.toLowerCase().includes('urgent') || 
       Math.random() < 0.1)) {
    return 'breaking';
  }
  
  // Trending: popular articles
  if (hoursSincePublished < 12 && Math.random() < 0.2) {
    return 'trending';
  }
  
  // New: recent articles
  if (hoursSincePublished < 6) {
    return 'new';
  }
  
  // Updated: articles that have been updated
  if (hoursSincePublished < 24 && Math.random() < 0.15) {
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

export default {
  getArticleStatus,
  getStatusText,
  getStatusIcon,
};

