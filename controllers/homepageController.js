import { asyncHandler } from '../utils/asyncHandler.js';
import { formatResponse } from '../utils/responseFormatter.js';
import User from '../models/User.js';
import Vendor from '../models/Vendor.js';
import Hotel from '../models/Hotel.js';
import Ecommerce from '../models/Ecommerce.js';
import Automobile from '../models/Automobile.js';
import Wedding from '../models/Wedding.js';

// @desc    Get homepage content
// @route   GET /api/homepage
// @access  Public
export const getHomepageContent = asyncHandler(async (req, res) => {
  // Hero Section Data
  const heroSection = {
    title: "Discover Amazing Businesses",
    subtitle: "Find the perfect hotel, shop, car, or wedding service for your needs",
    backgroundImage: "/images/hero-bg.jpg",
    ctaText: "Explore Now",
    ctaLink: "/search"
  };

  // Get featured businesses from each category
  const [featuredHotels, featuredStores, featuredCars, featuredWeddings] = await Promise.all([
    Hotel.find({ isDeleted: false })
      .populate('vendor', 'businessName email')
      .sort({ rating: -1 })
      .limit(3)
      .lean(),
    Ecommerce.find({ isDeleted: false })
      .populate('vendor', 'businessName email')
      .sort({ rating: -1 })
      .limit(3)
      .lean(),
    Automobile.find({ isDeleted: false })
      .populate('vendor', 'businessName email')
      .sort({ views: -1 })
      .limit(3)
      .lean(),
    Wedding.find({ isDeleted: false })
      .populate('vendor', 'businessName email')
      .sort({ rating: -1 })
      .limit(3)
      .lean()
  ]);

  const featuredBusinesses = [
    ...featuredHotels.map(hotel => ({
      ...hotel,
      category: 'hotel',
      slug: hotel.slug || hotel.name.toLowerCase().replace(/\s+/g, '-')
    })),
    ...featuredStores.map(store => ({
      ...store,
      category: 'ecommerce',
      slug: store.slug || store.storeName.toLowerCase().replace(/\s+/g, '-')
    })),
    ...featuredCars.map(car => ({
      ...car,
      category: 'automobile',
      slug: car.slug || `${car.make}-${car.model}`.toLowerCase().replace(/\s+/g, '-')
    })),
    ...featuredWeddings.map(wedding => ({
      ...wedding,
      category: 'wedding',
      slug: wedding.slug || wedding.businessName.toLowerCase().replace(/\s+/g, '-')
    }))
  ];

  // Categories with counts
  const [hotelCount, ecommerceCount, automobileCount, weddingCount] = await Promise.all([
    Hotel.countDocuments({ isDeleted: false }),
    Ecommerce.countDocuments({ isDeleted: false }),
    Automobile.countDocuments({ isDeleted: false }),
    Wedding.countDocuments({ isDeleted: false })
  ]);

  const categories = [
    {
      id: 'hotel',
      name: 'Hotels',
      description: 'Find the perfect accommodation',
      icon: 'hotel',
      count: hotelCount,
      image: '/images/categories/hotel.jpg',
      link: '/hotels'
    },
    {
      id: 'ecommerce',
      name: 'Shopping',
      description: 'Discover amazing products',
      icon: 'shopping-bag',
      count: ecommerceCount,
      image: '/images/categories/shopping.jpg',
      link: '/shop'
    },
    {
      id: 'automobile',
      name: 'Automobiles',
      description: 'Buy, sell, or rent vehicles',
      icon: 'car',
      count: automobileCount,
      image: '/images/categories/automobile.jpg',
      link: '/automobiles'
    },
    {
      id: 'wedding',
      name: 'Weddings',
      description: 'Plan your perfect wedding',
      icon: 'heart',
      count: weddingCount,
      image: '/images/categories/wedding.jpg',
      link: '/weddings'
    }
  ];

  // Sample testimonials (in real app, these would come from a testimonials collection)
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Happy Customer",
      content: "Found the perfect hotel for my vacation through this platform. The booking process was seamless!",
      rating: 5,
      avatar: "/images/avatars/sarah.jpg"
    },
    {
      id: 2,
      name: "Mike Chen",
      role: "Business Owner",
      content: "As a vendor, this platform has helped me reach so many more customers. Highly recommended!",
      rating: 5,
      avatar: "/images/avatars/mike.jpg"
    },
    {
      id: 3,
      name: "Emily Davis",
      role: "Wedding Planner",
      content: "The wedding services section is amazing. Found all the vendors I needed in one place.",
      rating: 5,
      avatar: "/images/avatars/emily.jpg"
    }
  ];

  // Platform statistics
  const [totalUsers, totalVendors, totalBusinesses] = await Promise.all([
    User.countDocuments({ isDeleted: false }),
    Vendor.countDocuments({ isDeleted: false, status: 'approved' }),
    Promise.all([
      Hotel.countDocuments({ isDeleted: false }),
      Ecommerce.countDocuments({ isDeleted: false }),
      Automobile.countDocuments({ isDeleted: false }),
      Wedding.countDocuments({ isDeleted: false })
    ]).then(counts => counts.reduce((sum, count) => sum + count, 0))
  ]);

  const stats = {
    totalBusinesses,
    totalCustomers: totalUsers,
    totalVendors,
    totalBookings: 1250, // This would come from bookings collection
    totalReviews: 3420   // This would come from reviews collection
  };

  const homepageData = {
    heroSection,
    featuredBusinesses,
    categories,
    testimonials,
    stats
  };

  res.status(200).json(formatResponse(
    true,
    'Homepage content retrieved successfully',
    homepageData
  ));
});

// @desc    Get category statistics
// @route   GET /api/homepage/stats
// @access  Public
export const getCategoryStats = asyncHandler(async (req, res) => {
  const stats = await Promise.all([
    Hotel.countDocuments({ isDeleted: false }),
    Ecommerce.countDocuments({ isDeleted: false }),
    Automobile.countDocuments({ isDeleted: false }),
    Wedding.countDocuments({ isDeleted: false }),
    Vendor.countDocuments({ isDeleted: false, status: 'approved' }),
    User.countDocuments({ isDeleted: false })
  ]);

  const categoryStats = {
    hotels: stats[0],
    ecommerce: stats[1],
    automobiles: stats[2],
    weddings: stats[3],
    totalBusinesses: stats[0] + stats[1] + stats[2] + stats[3],
    totalVendors: stats[4],
    totalUsers: stats[5]
  };

  res.status(200).json(formatResponse(
    true,
    'Category statistics retrieved successfully',
    categoryStats
  ));
});

// @desc    Search across all categories
// @route   GET /api/homepage/search
// @access  Public
export const globalSearch = asyncHandler(async (req, res) => {
  const { q, category, limit = 20 } = req.query;
  
  if (!q) {
    return res.status(400).json(formatResponse(
      false,
      'Search query is required'
    ));
  }

  const searchRegex = new RegExp(q, 'i');
  const searchLimit = parseInt(limit);

  let results = [];

  if (!category || category === 'all') {
    // Search across all categories
    const [hotels, stores, cars, weddings] = await Promise.all([
      Hotel.find({
        isDeleted: false,
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { 'location.city': searchRegex },
          { 'location.state': searchRegex }
        ]
      })
      .populate('vendor', 'businessName')
      .limit(searchLimit / 4)
      .lean(),

      Ecommerce.find({
        isDeleted: false,
        $or: [
          { storeName: searchRegex },
          { description: searchRegex },
          { category: searchRegex },
          { 'location.city': searchRegex }
        ]
      })
      .populate('vendor', 'businessName')
      .limit(searchLimit / 4)
      .lean(),

      Automobile.find({
        isDeleted: false,
        $or: [
          { make: searchRegex },
          { model: searchRegex },
          { description: searchRegex },
          { 'location.city': searchRegex }
        ]
      })
      .populate('vendor', 'businessName')
      .limit(searchLimit / 4)
      .lean(),

      Wedding.find({
        isDeleted: false,
        $or: [
          { businessName: searchRegex },
          { description: searchRegex },
          { serviceType: searchRegex },
          { 'location.city': searchRegex }
        ]
      })
      .populate('vendor', 'businessName')
      .limit(searchLimit / 4)
      .lean()
    ]);

    results = [
      ...hotels.map(item => ({ ...item, category: 'hotel' })),
      ...stores.map(item => ({ ...item, category: 'ecommerce' })),
      ...cars.map(item => ({ ...item, category: 'automobile' })),
      ...weddings.map(item => ({ ...item, category: 'wedding' }))
    ];
  } else {
    // Search in specific category
    let Model;
    switch (category) {
      case 'hotel':
        Model = Hotel;
        break;
      case 'ecommerce':
        Model = Ecommerce;
        break;
      case 'automobile':
        Model = Automobile;
        break;
      case 'wedding':
        Model = Wedding;
        break;
      default:
        return res.status(400).json(formatResponse(
          false,
          'Invalid category'
        ));
    }

    const items = await Model.find({
      isDeleted: false,
      $text: { $search: q }
    })
    .populate('vendor', 'businessName')
    .limit(searchLimit)
    .lean();

    results = items.map(item => ({ ...item, category }));
  }

  res.status(200).json(formatResponse(
    true,
    'Search results retrieved successfully',
    {
      query: q,
      category: category || 'all',
      results,
      total: results.length
    }
  ));
});
