import Ecommerce from '../models/Ecommerce.js';
import Vendor from '../models/Vendor.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { formatResponse } from '../utils/responseFormatter.js';
import { getPagination } from '../utils/pagination.js';

// @desc    Create new product
// @route   POST /api/ecommerce
// @access  Private (Vendor)
export const createProduct = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id, category: 'ecommerce' });
  
  if (!vendor || vendor.status !== 'approved') {
    return res.status(403).json(
      formatResponse(false, 'Only approved ecommerce vendors can create products', null)
    );
  }

  const product = await Ecommerce.create({
    ...req.body,
    vendorId: vendor._id,
  });

  res.status(201).json(
    formatResponse(true, 'Product created successfully', product)
  );
});

// @desc    Get all products
// @route   GET /api/ecommerce
// @access  Public
export const getAllProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    category,
    minPrice,
    maxPrice,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = req.query;

  const filter = { status: 'active' };
  
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter['pricing.basePrice'] = {};
    if (minPrice) filter['pricing.basePrice'].$gte = parseFloat(minPrice);
    if (maxPrice) filter['pricing.basePrice'].$lte = parseFloat(maxPrice);
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } },
    ];
  }

  const { skip, limit: pageLimit } = getPagination(page, limit);
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const products = await Ecommerce.find(filter)
    .populate('vendorId', 'businessName rating')
    .sort(sort)
    .skip(skip)
    .limit(pageLimit);

  const total = await Ecommerce.countDocuments(filter);

  res.status(200).json(
    formatResponse(true, 'Products retrieved successfully', {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / pageLimit),
        totalItems: total,
        itemsPerPage: pageLimit,
      },
    })
  );
});

// @desc    Get product by ID
// @route   GET /api/ecommerce/:id
// @access  Public
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Ecommerce.findById(req.params.id)
    .populate('vendorId', 'businessName contactInfo rating');

  if (!product) {
    return res.status(404).json(
      formatResponse(false, 'Product not found', null)
    );
  }

  res.status(200).json(
    formatResponse(true, 'Product retrieved successfully', product)
  );
});

// @desc    Update product
// @route   PUT /api/ecommerce/:id
// @access  Private (Vendor - Owner only)
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Ecommerce.findById(req.params.id);
  if (!product) {
    return res.status(404).json(
      formatResponse(false, 'Product not found', null)
    );
  }

  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor || product.vendorId.toString() !== vendor._id.toString()) {
    return res.status(403).json(
      formatResponse(false, 'Not authorized to update this product', null)
    );
  }

  const updatedProduct = await Ecommerce.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json(
    formatResponse(true, 'Product updated successfully', updatedProduct)
  );
});

// @desc    Delete product
// @route   DELETE /api/ecommerce/:id
// @access  Private (Vendor - Owner only)
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Ecommerce.findById(req.params.id);
  if (!product) {
    return res.status(404).json(
      formatResponse(false, 'Product not found', null)
    );
  }

  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor || product.vendorId.toString() !== vendor._id.toString()) {
    return res.status(403).json(
      formatResponse(false, 'Not authorized to delete this product', null)
    );
  }

  await product.softDelete();

  res.status(200).json(
    formatResponse(true, 'Product deleted successfully', null)
  );
});

// @desc    Get vendor's products
// @route   GET /api/ecommerce/vendor/my-products
// @access  Private (Vendor)
export const getVendorProducts = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ userId: req.user.id });
  if (!vendor) {
    return res.status(404).json(
      formatResponse(false, 'Vendor profile not found', null)
    );
  }

  const { page = 1, limit = 10 } = req.query;
  const { skip, limit: pageLimit } = getPagination(page, limit);

  const products = await Ecommerce.find({ vendorId: vendor._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(pageLimit);

  const total = await Ecommerce.countDocuments({ vendorId: vendor._id });

  res.status(200).json(
    formatResponse(true, 'Vendor products retrieved successfully', {
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / pageLimit),
        totalItems: total,
        itemsPerPage: pageLimit,
      },
    })
  );
});

