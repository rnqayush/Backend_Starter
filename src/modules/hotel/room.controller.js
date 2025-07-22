import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';

// TODO: Implement room controller for hotel module

export const getRooms = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Rooms endpoint - to be implemented');
});

export const createRoom = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Create room endpoint - to be implemented');
});

export const updateRoom = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Update room endpoint - to be implemented');
});

export const deleteRoom = asyncHandler(async (req, res, next) => {
  sendSuccess(res, 'Delete room endpoint - to be implemented');
});

