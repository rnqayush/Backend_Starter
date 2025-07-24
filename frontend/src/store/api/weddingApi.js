import { baseApi } from './baseApi';

export const weddingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public wedding endpoints
    getWeddingServices: builder.query({
      query: (params) => ({
        url: '/wedding',
        params,
      }),
      providesTags: ['Wedding'],
    }),
    
    getWeddingServiceById: builder.query({
      query: (id) => `/wedding/${id}`,
      providesTags: (result, error, id) => [{ type: 'Wedding', id }],
    }),
    
    getWeddingServiceBySlug: builder.query({
      query: (slug) => `/wedding/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Wedding', id: slug }],
    }),
    
    // Vendor wedding endpoints
    getVendorWeddingServices: builder.query({
      query: (params) => ({
        url: '/wedding/vendor/my-services',
        params,
      }),
      providesTags: ['Wedding'],
    }),
    
    createWeddingService: builder.mutation({
      query: (serviceData) => ({
        url: '/wedding',
        method: 'POST',
        body: serviceData,
      }),
      invalidatesTags: ['Wedding'],
    }),
    
    updateWeddingService: builder.mutation({
      query: ({ id, ...serviceData }) => ({
        url: `/wedding/${id}`,
        method: 'PUT',
        body: serviceData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Wedding', id },
        'Wedding',
      ],
    }),
    
    deleteWeddingService: builder.mutation({
      query: (id) => ({
        url: `/wedding/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Wedding'],
    }),
    
    // Wedding booking endpoints
    createWeddingBooking: builder.mutation({
      query: (bookingData) => ({
        url: '/wedding/booking',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Booking'],
    }),
    
    getWeddingBookings: builder.query({
      query: (serviceId) => `/wedding/${serviceId}/bookings`,
      providesTags: ['Booking'],
    }),
    
    // Wedding portfolio
    getWeddingPortfolio: builder.query({
      query: (serviceId) => `/wedding/${serviceId}/portfolio`,
      providesTags: ['Wedding'],
    }),
    
    addPortfolioItem: builder.mutation({
      query: ({ serviceId, ...portfolioData }) => ({
        url: `/wedding/${serviceId}/portfolio`,
        method: 'POST',
        body: portfolioData,
      }),
      invalidatesTags: ['Wedding'],
    }),
    
    // Wedding reviews
    getWeddingReviews: builder.query({
      query: (serviceId) => `/wedding/${serviceId}/reviews`,
      providesTags: ['Review'],
    }),
    
    addWeddingReview: builder.mutation({
      query: ({ serviceId, ...reviewData }) => ({
        url: `/wedding/${serviceId}/reviews`,
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: ['Review', 'Wedding'],
    }),
    
    // Wedding packages
    getWeddingPackages: builder.query({
      query: (serviceId) => `/wedding/${serviceId}/packages`,
      providesTags: ['Wedding'],
    }),
    
    createWeddingPackage: builder.mutation({
      query: ({ serviceId, ...packageData }) => ({
        url: `/wedding/${serviceId}/packages`,
        method: 'POST',
        body: packageData,
      }),
      invalidatesTags: ['Wedding'],
    }),
    
    // Availability check
    checkAvailability: builder.query({
      query: ({ serviceId, date }) => ({
        url: `/wedding/${serviceId}/availability`,
        params: { date },
      }),
    }),
  }),
});

export const {
  useGetWeddingServicesQuery,
  useGetWeddingServiceByIdQuery,
  useGetWeddingServiceBySlugQuery,
  useGetVendorWeddingServicesQuery,
  useCreateWeddingServiceMutation,
  useUpdateWeddingServiceMutation,
  useDeleteWeddingServiceMutation,
  useCreateWeddingBookingMutation,
  useGetWeddingBookingsQuery,
  useGetWeddingPortfolioQuery,
  useAddPortfolioItemMutation,
  useGetWeddingReviewsQuery,
  useAddWeddingReviewMutation,
  useGetWeddingPackagesQuery,
  useCreateWeddingPackageMutation,
  useCheckAvailabilityQuery,
} = weddingApi;

