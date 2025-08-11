const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

// Add product to wishlist (for frontend addToWishlist)
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const { vendorSlug, notes, priority } = req.body;
    const userId = req.user.id;

    // Find vendor by slug
    const vendor = await Vendor.findOne({ slug: vendorSlug });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Verify product exists and belongs to vendor
    const product = await Product.findOne({ 
      _id: productId, 
      seller: vendor.owner 
    });
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find or create wishlist for user and vendor
    let wishlist = await Wishlist.findOrCreate(userId, vendor._id);

    // Add item to wishlist
    await wishlist.addItem(productId, notes, priority);

    // Populate the updated wishlist
    wishlist = await Wishlist.findById(wishlist._id)
      .populate('items.product', 'name slug price images status')
      .populate('vendor', 'name slug businessInfo.logo');

    res.json({
      success: true,
      message: 'Product added to wishlist',
      data: {
        wishlist,
        productId,
        itemCount: wishlist.itemCount
      }
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add product to wishlist',
      error: error.message
    });
  }
};

// Remove product from wishlist (for frontend removeFromWishlist)
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const { vendorSlug } = req.body;
    const userId = req.user.id;

    // Find vendor by slug
    const vendor = await Vendor.findOne({ slug: vendorSlug });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Find wishlist
    const wishlist = await Wishlist.findOne({ 
      user: userId, 
      vendor: vendor._id 
    });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Remove item from wishlist
    await wishlist.removeItem(productId);

    // Populate the updated wishlist
    const updatedWishlist = await Wishlist.findById(wishlist._id)
      .populate('items.product', 'name slug price images status')
      .populate('vendor', 'name slug businessInfo.logo');

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      data: {
        wishlist: updatedWishlist,
        productId,
        itemCount: updatedWishlist.itemCount
      }
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove product from wishlist',
      error: error.message
    });
  }
};

// Get user's wishlist for a specific vendor
const getVendorWishlist = async (req, res) => {
  try {
    const { vendorSlug } = req.params;
    const userId = req.user.id;

    // Find vendor by slug
    const vendor = await Vendor.findOne({ slug: vendorSlug });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Find wishlist
    const wishlist = await Wishlist.findOne({ 
      user: userId, 
      vendor: vendor._id 
    })
    .populate('items.product', 'name slug price images status rating')
    .populate('vendor', 'name slug businessInfo.logo');

    if (!wishlist) {
      // Return empty wishlist structure
      return res.json({
        success: true,
        data: {
          wishlist: {
            items: [],
            itemCount: 0,
            totalValue: 0,
            vendor: {
              name: vendor.name,
              slug: vendor.slug,
              businessInfo: { logo: vendor.businessInfo.logo }
            }
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        wishlist
      }
    });
  } catch (error) {
    console.error('Error fetching vendor wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlist',
      error: error.message
    });
  }
};

// Get all user's wishlists across vendors
const getAllUserWishlists = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [wishlists, total] = await Promise.all([
      Wishlist.find({ user: userId })
        .populate('vendor', 'name slug businessInfo.logo rating')
        .populate('items.product', 'name slug price images status')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Wishlist.countDocuments({ user: userId })
    ]);

    res.json({
      success: true,
      data: {
        wishlists,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: skip + wishlists.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user wishlists:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wishlists',
      error: error.message
    });
  }
};

// Update wishlist settings
const updateWishlist = async (req, res) => {
  try {
    const { wishlistId } = req.params;
    const { name, description, isPublic, tags } = req.body;
    const userId = req.user.id;

    // Find wishlist and verify ownership
    const wishlist = await Wishlist.findOne({ 
      _id: wishlistId, 
      user: userId 
    });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Update wishlist
    const updatedWishlist = await Wishlist.findByIdAndUpdate(
      wishlistId,
      { name, description, isPublic, tags },
      { new: true, runValidators: true }
    )
    .populate('vendor', 'name slug businessInfo.logo')
    .populate('items.product', 'name slug price images status');

    res.json({
      success: true,
      message: 'Wishlist updated successfully',
      data: {
        wishlist: updatedWishlist
      }
    });
  } catch (error) {
    console.error('Error updating wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update wishlist',
      error: error.message
    });
  }
};

// Clear all items from wishlist
const clearWishlist = async (req, res) => {
  try {
    const { wishlistId } = req.params;
    const userId = req.user.id;

    // Find wishlist and verify ownership
    const wishlist = await Wishlist.findOne({ 
      _id: wishlistId, 
      user: userId 
    });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Clear all items
    await wishlist.clearItems();

    res.json({
      success: true,
      message: 'Wishlist cleared successfully',
      data: {
        wishlist: {
          ...wishlist.toObject(),
          items: [],
          itemCount: 0,
          totalValue: 0
        }
      }
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear wishlist',
      error: error.message
    });
  }
};

// Share wishlist (generate share token)
const shareWishlist = async (req, res) => {
  try {
    const { wishlistId } = req.params;
    const userId = req.user.id;

    // Find wishlist and verify ownership
    const wishlist = await Wishlist.findOne({ 
      _id: wishlistId, 
      user: userId 
    });
    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    // Generate share token and make public
    const shareToken = wishlist.generateShareToken();
    wishlist.isPublic = true;
    await wishlist.save();

    res.json({
      success: true,
      message: 'Wishlist share link generated',
      data: {
        shareToken,
        shareUrl: `${req.protocol}://${req.get('host')}/api/ecommerce/wishlist/shared/${shareToken}`,
        wishlist: {
          id: wishlist._id,
          name: wishlist.name,
          itemCount: wishlist.itemCount,
          isPublic: wishlist.isPublic
        }
      }
    });
  } catch (error) {
    console.error('Error sharing wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share wishlist',
      error: error.message
    });
  }
};

// Get shared wishlist by token
const getSharedWishlist = async (req, res) => {
  try {
    const { shareToken } = req.params;

    const wishlist = await Wishlist.findOne({ 
      shareToken, 
      isPublic: true 
    })
    .populate('user', 'name')
    .populate('vendor', 'name slug businessInfo.logo rating')
    .populate('items.product', 'name slug price images status rating');

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: 'Shared wishlist not found or no longer public'
      });
    }

    res.json({
      success: true,
      data: {
        wishlist: {
          ...wishlist.toObject(),
          owner: wishlist.user.name,
          user: undefined // Remove full user details for privacy
        }
      }
    });
  } catch (error) {
    console.error('Error fetching shared wishlist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shared wishlist',
      error: error.message
    });
  }
};

// Get public wishlists (discovery)
const getPublicWishlists = async (req, res) => {
  try {
    const { page = 1, limit = 10, vendor } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const filter = { isPublic: true };
    if (vendor) {
      const vendorDoc = await Vendor.findOne({ slug: vendor });
      if (vendorDoc) {
        filter.vendor = vendorDoc._id;
      }
    }

    const [wishlists, total] = await Promise.all([
      Wishlist.find(filter)
        .populate('user', 'name')
        .populate('vendor', 'name slug businessInfo.logo rating')
        .populate('items.product', 'name slug price images')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Wishlist.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        wishlists: wishlists.map(wishlist => ({
          ...wishlist.toObject(),
          owner: wishlist.user.name,
          user: undefined // Remove full user details for privacy
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: skip + wishlists.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching public wishlists:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch public wishlists',
      error: error.message
    });
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getVendorWishlist,
  getAllUserWishlists,
  updateWishlist,
  clearWishlist,
  shareWishlist,
  getSharedWishlist,
  getPublicWishlists
};
