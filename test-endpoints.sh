#!/bin/bash

# API Testing Script
# Tests the main endpoints to ensure they're working

BASE_URL="http://localhost:5000/api"

echo "🚀 Testing Multi-Vendor Backend API Endpoints"
echo "=============================================="

# Test 1: Health Check
echo ""
echo "🧪 Test 1: Health Check"
echo "GET $BASE_URL/health"
curl -s -w "\nStatus: %{http_code}\n" "$BASE_URL/health" | jq '.' 2>/dev/null || echo "Response received"

# Test 2: API Info
echo ""
echo "🧪 Test 2: API Info"
echo "GET $BASE_URL"
curl -s -w "\nStatus: %{http_code}\n" "$BASE_URL" | jq '.' 2>/dev/null || echo "Response received"

# Test 3: Review Stats (Public endpoint)
echo ""
echo "🧪 Test 3: Review Stats (Public)"
echo "GET $BASE_URL/reviews/target/Vendor/507f1f77bcf86cd799439011/stats"
timeout 10 curl -s -w "\nStatus: %{http_code}\n" "$BASE_URL/reviews/target/Vendor/507f1f77bcf86cd799439011/stats" | jq '.' 2>/dev/null || echo "Response received or timeout"

# Test 4: Get Reviews (Public endpoint)
echo ""
echo "🧪 Test 4: Get Reviews (Public)"
echo "GET $BASE_URL/reviews/target/Vendor/507f1f77bcf86cd799439011"
timeout 10 curl -s -w "\nStatus: %{http_code}\n" "$BASE_URL/reviews/target/Vendor/507f1f77bcf86cd799439011" | jq '.' 2>/dev/null || echo "Response received or timeout"

# Test 5: Auth endpoint (should require authentication)
echo ""
echo "🧪 Test 5: Protected Endpoint (should fail without auth)"
echo "POST $BASE_URL/reviews"
curl -s -w "\nStatus: %{http_code}\n" -X POST "$BASE_URL/reviews" \
  -H "Content-Type: application/json" \
  -d '{"reviewType":"vendor","targetId":"507f1f77bcf86cd799439011","targetModel":"Vendor","businessCategory":"hotel","rating":5,"title":"Great service","comment":"Excellent experience with this vendor"}' | jq '.' 2>/dev/null || echo "Response received"

echo ""
echo "✨ API Testing Complete!"
echo ""
echo "📋 Summary:"
echo "- Health check should return 200"
echo "- API info should return 200 with endpoint list"
echo "- Review endpoints should return 200 (even with no data)"
echo "- Protected endpoints should return 401 without authentication"
