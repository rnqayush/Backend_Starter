#!/usr/bin/env node

/**
 * Quick endpoint testing script for Multi-Vendor Backend
 * Run with: node postman/test-endpoints.js
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3001/api';

// Test data
const testUser = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'password123',
  role: 'customer'
};

let authToken = '';
let userId = '';

/**
 * Make HTTP request
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: response
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Test endpoint
 */
async function testEndpoint(name, method, path, data = null, requiresAuth = false) {
  console.log(`\n🧪 Testing: ${name}`);
  console.log(`   ${method} ${BASE_URL}${path}`);
  
  const url = new URL(BASE_URL + path);
  
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname + url.search,
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Multi-Vendor-Backend-Test/1.0'
    }
  };
  
  if (requiresAuth && authToken) {
    options.headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  try {
    const response = await makeRequest(options, data);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      console.log(`   ✅ Success (${response.statusCode})`);
      if (response.data && typeof response.data === 'object') {
        console.log(`   📄 Response: ${response.data.message || 'Success'}`);
      }
      return response;
    } else {
      console.log(`   ❌ Failed (${response.statusCode})`);
      if (response.data && typeof response.data === 'object') {
        console.log(`   📄 Error: ${response.data.message || 'Unknown error'}`);
      }
      return response;
    }
  } catch (error) {
    console.log(`   💥 Request failed: ${error.message}`);
    return null;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Multi-Vendor Backend API Test Suite');
  console.log('=====================================');
  
  // Test server health
  const healthResponse = await testEndpoint(
    'Health Check',
    'GET',
    '/health'
  );
  
  if (!healthResponse || healthResponse.statusCode !== 200) {
    console.log('\n❌ Server is not running or not healthy!');
    console.log('   Please start the server with: npm run dev');
    process.exit(1);
  }
  
  // Test user registration
  const registerResponse = await testEndpoint(
    'User Registration',
    'POST',
    '/auth/register',
    testUser
  );
  
  if (registerResponse && registerResponse.statusCode === 201) {
    if (registerResponse.data.data && registerResponse.data.data.token) {
      authToken = registerResponse.data.data.token;
      userId = registerResponse.data.data.user.id;
      console.log('   🔑 Auth token extracted');
    }
  }
  
  // Test user login
  await testEndpoint(
    'User Login',
    'POST',
    '/auth/login',
    {
      email: testUser.email,
      password: testUser.password
    }
  );
  
  // Test authenticated endpoints
  if (authToken) {
    await testEndpoint(
      'Get User Profile',
      'GET',
      '/auth/profile',
      null,
      true
    );
    
    await testEndpoint(
      'Get All Vendors',
      'GET',
      '/vendors',
      null,
      true
    );
    
    await testEndpoint(
      'Search Hotels',
      'GET',
      '/hotels/search?city=New York',
      null,
      true
    );
    
    await testEndpoint(
      'Get My Bookings',
      'GET',
      '/bookings/my-bookings',
      null,
      true
    );
  }
  
  // Test logout
  if (authToken) {
    await testEndpoint(
      'User Logout',
      'POST',
      '/auth/logout',
      null,
      true
    );
  }
  
  console.log('\n🎉 Test Suite Complete!');
  console.log('=====================================');
  console.log('✅ All major endpoints tested');
  console.log('📮 Import the Postman collections for detailed testing');
  console.log('🔧 Collections available in: ./postman/ directory');
}

// Run tests
runTests().catch(console.error);
