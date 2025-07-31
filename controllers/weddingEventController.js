const WeddingEvent = require('../models/WeddingEvent');
const WeddingVendor = require('../models/WeddingVendor');
const { asyncHandler, AppError, successResponse, paginatedResponse } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

/**
 * Wedding Event Controller
 * Handles wedding event management operations
 */
class WeddingEventController {
  /**
   * Create a new wedding event
   * @route POST /api/wedding-events
   * @access Private
   */
  createEvent = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const eventData = { ...req.body, website: req.website._id };
    const event = await WeddingEvent.create(eventData);
    await event.populate('website', 'name slug');

    successResponse(res, { event }, 'Wedding event created successfully', 201);
  });

  /**
   * Get all wedding events for a website
   * @route GET /api/wedding-events
   * @access Private
   */
  getEvents = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const upcoming = req.query.upcoming === 'true';
    const search = req.query.search;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const query = { website: req.website._id };
    
    if (status) query.status = status;
    if (upcoming) {
      query['eventDetails.weddingDate'] = { $gte: new Date() };
      query.status = { $in: ['planning', 'confirmed', 'in-progress'] };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'couple.bride.firstName': { $regex: search, $options: 'i' } },
        { 'couple.bride.lastName': { $regex: search, $options: 'i' } },
        { 'couple.groom.firstName': { $regex: search, $options: 'i' } },
        { 'couple.groom.lastName': { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      query['eventDetails.weddingDate'] = {};
      if (startDate) query['eventDetails.weddingDate'].$gte = new Date(startDate);
      if (endDate) query['eventDetails.weddingDate'].$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const events = await WeddingEvent.find(query)
      .populate(['website', 'vendors.vendor'])
      .sort({ 'eventDetails.weddingDate': 1 })
      .skip(skip)
      .limit(limit);

    const totalItems = await WeddingEvent.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const pagination = { page, limit, totalPages, totalItems };
    paginatedResponse(res, events, pagination, 'Wedding events retrieved successfully');
  });

  /**
   * Get wedding event by ID
   * @route GET /api/wedding-events/:id
   * @access Private
   */
  getEvent = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    
    const event = await WeddingEvent.findById(id)
      .populate(['website', 'vendors.vendor']);

    if (!event) {
      return next(new AppError('Wedding event not found', 404, 'EVENT_NOT_FOUND'));
    }

    if (event.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    successResponse(res, { event }, 'Wedding event retrieved successfully');
  });

  /**
   * Update wedding event
   * @route PUT /api/wedding-events/:id
   * @access Private
   */
  updateEvent = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const { id } = req.params;
    const event = await WeddingEvent.findById(id);

    if (!event) {
      return next(new AppError('Wedding event not found', 404, 'EVENT_NOT_FOUND'));
    }

    if (event.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    const updatedEvent = await WeddingEvent.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate(['website', 'vendors.vendor']);

    successResponse(res, { event: updatedEvent }, 'Wedding event updated successfully');
  });

  /**
   * Delete wedding event
   * @route DELETE /api/wedding-events/:id
   * @access Private
   */
  deleteEvent = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const event = await WeddingEvent.findById(id);

    if (!event) {
      return next(new AppError('Wedding event not found', 404, 'EVENT_NOT_FOUND'));
    }

    if (event.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await WeddingEvent.findByIdAndDelete(id);
    successResponse(res, null, 'Wedding event deleted successfully');
  });

  /**
   * Get upcoming events
   * @route GET /api/wedding-events/upcoming
   * @access Private
   */
  getUpcomingEvents = asyncHandler(async (req, res, next) => {
    const days = parseInt(req.query.days) || 30;
    
    const events = await WeddingEvent.findUpcomingEvents(req.website._id, days);
    successResponse(res, { events }, 'Upcoming events retrieved successfully');
  });

  /**
   * Get events by date range
   * @route GET /api/wedding-events/date-range
   * @access Private
   */
  getEventsByDateRange = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(new AppError('Start date and end date are required', 400, 'DATE_RANGE_REQUIRED'));
    }

    const events = await WeddingEvent.findByDateRange(
      req.website._id,
      new Date(startDate),
      new Date(endDate)
    );

    successResponse(res, { events }, 'Events by date range retrieved successfully');
  });

  /**
   * Add vendor to event
   * @route POST /api/wedding-events/:id/vendors
   * @access Private
   */
  addVendor = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { vendorId, category, services, cost } = req.body;

    const event = await WeddingEvent.findById(id);
    if (!event) {
      return next(new AppError('Wedding event not found', 404, 'EVENT_NOT_FOUND'));
    }

    if (event.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    // Verify vendor exists and belongs to the same website
    const vendor = await WeddingVendor.findById(vendorId);
    if (!vendor || vendor.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Vendor not found or access denied', 404, 'VENDOR_NOT_FOUND'));
    }

    await event.addVendor(vendorId, category, services, cost);
    await event.populate(['website', 'vendors.vendor']);

    successResponse(res, { event }, 'Vendor added to event successfully');
  });

  /**
   * Update vendor status in event
   * @route PATCH /api/wedding-events/:id/vendors/:vendorId
   * @access Private
   */
  updateVendorStatus = asyncHandler(async (req, res, next) => {
    const { id, vendorId } = req.params;
    const { status } = req.body;

    const validStatuses = ['inquired', 'quoted', 'booked', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid vendor status', 400, 'INVALID_STATUS'));
    }

    const event = await WeddingEvent.findById(id);
    if (!event) {
      return next(new AppError('Wedding event not found', 404, 'EVENT_NOT_FOUND'));
    }

    if (event.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await event.updateVendorStatus(vendorId, status);
    await event.populate(['website', 'vendors.vendor']);

    successResponse(res, { event }, 'Vendor status updated successfully');
  });

  /**
   * Add guest to event
   * @route POST /api/wedding-events/:id/guests
   * @access Private
   */
  addGuest = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const guestInfo = req.body;

    const event = await WeddingEvent.findById(id);
    if (!event) {
      return next(new AppError('Wedding event not found', 404, 'EVENT_NOT_FOUND'));
    }

    if (event.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await event.addGuest(guestInfo);
    successResponse(res, { event }, 'Guest added successfully');
  });

  /**
   * Update RSVP status
   * @route PATCH /api/wedding-events/:id/guests/:guestId/rsvp
   * @access Private
   */
  updateRSVP = asyncHandler(async (req, res, next) => {
    const { id, guestId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'attending', 'not-attending', 'maybe'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid RSVP status', 400, 'INVALID_RSVP_STATUS'));
    }

    const event = await WeddingEvent.findById(id);
    if (!event) {
      return next(new AppError('Wedding event not found', 404, 'EVENT_NOT_FOUND'));
    }

    if (event.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await event.updateRSVP(guestId, status);
    successResponse(res, { event }, 'RSVP updated successfully');
  });

  /**
   * Add task to event
   * @route POST /api/wedding-events/:id/tasks
   * @access Private
   */
  addTask = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const taskInfo = req.body;

    const event = await WeddingEvent.findById(id);
    if (!event) {
      return next(new AppError('Wedding event not found', 404, 'EVENT_NOT_FOUND'));
    }

    if (event.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await event.addTask(taskInfo);
    successResponse(res, { event }, 'Task added successfully');
  });

  /**
   * Complete task
   * @route PATCH /api/wedding-events/:id/tasks/:taskId/complete
   * @access Private
   */
  completeTask = asyncHandler(async (req, res, next) => {
    const { id, taskId } = req.params;

    const event = await WeddingEvent.findById(id);
    if (!event) {
      return next(new AppError('Wedding event not found', 404, 'EVENT_NOT_FOUND'));
    }

    if (event.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await event.completeTask(taskId);
    successResponse(res, { event }, 'Task completed successfully');
  });

  /**
   * Add timeline event
   * @route POST /api/wedding-events/:id/timeline
   * @access Private
   */
  addTimelineEvent = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const eventInfo = req.body;

    const event = await WeddingEvent.findById(id);
    if (!event) {
      return next(new AppError('Wedding event not found', 404, 'EVENT_NOT_FOUND'));
    }

    if (event.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await event.addTimelineEvent(eventInfo);
    successResponse(res, { event }, 'Timeline event added successfully');
  });

  /**
   * Log communication
   * @route POST /api/wedding-events/:id/communications
   * @access Private
   */
  logCommunication = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const communicationInfo = req.body;

    const event = await WeddingEvent.findById(id);
    if (!event) {
      return next(new AppError('Wedding event not found', 404, 'EVENT_NOT_FOUND'));
    }

    if (event.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await event.logCommunication(communicationInfo);
    successResponse(res, { event }, 'Communication logged successfully');
  });

  /**
   * Get event budget summary
   * @route GET /api/wedding-events/:id/budget
   * @access Private
   */
  getBudgetSummary = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const event = await WeddingEvent.findById(id);
    if (!event) {
      return next(new AppError('Wedding event not found', 404, 'EVENT_NOT_FOUND'));
    }

    if (event.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    const budgetSummary = {
      total: event.budget.total,
      spent: event.budget.spent,
      remaining: event.budget.remaining,
      categories: event.budget.categories,
      vendorCosts: event.totalSpent,
      percentageSpent: event.budget.total > 0 ? (event.budget.spent / event.budget.total) * 100 : 0
    };

    successResponse(res, { budget: budgetSummary }, 'Budget summary retrieved successfully');
  });

  /**
   * Get event progress
   * @route GET /api/wedding-events/:id/progress
   * @access Private
   */
  getEventProgress = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const event = await WeddingEvent.findById(id);
    if (!event) {
      return next(new AppError('Wedding event not found', 404, 'EVENT_NOT_FOUND'));
    }

    if (event.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    const progress = {
      percentage: event.progress.percentage,
      milestones: event.progress.milestones,
      completedTasks: event.tasks.filter(task => task.status === 'completed').length,
      totalTasks: event.tasks.length,
      confirmedVendors: event.confirmedVendorsCount,
      totalVendors: event.vendors.length,
      rsvpSummary: event.rsvpSummary,
      daysUntilWedding: event.daysUntilWedding
    };

    successResponse(res, { progress }, 'Event progress retrieved successfully');
  });

  /**
   * Search events by couple
   * @route GET /api/wedding-events/search/couple
   * @access Private
   */
  searchByCouple = asyncHandler(async (req, res, next) => {
    const { email } = req.query;

    if (!email) {
      return next(new AppError('Email is required', 400, 'EMAIL_REQUIRED'));
    }

    const events = await WeddingEvent.findByCouple(email);
    successResponse(res, { events }, 'Events found for couple');
  });

  /**
   * Update event status
   * @route PATCH /api/wedding-events/:id/status
   * @access Private
   */
  updateEventStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['planning', 'confirmed', 'in-progress', 'completed', 'cancelled', 'postponed'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid event status', 400, 'INVALID_STATUS'));
    }

    const event = await WeddingEvent.findById(id);
    if (!event) {
      return next(new AppError('Wedding event not found', 404, 'EVENT_NOT_FOUND'));
    }

    if (event.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    event.status = status;
    await event.save();

    successResponse(res, { event }, 'Event status updated successfully');
  });

  /**
   * Get event analytics
   * @route GET /api/wedding-events/:id/analytics
   * @access Private
   */
  getEventAnalytics = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const event = await WeddingEvent.findById(id);
    if (!event) {
      return next(new AppError('Wedding event not found', 404, 'EVENT_NOT_FOUND'));
    }

    if (event.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    const analytics = {
      budget: {
        total: event.budget.total,
        spent: event.totalSpent,
        remaining: event.budget.total - event.totalSpent,
        percentageSpent: event.budget.total > 0 ? (event.totalSpent / event.budget.total) * 100 : 0
      },
      vendors: {
        total: event.vendors.length,
        confirmed: event.confirmedVendorsCount,
        pending: event.vendors.filter(v => v.status === 'inquired').length
      },
      guests: event.rsvpSummary,
      tasks: {
        total: event.tasks.length,
        completed: event.tasks.filter(t => t.status === 'completed').length,
        pending: event.tasks.filter(t => t.status === 'pending').length
      },
      timeline: {
        daysUntilWedding: event.daysUntilWedding,
        progress: event.progress.percentage
      }
    };

    successResponse(res, { analytics }, 'Event analytics retrieved successfully');
  });
}

module.exports = new WeddingEventController();

