/**
 * Utility functions for status/story functionality
 */

/**
 * Check if a story or story content has expired (older than 24 hours)
 * @param {string} timestamp - ISO timestamp of the story/content
 * @returns {boolean} - True if expired, false otherwise
 */
export const isStoryExpired = (timestamp) => {
  if (!timestamp) return false;
  
  const storyTime = new Date(timestamp).getTime();
  const currentTime = new Date().getTime();
  
  // 24 hours in milliseconds = 24 * 60 * 60 * 1000 = 86400000
  const expirationTime = 86400000;
  
  return (currentTime - storyTime) > expirationTime;
};

/**
 * Get the remaining time for a story before it expires
 * @param {string} timestamp - ISO timestamp of the story/content
 * @returns {Object} - Object containing hours, minutes, and seconds remaining
 */
export const getTimeRemaining = (timestamp) => {
  if (!timestamp) return { hours: 0, minutes: 0, seconds: 0, percent: 0 };
  
  const storyTime = new Date(timestamp).getTime();
  const currentTime = new Date().getTime();
  const expirationTime = 86400000; // 24 hours in milliseconds
  
  const elapsedTime = currentTime - storyTime;
  const remainingTime = expirationTime - elapsedTime;
  
  // If already expired, return zeros
  if (remainingTime <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, percent: 0 };
  }
  
  // Calculate hours, minutes, seconds
  const hours = Math.floor(remainingTime / (1000 * 60 * 60));
  const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
  
  // Calculate percentage of time remaining (0-100)
  const percent = Math.floor((remainingTime / expirationTime) * 100);
  
  return { hours, minutes, seconds, percent };
};

/**
 * Format the remaining time as a string
 * @param {Object} timeRemaining - Object from getTimeRemaining()
 * @returns {string} - Formatted time string (e.g., "23h 45m remaining")
 */
export const formatTimeRemaining = (timeRemaining) => {
  const { hours, minutes } = timeRemaining;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else if (minutes > 0) {
    return `${minutes}m remaining`;
  } else {
    return `Expires soon`;
  }
};

/**
 * Get a visual indicator color based on remaining time
 * @param {Object} timeRemaining - Object from getTimeRemaining()
 * @returns {string} - CSS color value
 */
export const getExpirationColor = (timeRemaining) => {
  const { percent } = timeRemaining;
  
  if (percent > 75) {
    return '#25D366'; // Green - plenty of time
  } else if (percent > 25) {
    return '#FFA500'; // Orange - moderate time
  } else {
    return '#FF0000'; // Red - expiring soon
  }
};

/**
 * Check if a story has any unexpired content
 * @param {Object} story - Story object
 * @returns {boolean} - True if at least one content item is not expired
 */
export const hasValidContent = (story) => {
  if (!story || !story.content || story.content.length === 0) {
    return false;
  }
  
  return story.content.some(item => !isStoryExpired(item.timestamp));
};

/**
 * Filter out expired content from a story
 * @param {Object} story - Story object
 * @returns {Object} - Story with only unexpired content
 */
export const filterExpiredContent = (story) => {
  if (!story || !story.content) return story;
  
  const validContent = story.content.filter(item => !isStoryExpired(item.timestamp));
  
  return {
    ...story,
    content: validContent
  };
};

