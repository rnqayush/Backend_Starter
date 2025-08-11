const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: String,
    image: String,
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    level: {
      type: Number,
      default: 0,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Indexes
categorySchema.index({ business: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ level: 1 });

// Virtual for subcategories
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

// Virtual for products count
categorySchema.virtual('productsCount', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

// Generate slug before saving
categorySchema.pre('save', async function (next) {
  if (!this.isModified('name')) return next();

  const baseSlug = slugify(this.name, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (
    await this.constructor.findOne({
      business: this.business,
      slug,
      _id: { $ne: this._id },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  this.slug = slug;
  next();
});

// Set level based on parent
categorySchema.pre('save', async function (next) {
  if (this.parent) {
    const parent = await this.constructor.findById(this.parent);
    this.level = parent ? parent.level + 1 : 0;
  } else {
    this.level = 0;
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);

// Vehicle Category Schema
const vehicleCategorySchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: String,
    image: String,
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

vehicleCategorySchema.index({ business: 1 });
vehicleCategorySchema.index({ slug: 1 });

vehicleCategorySchema.pre('save', async function (next) {
  if (!this.isModified('name')) return next();

  const baseSlug = slugify(this.name, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;

  while (
    await this.constructor.findOne({
      business: this.business,
      slug,
      _id: { $ne: this._id },
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  this.slug = slug;
  next();
});

const VehicleCategory = mongoose.model(
  'VehicleCategory',
  vehicleCategorySchema
);

module.exports.VehicleCategory = VehicleCategory;
