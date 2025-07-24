import morgan from 'morgan';
import { config } from '../config/config.js';

// Custom token for response time in milliseconds
morgan.token('response-time-ms', (req, res) => {
  const responseTime = res.getHeader('X-Response-Time');
  return responseTime ? `${responseTime}ms` : '-';
});

// Custom token for request ID (if available)
morgan.token('request-id', (req) => {
  return req.id || req.headers['x-request-id'] || '-';
});

// Custom token for user ID (if authenticated)
morgan.token('user-id', (req) => {
  return req.user ? req.user.id : 'anonymous';
});

// Custom token for user role (if authenticated)
morgan.token('user-role', (req) => {
  return req.user ? req.user.role : '-';
});

// Define different log formats based on environment
const developmentFormat = ':method :url :status :res[content-length] - :response-time ms - :user-role/:user-id';

const productionFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms :user-role/:user-id';

// Skip logging for certain routes in production
const skip = (req, res) => {
  // Skip health check routes
  if (req.url === '/' || req.url === '/health') {
    return config.NODE_ENV === 'production';
  }
  
  // Skip successful requests in production (optional)
  if (config.NODE_ENV === 'production' && res.statusCode < 400) {
    return false; // Set to true if you want to skip successful requests
  }
  
  return false;
};

// Create logger middleware based on environment
export const logger = morgan(
  config.NODE_ENV === 'production' ? productionFormat : developmentFormat,
  {
    skip,
    stream: {
      write: (message) => {
        // Remove trailing newline and log
        console.log(message.trim());
      },
    },
  }
);

// Request timing middleware
export const requestTimer = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', duration);
  });
  
  next();
};

// Request ID middleware (useful for tracking requests)
export const requestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] || generateRequestId();
  res.setHeader('X-Request-ID', req.id);
  next();
};

// Generate unique request ID
const generateRequestId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

