import { baseApi } from './baseApi';

export const homepageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHomepageContent: builder.query({
      query: () => '/homepage',
      providesTags: ['Homepage'],
    }),
    
    getCategoryStats: builder.query({
      query: () => '/homepage/stats',
      providesTags: ['Homepage'],
    }),
    
    globalSearch: builder.query({
      query: ({ q, category, limit }) => ({
        url: '/homepage/search',
        params: { q, category, limit },
      }),
      providesTags: ['Business'],
    }),
  }),
});

export const {
  useGetHomepageContentQuery,
  useGetCategoryStatsQuery,
  useGlobalSearchQuery,
  useLazyGlobalSearchQuery,
} = homepageApi;

