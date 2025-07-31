const mongoose = require('mongoose');

/**
 * Wedding Event Model
 * Represents wedding events and their details
 */
const weddingEventSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Event title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // References
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: [true, 'Website reference is required'],
    index: true
  },
  
  // Couple Information
  couple: {
    bride: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      email: { type: String, lowercase: true },
      phone: { type: String }
    },
    groom: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      email: { type: String, lowercase: true },
      phone: { type: String }
    },
    relationshipStart: { type: Date },
    engagementDate: { type: Date },
    story: { type: String, maxlength: 1000 }
  },
  
  // Event Details
  eventDetails: {
    weddingDate: {
      type: Date,
      required: [true, 'Wedding date is required'],
      index: true
    },
    weddingTime: { type: String }, // e.g., '15:00'
    estimatedDuration: { type: Number }, // in hours
    guestCount: {
      type: Number,
      required: [true, 'Guest count is required'],
      min: [1, 'Guest count must be at least 1']
    },
    estimatedBudget: {
      amount: { type: Number, min: 0 },
      currency: { type: String, default: 'USD' }
    },
    theme: { type: String },
    colors: [{ type: String }],
    style: {
      type: String,
      enum: ['traditional', 'modern', 'rustic', 'vintage', 'bohemian', 'classic', 'destination', 'other']
    }
  },
  
  // Venues
  venues: [{
    type: {
      type: String,
      enum: ['ceremony', 'reception', 'both'],
      required: true
    },
    name: { type: String, required: true },
    address: {
      street: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
      zipCode: { type: String }
    },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    },
    capacity: { type: Number },
    contact: {
      name: { type: String },
      phone: { type: String },
      email: { type: String }
    },
    cost: { type: Number, min: 0 },
    notes: { type: String }
  }],
  
  // Vendors
  vendors: [{
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WeddingVendor',
      required: true
    },
    category: { type: String, required: true },
    services: [{ type: String }],
    package: { type: String },
    cost: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ['inquired', 'quoted', 'booked', 'confirmed', 'completed', 'cancelled'],
      default: 'inquired'
    },
    contractSigned: { type: Boolean, default: false },
    depositPaid: { type: Boolean, default: false },
    finalPayment: { type: Boolean, default: false },
    notes: { type: String }
  }],
  
  // Budget Breakdown
  budget: {
    total: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    remaining: { type: Number, default: 0 },
    categories: [{
      name: { type: String, required: true },
      budgeted: { type: Number, required: true, min: 0 },
      spent: { type: Number, default: 0, min: 0 },
      percentage: { type: Number, min: 0, max: 100 }
    }],
    currency: { type: String, default: 'USD' }
  },
  
  // Guest Management
  guestList: [{
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String }
    },
    relationship: { type: String },
    side: { type: String, enum: ['bride', 'groom', 'both'] },
    category: { type: String, enum: ['family', 'friend', 'colleague', 'other'] },
    invitationSent: { type: Boolean, default: false },
    rsvpStatus: { type: String, enum: ['pending', 'attending', 'not-attending', 'maybe'] },
    rsvpDate: { type: Date },
    plusOne: { type: Boolean, default: false },
    dietaryRestrictions: { type: String },
    notes: { type: String }
  }],
  
  // Timeline and Schedule
  timeline: [{
    time: { type: String, required: true }, // e.g., '14:00'
    event: { type: String, required: true },
    duration: { type: Number }, // in minutes
    location: { type: String },
    responsible: { type: String }, // vendor or person responsible
    notes: { type: String },
    completed: { type: Boolean, default: false }
  }],
  
  // Tasks and Checklist
  tasks: [{
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    dueDate: { type: Date },
    assignedTo: { type: String },
    status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
    completedDate: { type: Date },
    notes: { type: String }
  }],
  
  // Documents and Contracts
  documents: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['contract', 'invoice', 'receipt', 'permit', 'insurance', 'other'] },
    url: { type: String, required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'WeddingVendor' },
    uploadDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    notes: { type: String }
  }],
  
  // Photos and Media
  media: {
    engagementPhotos: [{
      url: { type: String, required: true },
      alt: { type: String },
      photographer: { type: String }
    }],
    weddingPhotos: [{
      url: { type: String, required: true },
      alt: { type: String },
      category: { type: String, enum: ['ceremony', 'reception', 'portraits', 'details', 'candid'] },
      photographer: { type: String }
    }],
    videos: [{
      url: { type: String, required: true },
      title: { type: String },
      type: { type: String, enum: ['ceremony', 'reception', 'highlights', 'full-event'] },
      videographer: { type: String }
    }]
  },
  
  // Communication Log
  communications: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['email', 'phone', 'meeting', 'text'], required: true },
    with: { type: String, required: true }, // vendor name or contact
    subject: { type: String },
    notes: { type: String, required: true },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date }
  }],
  
  // Status and Progress
  status: {
    type: String,
    enum: ['planning', 'confirmed', 'in-progress', 'completed', 'cancelled', 'postponed'],
    default: 'planning',
    index: true
  },
  progress: {
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    milestones: [{
      name: { type: String, required: true },
      completed: { type: Boolean, default: false },
      completedDate: { type: Date }
    }]
  },
  
  // Special Requirements
  specialRequirements: {
    accessibility: { type: String },
    dietary: [{ type: String }],
    religious: { type: String },
    cultural: { type: String },
    other: { type: String }
  },
  
  // Weather and Backup Plans
  weatherPlan: {
    outdoorCeremony: { type: Boolean, default: false },
    backupVenue: { type: String },
    weatherContingency: { type: String }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
weddingEventSchema.index({ website: 1, status: 1 });
weddingEventSchema.index({ 'eventDetails.weddingDate': 1 });
weddingEventSchema.index({ 'couple.bride.email': 1 });
weddingEventSchema.index({ 'couple.groom.email': 1 });
weddingEventSchema.index({ createdAt: -1 });

// Virtual for couple names
weddingEventSchema.virtual('coupleNames').get(function() {
  return `${this.couple.bride.firstName} & ${this.couple.groom.firstName}`;
});

// Virtual for days until wedding
weddingEventSchema.virtual('daysUntilWedding').get(function() {
  const today = new Date();
  const weddingDate = new Date(this.eventDetails.weddingDate);
  const diffTime = weddingDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for total budget spent
weddingEventSchema.virtual('totalSpent').get(function() {
  return this.vendors.reduce((total, vendor) => total + (vendor.cost || 0), 0);
});

// Virtual for confirmed vendors count
weddingEventSchema.virtual('confirmedVendorsCount').get(function() {
  return this.vendors.filter(vendor => vendor.status === 'confirmed').length;
});

// Virtual for RSVP summary
weddingEventSchema.virtual('rsvpSummary').get(function() {
  const summary = {
    total: this.guestList.length,
    attending: 0,
    notAttending: 0,
    pending: 0,
    maybe: 0
  };
  
  this.guestList.forEach(guest => {
    if (guest.rsvpStatus === 'attending') summary.attending++;
    else if (guest.rsvpStatus === 'not-attending') summary.notAttending++;
    else if (guest.rsvpStatus === 'maybe') summary.maybe++;
    else summary.pending++;
  });
  
  return summary;
});

// Methods
weddingEventSchema.methods.updateBudget = function() {
  this.budget.spent = this.totalSpent;
  this.budget.remaining = this.budget.total - this.budget.spent;
  
  // Update category percentages
  this.budget.categories.forEach(category => {
    category.percentage = this.budget.total > 0 ? (category.budgeted / this.budget.total) * 100 : 0;
  });
  
  return this.save();
};

weddingEventSchema.methods.updateProgress = function() {
  const totalTasks = this.tasks.length;
  const completedTasks = this.tasks.filter(task => task.status === 'completed').length;
  
  this.progress.percentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  return this.save();
};

weddingEventSchema.methods.addGuest = function(guestInfo) {
  this.guestList.push(guestInfo);
  return this.save();
};

weddingEventSchema.methods.updateRSVP = function(guestId, status) {
  const guest = this.guestList.id(guestId);
  if (guest) {
    guest.rsvpStatus = status;
    guest.rsvpDate = new Date();
    return this.save();
  }
  return Promise.reject(new Error('Guest not found'));
};

weddingEventSchema.methods.addVendor = function(vendorId, category, services = [], cost = 0) {
  this.vendors.push({
    vendor: vendorId,
    category,
    services,
    cost,
    status: 'inquired'
  });
  
  return this.save();
};

weddingEventSchema.methods.updateVendorStatus = function(vendorId, status) {
  const vendor = this.vendors.find(v => v.vendor.toString() === vendorId.toString());
  if (vendor) {
    vendor.status = status;
    return this.save();
  }
  return Promise.reject(new Error('Vendor not found'));
};

weddingEventSchema.methods.addTask = function(taskInfo) {
  this.tasks.push(taskInfo);
  this.updateProgress();
  return this.save();
};

weddingEventSchema.methods.completeTask = function(taskId) {
  const task = this.tasks.id(taskId);
  if (task) {
    task.status = 'completed';
    task.completedDate = new Date();
    this.updateProgress();
    return this.save();
  }
  return Promise.reject(new Error('Task not found'));
};

weddingEventSchema.methods.addTimelineEvent = function(eventInfo) {
  this.timeline.push(eventInfo);
  this.timeline.sort((a, b) => a.time.localeCompare(b.time));
  return this.save();
};

weddingEventSchema.methods.logCommunication = function(communicationInfo) {
  this.communications.push(communicationInfo);
  return this.save();
};

// Static methods
weddingEventSchema.statics.findByWebsite = function(websiteId, status = null) {
  const query = { website: websiteId };
  if (status) query.status = status;
  return this.find(query).sort({ 'eventDetails.weddingDate': 1 });
};

weddingEventSchema.statics.findUpcomingEvents = function(websiteId, days = 30) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  return this.find({
    website: websiteId,
    'eventDetails.weddingDate': { $gte: today, $lte: futureDate },
    status: { $in: ['planning', 'confirmed', 'in-progress'] }
  }).sort({ 'eventDetails.weddingDate': 1 });
};

weddingEventSchema.statics.findByDateRange = function(websiteId, startDate, endDate) {
  return this.find({
    website: websiteId,
    'eventDetails.weddingDate': { $gte: startDate, $lte: endDate }
  }).sort({ 'eventDetails.weddingDate': 1 });
};

weddingEventSchema.statics.findByCouple = function(email) {
  return this.find({
    $or: [
      { 'couple.bride.email': email },
      { 'couple.groom.email': email }
    ]
  }).sort({ 'eventDetails.weddingDate': -1 });
};

// Pre-save middleware
weddingEventSchema.pre('save', function(next) {
  // Update budget calculations
  this.updateBudget();
  
  // Update progress
  this.updateProgress();
  
  next();
});

module.exports = mongoose.model('WeddingEvent', weddingEventSchema);

