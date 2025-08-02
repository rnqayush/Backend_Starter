#!/bin/bash

# 🧪 Simple Auth Backend - Quick Test Script
# This script tests the authentication endpoints without Postman

echo "🚀 Simple Auth Backend - API Testing Script"
echo "============================================="

# Configuration
BASE_URL="http://localhost:5000"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    
    print_info "Testing: $description"
    
    if [ -n "$data" ]; then
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X $method "$BASE_URL$endpoint")
    fi
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS:.*//g')
    
    if [ "$http_code" -eq "$expected_status" ]; then
        print_status 0 "$description - Status: $http_code"
        if [ -n "$body" ] && [ "$body" != "null" ]; then
            echo "   Response: $body" | head -c 100
            echo ""
        fi
    else
        print_status 1 "$description - Expected: $expected_status, Got: $http_code"
        if [ -n "$body" ]; then
            echo "   Response: $body"
        fi
    fi
    
    echo ""
}

# Check if server is running
print_info "Checking if server is running on $BASE_URL..."
if curl -s --connect-timeout 5 "$BASE_URL" > /dev/null 2>&1; then
    print_status 0 "Server is responding"
else
    print_status 1 "Server is not responding"
    print_warning "Make sure to start the server with: npm start"
    exit 1
fi

echo ""
echo "🧪 Starting API Tests..."
echo "========================"

# Test 1: Register a new user
print_info "Phase 1: Testing User Registration"
test_endpoint "POST" "/api/auth/register" \
    "{\"name\":\"Test User\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"confirmPassword\":\"$TEST_PASSWORD\"}" \
    201 "User Registration"

# Test 2: Try to register same user again (should fail)
test_endpoint "POST" "/api/auth/register" \
    "{\"name\":\"Test User 2\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"confirmPassword\":\"$TEST_PASSWORD\"}" \
    400 "Duplicate Email Registration (should fail)"

# Test 3: Register with missing fields (should fail)
test_endpoint "POST" "/api/auth/register" \
    "{\"name\":\"Test User\"}" \
    400 "Registration with Missing Fields (should fail)"

# Test 4: Register with password mismatch (should fail)
test_endpoint "POST" "/api/auth/register" \
    "{\"name\":\"Test User\",\"email\":\"test2@example.com\",\"password\":\"password123\",\"confirmPassword\":\"differentpassword\"}" \
    400 "Registration with Password Mismatch (should fail)"

echo ""
print_info "Phase 2: Testing User Login"

# Test 5: Login with valid credentials
test_endpoint "POST" "/api/auth/login" \
    "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
    200 "User Login with Valid Credentials"

# Test 6: Login with invalid credentials (should fail)
test_endpoint "POST" "/api/auth/login" \
    "{\"email\":\"$TEST_EMAIL\",\"password\":\"wrongpassword\"}" \
    400 "User Login with Invalid Password (should fail)"

# Test 7: Login with non-existent user (should fail)
test_endpoint "POST" "/api/auth/login" \
    "{\"email\":\"nonexistent@example.com\",\"password\":\"$TEST_PASSWORD\"}" \
    400 "User Login with Non-existent Email (should fail)"

echo ""
print_info "Phase 3: Testing User Logout"

# Test 8: Logout
test_endpoint "GET" "/api/auth/logout" \
    "" \
    200 "User Logout"

echo ""
echo "🎯 Test Summary"
echo "==============="
print_info "All tests completed!"
print_warning "Note: Some tests may fail if MongoDB is not running or not accessible"
print_info "For detailed testing, use the Postman collection: Simple-Auth-Backend.postman_collection.json"

echo ""
echo "📋 Next Steps:"
echo "1. Import the Postman collection for interactive testing"
echo "2. Check server logs for any errors"
echo "3. Verify MongoDB connection if tests are failing"
echo "4. Review the SIMPLE_AUTH_TESTING_GUIDE.md for detailed instructions"

echo ""
print_info "Happy Testing! 🚀"

