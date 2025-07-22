import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import Room from '../../models/hotel/Room.js';
import Hotel from '../../models/hotel/Hotel.js';

// @desc    Get all rooms for a hotel
// @route   GET /api/hotels/:hotelId/rooms
// @access  Public
export const getRooms = asyncHandler(async (req, res, next) => {
  const { hotelId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Verify hotel exists
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  let query = { hotel: hotelId, status: 'active' };

  // Apply filters
  if (req.query.type) query.type = req.query.type;
  if (req.query.category) query.category = req.query.category;
  if (req.query.available) query['availability.status'] = 'available';
  if (req.query.minPrice) query['pricing.basePrice'] = { $gte: parseFloat(req.query.minPrice) };
  if (req.query.maxPrice) query['pricing.basePrice'] = { ...query['pricing.basePrice'], $lte: parseFloat(req.query.maxPrice) };

  const rooms = await Room.find(query)
    .sort({ floor: 1, roomNumber: 1 })
    .skip(skip)
    .limit(limit)
    .select('-__v');

  const total = await Room.countDocuments(query);

  sendSuccess(res, {
    rooms,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }, 'Rooms retrieved successfully');
});

// @desc    Create new room
// @route   POST /api/hotels/:hotelId/rooms
// @access  Private (Hotel Owner only)
export const createRoom = asyncHandler(async (req, res, next) => {
  const { hotelId } = req.params;

  // Verify hotel exists and user owns it
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to add rooms to this hotel', 403);
  }

  const roomData = {
    ...req.body,
    hotel: hotelId
  };

  const room = await Room.create(roomData);

  sendSuccess(res, {
    room
  }, 'Room created successfully', 201);
});

// @desc    Get single room
// @route   GET /api/hotels/:hotelId/rooms/:id
// @access  Public
export const getRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id)
    .populate('hotel', 'name location contact');

  if (!room) {
    return sendError(res, 'Room not found', 404);
  }

  sendSuccess(res, {
    room
  }, 'Room retrieved successfully');
});

// @desc    Update room
// @route   PUT /api/hotels/:hotelId/rooms/:id
// @access  Private (Hotel Owner only)
export const updateRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id).populate('hotel');

  if (!room) {
    return sendError(res, 'Room not found', 404);
  }

  // Check if user owns this hotel or is admin
  if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this room', 403);
  }

  const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  sendSuccess(res, {
    room: updatedRoom
  }, 'Room updated successfully');
});

// @desc    Delete room
// @route   DELETE /api/hotels/:hotelId/rooms/:id
// @access  Private (Hotel Owner only)
export const deleteRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id).populate('hotel');

  if (!room) {
    return sendError(res, 'Room not found', 404);
  }

  // Check if user owns this hotel or is admin
  if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to delete this room', 403);
  }

  await Room.findByIdAndDelete(req.params.id);

  sendSuccess(res, null, 'Room deleted successfully');
});

// @desc    Check room availability
// @route   GET /api/hotels/:hotelId/rooms/availability
// @access  Public
export const checkAvailability = asyncHandler(async (req, res, next) => {
  const { hotelId } = req.params;
  const { checkIn, checkOut, guests = 1 } = req.query;

  if (!checkIn || !checkOut) {
    return sendError(res, 'Check-in and check-out dates are required', 400);
  }

  const availableRooms = await Room.findAvailableRooms(
    hotelId,
    new Date(checkIn),
    new Date(checkOut),
    parseInt(guests)
  );

  sendSuccess(res, {
    availableRooms,
    searchParams: { checkIn, checkOut, guests }
  }, 'Room availability checked successfully');
});

// @desc    Update room availability status
// @route   PUT /api/hotels/:hotelId/rooms/:id/availability
// @access  Private (Hotel Owner only)
export const updateAvailability = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id).populate('hotel');

  if (!room) {
    return sendError(res, 'Room not found', 404);
  }

  // Check if user owns this hotel or is admin
  if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update room availability', 403);
  }

  const { status, startDate, endDate, reason } = req.body;

  room.availability.status = status;

  if (status === 'maintenance' && startDate && endDate) {
    room.availability.maintenanceSchedule.push({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: reason || 'Maintenance',
      type: 'maintenance'
    });
  }

  await room.save();

  sendSuccess(res, {
    room: {
      id: room._id,
      roomNumber: room.roomNumber,
      availability: room.availability
    }
  }, 'Room availability updated successfully');
});

// @desc    Update housekeeping status
// @route   PUT /api/hotels/:hotelId/rooms/:id/housekeeping
// @access  Private (Hotel Owner only)
export const updateHousekeeping = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id).populate('hotel');

  if (!room) {
    return sendError(res, 'Room not found', 404);
  }

  // Check if user owns this hotel or is admin
  if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update housekeeping status', 403);
  }

  const { status, cleanedBy, notes } = req.body;

  await room.updateHousekeeping(status, cleanedBy, notes);

  sendSuccess(res, {
    room: {
      id: room._id,
      roomNumber: room.roomNumber,
      housekeeping: room.housekeeping
    }
  }, 'Housekeeping status updated successfully');
});

// @desc    Add room images
// @route   POST /api/hotels/:hotelId/rooms/:id/images
// @access  Private (Hotel Owner only)
export const addRoomImages = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id).populate('hotel');

  if (!room) {
    return sendError(res, 'Room not found', 404);
  }

  // Check if user owns this hotel or is admin
  if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this room', 403);
  }

  const { images } = req.body;

  if (!images || !Array.isArray(images)) {
    return sendError(res, 'Images array is required', 400);
  }

  // Add images to room
  images.forEach((image, index) => {
    room.images.push({
      url: image.url,
      alt: image.alt || `${room.name} - ${room.roomNumber}`,
      category: image.category || 'bedroom',
      isPrimary: room.images.length === 0 && index === 0,
      sortOrder: room.images.length + index
    });
  });

  await room.save();

  sendSuccess(res, {
    room: {
      id: room._id,
      images: room.images
    }
  }, 'Room images added successfully');
});

// @desc    Delete room image
// @route   DELETE /api/hotels/:hotelId/rooms/:id/images/:imageId
// @access  Private (Hotel Owner only)
export const deleteRoomImage = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id).populate('hotel');

  if (!room) {
    return sendError(res, 'Room not found', 404);
  }

  // Check if user owns this hotel or is admin
  if (room.hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to modify this room', 403);
  }

  // Remove image from array
  room.images = room.images.filter(img => img._id.toString() !== req.params.imageId);
  
  // If we removed the primary image, make the first remaining image primary
  if (room.images.length > 0 && !room.images.some(img => img.isPrimary)) {
    room.images[0].isPrimary = true;
  }

  await room.save();

  sendSuccess(res, {
    room: {
      id: room._id,
      images: room.images
    }
  }, 'Room image deleted successfully');
});

// @desc    Get room occupancy report
// @route   GET /api/hotels/:hotelId/rooms/occupancy
// @access  Private (Hotel Owner only)
export const getOccupancyReport = asyncHandler(async (req, res, next) => {
  const { hotelId } = req.params;
  const { startDate, endDate } = req.query;

  // Verify hotel exists and user owns it
  const hotel = await Hotel.findById(hotelId);
  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to view occupancy report', 403);
  }

  if (!startDate || !endDate) {
    return sendError(res, 'Start date and end date are required', 400);
  }

  const occupancyReport = await Room.getOccupancyReport(hotelId, startDate, endDate);

  sendSuccess(res, {
    occupancyReport,
    period: { startDate, endDate }
  }, 'Occupancy report retrieved successfully');
});

