/**
 * Multivendor Platform API Endpoints
 * Complete API documentation with request/response examples
 * 
 * Base URL: http://localhost:5000/api
 * Authentication: Bearer Token required for protected routes
 */

const API_ENDPOINTS = {
  baseURL: "http://localhost:5000/api",
  
  // ===== AUTHENTICATION APIS =====
  auth: {
    // Register User
    register: {
      method: "POST",
      url: "/auth/register",
      protected: false,
      request: {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "vendor",
        businessType: "wedding"
      },
      response: {
        success: true,
        data: {
          user: {
            id: "user_id",
            name: "John Doe",
            email: "john@example.com",
            role: "vendor",
            businessType: "wedding"
          },
          token: "jwt_token_here"
        },
        message: "User registered successfully"
      }
    },

    // Login User
    login: {
      method: "POST",
      url: "/auth/login",
      protected: false,
      request: {
        email: "john@example.com",
        password: "password123"
      },
      response: {
        success: true,
        data: {
          user: {
            id: "user_id",
            name: "John Doe",
            email: "john@example.com",
            role: "vendor",
            businessType: "wedding"
          },
          token: "jwt_token_here"
        },
        message: "Login successful"
      }
    },

    // Get Current User
    getMe: {
      method: "GET",
      url: "/auth/me",
      protected: true,
      request: null,
      response: {
        success: true,
        data: {
          user: {
            id: "user_id",
            name: "John Doe",
            email: "john@example.com",
            role: "vendor",
            businessType: "wedding"
          }
        },
        message: "User profile retrieved successfully"
      }
    }
  },

  // ===== WEDDING MODULE APIS =====
  wedding: {
    // Get All Vendors
    getVendors: {
      method: "GET",
      url: "/weddings/vendors",
      protected: false,
      queryParams: "?page=1&limit=20&category=photographer&location=mumbai",
      request: null,
      response: {
        success: true,
        data: {
          vendors: [
            {
              id: "vendor_id",
              businessName: "Dream Weddings",
              category: "photographer",
              location: {
                city: "Mumbai",
                state: "Maharashtra"
              },
              pricing: {
                startingPrice: 50000
              },
              rating: 4.5,
              reviewCount: 25
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 45,
            pages: 3
          }
        },
        message: "Wedding vendors retrieved successfully"
      }
    },

    // Create Vendor
    createVendor: {
      method: "POST",
      url: "/weddings/vendors",
      protected: true,
      request: {
        businessName: "Dream Weddings Studio",
        description: "Professional wedding photography and videography services",
        category: "photographer",
        subcategories: ["wedding-photography", "pre-wedding"],
        location: {
          address: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          coordinates: {
            latitude: 19.0760,
            longitude: 72.8777
          }
        },
        contact: {
          phone: "+91-9876543210",
          email: "info@dreamweddings.com",
          website: "https://dreamweddings.com"
        },
        pricing: {
          startingPrice: 50000,
          currency: "INR"
        }
      },
      response: {
        success: true,
        data: {
          vendor: {
            id: "vendor_id",
            businessName: "Dream Weddings Studio",
            category: "photographer",
            status: "pending"
          }
        },
        message: "Wedding vendor created successfully"
      }
    },

    // Update Basic Information
    updateBasicInfo: {
      method: "PUT",
      url: "/weddings/vendors/:id/basic-info",
      protected: true,
      request: {
        businessName: "Dream Weddings Studio Pro",
        description: "Premium wedding photography services",
        tagline: "Capturing your special moments",
        specializations: ["destination-weddings", "traditional-ceremonies"],
        location: {
          address: "456 New Street",
          city: "Mumbai",
          state: "Maharashtra"
        }
      },
      response: {
        success: true,
        data: {
          vendor: {
            id: "vendor_id",
            basicInfo: {
              businessName: "Dream Weddings Studio Pro",
              description: "Premium wedding photography services",
              location: {
                address: "456 New Street",
                city: "Mumbai"
              }
            }
          }
        },
        message: "Basic information updated successfully"
      }
    },

    // Add Media
    addMedia: {
      method: "POST",
      url: "/weddings/vendors/:id/media",
      protected: true,
      request: {
        images: [
          {
            url: "https://example.com/wedding1.jpg",
            alt: "Beautiful wedding ceremony",
            category: "wedding",
            event: "Raj & Priya Wedding"
          },
          {
            url: "https://example.com/wedding2.jpg",
            alt: "Pre-wedding photoshoot",
            category: "pre-wedding"
          }
        ],
        videos: [
          {
            url: "https://example.com/wedding-video.mp4",
            title: "Wedding Highlights",
            duration: 180,
            thumbnail: "https://example.com/video-thumb.jpg"
          }
        ]
      },
      response: {
        success: true,
        data: {
          vendor: {
            id: "vendor_id",
            portfolio: {
              images: [
                {
                  id: "image_id",
                  url: "https://example.com/wedding1.jpg",
                  alt: "Beautiful wedding ceremony",
                  category: "wedding"
                }
              ],
              videos: [
                {
                  id: "video_id",
                  url: "https://example.com/wedding-video.mp4",
                  title: "Wedding Highlights"
                }
              ]
            }
          }
        },
        message: "Media added successfully"
      }
    },

    // Add Service
    addService: {
      method: "POST",
      url: "/weddings/vendors/:id/services",
      protected: true,
      request: {
        name: "Wedding Photography",
        description: "Complete wedding day photography coverage",
        category: "photography",
        pricing: {
          type: "package",
          basePrice: 75000,
          currency: "INR"
        },
        duration: "8 hours",
        inclusions: [
          "Pre-wedding consultation",
          "8 hours coverage",
          "500+ edited photos",
          "Online gallery"
        ],
        exclusions: [
          "Travel outside city",
          "Additional photographers"
        ],
        isActive: true
      },
      response: {
        success: true,
        data: {
          vendor: {
            id: "vendor_id",
            services: [
              {
                id: "service_id",
                name: "Wedding Photography",
                pricing: {
                  basePrice: 75000
                },
                isActive: true
              }
            ]
          }
        },
        message: "Service added successfully"
      }
    },

    // Add Package
    addPackage: {
      method: "POST",
      url: "/weddings/vendors/:id/packages",
      protected: true,
      request: {
        name: "Premium Wedding Package",
        description: "Complete wedding coverage with premium services",
        price: 150000,
        originalPrice: 200000,
        currency: "INR",
        duration: "2 days",
        services: ["photography", "videography", "album"],
        inclusions: [
          "Pre-wedding shoot",
          "Wedding day coverage",
          "Reception coverage",
          "Premium album",
          "Online gallery"
        ],
        maxBookings: 4,
        isPopular: true,
        isActive: true
      },
      response: {
        success: true,
        data: {
          vendor: {
            id: "vendor_id",
            packages: [
              {
                id: "package_id",
                name: "Premium Wedding Package",
                price: 150000,
                isPopular: true
              }
            ]
          }
        },
        message: "Package added successfully"
      }
    },

    // Add FAQ
    addFAQ: {
      method: "POST",
      url: "/weddings/vendors/:id/faqs",
      protected: true,
      request: {
        question: "How many photos will we receive?",
        answer: "You will receive 500+ professionally edited high-resolution photos in an online gallery within 2-3 weeks.",
        category: "photography",
        order: 1,
        isActive: true
      },
      response: {
        success: true,
        data: {
          vendor: {
            id: "vendor_id",
            faqs: [
              {
                id: "faq_id",
                question: "How many photos will we receive?",
                answer: "You will receive 500+ professionally edited high-resolution photos...",
                category: "photography"
              }
            ]
          }
        },
        message: "FAQ added successfully"
      }
    },

    // Add Offer
    addOffer: {
      method: "POST",
      url: "/weddings/vendors/:id/offers",
      protected: true,
      request: {
        title: "Early Bird Discount",
        description: "Book 6 months in advance and save 20%",
        discountType: "percentage",
        discountValue: 20,
        validFrom: "2024-01-01T00:00:00Z",
        validUntil: "2024-12-31T23:59:59Z",
        terms: [
          "Valid for bookings made 6 months in advance",
          "Cannot be combined with other offers",
          "Subject to availability"
        ],
        applicableServices: ["photography", "videography"],
        maxRedemptions: 50,
        isActive: true
      },
      response: {
        success: true,
        data: {
          vendor: {
            id: "vendor_id",
            offers: [
              {
                id: "offer_id",
                title: "Early Bird Discount",
                discountType: "percentage",
                discountValue: 20,
                isActive: true
              }
            ]
          }
        },
        message: "Offer added successfully"
      }
    }
  },

  // ===== HOTEL MODULE APIS =====
  hotel: {
    // Get All Hotels
    getHotels: {
      method: "GET",
      url: "/hotels",
      protected: false,
      queryParams: "?page=1&limit=20&city=mumbai&minPrice=2000&maxPrice=10000",
      request: null,
      response: {
        success: true,
        data: {
          hotels: [
            {
              id: "hotel_id",
              name: "Grand Palace Hotel",
              location: {
                city: "Mumbai",
                state: "Maharashtra",
                address: "123 Marine Drive"
              },
              rating: 4.2,
              reviewCount: 156,
              pricing: {
                startingPrice: 3500
              },
              amenities: {
                general: ["wifi", "parking", "restaurant"]
              }
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 25,
            pages: 2
          }
        },
        message: "Hotels retrieved successfully"
      }
    },

    // Create Hotel
    createHotel: {
      method: "POST",
      url: "/hotels",
      protected: true,
      request: {
        name: "Grand Palace Hotel",
        description: "Luxury hotel in the heart of Mumbai",
        shortDescription: "Premium accommodation with world-class amenities",
        location: {
          address: "123 Marine Drive",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001",
          coordinates: {
            latitude: 18.9220,
            longitude: 72.8347
          }
        },
        contact: {
          phone: "+91-22-12345678",
          email: "info@grandpalace.com",
          website: "https://grandpalace.com"
        },
        amenities: {
          general: ["wifi", "parking", "restaurant", "gym", "spa"],
          room: ["ac", "tv", "minibar", "safe"],
          dining: ["restaurant", "room-service", "bar"],
          recreation: ["pool", "gym", "spa"]
        },
        policies: {
          checkIn: {
            time: "14:00",
            instructions: "Valid ID required"
          },
          checkOut: {
            time: "12:00"
          },
          cancellation: "Free cancellation up to 24 hours before check-in"
        }
      },
      response: {
        success: true,
        data: {
          hotel: {
            id: "hotel_id",
            name: "Grand Palace Hotel",
            location: {
              city: "Mumbai",
              state: "Maharashtra"
            },
            status: "pending"
          }
        },
        message: "Hotel created successfully"
      }
    },

    // Update Hotel Content
    updateHotelContent: {
      method: "PUT",
      url: "/hotels/:id/content",
      protected: true,
      request: {
        description: "Updated luxury hotel description with premium amenities",
        shortDescription: "Premium luxury accommodation",
        amenities: {
          general: ["wifi", "parking", "restaurant", "gym", "spa", "concierge"],
          recreation: ["pool", "gym", "spa", "tennis-court"]
        },
        policies: {
          checkIn: {
            time: "15:00",
            instructions: "Valid ID and credit card required"
          },
          pets: {
            allowed: true,
            fee: 1000,
            restrictions: "Small pets only"
          }
        }
      },
      response: {
        success: true,
        data: {
          hotel: {
            id: "hotel_id",
            content: {
              description: "Updated luxury hotel description...",
              amenities: {
                general: ["wifi", "parking", "restaurant", "gym", "spa", "concierge"]
              }
            }
          }
        },
        message: "Hotel content updated successfully"
      }
    },

    // Add Hotel Images
    addHotelImages: {
      method: "POST",
      url: "/hotels/:id/images",
      protected: true,
      request: {
        images: [
          {
            url: "https://example.com/hotel-exterior.jpg",
            alt: "Hotel exterior view",
            category: "exterior",
            isPrimary: true
          },
          {
            url: "https://example.com/hotel-lobby.jpg",
            alt: "Hotel lobby",
            category: "interior"
          }
        ]
      },
      response: {
        success: true,
        data: {
          hotel: {
            id: "hotel_id",
            images: [
              {
                id: "image_id",
                url: "https://example.com/hotel-exterior.jpg",
                alt: "Hotel exterior view",
                isPrimary: true
              }
            ]
          }
        },
        message: "Hotel images added successfully"
      }
    },

    // Create Room
    createRoom: {
      method: "POST",
      url: "/hotels/:hotelId/rooms",
      protected: true,
      request: {
        name: "Deluxe Suite",
        type: "suite",
        category: "deluxe",
        roomNumber: "101",
        floor: 1,
        maxOccupancy: 4,
        bedConfiguration: {
          kingBeds: 1,
          queenBeds: 0,
          singleBeds: 1
        },
        pricing: {
          basePrice: 5000,
          currency: "INR"
        },
        amenities: ["ac", "tv", "minibar", "safe", "balcony"],
        images: [
          {
            url: "https://example.com/room-101.jpg",
            alt: "Deluxe Suite",
            category: "bedroom"
          }
        ]
      },
      response: {
        success: true,
        data: {
          room: {
            id: "room_id",
            name: "Deluxe Suite",
            roomNumber: "101",
            pricing: {
              basePrice: 5000
            },
            availability: {
              status: "available"
            }
          }
        },
        message: "Room created successfully"
      }
    },

    // Add Hotel Offer
    addHotelOffer: {
      method: "POST",
      url: "/hotels/:id/offers",
      protected: true,
      request: {
        title: "Weekend Special",
        description: "Stay 2 nights and get 1 night free on weekends",
        discountType: "free-nights",
        discountValue: 1,
        validFrom: "2024-01-01T00:00:00Z",
        validUntil: "2024-12-31T23:59:59Z",
        terms: ["Valid only on weekends", "Minimum 2 nights stay required"],
        applicableRoomTypes: ["deluxe", "suite"],
        minimumStay: 2,
        maxRedemptions: 100,
        isActive: true
      },
      response: {
        success: true,
        data: {
          hotel: {
            id: "hotel_id",
            offers: [
              {
                id: "offer_id",
                title: "Weekend Special",
                discountType: "free-nights",
                discountValue: 1,
                isActive: true
              }
            ]
          }
        },
        message: "Hotel offer added successfully"
      }
    }
  },

  // ===== AUTOMOBILE MODULE APIS =====
  automobile: {
    // Get All Vehicles
    getVehicles: {
      method: "GET",
      url: "/automobiles/vehicles",
      protected: false,
      queryParams: "?page=1&limit=20&make=toyota&category=sedan&minPrice=500000&maxPrice=1500000",
      request: null,
      response: {
        success: true,
        data: {
          vehicles: [
            {
              id: "vehicle_id",
              make: "Toyota",
              model: "Camry",
              year: 2023,
              category: "sedan",
              pricing: {
                sellingPrice: 1200000
              },
              specifications: {
                engine: {
                  type: "Petrol",
                  displacement: "2.5L"
                },
                transmission: {
                  type: "Automatic"
                }
              },
              availability: {
                status: "available"
              }
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 35,
            pages: 2
          }
        },
        message: "Vehicles retrieved successfully"
      }
    },

    // Create Vehicle
    createVehicle: {
      method: "POST",
      url: "/automobiles/vehicles",
      protected: true,
      request: {
        make: "Toyota",
        model: "Camry",
        year: 2023,
        category: "sedan",
        vin: "JT2BF28K0X0123456",
        pricing: {
          purchasePrice: 1000000,
          sellingPrice: 1200000,
          currency: "INR"
        },
        specifications: {
          engine: {
            type: "Petrol",
            displacement: "2.5L",
            power: "203 HP",
            fuelType: "petrol"
          },
          transmission: {
            type: "Automatic",
            gears: 8
          },
          mileage: {
            city: 12,
            highway: 16,
            unit: "kmpl"
          },
          dimensions: {
            length: 4885,
            width: 1840,
            height: 1455,
            wheelbase: 2825
          }
        },
        features: {
          safety: ["ABS", "Airbags", "ESP", "Parking Sensors"],
          comfort: ["AC", "Power Steering", "Cruise Control"],
          technology: ["Touchscreen", "Bluetooth", "USB Ports"]
        },
        images: [
          {
            url: "https://example.com/camry-exterior.jpg",
            alt: "Toyota Camry exterior",
            category: "exterior",
            isPrimary: true
          }
        ]
      },
      response: {
        success: true,
        data: {
          vehicle: {
            id: "vehicle_id",
            make: "Toyota",
            model: "Camry",
            year: 2023,
            vin: "JT2BF28K0X0123456",
            pricing: {
              sellingPrice: 1200000
            },
            status: "draft"
          }
        },
        message: "Vehicle created successfully"
      }
    },

    // Get Inventory Overview
    getInventoryOverview: {
      method: "GET",
      url: "/automobiles/inventory",
      protected: true,
      request: null,
      response: {
        success: true,
        data: {
          overview: {
            totalVehicles: 45,
            availableVehicles: 32,
            soldVehicles: 8,
            reservedVehicles: 5,
            totalValue: 54000000,
            averagePrice: 1200000
          },
          breakdown: {
            byCategory: [
              {
                _id: "sedan",
                count: 20,
                totalValue: 24000000,
                averagePrice: 1200000
              },
              {
                _id: "suv",
                count: 15,
                totalValue: 22500000,
                averagePrice: 1500000
              }
            ],
            byMake: [
              {
                _id: "Toyota",
                count: 12,
                models: ["Camry", "Fortuner", "Innova"]
              }
            ]
          },
          alerts: []
        },
        message: "Inventory overview retrieved successfully"
      }
    },

    // Update Inventory Status
    updateInventoryStatus: {
      method: "PUT",
      url: "/automobiles/inventory/:id/status",
      protected: true,
      request: {
        status: "sold",
        reason: "Vehicle sold to customer",
        soldPrice: 1150000,
        soldDate: "2024-01-15T10:30:00Z",
        buyerInfo: {
          name: "Rajesh Kumar",
          phone: "+91-9876543210",
          email: "rajesh@example.com"
        }
      },
      response: {
        success: true,
        data: {
          vehicle: {
            id: "vehicle_id",
            make: "Toyota",
            model: "Camry",
            year: 2023,
            availability: {
              status: "sold",
              soldDate: "2024-01-15T10:30:00Z"
            },
            pricing: {
              sellingPrice: 1200000,
              soldPrice: 1150000
            }
          }
        },
        message: "Vehicle inventory status updated successfully"
      }
    },

    // Create Enquiry
    createEnquiry: {
      method: "POST",
      url: "/automobiles/enquiries",
      protected: false,
      request: {
        vehicle: "vehicle_id",
        customer: {
          name: "Amit Sharma",
          phone: "+91-9876543210",
          email: "amit@example.com",
          location: {
            city: "Mumbai",
            state: "Maharashtra"
          }
        },
        enquiryType: "purchase",
        message: "Interested in purchasing this vehicle. Please provide best price.",
        preferredContactTime: "evening",
        financingRequired: true,
        tradeInVehicle: {
          make: "Maruti",
          model: "Swift",
          year: 2018
        }
      },
      response: {
        success: true,
        data: {
          enquiry: {
            id: "enquiry_id",
            enquiryNumber: "ENQ-2024-001",
            vehicle: {
              make: "Toyota",
              model: "Camry",
              year: 2023
            },
            customer: {
              name: "Amit Sharma",
              phone: "+91-9876543210"
            },
            status: "new",
            priority: "medium"
          }
        },
        message: "Enquiry created successfully"
      }
    }
  },

  // ===== BUSINESS WEBSITE MODULE APIS =====
  business: {
    // Update Hero Section
    updateHeroSection: {
      method: "PUT",
      url: "/websites/:id/content/hero",
      protected: true,
      request: {
        title: "Welcome to Our Business",
        subtitle: "Professional Services You Can Trust",
        description: "We provide exceptional business solutions tailored to your needs",
        ctaText: "Get Started",
        ctaLink: "/contact",
        backgroundImage: "https://example.com/hero-bg.jpg",
        settings: {
          textColor: "#ffffff",
          overlayOpacity: 0.5
        }
      },
      response: {
        success: true,
        data: {
          website: {
            id: "website_id",
            heroSection: {
              title: "Welcome to Our Business",
              subtitle: "Professional Services You Can Trust",
              ctaText: "Get Started"
            }
          }
        },
        message: "Hero section updated successfully"
      }
    },

    // Update About Section
    updateAboutSection: {
      method: "PUT",
      url: "/websites/:id/content/about",
      protected: true,
      request: {
        title: "About Our Company",
        content: "We are a leading provider of business solutions with over 10 years of experience.",
        image: "https://example.com/about-us.jpg",
        stats: [
          { label: "Years Experience", value: "10+" },
          { label: "Happy Clients", value: "500+" },
          { label: "Projects Completed", value: "1000+" }
        ],
        mission: "To provide exceptional business solutions that drive growth",
        vision: "To be the leading business solutions provider globally"
      },
      response: {
        success: true,
        data: {
          website: {
            id: "website_id",
            aboutSection: {
              title: "About Our Company",
              content: "We are a leading provider...",
              stats: [
                { label: "Years Experience", value: "10+" }
              ]
            }
          }
        },
        message: "About section updated successfully"
      }
    },

    // Add Service
    addService: {
      method: "POST",
      url: "/websites/:id/content/services",
      protected: true,
      request: {
        name: "Web Development",
        description: "Custom web development solutions for your business",
        icon: "fas fa-code",
        features: [
          "Responsive Design",
          "SEO Optimized",
          "Fast Loading",
          "Mobile Friendly"
        ],
        pricing: {
          startingPrice: 25000,
          currency: "INR"
        },
        isActive: true
      },
      response: {
        success: true,
        data: {
          website: {
            id: "website_id",
            services: [
              {
                id: "service_id",
                name: "Web Development",
                description: "Custom web development solutions...",
                isActive: true
              }
            ]
          }
        },
        message: "Service added successfully"
      }
    },

    // Add Team Member
    addTeamMember: {
      method: "POST",
      url: "/websites/:id/content/team",
      protected: true,
      request: {
        name: "John Smith",
        position: "Senior Developer",
        bio: "Experienced full-stack developer with expertise in modern web technologies",
        image: "https://example.com/john-smith.jpg",
        social: {
          linkedin: "https://linkedin.com/in/johnsmith",
          twitter: "https://twitter.com/johnsmith",
          github: "https://github.com/johnsmith"
        },
        skills: ["JavaScript", "React", "Node.js", "MongoDB"],
        isActive: true
      },
      response: {
        success: true,
        data: {
          website: {
            id: "website_id",
            team: [
              {
                id: "member_id",
                name: "John Smith",
                position: "Senior Developer",
                image: "https://example.com/john-smith.jpg"
              }
            ]
          }
        },
        message: "Team member added successfully"
      }
    },

    // Add Portfolio Item (for freelancers)
    addPortfolioItem: {
      method: "POST",
      url: "/websites/:id/content/portfolio",
      protected: true,
      request: {
        title: "E-commerce Website",
        description: "Modern e-commerce platform built with React and Node.js",
        category: "web-development",
        technologies: ["React", "Node.js", "MongoDB", "Stripe"],
        images: [
          {
            url: "https://example.com/portfolio-1.jpg",
            alt: "E-commerce homepage"
          }
        ],
        liveUrl: "https://example-ecommerce.com",
        githubUrl: "https://github.com/user/ecommerce-project",
        completedDate: "2024-01-15",
        client: "ABC Company",
        isActive: true
      },
      response: {
        success: true,
        data: {
          website: {
            id: "website_id",
            portfolio: [
              {
                id: "portfolio_id",
                title: "E-commerce Website",
                category: "web-development",
                technologies: ["React", "Node.js"]
              }
            ]
          }
        },
        message: "Portfolio item added successfully"
      }
    },

    // Update Skills and Experience (for freelancers)
    updateSkillsAndExperience: {
      method: "PUT",
      url: "/websites/:id/content/skills",
      protected: true,
      request: {
        skills: [
          {
            name: "JavaScript",
            level: 90,
            category: "programming"
          },
          {
            name: "React",
            level: 85,
            category: "frontend"
          },
          {
            name: "Node.js",
            level: 80,
            category: "backend"
          }
        ],
        experience: [
          {
            company: "Tech Solutions Inc",
            position: "Senior Developer",
            duration: "2020 - Present",
            description: "Lead developer for multiple web applications",
            technologies: ["React", "Node.js", "AWS"]
          }
        ],
        certifications: [
          {
            name: "AWS Certified Developer",
            issuer: "Amazon Web Services",
            date: "2023-06-15",
            credentialUrl: "https://aws.amazon.com/verification"
          }
        ]
      },
      response: {
        success: true,
        data: {
          website: {
            id: "website_id",
            skillsAndExperience: {
              skills: [
                {
                  name: "JavaScript",
                  level: 90
                }
              ],
              experience: [
                {
                  company: "Tech Solutions Inc",
                  position: "Senior Developer"
                }
              ]
            }
          }
        },
        message: "Skills and experience updated successfully"
      }
    }
  },

  // ===== E-COMMERCE MODULE APIS =====
  ecommerce: {
    // Get All Products
    getProducts: {
      method: "GET",
      url: "/ecommerce/products",
      protected: false,
      queryParams: "?page=1&limit=20&category=electronics&minPrice=1000&maxPrice=50000",
      request: null,
      response: {
        success: true,
        data: {
          products: [
            {
              id: "product_id",
              name: "Smartphone XYZ",
              description: "Latest smartphone with advanced features",
              price: 25000,
              comparePrice: 30000,
              category: "electronics",
              images: [
                {
                  url: "https://example.com/phone1.jpg",
                  alt: "Smartphone front view"
                }
              ],
              rating: 4.5,
              reviewCount: 128,
              inStock: true
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 156,
            pages: 8
          }
        },
        message: "Products retrieved successfully"
      }
    },

    // Create Product
    createProduct: {
      method: "POST",
      url: "/ecommerce/products",
      protected: true,
      request: {
        name: "Smartphone XYZ",
        description: "Latest smartphone with advanced features and premium build quality",
        category: "electronics",
        price: 25000,
        comparePrice: 30000,
        sku: "PHONE-XYZ-001",
        images: [
          {
            url: "https://example.com/phone1.jpg",
            alt: "Smartphone front view",
            isPrimary: true
          }
        ],
        specifications: {
          brand: "TechBrand",
          model: "XYZ Pro",
          color: "Black",
          storage: "128GB",
          ram: "8GB",
          display: "6.5 inch AMOLED",
          camera: "48MP Triple Camera"
        },
        inventory: {
          quantity: 50,
          trackQuantity: true,
          lowStockThreshold: 10
        },
        seo: {
          title: "Buy Smartphone XYZ - Best Price Online",
          description: "Get the latest Smartphone XYZ with advanced features",
          keywords: ["smartphone", "mobile", "electronics"]
        }
      },
      response: {
        success: true,
        data: {
          product: {
            id: "product_id",
            name: "Smartphone XYZ",
            price: 25000,
            sku: "PHONE-XYZ-001",
            status: "draft"
          }
        },
        message: "Product created successfully"
      }
    },

    // Get Categories Tree
    getCategoriesTree: {
      method: "GET",
      url: "/ecommerce/categories/tree",
      protected: false,
      request: null,
      response: {
        success: true,
        data: {
          categoryTree: [
            {
              id: "cat_1",
              name: "Electronics",
              slug: "electronics",
              children: [
                {
                  id: "cat_2",
                  name: "Smartphones",
                  slug: "smartphones",
                  children: []
                },
                {
                  id: "cat_3",
                  name: "Laptops",
                  slug: "laptops",
                  children: []
                }
              ]
            }
          ]
        },
        message: "Category tree retrieved successfully"
      }
    },

    // Create Category
    createCategory: {
      method: "POST",
      url: "/ecommerce/categories",
      protected: true,
      request: {
        name: "Smartphones",
        description: "Mobile phones and accessories",
        parent: "electronics_category_id",
        image: "https://example.com/smartphones.jpg",
        seo: {
          title: "Smartphones - Buy Online",
          description: "Shop latest smartphones online",
          keywords: ["smartphones", "mobile", "phones"]
        }
      },
      response: {
        success: true,
        data: {
          category: {
            id: "category_id",
            name: "Smartphones",
            slug: "smartphones",
            level: 1
          }
        },
        message: "Category created successfully"
      }
    },

    // Get Cart
    getCart: {
      method: "GET",
      url: "/ecommerce/cart",
      protected: true,
      request: null,
      response: {
        success: true,
        data: {
          cart: {
            id: "cart_id",
            items: [
              {
                id: "item_id",
                product: {
                  id: "product_id",
                  name: "Smartphone XYZ",
                  price: 25000,
                  image: "https://example.com/phone1.jpg"
                },
                quantity: 2,
                price: 25000,
                total: 50000
              }
            ],
            totals: {
              subtotal: 50000,
              tax: 9000,
              shipping: 500,
              discount: 2500,
              total: 57000
            }
          }
        },
        message: "Cart retrieved successfully"
      }
    },

    // Add to Cart
    addToCart: {
      method: "POST",
      url: "/ecommerce/cart/items",
      protected: true,
      request: {
        productId: "product_id",
        quantity: 2,
        variation: {
          color: "Black",
          storage: "128GB"
        }
      },
      response: {
        success: true,
        data: {
          cart: {
            id: "cart_id",
            items: [
              {
                id: "item_id",
                product: {
                  name: "Smartphone XYZ",
                  price: 25000
                },
                quantity: 2,
                total: 50000
              }
            ],
            totals: {
              subtotal: 50000,
              total: 57000
            }
          }
        },
        message: "Item added to cart successfully"
      }
    },

    // Create Order
    createOrder: {
      method: "POST",
      url: "/ecommerce/orders",
      protected: true,
      request: {
        shippingAddress: {
          name: "John Doe",
          phone: "+91-9876543210",
          address: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001"
        },
        billingAddress: {
          name: "John Doe",
          phone: "+91-9876543210",
          address: "123 Main Street",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400001"
        },
        paymentMethod: "razorpay",
        couponCode: "SAVE10"
      },
      response: {
        success: true,
        data: {
          order: {
            id: "order_id",
            orderNumber: "ORD-2024-001",
            status: "pending",
            total: 57000,
            items: [
              {
                product: "Smartphone XYZ",
                quantity: 2,
                price: 25000
              }
            ],
            shippingAddress: {
              name: "John Doe",
              address: "123 Main Street"
            },
            paymentStatus: "pending"
          }
        },
        message: "Order created successfully"
      }
    }
  },

  // ===== FILE MANAGEMENT APIS =====
  files: {
    // Upload File
    uploadFile: {
      method: "POST",
      url: "/files/upload",
      protected: true,
      contentType: "multipart/form-data",
      request: {
        file: "[File Object]",
        category: "product",
        alt: "Product image"
      },
      response: {
        success: true,
        data: {
          file: {
            id: "file_id",
            filename: "product-image.jpg",
            originalName: "my-product.jpg",
            url: "https://cdn.example.com/uploads/product-image.jpg",
            size: 245760,
            mimeType: "image/jpeg",
            category: "product"
          }
        },
        message: "File uploaded successfully"
      }
    },

    // Get Media Library
    getMediaLibrary: {
      method: "GET",
      url: "/files/media-library",
      protected: true,
      queryParams: "?page=1&limit=20&category=product&type=image",
      request: null,
      response: {
        success: true,
        data: {
          files: [
            {
              id: "file_id",
              filename: "product-image.jpg",
              url: "https://cdn.example.com/uploads/product-image.jpg",
              size: 245760,
              mimeType: "image/jpeg",
              category: "product",
              createdAt: "2024-01-15T10:30:00Z"
            }
          ],
          pagination: {
            page: 1,
            limit: 20,
            total: 45,
            pages: 3
          }
        },
        message: "Media library retrieved successfully"
      }
    }
  },

  // ===== USER PROFILE APIS =====
  userProfile: {
    // Get User Profile
    getUserProfile: {
      method: "GET",
      url: "/users/profile",
      protected: true,
      request: null,
      response: {
        success: true,
        data: {
          user: {
            id: "user_id",
            name: "John Doe",
            email: "john@example.com",
            role: "vendor",
            businessType: "wedding",
            businessInfo: {
              businessName: "Dream Weddings",
              gst: "GST123456789",
              address: {
                street: "123 Main St",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400001"
              }
            },
            preferences: {
              notifications: {
                email: true,
                sms: false,
                push: true
              },
              language: "en",
              timezone: "Asia/Kolkata"
            }
          }
        },
        message: "User profile retrieved successfully"
      }
    },

    // Update User Profile
    updateUserProfile: {
      method: "PUT",
      url: "/users/profile",
      protected: true,
      request: {
        name: "John Smith",
        businessInfo: {
          businessName: "Dream Weddings Studio",
          gst: "GST123456789",
          address: {
            street: "456 New Street",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400002"
          }
        },
        preferences: {
          notifications: {
            email: true,
            sms: true,
            push: true
          },
          language: "en"
        }
      },
      response: {
        success: true,
        data: {
          user: {
            id: "user_id",
            name: "John Smith",
            businessInfo: {
              businessName: "Dream Weddings Studio"
            },
            preferences: {
              notifications: {
                email: true,
                sms: true
              }
            }
          }
        },
        message: "User profile updated successfully"
      }
    }
  }
};

// Helper function to make API calls
export const makeAPICall = async (endpoint, options = {}) => {
  const { method, url, request, protected: isProtected } = endpoint;
  const fullUrl = `${API_ENDPOINTS.baseURL}${url}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers
  };
  
  if (isProtected) {
    const token = localStorage.getItem("authToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  const config = {
    method,
    headers,
    ...options
  };
  
  if (request && method !== "GET") {
    config.body = JSON.stringify(request);
  }
  
  try {
    const response = await fetch(fullUrl, config);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
};

export default API_ENDPOINTS;
