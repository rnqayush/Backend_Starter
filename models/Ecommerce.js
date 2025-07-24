import mongoose from 'mongoose';

const ecommerceSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [3000, 'Description cannot exceed 3000 characters'],
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: [
      'electronics', 'clothing', 'home_garden', 'sports', 'books',
      'beauty', 'toys', 'automotive', 'health', 'jewelry', 'food'
    ],
  },
  subcategory: {
    type: String,
    maxlength: [100, 'Subcategory cannot exceed 100 characters'],
  },
  brand: {
    type: String,
    maxlength: [100, 'Brand name cannot exceed 100 characters'],
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
  },
  pricing: {
    basePrice: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
    taxRate: { type: Number, default: 0, min: 0, max: 1 },
  },
  inventory: {
    quantity: { type: Number, required: true, min: 0 },
    lowStockThreshold: { type: Number, default: 10 },
    trackInventory: { type: Boolean, default: true },
  },
  specifications: [{
    name: { type: String, required: true },
    value: { type: String, required: true },
  }],
  images: [{
    url: { type: String, required: true },
    alt: String,
    isPrimary: { type: Boolean, default: false },
  }],
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number,
    unit: { type: String, enum: ['cm', 'inch'], default: 'cm' },
    weightUnit: { type: String, enum: ['kg', 'lb'], default: 'kg' },
  },
  shipping: {
    freeShipping: { type: Boolean, default: false },
    shippingCost: { type: Number, default: 0 },
    processingTime: { type: String, default: '1-2 business days' },
    shippingMethods: [{
      name: String,
      cost: Number,
      estimatedDays: String,
    }],
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'out_of_stock'],
    default: 'draft',
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  tags: [String],
  isDeleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

// Indexes
ecommerceSchema.index({ vendorId: 1 });
ecommerceSchema.index({ category: 1 });
ecommerceSchema.index({ sku: 1 });
ecommerceSchema.index({ 'pricing.basePrice': 1 });
ecommerceSchema.index({ 'rating.average': -1 });
ecommerceSchema.index({ status: 1 });
ecommerceSchema.index({ tags: 1 });
ecommerceSchema.index({ isDeleted: 1 });
ecommerceSchema.index({ 'seo.slug': 1 });

// Virtual for current price (sale price if available, otherwise base price)
ecommerceSchema.virtual('currentPrice').get(function() {
  return this.pricing.salePrice || this.pricing.basePrice;
});

// Virtual for discount percentage
ecommerceSchema.virtual('discountPercentage').get(function() {
  if (this.pricing.salePrice && this.pricing.salePrice < this.pricing.basePrice) {
    return Math.round(((this.pricing.basePrice - this.pricing.salePrice) / this.pricing.basePrice) * 100);
  }
  return 0;
});

// Virtual for stock status
ecommerceSchema.virtual('stockStatus').get(function() {
  if (!this.inventory.trackInventory) return 'in_stock';
  if (this.inventory.quantity === 0) return 'out_of_stock';
  if (this.inventory.quantity <= this.inventory.lowStockThreshold) return 'low_stock';
  return 'in_stock';
});

// Pre-save middleware to generate slug
ecommerceSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.seo.slug) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Pre-find middleware to exclude deleted products
ecommerceSchema.pre(/^find/, function(next) {
  if (!this.getQuery().hasOwnProperty('isDeleted')) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

// Method to soft delete
ecommerceSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.status = 'inactive';
  return this.save();
};

// Method to update inventory
ecommerceSchema.methods.updateInventory = function(quantity) {
  this.inventory.quantity = Math.max(0, this.inventory.quantity + quantity);
  if (this.inventory.quantity === 0) {
    this.status = 'out_of_stock';
  } else if (this.status === 'out_of_stock') {
    this.status = 'active';
  }
  return this.save();
};

const Ecommerce = mongoose.model('Ecommerce', ecommerceSchema);

export default Ecommerce;

