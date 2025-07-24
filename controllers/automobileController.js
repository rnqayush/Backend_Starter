import Automobile from '../models/Automobile.js';
import Vendor from '../models/Vendor.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { getPagination } from '../utils/pagination.js';

// @desc    Create new vehicle listing
// @route   POST /api/automobile
// @access  Private (Vendor)
export const createVehicle = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'automobile' });
  
  if (!vendor || vendor.status !== 'approved') {
    return res.status(403).json(
      formatResponse(false, 'Only approved automobile vendors can create listings', null)
    );
  }

  const vehicle = await Automobile.create({
    ...req.body,
    vendorId: vendor._id,
  });

  res.status(201).json(
    formatResponse(true, 'Vehicle listing created successfully', vehicle)
  );
});

// @desc    Get all vehicles
// @route   GET /api/automobile
// @access  Public
export const getAllVehicles = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    type,
    listingType,
    make,
    model,
    minYear,
    maxYear,
    minPrice,
    maxPrice,
    condition,
    city,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const filter = { status: 'active', 'availability.isAvailable': true };
  
  if (type) filter.type = type;
  if (listingType) filter.listingType = listingType;
  if (make) filter.make = new RegExp(make, 'i');
  if (model) filter.model = new RegExp(model, 'i');
  if (condition) filter.condition = condition;
  if (city) filter['location.city'] = new RegExp(city, 'i');
  
  if (minYear || maxYear) {
    filter.year = {};
    if (minYear) filter.year.$gte = parseInt(minYear);
    if (maxYear) filter.year.$lte = parseInt(maxYear);
  }
  
  if (minPrice || maxPrice) {
    filter['pricing.basePrice'] = {};
    if (minPrice) filter['pricing.basePrice'].$gte = parseFloat(minPrice);
    if (maxPrice) filter['pricing.basePrice'].$lte = parseFloat(maxPrice);
  }

  if (search) {
    filter.$or = [
      { make: { $regex: search, $options: 'i' } },
      { model: { $regex: search, $options: 'i' } },
      { 'location.city': { $regex: search, $options: 'i' } },
    ];
  }

  const { skip, limit: pageLimit } = getPagination(page, limit);
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const vehicles = await Automobile.find(filter)
    .populate('vendorId', 'businessName contactInfo rating')
    .sort(sort)
    .skip(skip)
    .limit(pageLimit);

  const total = await Automobile.countDocuments(filter);

  res.status(200).json(
    formatResponse(true, 'Vehicles retrieved successfully', {
      vehicles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / pageLimit),
        totalItems: total,
        itemsPerPage: pageLimit,
      },
    })
  );
});

// @desc    Get vehicle by ID
// @route   GET /api/automobile/:id
// @access  Public
export const getVehicleById = asyncHandler(async (req, res) => {
  const vehicle = await Automobile.findById(req.params.id)
    .populate('vendorId', 'businessName contactInfo rating');

  if (!vehicle) {
    return res.status(404).json(
      formatResponse(false, 'Vehicle not found', null)
    );
  }

  // Increment views
  await vehicle.incrementViews();

  res.status(200).json(
    formatResponse(true, 'Vehicle retrieved successfully', vehicle)
  );
});

// @desc    Update vehicle
// @route   PUT /api/automobile/:id
// @access  Private (Vendor - Owner only)
export const updateVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Automobile.findById(req.params.id);
  if (!vehicle) {
    return res.status(404).json(
      formatResponse(false, 'Vehicle not found', null)
    );
  }

  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor || vehicle.vendorId.toString() !== vendor._id.toString()) {
    return res.status(403).json(
      formatResponse(false, 'Not authorized to update this vehicle', null)
    );
  }

  const updatedVehicle = await Automobile.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(
    formatResponse(true, 'Vehicle updated successfully', updatedVehicle)
  );
});

// @desc    Delete vehicle
// @route   DELETE /api/automobile/:id
// @access  Private (Vendor - Owner only)
export const deleteVehicle = asyncHandler(async (req, res) => {
  const vehicle = await Automobile.findById(req.params.id);
  if (!vehicle) {
    return res.status(404).json(
      formatResponse(false, 'Vehicle not found', null)
    );
  }

  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor || vehicle.vendorId.toString() !== vendor._id.toString()) {
    return res.status(403).json(
      formatResponse(false, 'Not authorized to delete this vehicle', null)
    );
  }

  await vehicle.softDelete();

  res.status(200).json(
    formatResponse(true, 'Vehicle deleted successfully', null)
  );
});

// @desc    Get vendor's vehicles
// @route   GET /api/automobile/vendor/my-vehicles
// @access  Private (Vendor)
export const getVendorVehicles = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Vendor profile not found', null)
    );
  }

  const { page = 1, limit = 10 } = req.query;
  const { skip, limit: pageLimit } = getPagination(page, limit);

  const vehicles = await Automobile.find({ vendorId: vendor._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageLimit);

  const total = await Automobile.countDocuments({ vendorId: vendor._id });

  res.status(200).json(
    formatResponse(true, 'Vendor vehicles retrieved successfully', {
      vehicles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / pageLimit),
        totalItems: total,
        itemsPerPage: pageLimit,
      },
    })
  );
});

