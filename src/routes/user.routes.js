import express from 'express';
import { getUsers, getUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect); // All routes are protected

router
  .route('/')
  .get(authorize('admin'), getUsers);

router
  .route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(authorize('admin'), deleteUser);

export default router;

