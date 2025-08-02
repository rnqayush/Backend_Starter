import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { RESPONSE_MESSAGES } from "../config/constants.js";
import { generateToken, generateRefreshToken } from "../utils/token.js";

export const register = async (req, res) => {
  const { name, email, password, confirmPassword, role } = req.body;

  try {
    // 2. Check if passwords match (if confirmPassword is provided)
    if(!confirmPassword){
      return res.status(400).json({ 
        status: 'error',
        statusCode: 400,
        message: "enter confirm passowrd ",
        code: 'PASSWORD_MISMATCH'
      });
    }
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ 
        status: 'error',
        statusCode: 400,
        message: "Passwords do not match",
        code: 'PASSWORD_MISMATCH'
      });
    }

    // 3. Validate password strength
    if (password.length < 6) {
      return res.status(400).json({ 
        status: 'error',
        statusCode: 400,
        message: "Password must be at least 6 characters long",
        code: 'WEAK_PASSWORD'
      });
    }

    // 4. Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ 
        status: 'error',
        statusCode: 409,
        message: "User already exists with this email",
        code: 'USER_EXISTS'
      });
    }

    // 5. Save user (password will be hashed by pre-save middleware)
    const user = await User.create({ 
      name, 
      email, 
      password,
      role: role || 'customer'
    });

    // 6. Create tokens
    const token = generateToken(user._id.toString(), user.email, user.role);
    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      role: user.role
    });

    // 7. Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    });

    // 8. Send response
    res.status(201).json({
      status: 'success',
      statusCode: 201,
      message: RESPONSE_MESSAGES.CREATED,
      data: {
        user: user.toPublicJSON(),
        token,
        refreshToken
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      status: 'error',
      statusCode: 500,
      message: RESPONSE_MESSAGES.SERVER_ERROR,
      code: 'REGISTRATION_ERROR'
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if fields are provided
    if (!email || !password) {
      return res.status(400).json({ 
        status: 'error',
        statusCode: 400,
        message: "Email and password are required",
        code: 'MISSING_CREDENTIALS'
      });
    }

    // 2. Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil');
    if (!user) {
      return res.status(401).json({ 
        status: 'error',
        statusCode: 401,
        message: "Invalid credentials",
        code: 'INVALID_CREDENTIALS'
      });
    }

    // 3. Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        status: 'error',
        statusCode: 423,
        message: "Account is temporarily locked due to too many failed login attempts",
        code: 'ACCOUNT_LOCKED'
      });
    }

    // 4. Check if account is active
    if (!user.isActive || user.status !== 'active') {
      return res.status(401).json({ 
        status: 'error',
        statusCode: 401,
        message: "Account is deactivated",
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // 5. Compare password
    const match = await user.comparePassword(password);
    if (!match) {
      // Increment login attempts
      await user.incrementLoginAttempts();
      return res.status(401).json({ 
        status: 'error',
        statusCode: 401,
        message: "Invalid credentials",
        code: 'INVALID_CREDENTIALS'
      });
    }

    // 6. Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // 7. Update last login
    user.lastLogin = new Date();
    await user.save();

    // 8. Create tokens
    const token = generateToken(user._id.toString(), user.email, user.role);
    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      role: user.role
    });

    // 9. Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000,
    });

    // 10. Send response
    res.status(200).json({ 
      status: 'success',
      statusCode: 200,
      message: RESPONSE_MESSAGES.SUCCESS,
      data: {
        user: user.toPublicJSON(),
        token,
        refreshToken
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      status: 'error',
      statusCode: 500,
      message: RESPONSE_MESSAGES.SERVER_ERROR,
      code: 'LOGIN_ERROR'
    });
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", { 
    maxAge: 1,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  res.status(200).json({ 
    status: 'success',
    statusCode: 200,
    message: "Logged out successfully",
    data: null
  });
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        statusCode: 404,
        message: "User not found",
        code: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({ 
      status: 'success',
      statusCode: 200,
      message: RESPONSE_MESSAGES.SUCCESS,
      data: {
        user: user.toPublicJSON()
      }
    });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ 
      status: 'error',
      statusCode: 500,
      message: RESPONSE_MESSAGES.SERVER_ERROR,
      code: 'PROFILE_ERROR'
    });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.password;
    delete updates.email;
    delete updates.role;
    delete updates.permissions;
    delete updates.loginAttempts;
    delete updates.lockUntil;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        statusCode: 404,
        message: "User not found",
        code: 'USER_NOT_FOUND'
      });
    }

    res.status(200).json({ 
      status: 'success',
      statusCode: 200,
      message: RESPONSE_MESSAGES.UPDATED,
      data: {
        user: user.toPublicJSON()
      }
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ 
      status: 'error',
      statusCode: 500,
      message: RESPONSE_MESSAGES.SERVER_ERROR,
      code: 'UPDATE_PROFILE_ERROR'
    });
  }
};
