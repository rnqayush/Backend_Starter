// Format date to readable format
export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
};

// Format time to readable format
export const formatTime = (dateString) => {
  const options = { hour: '2-digit', minute: '2-digit' };
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', options);
};

// Format date and time
export const formatDateTime = (dateString) => {
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
};

// Calculate time ago
export const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? '1 year ago' : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? '1 month ago' : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? '1 day ago' : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
  }
  
  return 'Just now';
};

// Truncate text with ellipsis
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

// Generate a unique ID
export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Capitalize first letter of each word
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get category color
export const getCategoryColor = (category, theme) => {
  return theme.colors.categoryColors[category] || theme.colors.primary;
};

// Format number with commas
export const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Get random item from array
export const getRandomItem = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Check if URL is valid
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Get default image if image is null or invalid
export const getDefaultImage = (imageUrl) => {
  if (!imageUrl) {
    return 'https://via.placeholder.com/800x400?text=No+Image+Available';
  }
  return imageUrl;
};

