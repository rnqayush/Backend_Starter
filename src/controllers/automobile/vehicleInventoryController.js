import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import Vehicle from '../../models/automobile/Vehicle.js';
import mongoose from 'mongoose';

// @desc    Get vehicle inventory overview
// @route   GET /api/automobiles/inventory
// @access  Private (Dealer only)
export const getInventoryOverview = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'automobile') {
    return sendError(res, 'Only automobile dealers can access inventory', 403);
  }

  const dealerId = req.user.id;

  // Get inventory statistics
  const inventoryStats = await Vehicle.aggregate([
    { $match: { dealer: mongoose.Types.ObjectId(dealerId) } },
    {
      $group: {
        _id: null,
        totalVehicles: { $sum: 1 },
        availableVehicles: {
          $sum: { $cond: [{ $eq: ['$availability.status', 'available'] }, 1, 0] }
        },
        soldVehicles: {
          $sum: { $cond: [{ $eq: ['$availability.status', 'sold'] }, 1, 0] }
        },
        reservedVehicles: {
          $sum: { $cond: [{ $eq: ['$availability.status', 'reserved'] }, 1, 0] }
        },
        totalValue: { $sum: '$pricing.sellingPrice' },
        averagePrice: { $avg: '$pricing.sellingPrice' }
      }
    }
  ]);

  // Get inventory by category
  const categoryBreakdown = await Vehicle.aggregate([
    { $match: { dealer: mongoose.Types.ObjectId(dealerId) } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalValue: { $sum: '$pricing.sellingPrice' },
        averagePrice: { $avg: '$pricing.sellingPrice' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Get inventory by make
  const makeBreakdown = await Vehicle.aggregate([
    { $match: { dealer: mongoose.Types.ObjectId(dealerId) } },
    {
      $group: {
        _id: '$make',
        count: { $sum: 1 },
        models: { $addToSet: '$model' }
      }
    },
    { $sort: { count: -1 } }
  ]);

  // Get low stock alerts (vehicles that need attention)
  const lowStockAlerts = await Vehicle.find({
    dealer: dealerId,
    $or: [
      { 'availability.status': 'maintenance' },
      { 'documents.insurance.expiryDate': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
      { 'documents.registration.expiryDate': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } }
    ]
  }).select('make model year vin availability documents').limit(10);

  sendSuccess(res, {
    overview: inventoryStats[0] || {},
    breakdown: {
      byCategory: categoryBreakdown,
      byMake: makeBreakdown
    },
    alerts: lowStockAlerts
  }, 'Inventory overview retrieved successfully');
});

// @desc    Get inventory by filters
// @route   GET /api/automobiles/inventory/vehicles
// @access  Private (Dealer only)
export const getInventoryVehicles = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'automobile') {
    return sendError(res, 'Only automobile dealers can access inventory', 403);
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query = { dealer: req.user.id };

  // Apply filters
  if (req.query.status) query['availability.status'] = req.query.status;
  if (req.query.category) query.category = req.query.category;
  if (req.query.make) query.make = new RegExp(req.query.make, 'i');
  if (req.query.model) query.model = new RegExp(req.query.model, 'i');
  if (req.query.year) query.year = parseInt(req.query.year);
  if (req.query.minPrice) query['pricing.sellingPrice'] = { $gte: parseFloat(req.query.minPrice) };
  if (req.query.maxPrice) query['pricing.sellingPrice'] = { ...query['pricing.sellingPrice'], $lte: parseFloat(req.query.maxPrice) };

  // Search query
  if (req.query.search) {
    query.$or = [
      { make: new RegExp(req.query.search, 'i') },
      { model: new RegExp(req.query.search, 'i') },
      { vin: new RegExp(req.query.search, 'i') },
      { 'specifications.engine.type': new RegExp(req.query.search, 'i') }
    ];
  }

  const vehicles = await Vehicle.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-__v');

  const total = await Vehicle.countDocuments(query);

  sendSuccess(res, {
    vehicles,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    filters: req.query
  }, 'Inventory vehicles retrieved successfully');
});

// @desc    Update vehicle inventory status
// @route   PUT /api/automobiles/inventory/:id/status
// @access  Private (Dealer only)
export const updateInventoryStatus = asyncHandler(async (req, res, next) => {
  const vehicle = await Vehicle.findById(req.params.id);

  if (!vehicle) {
    return sendError(res, 'Vehicle not found', 404);
  }

  if (vehicle.dealer.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this vehicle', 403);
  }

  const { status, reason, soldPrice, soldDate, buyerInfo } = req.body;

  vehicle.availability.status = status;
  vehicle.availability.lastUpdated = new Date();

  if (reason) {
    vehicle.availability.notes = reason;
  }

  // Handle sold status
  if (status === 'sold') {
    if (soldPrice) vehicle.pricing.soldPrice = soldPrice;
    if (soldDate) vehicle.availability.soldDate = new Date(soldDate);
    if (buyerInfo) vehicle.availability.buyerInfo = buyerInfo;
    
    // Update analytics
    vehicle.analytics.sold = true;
    vehicle.analytics.soldDate = new Date(soldDate || Date.now());
  }

  // Handle reserved status
  if (status === 'reserved') {
    vehicle.availability.reservedUntil = req.body.reservedUntil ? new Date(req.body.reservedUntil) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  await vehicle.save();

  sendSuccess(res, {
    vehicle: {
      id: vehicle._id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      availability: vehicle.availability,
      pricing: vehicle.pricing
    }
  }, 'Vehicle inventory status updated successfully');
});

// @desc    Bulk update inventory status
// @route   PUT /api/automobiles/inventory/bulk-status
// @access  Private (Dealer only)
export const bulkUpdateInventoryStatus = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'automobile') {
    return sendError(res, 'Only automobile dealers can perform bulk updates', 403);
  }

  const { vehicleIds, status, reason } = req.body;

  if (!vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length === 0) {
    return sendError(res, 'Vehicle IDs array is required', 400);
  }

  // Verify all vehicles belong to the dealer
  const vehicles = await Vehicle.find({
    _id: { $in: vehicleIds },
    dealer: req.user.id
  });

  if (vehicles.length !== vehicleIds.length) {
    return sendError(res, 'Some vehicles not found or not owned by you', 403);
  }

  // Perform bulk update
  const updateData = {
    'availability.status': status,
    'availability.lastUpdated': new Date()
  };

  if (reason) {
    updateData['availability.notes'] = reason;
  }

  const result = await Vehicle.updateMany(
    { _id: { $in: vehicleIds }, dealer: req.user.id },
    updateData
  );

  sendSuccess(res, {
    modifiedCount: result.modifiedCount,
    matchedCount: result.matchedCount
  }, 'Bulk inventory status update completed successfully');
});

// @desc    Get inventory alerts
// @route   GET /api/automobiles/inventory/alerts
// @access  Private (Dealer only)
export const getInventoryAlerts = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'automobile') {
    return sendError(res, 'Only automobile dealers can view inventory alerts', 403);
  }

  const dealerId = req.user.id;
  const alerts = [];

  // Vehicles in maintenance
  const maintenanceVehicles = await Vehicle.find({
    dealer: dealerId,
    'availability.status': 'maintenance'
  }).select('make model year vin availability').limit(10);

  if (maintenanceVehicles.length > 0) {
    alerts.push({
      type: 'maintenance',
      priority: 'medium',
      count: maintenanceVehicles.length,
      message: `${maintenanceVehicles.length} vehicles are currently in maintenance`,
      vehicles: maintenanceVehicles
    });
  }

  // Expiring insurance
  const insuranceExpiring = await Vehicle.find({
    dealer: dealerId,
    'documents.insurance.expiryDate': {
      $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      $gte: new Date()
    }
  }).select('make model year vin documents.insurance').limit(10);

  if (insuranceExpiring.length > 0) {
    alerts.push({
      type: 'insurance_expiring',
      priority: 'high',
      count: insuranceExpiring.length,
      message: `${insuranceExpiring.length} vehicles have insurance expiring within 30 days`,
      vehicles: insuranceExpiring
    });
  }

  // Expiring registration
  const registrationExpiring = await Vehicle.find({
    dealer: dealerId,
    'documents.registration.expiryDate': {
      $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      $gte: new Date()
    }
  }).select('make model year vin documents.registration').limit(10);

  if (registrationExpiring.length > 0) {
    alerts.push({
      type: 'registration_expiring',
      priority: 'high',
      count: registrationExpiring.length,
      message: `${registrationExpiring.length} vehicles have registration expiring within 30 days`,
      vehicles: registrationExpiring
    });
  }

  // Long-standing inventory (over 90 days)
  const longStandingInventory = await Vehicle.find({
    dealer: dealerId,
    'availability.status': 'available',
    createdAt: { $lte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
  }).select('make model year vin createdAt pricing').limit(10);

  if (longStandingInventory.length > 0) {
    alerts.push({
      type: 'long_standing',
      priority: 'low',
      count: longStandingInventory.length,
      message: `${longStandingInventory.length} vehicles have been in inventory for over 90 days`,
      vehicles: longStandingInventory
    });
  }

  sendSuccess(res, {
    alerts,
    totalAlerts: alerts.reduce((sum, alert) => sum + alert.count, 0)
  }, 'Inventory alerts retrieved successfully');
});

// @desc    Export inventory data
// @route   GET /api/automobiles/inventory/export
// @access  Private (Dealer only)
export const exportInventory = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'automobile') {
    return sendError(res, 'Only automobile dealers can export inventory', 403);
  }

  const { format = 'json', status } = req.query;

  let query = { dealer: req.user.id };
  if (status) query['availability.status'] = status;

  const vehicles = await Vehicle.find(query)
    .select('make model year vin category pricing availability specifications features createdAt')
    .sort({ createdAt: -1 });

  if (format === 'csv') {
    // Convert to CSV format
    const csvData = vehicles.map(vehicle => ({
      'VIN': vehicle.vin,
      'Make': vehicle.make,
      'Model': vehicle.model,
      'Year': vehicle.year,
      'Category': vehicle.category,
      'Status': vehicle.availability.status,
      'Selling Price': vehicle.pricing.sellingPrice,
      'Purchase Price': vehicle.pricing.purchasePrice,
      'Engine Type': vehicle.specifications?.engine?.type,
      'Fuel Type': vehicle.specifications?.engine?.fuelType,
      'Transmission': vehicle.specifications?.transmission?.type,
      'Mileage': vehicle.specifications?.mileage?.value,
      'Added Date': vehicle.createdAt.toISOString().split('T')[0]
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory.csv');
    
    // Simple CSV conversion
    const csvHeaders = Object.keys(csvData[0] || {}).join(',');
    const csvRows = csvData.map(row => Object.values(row).join(','));
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    return res.send(csvContent);
  }

  sendSuccess(res, {
    vehicles,
    count: vehicles.length,
    exportDate: new Date().toISOString(),
    filters: { status }
  }, 'Inventory exported successfully');
});

// @desc    Get inventory value report
// @route   GET /api/automobiles/inventory/value-report
// @access  Private (Dealer only)
export const getInventoryValueReport = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'automobile') {
    return sendError(res, 'Only automobile dealers can view inventory value report', 403);
  }

  const dealerId = req.user.id;

  // Get value breakdown by status
  const valueByStatus = await Vehicle.aggregate([
    { $match: { dealer: mongoose.Types.ObjectId(dealerId) } },
    {
      $group: {
        _id: '$availability.status',
        count: { $sum: 1 },
        totalPurchaseValue: { $sum: '$pricing.purchasePrice' },
        totalSellingValue: { $sum: '$pricing.sellingPrice' },
        averagePurchasePrice: { $avg: '$pricing.purchasePrice' },
        averageSellingPrice: { $avg: '$pricing.sellingPrice' }
      }
    }
  ]);

  // Get value breakdown by category
  const valueByCategory = await Vehicle.aggregate([
    { $match: { dealer: mongoose.Types.ObjectId(dealerId) } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalPurchaseValue: { $sum: '$pricing.purchasePrice' },
        totalSellingValue: { $sum: '$pricing.sellingPrice' },
        potentialProfit: { $sum: { $subtract: ['$pricing.sellingPrice', '$pricing.purchasePrice'] } }
      }
    },
    { $sort: { totalSellingValue: -1 } }
  ]);

  // Get aging analysis
  const agingAnalysis = await Vehicle.aggregate([
    { $match: { dealer: mongoose.Types.ObjectId(dealerId), 'availability.status': 'available' } },
    {
      $addFields: {
        daysInInventory: {
          $divide: [
            { $subtract: [new Date(), '$createdAt'] },
            1000 * 60 * 60 * 24
          ]
        }
      }
    },
    {
      $bucket: {
        groupBy: '$daysInInventory',
        boundaries: [0, 30, 60, 90, 180, 365, Infinity],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          totalValue: { $sum: '$pricing.sellingPrice' },
          averageValue: { $avg: '$pricing.sellingPrice' }
        }
      }
    }
  ]);

  sendSuccess(res, {
    valueByStatus,
    valueByCategory,
    agingAnalysis,
    reportDate: new Date().toISOString()
  }, 'Inventory value report retrieved successfully');
});
