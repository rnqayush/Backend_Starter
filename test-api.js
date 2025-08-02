/**
 * Simple API Test Script
 * Tests the main API endpoints to ensure they're working
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

// Test endpoints
const tests = [
  {
    name: 'Health Check',
    method: 'GET',
    url: `${BASE_URL}/health`,
    expectStatus: 200
  },
  {
    name: 'API Info',
    method: 'GET',
    url: `${BASE_URL}`,
    expectStatus: 200
  },
  {
    name: 'Review Stats (Public)',
    method: 'GET',
    url: `${BASE_URL}/reviews/target/Vendor/507f1f77bcf86cd799439011/stats`,
    expectStatus: 200
  },
  {
    name: 'Get Reviews (Public)',
    method: 'GET',
    url: `${BASE_URL}/reviews/target/Vendor/507f1f77bcf86cd799439011`,
    expectStatus: 200
  }
];

async function runTest(test) {
  try {
    console.log(`\n🧪 Testing: ${test.name}`);
    console.log(`   ${test.method} ${test.url}`);
    
    const response = await fetch(test.url, {
      method: test.method,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
    
    const data = await response.json();
    
    if (response.status === test.expectStatus) {
      console.log(`   ✅ PASS - Status: ${response.status}`);
      console.log(`   📄 Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...`);
    } else {
      console.log(`   ❌ FAIL - Expected: ${test.expectStatus}, Got: ${response.status}`);
      console.log(`   📄 Response: ${JSON.stringify(data, null, 2)}`);
    }
  } catch (error) {
    console.log(`   ❌ ERROR - ${error.message}`);
  }
}

async function runAllTests() {
  console.log('🚀 Starting API Tests...\n');
  
  for (const test of tests) {
    await runTest(test);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between tests
  }
  
  console.log('\n✨ All tests completed!');
}

// Check if node-fetch is available
try {
  await import('node-fetch');
  runAllTests();
} catch (error) {
  console.log('❌ node-fetch not available. Installing...');
  console.log('Run: npm install node-fetch');
  console.log('Then run: node test-api.js');
}
