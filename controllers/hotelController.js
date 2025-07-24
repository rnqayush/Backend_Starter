import Hotel from '../models/Hotel.js';
import Vendor from '../models/Vendor.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { getPagination } from '../utils/pagination.js';

// @desc    Create new hotel
// @route   POST /api/hotel
// @access  Private (Vendor)
export const createHotel = asyncHandler(async (req, res) => {
  // Get vendor profile
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'hotel' });
  
  if (!vendor) {
    return res.status(403).json(
      formatResponse(false, 'Only hotel vendors can create hotel listings', null)
    );
  }

  if (vendor.status !== 'approved') {
    return res.status(403).json(
      formatResponse(false, 'Vendor must be approved to create listings', null)
    );
  }

  const hotel = await Hotel.create({
    ...req.body,
    vendorId: vendor._id,
  });

  await hotel.populate('vendorId');

  res.status(201).json(
    formatResponse(true, 'Hotel created successfully', hotel)
  );
});

// @desc    Get all hotels with filters
// @route   GET /api/hotel
// @access  Public
export const getAllHotels = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    city,
    state,
    country,
    starRating,
    minPrice,
    maxPrice,
    amenities,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  // Build filter
  const filter = { 'availability.isActive': true };
  
  if (city) filter['address.city'] = new RegExp(city, 'i');
  if (state) filter['address.state'] = new RegExp(state, 'i');
  if (country) filter['address.country'] = new RegExp(country, 'i');
  if (starRating) filter.starRating = parseInt(starRating);
  
  if (minPrice || maxPrice) {
    filter['pricing.basePrice'] = {};
    if (minPrice) filter['pricing.basePrice'].$gte = parseFloat(minPrice);
    if (maxPrice) filter['pricing.basePrice'].$lte = parseFloat(maxPrice);
  }

  if (amenities) {
    const amenitiesList = amenities.split(',');
    filter.amenities = { $in: amenitiesList };
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'address.city': { $regex: search, $options: 'i' } },
    ];
  }

  const { skip, limit: pageLimit } = getPagination(page, limit);

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const hotels = await Hotel.find(filter)
    .populate('vendorId', 'businessName contactInfo rating')
    .sort(sort)
    .skip(skip)
    .limit(pageLimit);

  const total = await Hotel.countDocuments(filter);

  res.status(200).json(
    formatResponse(true, 'Hotels retrieved successfully', {
      hotels,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / pageLimit),
        totalItems: total,
        itemsPerPage: pageLimit,
      },
    })
  );
});

// @desc    Get hotel by ID
// @route   GET /api/hotel/:id
// @access  Public
export const getHotelById = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id)
    .populate('vendorId', 'businessName contactInfo rating user')
    .populate('rooms');

  if (!hotel) {
    return res.status(404).json(
      formatResponse(false, 'Hotel not found', null)
    );
  }

  res.status(200).json(
    formatResponse(true, 'Hotel retrieved successfully', hotel)
  );
});

// @desc    Update hotel
// @route   PUT /api/hotel/:id
// @access  Private (Vendor - Owner only)
export const updateHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return res.status(404).json(
      formatResponse(false, 'Hotel not found', null)
    );
  }

  // Check if user owns this hotel
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor || hotel.vendorId.toString() !== vendor._id.toString()) {
    return res.status(403).json(
      formatResponse(false, 'Not authorized to update this hotel', null)
    );
  }

  const updatedHotel = await Hotel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('vendorId');

  res.status(200).json(
    formatResponse(true, 'Hotel updated successfully', updatedHotel)
  );
});

// @desc    Delete hotel
// @route   DELETE /api/hotel/:id
// @access  Private (Vendor - Owner only)
export const deleteHotel = asyncHandler(async (req, res) => {
  const hotel = await Hotel.findById(req.params.id);

  if (!hotel) {
    return res.status(404).json(
      formatResponse(false, 'Hotel not found', null)
    );
  }

  // Check if user owns this hotel
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor || hotel.vendorId.toString() !== vendor._id.toString()) {
    return res.status(403).json(
      formatResponse(false, 'Not authorized to delete this hotel', null)
    );
  }

  await hotel.softDelete();

  res.status(200).json(
    formatResponse(true, 'Hotel deleted successfully', null)
  );
});

// @desc    Get vendor's hotels
// @route   GET /api/hotel/vendor/my-hotels
// @access  Private (Vendor)
export const getVendorHotels = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Vendor profile not found', null)
    );
  }

  const { page = 1, limit = 10 } = req.query;
  const { skip, limit: pageLimit } = getPagination(page, limit);

  const hotels = await Hotel.find({ vendorId: vendor._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageLimit);

  const total = await Hotel.countDocuments({ vendorId: vendor._id });

  res.status(200).json(
    formatResponse(true, 'Vendor hotels retrieved successfully', {
      hotels,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / pageLimit),
        totalItems: total,
        itemsPerPage: pageLimit,
      },
    })
  );
});

// @desc    Get hotel statistics for vendor
// @route   GET /api/hotel/vendor/stats
// @access  Private (Vendor)
export const getHotelStats = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Vendor profile not found', null)
    );
  }

  const totalHotels = await Hotel.countDocuments({ vendorId: vendor._id });
  const activeHotels = await Hotel.countDocuments({ 
    vendorId: vendor._id, 
    'availability.isActive': true 
  });

  const avgRating = await Hotel.aggregate([
    { $match: { vendorId: vendor._id } },
    { $group: { _id: null, avgRating: { $avg: '$rating.average' } } }
  ]);

  const stats = {
    totalHotels,
    activeHotels,
    inactiveHotels: totalHotels - activeHotels,
    averageRating: avgRating.length > 0 ? avgRating[0].avgRating : 0,
  };

  res.status(200).json(
    formatResponse(true, 'Hotel statistics retrieved successfully', stats)
  );
});

