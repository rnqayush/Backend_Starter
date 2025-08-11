const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../../models/User');
const { successResponse, errorResponse } = require('../../utils/responseHelper');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      const { name, email, password, role, phone, businessName, businessType } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return errorResponse(res, 'User already exists with this email', 400);
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user object
      const userObj = {
        name,
        email,
        password: hashedPassword,
        role: role || 'customer',
        phone,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e40af&color=fff`,
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
      if (role === 'seller') {
        userObj.seller = {
          businessName: businessName || `${name}'s Store`,
          businessType: businessType || 'General',
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

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return successResponse(res, 'User registered successfully', {
        user: userResponse,
        token,
      }, 201);
    } catch (error) {
      console.error('Registration error:', error);
      return errorResponse(res, error.message || 'Registration failed', 500);
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return errorResponse(res, 'Invalid email or password', 401);
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return errorResponse(res, 'Invalid email or password', 401);
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

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return successResponse(res, 'Login successful', {
        user: userResponse,
        token,
      });
    } catch (error) {
      console.error('Login error:', error);
      return errorResponse(res, 'Login failed', 500);
    }
  }

  // Logout user
  async logout(req, res) {
    try {
      // Clear refresh token cookie
      res.clearCookie('refreshToken');
      return successResponse(res, 'Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
      return errorResponse(res, 'Logout failed', 500);
    }
  }

  // Refresh access token
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return errorResponse(res, 'Refresh token not provided', 401);
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Find user
      const user = await User.findById(decoded.id);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      // Generate new access token
      const newToken = this.generateToken(user);

      return successResponse(res, 'Token refreshed successfully', {
        token: newToken,
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      return errorResponse(res, 'Invalid refresh token', 401);
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      return successResponse(res, 'Profile retrieved successfully', { user });
    } catch (error) {
      console.error('Get profile error:', error);
      return errorResponse(res, 'Failed to get profile', 500);
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const allowedFields = [
        'name',
        'phone',
        'avatar',
        'preferences',
        'profile',
        'seller',
      ];

      const filteredData = {};
      Object.keys(req.body).forEach(key => {
        if (allowedFields.includes(key)) {
          filteredData[key] = req.body[key];
        }
      });

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { 
          ...filteredData,
          lastModified: new Date(),
        },
        { new: true, runValidators: true }
      );

      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      return successResponse(res, 'Profile updated successfully', { user });
    } catch (error) {
      console.error('Update profile error:', error);
      return errorResponse(res, error.message || 'Failed to update profile', 500);
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Find user with password
      const user = await User.findById(req.user.id).select('+password');
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return errorResponse(res, 'Current password is incorrect', 400);
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      user.password = hashedNewPassword;
      user.passwordChangedAt = new Date();
      await user.save();

      return successResponse(res, 'Password changed successfully');
    } catch (error) {
      console.error('Change password error:', error);
      return errorResponse(res, 'Failed to change password', 500);
    }
  }

  // Forgot password
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return errorResponse(res, 'User not found with this email', 404);
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      // Save hashed token and expiry
      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      await user.save();

      // TODO: Send email with reset token
      // For now, return the token (in production, this should be sent via email)
      
      return successResponse(res, 'Password reset token generated', {
        resetToken, // Remove this in production
        message: 'Password reset instructions sent to your email',
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      return errorResponse(res, 'Failed to process forgot password request', 500);
    }
  }

  // Reset password
  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      // Hash the token
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      // Find user with valid reset token
      const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return errorResponse(res, 'Token is invalid or has expired', 400);
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.passwordChangedAt = new Date();
      await user.save();

      // Generate new JWT token
      const jwtToken = this.generateToken(user);
      const refreshToken = this.generateRefreshToken(user);

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      const userResponse = user.toObject();
      delete userResponse.password;

      return successResponse(res, 'Password reset successful', {
        user: userResponse,
        token: jwtToken,
      });
    } catch (error) {
      console.error('Reset password error:', error);
      return errorResponse(res, 'Failed to reset password', 500);
    }
  }

  // Verify email
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      const user = await User.findOne({ emailVerificationToken: token });
      if (!user) {
        return errorResponse(res, 'Invalid verification token', 400);
      }

      // Update user
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      await user.save();

      return successResponse(res, 'Email verified successfully', {
        user: user.toObject(),
      });
    } catch (error) {
      console.error('Email verification error:', error);
      return errorResponse(res, 'Failed to verify email', 500);
    }
  }

  // Switch user role
  async switchRole(req, res) {
    try {
      const { newRole } = req.body;

      const user = await User.findById(req.user.id);
      if (!user) {
        return errorResponse(res, 'User not found', 404);
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

      return successResponse(res, 'Role switched successfully', {
        user: user.toObject(),
      });
    } catch (error) {
      console.error('Switch role error:', error);
      return errorResponse(res, 'Failed to switch role', 500);
    }
  }

  // Get user permissions
  async getPermissions(req, res) {
    try {
      const user = req.user;
      
      const permissions = this.getUserPermissions(user.role);

      return successResponse(res, 'Permissions retrieved successfully', {
        permissions,
        role: user.role,
      });
    } catch (error) {
      console.error('Get permissions error:', error);
      return errorResponse(res, 'Failed to get permissions', 500);
    }
  }

  // Delete account
  async deleteAccount(req, res) {
    try {
      const { password } = req.body;

      // Find user with password
      const user = await User.findById(req.user.id).select('+password');
      if (!user) {
        return errorResponse(res, 'User not found', 404);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return errorResponse(res, 'Password is incorrect', 400);
      }

      // Soft delete - mark as deleted instead of removing
      user.isDeleted = true;
      user.deletedAt = new Date();
      await user.save();

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      return successResponse(res, 'Account deleted successfully');
    } catch (error) {
      console.error('Delete account error:', error);
      return errorResponse(res, 'Failed to delete account', 500);
    }
  }

  // Helper methods
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

  generateRefreshToken(user) {
    const payload = {
      id: user._id,
      type: 'refresh',
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    });
  }

  getUserPermissions(role) {
    const permissions = {
      customer: ['read:profile', 'update:profile', 'create:booking', 'create:order'],
      seller: ['read:profile', 'update:profile', 'manage:products', 'manage:orders', 'read:analytics'],
      hotel_owner: ['read:profile', 'update:profile', 'manage:hotel', 'manage:rooms', 'manage:bookings'],
      wedding_vendor: ['read:profile', 'update:profile', 'manage:services', 'manage:portfolio', 'manage:bookings'],
      auto_dealer: ['read:profile', 'update:profile', 'manage:vehicles', 'manage:inventory'],
      business_owner: ['read:profile', 'update:profile', 'manage:services', 'manage:appointments'],
      admin: ['*'], // All permissions
      super_admin: ['*'], // All permissions
    };

    return permissions[role] || permissions.customer;
  }
}

module.exports = new AuthController();
