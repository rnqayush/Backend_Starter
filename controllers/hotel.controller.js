/**
 * Hotel Controller - Handle hotel-related operations
 */

import Hotel from '../models/Hotel.js';
import Vendor from '../models/Vendor.js';
import { catchAsync } from '../middleware/error.middleware.js';
import { AppError } from '../middleware/error.middleware.js';
import { BUSINESS_CATEGORIES, RESPONSE_MESSAGES, PAGINATION } from '../config/constants.js';
import { generateSlug, generateUniqueSlug } from '../utils/generateSlug.js';

// Create a new hotel
export const createHotel = catchAsync(async (req, res, next) => {
  const {
    name,
    location,
    address,
    city,
    pincode,
    phone,
    email,
    website,
    description,
    starRating,
    image,
    images,
    checkInTime,
    checkOutTime,
    policies,
    startingPrice,
    totalRooms,
    rooms,
    sections,
    sectionOrder,
    sectionVisibility
  } = req.body;

  // Verify vendor exists and belongs to user
  const vendor = await Vendor.findOne({ 
    owner: req.user._id, 
    category: BUSINESS_CATEGORIES.HOTEL 
  });
  
  if (!vendor) {
    return next(new AppError('Hotel vendor profile required', 400, 'VENDOR_NOT_FOUND'));
  }

  // Generate unique slug
  const baseSlug = generateSlug(`${name} ${city}`);
  const slug = await generateUniqueSlug(
    baseSlug,
    async (slug) => await Hotel.findOne({ slug })
  );

  // Generate unique hotel ID
  const lastHotel = await Hotel.findOne().sort({ id: -1 });
  const hotelId = lastHotel ? lastHotel.id + 1 : 1;

  // Create hotel
  const hotel = await Hotel.create({
    id: hotelId,
    name,
    slug,
    vendor: vendor._id,
    location,
    address,
    city,
    pincode,
    phone,
    email,
    website,
    description,
    starRating,
    image,
    images: images || [],
    checkInTime: checkInTime || '3:00 PM',
    checkOutTime: checkOutTime || '12:00 PM',
    policies: policies || [],
    startingPrice,
    totalRooms,
    availableRooms: rooms ? rooms.filter(room => room.available).length : totalRooms,
    rooms: rooms || [],
    ownerId: req.user._id.toString(),
    sections,
    sectionOrder: sectionOrder || ['hero', 'about', 'features', 'gallery', 'amenities', 'testimonials', 'contact', 'footer'],
    sectionVisibility: sectionVisibility || {}
  });

  res.status(201).json({
    status: 'success',
    statusCode: 201,
    message: RESPONSE_MESSAGES.CREATED,
    data: {
      hotel
    }
  });
});

// Get all hotels with filtering
export const getAllHotels = catchAsync(async (req, res, next) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    city,
    minPrice,
    maxPrice,
    starRating,
    featured,
    search,
    sortBy = 'rating',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = { isActive: true };

  if (city) query.city = new RegExp(city, 'i');
  if (minPrice || maxPrice) {
    query.startingPrice = {};
    if (minPrice) query.startingPrice.$gte = parseInt(minPrice);
    if (maxPrice) query.startingPrice.$lte = parseInt(maxPrice);
  }
  if (starRating) query.starRating = parseInt(starRating);
  if (featured !== undefined) query.isFeatured = featured === 'true';

  // Search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination and sorting
  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const hotels = await Hotel.find(query)
    .populate('vendor', 'name slug')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-ownerId -analytics.revenue');

  const total = await Hotel.countDocuments(query);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      hotels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Get hotel by ID or slug
export const getHotel = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Try to find by ID first, then by slug
  let hotel = await Hotel.findOne({ 
    $or: [{ _id: id }, { slug: id }, { id: parseInt(id) || 0 }],
    isActive: true 
  }).populate('vendor', 'name slug rating reviewCount');

  if (!hotel) {
    return next(new AppError('Hotel not found', 404, 'HOTEL_NOT_FOUND'));
  }

  // Increment views if not owner
  if (!req.user || hotel.ownerId !== req.user._id.toString()) {
    await hotel.incrementViews();
  }

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      hotel: req.user && hotel.ownerId === req.user._id.toString() 
        ? hotel 
        : hotel.toPublicJSON()
    }
  });
});

// Update hotel
export const updateHotel = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  // Find hotel
  const hotel = await Hotel.findById(id);
  if (!hotel) {
    return next(new AppError('Hotel not found', 404, 'HOTEL_NOT_FOUND'));
  }

  // Check ownership
  if (hotel.ownerId !== req.user._id.toString()) {
    return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
  }

  // Prevent updating certain fields
  delete updates.id;
  delete updates.vendor;
  delete updates.ownerId;
  delete updates.analytics;
  delete updates.createdAt;
  delete updates.updatedAt;

  // If name or city is being updated, regenerate slug
  if (updates.name || updates.city) {
    const name = updates.name || hotel.name;
    const city = updates.city || hotel.city;
    
    const baseSlug = generateSlug(`${name} ${city}`);
    const newSlug = await generateUniqueSlug(
      baseSlug,
      async (slug) => await Hotel.findOne({ slug, _id: { $ne: hotel._id } })
    );
    updates.slug = newSlug;
  }

  // Update hotel
  const updatedHotel = await Hotel.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.UPDATED,
    data: {
      hotel: updatedHotel
    }
  });
});

// Delete hotel
export const deleteHotel = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find hotel
  const hotel = await Hotel.findById(id);
  if (!hotel) {
    return next(new AppError('Hotel not found', 404, 'HOTEL_NOT_FOUND'));
  }

  // Check ownership
  if (hotel.ownerId !== req.user._id.toString()) {
    return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
  }

  // Soft delete
  await Hotel.findByIdAndUpdate(id, { isActive: false });

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.DELETED,
    data: null
  });
});

// Get hotels by city
export const getHotelsByCity = catchAsync(async (req, res, next) => {
  const { city } = req.params;
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    sortBy = 'rating',
    sortOrder = 'desc'
  } = req.query;

  const query = { 
    city: new RegExp(city, 'i'), 
    isActive: true 
  };

  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const hotels = await Hotel.find(query)
    .populate('vendor', 'name slug')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-ownerId -analytics.revenue');

  const total = await Hotel.countDocuments(query);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      hotels,
      city,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Add room to hotel
export const addRoom = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const roomData = req.body;

  // Find hotel
  const hotel = await Hotel.findById(id);
  if (!hotel) {
    return next(new AppError('Hotel not found', 404, 'HOTEL_NOT_FOUND'));
  }

  // Check ownership
  if (hotel.ownerId !== req.user._id.toString()) {
    return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
  }

  // Add room
  await hotel.addRoom(roomData);

  res.status(201).json({
    status: 'success',
    statusCode: 201,
    message: 'Room added successfully',
    data: {
      hotel
    }
  });
});

// Update room
export const updateRoom = catchAsync(async (req, res, next) => {
  const { id, roomId } = req.params;
  const updates = req.body;

  // Find hotel
  const hotel = await Hotel.findById(id);
  if (!hotel) {
    return next(new AppError('Hotel not found', 404, 'HOTEL_NOT_FOUND'));
  }

  // Check ownership
  if (hotel.ownerId !== req.user._id.toString()) {
    return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
  }

  // Find and update room
  const room = hotel.rooms.find(r => r.id === parseInt(roomId));
  if (!room) {
    return next(new AppError('Room not found', 404, 'ROOM_NOT_FOUND'));
  }

  // Update room properties
  Object.assign(room, updates);
  await hotel.save();

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: 'Room updated successfully',
    data: {
      room
    }
  });
});

// Delete room
export const deleteRoom = catchAsync(async (req, res, next) => {
  const { id, roomId } = req.params;

  // Find hotel
  const hotel = await Hotel.findById(id);
  if (!hotel) {
    return next(new AppError('Hotel not found', 404, 'HOTEL_NOT_FOUND'));
  }

  // Check ownership
  if (hotel.ownerId !== req.user._id.toString()) {
    return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
  }

  // Remove room
  await hotel.removeRoom(parseInt(roomId));

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: 'Room deleted successfully',
    data: null
  });
});

// Get featured hotels
export const getFeaturedHotels = catchAsync(async (req, res, next) => {
  const { limit = 10 } = req.query;

  const hotels = await Hotel.find({ 
    isFeatured: true, 
    isActive: true 
  })
    .populate('vendor', 'name slug')
    .sort({ rating: -1, reviewCount: -1 })
    .limit(parseInt(limit))
    .select('-ownerId -analytics.revenue');

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      hotels
    }
  });
});

// Search hotels
export const searchHotels = catchAsync(async (req, res, next) => {
  const {
    q: searchTerm,
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    city,
    checkIn,
    checkOut,
    guests,
    sortBy = 'relevance'
  } = req.query;

  if (!searchTerm) {
    return next(new AppError('Search term is required', 400, 'SEARCH_TERM_REQUIRED'));
  }

  const query = {
    isActive: true,
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { location: { $regex: searchTerm, $options: 'i' } },
      { city: { $regex: searchTerm, $options: 'i' } },
      { description: { $regex: searchTerm, $options: 'i' } }
    ]
  };

  if (city) query.city = new RegExp(city, 'i');
  if (guests) query['rooms.maxGuests'] = { $gte: parseInt(guests) };

  const skip = (page - 1) * limit;
  
  let sortOptions = { rating: -1, reviewCount: -1 };
  if (sortBy === 'price') sortOptions = { startingPrice: 1 };
  if (sortBy === 'name') sortOptions = { name: 1 };

  const hotels = await Hotel.find(query)
    .populate('vendor', 'name slug')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .select('-ownerId -analytics.revenue');

  const total = await Hotel.countDocuments(query);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      hotels,
      searchTerm,
      filters: { city, checkIn, checkOut, guests },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

export default {
  createHotel,
  getAllHotels,
  getHotel,
  updateHotel,
  deleteHotel,
  getHotelsByCity,
  addRoom,
  updateRoom,
  deleteRoom,
  getFeaturedHotels,
  searchHotels
};
