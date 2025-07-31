const Order = require('../models/Order');
const Product = require('../models/Product');
const { asyncHandler, AppError, successResponse, paginatedResponse } = require('../middleware/errorHandler');
const { validationResult } = require('express-validator');

/**
 * Order Controller
 * Handles e-commerce order management operations
 */
class OrderController {
  /**
   * Create a new order
   * @route POST /api/orders
   * @access Private/Public (for guest orders)
   */
  createOrder = asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR'));
    }

    const orderData = { 
      ...req.body, 
      website: req.website._id,
      customer: req.user ? req.user._id : null
    };

    // Validate products and check inventory
    for (const item of orderData.items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return next(new AppError(`Product ${item.product} not found`, 404, 'PRODUCT_NOT_FOUND'));
      }

      if (product.inventory.trackQuantity && product.inventory.availableQuantity < item.quantity) {
        return next(new AppError(`Insufficient inventory for ${product.name}`, 400, 'INSUFFICIENT_INVENTORY'));
      }

      // Store product snapshot
      item.productSnapshot = {
        name: product.name,
        sku: product.sku,
        price: product.pricing.price,
        image: product.primaryImage?.url,
        description: product.description.short
      };
    }

    const order = await Order.create(orderData);

    // Reserve inventory for all items
    try {
      await order.reserveInventory();
    } catch (error) {
      await Order.findByIdAndDelete(order._id);
      return next(new AppError(error.message, 400, 'INVENTORY_RESERVATION_FAILED'));
    }

    await order.populate(['website', 'customer', 'items.product']);
    
    // Send order confirmation notification
    await order.sendNotification('confirmation');

    successResponse(res, { order }, 'Order created successfully', 201);
  });

  /**
   * Get all orders for a website
   * @route GET /api/orders
   * @access Private
   */
  getOrders = asyncHandler(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const paymentStatus = req.query.paymentStatus;
    const search = req.query.search;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const query = { website: req.website._id };
    
    if (status) query.status = status;
    if (paymentStatus) query['payment.status'] = paymentStatus;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.firstName': { $regex: search, $options: 'i' } },
        { 'customerInfo.lastName': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate(['website', 'customer', 'items.product'])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalItems = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limit);

    const pagination = { page, limit, totalPages, totalItems };
    paginatedResponse(res, orders, pagination, 'Orders retrieved successfully');
  });

  /**
   * Get order by ID or order number
   * @route GET /api/orders/:identifier
   * @access Private/Public (for guest orders with email verification)
   */
  getOrder = asyncHandler(async (req, res, next) => {
    const { identifier } = req.params;
    const { email } = req.query; // For guest order access
    
    // Try to find by ID first, then by order number
    let order = await Order.findById(identifier)
      .populate(['website', 'customer', 'items.product']);
    
    if (!order) {
      order = await Order.findOne({ 
        orderNumber: identifier, 
        website: req.website._id 
      }).populate(['website', 'customer', 'items.product']);
    }

    if (!order) {
      return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
    }

    // Check access permissions
    if (req.user) {
      // Authenticated user - check if they own the order or are admin
      if (order.customer && order.customer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
      }
    } else {
      // Guest access - require email verification
      if (!email || order.customerInfo.email !== email.toLowerCase()) {
        return next(new AppError('Email verification required for guest orders', 403, 'EMAIL_VERIFICATION_REQUIRED'));
      }
    }

    successResponse(res, { order }, 'Order retrieved successfully');
  });

  /**
   * Update order status
   * @route PATCH /api/orders/:id/status
   * @access Private
   */
  updateOrderStatus = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid order status', 400, 'INVALID_STATUS'));
    }

    const order = await Order.findById(id);
    if (!order) {
      return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
    }

    if (order.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    await order.updateStatus(status, note, req.user?.name || 'admin');
    
    // Send appropriate notification
    const notificationTypes = {
      'confirmed': 'confirmation',
      'processing': 'processing',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'cancelled': 'cancellation'
    };
    
    if (notificationTypes[status]) {
      await order.sendNotification(notificationTypes[status]);
    }

    successResponse(res, { order }, 'Order status updated successfully');
  });

  /**
   * Cancel order
   * @route PATCH /api/orders/:id/cancel
   * @access Private/Public (customer can cancel their own orders)
   */
  cancelOrder = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
    }

    // Check permissions
    if (req.user) {
      if (order.customer && order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
      }
    }

    if (!order.canCancel()) {
      return next(new AppError('Order cannot be cancelled at this stage', 400, 'CANNOT_CANCEL'));
    }

    await order.updateStatus('cancelled', reason, req.user?.name || 'customer');
    
    // Release reserved inventory
    await order.releaseInventory();
    
    // Send cancellation notification
    await order.sendNotification('cancellation');

    successResponse(res, { order }, 'Order cancelled successfully');
  });

  /**
   * Process refund
   * @route POST /api/orders/:id/refund
   * @access Private
   */
  processRefund = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { amount, reason, transactionId } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
    }

    if (order.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    if (!order.canRefund()) {
      return next(new AppError('Order cannot be refunded', 400, 'CANNOT_REFUND'));
    }

    if (amount > order.pricing.total - order.totalRefunded) {
      return next(new AppError('Refund amount exceeds available amount', 400, 'INVALID_REFUND_AMOUNT'));
    }

    await order.addRefund(amount, reason, transactionId);

    successResponse(res, { order }, 'Refund processed successfully');
  });

  /**
   * Get customer orders
   * @route GET /api/orders/customer/:customerId
   * @access Private
   */
  getCustomerOrders = asyncHandler(async (req, res, next) => {
    const { customerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Check if user can access these orders
    if (req.user._id.toString() !== customerId && req.user.role !== 'admin') {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    const skip = (page - 1) * limit;
    const orders = await Order.findByCustomer(customerId)
      .populate(['website', 'items.product'])
      .skip(skip)
      .limit(limit);

    const totalItems = await Order.countDocuments({ customer: customerId });
    const totalPages = Math.ceil(totalItems / limit);

    const pagination = { page, limit, totalPages, totalItems };
    paginatedResponse(res, orders, pagination, 'Customer orders retrieved successfully');
  });

  /**
   * Get order statistics
   * @route GET /api/orders/stats
   * @access Private
   */
  getOrderStats = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    const stats = await Order.getOrderStats(req.website._id, startDate, endDate);
    
    // Get additional stats
    const totalOrders = await Order.countDocuments({ website: req.website._id });
    const pendingOrders = await Order.countDocuments({ 
      website: req.website._id, 
      status: 'pending' 
    });
    const processingOrders = await Order.countDocuments({ 
      website: req.website._id, 
      status: 'processing' 
    });

    const analytics = {
      ...stats[0],
      totalOrders,
      pendingOrders,
      processingOrders
    };

    successResponse(res, { stats: analytics }, 'Order statistics retrieved successfully');
  });

  /**
   * Add order note
   * @route POST /api/orders/:id/notes
   * @access Private
   */
  addOrderNote = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { note, category = 'general', isPrivate = true } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
    }

    if (order.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    order.internalNotes.push({
      note,
      addedBy: req.user?.name || 'admin',
      category,
      isPrivate,
      addedAt: new Date()
    });

    await order.save();
    successResponse(res, { order }, 'Note added successfully');
  });

  /**
   * Update shipping information
   * @route PATCH /api/orders/:id/shipping
   * @access Private
   */
  updateShipping = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const { carrier, trackingNumber, trackingUrl, shippedDate } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return next(new AppError('Order not found', 404, 'ORDER_NOT_FOUND'));
    }

    if (order.website.toString() !== req.website._id.toString()) {
      return next(new AppError('Access denied', 403, 'ACCESS_DENIED'));
    }

    order.fulfillment.carrier = carrier;
    order.fulfillment.trackingNumber = trackingNumber;
    order.fulfillment.trackingUrl = trackingUrl;
    if (shippedDate) {
      order.fulfillment.shippedDate = new Date(shippedDate);
    }

    // Update status to shipped if not already
    if (order.status !== 'shipped' && trackingNumber) {
      await order.updateStatus('shipped', 'Tracking information added', req.user?.name || 'admin');
    } else {
      await order.save();
    }

    // Send shipping notification
    if (trackingNumber) {
      await order.sendNotification('shipped');
    }

    successResponse(res, { order }, 'Shipping information updated successfully');
  });

  /**
   * Search orders
   * @route GET /api/orders/search
   * @access Private
   */
  searchOrders = asyncHandler(async (req, res, next) => {
    const {
      q: searchTerm,
      status,
      paymentStatus,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      page = 1,
      limit = 20
    } = req.query;

    const query = { website: req.website._id };

    if (searchTerm) {
      query.$or = [
        { orderNumber: { $regex: searchTerm, $options: 'i' } },
        { 'customerInfo.firstName': { $regex: searchTerm, $options: 'i' } },
        { 'customerInfo.lastName': { $regex: searchTerm, $options: 'i' } },
        { 'customerInfo.email': { $regex: searchTerm, $options: 'i' } },
        { 'fulfillment.trackingNumber': { $regex: searchTerm, $options: 'i' } }
      ];
    }

    if (status) query.status = status;
    if (paymentStatus) query['payment.status'] = paymentStatus;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      query['pricing.total'] = {};
      if (minAmount) query['pricing.total'].$gte = parseFloat(minAmount);
      if (maxAmount) query['pricing.total'].$lte = parseFloat(maxAmount);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const orders = await Order.find(query)
      .populate(['website', 'customer', 'items.product'])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalItems = await Order.countDocuments(query);
    const totalPages = Math.ceil(totalItems / parseInt(limit));

    const pagination = { 
      page: parseInt(page), 
      limit: parseInt(limit), 
      totalPages, 
      totalItems 
    };

    paginatedResponse(res, orders, pagination, 'Orders found');
  });
}

module.exports = new OrderController();

