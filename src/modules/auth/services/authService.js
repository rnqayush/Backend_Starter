const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../../models/User');
const { validationResult } = require('express-validator');

class AuthService {
  /**
   * Generate JWT token for user
   * @param {Object} user - User object
   * @returns {String} JWT token
   */
  generateToken(user) {
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }

  /**
   * Generate refresh token
   * @param {Object} user - User object
   * @returns {String} Refresh token
   */
  generateRefreshToken(user) {
    const payload = {
      id: user._id,
      type: 'refresh',
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    });
  }

  /**
   * Hash password using bcrypt
   * @param {String} password - Plain text password
   * @returns {String} Hashed password
   */
  async hashPassword(password) {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   * @param {String} password - Plain text password
   * @param {String} hash - Hashed password
   * @returns {Boolean} Password match result
   */
  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Object} Created user and token
   */
  async registerUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(userData.password);

      // Create user object
      const userObj = {
        ...userData,
        password: hashedPassword,
        avatar: userData.avatar || this.generateAvatar(userData.name),
        preferences: {
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          language: 'en',
          currency: 'USD',
        },
        profile: {
          bio: '',
          location: '',
          website: '',
          socialLinks: {},
        },
        isEmailVerified: false,
        emailVerificationToken: crypto.randomBytes(32).toString('hex'),
        createdAt: new Date(),
        lastLogin: new Date(),
      };

      // Add role-specific data
      if (userData.role === 'seller') {
        userObj.seller = {
          businessName: userData.businessName || `${userData.name}'s Store`,
          businessType: userData.businessType || 'General',
          verified: false,
          rating: 0,
          totalSales: 0,
          totalProducts: 0,
          joinedDate: new Date(),
          settings: {
            autoRespond: true,
            showLocation: true,
            allowReviews: true,
          },
        };
      }

      // Create user
      const user = new User(userObj);
      await user.save();

      // Generate tokens
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.emailVerificationToken;
      delete userResponse.passwordResetToken;
      delete userResponse.passwordResetExpires;

      return {
        user: userResponse,
        token,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login user
   * @param {String} email - User email
   * @param {String} password - User password
   * @returns {Object} User and token
   */
  async loginUser(email, password) {
    try {
      // Find user by email
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check password
      const isPasswordValid = await this.comparePassword(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate tokens
      const token = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.emailVerificationToken;
      delete userResponse.passwordResetToken;
      delete userResponse.passwordResetExpires;

      return {
        user: userResponse,
        token,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param {String} refreshToken - Refresh token
   * @returns {Object} New access token
   */
  async refreshToken(refreshToken) {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Find user
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }

      // Generate new access token
      const newToken = this.generateToken(user);

      return {
        token: newToken,
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Update user profile
   * @param {String} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated user
   */
  async updateProfile(userId, updateData) {
    try {
      // Remove sensitive fields from update data
      const allowedFields = [
        'name',
        'phone',
        'avatar',
        'preferences',
        'profile',
        'seller',
      ];

      const filteredData = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = updateData[key];
        }
      });

      // Update user
      const user = await User.findByIdAndUpdate(
        userId,
        { 
          ...filteredData,
          lastModified: new Date(),
        },
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      // Remove sensitive data from response
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.emailVerificationToken;
      delete userResponse.passwordResetToken;
      delete userResponse.passwordResetExpires;

      return userResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change user password
   * @param {String} userId - User ID
   * @param {String} currentPassword - Current password
   * @param {String} newPassword - New password
   * @returns {Boolean} Success status
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Find user with password
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await this.hashPassword(newPassword);

      // Update password
      user.password = hashedNewPassword;
      user.passwordChangedAt = new Date();
      await user.save();

      return true;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate password reset token
   * @param {String} email - User email
   * @returns {String} Reset token
   */
  async generatePasswordResetToken(email) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('User not found with this email');
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Save hashed token and expiry
      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      return resetToken;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password using token
   * @param {String} token - Reset token
   * @param {String} newPassword - New password
   * @returns {Object} User and new token
   */
  async resetPassword(token, newPassword) {
    try {
      // Hash the token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid reset token
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        throw new Error('Token is invalid or has expired');
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update password and clear reset token
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.passwordChangedAt = new Date();
      await user.save();

      // Generate new JWT token
      const jwtToken = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Remove password from response
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.emailVerificationToken;
      delete userResponse.passwordResetToken;
      delete userResponse.passwordResetExpires;

      return {
        user: userResponse,
        token: jwtToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify email using token
   * @param {String} token - Email verification token
   * @returns {Object} User data
   */
  async verifyEmail(token) {
    try {
      const user = await User.findOne({ emailVerificationToken: token });
      if (!user) {
        throw new Error('Invalid verification token');
      }

      // Update user
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();

      // Remove sensitive data from response
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.emailVerificationToken;
      delete userResponse.passwordResetToken;
      delete userResponse.passwordResetExpires;

      return userResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Switch user role
   * @param {String} userId - User ID
   * @param {String} newRole - New role
   * @returns {Object} Updated user
   */
  async switchRole(userId, newRole) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update role
      user.role = newRole;

      // Add role-specific data if needed
      if (newRole === 'seller' && !user.seller) {
        user.seller = {
          businessName: `${user.name}'s Store`,
          businessType: 'General',
          verified: false,
          rating: 0,
          totalSales: 0,
          totalProducts: 0,
          joinedDate: new Date(),
          settings: {
            autoRespond: true,
            showLocation: true,
            allowReviews: true,
          },
        };
      }

      await user.save();

      // Remove sensitive data from response
      const userResponse = user.toObject();
      delete userResponse.password;
      delete userResponse.emailVerificationToken;
      delete userResponse.passwordResetToken;
      delete userResponse.passwordResetExpires;

      return userResponse;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate avatar URL
   * @param {String} name - User name
   * @returns {String} Avatar URL
   */
  generateAvatar(name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e40af&color=fff`;
  }

  /**
   * Validate user permissions
   * @param {Object} user - User object
   * @param {String} requiredRole - Required role
   * @returns {Boolean} Permission status
   */
  hasPermission(user, requiredRole) {
    const roleHierarchy = {
      customer: 1,
      seller: 2,
      hotel_owner: 2,
      wedding_vendor: 2,
      auto_dealer: 2,
      business_owner: 2,
      admin: 3,
      super_admin: 4,
    };

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }
}

module.exports = new AuthService();

