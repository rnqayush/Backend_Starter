const Order = require('../models/Order');
const Product = require('../models/Product');
const BaseController = require('./BaseController');
const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const { NotFoundError, BadRequestError, ConflictError } = require('../utils/customErrors');

class OrderController extends BaseController {
  constructor() {
    super(Order, 'Order');
    this.populateFields = ['business', 'customer', 'items.product'];
  }

  /**
   * Create new order
   */
  createOrder = asyncHandler(async (req, res) => {
    const {
      businessId,
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      couponCode
    } = req.body;

    if (!items || items.length === 0) {
      throw new BadRequestError('Order must contain at least one item');
    }

    let totalAmount = 0;
    let totalWeight = 0;
    const validatedItems = [];

    // Validate and calculate order totals
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new NotFoundError(`Product ${item.product} not found`);
      }

      if (product.status !== 'active' || !product.isActive) {
        throw new BadRequestError(`Product ${product.name} is not available`);
      }

      // Check inventory
      if (product.inventory.quantity < item.quantity) {
        throw new ConflictError(`Insufficient stock for ${product.name}. Available: ${product.inventory.quantity}`);
      }

      const itemPrice = product.pricing.salePrice || product.pricing.regularPrice;
      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;
      totalWeight += (product.shipping?.weight || 0) * item.quantity;

      validatedItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        price: itemPrice,
        total: itemTotal,
        image: product.images[0] || null
      });

      // Reserve inventory
      product.inventory.quantity -= item.quantity;
      product.inventory.reserved = (product.inventory.reserved || 0) + item.quantity;
      await product.save();
    }

    // Apply coupon if provided
    let discountAmount = 0;
    if (couponCode) {
      // Implement coupon logic here
      // This is a placeholder for coupon validation and discount calculation
    }

    // Calculate shipping cost
    const shippingCost = await this.calculateShippingCost(totalWeight, shippingAddress);

    // Calculate tax
    const taxRate = 0.08; // 8% tax rate - should be configurable
    const taxAmount = (totalAmount - discountAmount) * taxRate;

    const finalAmount = totalAmount - discountAmount + shippingCost + taxAmount;

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const order = await Order.create({
      orderNumber,
      business: businessId,
      customer: req.user.id,
      items: validatedItems,
      pricing: {
        subtotal: totalAmount,
        discount: discountAmount,
        shipping: shippingCost,
        tax: taxAmount,
        total: finalAmount
      },
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      couponCode,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.populate(['business', 'customer', 'items.product']);

    return ResponseHandler.created(res, order, 'Order created successfully');
  });

  /**
   * Get user orders
   */
  getUserOrders = asyncHandler(async (req, res) => {
    const {
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    let query = { customer: req.user.id };

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await Order.countDocuments(query);
    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('business', 'name slug')
      .populate('items.product', 'name images')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    return ResponseHandler.paginated(res, orders, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }, 'User orders retrieved successfully');
  });

  /**
   * Get business orders
   */
  getBusinessOrders = asyncHandler(async (req, res) => {
    const { businessId } = req.params;
    const {
      status,
      paymentStatus,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    // Check access
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (!req.user.businesses || !req.user.businesses.includes(businessId)) {
        throw new ForbiddenError('Access denied to this business');
      }
    }

    let query = { business: businessId };

    // Apply filters
    if (status) {
      query.status = status;
    }

    if (paymentStatus) {
      query.paymentStatus = paymentStatus;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const total = await Order.countDocuments(query);
    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name sku')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    return ResponseHandler.paginated(res, orders, {
      page: parseInt(page),
      limit: parseInt(limit),
      total
    }, 'Business orders retrieved successfully');
  });

  /**
   * Update order status
   */
  updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, trackingNumber, notes } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check if user can update this order
    const canUpdate = req.user.role === 'admin' || 
                     req.user.role === 'super_admin' ||
                     (req.user.businesses && req.user.businesses.includes(order.business.toString()));

    if (!canUpdate) {
      throw new ForbiddenError('Access denied to update this order');
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['confirmed', 'cancelled'],
      'confirmed': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'returned'],
      'delivered': ['returned'],
      'cancelled': [],
      'returned': []
    };

    if (!validTransitions[order.status].includes(status)) {
      throw new BadRequestError(`Cannot change status from ${order.status} to ${status}`);
    }

    // Handle inventory changes based on status
    if (status === 'cancelled' && ['pending', 'confirmed', 'processing'].includes(order.status)) {
      // Release reserved inventory
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.inventory.quantity += item.quantity;
          product.inventory.reserved = Math.max(0, (product.inventory.reserved || 0) - item.quantity);
          await product.save();
        }
      }
    }

    // Update order
    order.status = status;
    if (trackingNumber) {
      order.tracking.trackingNumber = trackingNumber;
      order.tracking.carrier = req.body.carrier || order.tracking.carrier;
    }

    if (notes) {
      order.notes = order.notes || [];
      order.notes.push({
        text: notes,
        addedBy: req.user.id,
        addedAt: new Date()
      });
    }

    // Update timestamps
    const now = new Date();
    switch (status) {
      case 'confirmed':
        order.confirmedAt = now;
        break;
      case 'processing':
        order.processingAt = now;
        break;
      case 'shipped':
        order.shippedAt = now;
        break;
      case 'delivered':
        order.deliveredAt = now;
        // Release reserved inventory on delivery
        for (const item of order.items) {
          const product = await Product.findById(item.product);
          if (product) {
            product.inventory.reserved = Math.max(0, (product.inventory.reserved || 0) - item.quantity);
            await product.save();
          }
        }
        break;
      case 'cancelled':
        order.cancelledAt = now;
        break;
    }

    await order.save();

    return ResponseHandler.updated(res, order, 'Order status updated successfully');
  });

  /**
   * Process refund
   */
  processRefund = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { amount, reason, refundItems } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check access
    const canRefund = req.user.role === 'admin' || 
                     req.user.role === 'super_admin' ||
                     (req.user.businesses && req.user.businesses.includes(order.business.toString()));

    if (!canRefund) {
      throw new ForbiddenError('Access denied to process refund');
    }

    // Validate refund amount
    const maxRefundAmount = order.pricing.total - (order.refunds?.totalRefunded || 0);
    if (amount > maxRefundAmount) {
      throw new BadRequestError(`Refund amount cannot exceed ${maxRefundAmount}`);
    }

    // Process partial refund for specific items
    if (refundItems && refundItems.length > 0) {
      for (const refundItem of refundItems) {
        const orderItem = order.items.find(item => 
          item.product.toString() === refundItem.productId
        );
        
        if (!orderItem) {
          throw new NotFoundError(`Product ${refundItem.productId} not found in order`);
        }

        if (refundItem.quantity > orderItem.quantity) {
          throw new BadRequestError(`Cannot refund more than ordered quantity`);
        }

        // Return inventory
        const product = await Product.findById(refundItem.productId);
        if (product) {
          product.inventory.quantity += refundItem.quantity;
          await product.save();
        }
      }
    }

    // Update order with refund information
    if (!order.refunds) {
      order.refunds = {
        totalRefunded: 0,
        refundHistory: []
      };
    }

    order.refunds.totalRefunded += amount;
    order.refunds.refundHistory.push({
      amount,
      reason,
      refundItems,
      processedBy: req.user.id,
      processedAt: new Date(),
      refundId: `REF-${Date.now()}`
    });

    // Update order status if fully refunded
    if (order.refunds.totalRefunded >= order.pricing.total) {
      order.status = 'refunded';
    }

    await order.save();

    return ResponseHandler.updated(res, order, 'Refund processed successfully');
  });

  /**
   * Get order analytics
   */
  getOrderAnalytics = asyncHandler(async (req, res) => {
    const { businessId } = req.params;
    const { startDate, endDate } = req.query;

    // Check access
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      if (!req.user.businesses || !req.user.businesses.includes(businessId)) {
        throw new ForbiddenError('Access denied to this business');
      }
    }

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Overall statistics
    const orderStats = await Order.aggregate([
      {
        $match: {
          business: businessId,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' },
          averageOrderValue: { $avg: '$pricing.total' },
          confirmedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    // Top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          business: businessId,
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    // Daily trends
    const dailyTrends = await Order.aggregate([
      {
        $match: {
          business: businessId,
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    const analytics = {
      summary: orderStats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        confirmedOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0
      },
      topProducts,
      dailyTrends,
      period: { start, end }
    };

    return ResponseHandler.success(res, analytics, 'Order analytics retrieved successfully');
  });

  /**
   * Calculate shipping cost
   */
  calculateShippingCost = async (weight, address) => {
    // Simple shipping calculation - can be made more sophisticated
    const baseRate = 5.00;
    const weightRate = 0.50; // per pound
    const shippingCost = baseRate + (weight * weightRate);
    
    // Add distance-based calculation if needed
    // This would integrate with shipping APIs like UPS, FedEx, etc.
    
    return Math.round(shippingCost * 100) / 100; // Round to 2 decimal places
  };

  /**
   * Generate unique order number
   */
  generateOrderNumber = async () => {
    const prefix = 'ORD';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
  };

  /**
   * Track order
   */
  trackOrder = asyncHandler(async (req, res) => {
    const { orderNumber } = req.params;

    const order = await Order.findOne({ orderNumber })
      .populate('business', 'name')
      .select('orderNumber status tracking shippedAt deliveredAt items');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Check if user can view this order
    const canView = order.customer.toString() === req.user.id ||
                   req.user.role === 'admin' ||
                   req.user.role === 'super_admin' ||
                   (req.user.businesses && req.user.businesses.includes(order.business._id.toString()));

    if (!canView) {
      throw new ForbiddenError('Access denied to view this order');
    }

    return ResponseHandler.success(res, order, 'Order tracking information retrieved successfully');
  });
}

module.exports = new OrderController();

