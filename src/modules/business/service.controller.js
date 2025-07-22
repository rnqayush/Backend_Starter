import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';

// TODO: Implement service controller for business module

export const getServices = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Services endpoint - to be implemented');
});

export const createService = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Create service endpoint - to be implemented');
});

export const updateService = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Update service endpoint - to be implemented');
});

export const deleteService = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Delete service endpoint - to be implemented');
});

