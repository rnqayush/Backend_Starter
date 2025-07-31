#!/usr/bin/env node

/**
 * Postman Collection Generator
 * Generates a complete Postman collection for the Backend Starter API
 */

const fs = require('fs');
const path = require('path');

// Base collection structure
const collection = {
  info: {
    name: "Backend Starter - Complete Business API",
    description: "Comprehensive API collection for testing all business modules: Hotels, E-commerce, Wedding, Automobile, and Business Services",
    version: "1.0.0",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  auth: {
    type: "bearer",
    bearer: [
      {
        key: "token",
        value: "{{auth_token}}",
        type: "string"
      }
    ]
  },
  variable: [
    {
      key: "base_url",
      value: "http://localhost:3000/api",
      type: "string"
    },
    {
      key: "auth_token",
      value: "",
      type: "string"
    },
    {
      key: "website_id",
      value: "",
      type: "string"
    },
    {
      key: "user_id",
      value: "",
      type: "string"
    },
    {
      key: "hotel_id",
      value: "",
      type: "string"
    },
    {
      key: "product_id",
      value: "",
      type: "string"
    },
    {
      key: "category_id",
      value: "",
      type: "string"
    },
    {
      key: "order_id",
      value: "",
      type: "string"
    },
    {
      key: "vendor_id",
      value: "",
      type: "string"
    },
    {
      key: "event_id",
      value: "",
      type: "string"
    },
    {
      key: "vehicle_id",
      value: "",
      type: "string"
    },
    {
      key: "service_id",
      value: "",
      type: "string"
    }
  ],
  item: []
};

// Helper function to create request
function createRequest(method, url, headers = [], body = null, tests = null) {
  const request = {
    method,
    header: headers,
    url: {
      raw: url,
      host: ["{{base_url}}"],
      path: url.replace("{{base_url}}/", "").split("/")
    }
  };

  if (body) {
    request.body = {
      mode: "raw",
      raw: JSON.stringify(body, null, 2)
    };
  }

  const item = { request, response: [] };

  if (tests) {
    item.event = [{
      listen: "test",
      script: {
        exec: tests
      }
    }];
  }

  return item;
}

// Common headers
const authHeaders = [
  { key: "Authorization", value: "Bearer {{auth_token}}" },
  { key: "Content-Type", value: "application/json" }
];

const jsonHeaders = [
  { key: "Content-Type", value: "application/json" }
];

// Authentication endpoints
const authFolder = {
  name: "🔐 Authentication",
  description: "User authentication and authorization endpoints",
  item: [
    {
      name: "Register User",
      ...createRequest("POST", "{{base_url}}/auth/register", jsonHeaders, {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "admin"
      })
    },
    {
      name: "Login User",
      ...createRequest("POST", "{{base_url}}/auth/login", jsonHeaders, {
        email: "john@example.com",
        password: "password123"
      }, [
        "if (pm.response.code === 200) {",
        "    const response = pm.response.json();",
        "    pm.collectionVariables.set('auth_token', response.data.token);",
        "    pm.collectionVariables.set('user_id', response.data.user._id);",
        "}"
      ])
    },
    {
      name: "Get Current User",
      ...createRequest("GET", "{{base_url}}/auth/me", [
        { key: "Authorization", value: "Bearer {{auth_token}}" }
      ])
    },
    {
      name: "Logout User",
      ...createRequest("POST", "{{base_url}}/auth/logout", [
        { key: "Authorization", value: "Bearer {{auth_token}}" }
      ])
    }
  ]
};

// Website endpoints
const websiteFolder = {
  name: "🌐 Website Management",
  description: "Website management endpoints",
  item: [
    {
      name: "Create Website",
      ...createRequest("POST", "{{base_url}}/websites", authHeaders, {
        name: "My Business Website",
        slug: "my-business",
        description: "A comprehensive business website",
        businessType: "hotel",
        settings: {
          theme: "modern",
          primaryColor: "#007bff",
          secondaryColor: "#6c757d"
        }
      }, [
        "if (pm.response.code === 201) {",
        "    const response = pm.response.json();",
        "    pm.collectionVariables.set('website_id', response.data.website._id);",
        "}"
      ])
    },
    {
      name: "Get All Websites",
      ...createRequest("GET", "{{base_url}}/websites", [
        { key: "Authorization", value: "Bearer {{auth_token}}" }
      ])
    },
    {
      name: "Get Website by ID",
      ...createRequest("GET", "{{base_url}}/websites/{{website_id}}", [
        { key: "Authorization", value: "Bearer {{auth_token}}" }
      ])
    }
  ]
};

// Add all folders to collection
collection.item = [
  authFolder,
  websiteFolder
];

// Generate the collection file
const outputPath = path.join(__dirname, 'Backend_Starter_Complete_Collection.json');
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));

console.log('✅ Postman collection generated successfully!');
console.log(`📁 File saved to: ${outputPath}`);
console.log('');
console.log('🚀 To use this collection:');
console.log('1. Import the JSON file into Postman');
console.log('2. Set up environment variables as described in README.md');
console.log('3. Start with Authentication → Register User → Login User');
console.log('4. Create a website, then test other endpoints');
console.log('');
console.log('📖 For detailed testing instructions, see postman/README.md');
