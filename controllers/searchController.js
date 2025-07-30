const Hotel = require('../models/Hotel');
const Product = require('../models/Product');
const Vehicle = require('../models/Vehicle');
const WeddingVendor = require('../models/WeddingVendor');
const Business = require('../models/Business');
const Blog = require('../models/Blog');
const asyncHandler = require('../utils/asyncHandler');
const ResponseHandler = require('../utils/responseHandler');
const { BadRequestError } = require('../utils/customErrors');

class SearchController {
  /**
   * Global search across all content types
   */
  globalSearch = asyncHandler(async (req, res) => {
    const {
      query,
      type,
      location,
      page = 1,
      limit = 20,
      sortBy = 'relevance'
    } = req.query;

    if (!query || query.trim().length < 2) {
      throw new BadRequestError('Search query must be at least 2 characters long');
    }

    const searchQuery = query.trim();
    const results = {};

    // Search in different content types based on type parameter
    if (!type || type === 'all') {
      results.hotels = await this.searchHotels(searchQuery, location, 5);
      results.products = await this.searchProducts(searchQuery, 5);
      results.vehicles = await this.searchVehicles(searchQuery, 5);
      results.weddings = await this.searchWeddingVendors(searchQuery, location, 5);
      results.businesses = await this.searchBusinesses(searchQuery, location, 5);
      results.blogs = await this.searchBlogs(searchQuery, 5);
    } else {
      switch (type) {
        case 'hotels':
          results.hotels = await this.searchHotels(searchQuery, location, parseInt(limit));
          break;
        case 'products':
          results.products = await this.searchProducts(searchQuery, parseInt(limit));
          break;
        case 'vehicles':
          results.vehicles = await this.searchVehicles(searchQuery, parseInt(limit));
          break;
        case 'weddings':
          results.weddings = await this.searchWeddingVendors(searchQuery, location, parseInt(limit));
          break;
        case 'businesses':
          results.businesses = await this.searchBusinesses(searchQuery, location, parseInt(limit));
          break;
        case 'blogs':
          results.blogs = await this.searchBlogs(searchQuery, parseInt(limit));
          break;
        default:
          throw new BadRequestError('Invalid search type');
      }
    }

    // Calculate total results
    const totalResults = Object.values(results).reduce((sum, items) => sum + (items?.length || 0), 0);

    return ResponseHandler.success(res, {
      query: searchQuery,
      totalResults,
      results
    }, 'Search completed successfully');
  });

  /**
   * Search hotels
   */
  searchHotels = async (query, location, limit = 10) => {
    let searchQuery = {
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { 'location.address': { $regex: query, $options: 'i' } },
        { 'location.city': { $regex: query, $options: 'i' } }
      ]
    };

    if (location) {
      searchQuery['location.city'] = { $regex: location, $options: 'i' };
    }

    return await Hotel.find(searchQuery)
      .populate('business', 'name slug')
      .select('name description location pricing.basePrice images rating category')
      .sort('-rating.average')
      .limit(limit);
  };

  /**
   * Search products
   */
  searchProducts = async (query, limit = 10) => {
    const searchQuery = {
      status: 'active',
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    return await Product.find(searchQuery)
      .populate('business', 'name slug')
      .select('name description pricing.salePrice images rating category brand')
      .sort('-rating.average')
      .limit(limit);
  };

  /**
   * Search vehicles
   */
  searchVehicles = async (query, limit = 10) => {
    const searchQuery = {
      status: 'available',
      isActive: true,
      $or: [
        { make: { $regex: query, $options: 'i' } },
        { model: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { features: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    return await Vehicle.find(searchQuery)
      .populate('business', 'name slug')
      .select('make model year price images mileage fuelType transmission')
      .sort('-createdAt')
      .limit(limit);
  };

  /**
   * Search wedding vendors
   */
  searchWeddingVendors = async (query, location, limit = 10) => {
    let searchQuery = {
      isActive: true,
      $or: [
        { businessName: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { specialties: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    if (location) {
      searchQuery['location.city'] = { $regex: location, $options: 'i' };
    }

    return await WeddingVendor.find(searchQuery)
      .populate('business', 'name slug')
      .select('businessName description category location rating images')
      .sort('-rating.average')
      .limit(limit);
  };

  /**
   * Search businesses
   */
  searchBusinesses = async (query, location, limit = 10) => {
    let searchQuery = {
      status: 'active',
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { type: { $regex: query, $options: 'i' } }
      ]
    };

    if (location) {
      searchQuery.$or.push(
        { 'address.city': { $regex: location, $options: 'i' } },
        { 'address.state': { $regex: location, $options: 'i' } }
      );
    }

    return await Business.find(searchQuery)
      .populate('owner', 'name')
      .select('name description type address contact featured')
      .sort('-featured -createdAt')
      .limit(limit);
  };

  /**
   * Search blogs
   */
  searchBlogs = async (query, limit = 10) => {
    const searchQuery = {
      status: 'published',
      isActive: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
        { excerpt: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    return await Blog.find(searchQuery)
      .populate('business', 'name slug')
      .populate('author', 'name')
      .select('title excerpt slug featuredImage publishedAt category tags')
      .sort('-publishedAt')
      .limit(limit);
  };

  /**
   * Get search suggestions
   */
  getSearchSuggestions = asyncHandler(async (req, res) => {
    const { query, type } = req.query;

    if (!query || query.trim().length < 2) {
      return ResponseHandler.success(res, [], 'No suggestions available');
    }

    const searchQuery = query.trim();
    const suggestions = [];

    try {
      // Get suggestions based on type
      switch (type) {
        case 'hotels':
          const hotelSuggestions = await Hotel.find({
            isActive: true,
            name: { $regex: searchQuery, $options: 'i' }
          })
            .select('name location.city')
            .limit(5);
          
          suggestions.push(...hotelSuggestions.map(h => ({
            text: h.name,
            type: 'hotel',
            location: h.location.city
          })));
          break;

        case 'products':
          const productSuggestions = await Product.find({
            status: 'active',
            isActive: true,
            $or: [
              { name: { $regex: searchQuery, $options: 'i' } },
              { category: { $regex: searchQuery, $options: 'i' } }
            ]
          })
            .select('name category')
            .limit(5);
          
          suggestions.push(...productSuggestions.map(p => ({
            text: p.name,
            type: 'product',
            category: p.category
          })));
          break;

        default:
          // General suggestions from multiple sources
          const [hotels, products, businesses] = await Promise.all([
            Hotel.find({ isActive: true, name: { $regex: searchQuery, $options: 'i' } })
              .select('name').limit(2),
            Product.find({ status: 'active', name: { $regex: searchQuery, $options: 'i' } })
              .select('name').limit(2),
            Business.find({ status: 'active', name: { $regex: searchQuery, $options: 'i' } })
              .select('name type').limit(2)
          ]);

          suggestions.push(
            ...hotels.map(h => ({ text: h.name, type: 'hotel' })),
            ...products.map(p => ({ text: p.name, type: 'product' })),
            ...businesses.map(b => ({ text: b.name, type: b.type }))
          );
      }

      return ResponseHandler.success(res, suggestions, 'Search suggestions retrieved successfully');
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return ResponseHandler.success(res, [], 'No suggestions available');
    }
  });

  /**
   * Advanced search with filters
   */
  advancedSearch = asyncHandler(async (req, res) => {
    const {
      query,
      type,
      filters = {},
      location,
      priceRange,
      rating,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.body;

    if (!query || query.trim().length < 2) {
      throw new BadRequestError('Search query must be at least 2 characters long');
    }

    let results = [];
    const skip = (page - 1) * limit;

    switch (type) {
      case 'hotels':
        results = await this.advancedHotelSearch(query, filters, location, priceRange, rating, sortBy, skip, limit);
        break;
      case 'products':
        results = await this.advancedProductSearch(query, filters, priceRange, rating, sortBy, skip, limit);
        break;
      case 'vehicles':
        results = await this.advancedVehicleSearch(query, filters, priceRange, sortBy, skip, limit);
        break;
      case 'weddings':
        results = await this.advancedWeddingSearch(query, filters, location, rating, sortBy, skip, limit);
        break;
      default:
        throw new BadRequestError('Invalid search type for advanced search');
    }

    return ResponseHandler.success(res, {
      query,
      type,
      results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.length
      }
    }, 'Advanced search completed successfully');
  });

  /**
   * Advanced hotel search
   */
  advancedHotelSearch = async (query, filters, location, priceRange, rating, sortBy, skip, limit) => {
    let searchQuery = {
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    };

    // Apply filters
    if (filters.category) searchQuery.category = filters.category;
    if (filters.starRating) searchQuery.starRating = { $gte: parseInt(filters.starRating) };
    if (location) searchQuery['location.city'] = { $regex: location, $options: 'i' };
    if (priceRange) {
      searchQuery['pricing.basePrice'] = {};
      if (priceRange.min) searchQuery['pricing.basePrice'].$gte = priceRange.min;
      if (priceRange.max) searchQuery['pricing.basePrice'].$lte = priceRange.max;
    }
    if (rating) searchQuery['rating.average'] = { $gte: parseFloat(rating) };

    // Determine sort order
    let sort = {};
    switch (sortBy) {
      case 'price_low':
        sort = { 'pricing.basePrice': 1 };
        break;
      case 'price_high':
        sort = { 'pricing.basePrice': -1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      default:
        sort = { 'rating.average': -1, 'pricing.basePrice': 1 };
    }

    return await Hotel.find(searchQuery)
      .populate('business', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  };

  /**
   * Advanced product search
   */
  advancedProductSearch = async (query, filters, priceRange, rating, sortBy, skip, limit) => {
    let searchQuery = {
      status: 'active',
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    // Apply filters
    if (filters.category) searchQuery.category = { $regex: filters.category, $options: 'i' };
    if (filters.brand) searchQuery.brand = { $regex: filters.brand, $options: 'i' };
    if (filters.inStock) searchQuery['inventory.quantity'] = { $gt: 0 };
    if (priceRange) {
      searchQuery['pricing.salePrice'] = {};
      if (priceRange.min) searchQuery['pricing.salePrice'].$gte = priceRange.min;
      if (priceRange.max) searchQuery['pricing.salePrice'].$lte = priceRange.max;
    }
    if (rating) searchQuery['rating.average'] = { $gte: parseFloat(rating) };

    // Determine sort order
    let sort = {};
    switch (sortBy) {
      case 'price_low':
        sort = { 'pricing.salePrice': 1 };
        break;
      case 'price_high':
        sort = { 'pricing.salePrice': -1 };
        break;
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { 'rating.average': -1, 'pricing.salePrice': 1 };
    }

    return await Product.find(searchQuery)
      .populate('business', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  };

  /**
   * Advanced vehicle search
   */
  advancedVehicleSearch = async (query, filters, priceRange, sortBy, skip, limit) => {
    let searchQuery = {
      status: 'available',
      isActive: true,
      $or: [
        { make: { $regex: query, $options: 'i' } },
        { model: { $regex: query, $options: 'i' } }
      ]
    };

    // Apply filters
    if (filters.make) searchQuery.make = { $regex: filters.make, $options: 'i' };
    if (filters.bodyType) searchQuery.bodyType = filters.bodyType;
    if (filters.fuelType) searchQuery.fuelType = filters.fuelType;
    if (filters.transmission) searchQuery.transmission = filters.transmission;
    if (filters.yearRange) {
      searchQuery.year = {};
      if (filters.yearRange.min) searchQuery.year.$gte = filters.yearRange.min;
      if (filters.yearRange.max) searchQuery.year.$lte = filters.yearRange.max;
    }
    if (priceRange) {
      searchQuery.price = {};
      if (priceRange.min) searchQuery.price.$gte = priceRange.min;
      if (priceRange.max) searchQuery.price.$lte = priceRange.max;
    }

    // Determine sort order
    let sort = {};
    switch (sortBy) {
      case 'price_low':
        sort = { price: 1 };
        break;
      case 'price_high':
        sort = { price: -1 };
        break;
      case 'year_new':
        sort = { year: -1 };
        break;
      case 'mileage_low':
        sort = { mileage: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    return await Vehicle.find(searchQuery)
      .populate('business', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  };

  /**
   * Advanced wedding vendor search
   */
  advancedWeddingSearch = async (query, filters, location, rating, sortBy, skip, limit) => {
    let searchQuery = {
      isActive: true,
      $or: [
        { businessName: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { specialties: { $in: [new RegExp(query, 'i')] } }
      ]
    };

    // Apply filters
    if (filters.category) searchQuery.category = filters.category;
    if (location) searchQuery['location.city'] = { $regex: location, $options: 'i' };
    if (rating) searchQuery['rating.average'] = { $gte: parseFloat(rating) };

    // Determine sort order
    let sort = {};
    switch (sortBy) {
      case 'rating':
        sort = { 'rating.average': -1 };
        break;
      case 'newest':
        sort = { createdAt: -1 };
        break;
      default:
        sort = { 'rating.average': -1, createdAt: -1 };
    }

    return await WeddingVendor.find(searchQuery)
      .populate('business', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit);
  };
}

module.exports = new SearchController();

