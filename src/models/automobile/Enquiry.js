import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema({
  // Customer Information
  customer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  customerInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    city: String,
    state: String
  },
  
  // Vehicle Information
  vehicle: {
    type: mongoose.Schema.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  
  // Dealer Information
  dealer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Enquiry Details
  enquiryType: {
    type: String,
    enum: ['price', 'availability', 'test-drive', 'finance', 'exchange', 'general'],
    required: true
  },
  
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Specific Requirements
  requirements: {
    interestedIn: {
      type: String,
      enum: ['purchase', 'lease', 'finance']
    },
    budget: {
      min: Number,
      max: Number
    },
    timeframe: {
      type: String,
      enum: ['immediate', 'within-week', 'within-month', 'within-3-months', 'just-browsing']
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'finance', 'exchange', 'combination']
    },
    exchangeVehicle: {
      make: String,
      model: String,
      year: Number,
      expectedValue: Number
    },
    preferredColors: [String],
    additionalFeatures: [String]
  },
  
  // Status & Tracking
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'test-drive-scheduled', 'negotiating', 'closed-won', 'closed-lost'],
    default: 'new'
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  source: {
    type: String,
    enum: ['website', 'mobile-app', 'phone', 'walk-in', 'referral', 'advertisement'],
    default: 'website'
  },
  
  // Communication History
  communications: [{
    type: {
      type: String,
      enum: ['call', 'email', 'sms', 'whatsapp', 'meeting', 'note']
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound']
    },
    subject: String,
    message: String,
    duration: Number, // in minutes for calls/meetings
    outcome: String,
    nextAction: String,
    nextActionDate: Date,
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Follow-up Information
  followUp: {
    nextDate: Date,
    notes: String,
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  },
  
  // Test Drive Information
  testDrive: {
    requested: {
      type: Boolean,
      default: false
    },
    scheduled: {
      type: Boolean,
      default: false
    },
    scheduledDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: Date,
    feedback: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Finance Information
  finance: {
    required: {
      type: Boolean,
      default: false
    },
    loanAmount: Number,
    downPayment: Number,
    tenure: Number, // in months
    interestRate: Number,
    emi: Number,
    approved: {
      type: Boolean,
      default: false
    },
    bank: String,
    applicationId: String
  },
  
  // Quotation Information
  quotation: {
    vehiclePrice: Number,
    discount: Number,
    exchangeValue: Number,
    accessories: [{
      name: String,
      price: Number
    }],
    insurance: Number,
    registration: Number,
    otherCharges: Number,
    finalPrice: Number,
    validTill: Date,
    terms: String
  },
  
  // Conversion Information
  conversion: {
    converted: {
      type: Boolean,
      default: false
    },
    convertedDate: Date,
    orderValue: Number,
    conversionReason: String,
    lostReason: String
  },
  
  // Analytics
  analytics: {
    responseTime: Number, // in minutes
    touchPoints: Number,
    lastActivity: Date,
    dealerRating: Number
  },
  
  // Internal Notes
  internalNotes: [{
    note: String,
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: true
    }
  }],
  
  // Tags for organization
  tags: [String],
  
  // Closure Information
  closedAt: Date,
  closedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  closureReason: String,
  
  // Customer Satisfaction
  satisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    wouldRecommend: Boolean,
    surveyDate: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
enquirySchema.index({ customer: 1 });
enquirySchema.index({ vehicle: 1 });
enquirySchema.index({ dealer: 1 });
enquirySchema.index({ status: 1 });
enquirySchema.index({ priority: 1 });
enquirySchema.index({ enquiryType: 1 });
enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ 'followUp.nextDate': 1 });
enquirySchema.index({ 'testDrive.scheduledDate': 1 });

// Virtual for enquiry age
enquirySchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

// Virtual for is overdue
enquirySchema.virtual('isOverdue').get(function() {
  return this.followUp.nextDate && this.followUp.nextDate < new Date();
});

// Method to add communication
enquirySchema.methods.addCommunication = function(communication) {
  this.communications.push(communication);
  this.analytics.touchPoints = this.communications.length;
  this.analytics.lastActivity = new Date();
  return this.save();
};

// Method to update status
enquirySchema.methods.updateStatus = function(newStatus, reason = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  // Add status change to communications
  this.communications.push({
    type: 'note',
    direction: 'outbound',
    subject: 'Status Updated',
    message: `Status changed from ${oldStatus} to ${newStatus}. ${reason}`,
    createdAt: new Date()
  });
  
  // Update closure information if closing
  if (['closed-won', 'closed-lost'].includes(newStatus)) {
    this.closedAt = new Date();
    this.closureReason = reason;
    this.conversion.converted = newStatus === 'closed-won';
    this.conversion.convertedDate = new Date();
    if (newStatus === 'closed-won') {
      this.conversion.conversionReason = reason;
    } else {
      this.conversion.lostReason = reason;
    }
  }
  
  return this.save();
};

// Method to schedule test drive
enquirySchema.methods.scheduleTestDrive = function(date, notes = '') {
  this.testDrive.requested = true;
  this.testDrive.scheduled = true;
  this.testDrive.scheduledDate = date;
  
  this.communications.push({
    type: 'note',
    direction: 'outbound',
    subject: 'Test Drive Scheduled',
    message: `Test drive scheduled for ${date}. ${notes}`,
    createdAt: new Date()
  });
  
  return this.save();
};

// Method to calculate response time
enquirySchema.methods.calculateResponseTime = function() {
  const firstResponse = this.communications.find(comm => comm.direction === 'outbound');
  if (firstResponse) {
    this.analytics.responseTime = Math.floor((firstResponse.createdAt - this.createdAt) / (1000 * 60)); // minutes
  }
  return this.save();
};

// Static method to get enquiry statistics
enquirySchema.statics.getStatistics = function(dealerId, dateRange = {}) {
  const matchStage = { dealer: mongoose.Types.ObjectId(dealerId) };
  
  if (dateRange.start || dateRange.end) {
    matchStage.createdAt = {};
    if (dateRange.start) matchStage.createdAt.$gte = new Date(dateRange.start);
    if (dateRange.end) matchStage.createdAt.$lte = new Date(dateRange.end);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
        contacted: { $sum: { $cond: [{ $eq: ['$status', 'contacted'] }, 1, 0] } },
        qualified: { $sum: { $cond: [{ $eq: ['$status', 'qualified'] }, 1, 0] } },
        testDriveScheduled: { $sum: { $cond: [{ $eq: ['$status', 'test-drive-scheduled'] }, 1, 0] } },
        negotiating: { $sum: { $cond: [{ $eq: ['$status', 'negotiating'] }, 1, 0] } },
        closedWon: { $sum: { $cond: [{ $eq: ['$status', 'closed-won'] }, 1, 0] } },
        closedLost: { $sum: { $cond: [{ $eq: ['$status', 'closed-lost'] }, 1, 0] } },
        avgResponseTime: { $avg: '$analytics.responseTime' },
        conversionRate: {
          $multiply: [
            { $divide: [{ $sum: { $cond: [{ $eq: ['$status', 'closed-won'] }, 1, 0] } }, '$total'] },
            100
          ]
        }
      }
    }
  ]);
};

// Static method to get overdue enquiries
enquirySchema.statics.getOverdue = function(dealerId) {
  return this.find({
    dealer: dealerId,
    status: { $nin: ['closed-won', 'closed-lost'] },
    'followUp.nextDate': { $lt: new Date() }
  }).populate('vehicle customer');
};

export default mongoose.model('Enquiry', enquirySchema);

