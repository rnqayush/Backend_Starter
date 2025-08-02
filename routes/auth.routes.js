const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  refreshToken,
  logout,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  checkEmail,
  validateToken
} = require('../controllers/auth.controller');

// Import middleware
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { validateBody, validateParams } = require('../middleware/validate.middleware');

// Import validators
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  refreshTokenSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  userIdParamSchema
} = require('../validators/auth.validator');

// Public routes
router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh-token', validateBody(refreshTokenSchema), refreshToken);
router.post('/check-email', checkEmail);

// Protected routes (require authentication)
router.use(authenticate); // All routes below require authentication

router.get('/profile', getProfile);
router.put('/profile', validateBody(updateProfileSchema), updateProfile);
router.put('/change-password', validateBody(changePasswordSchema), changePassword);
router.post('/logout', logout);
router.get('/stats', getUserStats);
router.get('/validate-token', validateToken);

// Admin only routes
router.use(requireAdmin); // All routes below require admin role

router.get('/users', getAllUsers);
router.post('/users', validateBody(adminCreateUserSchema), createUser);
router.get('/users/:userId', validateParams(userIdParamSchema), getUserById);
router.put('/users/:userId', 
  validateParams(userIdParamSchema), 
  validateBody(adminUpdateUserSchema), 
  updateUser
);
router.delete('/users/:userId', validateParams(userIdParamSchema), deleteUser);

module.exports = router;
