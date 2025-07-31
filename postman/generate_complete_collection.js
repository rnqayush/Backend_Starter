#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Base collection structure
const collection = {
  info: {
    name: "Backend Starter - Complete API Collection",
    description: "Comprehensive API collection for testing all business modules: Authentication, Websites, Hotels, E-commerce, Wedding, Automobile, and Business Services",
    version: "1.0.0",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  auth: {
    type: "bearer",
    bearer: [{ key: "token", value: "{{auth_token}}", type: "string" }]
  },
  variable: [
    { key: "base_url", value: "http://localhost:3000/api", type: "string" },
    { key: "auth_token", value: "", type: "string" },
    { key: "website_id", value: "", type: "string" },
    { key: "user_id", value: "", type: "string" },
    { key: "hotel_id", value: "", type: "string" },
    { key: "product_id", value: "", type: "string" },
    { key: "category_id", value: "", type: "string" },
    { key: "order_id", value: "", type: "string" },
    { key: "vendor_id", value: "", type: "string" },
    { key: "event_id", value: "", type: "string" },
    { key: "vehicle_id", value: "", type: "string" },
    { key: "service_id", value: "", type: "string" }
  ],
  item: []
};

// Helper function to create request
function createRequest(name, method, path, headers = [], body = null, tests = null) {
  const request = {
    name,
    request: {
      method,
      header: headers,
      url: {
        raw: `{{base_url}}${path}`,
        host: ["{{base_url}}"],
        path: path.split('/').filter(p => p)
      }
    }
  };

  if (body) {
    request.request.body = {
      mode: "raw",
      raw: JSON.stringify(body, null, 2)
    };
  }

  if (tests) {
    request.event = [{
      listen: "test",
      script: { exec: tests }
    }];
  }

  return request;
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
    createRequest("Register User", "POST", "/auth/register", jsonHeaders, {
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      role: "admin"
    }, [
      "if (pm.response.code === 201) {",
      "    const response = pm.response.json();",
      "    if (response.data && response.data.user) {",
      "        pm.collectionVariables.set('user_id', response.data.user._id);",
      "    }",
      "}"
    ]),
    createRequest("Login User", "POST", "/auth/login", jsonHeaders, {
      email: "john@example.com",
      password: "password123"
    }, [
      "if (pm.response.code === 200) {",
      "    const response = pm.response.json();",
      "    if (response.data && response.data.token) {",
      "        pm.collectionVariables.set('auth_token', response.data.token);",
      "        pm.collectionVariables.set('user_id', response.data.user._id);",
      "    }",
      "}"
    ]),
    createRequest("Get Current User", "GET", "/auth/me", [
      { key: "Authorization", value: "Bearer {{auth_token}}" }
    ]),
    createRequest("Logout User", "POST", "/auth/logout", [
      { key: "Authorization", value: "Bearer {{auth_token}}" }
    ])
  ]
};

console.log('Generating complete Postman collection...');
collection.item.push(authFolder);

// Generate the collection file
const outputPath = path.join(__dirname, 'Backend_Starter_Complete_API_Collection.json');
fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));

console.log('✅ Base collection generated successfully!');
console.log(`📁 File saved to: ${outputPath}`);
