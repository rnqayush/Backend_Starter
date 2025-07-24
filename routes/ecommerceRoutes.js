import express from 'express';
import { body } from 'express-validator';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getVendorProducts,
} from '../controllers/ecommerceController.js';
import { protect } from '../middlewares/auth.js';
import { authorize } from '../middlewares/roleAuth.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = express.Router();

// Validation rules
const createProductValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 3000 })
    .withMessage('Description must be between 10 and 3000 characters'),
  body('category')
    .isIn(['electronics', 'clothing', 'home_garden', 'sports', 'books', 'beauty', 'toys', 'automotive', 'health', 'jewelry', 'food'])
    .withMessage('Invalid category'),
  body('sku')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('SKU must be between 3 and 50 characters'),
  body('pricing.basePrice')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('inventory.quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
];

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes
router.use(protect);

// Vendor routes
router.post('/', authorize('vendor'), createProductValidation, validateRequest, createProduct);
router.put('/:id', authorize('vendor'), updateProduct);
router.delete('/:id', authorize('vendor'), deleteProduct);
router.get('/vendor/my-products', authorize('vendor'), getVendorProducts);

export default router;

