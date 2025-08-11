const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const responseHelper = require('../../../utils/responseHelper');

class AuthController {
  /**
   * Register new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.error(res, 'Validation failed', 400, errors.array());
      }

      const { email, password, name, phone, role, businessName, businessType } = req.body;

      // Register user
      const result = await authService.registerUser({
        email,
        password,
        name,
        phone,
        role: role || 'customer',
        businessName,
        businessType,
      });

      // Set HTTP-only cookie for refresh token
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return responseHelper.success(res, 'User registered successfully', {
        user: result.user,
        token: result.token,
      }, 201);
    } catch (error) {
      console.error('Registration error:', error);
      return responseHelper.error(res, error.message, 400);
    }
  }

  /**
   * Login user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async login(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.error(res, 'Validation failed', 400, errors.array());
      }

      const { email, password } = req.body;

      // Login user
      const result = await authService.loginUser(email, password);

      // Set HTTP-only cookie for refresh token
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return responseHelper.success(res, 'Login successful', {
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      console.error('Login error:', error);
      return responseHelper.error(res, error.message, 401);
    }
  }

  /**
   * Logout user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logout(req, res) {
    try {
      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      return responseHelper.success(res, 'Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      return responseHelper.error(res, 'Logout failed', 500);
    }
  }

  /**
   * Refresh access token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async refreshToken(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (!refreshToken) {
        return responseHelper.error(res, 'Refresh token not provided', 401);
      }

      // Refresh token
      const result = await authService.refreshToken(refreshToken);

      return responseHelper.success(res, 'Token refreshed successfully', {
        token: result.token,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      return responseHelper.error(res, error.message, 401);
    }
  }

  /**
   * Get current user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProfile(req, res) {
    try {
      const user = req.user;

      return responseHelper.success(res, 'Profile retrieved successfully', {
        user,
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return responseHelper.error(res, 'Failed to get profile', 500);
    }
  }

  /**
   * Update user profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateProfile(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.error(res, 'Validation failed', 400, errors.array());
      }

      const userId = req.user.id;
      const updateData = req.body;

      // Update profile
      const updatedUser = await authService.updateProfile(userId, updateData);

      return responseHelper.success(res, 'Profile updated successfully', {
        user: updatedUser,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return responseHelper.error(res, error.message, 400);
    }
  }

  /**
   * Change user password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async changePassword(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.error(res, 'Validation failed', 400, errors.array());
      }

      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      // Change password
      await authService.changePassword(userId, currentPassword, newPassword);

      return responseHelper.success(res, 'Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      return responseHelper.error(res, error.message, 400);
    }
  }

  /**
   * Request password reset
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async forgotPassword(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.error(res, 'Validation failed', 400, errors.array());
      }

      const { email } = req.body;

      // Generate reset token
      const resetToken = await authService.generatePasswordResetToken(email);

      // TODO: Send email with reset token
      // For now, we'll return the token in response (remove in production)
      return responseHelper.success(res, 'Password reset token generated', {
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      // Don't reveal if email exists or not
      return responseHelper.success(res, 'If an account with that email exists, a password reset link has been sent.');
    }
  }

  /**
   * Reset password using token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async resetPassword(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.error(res, 'Validation failed', 400, errors.array());
      }

      const { token } = req.params;
      const { password } = req.body;

      // Reset password
      const result = await authService.resetPassword(token, password);

      // Set HTTP-only cookie for refresh token
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return responseHelper.success(res, 'Password reset successful', {
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      console.error('Reset password error:', error);
      return responseHelper.error(res, error.message, 400);
    }
  }

  /**
   * Verify email address
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      // Verify email
      const user = await authService.verifyEmail(token);

      return responseHelper.success(res, 'Email verified successfully', {
        user,
      });
    } catch (error) {
      console.error('Email verification error:', error);
      return responseHelper.error(res, error.message, 400);
    }
  }

  /**
   * Switch user role
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async switchRole(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.error(res, 'Validation failed', 400, errors.array());
      }

      const userId = req.user.id;
      const { role } = req.body;

      // Switch role
      const updatedUser = await authService.switchRole(userId, role);

      return responseHelper.success(res, 'Role switched successfully', {
        user: updatedUser,
      });
    } catch (error) {
      console.error('Switch role error:', error);
      return responseHelper.error(res, error.message, 400);
    }
  }

  /**
   * Get user permissions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getPermissions(req, res) {
    try {
      const user = req.user;

      const permissions = {
        canAccessSeller: authService.hasPermission(user, 'seller'),
        canAccessHotelOwner: authService.hasPermission(user, 'hotel_owner'),
        canAccessWeddingVendor: authService.hasPermission(user, 'wedding_vendor'),
        canAccessAutoDealer: authService.hasPermission(user, 'auto_dealer'),
        canAccessBusinessOwner: authService.hasPermission(user, 'business_owner'),
        canAccessAdmin: authService.hasPermission(user, 'admin'),
        role: user.role,
      };

      return responseHelper.success(res, 'Permissions retrieved successfully', {
        permissions,
      });
    } catch (error) {
      console.error('Get permissions error:', error);
      return responseHelper.error(res, 'Failed to get permissions', 500);
    }
  }

  /**
   * Delete user account
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteAccount(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return responseHelper.error(res, 'Validation failed', 400, errors.array());
      }

      const userId = req.user.id;
      const { password } = req.body;

      // Verify password before deletion
      const user = await User.findById(userId).select('+password');
      if (!user) {
        return responseHelper.error(res, 'User not found', 404);
      }

      const isPasswordValid = await authService.comparePassword(password, user.password);
      if (!isPasswordValid) {
        return responseHelper.error(res, 'Invalid password', 401);
      }

      // Soft delete user (mark as deleted instead of removing)
      user.isDeleted = true;
      user.deletedAt = new Date();
      user.email = `deleted_${Date.now()}_${user.email}`;
      await user.save();

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      return responseHelper.success(res, 'Account deleted successfully');
    } catch (error) {
      console.error('Delete account error:', error);
      return responseHelper.error(res, 'Failed to delete account', 500);
    }
  }
}

module.exports = new AuthController();

