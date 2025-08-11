const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Create new order from cart
const createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      billingAddress,
      paymentMethod,
      shippingMethod,
      notes
    } = req.body;

    const userId = req.user.id;

    // Get user's cart
    const cart = await Cart.findOne({ user: userId, status: 'active' })
      .populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Validate inventory for all items
    for (const item of cart.items) {
      const product = item.product;
      if (!product || product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product ${product?.name || 'unknown'} is no longer available`
        });
      }

      if (product.inventory.trackQuantity && product.inventory.quantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient inventory for ${product.name}`,
          availableQuantity: product.inventory.quantity
        });
      }
    }

    // Calculate totals
    const subtotal = cart.subtotal;
    const taxRate = 0.08; // 8% tax rate (should be configurable)
    const taxAmount = subtotal * taxRate;
    const shippingCost = calculateShippingCost(cart.items, shippingMethod);
    const total = subtotal + taxAmount + shippingCost;

    // Create order items with product snapshots
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      productSnapshot: {
        name: item.product.name,
        sku: item.product.sku,
        image: item.product.images[0]?.url
      },
      quantity: item.quantity,
      selectedVariants: item.selectedVariants,
      unitPrice: item.priceAtTime,
      totalPrice: item.priceAtTime * item.quantity,
      seller: item.product.seller
    }));

    // Create order
    const order = new Order({
      customer: userId,
      items: orderItems,
      subtotal,
      tax: {
        amount: taxAmount,
        rate: taxRate
      },
      shipping: {
        cost: shippingCost,
        method: shippingMethod
      },
      total,
      shippingAddress,
      billingAddress,
      payment: {
        method: paymentMethod
      },
      notes: {
        customer: notes
      }
    });

    await order.save();

    // Update product inventory
    for (const item of cart.items) {
      if (item.product.inventory.trackQuantity) {
        await Product.findByIdAndUpdate(
          item.product._id,
          { $inc: { 'inventory.quantity': -item.quantity } }
        );
      }
    }

    // Mark cart as converted
    cart.status = 'converted';
    await cart.save();

    // Populate order for response
    await order.populate('customer', 'firstName lastName email');
    await order.populate('items.product', 'name slug images');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { customer: req.user.id };
    if (status) filter.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('items.product', 'name slug images')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// Get single order
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(id)
      .populate('customer', 'firstName lastName email')
      .populate('items.product', 'name slug images')
      .populate('items.seller', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is a seller in the order
    const isCustomer = order.customer._id.toString() === userId;
    const isSeller = order.items.some(item => 
      item.seller._id.toString() === userId
    );

    if (!isCustomer && !isSeller && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// Update order status (Protected - Seller/Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user is seller for this order or admin
    const isSeller = order.items.some(item => 
      item.seller.toString() === req.user.id
    );

    if (!isSeller && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Update status with timeline entry
    await order.updateStatus(status, note, req.user.id);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (['shipped', 'delivered', 'cancelled', 'refunded'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Restore inventory
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product && product.inventory.trackQuantity) {
        product.inventory.quantity += item.quantity;
        await product.save();
      }
    }

    // Update order status
    await order.updateStatus('cancelled', reason || 'Cancelled by customer', req.user.id);

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

// Get seller orders (Protected - Seller only)
const getSellerOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      status,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    };

    const [orders, total] = await Promise.all([
      Order.getOrdersBySeller(req.user.id, options),
      Order.countDocuments({ 'items.seller': req.user.id })
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seller orders',
      error: error.message
    });
  }
};

// Get sales analytics (Protected - Seller only)
const getSalesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateRange = {};
    if (startDate) dateRange.startDate = startDate;
    if (endDate) dateRange.endDate = endDate;

    const analytics = await Order.getSalesAnalytics(req.user.id, dateRange);

    res.json({
      success: true,
      data: analytics[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalQuantitySold: 0
      }
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales analytics',
      error: error.message
    });
  }
};

// Helper function to calculate shipping cost
const calculateShippingCost = (items, shippingMethod) => {
  // Simple shipping calculation - can be made more sophisticated
  const totalWeight = items.reduce((sum, item) => {
    const weight = item.product.weight?.value || 1;
    return sum + (weight * item.quantity);
  }, 0);

  switch (shippingMethod) {
    case 'standard':
      return Math.max(5, totalWeight * 0.5);
    case 'express':
      return Math.max(15, totalWeight * 1.5);
    case 'overnight':
      return Math.max(25, totalWeight * 3);
    default:
      return 5;
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getSellerOrders,
  getSalesAnalytics
};

