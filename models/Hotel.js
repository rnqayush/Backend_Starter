const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String
  },
  slug: {
    type: String,
    unique: true
  },
  sections: {
    hero: {
      title: String,
      subtitle: String,
      backgroundImage: String,
      ctaText: String,
      quickInfo: [{
        icon: String,
        label: String,
        value: String
      }]
    },
    about: {
      title: String,
      subtitle: String,
      content: String,
      highlights: [String]
    },
    features: {
      title: String,
      subtitle: String,
      items: [{
        icon: String,
        title: String,
        description: String
      }]
    },
    gallery: {
      title: String,
      subtitle: String,
      images: [{
        title: String,
        image: String,
        description: String
      }]
    },
    amenities: {
      title: String,
      subtitle: String,
      categories: [{
        title: String,
        icon: String,
        items: [String]
      }]
    },
    contact: {
      title: String,
      subtitle: String,
      info: [{
        label: String,
        value: String,
        icon: String
      }]
    },
    footer: {
      title: String,
      subtitle: String,
      supportContact: {
        phone: String,
        email: String,
        address: String
      },
      socialLinks: [{
        platform: String,
        url: String,
        icon: String
      }]
    },
    testimonials: {
      title: String,
      subtitle: String,
      reviews: [{
        id: Number,
        guestName: String,
        rating: Number,
        date: String,
        comment: String,
        roomType: String,
        verified: Boolean,
        location: String
      }]
    }
  },
  sectionOrder: [String],
  sectionVisibility: {
    hero: { type: Boolean, default: true },
    about: { type: Boolean, default: true },
    features: { type: Boolean, default: true },
    gallery: { type: Boolean, default: true },
    amenities: { type: Boolean, default: true },
    testimonials: { type: Boolean, default: true },
    contact: { type: Boolean, default: true },
    footer: { type: Boolean, default: true }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hotel', hotelSchema);

