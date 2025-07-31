# 🚀 Backend Starter API - Complete Setup Guide

## 📋 Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (v4.4 or higher)
3. **Postman** (for API testing)

## 🔧 Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd Backend_Starter
npm install
```

### 2. Environment Configuration

Copy the provided `.env` file and update the values:

```bash
cp .env.example .env
```

**Required Environment Variables:**

```env
# Database - CRITICAL: Update this!
MONGODB_URI=mongodb://localhost:27017/website_builder_dev

# JWT Secrets - CRITICAL: Change these!
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
JWT_REFRESH_SECRET=your_refresh_token_secret_here_change_this_in_production

# Server
PORT=5000
NODE_ENV=development
```

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 4. Start the Server

```bash
npm start
# or for development with auto-reload
npm run dev
```

You should see:
```
🚀 Multi-Tenant Website Builder Server Started!
📍 Environment: development
🌐 Server running on port 5000
📊 Database: ✅ Connected
```

## 📮 API Testing with Postman

### 1. Import the Collection

1. Open Postman
2. Click **Import**
3. Select the file: `postman/Backend_Starter_API.postman_collection.json`
4. The collection will be imported with all endpoints and variables

### 2. Complete API Flow (Step by Step)

#### Step 1: Register a User
```
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "john.doe@example.com", 
  "password": "Password123"
}
```
✅ **Success**: Access token automatically saved to collection variables

#### Step 2: Create a Website
```
POST /api/websites
Headers: Authorization: Bearer {{access_token}}
Body: {
  "name": "My Hotel Website",
  "slug": "my-hotel-site",
  "type": "hotel",
  "description": "A luxury hotel booking website"
}
```
✅ **Success**: Website slug automatically saved to collection variables

#### Step 3: Create a Hotel
```
POST /api/hotels
Headers: 
  - Authorization: Bearer {{access_token}}
  - X-Tenant-Slug: {{website_slug}}
Body: {
  "name": "Grand Plaza Hotel",
  "description": "Luxury hotel in the heart of the city",
  "totalRooms": 150,
  "starRating": 5,
  "location": {
    "address": {
      "street": "123 Main Street",
      "city": "New York", 
      "state": "NY",
      "country": "USA",
      "zipCode": "10001"
    },
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  },
  "contact": {
    "phone": "+1-555-0123",
    "email": "info@grandplaza.com",
    "website": "https://grandplaza.com"
  },
  "priceRange": {
    "min": 200,
    "max": 800,
    "currency": "USD"
  },
  "amenities": [
    {
      "name": "Free WiFi",
      "category": "general",
      "icon": "wifi"
    },
    {
      "name": "Swimming Pool", 
      "category": "recreation",
      "icon": "pool"
    }
  ]
}
```

## 🔑 Authentication Flow

### Required Headers for Protected Routes:

```
Authorization: Bearer <your_jwt_token>
X-Tenant-Slug: <your_website_slug>
```

### Multi-Tenant Context

The API supports 3 ways to provide website context:

1. **Header (Recommended for API clients):**
   ```
   X-Tenant-Slug: my-hotel-site
   ```

2. **Subdomain:**
   ```
   http://my-hotel-site.yourdomain.com/api/hotels
   ```

3. **URL Parameter:**
   ```
   http://yourdomain.com/my-hotel-site/api/hotels
   ```

## 🚨 Common Issues & Solutions

### Issue 1: "Website context required" Error
```json
{
  "success": false,
  "message": "Website context required. Please provide website identifier via header (X-Tenant-Slug) or subdomain.",
  "errorCode": "MISSING_WEBSITE_CONTEXT"
}
```

**Solution:**
1. Make sure you created a website first (`POST /api/websites`)
2. Add the `X-Tenant-Slug` header with your website slug
3. Ensure the website slug exists and is active

### Issue 2: "Access denied. No token provided."
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**Solution:**
1. Login first (`POST /api/auth/login`)
2. Add `Authorization: Bearer <token>` header to your requests

### Issue 3: Database Connection Error
```
❌ Database connection error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**
1. Make sure MongoDB is running
2. Check your `MONGODB_URI` in `.env`
3. Verify MongoDB is accessible on the specified port

### Issue 4: JWT Token Invalid
```json
{
  "success": false,
  "message": "Invalid token."
}
```

**Solution:**
1. Check if your JWT_SECRET in `.env` matches what was used to create the token
2. Login again to get a fresh token
3. Ensure the token hasn't expired

## 📊 API Endpoints Overview

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Website Management
- `POST /api/websites` - Create website
- `GET /api/websites` - Get user's websites
- `GET /api/websites/:slug` - Get website by slug

### Hotel Management (requires website context)
- `POST /api/hotels` - Create hotel
- `GET /api/hotels` - Get hotels
- `GET /api/hotels/:id` - Get hotel by ID
- `PUT /api/hotels/:id` - Update hotel
- `DELETE /api/hotels/:id` - Delete hotel
- `POST /api/hotels/:id/amenities` - Add amenity
- `GET /api/hotels/:id/analytics` - Get analytics

### Other Business Modules
- E-commerce: `/api/ecommerce/*`
- Wedding: `/api/wedding/*`
- Automobile: `/api/automobile/*`
- Business: `/api/business/*`

## 🎯 Testing Checklist

- [ ] Server starts without errors
- [ ] Database connects successfully
- [ ] User registration works
- [ ] User login works and returns JWT token
- [ ] Website creation works
- [ ] Hotel creation works with proper headers
- [ ] All CRUD operations work for hotels
- [ ] Authentication is properly enforced
- [ ] Multi-tenant context is working

## 🔧 Development Tips

1. **Use the Postman Collection**: It has automatic token management and variable handling
2. **Check Server Logs**: The server provides detailed logging for debugging
3. **Environment Variables**: Always use environment variables for sensitive data
4. **Database Inspection**: Use MongoDB Compass or similar tools to inspect your data
5. **API Documentation**: Visit `/api/docs` in development mode for endpoint overview

## 🆘 Need Help?

If you're still experiencing issues:

1. Check the server console for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is running and accessible
4. Test with the provided Postman collection step by step
5. Check that you're following the authentication flow correctly

The API is designed to be robust and provide clear error messages to help you debug issues quickly!

