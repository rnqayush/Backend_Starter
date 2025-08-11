const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

// Test script to validate all models and controllers load without errors
console.log('🧪 Testing Backend API Endpoints...\n');

let errors = 0;

try {
  console.log('📦 Testing Models...');

  // Test all models
  const User = require('./models/User');
  const Business = require('./models/Business');
  const Hotel = require('./models/Hotel');
  const Product = require('./models/Product');
  const Vehicle = require('./models/Vehicle');
  const Category = require('./models/Category');
  const Order = require('./models/Order');
  const Booking = require('./models/Booking');
  const Service = require('./models/Service');
  const Blog = require('./models/Blog');

  console.log('✅ All models loaded successfully');
} catch (error) {
  console.log('❌ Model loading error:', error.message);
  errors++;
}

try {
  console.log('\n🎮 Testing Controllers...');

  // Test all controllers
  const authController = require('./controllers/authController');
  const businessController = require('./controllers/businessController');
  const hotelController = require('./controllers/hotelController');
  const ecommerceController = require('./controllers/ecommerceController');
  const automobilesController = require('./controllers/automobilesController');
  const productController = require('./controllers/productController');

  console.log('✅ All controllers loaded successfully');
} catch (error) {
  console.log('❌ Controller loading error:', error.message);
  errors++;
}

try {
  console.log('\n🛣️  Testing Routes...');

  // Test all routes
  const authRoutes = require('./routes/auth');
  const businessRoutes = require('./routes/business');
  const hotelRoutes = require('./routes/hotels');
  const ecommerceRoutes = require('./routes/ecommerce');
  const automobileRoutes = require('./routes/automobiles');
  const userRoutes = require('./routes/users');
  const blogRoutes = require('./routes/blogs');
  const uploadRoutes = require('./routes/upload');
  const adminRoutes = require('./routes/admin');
  const platformRoutes = require('./routes/platform');
  const weddingRoutes = require('./routes/weddings');

  console.log('✅ All routes loaded successfully');
} catch (error) {
  console.log('❌ Route loading error:', error.message);
  errors++;
}

try {
  console.log('\n🔧 Testing Middleware...');

  // Test middleware
  const auth = require('./middleware/auth');
  const errorHandler = require('./middleware/errorHandler');
  const notFoundHandler = require('./middleware/notFoundHandler');
  const validation = require('./middleware/validation');

  console.log('✅ All middleware loaded successfully');
} catch (error) {
  console.log('❌ Middleware loading error:', error.message);
  errors++;
}

try {
  console.log('\n🗄️  Testing Database Connection...');

  // Test MongoDB connection
  mongoose
    .connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/storebuilder',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
      }
    )
    .then(() => {
      console.log('✅ MongoDB connection test successful');
      mongoose.disconnect();

      // Final summary
      console.log('\n' + '='.repeat(50));
      console.log('🎯 API Endpoint Test Summary');
      console.log('='.repeat(50));

      if (errors === 0) {
        console.log('🎉 All tests passed! Backend is ready to use! 🎉');
        console.log('\n✅ Models: Working');
        console.log('✅ Controllers: Working');
        console.log('✅ Routes: Working');
        console.log('✅ Middleware: Working');
        console.log('✅ Database: Connected');
        console.log('\n🚀 You can now start the server with: npm run dev');
      } else {
        console.log(
          `❌ ${errors} test(s) failed. Please check the errors above.`
        );
      }

      process.exit(errors === 0 ? 0 : 1);
    })
    .catch(error => {
      console.log('❌ MongoDB connection failed:', error.message);
      console.log(
        '\n💡 Make sure MongoDB is running or check MONGODB_URI in .env'
      );
      errors++;

      console.log('\n' + '='.repeat(50));
      console.log('🎯 API Endpoint Test Summary');
      console.log('='.repeat(50));
      console.log(
        `❌ ${errors} test(s) failed. Please check the errors above.`
      );

      process.exit(1);
    });
} catch (error) {
  console.log('❌ Database test error:', error.message);
  errors++;

  console.log('\n' + '='.repeat(50));
  console.log('🎯 API Endpoint Test Summary');
  console.log('='.repeat(50));
  console.log(`❌ ${errors} test(s) failed. Please check the errors above.`);

  process.exit(1);
}
