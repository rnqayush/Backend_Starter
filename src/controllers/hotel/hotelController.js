import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import Hotel from '../../models/hotel/Hotel.js';
import Room from '../../models/hotel/Room.js';
import { createSlug } from '../../utils/slugify.js';

// @desc    Get all hotels with filters
// @route   GET /api/hotels
// @access  Public
export const getHotels = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  // Build search query
  const searchQuery = Hotel.searchHotels(req.query);

  // Sort options
  let sortBy = { createdAt: -1 };
  if (req.query.sortBy) {
    switch (req.query.sortBy) {
      case 'price-low':
        sortBy = { 'pricing.basePrice': 1 };
        break;
      case 'price-high':
        sortBy = { 'pricing.basePrice': -1 };
        break;
      case 'rating':
        sortBy = { averageRating: -1 };
        break;
      case 'popular':
        sortBy = { 'analytics.views': -1 };
        break;
      case 'newest':
        sortBy = { createdAt: -1 };
        break;
      default:
        sortBy = { createdAt: -1 };
    }
  }

  const hotels = await searchQuery
    .populate('owner', 'name businessInfo')
    .sort(sortBy)
    .skip(skip)
    .limit(limit)
    .select('-reviews -__v');

  const total = await Hotel.countDocuments(searchQuery.getQuery());

  sendSuccess(res, {
    hotels,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    filters: req.query
  }, 'Hotels retrieved successfully');
});

// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Private (Hotel Owner only)
export const createHotel = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'hotel') {
    return sendError(res, 'Only hotel owners can create hotel listings', 403);
  }

  const hotelData = {
    ...req.body,
    owner: req.user.id
  };

  // Generate slug if not provided
  if (!hotelData.slug) {
    hotelData.slug = createSlug(hotelData.name);
  }

  const hotel = await Hotel.create(hotelData);

  sendSuccess(res, {
    hotel
  }, 'Hotel created successfully', 201);
});

// @desc    Get single hotel
// @route   GET /api/hotels/:id
// @access  Public
export const getHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id)
    .populate('owner', 'name businessInfo rating')
    .populate('reviews.guest', 'name avatar')
    .populate('rooms');

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  // Increment view count
  await hotel.incrementViews();

  // Get available rooms for next 7 days (sample)
  const checkIn = new Date();
  const checkOut = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  const availableRooms = await Room.findAvailableRooms(hotel._id, checkIn, checkOut, 2);

  sendSuccess(res, {
    hotel,
    availableRooms: availableRooms.slice(0, 5) // Show first 5 available rooms
  }, 'Hotel retrieved successfully');
});

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private (Hotel Owner only)
export const updateHotel = asyncHandler(async (req, res, next) => {
  let hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  // Check if user owns this hotel or is admin
  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this hotel', 403);
  }

  hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  sendSuccess(res, {
    hotel
  }, 'Hotel updated successfully');
});

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Hotel Owner only)
export const deleteHotel = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  // Check if user owns this hotel or is admin
  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to delete this hotel', 403);
  }

  await Hotel.findByIdAndDelete(req.params.id);

  sendSuccess(res, null, 'Hotel deleted successfully');
});

// @desc    Get owner hotels
// @route   GET /api/hotels/owner/properties
// @access  Private (Hotel Owner only)
export const getOwnerHotels = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'hotel') {
    return sendError(res, 'Only hotel owners can access this endpoint', 403);
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = { owner: req.user.id };

  if (req.query.status) {
    query.status = req.query.status;
  }

  const hotels = await Hotel.find(query)
    .populate('rooms')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Hotel.countDocuments(query);

  sendSuccess(res, {
    hotels,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  }, 'Owner hotels retrieved successfully');
});

// @desc    Get hotel analytics
// @route   GET /api/hotels/:id/analytics
// @access  Private (Hotel Owner only)
export const getHotelAnalytics = asyncHandler(async (req, res, next) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  // Check if user owns this hotel
  if (hotel.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to view analytics for this hotel', 403);
  }

  // Get booking analytics
  const Booking = (await import('../../models/hotel/Booking.js')).default;
  const bookingStats = await Booking.getRevenueAnalytics(hotel._id);

  sendSuccess(res, {
    analytics: hotel.analytics,
    bookingStatistics: bookingStats[0] || {},
    performance: {
      conversionRate: hotel.analytics.conversionRate,
      averageStay: hotel.analytics.averageStay,
      repeatGuestRate: hotel.analytics.repeatGuests > 0 ? 
        ((hotel.analytics.repeatGuests / hotel.analytics.bookings) * 100).toFixed(2) : 0
    }
  }, 'Hotel analytics retrieved successfully');
});

// @desc    Add hotel review
// @route   POST /api/hotels/:id/reviews
// @access  Private (Customer only)
export const addHotelReview = asyncHandler(async (req, res, next) => {
  const { rating, title, comment, pros, cons } = req.body;

  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return sendError(res, 'Hotel not found', 404);
  }

  // Check if user already reviewed this hotel
  const existingReview = hotel.reviews.find(
    review => review.guest.toString() === req.user.id
  );

  if (existingReview) {
    return sendError(res, 'You have already reviewed this hotel', 400);
  }

  const reviewData = {
    guest: req.user.id,
    rating,
    title,
    comment,
    pros: pros || [],
    cons: cons || [],
    verified: false // TODO: Check if user actually stayed at this hotel
  };

  await hotel.addReview(reviewData);

  const updatedHotel = await Hotel.findById(req.params.id)
    .populate('reviews.guest', 'name avatar');

  sendSuccess(res, {
    hotel: updatedHotel,
    review: reviewData
  }, 'Review added successfully');
});

// @desc    Search hotels by location and dates
// @route   GET /api/hotels/search
// @access  Public
export const searchHotels = asyncHandler(async (req, res, next) => {
  const { city, checkIn, checkOut, guests = 1, ...filters } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  if (!city) {
    return sendError(res, 'City is required for hotel search', 400);
  }

  // Build search query
  const searchQuery = Hotel.searchHotels({ ...filters, city });

  let hotels = await searchQuery
    .populate('owner', 'name businessInfo')
    .sort({ featured: -1, 'analytics.views': -1 })
    .skip(skip)
    .limit(limit);

  // If dates provided, filter by room availability
  if (checkIn && checkOut) {
    const hotelsWithAvailability = [];
    
    for (let hotel of hotels) {
      const availableRooms = await Room.findAvailableRooms(
        hotel._id, 
        new Date(checkIn), 
        new Date(checkOut), 
        parseInt(guests)
      );
      
      if (availableRooms.length > 0) {
        hotel = hotel.toObject();
        hotel.availableRooms = availableRooms.length;
        hotel.startingPrice = Math.min(...availableRooms.map(room => room.pricing.basePrice));
        hotelsWithAvailability.push(hotel);
      }
    }
    
    hotels = hotelsWithAvailability;
  }

  const total = await Hotel.countDocuments(searchQuery.getQuery());

  sendSuccess(res, {
    hotels,
    pagination: {
      page,
      limit,
      total: hotels.length,
      pages: Math.ceil(hotels.length / limit)
    },
    searchParams: { city, checkIn, checkOut, guests },
    filters
  }, 'Hotel search completed successfully');
});

// @desc    Get featured hotels
// @route   GET /api/hotels/featured
// @access  Public
export const getFeaturedHotels = asyncHandler(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 12;
  const city = req.query.city;

  let query = { 
    status: 'published', 
    featured: true 
  };

  if (city) {
    query['location.address.city'] = new RegExp(city, 'i');
  }

  const hotels = await Hotel.find(query)
    .populate('owner', 'name businessInfo')
    .sort({ 'analytics.views': -1, createdAt: -1 })
    .limit(limit)
    .select('-reviews -__v');

  sendSuccess(res, {
    hotels,
    city: city || 'all'
  }, 'Featured hotels retrieved successfully');
});

// @desc    Get hotel owner dashboard
// @route   GET /api/hotels/owner/dashboard
// @access  Private (Hotel Owner only)
export const getOwnerDashboard = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'hotel') {
    return sendError(res, 'Only hotel owners can access owner dashboard', 403);
  }

  const ownerId = req.user.id;

  // Get hotels summary
  const hotelStats = await Hotel.aggregate([
    { $match: { owner: mongoose.Types.ObjectId(ownerId) } },
    {
      $group: {
        _id: null,
        totalHotels: { $sum: 1 },
        publishedHotels: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
        },
        totalViews: { $sum: '$analytics.views' },
        totalBookings: { $sum: '$analytics.bookings' }
      }
    }
  ]);

  // Get recent bookings
  const Booking = (await import('../../models/hotel/Booking.js')).default;
  const recentBookings = await Booking.find({
    hotel: { $in: await Hotel.find({ owner: ownerId }).distinct('_id') }
  })
    .populate('guest', 'name email')
    .populate('hotel', 'name')
    .sort({ bookedAt: -1 })
    .limit(10);

  // Get room occupancy
  const totalRooms = await Room.countDocuments({
    hotel: { $in: await Hotel.find({ owner: ownerId }).distinct('_id') }
  });

  const occupiedRooms = await Room.countDocuments({
    hotel: { $in: await Hotel.find({ owner: ownerId }).distinct('_id') },
    'availability.status': 'occupied'
  });

  sendSuccess(res, {
    hotelStatistics: hotelStats[0] || {},
    recentBookings,
    occupancy: {
      totalRooms,
      occupiedRooms,
      occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0
    }
  }, 'Owner dashboard data retrieved successfully');
});
