# 🚀 Multi-Vendor Backend API Testing Guide

This guide provides comprehensive instructions for testing the Multi-Vendor Backend API using Postman.

## 📋 Table of Contents

1. [Setup Instructions](#setup-instructions)
2. [Collection Overview](#collection-overview)
3. [Testing Workflow](#testing-workflow)
4. [Environment Variables](#environment-variables)
5. [API Endpoints](#api-endpoints)
6. [Error Testing](#error-testing)
7. [Troubleshooting](#troubleshooting)

## 🛠️ Setup Instructions

### 1. Import Collection and Environment

1. **Import Collection:**
   - Open Postman
   - Click "Import" button
   - Select `Multi-Vendor-Backend.postman_collection.json`
   - Click "Import"

2. **Import Environment:**
   - Click "Import" button
   - Select `Multi-Vendor-Backend.postman_environment.json`
   - Click "Import"
   - Select the "Multi-Vendor Backend Environment" from the environment dropdown

### 2. Start the Server

```bash
# Make sure you're in the project directory
npm start

# Or for development with auto-reload
npm run dev
```

The server should start on `http://localhost:5000`

### 3. Verify Server is Running

Test the health endpoint:
```bash
curl http://localhost:5000/health
```

## 📊 Collection Overview

The collection is organized into the following folders:

### 🏥 Health & Info
- **Health Check**: Verify server status
- **API Info**: Get available endpoints

### 🔐 Authentication
- **Register User**: Create customer account
- **Register Vendor**: Create vendor account
- **Login**: Authenticate user
- **Check Email**: Verify email availability
- **Get Profile**: Retrieve user profile
- **Update Profile**: Modify user information
- **Change Password**: Update user password
- **Refresh Token**: Get new access token
- **Logout**: End user session

### 🏪 Vendors
- **Get All Vendors**: List approved vendors
- **Get Vendor by Slug**: Retrieve specific vendor
- **Register as Vendor**: Convert user to vendor
- **Update Vendor Profile**: Modify vendor information
- **Get Vendor Dashboard**: Vendor analytics

### 📦 Products
- **Get All Products**: List products with filters
- **Get Product by Slug**: Retrieve specific product
- **Get Products by Category**: Filter by category
- **Create Product**: Add new product (vendor only)
- **Update Product**: Modify product (vendor only)
- **Delete Product**: Remove product (vendor only)

### ❌ Error Testing
- **Invalid Registration Data**: Test validation
- **Unauthorized Access**: Test authentication
- **Invalid Token**: Test token validation
- **Non-existent Endpoint**: Test 404 handling

## 🔄 Testing Workflow

### Phase 1: Basic Health Check
1. Run "Health Check" to verify server
2. Run "API Info" to see available endpoints

### Phase 2: User Registration & Authentication
1. **Register User**: Creates customer account
   - Automatically saves tokens to environment
2. **Login**: Test authentication
   - Updates tokens in environment
3. **Get Profile**: Verify authentication works
4. **Update Profile**: Test profile modification

### Phase 3: Vendor Registration
1. **Register Vendor**: Create vendor account
   - Use different email than customer
2. **Login** with vendor credentials
3. **Register as Vendor**: Convert user to vendor
4. **Get Vendor Dashboard**: Access vendor features

### Phase 4: Product Management
1. **Create Product**: Add new product (vendor only)
2. **Get All Products**: Verify product appears
3. **Get Product by Slug**: Test individual product retrieval
4. **Update Product**: Modify product details
5. **Get Products by Category**: Test filtering

### Phase 5: Error Testing
1. **Invalid Registration Data**: Test validation
2. **Unauthorized Access**: Test security
3. **Invalid Token**: Test token validation
4. **Non-existent Endpoint**: Test 404 handling

## 🌍 Environment Variables

The collection uses these environment variables:

| Variable | Description | Auto-Set |
|----------|-------------|----------|
| `baseUrl` | API base URL | Manual |
| `accessToken` | JWT access token | Auto |
| `refreshToken` | JWT refresh token | Auto |
| `userId` | Current user ID | Auto |
| `vendorId` | Vendor ID | Auto |
| `productId` | Product ID | Auto |

**Auto-Set Variables**: These are automatically updated by test scripts when you register/login.

## 🔗 API Endpoints

### Authentication Endpoints
```
POST /api/auth/register          - Register new user
POST /api/auth/login             - Login user
POST /api/auth/check-email       - Check email availability
GET  /api/auth/profile           - Get user profile (auth required)
PUT  /api/auth/profile           - Update profile (auth required)
PUT  /api/auth/change-password   - Change password (auth required)
POST /api/auth/refresh-token     - Refresh access token
POST /api/auth/logout            - Logout user (auth required)
```

### Vendor Endpoints
```
GET  /api/vendors                - Get all approved vendors
GET  /api/vendors/:slug          - Get vendor by slug
POST /api/vendors/register       - Register as vendor (auth required)
PUT  /api/vendors/profile        - Update vendor profile (vendor auth)
GET  /api/vendors/dashboard      - Get vendor dashboard (vendor auth)
```

### Product Endpoints
```
GET    /api/products             - Get all products (with filters)
GET    /api/products/:slug       - Get product by slug
GET    /api/products/category/:category - Get products by category
POST   /api/products             - Create product (vendor auth)
PUT    /api/products/:id         - Update product (vendor auth)
DELETE /api/products/:id         - Delete product (vendor auth)
```

### Utility Endpoints
```
GET /health                      - Health check
GET /api                         - API information
```

## 🧪 Sample Test Data

### User Registration
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "Password123",
  "confirmPassword": "Password123",
  "phone": "+1234567890",
  "role": "customer",
  "agreeToTerms": true
}
```

### Vendor Registration
```json
{
  "businessName": "John's Electronics Store",
  "businessType": "electronics",
  "description": "High-quality electronics and gadgets",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "businessRegistration": "REG123456789",
  "taxId": "TAX987654321"
}
```

### Product Creation
```json
{
  "name": "iPhone 15 Pro Max",
  "description": "Latest iPhone with advanced features",
  "category": "electronics",
  "subcategory": "smartphones",
  "price": 1199.99,
  "sku": "IPH15PM-256-BLU",
  "inventory": {
    "quantity": 50,
    "trackQuantity": true
  }
}
```

## ❌ Error Testing Scenarios

### 1. Validation Errors
- Invalid email format
- Weak passwords
- Missing required fields
- Password mismatch

### 2. Authentication Errors
- Missing authorization header
- Invalid/expired tokens
- Insufficient permissions

### 3. Business Logic Errors
- Duplicate email registration
- Non-existent resources
- Unauthorized operations

## 🔧 Troubleshooting

### Common Issues

1. **Server Not Running**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:5000
   ```
   **Solution**: Start the server with `npm start`

2. **Database Connection Error**
   ```
   MongoDB connection error
   ```
   **Solution**: Ensure MongoDB is running or check connection string

3. **Token Expired**
   ```
   {"success": false, "message": "Invalid token"}
   ```
   **Solution**: Use "Refresh Token" endpoint or login again

4. **Validation Errors**
   ```
   {"success": false, "message": "Validation error"}
   ```
   **Solution**: Check request body format and required fields

### Debug Tips

1. **Check Server Logs**: Monitor console output for errors
2. **Verify Environment**: Ensure correct environment is selected
3. **Check Variables**: Verify tokens are set in environment
4. **Test Sequence**: Follow the recommended testing workflow

## 📈 Advanced Testing

### Load Testing
Use Postman's Collection Runner to:
1. Run multiple iterations
2. Test with different data sets
3. Monitor response times
4. Check for memory leaks

### Automated Testing
Set up test scripts in requests to:
1. Validate response structure
2. Check status codes
3. Verify data integrity
4. Update environment variables

### Integration Testing
Test complete workflows:
1. User registration → Login → Profile update
2. Vendor registration → Product creation → Product management
3. Customer journey → Product browsing → Vendor discovery

## 🎯 Success Criteria

A successful test run should demonstrate:

✅ **Health Check**: Server responds correctly  
✅ **Authentication**: Users can register and login  
✅ **Authorization**: Protected routes require valid tokens  
✅ **Validation**: Invalid data is rejected with clear errors  
✅ **CRUD Operations**: Create, read, update, delete work correctly  
✅ **Business Logic**: Vendor/customer roles work as expected  
✅ **Error Handling**: Errors return appropriate status codes and messages  

## 📞 Support

If you encounter issues:

1. Check this guide first
2. Verify server logs
3. Test with curl commands
4. Check environment variables
5. Review API documentation

---

**Happy Testing! 🚀**

