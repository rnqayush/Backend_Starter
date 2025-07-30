const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const BaseController = require('./BaseController');
const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');

class HotelController extends BaseController {
  constructor() {
    super(Hotel, 'Hotel');
    this.searchFields = ['name', 'description', 'location.address', 'location.city'];
    this.populateFields = ['business'];
  }

  /**
   * Get hotels with availability check
   */
  getAvailableHotels = asyncHandler(async (req, res) => {
    const { checkIn, checkOut, guests, city, category, minPrice, maxPrice } = req.query;

    let query = { isActive: true };

    // Location filter
    if (city) {
      query['location.city'] = { $regex: city, $options: 'i' };
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) query['pricing.basePrice'].$gte = parseFloat(minPrice);
      if (maxPrice) query['pricing.basePrice'].$lte = parseFloat(maxPrice);
    }

    let hotels = await Hotel.find(query)
      .populate('business', 'name slug contact')
      .sort({ 'rating.average': -1 });

    // If check-in and check-out dates provided, filter by availability
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (checkInDate >= checkOutDate) {
        throw new BadRequestError('Check-out date must be after check-in date');
      }

      // Filter hotels with available rooms
      const availableHotels = [];
      
      for (const hotel of hotels) {
        const availableRooms = await this.checkRoomAvailability(
          hotel._id,
          checkInDate,
          checkOutDate,
          parseInt(guests) || 1
        );
        
        if (availableRooms.length > 0) {
          hotel._doc.availableRooms = availableRooms;
          availableHotels.push(hotel);
        }
      }

      hotels = availableHotels;
    }

    return ResponseHandler.success(
      res,
      hotels,
      'Available hotels retrieved successfully'
    );
  });

  /**
   * Get hotel details with room availability
   */
  getHotelWithRooms = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { checkIn, checkOut, guests } = req.query;

    const hotel = await Hotel.findById(id)
      .populate('business', 'name slug contact socialMedia businessHours');

    if (!hotel) {
      throw new NotFoundError('Hotel not found');
    }

    // If dates provided, check room availability
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      const availableRooms = await this.checkRoomAvailability(
        hotel._id,
        checkInDate,
        checkOutDate,
        parseInt(guests) || 1
      );

      hotel._doc.availableRooms = availableRooms;
    }

    return ResponseHandler.success(res, hotel, 'Hotel details retrieved successfully');
  });

  /**
   * Check room availability for given dates
   */
  checkRoomAvailability = async (hotelId, checkIn, checkOut, guests) => {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return [];

    const availableRooms = [];

    for (const room of hotel.rooms) {
      if (room.capacity >= guests && room.isActive) {
        // Check if room is available for the given dates
        const conflictingBookings = await Booking.find({
          hotel: hotelId,
          'roomDetails.roomId': room._id,
          status: { $in: ['confirmed', 'checked-in'] },
          $or: [
            {
              'dates.checkIn': { $lt: checkOut },
              'dates.checkOut': { $gt: checkIn }
            }
          ]
        });

        const bookedQuantity = conflictingBookings.reduce((sum, booking) => {
          const roomBooking = booking.roomDetails.find(r => r.roomId.toString() === room._id.toString());
          return sum + (roomBooking ? roomBooking.quantity : 0);
        }, 0);

        const availableQuantity = room.quantity - bookedQuantity;

        if (availableQuantity > 0) {
          availableRooms.push({
            ...room.toObject(),
            availableQuantity,
            totalPrice: this.calculateRoomPrice(room, checkIn, checkOut)
          });
        }
      }
    }

    return availableRooms;
  };

  /**
   * Calculate room price for given dates
   */
  calculateRoomPrice = (room, checkIn, checkOut) => {
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    let totalPrice = room.price * nights;

    // Apply seasonal pricing if available
    if (room.seasonalPricing && room.seasonalPricing.length > 0) {
      // Implementation for seasonal pricing logic
      // This would check if the dates fall within any seasonal pricing periods
    }

    return totalPrice;
  };

  /**
   * Get hotel analytics
   */
  getHotelAnalytics = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      throw new NotFoundError('Hotel not found');
    }

    // Check ownership
    await this.checkOwnership(hotel, req.user);

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get booking statistics
    const bookingStats = await Booking.aggregate([
      {
        $match: {
          hotel: hotel._id,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          averageBookingValue: { $avg: '$totalAmount' },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get occupancy rate
    const totalRooms = hotel.rooms.reduce((sum, room) => sum + room.quantity, 0);
    const totalNights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const totalRoomNights = totalRooms * totalNights;

    const occupiedRoomNights = await Booking.aggregate([
      {
        $match: {
          hotel: hotel._id,
          status: { $in: ['confirmed', 'checked-in', 'checked-out'] },
          'dates.checkIn': { $gte: start },
          'dates.checkOut': { $lte: end }
        }
      },
      {
        $project: {
          nights: {
            $divide: [
              { $subtract: ['$dates.checkOut', '$dates.checkIn'] },
              1000 * 60 * 60 * 24
            ]
          },
          roomsBooked: { $size: '$roomDetails' }
        }
      },
      {
        $group: {
          _id: null,
          totalOccupiedNights: { $sum: { $multiply: ['$nights', '$roomsBooked'] } }
        }
      }
    ]);

    const occupancyRate = totalRoomNights > 0 
      ? ((occupiedRoomNights[0]?.totalOccupiedNights || 0) / totalRoomNights) * 100 
      : 0;

    const analytics = {
      bookingStats: bookingStats[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        averageBookingValue: 0,
        confirmedBookings: 0,
        cancelledBookings: 0
      },
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      totalRooms,
      period: { start, end }
    };

    return ResponseHandler.success(res, analytics, 'Hotel analytics retrieved successfully');
  });

  /**
   * Update hotel room
   */
  updateRoom = asyncHandler(async (req, res) => {
    const { id, roomId } = req.params;

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      throw new NotFoundError('Hotel not found');
    }

    await this.checkOwnership(hotel, req.user);

    const roomIndex = hotel.rooms.findIndex(room => room._id.toString() === roomId);
    if (roomIndex === -1) {
      throw new NotFoundError('Room not found');
    }

    // Update room details
    Object.assign(hotel.rooms[roomIndex], req.body);
    await hotel.save();

    return ResponseHandler.updated(res, hotel.rooms[roomIndex], 'Room updated successfully');
  });

  /**
   * Add new room to hotel
   */
  addRoom = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      throw new NotFoundError('Hotel not found');
    }

    await this.checkOwnership(hotel, req.user);

    hotel.rooms.push(req.body);
    await hotel.save();

    const newRoom = hotel.rooms[hotel.rooms.length - 1];
    return ResponseHandler.created(res, newRoom, 'Room added successfully');
  });

  /**
   * Delete room from hotel
   */
  deleteRoom = asyncHandler(async (req, res) => {
    const { id, roomId } = req.params;

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      throw new NotFoundError('Hotel not found');
    }

    await this.checkOwnership(hotel, req.user);

    const roomIndex = hotel.rooms.findIndex(room => room._id.toString() === roomId);
    if (roomIndex === -1) {
      throw new NotFoundError('Room not found');
    }

    // Check if room has active bookings
    const activeBookings = await Booking.find({
      hotel: id,
      'roomDetails.roomId': roomId,
      status: { $in: ['confirmed', 'checked-in'] },
      'dates.checkOut': { $gte: new Date() }
    });

    if (activeBookings.length > 0) {
      throw new BadRequestError('Cannot delete room with active bookings');
    }

    hotel.rooms.splice(roomIndex, 1);
    await hotel.save();

    return ResponseHandler.deleted(res, 'Room deleted successfully');
  });
}

module.exports = new HotelController();

