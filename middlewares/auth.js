import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/config.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { formatResponse } from '../utils/responseFormatter.js';

// Protect routes - verify JWT token
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json(
      formatResponse(false, 'Access denied. No token provided.', null)
    );
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json(
        formatResponse(false, 'Token is invalid. User not found.', null)
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json(
        formatResponse(false, 'User account is deactivated.', null)
      );
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(
        formatResponse(false, 'Token has expired. Please login again.', null)
      );
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(
        formatResponse(false, 'Invalid token format.', null)
      );
    }

    return res.status(401).json(
      formatResponse(false, 'Token verification failed.', null)
    );
  }
});

// Optional authentication - doesn't fail if no token
export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token, continue without user
  if (!token) {
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id);

    if (user && user.isActive) {
      req.user = user;
    }
  } catch (error) {
    // Silently fail for optional auth
    console.log('Optional auth failed:', error.message);
  }

  next();
});

