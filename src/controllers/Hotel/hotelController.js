const mongoose = require('mongoose');
const Hotel = require('../../models/Hotel');
const Room = require('../../models/Room');
const Booking = require('../../models/Booking');
const { successResponse, errorResponse } = require('../../utils/responseHelper');

class HotelController {
  // Get all hotels with filtering and pagination
  async getAllHotels(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        location,
        minPrice,
        maxPrice,
        rating,
        amenities,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
      } = req.query;

      // Build filter query
      const filter = { isActive: true };

      if (location) {
        filter['location.city'] = new RegExp(location, 'i');
      }

      if (search) {
        filter.$or = [
          { name: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { 'location.city': new RegExp(search, 'i') },
          { 'location.state': new RegExp(search, 'i') },
        ];
      }

      if (rating) {
        filter['stats.averageRating'] = { $gte: parseFloat(rating) };
      }

      if (amenities) {
        const amenityList = amenities.split(',');
        amenityList.forEach(amenity => {
          filter[`amenities.${amenity}`] = true;
        });
      }

      // Price filtering (based on minimum room price)
      let priceFilter = {};
      if (minPrice || maxPrice) {
        if (minPrice) priceFilter.$gte = parseFloat(minPrice);
        if (maxPrice) priceFilter.$lte = parseFloat(maxPrice);
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      let query = Hotel.find(filter)
        .populate('ownerId', 'name email phone')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      // Add price filtering if specified
      if (minPrice || maxPrice) {
        query = query.populate({
          path: 'rooms',
          match: { basePrice: priceFilter, isActive: true },
          select: 'basePrice roomType',
        });
      }

      const hotels = await query;
      const total = await Hotel.countDocuments(filter);

      // Filter hotels that have rooms in price range if price filter is applied
      let filteredHotels = hotels;
      if (minPrice || maxPrice) {
        filteredHotels = hotels.filter(hotel => hotel.rooms && hotel.rooms.length > 0);
      }

      return successResponse(res, 'Hotels retrieved successfully', {
        hotels: filteredHotels,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error('Get hotels error:', error);
      return errorResponse(res, 'Failed to retrieve hotels', 500);
    }
  }

  // Get single hotel by ID
  async getHotelById(req, res) {
    try {
      const { id } = req.params;

      const hotel = await Hotel.findById(id)
        .populate('ownerId', 'name email phone avatar')
        .populate({
          path: 'rooms',
          match: { isActive: true },
          options: { sort: { roomNumber: 1 } },
        });

      if (!hotel) {
        return errorResponse(res, 'Hotel not found', 404);
      }

      // Get hotel statistics
      const stats = await this.getHotelStats(id);

      return successResponse(res, 'Hotel retrieved successfully', {
        hotel: {
          ...hotel.toObject(),
          stats,
        },
      });
    } catch (error) {
      console.error('Get hotel error:', error);
      return errorResponse(res, 'Failed to retrieve hotel', 500);
    }
  }

  // Create new hotel (hotel owner only)
  async createHotel(req, res) {
    try {
      const hotelData = {
        ...req.body,
        ownerId: req.user.id,
      };

      // Generate slug from name
      hotelData.slug = this.generateSlug(hotelData.name);

      const hotel = new Hotel(hotelData);
      await hotel.save();

      return successResponse(res, 'Hotel created successfully', { hotel }, 201);
    } catch (error) {
      console.error('Create hotel error:', error);
      if (error.code === 11000) {
        return errorResponse(res, 'Hotel with this name or slug already exists', 400);
      }
      return errorResponse(res, error.message || 'Failed to create hotel', 500);
    }
  }

  // Update hotel (hotel owner only)
  async updateHotel(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if hotel exists and user owns it
      const hotel = await Hotel.findById(id);
      if (!hotel) {
        return errorResponse(res, 'Hotel not found', 404);
      }

      if (hotel.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, 'Access denied. You can only update your own hotels', 403);
      }

      // Update slug if name is changed
      if (updateData.name && updateData.name !== hotel.name) {
        updateData.slug = this.generateSlug(updateData.name);
      }

      updateData.lastModified = new Date();

      const updatedHotel = await Hotel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('ownerId', 'name email phone');

      return successResponse(res, 'Hotel updated successfully', { hotel: updatedHotel });
    } catch (error) {
      console.error('Update hotel error:', error);
      return errorResponse(res, error.message || 'Failed to update hotel', 500);
    }
  }

  // Delete hotel (hotel owner only)
  async deleteHotel(req, res) {
    try {
      const { id } = req.params;

      // Check if hotel exists and user owns it
      const hotel = await Hotel.findById(id);
      if (!hotel) {
        return errorResponse(res, 'Hotel not found', 404);
      }

      if (hotel.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, 'Access denied. You can only delete your own hotels', 403);
      }

      // Check for active bookings
      const activeBookings = await Booking.countDocuments({
        hotelId: id,
        status: { $in: ['confirmed', 'checked_in'] },
      });

      if (activeBookings > 0) {
        return errorResponse(res, 'Cannot delete hotel with active bookings', 400);
      }

      // Soft delete - mark as inactive instead of removing
      hotel.isActive = false;
      hotel.deletedAt = new Date();
      await hotel.save();

      return successResponse(res, 'Hotel deleted successfully');
    } catch (error) {
      console.error('Delete hotel error:', error);
      return errorResponse(res, 'Failed to delete hotel', 500);
    }
  }

  // Get hotels by owner (hotel owner dashboard)
  async getMyHotels(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filter = { ownerId: req.user.id };
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const hotels = await Hotel.find(filter)
        .populate({
          path: 'rooms',
          match: { isActive: true },
          select: 'roomType basePrice isAvailable',
        })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Hotel.countDocuments(filter);

      // Add statistics for each hotel
      const hotelsWithStats = await Promise.all(
        hotels.map(async (hotel) => {
          const stats = await this.getHotelStats(hotel._id);
          return {
            ...hotel.toObject(),
            stats,
          };
        })
      );

      return successResponse(res, 'Your hotels retrieved successfully', {
        hotels: hotelsWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error('Get my hotels error:', error);
      return errorResponse(res, 'Failed to retrieve your hotels', 500);
    }
  }

  // Search hotels with availability
  async searchHotels(req, res) {
    try {
      const {
        location,
        checkIn,
        checkOut,
        guests = 1,
        rooms = 1,
        minPrice,
        maxPrice,
        amenities,
        rating,
        page = 1,
        limit = 10,
      } = req.query;

      if (!location || !checkIn || !checkOut) {
        return errorResponse(res, 'Location, check-in, and check-out dates are required', 400);
      }

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (checkInDate >= checkOutDate) {
        return errorResponse(res, 'Check-out date must be after check-in date', 400);
      }

      // Build hotel filter
      const hotelFilter = {
        isActive: true,
        'location.city': new RegExp(location, 'i'),
      };

      if (rating) {
        hotelFilter['stats.averageRating'] = { $gte: parseFloat(rating) };
      }

      if (amenities) {
        const amenityList = amenities.split(',');
        amenityList.forEach(amenity => {
          hotelFilter[`amenities.${amenity}`] = true;
        });
      }

      // Find available rooms
      const availableRooms = await Room.findAvailableRooms(
        null, // hotelId - we'll filter by hotel later
        checkInDate,
        checkOutDate,
        parseInt(guests)
      );

      // Get unique hotel IDs from available rooms
      const availableHotelIds = [...new Set(availableRooms.map(room => room.hotelId.toString()))];

      // Filter hotels that have available rooms
      hotelFilter._id = { $in: availableHotelIds };

      // Apply price filter to rooms
      let roomPriceFilter = {};
      if (minPrice || maxPrice) {
        if (minPrice) roomPriceFilter.$gte = parseFloat(minPrice);
        if (maxPrice) roomPriceFilter.$lte = parseFloat(maxPrice);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const hotels = await Hotel.find(hotelFilter)
        .populate('ownerId', 'name email')
        .skip(skip)
        .limit(parseInt(limit));

      // Add available rooms to each hotel
      const hotelsWithRooms = hotels.map(hotel => {
        const hotelRooms = availableRooms.filter(room => 
          room.hotelId.toString() === hotel._id.toString()
        );

        // Apply price filter to rooms
        let filteredRooms = hotelRooms;
        if (minPrice || maxPrice) {
          filteredRooms = hotelRooms.filter(room => {
            const price = room.getPriceForDates(checkInDate, checkOutDate);
            if (minPrice && price < parseFloat(minPrice)) return false;
            if (maxPrice && price > parseFloat(maxPrice)) return false;
            return true;
          });
        }

        // Calculate price range for available rooms
        const prices = filteredRooms.map(room => room.getPriceForDates(checkInDate, checkOutDate));
        const minRoomPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxRoomPrice = prices.length > 0 ? Math.max(...prices) : 0;

        return {
          ...hotel.toObject(),
          availableRooms: filteredRooms.slice(0, parseInt(rooms)), // Limit rooms shown
          totalAvailableRooms: filteredRooms.length,
          priceRange: {
            min: minRoomPrice,
            max: maxRoomPrice,
            currency: filteredRooms[0]?.currency || 'USD',
          },
        };
      });

      // Filter out hotels with no available rooms in price range
      const finalHotels = hotelsWithRooms.filter(hotel => hotel.availableRooms.length > 0);

      const total = finalHotels.length;

      return successResponse(res, 'Hotels search completed', {
        hotels: finalHotels,
        searchParams: {
          location,
          checkIn,
          checkOut,
          guests: parseInt(guests),
          rooms: parseInt(rooms),
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      console.error('Search hotels error:', error);
      return errorResponse(res, 'Failed to search hotels', 500);
    }
  }

  // Get hotel dashboard statistics
  async getHotelDashboard(req, res) {
    try {
      const { id } = req.params;

      // Check if hotel exists and user owns it
      const hotel = await Hotel.findById(id);
      if (!hotel) {
        return errorResponse(res, 'Hotel not found', 404);
      }

      if (hotel.ownerId.toString() !== req.user.id && req.user.role !== 'admin') {
        return errorResponse(res, 'Access denied', 403);
      }

      // Get comprehensive statistics
      const stats = await this.getDetailedHotelStats(id);

      return successResponse(res, 'Hotel dashboard data retrieved successfully', {
        hotel: hotel.toObject(),
        ...stats,
      });
    } catch (error) {
      console.error('Get hotel dashboard error:', error);
      return errorResponse(res, 'Failed to retrieve dashboard data', 500);
    }
  }

  // Helper methods
  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  async getHotelStats(hotelId) {
    const [bookingStats, roomStats] = await Promise.all([
      Booking.aggregate([
        { $match: { hotelId: mongoose.Types.ObjectId(hotelId) } },
        {
          $group: {
            _id: null,
            totalBookings: { $sum: 1 },
            totalRevenue: { $sum: '$pricing.totalAmount' },
            averageBookingValue: { $avg: '$pricing.totalAmount' },
            confirmedBookings: {
              $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
            },
          }
        }
      ]),
      Room.aggregate([
        { $match: { hotelId: mongoose.Types.ObjectId(hotelId), isActive: true } },
        {
          $group: {
            _id: null,
            totalRooms: { $sum: 1 },
            availableRooms: {
              $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] }
            },
            averagePrice: { $avg: '$basePrice' },
          }
        }
      ])
    ]);

    return {
      bookings: bookingStats[0] || { totalBookings: 0, totalRevenue: 0, averageBookingValue: 0, confirmedBookings: 0 },
      rooms: roomStats[0] || { totalRooms: 0, availableRooms: 0, averagePrice: 0 },
    };
  }

  async getDetailedHotelStats(hotelId) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      recentBookings,
      monthlyRevenue,
      roomOccupancy,
      upcomingCheckIns,
      recentReviews
    ] = await Promise.all([
      Booking.find({ hotelId, createdAt: { $gte: thirtyDaysAgo } })
        .populate('userId', 'name email')
        .populate('roomId', 'roomNumber roomType')
        .sort({ createdAt: -1 })
        .limit(10),
      
      Booking.aggregate([
        {
          $match: {
            hotelId: mongoose.Types.ObjectId(hotelId),
            createdAt: { $gte: thirtyDaysAgo },
            status: { $in: ['confirmed', 'checked_in', 'checked_out'] }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$pricing.totalAmount' },
            bookings: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      Room.aggregate([
        { $match: { hotelId: mongoose.Types.ObjectId(hotelId) } },
        {
          $group: {
            _id: '$roomType',
            totalRooms: { $sum: 1 },
            availableRooms: {
              $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] }
            },
            averagePrice: { $avg: '$basePrice' }
          }
        }
      ]),

      Booking.find({
        hotelId,
        checkInDate: { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
        status: 'confirmed'
      })
        .populate('userId', 'name email phone')
        .populate('roomId', 'roomNumber roomType')
        .sort({ checkInDate: 1 })
        .limit(10),

      Booking.find({
        hotelId,
        'review.rating': { $exists: true },
        'review.reviewDate': { $gte: thirtyDaysAgo }
      })
        .populate('userId', 'name avatar')
        .sort({ 'review.reviewDate': -1 })
        .limit(5)
    ]);

    return {
      recentBookings,
      monthlyRevenue,
      roomOccupancy,
      upcomingCheckIns,
      recentReviews,
    };
  }
}

module.exports = new HotelController();
