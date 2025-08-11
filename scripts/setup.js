#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const colors = require('colors');

console.log('🚀 StoreBuilder Backend Setup'.rainbow);
console.log('='.repeat(50).cyan);

// Check if required directories exist
const requiredDirs = ['uploads', 'logs', 'temp'];
console.log('\n📁 Creating required directories...'.cyan);

requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, '..', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dir}`.green);
  } else {
    console.log(`✅ Directory exists: ${dir}`.gray);
  }
});

// Check environment file
console.log('\n⚙️  Checking environment configuration...'.cyan);
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from .env.example'.green);
    console.log(
      '⚠️  Please update the .env file with your actual configuration'.yellow
    );
  } else {
    console.log(
      '❌ No .env.example file found. Please create .env manually'.red
    );
  }
} else {
  console.log('✅ .env file exists'.gray);
}

// Verify MongoDB connection
console.log('\n🗄️  Checking MongoDB connection...'.cyan);
const mongoose = require('mongoose');

async function checkMongoDB() {
  try {
    // Load environment variables
    require('dotenv').config();

    const mongoUri =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/storebuilder';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ MongoDB connection successful'.green);
    console.log(`   Connected to: ${mongoUri}`.gray);

    // Check collections
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    console.log(`   Collections found: ${collections.length}`.gray);

    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ MongoDB connection failed'.red);
    console.log(`   Error: ${error.message}`.red);
    console.log('\n💡 Troubleshooting:'.yellow);
    console.log('   1. Make sure MongoDB is running'.yellow);
    console.log('   2. Check MONGODB_URI in .env file'.yellow);
    console.log('   3. Verify database permissions'.yellow);
  }
}

// Create default admin user function
async function createDefaultAdmin() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/storebuilder',
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    const User = require('../models/User');
    const bcrypt = require('bcryptjs');

    // Check if admin user exists
    const adminExists = await User.findOne({ email: 'admin@storebuilder.com' });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 12);

      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@storebuilder.com',
        password: hashedPassword,
        role: 'admin',
        profile: {
          bio: 'System Administrator',
          location: 'System',
        },
      });

      await adminUser.save();
      console.log('✅ Created default admin user'.green);
      console.log('   Email: admin@storebuilder.com'.gray);
      console.log('   Password: admin123'.gray);
    } else {
      console.log('✅ Admin user already exists'.gray);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ Failed to create admin user'.red);
    console.log(`   Error: ${error.message}`.red);
  }
}

// Package dependencies check
console.log('\n📦 Checking package dependencies...'.cyan);
try {
  const packageJson = require('../package.json');
  const dependencies = Object.keys(packageJson.dependencies);
  console.log(`✅ Found ${dependencies.length} dependencies`.green);

  // Check if node_modules exists
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('⚠️  node_modules not found. Run: npm install'.yellow);
  } else {
    console.log('✅ node_modules directory exists'.gray);
  }
} catch (error) {
  console.log('❌ Error reading package.json'.red);
}

// Environment variables validation
console.log('\n🔑 Validating environment variables...'.cyan);
require('dotenv').config();

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'FRONTEND_URL',
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length === 0) {
  console.log('✅ All required environment variables are set'.green);
} else {
  console.log('⚠️  Missing environment variables:'.yellow);
  missingEnvVars.forEach(varName => {
    console.log(`   - ${varName}`.yellow);
  });
}

// Run setup
async function runSetup() {
  await checkMongoDB();

  if (!missingEnvVars.includes('MONGODB_URI')) {
    console.log('\n👤 Setting up default admin user...'.cyan);
    await createDefaultAdmin();
  }

  // Display final instructions
  console.log('\n' + '='.repeat(50).cyan);
  console.log('🎉 Setup Complete!'.rainbow);
  console.log('='.repeat(50).cyan);

  console.log('\n📋 Next Steps:'.yellow);
  console.log('1. Install dependencies: npm install'.white);
  console.log('2. Update .env with your configuration'.white);
  console.log('3. Seed the database: npm run seed'.white);
  console.log('4. Start the server: npm run dev'.white);
  console.log('5. Test the API: npm run test:integration'.white);

  console.log('\n🔗 Useful Commands:'.yellow);
  console.log('• Start server: npm run dev'.white);
  console.log('• Seed database: npm run seed'.white);
  console.log('• Run tests: npm run test:integration'.white);
  console.log('• Check health: curl http://localhost:5000/health'.white);

  console.log('\n📚 API Documentation:'.yellow);
  console.log('• Health: GET /health'.white);
  console.log('• Auth: POST /api/auth/login'.white);
  console.log('• Business: GET /api/business/:slug'.white);
  console.log('• Hotels: GET /api/hotels/business/:businessId'.white);
  console.log(
    '• Products: GET /api/ecommerce/business/:businessId/products'.white
  );

  console.log('\n🎯 Default Credentials:'.yellow);
  console.log('• Admin: admin@storebuilder.com / admin123'.white);
  console.log('• Check README.md for more test credentials'.white);
}

runSetup().catch(error => {
  console.error('💥 Setup failed:'.red, error);
  process.exit(1);
});
