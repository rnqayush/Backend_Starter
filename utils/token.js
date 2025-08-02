/**
 * JWT Token utility functions for authentication and authorization
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload (user data)
 * @param {string} expiresIn - Token expiration time
 * @returns {string} - JWT token
 */
export const generateAccessToken = (payload, expiresIn = process.env.JWT_EXPIRE || '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn,
    issuer: 'multi-vendor-backend',
    audience: 'multi-vendor-app'
  });
};

/**
 * Generate JWT token (alias for generateAccessToken)
 * @param {string} userId - User ID
 * @param {string} email - User email
 * @param {string} role - User role
 * @returns {string} - JWT token
 */
export const generateToken = (userId, email, role) => {
  const payload = {
    id: userId,
    email,
    role
  };
  return generateAccessToken(payload);
};

/**
 * Generate JWT refresh token
 * @param {string|Object} userIdOrPayload - User ID or payload object
 * @param {string} expiresIn - Token expiration time
 * @returns {string} - JWT refresh token
 */
export const generateRefreshToken = (userIdOrPayload, expiresIn = '30d') => {
  let payload;
  
  if (typeof userIdOrPayload === 'string') {
    payload = { userId: userIdOrPayload };
  } else {
    payload = userIdOrPayload;
  }
  
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn,
    issuer: 'multi-vendor-backend',
    audience: 'multi-vendor-app'
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key for verification
 * @returns {Object} - Decoded token payload
 */
export const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    return jwt.verify(token, secret, {
      issuer: 'multi-vendor-backend',
      audience: 'multi-vendor-app'
    });
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object} - Decoded token payload
 */
export const verifyRefreshToken = (token) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  return verifyToken(token, secret);
};

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} - Decoded token payload
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    throw new Error(`Token decode failed: ${error.message}`);
  }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} - True if token is expired
 */
export const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiration date or null if invalid
 */
export const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return null;
    }
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

/**
 * Generate secure random token for password reset, email verification, etc.
 * @param {number} length - Token length in bytes
 * @returns {string} - Random hex token
 */
export const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate API key for vendors
 * @param {string} vendorId - Vendor ID
 * @param {string} prefix - API key prefix
 * @returns {string} - API key
 */
export const generateAPIKey = (vendorId, prefix = 'mvb') => {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.randomBytes(16).toString('hex');
  const vendorPart = Buffer.from(vendorId).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
  
  return `${prefix}_${timestamp}_${vendorPart}_${randomPart}`;
};

/**
 * Hash API key for storage
 * @param {string} apiKey - API key to hash
 * @returns {string} - Hashed API key
 */
export const hashAPIKey = (apiKey) => {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
};

/**
 * Verify API key
 * @param {string} apiKey - API key to verify
 * @param {string} hashedKey - Stored hashed API key
 * @returns {boolean} - True if API key is valid
 */
export const verifyAPIKey = (apiKey, hashedKey) => {
  const hashedInput = hashAPIKey(apiKey);
  return crypto.timingSafeEqual(Buffer.from(hashedInput), Buffer.from(hashedKey));
};

/**
 * Generate token pair (access + refresh)
 * @param {Object} payload - Token payload
 * @returns {Object} - Object containing access and refresh tokens
 */
export const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ 
    userId: payload.id || payload.userId,
    role: payload.role 
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: process.env.JWT_EXPIRE || '7d',
    tokenType: 'Bearer'
  };
};

/**
 * Extract token from Authorization header
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} - Extracted token or null
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7); // Remove 'Bearer ' prefix
};

/**
 * Create token payload for user
 * @param {Object} user - User object
 * @returns {Object} - Token payload
 */
export const createTokenPayload = (user) => {
  return {
    id: user._id || user.id,
    email: user.email,
    role: user.role,
    vendorId: user.vendorId || null,
    permissions: user.permissions || [],
    isVerified: user.isVerified || false,
    iat: Math.floor(Date.now() / 1000)
  };
};

/**
 * Validate token payload structure
 * @param {Object} payload - Token payload to validate
 * @returns {boolean} - True if payload is valid
 */
export const validateTokenPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const requiredFields = ['id', 'email', 'role'];
  return requiredFields.every(field => payload.hasOwnProperty(field));
};

/**
 * Get cookie options for JWT token
 * @param {boolean} isProduction - Whether in production environment
 * @returns {Object} - Cookie options
 */
export const getCookieOptions = (isProduction = process.env.NODE_ENV === 'production') => {
  const cookieExpire = process.env.COOKIE_EXPIRE || 7;
  
  return {
    expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/'
  };
};

/**
 * Clear cookie options
 * @param {boolean} isProduction - Whether in production environment
 * @returns {Object} - Cookie clear options
 */
export const getClearCookieOptions = (isProduction = process.env.NODE_ENV === 'production') => {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
    expires: new Date(0)
  };
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  generateSecureToken,
  generateAPIKey,
  hashAPIKey,
  verifyAPIKey,
  generateTokenPair,
  extractTokenFromHeader,
  createTokenPayload,
  validateTokenPayload,
  getCookieOptions,
  getClearCookieOptions
};
