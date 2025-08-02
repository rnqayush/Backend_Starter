/**
 * Booking Controller - Handle booking operations for all service types
 */

import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';
import Vendor from '../models/Vendor.js';
import { catchAsync } from '../middleware/error.middleware.js';
import { AppError } from '../middleware/error.middleware.js';
import { BOOKING_STATUS, BUSINESS_CATEGORIES, RESPONSE_MESSAGES, PAGINATION } from '../config/constants.js';

// Create a new booking
export const createBooking = catchAsync(async (req, res, next) => {
  const {
    vendor,
    category,
    hotel,
    hotelName,
    room,
    roomId,
    roomName,
    roomType,
    checkIn,
    checkOut,
    guests,
    guestInfo,
    additionalGuests,
    basePrice,
    taxes,
    serviceCharges,
    discountAmount,
    totalPrice,
    payment,
    specialRequests,
    // Wedding-specific
    weddingService,
    serviceType,
    eventDate,
    eventLocation,
    // Business service-specific
    businessService,
    appointmentDate,
    appointmentTime
  } = req.body;

  // Verify vendor exists
  const vendorDoc = await Vendor.findById(vendor);
  if (!vendorDoc) {
    return next(new AppError('Vendor not found', 404, 'VENDOR_NOT_FOUND'));
  }

  // Create booking data
  const bookingData = {
    user: req.user._id,
    vendor,
    category,
    guestInfo,
    basePrice,
    taxes: taxes || 0,
    serviceCharges: serviceCharges || 0,
    discountAmount: discountAmount || 0,
    totalPrice,
    payment,
    specialRequests,
    additionalGuests: additionalGuests || []
  };

  // Add category-specific fields
  if (category === BUSINESS_CATEGORIES.HOTEL) {
    bookingData.hotel = hotel;
    bookingData.hotelName = hotelName;
    bookingData.room = room;
    bookingData.roomId = roomId;
    bookingData.roomName = roomName;
    bookingData.roomType = roomType;
    bookingData.checkIn = checkIn;
    bookingData.checkOut = checkOut;
    bookingData.guests = guests;
  } else if (category === BUSINESS_CATEGORIES.WEDDING) {
    bookingData.weddingService = weddingService;
    bookingData.serviceType = serviceType;
    bookingData.eventDate = eventDate;
    bookingData.eventLocation = eventLocation;
  } else if (category === BUSINESS_CATEGORIES.BUSINESS) {
    bookingData.businessService = businessService;
    bookingData.appointmentDate = appointmentDate;
    bookingData.appointmentTime = appointmentTime;
  }

  // Create booking
  const booking = await Booking.create(bookingData);

  // Update hotel analytics if hotel booking
  if (category === BUSINESS_CATEGORIES.HOTEL && hotel) {
    await Hotel.findByIdAndUpdate(hotel, {
      $inc: { 'analytics.totalBookings': 1 }
    });
  }

  // Update vendor analytics
  await Vendor.findByIdAndUpdate(vendor, {
    $inc: { 'analytics.totalBookings': 1 }
  });

  res.status(201).json({
    status: 'success',
    statusCode: 201,
    message: RESPONSE_MESSAGES.CREATED,
    data: {
      booking
    }
  });
});

// Get all bookings with filtering
export const getAllBookings = catchAsync(async (req, res, next) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    status,
    category,
    vendor,
    user,
    startDate,
    endDate,
    sortBy = 'bookingDate',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};

  if (status) query.status = status;
  if (category) query.category = category;
  if (vendor) query.vendor = vendor;
  if (user) query.user = user;

  // Date range filter
  if (startDate || endDate) {
    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);
    
    query.$or = [
      { checkIn: dateQuery },
      { checkOut: dateQuery },
      { eventDate: dateQuery },
      { appointmentDate: dateQuery },
      { bookingDate: dateQuery }
    ];
  }

  // Restrict access based on user role
  if (req.user.role === 'customer') {
    query.user = req.user._id;
  } else if (req.user.role === 'vendor') {
    const userVendor = await Vendor.findOne({ owner: req.user._id });
    if (userVendor) {
      query.vendor = userVendor._id;
    }
  }

  // Pagination and sorting
  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const bookings = await Booking.find(query)
    .populate('user', 'name email')
    .populate('vendor', 'name slug category')
    .populate('hotel', 'name location')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(query);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Get booking by ID
export const getBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const booking = await Booking.findById(id)
    .populate('user', 'name email phone')
    .populate('vendor', 'name slug category address phone email')
    .populate('hotel', 'name location address phone email')
    .populate('confirmedBy', 'name email');

  if (!booking) {
    return next(new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND'));
  }

  // Check access permissions
  const hasAccess = 
    req.user.role === 'admin' ||
    req.user.role === 'super_admin' ||
    booking.user._id.toString() === req.user._id.toString();

  if (!hasAccess) {
    // Check if user is the vendor owner
    const vendor = await Vendor.findById(booking.vendor._id);
    if (!vendor || vendor.owner.toString() !== req.user._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }
  }

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      booking
    }
  });
});

// Update booking
export const updateBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  // Find booking
  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND'));
  }

  // Check permissions
  const isOwner = booking.user.toString() === req.user._id.toString();
  const isVendor = await Vendor.findOne({ 
    _id: booking.vendor, 
    owner: req.user._id 
  });
  const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

  if (!isOwner && !isVendor && !isAdmin) {
    return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
  }

  // Prevent updating certain fields
  delete updates.user;
  delete updates.vendor;
  delete updates.bookingId;
  delete updates.createdAt;
  delete updates.updatedAt;

  // Customers can only update limited fields
  if (isOwner && !isVendor && !isAdmin) {
    const allowedFields = ['guestInfo', 'additionalGuests', 'specialRequests'];
    const filteredUpdates = {};
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });
    Object.assign(updates, filteredUpdates);
  }

  // Update booking
  const updatedBooking = await Booking.findByIdAndUpdate(
    id,
    updates,
    { new: true, runValidators: true }
  ).populate('user', 'name email')
   .populate('vendor', 'name slug')
   .populate('hotel', 'name location');

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.UPDATED,
    data: {
      booking: updatedBooking
    }
  });
});

// Cancel booking
export const cancelBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { reason } = req.body;

  // Find booking
  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND'));
  }

  // Check permissions
  const isOwner = booking.user.toString() === req.user._id.toString();
  const isVendor = await Vendor.findOne({ 
    _id: booking.vendor, 
    owner: req.user._id 
  });
  const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

  if (!isOwner && !isVendor && !isAdmin) {
    return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
  }

  // Check if booking can be cancelled
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    return next(new AppError('Booking is already cancelled', 400, 'ALREADY_CANCELLED'));
  }

  if (booking.status === BOOKING_STATUS.COMPLETED) {
    return next(new AppError('Cannot cancel completed booking', 400, 'CANNOT_CANCEL_COMPLETED'));
  }

  // Determine who is cancelling
  let cancelledBy = 'customer';
  if (isVendor) cancelledBy = 'vendor';
  if (isAdmin) cancelledBy = 'admin';

  // Cancel booking
  await booking.cancel(reason, cancelledBy);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: 'Booking cancelled successfully',
    data: {
      booking
    }
  });
});

// Confirm booking (vendor only)
export const confirmBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find booking
  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND'));
  }

  // Check if user is the vendor
  const vendor = await Vendor.findOne({ 
    _id: booking.vendor, 
    owner: req.user._id 
  });

  if (!vendor && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
  }

  // Check if booking can be confirmed
  if (booking.status !== BOOKING_STATUS.PENDING) {
    return next(new AppError('Only pending bookings can be confirmed', 400, 'INVALID_STATUS'));
  }

  // Confirm booking
  await booking.confirm(req.user._id);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: 'Booking confirmed successfully',
    data: {
      booking
    }
  });
});

// Check-in booking (vendor only)
export const checkInBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { actualGuests } = req.body;

  // Find booking
  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND'));
  }

  // Check if user is the vendor
  const vendor = await Vendor.findOne({ 
    _id: booking.vendor, 
    owner: req.user._id 
  });

  if (!vendor && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
  }

  // Check if booking can be checked in
  if (booking.status !== BOOKING_STATUS.CONFIRMED) {
    return next(new AppError('Only confirmed bookings can be checked in', 400, 'INVALID_STATUS'));
  }

  // Check-in booking
  await booking.checkIn(actualGuests);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: 'Check-in completed successfully',
    data: {
      booking
    }
  });
});

// Check-out booking (vendor only)
export const checkOutBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find booking
  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND'));
  }

  // Check if user is the vendor
  const vendor = await Vendor.findOne({ 
    _id: booking.vendor, 
    owner: req.user._id 
  });

  if (!vendor && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
  }

  // Check if booking can be checked out
  if (!booking.checkedInAt) {
    return next(new AppError('Booking must be checked in first', 400, 'NOT_CHECKED_IN'));
  }

  // Check-out booking
  await booking.checkOut();

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: 'Check-out completed successfully',
    data: {
      booking
    }
  });
});

// Get user bookings
export const getUserBookings = catchAsync(async (req, res, next) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    status,
    category,
    sortBy = 'bookingDate',
    sortOrder = 'desc'
  } = req.query;

  const query = { user: req.user._id };

  if (status) query.status = status;
  if (category) query.category = category;

  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const bookings = await Booking.find(query)
    .populate('vendor', 'name slug category')
    .populate('hotel', 'name location')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(query);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Get vendor bookings
export const getVendorBookings = catchAsync(async (req, res, next) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    status,
    startDate,
    endDate,
    sortBy = 'bookingDate',
    sortOrder = 'desc'
  } = req.query;

  // Find vendor
  const vendor = await Vendor.findOne({ owner: req.user._id });
  if (!vendor) {
    return next(new AppError('Vendor profile not found', 404, 'VENDOR_NOT_FOUND'));
  }

  const query = { vendor: vendor._id };

  if (status) query.status = status;

  // Date range filter
  if (startDate || endDate) {
    const dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate);
    if (endDate) dateQuery.$lte = new Date(endDate);
    
    query.$or = [
      { checkIn: dateQuery },
      { eventDate: dateQuery },
      { appointmentDate: dateQuery },
      { bookingDate: dateQuery }
    ];
  }

  const skip = (page - 1) * limit;
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const bookings = await Booking.find(query)
    .populate('user', 'name email phone')
    .populate('hotel', 'name location')
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Booking.countDocuments(query);

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: RESPONSE_MESSAGES.SUCCESS,
    data: {
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Add review to booking
export const addReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  // Find booking
  const booking = await Booking.findById(id);
  if (!booking) {
    return next(new AppError('Booking not found', 404, 'BOOKING_NOT_FOUND'));
  }

  // Check if user owns the booking
  if (booking.user.toString() !== req.user._id.toString()) {
    return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
  }

  // Check if booking is completed
  if (booking.status !== BOOKING_STATUS.COMPLETED) {
    return next(new AppError('Can only review completed bookings', 400, 'BOOKING_NOT_COMPLETED'));
  }

  // Check if already reviewed
  if (booking.review && booking.review.rating) {
    return next(new AppError('Booking already reviewed', 400, 'ALREADY_REVIEWED'));
  }

  // Add review
  await booking.addReview(rating, comment);

  // Update vendor rating
  const vendor = await Vendor.findById(booking.vendor);
  if (vendor) {
    await vendor.updateRating(rating);
  }

  // Update hotel rating if applicable
  if (booking.hotel) {
    const hotel = await Hotel.findById(booking.hotel);
    if (hotel) {
      await hotel.updateRating(rating);
    }
  }

  res.status(200).json({
    status: 'success',
    statusCode: 200,
    message: 'Review added successfully',
    data: {
      booking
    }
  });
});

export default {
  createBooking,
  getAllBookings,
  getBooking,
  updateBooking,
  cancelBooking,
  confirmBooking,
  checkInBooking,
  checkOutBooking,
  getUserBookings,
  getVendorBookings,
  addReview
};
