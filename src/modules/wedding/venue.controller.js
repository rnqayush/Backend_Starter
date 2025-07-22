import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';

// TODO: Implement venue controller for wedding module

export const getVenues = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Venues endpoint - to be implemented');
});

export const createVenue = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Create venue endpoint - to be implemented');
});

export const updateVenue = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Update venue endpoint - to be implemented');
});

export const deleteVenue = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Delete venue endpoint - to be implemented');
});

