// Placeholder vendor controller
// This will be implemented when vendor functionality is added

const { asyncHandler } = require('../middleware/error.middleware');
const { HTTP_STATUS } = require('../config/constants');

/**
 * @desc    Get all approved vendors
 * @route   GET /api/vendors
 * @access  Public
 */
const getAllVendors = asyncHandler(async (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Vendor functionality coming soon',
    data: []
  });
});

/**
 * @desc    Register as vendor
 * @route   POST /api/vendors/register
 * @access  Private
 */
const registerAsVendor = asyncHandler(async (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Vendor registration functionality coming soon'
  });
});

/**
 * @desc    Get vendor profile
 * @route   GET /api/vendors/profile
 * @access  Private/Vendor
 */
const getVendorProfile = asyncHandler(async (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Vendor profile functionality coming soon'
  });
});

/**
 * @desc    Update vendor profile
 * @route   PUT /api/vendors/profile
 * @access  Private/Vendor
 */
const updateVendorProfile = asyncHandler(async (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Vendor profile update functionality coming soon'
  });
});

module.exports = {
  getAllVendors,
  registerAsVendor,
  getVendorProfile,
  updateVendorProfile
};
