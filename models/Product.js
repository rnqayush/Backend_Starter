const mongoose = require('mongoose');
const slugify = require('slugify');

const variantSchema = new mongoose.Schema({
  name: String,
  value: String,
  price: Number,
  sku: String,
  inventory: {
    quantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
  },
});

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: String,
    comment: String,
    images: [String],
    helpful: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    shortDescription: {
      type: String,
      maxlength: [500, 'Short description cannot exceed 500 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    subcategory: String,
    brand: String,
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    pricing: {
      price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative'],
      },
      originalPrice: Number,
      onSale: { type: Boolean, default: false },
      salePrice: Number,
      currency: { type: String, default: 'USD' },
    },
    inventory: {
      quantity: { type: Number, default: 0 },
      lowStockThreshold: { type: Number, default: 5 },
      trackQuantity: { type: Boolean, default: true },
      allowBackorder: { type: Boolean, default: false },
    },
    availability: {
      status: {
        type: String,
        enum: ['in_stock', 'out_of_stock', 'limited_stock', 'pre_order'],
        default: 'in_stock',
      },
      availableFrom: Date,
      availableUntil: Date,
    },
    images: {
      main: String,
      gallery: [String],
      thumbnail: String,
    },
    specifications: {
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
        weight: Number,
        unit: { type: String, default: 'cm' },
      },
      features: [String],
      materials: [String],
      colors: [String],
      sizes: [String],
    },
    variants: [variantSchema],
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
    shipping: {
      weight: Number,
      dimensions: {
        length: Number,
        width: Number,
        height: Number,
      },
      shippingClass: String,
      freeShipping: { type: Boolean, default: false },
    },
    tags: [String],
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    reviews: [reviewSchema],
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    salesCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
productSchema.index({ business: 1 });
productSchema.index({ category: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ 'pricing.price': 1 });
productSchema.index({ featured: 1 });
productSchema.index({ status: 1 });
productSchema.index({ tags: 1 });

// Pre-save middleware to generate slug
productSchema.pre('save', async function (next) {
  if (!this.isModified('name')) return next();

  const baseSlug = slugify(this.name, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  this.slug = slug;
  next();
});

// Update availability status based on quantity
productSchema.pre('save', function (next) {
  if (this.inventory.trackQuantity) {
    if (this.inventory.quantity <= 0) {
      this.availability.status = 'out_of_stock';
    } else if (this.inventory.quantity <= this.inventory.lowStockThreshold) {
      this.availability.status = 'limited_stock';
    } else {
      this.availability.status = 'in_stock';
    }
  }
  next();
});

// Method to increment view count
productSchema.methods.incrementViews = function () {
  this.viewCount += 1;
  return this.save();
};

// Method to calculate rating
productSchema.methods.calculateRating = function () {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
    return;
  }

  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  this.rating.average = Math.round((sum / this.reviews.length) * 10) / 10;
  this.rating.count = this.reviews.length;
};

module.exports = mongoose.model('Product', productSchema);
