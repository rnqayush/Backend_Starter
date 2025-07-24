import mongoose from 'mongoose';

const businessSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  businessName: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true,
    maxlength: [200, 'Business name cannot exceed 200 characters'],
  },
  // Hero Section
  heroSection: {
    title: {
      type: String,
      required: [true, 'Hero title is required'],
      maxlength: [100, 'Hero title cannot exceed 100 characters'],
    },
    subtitle: {
      type: String,
      maxlength: [200, 'Hero subtitle cannot exceed 200 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Hero description cannot exceed 500 characters'],
    },
    backgroundImage: {
      url: String,
      alt: String,
    },
    ctaButton: {
      text: String,
      link: String,
      isExternal: { type: Boolean, default: false },
    },
  },
  // About Section
  aboutSection: {
    title: {
      type: String,
      default: 'About Us',
      maxlength: [100, 'About title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'About description is required'],
      maxlength: [2000, 'About description cannot exceed 2000 characters'],
    },
    mission: {
      type: String,
      maxlength: [500, 'Mission cannot exceed 500 characters'],
    },
    vision: {
      type: String,
      maxlength: [500, 'Vision cannot exceed 500 characters'],
    },
    values: [String],
    images: [{
      url: { type: String, required: true },
      alt: String,
      caption: String,
    }],
    stats: [{
      label: String,
      value: String,
      icon: String,
    }],
  },
  // Services Section
  servicesSection: {
    title: {
      type: String,
      default: 'Our Services',
      maxlength: [100, 'Services title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Services description cannot exceed 500 characters'],
    },
    services: [{
      name: {
        type: String,
        required: true,
        maxlength: [100, 'Service name cannot exceed 100 characters'],
      },
      description: {
        type: String,
        required: true,
        maxlength: [500, 'Service description cannot exceed 500 characters'],
      },
      icon: String,
      image: {
        url: String,
        alt: String,
      },
      features: [String],
      price: {
        amount: Number,
        currency: { type: String, default: 'USD' },
        period: String, // e.g., 'per hour', 'per project'
      },
      isActive: { type: Boolean, default: true },
    }],
  },
  // Team Section
  teamSection: {
    title: {
      type: String,
      default: 'Our Team',
      maxlength: [100, 'Team title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Team description cannot exceed 500 characters'],
    },
    members: [{
      name: {
        type: String,
        required: true,
        maxlength: [100, 'Member name cannot exceed 100 characters'],
      },
      position: {
        type: String,
        required: true,
        maxlength: [100, 'Position cannot exceed 100 characters'],
      },
      bio: {
        type: String,
        maxlength: [500, 'Bio cannot exceed 500 characters'],
      },
      image: {
        url: String,
        alt: String,
      },
      socialLinks: {
        linkedin: String,
        twitter: String,
        facebook: String,
        instagram: String,
        website: String,
      },
      skills: [String],
      isActive: { type: Boolean, default: true },
    }],
  },
  // Contact Section
  contactSection: {
    title: {
      type: String,
      default: 'Contact Us',
      maxlength: [100, 'Contact title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Contact description cannot exceed 500 characters'],
    },
    address: {
      street: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: String,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
    phone: {
      primary: String,
      secondary: String,
    },
    email: {
      primary: { type: String, required: true },
      secondary: String,
    },
    workingHours: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      },
      openTime: String,
      closeTime: String,
      isClosed: { type: Boolean, default: false },
    }],
    socialLinks: {
      facebook: String,
      twitter: String,
      linkedin: String,
      instagram: String,
      youtube: String,
      website: String,
    },
  },
  // Gallery Section
  gallerySection: {
    title: {
      type: String,
      default: 'Gallery',
      maxlength: [100, 'Gallery title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Gallery description cannot exceed 500 characters'],
    },
    categories: [{
      name: String,
      slug: String,
    }],
    images: [{
      url: { type: String, required: true },
      alt: String,
      caption: String,
      category: String,
      isPrimary: { type: Boolean, default: false },
      order: { type: Number, default: 0 },
    }],
    videos: [{
      url: String,
      thumbnail: String,
      title: String,
      description: String,
      category: String,
      duration: String,
    }],
  },
  // SEO and Meta
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    ogImage: String,
  },
  // Website Settings
  settings: {
    theme: {
      primaryColor: { type: String, default: '#007bff' },
      secondaryColor: { type: String, default: '#6c757d' },
      accentColor: { type: String, default: '#28a745' },
      fontFamily: { type: String, default: 'Arial, sans-serif' },
    },
    layout: {
      headerStyle: { type: String, default: 'default' },
      footerStyle: { type: String, default: 'default' },
      sectionOrder: [String], // Order of sections on the page
    },
    features: {
      showTestimonials: { type: Boolean, default: true },
      showBlog: { type: Boolean, default: false },
      showChat: { type: Boolean, default: false },
      showBooking: { type: Boolean, default: false },
    },
  },
  // Status and Visibility
  isActive: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  publishedAt: Date,
}, {
  timestamps: true,
});

// Indexes
businessSchema.index({ vendorId: 1 });
businessSchema.index({ businessName: 1 });
businessSchema.index({ 'contactSection.address.city': 1 });
businessSchema.index({ 'contactSection.address.state': 1 });
businessSchema.index({ isActive: 1 });
businessSchema.index({ isPublished: 1 });
businessSchema.index({ isDeleted: 1 });

// Virtual for full address
businessSchema.virtual('fullAddress').get(function() {
  const addr = this.contactSection.address;
  if (!addr) return '';
  return `${addr.street ? addr.street + ', ' : ''}${addr.city}, ${addr.state} ${addr.zipCode || ''}, ${addr.country}`.trim();
});

// Pre-find middleware to exclude deleted businesses
businessSchema.pre(/^find/, function(next) {
  if (!this.getQuery().hasOwnProperty('isDeleted')) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

// Method to soft delete
businessSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.isActive = false;
  this.isPublished = false;
  return this.save();
};

// Method to publish/unpublish
businessSchema.methods.togglePublish = function() {
  this.isPublished = !this.isPublished;
  if (this.isPublished) {
    this.publishedAt = new Date();
  }
  return this.save();
};

const Business = mongoose.model('Business', businessSchema);

export default Business;
