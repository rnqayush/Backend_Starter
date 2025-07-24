#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  issues: [],
  modules: {}
};

// Helper function to test controller exports
async function testControllerExports(moduleName, controllerFile) {
  try {
    console.log(`\n🔍 Testing ${moduleName}/${controllerFile}...`);
    const controllerPath = join(__dirname, 'src', 'controllers', moduleName, controllerFile);
    
    if (!fs.existsSync(controllerPath)) {
      testResults.issues.push(`❌ ${moduleName}/${controllerFile}: File not found`);
      testResults.failed++;
      return { success: false, exports: [] };
    }

    // Import the controller
    const controller = await import(`./src/controllers/${moduleName}/${controllerFile}`);
    const exports = Object.keys(controller);
    
    console.log(`   📦 Exports found: ${exports.length}`);
    console.log(`   📋 Methods: ${exports.join(', ')}`);
    
    // Check if all exports are functions
    let functionsCount = 0;
    for (const exportName of exports) {
      if (typeof controller[exportName] === 'function') {
        functionsCount++;
      } else {
        testResults.issues.push(`❌ ${moduleName}/${controllerFile}: ${exportName} is not a function`);
      }
    }
    
    console.log(`   ✅ Functions: ${functionsCount}/${exports.length}`);
    
    if (functionsCount === exports.length && exports.length > 0) {
      testResults.passed++;
      console.log(`   🎉 ${moduleName}/${controllerFile}: All exports are valid functions`);
      return { success: true, exports, functionsCount };
    } else {
      testResults.failed++;
      testResults.issues.push(`❌ ${moduleName}/${controllerFile}: Some exports are not functions or no exports found`);
      return { success: false, exports, functionsCount };
    }
    
  } catch (error) {
    testResults.failed++;
    testResults.issues.push(`❌ ${moduleName}/${controllerFile}: Import error - ${error.message}`);
    console.log(`   💥 Error: ${error.message}`);
    return { success: false, exports: [], error: error.message };
  }
}

// Test function to check all controllers
async function testAllControllers() {
  console.log('🚀 Starting Comprehensive Controller Tests...\n');
  
  const modules = {
    business: ['websiteContentController.js'],
    automobile: ['enquiryController.js', 'vehicleController.js', 'vehicleInventoryController.js'],
    ecommerce: ['cartController.js', 'categoryController.js', 'orderController.js', 'productController.js']
  };

  for (const [moduleName, controllers] of Object.entries(modules)) {
    console.log(`\n📂 === ${moduleName.toUpperCase()} MODULE ===`);
    testResults.modules[moduleName] = {
      controllers: {},
      totalMethods: 0,
      passedControllers: 0,
      failedControllers: 0
    };

    for (const controllerFile of controllers) {
      const result = await testControllerExports(moduleName, controllerFile);
      testResults.modules[moduleName].controllers[controllerFile] = result;
      testResults.modules[moduleName].totalMethods += result.functionsCount || 0;
      
      if (result.success) {
        testResults.modules[moduleName].passedControllers++;
      } else {
        testResults.modules[moduleName].failedControllers++;
      }
    }
  }
  
  // Generate summary
  console.log(`\n📊 === COMPREHENSIVE TEST RESULTS ===`);
  console.log(`   ✅ Passed: ${testResults.passed}`);
  console.log(`   ❌ Failed: ${testResults.failed}`);
  console.log(`   📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  // Module-wise summary
  console.log(`\n📋 === MODULE SUMMARY ===`);
  let totalMethods = 0;
  for (const [moduleName, moduleData] of Object.entries(testResults.modules)) {
    console.log(`\n🔸 ${moduleName.toUpperCase()}:`);
    console.log(`   Controllers: ${moduleData.passedControllers}/${moduleData.passedControllers + moduleData.failedControllers} passed`);
    console.log(`   Total Methods: ${moduleData.totalMethods}`);
    totalMethods += moduleData.totalMethods;
    
    for (const [controllerFile, result] of Object.entries(moduleData.controllers)) {
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${controllerFile}: ${result.functionsCount || 0} methods`);
    }
  }
  
  console.log(`\n🎯 GRAND TOTAL: ${totalMethods} controller methods tested`);
  
  if (testResults.issues.length > 0) {
    console.log(`\n🚨 Issues Found:`);
    testResults.issues.forEach(issue => console.log(`   ${issue}`));
  }
  
  return testResults;
}

// Run the tests
testAllControllers().catch(console.error);

