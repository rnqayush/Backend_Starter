import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import Order from '../../models/ecommerce/Order.js';
import Cart from '../../models/ecommerce/Cart.js';
import Product from '../../models/ecommerce/Product.js';
import { sendEmail } from '../../services/emailService.js';

// @desc    Create new order from cart
// @route   POST /api/ecommerce/orders
// @access  Private (Customer)
export const createOrder = asyncHandler(async (req, res, next) => {
  const {
    cartId,
    addresses,
    paymentMethod,
    notes
  } = req.body;

  // Get cart
  const cart = await Cart.findById(cartId).populate('items.product');
  
  if (!cart || cart.customer.toString() !== req.user.id) {
    return sendError(res, 'Cart not found', 404);
  }

  if (cart.isEmpty) {
    return sendError(res, 'Cart is empty', 400);
  }

  // Validate cart items
  await cart.validateItems();
  
  if (cart.hasUnavailableItems) {
    return sendError(res, 'Some items in cart are no longer available', 400);
  }

  // Create order items from cart
  const orderItems = cart.items.map(item => ({
    product: item.product._id,
    seller: item.seller,
    name: item.name,
    sku: item.sku,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    variation: item.variation,
    subtotal: item.subtotal
  }));

  // Create order
  const orderData = {
    customer: req.user.id,
    customerInfo: {
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone
    },
    items: orderItems,
    pricing: {
      subtotal: cart.totals.subtotal,
      tax: cart.totals.tax,
      shipping: cart.totals.shipping,
      discount: cart.totals.discount,
      total: cart.totals.total
    },
    addresses,
    payment: {
      method: paymentMethod,
      status: paymentMethod === 'cod' ? 'pending' : 'processing'
    },
    notes: {
      customer: notes
    },
    source: 'web'
  };

  const order = await Order.create(orderData);

  // Update product inventory and analytics
  for (let item of orderItems) {
    const product = await Product.findById(item.product);
    if (product) {
      await product.updateInventory(item.quantity, 'subtract');
      await product.purchase();
    }
  }

  // Clear cart
  await cart.convertToOrder();

  // Send order confirmation email
  try {
    await sendEmail({
      email: req.user.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      message: `Your order ${order.orderNumber} has been placed successfully. Total: ₹${order.pricing.total}`
    });
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
  }

  const populatedOrder = await Order.findById(order._id)
    .populate('items.product', 'name images')
    .populate('items.seller', 'name businessInfo');

  sendSuccess(res, {
    order: populatedOrder
  }, 'Order created successfully', 201);
});

// @desc    Get orders (customer or seller)
// @route   GET /api/ecommerce/orders
// @access  Private
export const getOrders = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query = {};

  // Filter based on user role
  if (req.user.role === 'customer') {
    query.customer = req.user.id;
  } else if (req.user.role === 'vendor' && req.user.businessType === 'ecommerce') {
    query['items.seller'] = req.user.id;
  } else if (req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to view orders', 403);
  }

  // Apply filters
  if (req.query.status) query.status = req.query.status;
  if (req.query.paymentStatus) query['payment.status'] = req.query.paymentStatus;

  // Date range filter
  if (req.query.dateFrom || req.query.dateTo) {
    query.placedAt = {};
    if (req.query.dateFrom) query.placedAt.$gte = new Date(req.query.dateFrom);
    if (req.query.dateTo) query.placedAt.$lte = new Date(req.query.dateTo);
  }

  const orders = await Order.find(query)
    .populate('customer', 'name email phone')
    .populate('items.product', 'name images')
    .populate('items.seller', 'name businessInfo')
    .sort({ placedAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments(query);

  // Get statistics for seller dashboard
  let statistics = null;
  if (req.user.role === 'vendor') {
    const stats = await Order.getSalesAnalytics(req.user.id);
    statistics = stats[0] || {};
  }

  sendSuccess(res, {
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    },
    statistics
  }, 'Orders retrieved successfully');
});

// @desc    Get single order
// @route   GET /api/ecommerce/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name email phone address')
    .populate('items.product', 'name images specifications')
    .populate('items.seller', 'name businessInfo')
    .populate('timeline.updatedBy', 'name');

  if (!order) {
    return sendError(res, 'Order not found', 404);
  }

  // Check authorization
  const canAccess = 
    order.customer.toString() === req.user.id ||
    order.uniqueSellers.includes(req.user.id) ||
    req.user.role === 'admin';

  if (!canAccess) {
    return sendError(res, 'Not authorized to view this order', 403);
  }

  sendSuccess(res, {
    order
  }, 'Order retrieved successfully');
});

// @desc    Update order status
// @route   PUT /api/ecommerce/orders/:id/status
// @access  Private (Seller/Admin)
export const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return sendError(res, 'Order not found', 404);
  }

  // Check authorization
  const canUpdate = 
    order.uniqueSellers.includes(req.user.id) ||
    req.user.role === 'admin';

  if (!canUpdate) {
    return sendError(res, 'Not authorized to update this order', 403);
  }

  const { status, message, trackingInfo } = req.body;

  await order.updateStatus(status, message, req.user.id);

  // Update tracking info if provided
  if (trackingInfo && status === 'shipped') {
    order.shipping = {
      ...order.shipping,
      ...trackingInfo
    };
    await order.save();
  }

  // Send status update email to customer
  try {
    await sendEmail({
      email: order.customerInfo.email,
      subject: `Order Update - ${order.orderNumber}`,
      message: `Your order ${order.orderNumber} status has been updated to: ${status}. ${message || ''}`
    });
  } catch (error) {
    console.error('Failed to send order update email:', error);
  }

  const updatedOrder = await Order.findById(req.params.id)
    .populate('customer', 'name email')
    .populate('timeline.updatedBy', 'name');

  sendSuccess(res, {
    order: updatedOrder
  }, 'Order status updated successfully');
});

// @desc    Update payment status
// @route   PUT /api/ecommerce/orders/:id/payment
// @access  Private (Seller/Admin)
export const updatePaymentStatus = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return sendError(res, 'Order not found', 404);
  }

  // Check authorization
  const canUpdate = 
    order.uniqueSellers.includes(req.user.id) ||
    req.user.role === 'admin';

  if (!canUpdate) {
    return sendError(res, 'Not authorized to update this order', 403);
  }

  const { status, transactionId } = req.body;

  await order.updatePaymentStatus(status, transactionId);

  sendSuccess(res, {
    order: {
      id: order._id,
      payment: order.payment
    }
  }, 'Payment status updated successfully');
});

// @desc    Cancel order
// @route   PUT /api/ecommerce/orders/:id/cancel
// @access  Private (Customer/Seller/Admin)
export const cancelOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return sendError(res, 'Order not found', 404);
  }

  // Check authorization
  const canCancel = 
    order.customer.toString() === req.user.id ||
    order.uniqueSellers.includes(req.user.id) ||
    req.user.role === 'admin';

  if (!canCancel) {
    return sendError(res, 'Not authorized to cancel this order', 403);
  }

  if (!order.canBeCancelled()) {
    return sendError(res, 'Order cannot be cancelled at this stage', 400);
  }

  const { reason } = req.body;

  await order.updateStatus('cancelled', reason || 'Order cancelled', req.user.id);

  // Restore product inventory
  for (let item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      await product.updateInventory(item.quantity, 'add');
    }
  }

  sendSuccess(res, {
    order: {
      id: order._id,
      status: order.status,
      cancelledAt: order.cancelledAt
    }
  }, 'Order cancelled successfully');
});

// @desc    Process return request
// @route   POST /api/ecommerce/orders/:id/return
// @access  Private (Customer)
export const requestReturn = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return sendError(res, 'Order not found', 404);
  }

  // Check if customer owns this order
  if (order.customer.toString() !== req.user.id) {
    return sendError(res, 'Not authorized to return this order', 403);
  }

  if (!order.canBeReturned()) {
    return sendError(res, 'Order cannot be returned', 400);
  }

  const { items, reason } = req.body;

  const returnRequest = {
    items,
    reason,
    status: 'requested'
  };

  order.returns.push(returnRequest);
  await order.save();

  // Notify sellers about return request
  for (let sellerId of order.uniqueSellers) {
    // Send email notification to seller
    // This would be implemented based on your email service
  }

  sendSuccess(res, {
    order: {
      id: order._id,
      returns: order.returns
    }
  }, 'Return request submitted successfully');
});

// @desc    Process refund
// @route   POST /api/ecommerce/orders/:id/refund
// @access  Private (Seller/Admin)
export const processRefund = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return sendError(res, 'Order not found', 404);
  }

  // Check authorization
  const canRefund = 
    order.uniqueSellers.includes(req.user.id) ||
    req.user.role === 'admin';

  if (!canRefund) {
    return sendError(res, 'Not authorized to process refund for this order', 403);
  }

  const { amount, reason, refundId } = req.body;

  if (amount > order.pricing.total) {
    return sendError(res, 'Refund amount cannot exceed order total', 400);
  }

  await order.addRefund(amount, reason, refundId);

  // Update order status if fully refunded
  const totalRefunded = order.totalRefunded + amount;
  if (totalRefunded >= order.pricing.total) {
    await order.updateStatus('refunded', 'Order fully refunded', req.user.id);
  }

  sendSuccess(res, {
    order: {
      id: order._id,
      payment: order.payment,
      totalRefunded: order.totalRefunded
    }
  }, 'Refund processed successfully');
});

// @desc    Get order analytics
// @route   GET /api/ecommerce/orders/analytics
// @access  Private (Seller/Admin)
export const getOrderAnalytics = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'ecommerce') {
    return sendError(res, 'Only e-commerce sellers can view order analytics', 403);
  }

  const { dateFrom, dateTo } = req.query;
  const dateRange = {};
  
  if (dateFrom) dateRange.start = dateFrom;
  if (dateTo) dateRange.end = dateTo;

  const analytics = await Order.getSalesAnalytics(req.user.id, dateRange);

  // Get additional metrics
  const totalOrders = await Order.countDocuments({ 'items.seller': req.user.id });
  const todayOrders = await Order.countDocuments({
    'items.seller': req.user.id,
    placedAt: {
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lt: new Date(new Date().setHours(23, 59, 59, 999))
    }
  });

  const weeklyOrders = await Order.countDocuments({
    'items.seller': req.user.id,
    placedAt: {
      $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }
  });

  // Get order status distribution
  const statusDistribution = await Order.aggregate([
    { $match: { 'items.seller': mongoose.Types.ObjectId(req.user.id) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  sendSuccess(res, {
    analytics: analytics[0] || {},
    summary: {
      total: totalOrders,
      today: todayOrders,
      thisWeek: weeklyOrders
    },
    statusDistribution
  }, 'Order analytics retrieved successfully');
});

// @desc    Export orders
// @route   GET /api/ecommerce/orders/export
// @access  Private (Seller/Admin)
export const exportOrders = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'ecommerce') {
    return sendError(res, 'Only e-commerce sellers can export orders', 403);
  }

  const { format = 'json', dateFrom, dateTo } = req.query;

  let query = { 'items.seller': req.user.id };

  if (dateFrom || dateTo) {
    query.placedAt = {};
    if (dateFrom) query.placedAt.$gte = new Date(dateFrom);
    if (dateTo) query.placedAt.$lte = new Date(dateTo);
  }

  const orders = await Order.find(query)
    .populate('customer', 'name email phone')
    .populate('items.product', 'name sku')
    .sort({ placedAt: -1 });

  if (format === 'csv') {
    // Convert to CSV format
    const csvData = [];
    
    orders.forEach(order => {
      order.items.forEach(item => {
        csvData.push({
          'Order Number': order.orderNumber,
          'Date': order.placedAt.toISOString().split('T')[0],
          'Customer Name': order.customerInfo.name,
          'Customer Email': order.customerInfo.email,
          'Product Name': item.name,
          'SKU': item.sku,
          'Quantity': item.quantity,
          'Price': item.price,
          'Subtotal': item.subtotal,
          'Order Status': order.status,
          'Payment Status': order.payment.status
        });
      });
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
    
    // Simple CSV conversion
    const csvHeaders = Object.keys(csvData[0] || {}).join(',');
    const csvRows = csvData.map(row => Object.values(row).join(','));
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    
    return res.send(csvContent);
  }

  sendSuccess(res, {
    orders,
    count: orders.length,
    exportDate: new Date().toISOString()
  }, 'Orders exported successfully');
});

// @desc    Get seller dashboard data
// @route   GET /api/ecommerce/seller/dashboard
// @access  Private (Seller only)
export const getSellerDashboard = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'vendor' || req.user.businessType !== 'ecommerce') {
    return sendError(res, 'Only e-commerce sellers can access seller dashboard', 403);
  }

  const sellerId = req.user.id;

  // Get recent orders
  const recentOrders = await Order.find({ 'items.seller': sellerId })
    .populate('customer', 'name email')
    .populate('items.product', 'name images')
    .sort({ placedAt: -1 })
    .limit(10);

  // Get sales analytics
  const salesStats = await Order.getSalesAnalytics(sellerId);

  // Get product statistics
  const productStats = await Product.aggregate([
    { $match: { seller: mongoose.Types.ObjectId(sellerId) } },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        publishedProducts: {
          $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
        },
        lowStockProducts: {
          $sum: { 
            $cond: [
              { 
                $and: [
                  { $eq: ['$inventory.trackQuantity', true] },
                  { $lte: ['$inventory.quantity', '$inventory.lowStockThreshold'] }
                ]
              }, 
              1, 
              0
            ]
          }
        },
        outOfStockProducts: {
          $sum: { 
            $cond: [
              { 
                $and: [
                  { $eq: ['$inventory.trackQuantity', true] },
                  { $eq: ['$inventory.quantity', 0] }
                ]
              }, 
              1, 
              0
            ]
          }
        }
      }
    }
  ]);

  // Get top selling products
  const topProducts = await Product.find({ seller: sellerId })
    .sort({ 'analytics.purchases': -1 })
    .limit(5)
    .select('name analytics images');

  sendSuccess(res, {
    recentOrders,
    salesStatistics: salesStats[0] || {},
    productStatistics: productStats[0] || {},
    topProducts
  }, 'Seller dashboard data retrieved successfully');
});

