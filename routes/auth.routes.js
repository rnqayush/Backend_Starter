/**
 * Auth Routes
 */

import express from 'express';
import { register, login, logout, getProfile, updateProfile } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(verifyToken); // All routes below require authentication

router.post('/logout', logout);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
