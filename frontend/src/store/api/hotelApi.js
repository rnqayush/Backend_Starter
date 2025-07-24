import { baseApi } from './baseApi';

export const hotelApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public hotel endpoints
    getHotels: builder.query({
      query: (params) => ({
        url: '/hotel',
        params,
      }),
      providesTags: ['Hotel'],
    }),
    
    getHotelById: builder.query({
      query: (id) => `/hotel/${id}`,
      providesTags: (result, error, id) => [{ type: 'Hotel', id }],
    }),
    
    getHotelBySlug: builder.query({
      query: (slug) => `/hotel/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Hotel', id: slug }],
    }),
    
    // Vendor hotel endpoints
    getVendorHotels: builder.query({
      query: (params) => ({
        url: '/hotel/vendor/my-hotels',
        params,
      }),
      providesTags: ['Hotel'],
    }),
    
    createHotel: builder.mutation({
      query: (hotelData) => ({
        url: '/hotel',
        method: 'POST',
        body: hotelData,
      }),
      invalidatesTags: ['Hotel'],
    }),
    
    updateHotel: builder.mutation({
      query: ({ id, ...hotelData }) => ({
        url: `/hotel/${id}`,
        method: 'PUT',
        body: hotelData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Hotel', id },
        'Hotel',
      ],
    }),
    
    deleteHotel: builder.mutation({
      query: (id) => ({
        url: `/hotel/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Hotel'],
    }),
    
    // Hotel booking endpoints
    createBooking: builder.mutation({
      query: (bookingData) => ({
        url: '/hotel/booking',
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Booking'],
    }),
    
    getHotelBookings: builder.query({
      query: (hotelId) => `/hotel/${hotelId}/bookings`,
      providesTags: ['Booking'],
    }),
    
    // Hotel reviews
    getHotelReviews: builder.query({
      query: (hotelId) => `/hotel/${hotelId}/reviews`,
      providesTags: ['Review'],
    }),
    
    addHotelReview: builder.mutation({
      query: ({ hotelId, ...reviewData }) => ({
        url: `/hotel/${hotelId}/reviews`,
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: ['Review', 'Hotel'],
    }),
  }),
});

export const {
  useGetHotelsQuery,
  useGetHotelByIdQuery,
  useGetHotelBySlugQuery,
  useGetVendorHotelsQuery,
  useCreateHotelMutation,
  useUpdateHotelMutation,
  useDeleteHotelMutation,
  useCreateBookingMutation,
  useGetHotelBookingsQuery,
  useGetHotelReviewsQuery,
  useAddHotelReviewMutation,
} = hotelApi;

