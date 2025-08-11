const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Business = require('../models/Business');
const Hotel = require('../models/Hotel');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Vehicle = require('../models/Vehicle');
const { VehicleCategory } = require('../models/Category');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/storebuilder'
    );
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Business.deleteMany({});
    await Hotel.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Vehicle.deleteMany({});
    await VehicleCategory.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const users = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user',
      },
      {
        name: 'Jane Smith',
        email: 'jane@business.com',
        password: 'password123',
        role: 'vendor',
      },
      {
        name: 'Admin User',
        email: 'admin@storebuilder.com',
        password: 'admin123',
        role: 'admin',
      },
    ];

    const createdUsers = await User.create(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    const vendorUser = createdUsers.find(u => u.role === 'vendor');

    // Create businesses
    const businesses = [
      {
        name: 'Grand Palace Hotel',
        slug: 'grand-palace-hotel',
        description: 'Luxury hotel in the heart of the city',
        type: 'hotel',
        owner: vendorUser._id,
        businessInfo: {
          address: {
            street: '123 Hotel Street',
            city: 'New York',
            state: 'NY',
            country: 'USA',
            zipCode: '10001',
          },
          contact: {
            phone: '+1-555-0123',
            email: 'info@grandpalace.com',
          },
        },
        settings: {
          isPublished: true,
        },
      },
      {
        name: 'TechStore Pro',
        slug: 'techstore-pro',
        description: 'Premium electronics and gadgets',
        type: 'ecommerce',
        owner: vendorUser._id,
        businessInfo: {
          address: {
            street: '456 Tech Avenue',
            city: 'San Francisco',
            state: 'CA',
            country: 'USA',
            zipCode: '94105',
          },
          contact: {
            phone: '+1-555-0456',
            email: 'info@techstore.com',
          },
        },
        settings: {
          isPublished: true,
        },
      },
    ];

    const createdBusinesses = await Business.create(businesses);
    console.log(`✅ Created ${createdBusinesses.length} businesses`);

    // Create hotel
    const hotelBusiness = createdBusinesses.find(b => b.type === 'hotel');
    const hotel = {
      business: hotelBusiness._id,
      name: 'Grand Palace Hotel',
      description: 'Experience luxury and comfort at the Grand Palace Hotel',
      starRating: 5,
      location: {
        address: '123 Hotel Street',
        city: 'New York',
        state: 'NY',
        country: 'USA',
      },
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d',
      ],
      mainImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
      rooms: [
        {
          name: 'Deluxe Room',
          type: 'Deluxe',
          description: 'Spacious room with city view',
          price: 299,
          capacity: 2,
          amenities: ['Free WiFi', 'Air Conditioning', 'Mini Bar'],
          images: [
            'https://images.unsplash.com/photo-1631049307264-da0ec9d70304',
          ],
        },
        {
          name: 'Executive Suite',
          type: 'Suite',
          description: 'Luxury suite with living area',
          price: 499,
          capacity: 4,
          amenities: [
            'Free WiFi',
            'Air Conditioning',
            'Mini Bar',
            'Living Room',
          ],
          images: [
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b',
          ],
        },
      ],
      amenities: ['Free WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant'],
      pricing: {
        startingPrice: 299,
      },
    };

    await Hotel.create(hotel);
    console.log('✅ Created hotel');

    // Create ecommerce categories and products
    const ecommerceBusiness = createdBusinesses.find(
      b => b.type === 'ecommerce'
    );

    const categories = [
      {
        business: ecommerceBusiness._id,
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
      },
      {
        business: ecommerceBusiness._id,
        name: 'Computers',
        description: 'Laptops, desktops, and accessories',
      },
    ];

    const createdCategories = await Category.create(categories);
    console.log(`✅ Created ${createdCategories.length} categories`);

    const products = [
      {
        business: ecommerceBusiness._id,
        name: 'Premium Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation',
        category: createdCategories[0]._id,
        pricing: {
          price: 299.99,
          originalPrice: 399.99,
          onSale: true,
        },
        inventory: {
          quantity: 50,
        },
        images: {
          main: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
          gallery: [
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
            'https://images.unsplash.com/photo-1484704849700-f032a568e944',
          ],
        },
        featured: true,
        status: 'published',
      },
      {
        business: ecommerceBusiness._id,
        name: 'Gaming Laptop Pro',
        description: 'High-performance gaming laptop with RTX graphics',
        category: createdCategories[1]._id,
        pricing: {
          price: 1599.99,
        },
        inventory: {
          quantity: 25,
        },
        images: {
          main: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302',
          gallery: [
            'https://images.unsplash.com/photo-1603302576837-37561b2e2302',
          ],
        },
        status: 'published',
      },
    ];

    await Product.create(products);
    console.log(`✅ Created ${products.length} products`);

    console.log('🎉 Database seeding completed successfully!');
    console.log(`
📊 Summary:
- Users: ${createdUsers.length}
- Businesses: ${createdBusinesses.length}
- Hotels: 1
- Categories: ${createdCategories.length}
- Products: ${products.length}

🔐 Test Credentials:
- Admin: admin@storebuilder.com / admin123
- Vendor: jane@business.com / password123
- User: john@example.com / password123

🌐 Test Business URLs:
- Hotel: http://localhost:3000/grand-palace-hotel
- Ecommerce: http://localhost:3000/techstore-pro
    `);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedDatabase();
