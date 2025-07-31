#!/bin/bash

# Comprehensive API Testing Script
BASE_URL="http://localhost:3001"
TOKEN=""
WEBSITE_SLUG=""

echo "🧪 Starting comprehensive API testing..."

# Function to test endpoint with timeout
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local auth_header=$4
    local description=$5
    local timeout=${6:-10}
    
    echo ""
    echo "=== Testing: $description ==="
    echo "Method: $method"
    echo "Endpoint: $endpoint"
    
    local cmd="curl -s --max-time $timeout -X $method \"$BASE_URL$endpoint\""
    
    if [ -n "$auth_header" ]; then
        cmd="$cmd -H \"$auth_header\""
    fi
    
    if [ -n "$data" ]; then
        cmd="$cmd -H \"Content-Type: application/json\" -d '$data'"
    fi
    
    echo "Executing: $cmd"
    
    local response=$(eval $cmd 2>/dev/null)
    local exit_code=$?
    
    if [ $exit_code -eq 0 ] && [ -n "$response" ]; then
        echo "$response" | jq '.' 2>/dev/null || echo "Response: $response"
        
        # Extract token if this is a login/register response
        if [[ "$endpoint" == *"/login"* ]] || [[ "$endpoint" == *"/register"* ]]; then
            local extracted_token=$(echo "$response" | jq -r '.data.tokens.accessToken' 2>/dev/null)
            if [ "$extracted_token" != "null" ] && [ -n "$extracted_token" ]; then
                TOKEN="$extracted_token"
                echo "✅ Token extracted: ${TOKEN:0:20}..."
            fi
        fi
        
        # Extract website slug if this is a website creation response
        if [[ "$endpoint" == *"/websites"* ]] && [[ "$method" == "POST" ]]; then
            local extracted_slug=$(echo "$response" | jq -r '.data.website.slug' 2>/dev/null)
            if [ "$extracted_slug" != "null" ] && [ -n "$extracted_slug" ]; then
                WEBSITE_SLUG="$extracted_slug"
                echo "✅ Website slug extracted: $WEBSITE_SLUG"
            fi
        fi
    else
        echo "❌ Request failed or timed out (exit code: $exit_code)"
    fi
}

# Test 1: Health Check
test_endpoint "GET" "/health" "" "" "Health Check" 5

# Test 2: Register User
test_endpoint "POST" "/api/auth/register" '{
    "name": "API Test User 2",
    "email": "apitest2@example.com",
    "password": "Password123"
}' "" "User Registration" 15

# Test 3: Login
if [ -n "$TOKEN" ]; then
    AUTH_HEADER="Authorization: Bearer $TOKEN"
    echo "✅ Using token for authenticated requests"
else
    echo "❌ No token available, testing login..."
    test_endpoint "POST" "/api/auth/login" '{
        "email": "apitest2@example.com",
        "password": "Password123"
    }' "" "User Login" 10
    
    if [ -n "$TOKEN" ]; then
        AUTH_HEADER="Authorization: Bearer $TOKEN"
    else
        echo "❌ Failed to get token, skipping authenticated tests"
        exit 1
    fi
fi

# Test 4: Get Profile
test_endpoint "GET" "/api/auth/me" "" "$AUTH_HEADER" "Get User Profile" 10

# Test 5: Create Website
test_endpoint "POST" "/api/websites" '{
    "name": "Test Hotel Website",
    "type": "hotel",
    "description": "A test hotel website"
}' "$AUTH_HEADER" "Create Website" 15

# Test 6: Get Websites
test_endpoint "GET" "/api/websites" "" "$AUTH_HEADER" "Get User Websites" 10

# Test 7: Test business endpoints with website context
if [ -n "$WEBSITE_SLUG" ]; then
    echo ""
    echo "🏨 Testing business endpoints with website context..."
    
    # Test hotel creation with tenant header
    test_endpoint "POST" "/api/hotels" '{
        "name": "Grand Hotel",
        "totalRooms": 100,
        "address": {
            "street": "123 Main St",
            "city": "Test City",
            "state": "Test State",
            "zipCode": "12345",
            "country": "Test Country"
        }
    }' "$AUTH_HEADER" "Create Hotel (with X-Tenant-Slug header)" 15
    
    # Test with X-Tenant-Slug header
    test_endpoint "POST" "/api/hotels" '{
        "name": "Grand Hotel 2",
        "totalRooms": 50
    }' "$AUTH_HEADER
X-Tenant-Slug: $WEBSITE_SLUG" "Create Hotel (with tenant header)" 15
    
else
    echo "❌ No website slug available, skipping business module tests"
fi

# Test 8: Test public endpoints
echo ""
echo "🌐 Testing public endpoints..."

test_endpoint "GET" "/api/products" "" "" "Get Products (Public)" 10
test_endpoint "GET" "/api/wedding/vendors" "" "" "Get Wedding Vendors (Public)" 10
test_endpoint "GET" "/api/vehicles" "" "" "Get Vehicles (Public)" 10
test_endpoint "GET" "/api/business/services" "" "" "Get Business Services (Public)" 10

# Test 9: Test malformed JSON (should not crash server)
echo ""
echo "🔥 Testing error handling..."
test_endpoint "POST" "/api/auth/register" '{"name": "Test", "email": "test@example.com"' "" "Malformed JSON Test" 5

# Test 10: Test server is still responsive
test_endpoint "GET" "/health" "" "" "Health Check After Error Tests" 5

echo ""
echo "🏁 Comprehensive API testing completed!"
echo "📊 Summary:"
echo "   Token obtained: $([ -n "$TOKEN" ] && echo "✅ Yes" || echo "❌ No")"
echo "   Website created: $([ -n "$WEBSITE_SLUG" ] && echo "✅ Yes ($WEBSITE_SLUG)" || echo "❌ No")"

