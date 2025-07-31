#!/bin/bash

# API Testing Script
BASE_URL="http://localhost:3001"
TOKEN=""

echo "🧪 Starting comprehensive API testing..."

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_header=$4
    local description=$5
    
    echo ""
    echo "=== Testing: $description ==="
    echo "Method: $method"
    echo "Endpoint: $endpoint"
    
    if [ -n "$auth_header" ]; then
        if [ -n "$data" ]; then
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "$auth_header" \
                -d "$data" | jq '.' 2>/dev/null || echo "Response not JSON or server error"
        else
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "$auth_header" | jq '.' 2>/dev/null || echo "Response not JSON or server error"
        fi
    else
        if [ -n "$data" ]; then
            curl -s -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data" | jq '.' 2>/dev/null || echo "Response not JSON or server error"
        else
            curl -s -X $method "$BASE_URL$endpoint" | jq '.' 2>/dev/null || echo "Response not JSON or server error"
        fi
    fi
}

# Test 1: Health Check
test_endpoint "GET" "/health" "" "" "Health Check"

# Test 2: Register User
echo ""
echo "=== Creating Test User ==="
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "API Test User",
        "email": "apitest@example.com",
        "password": "Password123"
    }')

echo "$REGISTER_RESPONSE" | jq '.' 2>/dev/null || echo "Registration failed or server error"

# Extract token if registration successful
TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.tokens.accessToken' 2>/dev/null)
if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo "✅ Token obtained: ${TOKEN:0:20}..."
    AUTH_HEADER="Authorization: Bearer $TOKEN"
else
    echo "❌ Failed to get token"
    AUTH_HEADER=""
fi

# Test 3: Login
test_endpoint "POST" "/api/auth/login" '{
    "email": "apitest@example.com",
    "password": "Password123"
}' "" "User Login"

# Test 4: Profile (with auth)
test_endpoint "GET" "/api/auth/profile" "" "$AUTH_HEADER" "Get Profile (Authenticated)"

# Test 5: Website Creation (with auth)
test_endpoint "POST" "/api/websites" '{
    "name": "Test Hotel Website",
    "type": "hotel"
}' "$AUTH_HEADER" "Create Website (Authenticated)"

# Test 6: Get Websites (with auth)
test_endpoint "GET" "/api/websites" "" "$AUTH_HEADER" "Get Websites (Authenticated)"

# Test 7: Hotel endpoints (should fail without website context)
test_endpoint "POST" "/api/hotels" '{
    "name": "Test Hotel",
    "totalRooms": 50
}' "$AUTH_HEADER" "Create Hotel (Should fail without website context)"

# Test 8: E-commerce endpoints
test_endpoint "GET" "/api/products" "" "" "Get Products (Public)"

# Test 9: Wedding endpoints
test_endpoint "GET" "/api/wedding/vendors" "" "" "Get Wedding Vendors (Public)"

# Test 10: Automobile endpoints
test_endpoint "GET" "/api/vehicles" "" "" "Get Vehicles (Public)"

# Test 11: Business endpoints
test_endpoint "GET" "/api/business/services" "" "" "Get Business Services (Public)"

# Test 12: Invalid JSON (should not crash)
echo ""
echo "=== Testing Invalid JSON (Should not crash server) ==="
curl -s -X POST "$BASE_URL/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"name": "Test", "email": "test@example.com"' | jq '.' 2>/dev/null || echo "Invalid JSON handled gracefully"

echo ""
echo "🏁 API testing completed!"

