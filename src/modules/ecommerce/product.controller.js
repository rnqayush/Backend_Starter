import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';

// TODO: Implement product controller for ecommerce module

export const getProducts = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Products endpoint - to be implemented');
});

export const createProduct = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Create product endpoint - to be implemented');
});

export const updateProduct = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Update product endpoint - to be implemented');
});

export const deleteProduct = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Delete product endpoint - to be implemented');
});

