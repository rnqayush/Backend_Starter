import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import Enquiry from '../../models/automobile/Enquiry.js';
import Vehicle from '../../models/automobile/Vehicle.js';
import { sendEmail } from '../../services/emailService.js';

// @desc    Create new enquiry
// @route   POST /api/automobiles/enquiries
// @access  Private (Customer)
export const createEnquiry = asyncHandler(async (req, res, next) => {
  const {
    vehicleId,
    enquiryType,
    message,
    requirements,
    customerInfo
  } = req.body;

  // Validate vehicle exists
  const vehicle = await Vehicle.findById(vehicleId).populate('dealer');
  if (!vehicle) {
    return sendError(res, 'Vehicle not found', 404);
  }

  // Create enquiry
  const enquiry = await Enquiry.create({
    customer: req.user.id,
    vehicle: vehicleId,
    dealer: vehicle.dealer._id,
    enquiryType,
    message,
    requirements,
    customerInfo: {
      name: customerInfo?.name || req.user.name,
      email: customerInfo?.email || req.user.email,
      phone: customerInfo?.phone || req.user.phone,
      city: customerInfo?.city,
      state: customerInfo?.state
    },
    source: 'website'
  });

  // Update vehicle analytics
  vehicle.analytics.enquiries += 1;
  await vehicle.save();

  // Send notification email to dealer
  try {
    await sendEmail({
      email: vehicle.dealer.email,
      subject: `New Enquiry for ${vehicle.fullName}`,
      message: `You have received a new enquiry for ${vehicle.fullName} from ${enquiry.customerInfo.name}. 
                Enquiry Type: ${enquiryType}
                Message: ${message}
                Customer Phone: ${enquiry.customerInfo.phone}
                
                Please log in to your dashboard to respond.`
    });
  } catch (error) {
    console.error('Failed to send enquiry notification email:', error);
  }

  const populatedEnquiry = await Enquiry.findById(enquiry._id)
    .populate('vehicle', 'make model year price images')
    .populate('dealer', 'name businessInfo');

  sendSuccess(res, {
    enquiry: populatedEnquiry
  }, 'Enquiry submitted successfully', 201);
});

// @desc    Get enquiries (for dealers)
// @route   GET /api/automobiles/enquiries
// @access  Private (Dealer)
export const getEnquiries = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query = {};

  // Filter based on user role
  if (req.user.role === 'vendor' && req.user.businessType === 'automobile') {
    query.dealer = req.user.id;
  } else if (req.user.role === 'customer') {
    query.customer = req.user.id;
  } else if (req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to view enquiries', 403);
  }

  // Apply filters
  if (req.query.status) query.status = req.query.status;
  if (req.query.priority) query.priority = req.query.priority;
  if (req.query.enquiryType) query.enquiryType = req.query.enquiryType;
  if (req.query.vehicleId) query.vehicle = req.query.vehicleId;

  // Date range filter
  if (req.query.dateFrom || req.query.dateTo) {
    query.createdAt = {};
    if (req.query.dateFrom) query.createdAt.$gte = new Date(req.query.dateFrom);
    if (req.query.dateTo) query.createdAt.$lte = new Date(req.query.dateTo);
  }

  const enquiries = await Enquiry.find(query)
    .populate('vehicle', 'make model year price images')
    .populate('customer', 'name email phone')
    .populate('dealer', 'name businessInfo')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Enquiry.countDocuments(query);

  // Get statistics for dealer dashboard
  let statistics = null;
  if (req.user.role === 'vendor') {
    const stats = await Enquiry.getStatistics(req.user.id);
    statistics = stats[0] || {};
  }

  sendSuccess(res, {
    enquiries,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    statistics
  }, 'Enquiries retrieved successfully');
});

// @desc    Get single enquiry
// @route   GET /api/automobiles/enquiries/:id
// @access  Private
export const getEnquiry = asyncHandler(async (req, res, next) => {
  const enquiry = await Enquiry.findById(req.params.id)
    .populate('vehicle', 'make model year price images specifications features')
    .populate('customer', 'name email phone address')
    .populate('dealer', 'name businessInfo')
    .populate('communications.createdBy', 'name')
    .populate('followUp.assignedTo', 'name');

  if (!enquiry) {
    return sendError(res, 'Enquiry not found', 404);
  }

  // Check authorization
  const canAccess = 
    enquiry.customer.toString() === req.user.id ||
    enquiry.dealer.toString() === req.user.id ||
    req.user.role === 'admin';

  if (!canAccess) {
    return sendError(res, 'Not authorized to view this enquiry', 403);
  }

  sendSuccess(res, {
    enquiry
  }, 'Enquiry retrieved successfully');
});

// @desc    Update enquiry status
// @route   PUT /api/automobiles/enquiries/:id
// @access  Private (Dealer)
export const updateEnquiry = asyncHandler(async (req, res, next) => {
  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    return sendError(res, 'Enquiry not found', 404);
  }

  // Check if user is the dealer or admin
  if (enquiry.dealer.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this enquiry', 403);
  }

  const {
    status,
    priority,
    followUp,
    quotation,
    finance,
    internalNotes
  } = req.body;

  // Update fields
  if (status && status !== enquiry.status) {
    await enquiry.updateStatus(status, req.body.statusReason);
  }

  if (priority) enquiry.priority = priority;
  if (followUp) enquiry.followUp = { ...enquiry.followUp, ...followUp };
  if (quotation) enquiry.quotation = { ...enquiry.quotation, ...quotation };
  if (finance) enquiry.finance = { ...enquiry.finance, ...finance };

  if (internalNotes) {
    enquiry.internalNotes.push({
      note: internalNotes,
      createdBy: req.user.id
    });
  }

  await enquiry.save();

  const updatedEnquiry = await Enquiry.findById(req.params.id)
    .populate('vehicle', 'make model year price')
    .populate('customer', 'name email phone');

  sendSuccess(res, {
    enquiry: updatedEnquiry
  }, 'Enquiry updated successfully');
});

// @desc    Add communication to enquiry
// @route   POST /api/automobiles/enquiries/:id/respond
// @access  Private (Dealer)
export const addCommunication = asyncHandler(async (req, res, next) => {
  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    return sendError(res, 'Enquiry not found', 404);
  }

  // Check if user is the dealer or admin
  if (enquiry.dealer.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to respond to this enquiry', 403);
  }

  const {
    type,
    subject,
    message,
    duration,
    outcome,
    nextAction,
    nextActionDate
  } = req.body;

  const communication = {
    type,
    direction: 'outbound',
    subject,
    message,
    duration,
    outcome,
    nextAction,
    nextActionDate,
    createdBy: req.user.id
  };

  await enquiry.addCommunication(communication);

  // Calculate response time for first response
  if (enquiry.communications.length === 1) {
    await enquiry.calculateResponseTime();
  }

  // Send email to customer if it's an email communication
  if (type === 'email') {
    try {
      await sendEmail({
        email: enquiry.customerInfo.email,
        subject: subject || 'Response to your vehicle enquiry',
        message: message
      });
    } catch (error) {
      console.error('Failed to send response email:', error);
    }
  }

  const updatedEnquiry = await Enquiry.findById(req.params.id)
    .populate('communications.createdBy', 'name');

  sendSuccess(res, {
    enquiry: updatedEnquiry,
    communication: communication
  }, 'Response added successfully');
});

// @desc    Schedule test drive
// @route   POST /api/automobiles/enquiries/:id/schedule-test-drive
// @access  Private (Dealer)
export const scheduleTestDrive = asyncHandler(async (req, res, next) => {
  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    return sendError(res, 'Enquiry not found', 404);
  }

  // Check if user is the dealer or admin
  if (enquiry.dealer.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to schedule test drive for this enquiry', 403);
  }

  const { scheduledDate, notes } = req.body;

  if (!scheduledDate) {
    return sendError(res, 'Scheduled date is required', 400);
  }

  await enquiry.scheduleTestDrive(new Date(scheduledDate), notes);

  // Update vehicle analytics
  const vehicle = await Vehicle.findById(enquiry.vehicle);
  if (vehicle) {
    vehicle.analytics.testDrives += 1;
    await vehicle.save();
  }

  // Send confirmation email to customer
  try {
    await sendEmail({
      email: enquiry.customerInfo.email,
      subject: 'Test Drive Scheduled',
      message: `Your test drive has been scheduled for ${new Date(scheduledDate).toLocaleString()}. 
                ${notes ? 'Additional notes: ' + notes : ''}
                
                Please contact us if you need to reschedule.`
    });
  } catch (error) {
    console.error('Failed to send test drive confirmation email:', error);
  }

  sendSuccess(res, {
    enquiry: {
      id: enquiry._id,
      testDrive: enquiry.testDrive
    }
  }, 'Test drive scheduled successfully');
});

// @desc    Get overdue enquiries
// @route   GET /api/automobiles/enquiries/overdue
// @access  Private (Dealer)
export const getOverdueEnquiries = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'automobile') {
    return sendError(res, 'Only automobile dealers can view overdue enquiries', 403);
  }

  const overdueEnquiries = await Enquiry.getOverdue(req.user.id);

  sendSuccess(res, {
    enquiries: overdueEnquiries,
    count: overdueEnquiries.length
  }, 'Overdue enquiries retrieved successfully');
});

// @desc    Get enquiry statistics
// @route   GET /api/automobiles/enquiries/statistics
// @access  Private (Dealer)
export const getEnquiryStatistics = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'automobile') {
    return sendError(res, 'Only automobile dealers can view enquiry statistics', 403);
  }

  const { dateFrom, dateTo } = req.query;
  const dateRange = {};
  
  if (dateFrom) dateRange.start = dateFrom;
  if (dateTo) dateRange.end = dateTo;

  const statistics = await Enquiry.getStatistics(req.user.id, dateRange);

  // Get additional metrics
  const totalEnquiries = await Enquiry.countDocuments({ dealer: req.user.id });
  const todayEnquiries = await Enquiry.countDocuments({
    dealer: req.user.id,
    createdAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lt: new Date(new Date().setHours(23, 59, 59, 999))
    }
  });

  const weeklyEnquiries = await Enquiry.countDocuments({
    dealer: req.user.id,
    createdAt: {
      $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  });

  sendSuccess(res, {
    statistics: statistics[0] || {},
    summary: {
      total: totalEnquiries,
      today: todayEnquiries,
      thisWeek: weeklyEnquiries
    }
  }, 'Enquiry statistics retrieved successfully');
});

// @desc    Export enquiries
// @route   GET /api/automobiles/enquiries/export
// @access  Private (Dealer)
export const exportEnquiries = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'automobile') {
    return sendError(res, 'Only automobile dealers can export enquiries', 403);
  }

  const { format = 'json', dateFrom, dateTo } = req.query;

  let query = { dealer: req.user.id };

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const enquiries = await Enquiry.find(query)
    .populate('vehicle', 'make model year price')
    .populate('customer', 'name email phone')
    .select('-communications -internalNotes')
    .sort({ createdAt: -1 });

  if (format === 'csv') {
    // Convert to CSV format
    const csvData = enquiries.map(enquiry => ({
      'Enquiry ID': enquiry._id,
      'Date': enquiry.createdAt.toISOString().split('T')[0],
      'Customer Name': enquiry.customerInfo.name,
      'Customer Email': enquiry.customerInfo.email,
      'Customer Phone': enquiry.customerInfo.phone,
      'Vehicle': `${enquiry.vehicle.year} ${enquiry.vehicle.make} ${enquiry.vehicle.model}`,
      'Enquiry Type': enquiry.enquiryType,
      'Status': enquiry.status,
      'Priority': enquiry.priority,
      'Message': enquiry.message
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=enquiries.csv');
    
    // Simple CSV conversion (in production, use a proper CSV library)
    const csvHeaders = Object.keys(csvData[0] || {}).join(',');
    const csvRows = csvData.map(row => Object.values(row).join(','));
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    return res.send(csvContent);
  }

  sendSuccess(res, {
    enquiries,
    count: enquiries.length,
    exportDate: new Date().toISOString()
  }, 'Enquiries exported successfully');
});

