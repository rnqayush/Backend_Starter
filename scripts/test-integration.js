const axios = require('axios');
const colors = require('colors');

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let testBusinessId = '';
let testHotelId = '';
let testProductId = '';

// Test data
const testUser = {
  name: 'Integration Test User',
  email: 'test@integration.com',
  password: 'test123456',
};

const testBusiness = {
  name: 'Test Integration Business',
  type: 'hotel',
  businessInfo: {
    description: 'A test business for integration testing',
    address: {
      street: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
    },
    contact: {
      phone: '+1234567890',
      email: 'test@business.com',
    },
  },
};

const testHotel = {
  name: 'Test Integration Hotel',
  description: 'A beautiful test hotel',
  address: {
    street: '456 Hotel Avenue',
    city: 'Hotel City',
    state: 'Hotel State',
    zipCode: '67890',
  },
  pricing: {
    basePrice: 5000,
  },
  amenities: ['wifi', 'parking', 'pool'],
};

const testProduct = {
  name: 'Test Integration Product',
  description: 'A wonderful test product',
  pricing: {
    price: 999,
  },
  inventory: {
    quantity: 100,
  },
  images: {
    main: 'https://via.placeholder.com/300',
  },
  sku: 'TEST-PROD-001',
};

// Helper function to make HTTP requests
async function makeRequest(method, endpoint, data = null, useAuth = false) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (useAuth && authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (data && (method === 'POST' || method === 'PUT')) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response ? error.response.data : error.message,
      status: error.response ? error.response.status : 500,
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('\n🏥 Testing Health Check...'.cyan);
  const result = await makeRequest('GET', '/health');

  if (result.success) {
    console.log('✅ Health check passed'.green);
    console.log(`   Database: ${result.data.database}`.gray);
    console.log(`   Environment: ${result.data.environment}`.gray);
    return true;
  } else {
    console.log('❌ Health check failed'.red);
    console.log(`   Error: ${result.error}`.red);
    return false;
  }
}

async function testUserRegistration() {
  console.log('\n👤 Testing User Registration...'.cyan);
  const result = await makeRequest('POST', '/api/auth/register', testUser);

  if (result.success) {
    console.log('✅ User registration successful'.green);
    authToken = result.data.data.token;
    console.log(`   Token: ${authToken.substring(0, 20)}...`.gray);
    return true;
  } else {
    console.log('❌ User registration failed'.red);
    console.log(`   Error: ${JSON.stringify(result.error)}`.red);
    return false;
  }
}

async function testUserLogin() {
  console.log('\n🔐 Testing User Login...'.cyan);
  const loginData = {
    email: testUser.email,
    password: testUser.password,
  };

  const result = await makeRequest('POST', '/api/auth/login', loginData);

  if (result.success) {
    console.log('✅ User login successful'.green);
    authToken = result.data.data.token;
    return true;
  } else {
    console.log('❌ User login failed'.red);
    console.log(`   Error: ${JSON.stringify(result.error)}`.red);
    return false;
  }
}

async function testBusinessCreation() {
  console.log('\n🏢 Testing Business Creation...'.cyan);
  const result = await makeRequest('POST', '/api/business', testBusiness, true);

  if (result.success) {
    console.log('✅ Business creation successful'.green);
    testBusinessId = result.data.data._id;
    console.log(`   Business ID: ${testBusinessId}`.gray);
    console.log(`   Business Slug: ${result.data.data.slug}`.gray);
    return true;
  } else {
    console.log('❌ Business creation failed'.red);
    console.log(`   Error: ${JSON.stringify(result.error)}`.red);
    return false;
  }
}

async function testHotelCreation() {
  console.log('\n🏨 Testing Hotel Creation...'.cyan);
  const hotelData = { ...testHotel, business: testBusinessId };
  const result = await makeRequest('POST', '/api/hotels', hotelData, true);

  if (result.success) {
    console.log('✅ Hotel creation successful'.green);
    testHotelId = result.data.data._id;
    console.log(`   Hotel ID: ${testHotelId}`.gray);
    return true;
  } else {
    console.log('❌ Hotel creation failed'.red);
    console.log(`   Error: ${JSON.stringify(result.error)}`.red);
    return false;
  }
}

async function testProductCreation() {
  console.log('\n🛍️ Testing Product Creation...'.cyan);

  // First create a category
  const categoryData = {
    name: 'Test Category',
    business: testBusinessId,
  };

  const categoryResult = await makeRequest(
    'POST',
    '/api/ecommerce/categories',
    categoryData,
    true
  );

  if (!categoryResult.success) {
    console.log('❌ Category creation failed'.red);
    return false;
  }

  const productData = {
    ...testProduct,
    business: testBusinessId,
    category: categoryResult.data.data._id,
  };

  const result = await makeRequest(
    'POST',
    '/api/ecommerce/products',
    productData,
    true
  );

  if (result.success) {
    console.log('✅ Product creation successful'.green);
    testProductId = result.data.data._id;
    console.log(`   Product ID: ${testProductId}`.gray);
    return true;
  } else {
    console.log('❌ Product creation failed'.red);
    console.log(`   Error: ${JSON.stringify(result.error)}`.red);
    return false;
  }
}

async function testDataRetrieval() {
  console.log('\n📊 Testing Data Retrieval...'.cyan);

  // Test getting hotels by business
  const hotelsResult = await makeRequest(
    'GET',
    `/api/hotels/business/${testBusinessId}`
  );
  if (hotelsResult.success) {
    console.log('✅ Hotels retrieval successful'.green);
    console.log(`   Found ${hotelsResult.data.data.hotels.length} hotels`.gray);
  } else {
    console.log('❌ Hotels retrieval failed'.red);
  }

  // Test getting products by business
  const productsResult = await makeRequest(
    'GET',
    `/api/ecommerce/business/${testBusinessId}/products`
  );
  if (productsResult.success) {
    console.log('✅ Products retrieval successful'.green);
    console.log(
      `   Found ${productsResult.data.data.products.length} products`.gray
    );
  } else {
    console.log('❌ Products retrieval failed'.red);
  }

  // Test getting business by slug
  const businessResult = await makeRequest(
    'GET',
    `/api/business/test-integration-business`
  );
  if (businessResult.success) {
    console.log('✅ Business retrieval by slug successful'.green);
  } else {
    console.log('❌ Business retrieval by slug failed'.red);
  }

  return (
    hotelsResult.success && productsResult.success && businessResult.success
  );
}

async function testSearchFunctionality() {
  console.log('\n🔍 Testing Search Functionality...'.cyan);

  // Test hotel search
  const hotelSearchResult = await makeRequest(
    'GET',
    '/api/hotels/search?city=Hotel%20City'
  );
  if (hotelSearchResult.success) {
    console.log('✅ Hotel search successful'.green);
    console.log(
      `   Found ${hotelSearchResult.data.data.hotels.length} hotels`.gray
    );
  } else {
    console.log('❌ Hotel search failed'.red);
  }

  // Test product search
  const productSearchResult = await makeRequest(
    'GET',
    '/api/ecommerce/search?search=Test'
  );
  if (productSearchResult.success) {
    console.log('✅ Product search successful'.green);
    console.log(
      `   Found ${productSearchResult.data.data.products.length} products`.gray
    );
  } else {
    console.log('❌ Product search failed'.red);
  }

  return hotelSearchResult.success && productSearchResult.success;
}

async function testAnalytics() {
  console.log('\n📈 Testing Analytics...'.cyan);

  // Test business analytics
  const businessAnalyticsResult = await makeRequest(
    'GET',
    `/api/business/${testBusinessId}/analytics`,
    null,
    true
  );
  if (businessAnalyticsResult.success) {
    console.log('✅ Business analytics successful'.green);
  } else {
    console.log('❌ Business analytics failed'.red);
  }

  return businessAnalyticsResult.success;
}

async function cleanup() {
  console.log('\n🧹 Cleaning up test data...'.cyan);

  // Delete test data (in reverse order of creation)
  if (testProductId) {
    await makeRequest(
      'DELETE',
      `/api/ecommerce/products/${testProductId}`,
      null,
      true
    );
  }

  if (testHotelId) {
    await makeRequest('DELETE', `/api/hotels/${testHotelId}`, null, true);
  }

  if (testBusinessId) {
    await makeRequest('DELETE', `/api/business/${testBusinessId}`, null, true);
  }

  console.log('✅ Cleanup completed'.green);
}

// Main test runner
async function runIntegrationTests() {
  console.log('🚀 Starting StoreBuilder Backend Integration Tests'.rainbow);
  console.log('='.repeat(60).cyan);

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Business Creation', fn: testBusinessCreation },
    { name: 'Hotel Creation', fn: testHotelCreation },
    { name: 'Product Creation', fn: testProductCreation },
    { name: 'Data Retrieval', fn: testDataRetrieval },
    { name: 'Search Functionality', fn: testSearchFunctionality },
    { name: 'Analytics', fn: testAnalytics },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} threw an error: ${error.message}`.red);
      failed++;
    }
  }

  // Cleanup
  await cleanup();

  // Summary
  console.log('\n' + '='.repeat(60).cyan);
  console.log('📊 Integration Test Summary'.rainbow);
  console.log('='.repeat(60).cyan);
  console.log(`✅ Passed: ${passed}`.green);
  console.log(`❌ Failed: ${failed}`.red);
  console.log(
    `📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`
      .yellow
  );

  if (failed === 0) {
    console.log(
      '\n🎉 All tests passed! Your backend is working perfectly! 🎉'.rainbow
    );
  } else {
    console.log(
      '\n⚠️  Some tests failed. Please check the errors above. ⚠️'.yellow
    );
  }

  process.exit(failed === 0 ? 0 : 1);
}

// Run tests if this file is executed directly
if (require.main === module) {
  runIntegrationTests().catch(error => {
    console.error('💥 Test runner crashed:'.red, error);
    process.exit(1);
  });
}

module.exports = { runIntegrationTests };
