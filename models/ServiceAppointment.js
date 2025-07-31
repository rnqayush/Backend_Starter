const mongoose = require('mongoose');

/**
 * Service Appointment Model
 * Represents appointments for automotive services
 */
const serviceAppointmentSchema = new mongoose.Schema({
  // Appointment Reference
  appointmentNumber: {
    type: String,
    required: [true, 'Appointment number is required'],
    unique: true,
    index: true
  },
  
  // References
  website: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Website',
    required: [true, 'Website reference is required'],
    index: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AutoService',
    required: [true, 'Service reference is required'],
    index: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  
  // Customer Information (for guest appointments)
  customerInfo: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      zipCode: { type: String }
    },
    isGuest: { type: Boolean, default: false }
  },
  
  // Vehicle Information
  vehicle: {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    vin: { type: String, trim: true, uppercase: true },
    licensePlate: { type: String, trim: true, uppercase: true },
    mileage: { type: Number, min: 0 },
    color: { type: String },
    engine: { type: String },
    transmission: { type: String, enum: ['manual', 'automatic', 'cvt'] },
    fuelType: { type: String, enum: ['gasoline', 'diesel', 'electric', 'hybrid'] }
  },
  
  // Appointment Details
  appointment: {
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
      index: true
    },
    scheduledTime: {
      type: String,
      required: [true, 'Scheduled time is required']
    },
    estimatedDuration: { type: Number, required: true }, // in minutes
    estimatedCompletion: { type: Date },
    actualStartTime: { type: Date },
    actualEndTime: { type: Date },
    actualDuration: { type: Number } // in minutes
  },
  
  // Service Details
  serviceDetails: {
    requestedServices: [{ type: String, required: true }],
    additionalServices: [{
      name: { type: String, required: true },
      description: { type: String },
      price: { type: Number, min: 0 },
      approved: { type: Boolean, default: false }
    }],
    customerComplaints: { type: String },
    symptoms: [{ type: String }],
    previousWork: { type: String },
    specialInstructions: { type: String }
  },
  
  // Pricing and Estimates
  pricing: {
    estimatedCost: { type: Number, required: true, min: 0 },
    laborCost: { type: Number, default: 0, min: 0 },
    partsCost: { type: Number, default: 0, min: 0 },
    additionalCosts: [{
      description: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 }
    }],
    taxes: { type: Number, default: 0, min: 0 },
    discounts: [{
      description: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 },
      type: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' }
    }],
    finalCost: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' }
  },
  
  // Parts and Materials
  parts: [{
    name: { type: String, required: true },
    partNumber: { type: String },
    brand: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitCost: { type: Number, required: true, min: 0 },
    totalCost: { type: Number, required: true, min: 0 },
    warranty: {
      duration: { type: Number }, // in days
      coverage: { type: String }
    },
    status: {
      type: String,
      enum: ['needed', 'ordered', 'received', 'installed'],
      default: 'needed'
    }
  }],
  
  // Work Performed
  workPerformed: [{
    service: { type: String, required: true },
    description: { type: String },
    technician: { type: String },
    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: Number }, // in minutes
    notes: { type: String },
    completed: { type: Boolean, default: false }
  }],
  
  // Diagnostic Information
  diagnostics: {
    troubleCodes: [{ type: String }],
    diagnosticNotes: { type: String },
    testResults: [{
      test: { type: String, required: true },
      result: { type: String, required: true },
      specification: { type: String },
      status: { type: String, enum: ['pass', 'fail', 'warning'], required: true }
    }],
    recommendations: [{
      service: { type: String, required: true },
      priority: { type: String, enum: ['immediate', 'soon', 'future'], required: true },
      description: { type: String },
      estimatedCost: { type: Number, min: 0 }
    }]
  },
  
  // Quality Control
  qualityControl: {
    preServiceInspection: {
      completed: { type: Boolean, default: false },
      notes: { type: String },
      photos: [{ type: String }]
    },
    postServiceInspection: {
      completed: { type: Boolean, default: false },
      notes: { type: String },
      photos: [{ type: String }]
    },
    testDrive: {
      performed: { type: Boolean, default: false },
      notes: { type: String },
      issues: [{ type: String }]
    }
  },
  
  // Status and Progress
  status: {
    type: String,
    enum: [
      'scheduled', 'confirmed', 'checked-in', 'in-progress', 
      'waiting-parts', 'waiting-approval', 'completed', 
      'ready-pickup', 'picked-up', 'cancelled', 'no-show'
    ],
    default: 'scheduled',
    index: true
  },
  
  // Payment Information
  payment: {
    method: {
      type: String,
      enum: ['cash', 'credit-card', 'debit-card', 'check', 'financing', 'insurance', 'warranty'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded', 'disputed'],
      default: 'pending',
      index: true
    },
    paidAmount: { type: Number, default: 0, min: 0 },
    paymentDate: { type: Date },
    transactionId: { type: String },
    invoiceNumber: { type: String }
  },
  
  // Communication Log
  communications: [{
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['call', 'email', 'sms', 'in-person'], required: true },
    direction: { type: String, enum: ['inbound', 'outbound'], required: true },
    subject: { type: String },
    message: { type: String, required: true },
    staff: { type: String },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date }
  }],
  
  // Notifications
  notifications: [{
    type: {
      type: String,
      enum: ['confirmation', 'reminder', 'ready', 'completed', 'delay', 'additional-work'],
      required: true
    },
    sentAt: { type: Date, default: Date.now },
    method: { type: String, enum: ['email', 'sms', 'call'], required: true },
    status: { type: String, enum: ['sent', 'delivered', 'failed'], default: 'sent' },
    message: { type: String }
  }],
  
  // Warranty Information
  warranty: {
    provided: { type: Boolean, default: true },
    duration: { type: Number }, // in days
    coverage: { type: String },
    terms: { type: String },
    startDate: { type: Date },
    endDate: { type: Date }
  },
  
  // Customer Feedback
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String, maxlength: 1000 },
    reviewDate: { type: Date },
    wouldRecommend: { type: Boolean },
    serviceQuality: { type: Number, min: 1, max: 5 },
    timeliness: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 }
  },
  
  // Internal Notes
  internalNotes: [{
    note: { type: String, required: true },
    addedBy: { type: String, required: true },
    addedAt: { type: Date, default: Date.now },
    category: {
      type: String,
      enum: ['general', 'technical', 'customer-service', 'billing', 'follow-up'],
      default: 'general'
    },
    isPrivate: { type: Boolean, default: true }
  }],
  
  // Attachments and Documents
  attachments: [{
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['photo', 'document', 'video', 'audio'] },
    category: { type: String, enum: ['before', 'after', 'diagnostic', 'invoice', 'estimate', 'other'] },
    uploadedAt: { type: Date, default: Date.now },
    uploadedBy: { type: String }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
serviceAppointmentSchema.index({ website: 1, status: 1 });
serviceAppointmentSchema.index({ website: 1, 'appointment.scheduledDate': 1 });
serviceAppointmentSchema.index({ 'customerInfo.email': 1 });
serviceAppointmentSchema.index({ 'vehicle.vin': 1 });
serviceAppointmentSchema.index({ 'payment.status': 1 });
serviceAppointmentSchema.index({ appointmentNumber: 1 });

// Virtual for customer full name
serviceAppointmentSchema.virtual('customerFullName').get(function() {
  return `${this.customerInfo.firstName} ${this.customerInfo.lastName}`;
});

// Virtual for vehicle description
serviceAppointmentSchema.virtual('vehicleDescription').get(function() {
  return `${this.vehicle.year} ${this.vehicle.make} ${this.vehicle.model}`;
});

// Virtual for appointment duration
serviceAppointmentSchema.virtual('appointmentDuration').get(function() {
  return this.actualDuration || this.appointment.estimatedDuration;
});

// Virtual for total parts cost
serviceAppointmentSchema.virtual('totalPartsCost').get(function() {
  return this.parts.reduce((total, part) => total + part.totalCost, 0);
});

// Virtual for outstanding balance
serviceAppointmentSchema.virtual('outstandingBalance').get(function() {
  return Math.max(0, (this.pricing.finalCost || this.pricing.estimatedCost) - this.payment.paidAmount);
});

// Methods
serviceAppointmentSchema.methods.calculateFinalCost = function() {
  let total = this.pricing.laborCost + this.pricing.partsCost;
  
  // Add additional costs
  this.pricing.additionalCosts.forEach(cost => {
    total += cost.amount;
  });
  
  // Apply discounts
  this.pricing.discounts.forEach(discount => {
    if (discount.type === 'percentage') {
      total -= (total * discount.amount / 100);
    } else {
      total -= discount.amount;
    }
  });
  
  // Add taxes
  total += this.pricing.taxes;
  
  this.pricing.finalCost = Math.max(0, total);
  return this.pricing.finalCost;
};

serviceAppointmentSchema.methods.updateStatus = function(newStatus, note = '') {
  this.status = newStatus;
  
  if (note) {
    this.internalNotes.push({
      note: `Status changed to ${newStatus}: ${note}`,
      addedBy: 'system',
      category: 'general'
    });
  }
  
  // Update timestamps based on status
  if (newStatus === 'checked-in') {
    this.appointment.actualStartTime = new Date();
  } else if (newStatus === 'completed') {
    this.appointment.actualEndTime = new Date();
    if (this.appointment.actualStartTime) {
      this.appointment.actualDuration = Math.floor(
        (this.appointment.actualEndTime - this.appointment.actualStartTime) / (1000 * 60)
      );
    }
  }
  
  return this.save();
};

serviceAppointmentSchema.methods.addPart = function(partInfo) {
  partInfo.totalCost = partInfo.unitCost * partInfo.quantity;
  this.parts.push(partInfo);
  
  // Update parts cost
  this.pricing.partsCost = this.totalPartsCost;
  this.calculateFinalCost();
  
  return this.save();
};

serviceAppointmentSchema.methods.addWorkPerformed = function(workInfo) {
  this.workPerformed.push(workInfo);
  return this.save();
};

serviceAppointmentSchema.methods.addNote = function(note, addedBy, category = 'general', isPrivate = true) {
  this.internalNotes.push({
    note,
    addedBy,
    category,
    isPrivate
  });
  
  return this.save();
};

serviceAppointmentSchema.methods.logCommunication = function(communicationInfo) {
  this.communications.push(communicationInfo);
  return this.save();
};

serviceAppointmentSchema.methods.sendNotification = function(type, method = 'email', message = '') {
  this.notifications.push({
    type,
    method,
    message,
    sentAt: new Date(),
    status: 'sent'
  });
  
  return this.save();
};

serviceAppointmentSchema.methods.addFeedback = function(feedbackInfo) {
  this.feedback = { ...this.feedback, ...feedbackInfo, reviewDate: new Date() };
  return this.save();
};

serviceAppointmentSchema.methods.processPayment = function(amount, method, transactionId = null) {
  this.payment.paidAmount += amount;
  this.payment.method = method;
  this.payment.paymentDate = new Date();
  
  if (transactionId) {
    this.payment.transactionId = transactionId;
  }
  
  // Update payment status
  const finalCost = this.pricing.finalCost || this.pricing.estimatedCost;
  if (this.payment.paidAmount >= finalCost) {
    this.payment.status = 'paid';
  } else if (this.payment.paidAmount > 0) {
    this.payment.status = 'partial';
  }
  
  return this.save();
};

// Static methods
serviceAppointmentSchema.statics.findByWebsite = function(websiteId, status = null) {
  const query = { website: websiteId };
  if (status) query.status = status;
  return this.find(query).sort({ 'appointment.scheduledDate': 1 });
};

serviceAppointmentSchema.statics.findByCustomer = function(customerId) {
  return this.find({ customer: customerId }).sort({ 'appointment.scheduledDate': -1 });
};

serviceAppointmentSchema.statics.findByEmail = function(email) {
  return this.find({ 'customerInfo.email': email }).sort({ 'appointment.scheduledDate': -1 });
};

serviceAppointmentSchema.statics.findByDateRange = function(websiteId, startDate, endDate) {
  return this.find({
    website: websiteId,
    'appointment.scheduledDate': { $gte: startDate, $lte: endDate }
  }).sort({ 'appointment.scheduledDate': 1 });
};

serviceAppointmentSchema.statics.findByVehicle = function(vin) {
  return this.find({ 'vehicle.vin': vin }).sort({ 'appointment.scheduledDate': -1 });
};

serviceAppointmentSchema.statics.generateAppointmentNumber = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `APT-${timestamp}-${random}`.toUpperCase();
};

serviceAppointmentSchema.statics.getTodaysAppointments = function(websiteId) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  return this.find({
    website: websiteId,
    'appointment.scheduledDate': { $gte: startOfDay, $lt: endOfDay },
    status: { $nin: ['cancelled', 'no-show', 'picked-up'] }
  }).sort({ 'appointment.scheduledTime': 1 });
};

// Pre-save middleware
serviceAppointmentSchema.pre('save', function(next) {
  // Generate appointment number if not exists
  if (!this.appointmentNumber) {
    this.appointmentNumber = this.constructor.generateAppointmentNumber();
  }
  
  // Calculate estimated completion time
  if (this.appointment.scheduledDate && this.appointment.scheduledTime && this.appointment.estimatedDuration) {
    const [hours, minutes] = this.appointment.scheduledTime.split(':');
    const scheduledDateTime = new Date(this.appointment.scheduledDate);
    scheduledDateTime.setHours(parseInt(hours), parseInt(minutes));
    
    this.appointment.estimatedCompletion = new Date(
      scheduledDateTime.getTime() + (this.appointment.estimatedDuration * 60 * 1000)
    );
  }
  
  // Calculate final cost
  this.calculateFinalCost();
  
  next();
});

module.exports = mongoose.model('ServiceAppointment', serviceAppointmentSchema);

