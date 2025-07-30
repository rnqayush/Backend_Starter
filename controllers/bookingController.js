const Booking = require('../models/Booking');
const Hotel = require('../models/Hotel');
const WeddingVendor = require('../models/WeddingVendor');
const BaseController = require('./BaseController');
const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const { NotFoundError, BadRequestError, ConflictError } = require('../utils/customErrors');

class BookingController extends BaseController {
  constructor() {
    super(Booking, 'Booking');
    this.populateFields = ['business', 'customer', 'hotel'];
  }

  /**
   * Create hotel booking
   */
  createHotelBooking = asyncHandler(async (req, res) => {
    const {
      hotelId,
      roomDetails,
      dates,
      guestDetails,
      specialRequests
    } = req.body;

    // Validate hotel exists
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new NotFoundError('Hotel not found');
    }

    // Validate dates
    const checkIn = new Date(dates.checkIn);
    const checkOut = new Date(dates.checkOut);
    
    if (checkIn >= checkOut) {
      throw new BadRequestError('Check-out date must be after check-in date');
    }

    if (checkIn < new Date()) {
      throw new BadRequestError('Check-in date cannot be in the past');
    }

    // Check room availability
    let totalAmount = 0;
    const validatedRoomDetails = [];

    for (const roomBooking of roomDetails) {
      const room = hotel.rooms.find(r => r._id.toString() === roomBooking.roomId);
      if (!room) {
        throw new NotFoundError(`Room ${roomBooking.roomId} not found`);
      }

      // Check availability
      const conflictingBookings = await Booking.find({
        hotel: hotelId,
        'roomDetails.roomId': roomBooking.roomId,
        status: { $in: ['confirmed', 'checked-in'] },
        $or: [
          {
            'dates.checkIn': { $lt: checkOut },
            'dates.checkOut': { $gt: checkIn }
          }
        ]
      });

      const bookedQuantity = conflictingBookings.reduce((sum, booking) => {
        const roomBookingDetail = booking.roomDetails.find(r => 
          r.roomId.toString() === roomBooking.roomId
        );
        return sum + (roomBookingDetail ? roomBookingDetail.quantity : 0);
      }, 0);

      const availableQuantity = room.quantity - bookedQuantity;

      if (availableQuantity < roomBooking.quantity) {
        throw new ConflictError(`Only ${availableQuantity} rooms available for ${room.type}`);
      }

      // Calculate price
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const roomTotal = room.price * roomBooking.quantity * nights;
      totalAmount += roomTotal;

      validatedRoomDetails.push({
        roomId: roomBooking.roomId,
        roomType: room.type,
        quantity: roomBooking.quantity,
        pricePerNight: room.price,
        totalPrice: roomTotal
      });
    }

    // Create booking
    const booking = await Booking.create({
      bookingType: 'hotel',
      business: hotel.business,
      customer: req.user.id,
      hotel: hotelId,
      roomDetails: validatedRoomDetails,
      dates: { checkIn, checkOut },
      guestDetails,
      specialRequests,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await booking.populate(['business', 'customer', 'hotel']);

    return ResponseHandler.created(res, booking, 'Hotel booking created successfully');
  });

  /**
   * Create wedding service booking
   */
  createWeddingBooking = asyncHandler(async (req, res) => {
    const {
      vendorId,
      serviceId,
      eventDate,
      eventDetails,
      packageDetails
    } = req.body;

    // Validate vendor exists
    const vendor = await WeddingVendor.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError('Wedding vendor not found');
    }

    // Validate service
    const service = vendor.services.find(s => s._id.toString() === serviceId);
    if (!service) {
      throw new NotFoundError('Service not found');
    }

    // Check availability for the date
    const eventDateTime = new Date(eventDate);
    if (eventDateTime < new Date()) {
      throw new BadRequestError('Event date cannot be in the past');
    }

    const conflictingBookings = await Booking.find({
      weddingVendor: vendorId,
      'eventDetails.eventDate': eventDateTime,
      status: { $in: ['confirmed', 'in-progress'] }
    });

    if (conflictingBookings.length > 0) {
      throw new ConflictError('Vendor is not available on the selected date');
    }

    // Calculate total amount
    let totalAmount = service.basePrice;
    if (packageDetails && packageDetails.addOns) {
      for (const addOn of packageDetails.addOns) {
        const serviceAddOn = service.addOns.find(a => a._id.toString() === addOn.id);
        if (serviceAddOn) {
          totalAmount += serviceAddOn.price * (addOn.quantity || 1);
        }
      }
    }

    // Create booking
    const booking = await Booking.create({
      bookingType: 'wedding',
      business: vendor.business,
      customer: req.user.id,
      weddingVendor: vendorId,
      serviceDetails: {
        serviceId,
        serviceName: service.name,
        basePrice: service.basePrice
      },
      eventDetails: {
        eventDate: eventDateTime,
        ...eventDetails
      },
      packageDetails,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await booking.populate(['business', 'customer', 'weddingVendor']);

    return ResponseHandler.created(res, booking, 'Wedding booking created successfully');
  });

  /**
   * Get user bookings with filters
   */
  getUserBookings = asyncHandler(async (req, res) => {
    const {
      status,
      bookingType,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    let query = { customer: req.user.id };

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (bookingType) {
      query.bookingType = bookingType;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await Booking.countDocuments(query);
    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .populate('business', 'name slug')
      .populate('hotel', 'name location')
      .populate('weddingVendor', 'businessName services')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    return ResponseHandler.paginated(res, bookings, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }, 'User bookings retrieved successfully');
  });

  /**
   * Get business bookings (for business owners)
   */
  getBusinessBookings = asyncHandler(async (req, res) => {
    const { businessId } = req.params;
    const {
      status,
      bookingType,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    // Check if user has access to this business
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (!req.user.businesses || !req.user.businesses.includes(businessId)) {
        throw new ForbiddenError('Access denied to this business');
      }
    }

    let query = { business: businessId };

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (bookingType) {
      query.bookingType = bookingType;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await Booking.countDocuments(query);
    const skip = (page - 1) * limit;

    const bookings = await Booking.find(query)
      .populate('customer', 'name email phone')
      .populate('hotel', 'name')
      .populate('weddingVendor', 'businessName')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    return ResponseHandler.paginated(res, bookings, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }, 'Business bookings retrieved successfully');
  });

  /**
   * Update booking status
   */
  updateBookingStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, notes } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check if user can update this booking
    const canUpdate = req.user.role === 'admin' || 
                     req.user.role === 'super_admin' ||
                     (req.user.businesses && req.user.businesses.includes(booking.business.toString())) ||
                     booking.customer.toString() === req.user.id;

    if (!canUpdate) {
      throw new ForbiddenError('Access denied to update this booking');
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['checked-in', 'cancelled', 'no-show'],
      'checked-in': ['checked-out', 'cancelled'],
      'checked-out': [],
      'cancelled': [],
      'no-show': []
    };

    if (!validTransitions[booking.status].includes(status)) {
      throw new BadRequestError(`Cannot change status from ${booking.status} to ${status}`);
    }

    // Update booking
    booking.status = status;
    if (notes) {
      booking.notes = booking.notes || [];
      booking.notes.push({
        text: notes,
        addedBy: req.user.id,
        addedAt: new Date()
      });
    }

    // Update timestamps based on status
    if (status === 'confirmed') {
      booking.confirmedAt = new Date();
    } else if (status === 'checked-in') {
      booking.checkedInAt = new Date();
    } else if (status === 'checked-out') {
      booking.checkedOutAt = new Date();
    } else if (status === 'cancelled') {
      booking.cancelledAt = new Date();
    }

    await booking.save();

    return ResponseHandler.updated(res, booking, 'Booking status updated successfully');
  });

  /**
   * Cancel booking
   */
  cancelBooking = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check if user can cancel this booking
    const canCancel = booking.customer.toString() === req.user.id ||
                     req.user.role === 'admin' ||
                     req.user.role === 'super_admin' ||
                     (req.user.businesses && req.user.businesses.includes(booking.business.toString()));

    if (!canCancel) {
      throw new ForbiddenError('Access denied to cancel this booking');
    }

    // Check if booking can be cancelled
    if (!['pending', 'confirmed'].includes(booking.status)) {
      throw new BadRequestError('Booking cannot be cancelled in current status');
    }

    // Calculate cancellation policy (if applicable)
    let refundAmount = 0;
    if (booking.bookingType === 'hotel') {
      const checkInDate = new Date(booking.dates.checkIn);
      const now = new Date();
      const daysUntilCheckIn = Math.ceil((checkInDate - now) / (1000 * 60 * 60 * 24));

      // Simple cancellation policy - can be made more sophisticated
      if (daysUntilCheckIn >= 7) {
        refundAmount = booking.totalAmount * 0.9; // 90% refund
      } else if (daysUntilCheckIn >= 3) {
        refundAmount = booking.totalAmount * 0.5; // 50% refund
      }
      // No refund for cancellations within 3 days
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = reason;
    booking.refundAmount = refundAmount;

    await booking.save();

    return ResponseHandler.updated(res, booking, 'Booking cancelled successfully');
  });

  /**
   * Get booking analytics
   */
  getBookingAnalytics = asyncHandler(async (req, res) => {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;

    // Check access
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (!req.user.businesses || !req.user.businesses.includes(businessId)) {
        throw new ForbiddenError('Access denied to this business');
      }
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const analytics = await Booking.aggregate([
      {
        $match: {
          business: businessId,
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
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'checked-out'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get booking trends by day
    const dailyTrends = await Booking.aggregate([
      {
        $match: {
          business: businessId,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    const result = {
      summary: analytics[0] || {
        totalBookings: 0,
        totalRevenue: 0,
        averageBookingValue: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        completedBookings: 0
      },
      dailyTrends,
      period: { start, end }
    };

    return ResponseHandler.success(res, result, 'Booking analytics retrieved successfully');
  });
}

module.exports = new BookingController();

