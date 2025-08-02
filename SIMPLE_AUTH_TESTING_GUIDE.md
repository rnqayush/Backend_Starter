# 🧪 Simple Auth Backend - Postman Testing Guide

This guide will help you test the simplified authentication backend using Postman.

## 📋 Prerequisites

### 1. **MongoDB Setup**
The backend requires MongoDB to be running. Choose one option:

#### Option A: Local MongoDB
```bash
# Install MongoDB locally and start it
mongod --dbpath /path/to/your/db
```

#### Option B: MongoDB Docker
```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Option C: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster and get connection string
3. Update `.env` file with your connection string:
```env
MONGO_URI=<your-mongodb-atlas-connection-string-here>
```

### 2. **Environment Setup**
Make sure your `.env` file has these variables:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/simple-auth-db
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=7d
COOKIE_EXPIRE=7
```

### 3. **Start the Server**
```bash
npm install
npm start
```

You should see: `Server running on port 5000`

## 🚀 Postman Setup

### Step 1: Import Collection & Environment
1. **Import Collection**: `Simple-Auth-Backend.postman_collection.json`
2. **Import Environment**: `Simple-Auth-Backend.postman_environment.json`
3. **Select Environment**: Choose "Simple Auth Backend Environment" in Postman

### Step 2: Verify Server is Running
1. Run the **"Server Health Check"** request
2. You should get a response (even if it's a 404, it means server is running)

## 🧪 Testing Workflow

### Phase 1: Successful Authentication Flow

#### 1. **Register a New User**
- **Request**: `POST /api/auth/register`
- **Expected**: Status 201, user data returned, JWT cookie set
- **Test Data**:
```json
{
  "name": "John Doe",
  "email": "test@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### 2. **Login with Registered User**
- **Request**: `POST /api/auth/login`
- **Expected**: Status 200, user data returned, JWT cookie set
- **Test Data**:
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

#### 3. **Logout User**
- **Request**: `GET /api/auth/logout`
- **Expected**: Status 200, success message, cookie cleared

### Phase 2: Error Handling Tests

#### 1. **Registration Errors**
- **Missing Fields**: Try registering without required fields
- **Password Mismatch**: Use different password and confirmPassword
- **Duplicate Email**: Try registering with same email twice

#### 2. **Login Errors**
- **Invalid Credentials**: Use wrong email or password
- **Non-existent User**: Try logging in with unregistered email

## 📊 Expected Responses

### ✅ Successful Registration
```json
{
  "user": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "test@example.com"
  },
  "message": "Registration successful"
}
```

### ✅ Successful Login
```json
{
  "user": {
    "id": "user_id_here",
    "name": "John Doe",
    "email": "test@example.com"
  }
}
```

### ✅ Successful Logout
```json
{
  "message": "Logged out successfully"
}
```

### ❌ Error Responses
```json
{
  "message": "All fields are required"
}
```

```json
{
  "message": "Passwords do not match"
}
```

```json
{
  "message": "User already exists"
}
```

```json
{
  "message": "Invalid credentials"
}
```

## 🔧 Automated Testing

### Run All Tests
1. Select the entire collection
2. Click "Run" to execute all requests
3. View test results in the runner

### Individual Test Validation
Each request includes automated tests that check:
- ✅ Correct status codes
- ✅ Response structure
- ✅ Required fields presence
- ✅ Cookie handling
- ✅ Error messages

## 🐛 Troubleshooting

### Common Issues

#### 1. **Server Not Starting**
```bash
# Check if dependencies are installed
npm install

# Check if MongoDB is running
# For local: ps aux | grep mongod
# For Docker: docker ps
```

#### 2. **MongoDB Connection Error**
```
Error: Operation `users.findOne()` buffering timed out after 10000ms
```
**Solution**: Make sure MongoDB is running and accessible

#### 3. **JWT Cookie Issues**
- Make sure `COOKIE_EXPIRE` is set in `.env`
- Check browser developer tools for cookie presence
- Verify JWT_SECRET is configured

#### 4. **Port Already in Use**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=3000
```

### Environment Variables Check
```bash
# Verify your .env file has all required variables
cat .env
```

Required variables:
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `COOKIE_EXPIRE`

## 🎯 Testing Checklist

- [ ] MongoDB is running
- [ ] Server starts without errors
- [ ] Environment variables are set
- [ ] Postman collection imported
- [ ] Environment selected in Postman
- [ ] Health check passes
- [ ] User registration works
- [ ] User login works
- [ ] User logout works
- [ ] Error scenarios tested
- [ ] All automated tests pass

## 🔄 Quick Test Script

For command-line testing, you can also use curl:

```bash
# Test registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Test logout
curl -X GET http://localhost:5000/api/auth/logout
```

## 📝 Notes

- **JWT Cookies**: This backend uses HTTP-only cookies for JWT storage (more secure than localStorage)
- **Password Hashing**: Passwords are hashed using bcrypt before storage
- **Validation**: Basic validation is implemented for required fields and password matching
- **Error Handling**: Consistent error response format across all endpoints

Happy Testing! 🚀
