import { baseApi } from './baseApi';

export const automobileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public automobile endpoints
    getAutomobiles: builder.query({
      query: (params) => ({
        url: '/automobile',
        params,
      }),
      providesTags: ['Automobile'],
    }),
    
    getAutomobileById: builder.query({
      query: (id) => `/automobile/${id}`,
      providesTags: (result, error, id) => [{ type: 'Automobile', id }],
    }),
    
    getAutomobileBySlug: builder.query({
      query: (slug) => `/automobile/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Automobile', id: slug }],
    }),
    
    // Vendor automobile endpoints
    getVendorAutomobiles: builder.query({
      query: (params) => ({
        url: '/automobile/vendor/my-automobiles',
        params,
      }),
      providesTags: ['Automobile'],
    }),
    
    createAutomobile: builder.mutation({
      query: (automobileData) => ({
        url: '/automobile',
        method: 'POST',
        body: automobileData,
      }),
      invalidatesTags: ['Automobile'],
    }),
    
    updateAutomobile: builder.mutation({
      query: ({ id, ...automobileData }) => ({
        url: `/automobile/${id}`,
        method: 'PUT',
        body: automobileData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Automobile', id },
        'Automobile',
      ],
    }),
    
    deleteAutomobile: builder.mutation({
      query: (id) => ({
        url: `/automobile/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Automobile'],
    }),
    
    // Automobile inquiry endpoints
    createInquiry: builder.mutation({
      query: (inquiryData) => ({
        url: '/automobile/inquiry',
        method: 'POST',
        body: inquiryData,
      }),
      invalidatesTags: ['Inquiry'],
    }),
    
    getAutomobileInquiries: builder.query({
      query: (automobileId) => `/automobile/${automobileId}/inquiries`,
      providesTags: ['Inquiry'],
    }),
    
    // Automobile reviews
    getAutomobileReviews: builder.query({
      query: (automobileId) => `/automobile/${automobileId}/reviews`,
      providesTags: ['Review'],
    }),
    
    addAutomobileReview: builder.mutation({
      query: ({ automobileId, ...reviewData }) => ({
        url: `/automobile/${automobileId}/reviews`,
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: ['Review', 'Automobile'],
    }),
    
    // Automobile comparison
    compareAutomobiles: builder.query({
      query: (ids) => ({
        url: '/automobile/compare',
        params: { ids: ids.join(',') },
      }),
    }),
    
    // Get similar automobiles
    getSimilarAutomobiles: builder.query({
      query: (id) => `/automobile/${id}/similar`,
      providesTags: ['Automobile'],
    }),
  }),
});

export const {
  useGetAutomobilesQuery,
  useGetAutomobileByIdQuery,
  useGetAutomobileBySlugQuery,
  useGetVendorAutomobilesQuery,
  useCreateAutomobileMutation,
  useUpdateAutomobileMutation,
  useDeleteAutomobileMutation,
  useCreateInquiryMutation,
  useGetAutomobileInquiriesQuery,
  useGetAutomobileReviewsQuery,
  useAddAutomobileReviewMutation,
  useCompareAutomobilesQuery,
  useGetSimilarAutomobilesQuery,
} = automobileApi;

