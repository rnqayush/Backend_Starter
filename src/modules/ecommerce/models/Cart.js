const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  selectedVariants: [{
    name: String,
    value: String,
    price: Number
  }],
  priceAtTime: {
    type: Number,
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  sessionId: {
    type: String,
    sparse: true // For guest users
  },
  status: {
    type: String,
    enum: ['active', 'abandoned', 'converted'],
    default: 'active'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
cartSchema.index({ user: 1, status: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for total items count
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for subtotal
cartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => {
    const variantPrice = item.selectedVariants.reduce((sum, variant) => sum + (variant.price || 0), 0);
    return total + ((item.priceAtTime + variantPrice) * item.quantity);
  }, 0);
});

// Virtual for total (including tax, shipping, etc.)
cartSchema.virtual('total').get(function() {
  // For now, just return subtotal. Can be extended to include tax, shipping, discounts
  return this.subtotal;
});

// Method to add item to cart
cartSchema.methods.addItem = function(productId, quantity = 1, selectedVariants = [], priceAtTime) {
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
  );

  if (existingItemIndex > -1) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    this.items.push({
      product: productId,
      quantity,
      selectedVariants,
      priceAtTime
    });
  }

  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.id(itemId);
  if (item) {
    if (quantity <= 0) {
      this.items.pull(itemId);
    } else {
      item.quantity = quantity;
    }
  }
  return this.save();
};

// Method to remove item
cartSchema.methods.removeItem = function(itemId) {
  this.items.pull(itemId);
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  return this.save();
};

// Static method to find or create cart
cartSchema.statics.findOrCreateCart = async function(userId, sessionId = null) {
  let cart = await this.findOne({ 
    $or: [
      { user: userId },
      ...(sessionId ? [{ sessionId }] : [])
    ],
    status: 'active'
  }).populate('items.product');

  if (!cart) {
    cart = new this({
      user: userId,
      sessionId,
      items: []
    });
    await cart.save();
  }

  return cart;
};

// Method to merge guest cart with user cart
cartSchema.statics.mergeGuestCart = async function(userId, sessionId) {
  const guestCart = await this.findOne({ sessionId, status: 'active' });
  const userCart = await this.findOne({ user: userId, status: 'active' });

  if (!guestCart) return userCart;

  if (!userCart) {
    // Convert guest cart to user cart
    guestCart.user = userId;
    guestCart.sessionId = undefined;
    return await guestCart.save();
  }

  // Merge guest cart items into user cart
  for (const guestItem of guestCart.items) {
    await userCart.addItem(
      guestItem.product,
      guestItem.quantity,
      guestItem.selectedVariants,
      guestItem.priceAtTime
    );
  }

  // Mark guest cart as converted
  guestCart.status = 'converted';
  await guestCart.save();

  return userCart;
};

module.exports = mongoose.model('Cart', cartSchema);

