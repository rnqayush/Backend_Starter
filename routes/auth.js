const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  verifyToken,
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validation');

// @route   POST /api/auth/register
router.post('/register', validateRegister, register);

// @route   POST /api/auth/login
router.post('/login', validateLogin, login);

// @route   GET /api/auth/me
router.get('/me', authenticate, getMe);

// @route   GET /api/auth/verify
router.get('/verify', authenticate, verifyToken);

// @route   PUT /api/auth/profile
router.put('/profile', authenticate, updateProfile);

// @route   PUT /api/auth/change-password
router.put('/change-password', authenticate, changePassword);

module.exports = router;
