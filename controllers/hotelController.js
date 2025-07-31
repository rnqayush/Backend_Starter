const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const HotelBooking = require('../models/HotelBooking');
const { asyncHandler, AppError, successResponse, paginatedResponse } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

/**
 * Hotel Controller
 * Handles hotel management operations
 */
class HotelController {
  /**
   * Create a new hotel
   * @route POST /api/hotels
   * @access Private
   */
  createHotel = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const hotelData = { ...req.body, website: req.website._id };
    const hotel = await Hotel.create(hotelData);
    await hotel.populate('website', 'name slug');

    successResponse(res, { hotel }, 'Hotel created successfully', 201);
  });

  /**
   * Get all hotels for a website
   * @route GET /api/hotels
   * @access Public
   */
  getHotels = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const starRating = req.query.starRating;
    const search = req.query.search;

    const query = { website: req.website._id };
    
    if (status) query.status = status;
    if (starRating) query.starRating = { $gte: parseInt(starRating) };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.address.city': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const hotels = await Hotel.find(query)
      .populate('website', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalItems = await Hotel.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const pagination = { page, limit, totalPages, totalItems };
    paginatedResponse(res, hotels, pagination, 'Hotels retrieved successfully');
  });

  /**
   * Get hotel by ID
   * @route GET /api/hotels/:id
   * @access Public
   */
  getHotelById = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const hotel = await Hotel.findById(id).populate('website', 'name slug');

    if (!hotel) {
      return next(new AppError('Hotel not found', 404, 'HOTEL_NOT_FOUND'));
    }

    // Get rooms for this hotel
    const rooms = await Room.find({ hotel: id, isActive: true });
    
    successResponse(res, { hotel, rooms }, 'Hotel retrieved successfully');
  });

  /**
   * Update hotel
   * @route PUT /api/hotels/:id
   * @access Private
   */
  updateHotel = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const { id } = req.params;
    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return next(new AppError('Hotel not found', 404, 'HOTEL_NOT_FOUND'));
    }

    if (hotel.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('website', 'name slug');

    successResponse(res, { hotel: updatedHotel }, 'Hotel updated successfully');
  });

  /**
   * Delete hotel
   * @route DELETE /api/hotels/:id
   * @access Private
   */
  deleteHotel = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return next(new AppError('Hotel not found', 404, 'HOTEL_NOT_FOUND'));
    }

    if (hotel.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    // Check for existing bookings
    const activeBookings = await HotelBooking.countDocuments({
      hotel: id,
      status: { $in: ['confirmed', 'checked-in'] }
    });

    if (activeBookings > 0) {
      return next(new AppError('Cannot delete hotel with active bookings', 400, 'ACTIVE_BOOKINGS_EXIST'));
    }

    await Hotel.findByIdAndDelete(id);
    successResponse(res, null, 'Hotel deleted successfully');
  });

  /**
   * Search hotels
   * @route GET /api/hotels/search
   * @access Public
   */
  searchHotels = asyncHandler(async (req, res, next) => {
    const {
      location,
      checkIn,
      checkOut,
      guests,
      starRating,
      priceMin,
      priceMax,
      amenities
    } = req.query;

    const filters = { website: req.website._id };
    
    if (location) {
      filters.$or = [
        { 'location.address.city': { $regex: location, $options: 'i' } },
        { 'location.address.state': { $regex: location, $options: 'i' } },
        { name: { $regex: location, $options: 'i' } }
      ];
    }

    if (starRating) filters.starRating = { $gte: parseInt(starRating) };
    if (priceMin || priceMax) {
      filters['priceRange.min'] = {};
      if (priceMin) filters['priceRange.min'].$gte = parseFloat(priceMin);
      if (priceMax) filters['priceRange.max'] = { $lte: parseFloat(priceMax) };
    }

    if (amenities) {
      const amenityList = amenities.split(',');
      filters['amenities.name'] = { $in: amenityList };
    }

    const hotels = await Hotel.searchHotels(filters);
    
    // If dates and guests provided, filter by availability
    if (checkIn && checkOut && guests) {
      const availableHotels = [];
      for (const hotel of hotels) {
        const available = await hotel.checkAvailability(
          new Date(checkIn),
          new Date(checkOut),
          parseInt(guests)
        );
        if (available) {
          availableHotels.push(hotel);
        }
      }
      return successResponse(res, { hotels: availableHotels }, 'Available hotels found');
    }

    successResponse(res, { hotels }, 'Hotels found');
  });

  /**
   * Get hotel analytics
   * @route GET /api/hotels/:id/analytics
   * @access Private
   */
  getHotelAnalytics = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return next(new AppError('Hotel not found', 404, 'HOTEL_NOT_FOUND'));
    }

    if (hotel.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    // Get booking statistics
    const totalBookings = await HotelBooking.countDocuments({ hotel: id });
    const completedBookings = await HotelBooking.countDocuments({ 
      hotel: id, 
      status: 'checked-out' 
    });
    
    const revenueData = await HotelBooking.aggregate([
      { $match: { hotel: hotel._id, status: 'checked-out' } },
      { $group: { _id: null, totalRevenue: { $sum: '$pricing.total' } } }
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // Get room occupancy
    const totalRooms = await Room.countDocuments({ hotel: id, isActive: true });
    const occupiedRooms = await Room.countDocuments({ 
      hotel: id, 
      status: 'occupied',
      isActive: true 
    });

    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    const analytics = {
      totalBookings,
      completedBookings,
      totalRevenue,
      totalRooms,
      occupiedRooms,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      averageRating: hotel.stats.averageRating,
      totalReviews: hotel.stats.totalReviews
    };

    successResponse(res, { analytics }, 'Hotel analytics retrieved successfully');
  });

  /**
   * Add hotel amenity
   * @route POST /api/hotels/:id/amenities
   * @access Private
   */
  addAmenity = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { name, description, icon, category } = req.body;

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return next(new AppError('Hotel not found', 404, 'HOTEL_NOT_FOUND'));
    }

    if (hotel.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await hotel.addAmenity({ name, description, icon, category });
    successResponse(res, { hotel }, 'Amenity added successfully');
  });

  /**
   * Remove hotel amenity
   * @route DELETE /api/hotels/:id/amenities/:amenityId
   * @access Private
   */
  removeAmenity = asyncHandler(async (req, res, next) => {
    const { id, amenityId } = req.params;

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return next(new AppError('Hotel not found', 404, 'HOTEL_NOT_FOUND'));
    }

    if (hotel.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await hotel.removeAmenity(amenityId);
    successResponse(res, { hotel }, 'Amenity removed successfully');
  });

  /**
   * Get nearby hotels
   * @route GET /api/hotels/nearby
   * @access Public
   */
  getNearbyHotels = asyncHandler(async (req, res, next) => {
    const { latitude, longitude, maxDistance = 10000 } = req.query;

    if (!latitude || !longitude) {
      return next(new AppError('Latitude and longitude are required', 400, 'COORDINATES_REQUIRED'));
    }

    const hotels = await Hotel.findNearby(
      parseFloat(latitude),
      parseFloat(longitude),
      parseInt(maxDistance)
    );

    successResponse(res, { hotels }, 'Nearby hotels found');
  });
}

module.exports = new HotelController();

