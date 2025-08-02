const User = require('../models/User.model');
const { generateTokenPair, createUserPayload } = require('../utils/token');
const { HTTP_STATUS, MESSAGES, USER_STATUS } = require('../config/constants');
const { authError, conflictError, notFoundError, validationError } = require('../middleware/error.middleware');

class AuthService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} User data and tokens
   */
  async register(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        conflictError(MESSAGES.EMAIL_ALREADY_EXISTS);
      }

      // Remove confirmPassword from userData before saving
      const { confirmPassword, agreeToTerms, ...userDataToSave } = userData;

      // Create new user
      const user = new User(userDataToSave);
      await user.save();

      // Generate tokens
      const payload = createUserPayload(user);
      const tokens = generateTokenPair(payload);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return {
        success: true,
        message: MESSAGES.USER_CREATED,
        data: {
          user: userResponse,
          ...tokens
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   * @param {String} email - User email
   * @param {String} password - User password
   * @param {Boolean} rememberMe - Remember user login
   * @returns {Object} User data and tokens
   */
  async login(email, password, rememberMe = false) {
    try {
      // Find user with password
      const user = await User.findByEmailWithPassword(email);
      
      if (!user) {
        authError(MESSAGES.INVALID_CREDENTIALS);
      }

      // Check if account is locked
      if (user.isLocked) {
        authError('Account is temporarily locked due to too many failed login attempts');
      }

      // Check if account is active
      if (user.status !== USER_STATUS.ACTIVE) {
        authError('Account is not active');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      
      if (!isPasswordValid) {
        // Increment login attempts
        await user.incLoginAttempts();
        authError(MESSAGES.INVALID_CREDENTIALS);
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const payload = createUserPayload(user);
      const tokens = generateTokenPair(payload);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;

      return {
        success: true,
        message: MESSAGES.LOGIN_SUCCESS,
        data: {
          user: userResponse,
          ...tokens
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user profile
   * @param {String} userId - User ID
   * @returns {Object} User profile data
   */
  async getProfile(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        notFoundError(MESSAGES.USER_NOT_FOUND);
      }

      return {
        success: true,
        data: { user }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {String} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated user data
   */
  async updateProfile(userId, updateData) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        notFoundError(MESSAGES.USER_NOT_FOUND);
      }

      // Update user fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          user[key] = updateData[key];
        }
      });

      await user.save();

      return {
        success: true,
        message: MESSAGES.USER_UPDATED,
        data: { user }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user password
   * @param {String} userId - User ID
   * @param {String} currentPassword - Current password
   * @param {String} newPassword - New password
   * @returns {Object} Success message
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        notFoundError(MESSAGES.USER_NOT_FOUND);
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        authError('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param {String} refreshToken - Refresh token
   * @returns {Object} New tokens
   */
  async refreshToken(refreshToken) {
    try {
      const { verifyRefreshToken } = require('../utils/token');
      
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);
      
      // Find user
      const user = await User.findById(decoded.userId);
      
      if (!user || user.status !== USER_STATUS.ACTIVE) {
        authError('Invalid refresh token');
      }

      // Generate new tokens
      const payload = createUserPayload(user);
      const tokens = generateTokenPair(payload);

      return {
        success: true,
        message: 'Token refreshed successfully',
        data: tokens
      };
    } catch (error) {
      authError('Invalid refresh token');
    }
  }

  /**
   * Logout user (invalidate tokens)
   * @param {String} userId - User ID
   * @returns {Object} Success message
   */
  async logout(userId) {
    try {
      // In a production app, you might want to blacklist the token
      // For now, we'll just return a success message
      // The client should remove the token from storage
      
      return {
        success: true,
        message: MESSAGES.LOGOUT_SUCCESS
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   * @param {Object} filters - Filter options
   * @param {Object} pagination - Pagination options
   * @returns {Object} Users list with pagination
   */
  async getAllUsers(filters = {}, pagination = {}) {
    try {
      const { page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = pagination;
      const skip = (page - 1) * limit;

      // Build query
      const query = {};
      
      if (filters.role) {
        query.role = filters.role;
      }
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.search) {
        query.$or = [
          { firstName: { $regex: filters.search, $options: 'i' } },
          { lastName: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } }
        ];
      }

      // Execute query
      const users = await User.find(query)
        .sort({ [sort]: order === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limit);

      const total = await User.countDocuments(query);

      return {
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create user (admin only)
   * @param {Object} userData - User data
   * @returns {Object} Created user
   */
  async createUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        conflictError(MESSAGES.EMAIL_ALREADY_EXISTS);
      }

      // Create new user
      const user = new User(userData);
      await user.save();

      return {
        success: true,
        message: MESSAGES.USER_CREATED,
        data: { user }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update user (admin only)
   * @param {String} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated user
   */
  async updateUser(userId, updateData) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        notFoundError(MESSAGES.USER_NOT_FOUND);
      }

      // Check if email is being changed and if it already exists
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findOne({ email: updateData.email });
        if (existingUser) {
          conflictError(MESSAGES.EMAIL_ALREADY_EXISTS);
        }
      }

      // Update user fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          user[key] = updateData[key];
        }
      });

      await user.save();

      return {
        success: true,
        message: MESSAGES.USER_UPDATED,
        data: { user }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete user (admin only)
   * @param {String} userId - User ID
   * @returns {Object} Success message
   */
  async deleteUser(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        notFoundError(MESSAGES.USER_NOT_FOUND);
      }

      await User.findByIdAndDelete(userId);

      return {
        success: true,
        message: MESSAGES.USER_DELETED
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();
