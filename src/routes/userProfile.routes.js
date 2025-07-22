import express from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  getPreferences,
  updatePreferences,
  changePassword,
  switchRole,
  getUserRoles,
  updateRolePermissions,
  getUserAnalytics,
  deactivateAccount,
  deleteAccount
} from '../controllers/userProfileController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile management
router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

// Avatar management
router.route('/avatar')
  .post(uploadAvatar)
  .delete(deleteAvatar);

// Preferences
router.route('/preferences')
  .get(getPreferences)
  .put(updatePreferences);

// Password management
router.post('/change-password', changePassword);

// Role management
router.post('/switch-role', switchRole);
router.get('/roles', getUserRoles);
router.put('/roles/:roleId', updateRolePermissions);

// Analytics
router.get('/analytics', getUserAnalytics);

// Account management
router.post('/deactivate', deactivateAccount);
router.delete('/account', deleteAccount);

export default router;

