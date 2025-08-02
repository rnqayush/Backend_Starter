const fs = require('fs');

// Read the existing collection
const collection = JSON.parse(fs.readFileSync('postman/Multi-Vendor-Backend-Complete.postman_collection.json', 'utf8'));

// Add vendor endpoints
const vendorEndpoints = {
    "name": "🏪 Vendors",
    "item": [
        {
            "name": "Get All Vendors",
            "request": {
                "method": "GET",
                "header": [],
                "url": {
                    "raw": "{{baseUrl}}/api/vendors?page=1&limit=10&category=all",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "vendors"],
                    "query": [
                        {"key": "page", "value": "1"},
                        {"key": "limit", "value": "10"},
                        {"key": "category", "value": "all"}
                    ]
                },
                "description": "Get all vendors with pagination and filtering"
            }
        },
        {
            "name": "Get Featured Vendors",
            "request": {
                "method": "GET",
                "header": [],
                "url": {
                    "raw": "{{baseUrl}}/api/vendors/featured",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "vendors", "featured"]
                },
                "description": "Get featured vendors"
            }
        },
        {
            "name": "Search Vendors",
            "request": {
                "method": "GET",
                "header": [],
                "url": {
                    "raw": "{{baseUrl}}/api/vendors/search?q=hotel&location=mumbai",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "vendors", "search"],
                    "query": [
                        {"key": "q", "value": "hotel"},
                        {"key": "location", "value": "mumbai"}
                    ]
                },
                "description": "Search vendors by name, category, or location"
            }
        },
        {
            "name": "Get Vendors by Category",
            "request": {
                "method": "GET",
                "header": [],
                "url": {
                    "raw": "{{baseUrl}}/api/vendors/category/hotel",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "vendors", "category", "hotel"]
                },
                "description": "Get vendors by specific category"
            }
        },
        {
            "name": "Get Vendor by ID",
            "request": {
                "method": "GET",
                "header": [],
                "url": {
                    "raw": "{{baseUrl}}/api/vendors/{{vendorId}}",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "vendors", "{{vendorId}}"]
                },
                "description": "Get specific vendor details"
            }
        },
        {
            "name": "Create Vendor",
            "request": {
                "method": "POST",
                "header": [
                    {"key": "Content-Type", "value": "application/json"},
                    {"key": "Authorization", "value": "Bearer {{authToken}}"}
                ],
                "body": {
                    "mode": "raw",
                    "raw": JSON.stringify({
                        "businessName": "{{$randomCompanyName}}",
                        "category": "hotel",
                        "description": "Premium hotel services with excellent amenities",
                        "contactInfo": {
                            "phone": "{{$randomPhoneNumber}}",
                            "email": "{{$randomEmail}}",
                            "website": "https://{{$randomDomainName}}"
                        },
                        "address": {
                            "street": "{{$randomStreetAddress}}",
                            "city": "{{$randomCity}}",
                            "state": "{{$randomState}}",
                            "zipCode": "{{$randomZipCode}}",
                            "country": "India"
                        },
                        "businessHours": {
                            "monday": {"open": "09:00", "close": "18:00"},
                            "tuesday": {"open": "09:00", "close": "18:00"},
                            "wednesday": {"open": "09:00", "close": "18:00"},
                            "thursday": {"open": "09:00", "close": "18:00"},
                            "friday": {"open": "09:00", "close": "18:00"},
                            "saturday": {"open": "10:00", "close": "16:00"},
                            "sunday": {"closed": true}
                        }
                    }, null, 2)
                },
                "url": {
                    "raw": "{{baseUrl}}/api/vendors",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "vendors"]
                },
                "description": "Create a new vendor (requires authentication)"
            }
        },
        {
            "name": "Get Vendor Dashboard",
            "request": {
                "method": "GET",
                "header": [
                    {"key": "Authorization", "value": "Bearer {{authToken}}"}
                ],
                "url": {
                    "raw": "{{baseUrl}}/api/vendors/dashboard/stats",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "vendors", "dashboard", "stats"]
                },
                "description": "Get vendor dashboard statistics (vendor only)"
            }
        },
        {
            "name": "Update Vendor",
            "request": {
                "method": "PUT",
                "header": [
                    {"key": "Content-Type", "value": "application/json"},
                    {"key": "Authorization", "value": "Bearer {{authToken}}"}
                ],
                "body": {
                    "mode": "raw",
                    "raw": JSON.stringify({
                        "businessName": "Updated Business Name",
                        "description": "Updated description",
                        "contactInfo": {
                            "phone": "+91-9876543210",
                            "email": "updated@example.com"
                        }
                    }, null, 2)
                },
                "url": {
                    "raw": "{{baseUrl}}/api/vendors/{{vendorId}}",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "vendors", "{{vendorId}}"]
                },
                "description": "Update vendor information"
            }
        },
        {
            "name": "Update Vendor Status (Admin)",
            "request": {
                "method": "PATCH",
                "header": [
                    {"key": "Content-Type", "value": "application/json"},
                    {"key": "Authorization", "value": "Bearer {{authToken}}"}
                ],
                "body": {
                    "mode": "raw",
                    "raw": JSON.stringify({
                        "status": "approved",
                        "reason": "All documents verified"
                    }, null, 2)
                },
                "url": {
                    "raw": "{{baseUrl}}/api/vendors/{{vendorId}}/status",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "vendors", "{{vendorId}}", "status"]
                },
                "description": "Update vendor status (admin only)"
            }
        }
    ],
    "description": "Vendor management endpoints"
};

// Add vendor endpoints to collection
collection.item.push(vendorEndpoints);

// Write back to file
fs.writeFileSync('postman/Multi-Vendor-Backend-Complete.postman_collection.json', JSON.stringify(collection, null, 2));
console.log('Vendor endpoints added successfully!');
