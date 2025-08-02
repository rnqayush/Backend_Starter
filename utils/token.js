const jwt = require('jsonwebtoken');

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload
 * @param {String} secret - JWT secret (optional, defaults to env variable)
 * @param {String} expiresIn - Token expiration (optional, defaults to env variable)
 * @returns {String} JWT token
 */
const generateAccessToken = (payload, secret = null, expiresIn = null) => {
  return jwt.sign(
    payload,
    secret || process.env.JWT_SECRET,
    { expiresIn: expiresIn || process.env.JWT_EXPIRE || '7d' }
  );
};

/**
 * Generate JWT refresh token
 * @param {Object} payload - Token payload
 * @param {String} secret - JWT secret (optional, defaults to env variable)
 * @param {String} expiresIn - Token expiration (optional, defaults to env variable)
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (payload, secret = null, expiresIn = null) => {
  return jwt.sign(
    payload,
    secret || process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: expiresIn || process.env.JWT_REFRESH_EXPIRE || '30d' }
  );
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @param {String} secret - JWT secret (optional, defaults to env variable)
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token, secret = null) => {
  try {
    return jwt.verify(token, secret || process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Verify JWT refresh token
 * @param {String} token - JWT refresh token to verify
 * @param {String} secret - JWT secret (optional, defaults to env variable)
 * @returns {Object} Decoded token payload
 */
const verifyRefreshToken = (token, secret = null) => {
  try {
    return jwt.verify(
      token, 
      secret || process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Decode JWT token without verification
 * @param {String} token - JWT token to decode
 * @returns {Object} Decoded token payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error('Invalid token format');
  }
};

/**
 * Extract token from Authorization header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} Extracted token or null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
};

/**
 * Generate token pair (access and refresh tokens)
 * @param {Object} payload - Token payload
 * @returns {Object} Object containing access and refresh tokens
 */
const generateTokenPair = (payload) => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ userId: payload.userId });
  
  return {
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: process.env.JWT_EXPIRE || '7d'
  };
};

/**
 * Check if token is expired
 * @param {String} token - JWT token to check
 * @returns {Boolean} True if token is expired
 */
const isTokenExpired = (token) => {
  try {
    const decoded = decodeToken(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

/**
 * Get token expiration time
 * @param {String} token - JWT token
 * @returns {Date|null} Expiration date or null if invalid
 */
const getTokenExpiration = (token) => {
  try {
    const decoded = decodeToken(token);
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

/**
 * Create user payload for token
 * @param {Object} user - User object
 * @returns {Object} Token payload
 */
const createUserPayload = (user) => {
  return {
    userId: user._id,
    email: user.email,
    role: user.role,
    status: user.status
  };
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  extractTokenFromHeader,
  generateTokenPair,
  isTokenExpired,
  getTokenExpiration,
  createUserPayload
};
