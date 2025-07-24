#!/usr/bin/env node

/**
 * Comprehensive API Testing Script for Backend_Starter
 * Tests all controllers and endpoints systematically
 */

import axios from 'axios';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000/api';
const TEST_RESULTS = [];
let authTokens = {
  customer: null,
  vendor: null,
  admin: null
};

// Test data
const testData = {
  customer: {
    name: 'John Customer',
    email: 'customer@test.com',
    password: 'password123',
    role: 'customer'
  },
  vendor: {
    name: 'Jane Vendor',
    email: 'vendor@test.com',
    password: 'password123',
    businessName: 'Test Business',
    category: 'hotel',
    phone: '+1234567890',
    description: 'Test business description',
    website: 'https://testbusiness.com'
  },
  admin: {
    email: 'admin@test.com',
    password: 'admin123'
  },
  hotel: {
    name: 'Test Hotel',
    description: 'A beautiful test hotel with amazing amenities',
    address: {
      street: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country',
      zipCode: '12345'
    },
    contactInfo: {
      phone: '+1234567890',
      email: 'hotel@test.com'
    },
    starRating: 4,
    pricing: {
      basePrice: 100.00
    },
    amenities: ['wifi', 'parking', 'pool'],
    images: ['image1.jpg', 'image2.jpg']
  },
  product: {
    name: 'Test Product',
    description: 'A high-quality test product with excellent features',
    category: 'electronics',
    sku: 'TEST-001',
    pricing: {
      basePrice: 299.99,
      salePrice: 249.99
    },
    inventory: {
      quantity: 100,
      lowStockThreshold: 10
    },
    specifications: {
      brand: 'TestBrand',
      model: 'TestModel'
    },
    images: ['product1.jpg', 'product2.jpg']
  },
  vehicle: {
    type: 'car',
    listingType: 'sale',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    condition: 'used',
    pricing: {
      basePrice: 25000
    },
    location: {
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country'
    },
    specifications: {
      mileage: 15000,
      fuelType: 'gasoline',
      transmission: 'automatic'
    },
    images: ['car1.jpg', 'car2.jpg']
  },
  weddingService: {
    serviceType: 'venue',
    serviceName: 'Grand Wedding Hall',
    description: 'Beautiful wedding venue with elegant decorations and excellent service',
    pricing: {
      basePrice: 5000
    },
    location: {
      city: 'Test City',
      state: 'Test State',
      country: 'Test Country'
    },
    capacity: {
      minGuests: 50,
      maxGuests: 500
    },
    features: ['air_conditioning', 'parking', 'catering_kitchen'],
    images: ['venue1.jpg', 'venue2.jpg']
  }
};

// Utility functions
const logTest = (endpoint, method, status, success, message, data = null) => {
  const result = {
    timestamp: new Date().toISOString(),
    endpoint,
    method,
    status,
    success,
    message,
    data: data ? JSON.stringify(data, null, 2) : null
  };
  TEST_RESULTS.push(result);
  
  const statusIcon = success ? '✅' : '❌';
  console.log(`${statusIcon} ${method} ${endpoint} - ${status} - ${message}`);
  
  if (!success && data) {
    console.log(`   Error: ${JSON.stringify(data, null, 2)}`);
  }
};

const makeRequest = async (method, endpoint, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...(data && { data })
    };

    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 500,
      data: error.response?.data || { message: error.message }
    };
  }
};

// Test functions
const testHealthEndpoints = async () => {
  console.log('\n🔍 Testing Health/Test Endpoints...');
  
  // Test ping endpoint
  const pingResult = await makeRequest('GET', '/test/ping');
  logTest('/test/ping', 'GET', pingResult.status, pingResult.success, 
    pingResult.success ? 'API ping successful' : 'API ping failed', 
    pingResult.data);

  // Test health endpoint
  const healthResult = await makeRequest('GET', '/test/health');
  logTest('/test/health', 'GET', healthResult.status, healthResult.success,
    healthResult.success ? 'Health check passed' : 'Health check failed',
    healthResult.data);

  // Test database endpoint
  const dbResult = await makeRequest('GET', '/test/db');
  logTest('/test/db', 'GET', dbResult.status, dbResult.success,
    dbResult.success ? 'Database connection healthy' : 'Database connection failed',
    dbResult.data);
};

const testAuthEndpoints = async () => {
  console.log('\n🔐 Testing Authentication Endpoints...');
  
  // Test customer registration
  const customerRegResult = await makeRequest('POST', '/auth/register', testData.customer);
  logTest('/auth/register', 'POST', customerRegResult.status, customerRegResult.success,
    customerRegResult.success ? 'Customer registration successful' : 'Customer registration failed',
    customerRegResult.data);

  // Test customer login
  const customerLoginResult = await makeRequest('POST', '/auth/login', {
    email: testData.customer.email,
    password: testData.customer.password
  });
  logTest('/auth/login', 'POST', customerLoginResult.status, customerLoginResult.success,
    customerLoginResult.success ? 'Customer login successful' : 'Customer login failed',
    customerLoginResult.data);

  if (customerLoginResult.success && customerLoginResult.data.data?.token) {
    authTokens.customer = customerLoginResult.data.data.token;
  }

  // Test get current user (protected)
  if (authTokens.customer) {
    const getMeResult = await makeRequest('GET', '/auth/me', null, authTokens.customer);
    logTest('/auth/me', 'GET', getMeResult.status, getMeResult.success,
      getMeResult.success ? 'Get current user successful' : 'Get current user failed',
      getMeResult.data);

    // Test update profile
    const updateProfileResult = await makeRequest('PUT', '/auth/profile', {
      name: 'John Updated Customer'
    }, authTokens.customer);
    logTest('/auth/profile', 'PUT', updateProfileResult.status, updateProfileResult.success,
      updateProfileResult.success ? 'Profile update successful' : 'Profile update failed',
      updateProfileResult.data);

    // Test change password
    const changePasswordResult = await makeRequest('PUT', '/auth/change-password', {
      currentPassword: testData.customer.password,
      newPassword: 'newpassword123'
    }, authTokens.customer);
    logTest('/auth/change-password', 'PUT', changePasswordResult.status, changePasswordResult.success,
      changePasswordResult.success ? 'Password change successful' : 'Password change failed',
      changePasswordResult.data);
  }
};

const testVendorEndpoints = async () => {
  console.log('\n🏪 Testing Vendor Endpoints...');
  
  // Test vendor registration
  const vendorRegResult = await makeRequest('POST', '/vendor/register', testData.vendor);
  logTest('/vendor/register', 'POST', vendorRegResult.status, vendorRegResult.success,
    vendorRegResult.success ? 'Vendor registration successful' : 'Vendor registration failed',
    vendorRegResult.data);

  // Test vendor login
  const vendorLoginResult = await makeRequest('POST', '/vendor/login', {
    email: testData.vendor.email,
    password: testData.vendor.password
  });
  logTest('/vendor/login', 'POST', vendorLoginResult.status, vendorLoginResult.success,
    vendorLoginResult.success ? 'Vendor login successful' : 'Vendor login failed',
    vendorLoginResult.data);

  if (vendorLoginResult.success && vendorLoginResult.data.data?.token) {
    authTokens.vendor = vendorLoginResult.data.data.token;
    
    // Test get vendor profile
    const getProfileResult = await makeRequest('GET', '/vendor/profile', null, authTokens.vendor);
    logTest('/vendor/profile', 'GET', getProfileResult.status, getProfileResult.success,
      getProfileResult.success ? 'Get vendor profile successful' : 'Get vendor profile failed',
      getProfileResult.data);

    // Test update vendor profile
    const updateProfileResult = await makeRequest('PUT', '/vendor/profile', {
      businessName: 'Updated Test Business',
      description: 'Updated business description'
    }, authTokens.vendor);
    logTest('/vendor/profile', 'PUT', updateProfileResult.status, updateProfileResult.success,
      updateProfileResult.success ? 'Vendor profile update successful' : 'Vendor profile update failed',
      updateProfileResult.data);

    // Test vendor dashboard
    const dashboardResult = await makeRequest('GET', '/vendor/dashboard', null, authTokens.vendor);
    logTest('/vendor/dashboard', 'GET', dashboardResult.status, dashboardResult.success,
      dashboardResult.success ? 'Vendor dashboard successful' : 'Vendor dashboard failed',
      dashboardResult.data);
  }

  // Test get vendor by ID (public)
  if (vendorRegResult.success && vendorRegResult.data.data?.vendor?.id) {
    const getVendorResult = await makeRequest('GET', `/vendor/${vendorRegResult.data.data.vendor.id}`);
    logTest(`/vendor/{id}`, 'GET', getVendorResult.status, getVendorResult.success,
      getVendorResult.success ? 'Get vendor by ID successful' : 'Get vendor by ID failed',
      getVendorResult.data);
  }
};

const testAdminEndpoints = async () => {
  console.log('\n👑 Testing Admin Endpoints...');
  
  // Test admin login
  const adminLoginResult = await makeRequest('POST', '/admin/login', testData.admin);
  logTest('/admin/login', 'POST', adminLoginResult.status, adminLoginResult.success,
    adminLoginResult.success ? 'Admin login successful' : 'Admin login failed',
    adminLoginResult.data);

  if (adminLoginResult.success && adminLoginResult.data.data?.token) {
    authTokens.admin = adminLoginResult.data.data.token;

    // Test admin dashboard
    const dashboardResult = await makeRequest('GET', '/admin/dashboard', null, authTokens.admin);
    logTest('/admin/dashboard', 'GET', dashboardResult.status, dashboardResult.success,
      dashboardResult.success ? 'Admin dashboard successful' : 'Admin dashboard failed',
      dashboardResult.data);

    // Test get all vendors
    const getAllVendorsResult = await makeRequest('GET', '/admin/vendors', null, authTokens.admin);
    logTest('/admin/vendors', 'GET', getAllVendorsResult.status, getAllVendorsResult.success,
      getAllVendorsResult.success ? 'Get all vendors successful' : 'Get all vendors failed',
      getAllVendorsResult.data);

    // Test get all users
    const getAllUsersResult = await makeRequest('GET', '/admin/users', null, authTokens.admin);
    logTest('/admin/users', 'GET', getAllUsersResult.status, getAllUsersResult.success,
      getAllUsersResult.success ? 'Get all users successful' : 'Get all users failed',
      getAllUsersResult.data);

    // Test vendor management (if we have a vendor ID)
    if (getAllVendorsResult.success && getAllVendorsResult.data.data?.vendors?.length > 0) {
      const vendorId = getAllVendorsResult.data.data.vendors[0]._id;

      // Test approve vendor
      const approveResult = await makeRequest('PUT', `/admin/vendors/${vendorId}/approve`, null, authTokens.admin);
      logTest(`/admin/vendors/{id}/approve`, 'PUT', approveResult.status, approveResult.success,
        approveResult.success ? 'Vendor approval successful' : 'Vendor approval failed',
        approveResult.data);

      // Test suspend vendor
      const suspendResult = await makeRequest('PUT', `/admin/vendors/${vendorId}/suspend`, null, authTokens.admin);
      logTest(`/admin/vendors/{id}/suspend`, 'PUT', suspendResult.status, suspendResult.success,
        suspendResult.success ? 'Vendor suspension successful' : 'Vendor suspension failed',
        suspendResult.data);

      // Test reject vendor
      const rejectResult = await makeRequest('PUT', `/admin/vendors/${vendorId}/reject`, {
        reason: 'Test rejection reason for comprehensive testing'
      }, authTokens.admin);
      logTest(`/admin/vendors/{id}/reject`, 'PUT', rejectResult.status, rejectResult.success,
        rejectResult.success ? 'Vendor rejection successful' : 'Vendor rejection failed',
        rejectResult.data);
    }
  }
};

const testHotelEndpoints = async () => {
  console.log('\n🏨 Testing Hotel Endpoints...');
  
  let hotelId = null;

  // Test create hotel (vendor only)
  if (authTokens.vendor) {
    const createResult = await makeRequest('POST', '/hotel', testData.hotel, authTokens.vendor);
    logTest('/hotel', 'POST', createResult.status, createResult.success,
      createResult.success ? 'Hotel creation successful' : 'Hotel creation failed',
      createResult.data);

    if (createResult.success && createResult.data.data?.hotel?.id) {
      hotelId = createResult.data.data.hotel.id;
    }
  }

  // Test get all hotels (public)
  const getAllResult = await makeRequest('GET', '/hotel');
  logTest('/hotel', 'GET', getAllResult.status, getAllResult.success,
    getAllResult.success ? 'Get all hotels successful' : 'Get all hotels failed',
    getAllResult.data);

  // Test get hotel by ID (public)
  if (hotelId) {
    const getByIdResult = await makeRequest('GET', `/hotel/${hotelId}`);
    logTest(`/hotel/{id}`, 'GET', getByIdResult.status, getByIdResult.success,
      getByIdResult.success ? 'Get hotel by ID successful' : 'Get hotel by ID failed',
      getByIdResult.data);

    // Test update hotel (vendor only)
    if (authTokens.vendor) {
      const updateResult = await makeRequest('PUT', `/hotel/${hotelId}`, {
        name: 'Updated Test Hotel',
        description: 'Updated hotel description'
      }, authTokens.vendor);
      logTest(`/hotel/{id}`, 'PUT', updateResult.status, updateResult.success,
        updateResult.success ? 'Hotel update successful' : 'Hotel update failed',
        updateResult.data);
    }
  }

  // Test vendor-specific hotel endpoints
  if (authTokens.vendor) {
    const getVendorHotelsResult = await makeRequest('GET', '/hotel/vendor/my-hotels', null, authTokens.vendor);
    logTest('/hotel/vendor/my-hotels', 'GET', getVendorHotelsResult.status, getVendorHotelsResult.success,
      getVendorHotelsResult.success ? 'Get vendor hotels successful' : 'Get vendor hotels failed',
      getVendorHotelsResult.data);

    const getHotelStatsResult = await makeRequest('GET', '/hotel/vendor/stats', null, authTokens.vendor);
    logTest('/hotel/vendor/stats', 'GET', getHotelStatsResult.status, getHotelStatsResult.success,
      getHotelStatsResult.success ? 'Get hotel stats successful' : 'Get hotel stats failed',
      getHotelStatsResult.data);

    // Test delete hotel (vendor only)
    if (hotelId) {
      const deleteResult = await makeRequest('DELETE', `/hotel/${hotelId}`, null, authTokens.vendor);
      logTest(`/hotel/{id}`, 'DELETE', deleteResult.status, deleteResult.success,
        deleteResult.success ? 'Hotel deletion successful' : 'Hotel deletion failed',
        deleteResult.data);
    }
  }
};

const testEcommerceEndpoints = async () => {
  console.log('\n🛒 Testing Ecommerce Endpoints...');
  
  let productId = null;

  // Test create product (vendor only)
  if (authTokens.vendor) {
    const createResult = await makeRequest('POST', '/ecommerce', testData.product, authTokens.vendor);
    logTest('/ecommerce', 'POST', createResult.status, createResult.success,
      createResult.success ? 'Product creation successful' : 'Product creation failed',
      createResult.data);

    if (createResult.success && createResult.data.data?.product?.id) {
      productId = createResult.data.data.product.id;
    }
  }

  // Test get all products (public)
  const getAllResult = await makeRequest('GET', '/ecommerce');
  logTest('/ecommerce', 'GET', getAllResult.status, getAllResult.success,
    getAllResult.success ? 'Get all products successful' : 'Get all products failed',
    getAllResult.data);

  // Test get product by ID (public)
  if (productId) {
    const getByIdResult = await makeRequest('GET', `/ecommerce/${productId}`);
    logTest(`/ecommerce/{id}`, 'GET', getByIdResult.status, getByIdResult.success,
      getByIdResult.success ? 'Get product by ID successful' : 'Get product by ID failed',
      getByIdResult.data);

    // Test update product (vendor only)
    if (authTokens.vendor) {
      const updateResult = await makeRequest('PUT', `/ecommerce/${productId}`, {
        name: 'Updated Test Product',
        description: 'Updated product description'
      }, authTokens.vendor);
      logTest(`/ecommerce/{id}`, 'PUT', updateResult.status, updateResult.success,
        updateResult.success ? 'Product update successful' : 'Product update failed',
        updateResult.data);
    }
  }

  // Test vendor-specific product endpoints
  if (authTokens.vendor) {
    const getVendorProductsResult = await makeRequest('GET', '/ecommerce/vendor/my-products', null, authTokens.vendor);
    logTest('/ecommerce/vendor/my-products', 'GET', getVendorProductsResult.status, getVendorProductsResult.success,
      getVendorProductsResult.success ? 'Get vendor products successful' : 'Get vendor products failed',
      getVendorProductsResult.data);

    // Test delete product (vendor only)
    if (productId) {
      const deleteResult = await makeRequest('DELETE', `/ecommerce/${productId}`, null, authTokens.vendor);
      logTest(`/ecommerce/{id}`, 'DELETE', deleteResult.status, deleteResult.success,
        deleteResult.success ? 'Product deletion successful' : 'Product deletion failed',
        deleteResult.data);
    }
  }
};

const testAutomobileEndpoints = async () => {
  console.log('\n🚗 Testing Automobile Endpoints...');
  
  let vehicleId = null;

  // Test create vehicle (vendor only)
  if (authTokens.vendor) {
    const createResult = await makeRequest('POST', '/automobile', testData.vehicle, authTokens.vendor);
    logTest('/automobile', 'POST', createResult.status, createResult.success,
      createResult.success ? 'Vehicle creation successful' : 'Vehicle creation failed',
      createResult.data);

    if (createResult.success && createResult.data.data?.vehicle?.id) {
      vehicleId = createResult.data.data.vehicle.id;
    }
  }

  // Test get all vehicles (public)
  const getAllResult = await makeRequest('GET', '/automobile');
  logTest('/automobile', 'GET', getAllResult.status, getAllResult.success,
    getAllResult.success ? 'Get all vehicles successful' : 'Get all vehicles failed',
    getAllResult.data);

  // Test get vehicle by ID (public)
  if (vehicleId) {
    const getByIdResult = await makeRequest('GET', `/automobile/${vehicleId}`);
    logTest(`/automobile/{id}`, 'GET', getByIdResult.status, getByIdResult.success,
      getByIdResult.success ? 'Get vehicle by ID successful' : 'Get vehicle by ID failed',
      getByIdResult.data);

    // Test update vehicle (vendor only)
    if (authTokens.vendor) {
      const updateResult = await makeRequest('PUT', `/automobile/${vehicleId}`, {
        make: 'Honda',
        model: 'Accord'
      }, authTokens.vendor);
      logTest(`/automobile/{id}`, 'PUT', updateResult.status, updateResult.success,
        updateResult.success ? 'Vehicle update successful' : 'Vehicle update failed',
        updateResult.data);
    }
  }

  // Test vendor-specific vehicle endpoints
  if (authTokens.vendor) {
    const getVendorVehiclesResult = await makeRequest('GET', '/automobile/vendor/my-vehicles', null, authTokens.vendor);
    logTest('/automobile/vendor/my-vehicles', 'GET', getVendorVehiclesResult.status, getVendorVehiclesResult.success,
      getVendorVehiclesResult.success ? 'Get vendor vehicles successful' : 'Get vendor vehicles failed',
      getVendorVehiclesResult.data);

    // Test delete vehicle (vendor only)
    if (vehicleId) {
      const deleteResult = await makeRequest('DELETE', `/automobile/${vehicleId}`, null, authTokens.vendor);
      logTest(`/automobile/{id}`, 'DELETE', deleteResult.status, deleteResult.success,
        deleteResult.success ? 'Vehicle deletion successful' : 'Vehicle deletion failed',
        deleteResult.data);
    }
  }
};

const testWeddingEndpoints = async () => {
  console.log('\n💒 Testing Wedding Endpoints...');
  
  let serviceId = null;

  // Test create wedding service (vendor only)
  if (authTokens.vendor) {
    const createResult = await makeRequest('POST', '/wedding', testData.weddingService, authTokens.vendor);
    logTest('/wedding', 'POST', createResult.status, createResult.success,
      createResult.success ? 'Wedding service creation successful' : 'Wedding service creation failed',
      createResult.data);

    if (createResult.success && createResult.data.data?.service?.id) {
      serviceId = createResult.data.data.service.id;
    }
  }

  // Test get all wedding services (public)
  const getAllResult = await makeRequest('GET', '/wedding');
  logTest('/wedding', 'GET', getAllResult.status, getAllResult.success,
    getAllResult.success ? 'Get all wedding services successful' : 'Get all wedding services failed',
    getAllResult.data);

  // Test get wedding service by ID (public)
  if (serviceId) {
    const getByIdResult = await makeRequest('GET', `/wedding/${serviceId}`);
    logTest(`/wedding/{id}`, 'GET', getByIdResult.status, getByIdResult.success,
      getByIdResult.success ? 'Get wedding service by ID successful' : 'Get wedding service by ID failed',
      getByIdResult.data);

    // Test update wedding service (vendor only)
    if (authTokens.vendor) {
      const updateResult = await makeRequest('PUT', `/wedding/${serviceId}`, {
        serviceName: 'Updated Grand Wedding Hall',
        description: 'Updated wedding venue description'
      }, authTokens.vendor);
      logTest(`/wedding/{id}`, 'PUT', updateResult.status, updateResult.success,
        updateResult.success ? 'Wedding service update successful' : 'Wedding service update failed',
        updateResult.data);
    }
  }

  // Test vendor-specific wedding service endpoints
  if (authTokens.vendor) {
    const getVendorServicesResult = await makeRequest('GET', '/wedding/vendor/my-services', null, authTokens.vendor);
    logTest('/wedding/vendor/my-services', 'GET', getVendorServicesResult.status, getVendorServicesResult.success,
      getVendorServicesResult.success ? 'Get vendor wedding services successful' : 'Get vendor wedding services failed',
      getVendorServicesResult.data);

    // Test delete wedding service (vendor only)
    if (serviceId) {
      const deleteResult = await makeRequest('DELETE', `/wedding/${serviceId}`, null, authTokens.vendor);
      logTest(`/wedding/{id}`, 'DELETE', deleteResult.status, deleteResult.success,
        deleteResult.success ? 'Wedding service deletion successful' : 'Wedding service deletion failed',
        deleteResult.data);
    }
  }
};

const testHomepageEndpoints = async () => {
  console.log('\n🏠 Testing Homepage Endpoints...');
  
  // Test get homepage content
  const getHomepageResult = await makeRequest('GET', '/homepage');
  logTest('/homepage', 'GET', getHomepageResult.status, getHomepageResult.success,
    getHomepageResult.success ? 'Get homepage content successful' : 'Get homepage content failed',
    getHomepageResult.data);

  // Test get category stats
  const getStatsResult = await makeRequest('GET', '/homepage/stats');
  logTest('/homepage/stats', 'GET', getStatsResult.status, getStatsResult.success,
    getStatsResult.success ? 'Get category stats successful' : 'Get category stats failed',
    getStatsResult.data);

  // Test global search
  const searchResult = await makeRequest('GET', '/homepage/search?q=test&category=hotel');
  logTest('/homepage/search', 'GET', searchResult.status, searchResult.success,
    searchResult.success ? 'Global search successful' : 'Global search failed',
    searchResult.data);
};

const generateReport = () => {
  console.log('\n📊 Generating Test Report...');
  
  const totalTests = TEST_RESULTS.length;
  const passedTests = TEST_RESULTS.filter(test => test.success).length;
  const failedTests = totalTests - passedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(2);

  const report = {
    summary: {
      totalTests,
      passedTests,
      failedTests,
      successRate: `${successRate}%`,
      timestamp: new Date().toISOString()
    },
    testResults: TEST_RESULTS,
    authTokens: {
      customer: authTokens.customer ? 'Generated' : 'Not generated',
      vendor: authTokens.vendor ? 'Generated' : 'Not generated',
      admin: authTokens.admin ? 'Generated' : 'Not generated'
    }
  };

  // Write report to file
  fs.writeFileSync('api_test_report.json', JSON.stringify(report, null, 2));
  
  console.log('\n📋 TEST SUMMARY:');
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${successRate}%`);
  console.log('\n📄 Detailed report saved to: api_test_report.json');

  // Display failed tests
  if (failedTests > 0) {
    console.log('\n❌ FAILED TESTS:');
    TEST_RESULTS.filter(test => !test.success).forEach(test => {
      console.log(`   ${test.method} ${test.endpoint} - ${test.status} - ${test.message}`);
    });
  }
};

// Main test execution
const runAllTests = async () => {
  console.log('🚀 Starting Comprehensive API Testing...');
  console.log(`🔗 Base URL: ${BASE_URL}`);
  console.log('=' .repeat(60));

  try {
    await testHealthEndpoints();
    await testAuthEndpoints();
    await testVendorEndpoints();
    await testAdminEndpoints();
    await testHotelEndpoints();
    await testEcommerceEndpoints();
    await testAutomobileEndpoints();
    await testWeddingEndpoints();
    await testHomepageEndpoints();
    
    generateReport();
    
    console.log('\n🎉 All tests completed!');
  } catch (error) {
    console.error('\n💥 Test execution failed:', error.message);
    process.exit(1);
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests();
}

export default runAllTests;

