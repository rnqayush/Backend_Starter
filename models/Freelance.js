import mongoose from 'mongoose';

const freelanceSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  // Personal Information
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    title: {
      type: String,
      required: [true, 'Professional title is required'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    tagline: {
      type: String,
      maxlength: [200, 'Tagline cannot exceed 200 characters'],
    },
    profileImage: {
      url: String,
      alt: String,
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
      maxlength: [2000, 'Bio cannot exceed 2000 characters'],
    },
  },
  // Business Contents (inherited from Business model)
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
  aboutSection: {
    title: {
      type: String,
      default: 'About Me',
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
  servicesSection: {
    title: {
      type: String,
      default: 'My Services',
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
      deliveryTime: String, // e.g., '3-5 days', '1 week'
      isActive: { type: Boolean, default: true },
    }],
  },
  contactSection: {
    title: {
      type: String,
      default: 'Contact Me',
      maxlength: [100, 'Contact title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Contact description cannot exceed 500 characters'],
    },
    address: {
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      timezone: String,
    },
    phone: {
      primary: String,
      whatsapp: String,
    },
    email: {
      primary: { type: String, required: true },
      business: String,
    },
    availability: {
      hoursPerWeek: Number,
      timezone: String,
      workingDays: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      }],
      preferredContactMethod: {
        type: String,
        enum: ['email', 'phone', 'whatsapp', 'video_call'],
        default: 'email',
      },
    },
    socialLinks: {
      linkedin: String,
      github: String,
      behance: String,
      dribbble: String,
      twitter: String,
      instagram: String,
      website: String,
    },
  },
  gallerySection: {
    title: {
      type: String,
      default: 'My Work',
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
  // Skills and Experience (Freelance-specific)
  skillsSection: {
    title: {
      type: String,
      default: 'Skills & Expertise',
      maxlength: [100, 'Skills title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Skills description cannot exceed 500 characters'],
    },
    categories: [{
      name: {
        type: String,
        required: true,
        maxlength: [100, 'Category name cannot exceed 100 characters'],
      },
      skills: [{
        name: {
          type: String,
          required: true,
          maxlength: [50, 'Skill name cannot exceed 50 characters'],
        },
        level: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced', 'expert'],
          default: 'intermediate',
        },
        yearsOfExperience: Number,
        certifications: [{
          name: String,
          issuedBy: String,
          issuedDate: Date,
          expiryDate: Date,
          credentialUrl: String,
        }],
      }],
    }],
    languages: [{
      name: {
        type: String,
        required: true,
      },
      proficiency: {
        type: String,
        enum: ['basic', 'conversational', 'fluent', 'native'],
        default: 'conversational',
      },
    }],
    tools: [{
      name: String,
      category: String, // e.g., 'design', 'development', 'project-management'
      proficiency: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate',
      },
      icon: String,
    }],
  },
  experienceSection: {
    title: {
      type: String,
      default: 'Experience',
      maxlength: [100, 'Experience title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Experience description cannot exceed 500 characters'],
    },
    workExperience: [{
      jobTitle: {
        type: String,
        required: true,
        maxlength: [100, 'Job title cannot exceed 100 characters'],
      },
      company: {
        type: String,
        required: true,
        maxlength: [100, 'Company name cannot exceed 100 characters'],
      },
      location: String,
      employmentType: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
        default: 'full-time',
      },
      startDate: {
        type: Date,
        required: true,
      },
      endDate: Date, // null if current job
      isCurrent: { type: Boolean, default: false },
      description: {
        type: String,
        maxlength: [1000, 'Job description cannot exceed 1000 characters'],
      },
      achievements: [String],
      technologies: [String],
    }],
    education: [{
      degree: {
        type: String,
        required: true,
        maxlength: [100, 'Degree cannot exceed 100 characters'],
      },
      institution: {
        type: String,
        required: true,
        maxlength: [100, 'Institution cannot exceed 100 characters'],
      },
      location: String,
      startDate: Date,
      endDate: Date,
      gpa: String,
      description: String,
      achievements: [String],
    }],
    certifications: [{
      name: {
        type: String,
        required: true,
        maxlength: [100, 'Certification name cannot exceed 100 characters'],
      },
      issuedBy: {
        type: String,
        required: true,
        maxlength: [100, 'Issuer cannot exceed 100 characters'],
      },
      issuedDate: Date,
      expiryDate: Date,
      credentialId: String,
      credentialUrl: String,
      skills: [String],
    }],
  },
  // Portfolio Management (Freelance-specific)
  portfolioSection: {
    title: {
      type: String,
      default: 'Portfolio',
      maxlength: [100, 'Portfolio title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      maxlength: [500, 'Portfolio description cannot exceed 500 characters'],
    },
    projects: [{
      title: {
        type: String,
        required: true,
        maxlength: [100, 'Project title cannot exceed 100 characters'],
      },
      description: {
        type: String,
        required: true,
        maxlength: [1000, 'Project description cannot exceed 1000 characters'],
      },
      category: String,
      tags: [String],
      technologies: [String],
      images: [{
        url: { type: String, required: true },
        alt: String,
        caption: String,
        isPrimary: { type: Boolean, default: false },
      }],
      videos: [{
        url: String,
        thumbnail: String,
        title: String,
      }],
      links: {
        live: String,
        github: String,
        demo: String,
        case_study: String,
      },
      client: {
        name: String,
        industry: String,
        testimonial: String,
      },
      duration: String, // e.g., '2 months', '6 weeks'
      completedDate: Date,
      featured: { type: Boolean, default: false },
      order: { type: Number, default: 0 },
      isActive: { type: Boolean, default: true },
    }],
    testimonials: [{
      clientName: {
        type: String,
        required: true,
        maxlength: [100, 'Client name cannot exceed 100 characters'],
      },
      clientTitle: String,
      clientCompany: String,
      clientImage: String,
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5,
      },
      testimonial: {
        type: String,
        required: true,
        maxlength: [1000, 'Testimonial cannot exceed 1000 characters'],
      },
      projectTitle: String,
      date: { type: Date, default: Date.now },
      featured: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
    }],
  },
  // Pricing and Packages
  pricing: {
    hourlyRate: {
      amount: Number,
      currency: { type: String, default: 'USD' },
    },
    packages: [{
      name: {
        type: String,
        required: true,
        maxlength: [100, 'Package name cannot exceed 100 characters'],
      },
      description: {
        type: String,
        required: true,
        maxlength: [500, 'Package description cannot exceed 500 characters'],
      },
      price: {
        amount: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
      },
      deliveryTime: String,
      revisions: Number,
      features: [String],
      isPopular: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
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
      showChat: { type: Boolean, default: true },
      showBooking: { type: Boolean, default: true },
      showPricing: { type: Boolean, default: true },
    },
  },
  // Status and Visibility
  isActive: { type: Boolean, default: true },
  isPublished: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  publishedAt: Date,
  // Freelance-specific fields
  availability: {
    status: {
      type: String,
      enum: ['available', 'busy', 'unavailable'],
      default: 'available',
    },
    nextAvailableDate: Date,
    responseTime: String, // e.g., 'within 24 hours'
  },
}, {
  timestamps: true,
});

// Indexes
freelanceSchema.index({ vendorId: 1 });
freelanceSchema.index({ 'personalInfo.firstName': 1 });
freelanceSchema.index({ 'personalInfo.lastName': 1 });
freelanceSchema.index({ 'personalInfo.title': 1 });
freelanceSchema.index({ 'contactSection.address.city': 1 });
freelanceSchema.index({ 'contactSection.address.state': 1 });
freelanceSchema.index({ 'skillsSection.categories.skills.name': 1 });
freelanceSchema.index({ isActive: 1 });
freelanceSchema.index({ isPublished: 1 });
freelanceSchema.index({ isDeleted: 1 });
freelanceSchema.index({ 'availability.status': 1 });

// Virtual for full name
freelanceSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Virtual for full address
freelanceSchema.virtual('fullAddress').get(function() {
  const addr = this.contactSection.address;
  if (!addr) return '';
  return `${addr.city}, ${addr.state}, ${addr.country}`.trim();
});

// Pre-find middleware to exclude deleted freelancers
freelanceSchema.pre(/^find/, function(next) {
  if (!this.getQuery().hasOwnProperty('isDeleted')) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

// Method to soft delete
freelanceSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.isActive = false;
  this.isPublished = false;
  return this.save();
};

// Method to publish/unpublish
freelanceSchema.methods.togglePublish = function() {
  this.isPublished = !this.isPublished;
  if (this.isPublished) {
    this.publishedAt = new Date();
  }
  return this.save();
};

// Method to update availability status
freelanceSchema.methods.updateAvailability = function(status, nextAvailableDate = null) {
  this.availability.status = status;
  if (nextAvailableDate) {
    this.availability.nextAvailableDate = nextAvailableDate;
  }
  return this.save();
};

const Freelance = mongoose.model('Freelance', freelanceSchema);

export default Freelance;
