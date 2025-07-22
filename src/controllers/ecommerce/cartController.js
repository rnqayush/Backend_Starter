import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import Cart from '../../models/ecommerce/Cart.js';
import Product from '../../models/ecommerce/Product.js';

// @desc    Get user's cart
// @route   GET /api/ecommerce/cart
// @access  Private (Customer)
export const getCart = asyncHandler(async (req, res, next) => {
  let cart = await Cart.findByCustomer(req.user.id);

  if (!cart) {
    // Create empty cart if doesn't exist
    cart = await Cart.create({
      customer: req.user.id,
      items: []
    });
  }

  // Validate cart items
  await cart.validateItems();

  sendSuccess(res, {
    cart
  }, 'Cart retrieved successfully');
});

// @desc    Add item to cart
// @route   POST /api/ecommerce/cart/items
// @access  Private (Customer)
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1, variation } = req.body;

  // Get product
  const product = await Product.findById(productId).populate('seller', 'name businessInfo');

  if (!product) {
    return sendError(res, 'Product not found', 404);
  }

  if (product.status !== 'published') {
    return sendError(res, 'Product is not available', 400);
  }

  // Check inventory
  if (product.inventory.trackQuantity && product.inventory.quantity < quantity) {
    return sendError(res, `Only ${product.inventory.quantity} items available`, 400);
  }

  // Get or create cart
  let cart = await Cart.findByCustomer(req.user.id);
  
  if (!cart) {
    cart = await Cart.create({
      customer: req.user.id,
      items: []
    });
  }

  // Prepare item data
  const itemData = {
    product: product._id,
    seller: product.seller._id,
    name: product.name,
    sku: product.sku,
    image: product.primaryImage?.url,
    price: product.currentPrice,
    quantity,
    variation
  };

  // Add item to cart
  await cart.addItem(itemData);

  // Update product analytics
  await product.addToCart();

  const updatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price inventory status')
    .populate('items.seller', 'name businessInfo');

  sendSuccess(res, {
    cart: updatedCart
  }, 'Item added to cart successfully');
});

// @desc    Update cart item
// @route   PUT /api/ecommerce/cart/items/:itemId
// @access  Private (Customer)
export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findByCustomer(req.user.id);

  if (!cart) {
    return sendError(res, 'Cart not found', 404);
  }

  const item = cart.items.id(req.params.itemId);

  if (!item) {
    return sendError(res, 'Item not found in cart', 404);
  }

  // Get product to check inventory
  const product = await Product.findById(item.product);

  if (product && product.inventory.trackQuantity && product.inventory.quantity < quantity) {
    return sendError(res, `Only ${product.inventory.quantity} items available`, 400);
  }

  // Update item
  await cart.updateItem(req.params.itemId, { quantity });

  const updatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price inventory status')
    .populate('items.seller', 'name businessInfo');

  sendSuccess(res, {
    cart: updatedCart
  }, 'Cart item updated successfully');
});

// @desc    Remove item from cart
// @route   DELETE /api/ecommerce/cart/items/:itemId
// @access  Private (Customer)
export const removeFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findByCustomer(req.user.id);

  if (!cart) {
    return sendError(res, 'Cart not found', 404);
  }

  const item = cart.items.id(req.params.itemId);

  if (!item) {
    return sendError(res, 'Item not found in cart', 404);
  }

  // Remove item
  await cart.removeItem(req.params.itemId);

  const updatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price inventory status')
    .populate('items.seller', 'name businessInfo');

  sendSuccess(res, {
    cart: updatedCart
  }, 'Item removed from cart successfully');
});

// @desc    Clear cart
// @route   DELETE /api/ecommerce/cart
// @access  Private (Customer)
export const clearCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findByCustomer(req.user.id);

  if (!cart) {
    return sendError(res, 'Cart not found', 404);
  }

  await cart.clearCart();

  sendSuccess(res, {
    cart: {
      id: cart._id,
      items: [],
      totals: cart.totals
    }
  }, 'Cart cleared successfully');
});

// @desc    Apply coupon to cart
// @route   POST /api/ecommerce/cart/coupons
// @access  Private (Customer)
export const applyCoupon = asyncHandler(async (req, res, next) => {
  const { code } = req.body;

  const cart = await Cart.findByCustomer(req.user.id);

  if (!cart) {
    return sendError(res, 'Cart not found', 404);
  }

  if (cart.isEmpty) {
    return sendError(res, 'Cannot apply coupon to empty cart', 400);
  }

  // TODO: Validate coupon with coupon service
  // For now, mock coupon validation
  const mockCoupons = {
    'SAVE10': { type: 'percentage', value: 10, minAmount: 500 },
    'FLAT50': { type: 'fixed', value: 50, minAmount: 200 },
    'FREESHIP': { type: 'free-shipping', value: 0, minAmount: 1000 }
  };

  const coupon = mockCoupons[code.toUpperCase()];

  if (!coupon) {
    return sendError(res, 'Invalid coupon code', 400);
  }

  if (cart.totals.subtotal < coupon.minAmount) {
    return sendError(res, `Minimum order amount of ₹${coupon.minAmount} required`, 400);
  }

  // Calculate discount
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = Math.round((cart.totals.subtotal * coupon.value) / 100);
  } else if (coupon.type === 'fixed') {
    discount = coupon.value;
  } else if (coupon.type === 'free-shipping') {
    discount = cart.totals.shipping;
  }

  const couponData = {
    code: code.toUpperCase(),
    type: coupon.type,
    discount
  };

  try {
    await cart.applyCoupon(couponData);
  } catch (error) {
    return sendError(res, error.message, 400);
  }

  const updatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price')
    .populate('items.seller', 'name');

  sendSuccess(res, {
    cart: updatedCart
  }, 'Coupon applied successfully');
});

// @desc    Remove coupon from cart
// @route   DELETE /api/ecommerce/cart/coupons/:code
// @access  Private (Customer)
export const removeCoupon = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findByCustomer(req.user.id);

  if (!cart) {
    return sendError(res, 'Cart not found', 404);
  }

  await cart.removeCoupon(req.params.code);

  const updatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price')
    .populate('items.seller', 'name');

  sendSuccess(res, {
    cart: updatedCart
  }, 'Coupon removed successfully');
});

// @desc    Calculate shipping for cart
// @route   POST /api/ecommerce/cart/shipping
// @access  Private (Customer)
export const calculateShipping = asyncHandler(async (req, res, next) => {
  const { method, address } = req.body;

  const cart = await Cart.findByCustomer(req.user.id);

  if (!cart) {
    return sendError(res, 'Cart not found', 404);
  }

  if (cart.isEmpty) {
    return sendError(res, 'Cannot calculate shipping for empty cart', 400);
  }

  // Calculate shipping based on method and address
  await cart.calculateShipping(method);

  // TODO: Integrate with shipping providers for accurate rates
  // For now, using simple calculation

  const updatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price')
    .populate('items.seller', 'name');

  sendSuccess(res, {
    cart: updatedCart,
    shipping: {
      method: cart.shipping.method,
      cost: cart.shipping.cost,
      estimatedDelivery: cart.shipping.estimatedDelivery
    }
  }, 'Shipping calculated successfully');
});

// @desc    Get cart summary
// @route   GET /api/ecommerce/cart/summary
// @access  Private (Customer)
export const getCartSummary = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findByCustomer(req.user.id);

  if (!cart) {
    return sendError(res, 'Cart not found', 404);
  }

  // Validate items
  await cart.validateItems();

  const summary = {
    totalItems: cart.totalItems,
    subtotal: cart.totals.subtotal,
    tax: cart.totals.tax,
    shipping: cart.totals.shipping,
    discount: cart.totals.discount,
    total: cart.totals.total,
    currency: cart.currency,
    hasUnavailableItems: cart.hasUnavailableItems,
    isMultiVendor: cart.isMultiVendor,
    uniqueSellers: cart.uniqueSellers.length,
    appliedCoupons: cart.coupons.map(c => ({
      code: c.code,
      discount: c.discount,
      type: c.type
    }))
  };

  sendSuccess(res, {
    summary
  }, 'Cart summary retrieved successfully');
});

// @desc    Validate cart items
// @route   POST /api/ecommerce/cart/validate
// @access  Private (Customer)
export const validateCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findByCustomer(req.user.id);

  if (!cart) {
    return sendError(res, 'Cart not found', 404);
  }

  await cart.validateItems();

  const validation = {
    isValid: !cart.hasUnavailableItems,
    availableItems: cart.availableItems.length,
    unavailableItems: cart.unavailableItems.length,
    issues: cart.unavailableItems.map(item => ({
      productId: item.product,
      name: item.name,
      issue: item.availabilityMessage
    }))
  };

  sendSuccess(res, {
    validation,
    cart: {
      id: cart._id,
      items: cart.items,
      totals: cart.totals
    }
  }, 'Cart validation completed');
});

// @desc    Get abandoned carts (Admin only)
// @route   GET /api/ecommerce/carts/abandoned
// @access  Private (Admin)
export const getAbandonedCarts = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return sendError(res, 'Only admins can view abandoned carts', 403);
  }

  const hoursAgo = parseInt(req.query.hours) || 24;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const abandonedCarts = await Cart.getAbandonedCarts(hoursAgo);
  
  const paginatedCarts = abandonedCarts.slice(skip, skip + limit);

  sendSuccess(res, {
    carts: paginatedCarts,
    pagination: {
      page,
      limit,
      total: abandonedCarts.length,
      pages: Math.ceil(abandonedCarts.length / limit)
    },
    hoursAgo
  }, 'Abandoned carts retrieved successfully');
});

// @desc    Cleanup expired carts (Admin only)
// @route   DELETE /api/ecommerce/carts/cleanup
// @access  Private (Admin)
export const cleanupExpiredCarts = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'admin') {
    return sendError(res, 'Only admins can cleanup expired carts', 403);
  }

  const result = await Cart.cleanupExpiredCarts();

  sendSuccess(res, {
    deletedCount: result.deletedCount
  }, 'Expired carts cleaned up successfully');
});

