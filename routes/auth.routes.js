/**
 * Auth Routes
 */

import express from 'express';
import { register, login, logout } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', verifyToken, logout);

export default router;
