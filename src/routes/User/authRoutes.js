const express = require('express');
const authController = require('../../controllers/User/authController');
const authMiddleware = require('../../middleware/authMiddleware');
const { validateRegistration, validateLogin, validatePasswordChange, validatePasswordReset } = require('../../utils/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', validatePasswordReset, authController.resetPassword);
router.get('/verify-email/:token', authController.verifyEmail);

// Protected routes (require authentication)
router.use(authMiddleware.authenticate); // Apply authentication middleware to all routes below

router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.post('/change-password', validatePasswordChange, authController.changePassword);
router.post('/switch-role', authController.switchRole);
router.get('/permissions', authController.getPermissions);
router.delete('/account', authController.deleteAccount);

module.exports = router;
