const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.sessionID || req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or session ID required'
      });
    }

    const cart = await Cart.findOrCreateCart(userId, sessionId);
    await cart.populate('items.product', 'name slug price images inventory status');

    // Filter out inactive products
    cart.items = cart.items.filter(item => 
      item.product && item.product.status === 'active'
    );

    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, selectedVariants = [] } = req.body;
    const userId = req.user?.id;
    const sessionId = req.sessionID || req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or session ID required'
      });
    }

    // Validate product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Product is not available'
      });
    }

    // Check inventory
    if (product.inventory.trackQuantity && product.inventory.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient inventory',
        availableQuantity: product.inventory.quantity
      });
    }

    // Calculate price including variants
    let priceAtTime = product.currentPrice;
    if (selectedVariants && selectedVariants.length > 0) {
      const variantPrice = selectedVariants.reduce((sum, variant) => {
        return sum + (variant.price || 0);
      }, 0);
      priceAtTime += variantPrice;
    }

    // Get or create cart
    const cart = await Cart.findOrCreateCart(userId, sessionId);

    // Add item to cart
    await cart.addItem(productId, quantity, selectedVariants, priceAtTime);
    await cart.populate('items.product', 'name slug price images inventory status');

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding item to cart',
      error: error.message
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const userId = req.user?.id;
    const sessionId = req.sessionID || req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or session ID required'
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be non-negative'
      });
    }

    // Find cart
    const cart = await Cart.findOne({
      $or: [
        ...(userId ? [{ user: userId }] : []),
        ...(sessionId ? [{ sessionId }] : [])
      ],
      status: 'active'
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Find the item
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    // Check inventory if increasing quantity
    if (quantity > item.quantity) {
      const product = await Product.findById(item.product);
      if (product && product.inventory.trackQuantity) {
        const additionalQuantity = quantity - item.quantity;
        if (product.inventory.quantity < additionalQuantity) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient inventory',
            availableQuantity: product.inventory.quantity + item.quantity
          });
        }
      }
    }

    // Update item quantity
    await cart.updateItemQuantity(itemId, quantity);
    await cart.populate('items.product', 'name slug price images inventory status');

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: cart
    });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating cart item',
      error: error.message
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?.id;
    const sessionId = req.sessionID || req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or session ID required'
      });
    }

    // Find cart
    const cart = await Cart.findOne({
      $or: [
        ...(userId ? [{ user: userId }] : []),
        ...(sessionId ? [{ sessionId }] : [])
      ],
      status: 'active'
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Remove item
    await cart.removeItem(itemId);
    await cart.populate('items.product', 'name slug price images inventory status');

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing item from cart',
      error: error.message
    });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.sessionID || req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'User ID or session ID required'
      });
    }

    // Find cart
    const cart = await Cart.findOne({
      $or: [
        ...(userId ? [{ user: userId }] : []),
        ...(sessionId ? [{ sessionId }] : [])
      ],
      status: 'active'
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    // Clear cart
    await cart.clearCart();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message
    });
  }
};

// Merge guest cart with user cart (called during login)
const mergeCart = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID required'
      });
    }

    const cart = await Cart.mergeGuestCart(userId, sessionId);
    await cart.populate('items.product', 'name slug price images inventory status');

    res.json({
      success: true,
      message: 'Cart merged successfully',
      data: cart
    });
  } catch (error) {
    console.error('Merge cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error merging cart',
      error: error.message
    });
  }
};

// Get cart summary (item count and total)
const getCartSummary = async (req, res) => {
  try {
    const userId = req.user?.id;
    const sessionId = req.sessionID || req.headers['x-session-id'];

    if (!userId && !sessionId) {
      return res.json({
        success: true,
        data: {
          itemCount: 0,
          subtotal: 0,
          total: 0
        }
      });
    }

    const cart = await Cart.findOne({
      $or: [
        ...(userId ? [{ user: userId }] : []),
        ...(sessionId ? [{ sessionId }] : [])
      ],
      status: 'active'
    });

    if (!cart) {
      return res.json({
        success: true,
        data: {
          itemCount: 0,
          subtotal: 0,
          total: 0
        }
      });
    }

    res.json({
      success: true,
      data: {
        itemCount: cart.totalItems,
        subtotal: cart.subtotal,
        total: cart.total
      }
    });
  } catch (error) {
    console.error('Get cart summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cart summary',
      error: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  mergeCart,
  getCartSummary
};

