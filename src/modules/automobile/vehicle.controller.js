import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';

// TODO: Implement vehicle controller for automobile module

export const getVehicles = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Vehicles endpoint - to be implemented');
});

export const createVehicle = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Create vehicle endpoint - to be implemented');
});

export const updateVehicle = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Update vehicle endpoint - to be implemented');
});

export const deleteVehicle = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Delete vehicle endpoint - to be implemented');
});

