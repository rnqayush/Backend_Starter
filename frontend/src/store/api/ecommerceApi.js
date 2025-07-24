import { baseApi } from './baseApi';

export const ecommerceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public ecommerce endpoints
    getProducts: builder.query({
      query: (params) => ({
        url: '/ecommerce',
        params,
      }),
      providesTags: ['Ecommerce'],
    }),
    
    getProductById: builder.query({
      query: (id) => `/ecommerce/${id}`,
      providesTags: (result, error, id) => [{ type: 'Ecommerce', id }],
    }),
    
    getProductBySlug: builder.query({
      query: (slug) => `/ecommerce/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: 'Ecommerce', id: slug }],
    }),
    
    // Vendor ecommerce endpoints
    getVendorProducts: builder.query({
      query: (params) => ({
        url: '/ecommerce/vendor/my-products',
        params,
      }),
      providesTags: ['Ecommerce'],
    }),
    
    createProduct: builder.mutation({
      query: (productData) => ({
        url: '/ecommerce',
        method: 'POST',
        body: productData,
      }),
      invalidatesTags: ['Ecommerce'],
    }),
    
    updateProduct: builder.mutation({
      query: ({ id, ...productData }) => ({
        url: `/ecommerce/${id}`,
        method: 'PUT',
        body: productData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Ecommerce', id },
        'Ecommerce',
      ],
    }),
    
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/ecommerce/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Ecommerce'],
    }),
    
    // Cart endpoints
    addToCart: builder.mutation({
      query: (cartData) => ({
        url: '/ecommerce/cart/add',
        method: 'POST',
        body: cartData,
      }),
      invalidatesTags: ['Cart'],
    }),
    
    getCart: builder.query({
      query: () => '/ecommerce/cart',
      providesTags: ['Cart'],
    }),
    
    updateCartItem: builder.mutation({
      query: ({ itemId, quantity }) => ({
        url: `/ecommerce/cart/${itemId}`,
        method: 'PUT',
        body: { quantity },
      }),
      invalidatesTags: ['Cart'],
    }),
    
    removeFromCart: builder.mutation({
      query: (itemId) => ({
        url: `/ecommerce/cart/${itemId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),
    
    // Order endpoints
    createOrder: builder.mutation({
      query: (orderData) => ({
        url: '/ecommerce/orders',
        method: 'POST',
        body: orderData,
      }),
      invalidatesTags: ['Order', 'Cart'],
    }),
    
    getOrders: builder.query({
      query: (params) => ({
        url: '/ecommerce/orders',
        params,
      }),
      providesTags: ['Order'],
    }),
    
    getOrderById: builder.query({
      query: (id) => `/ecommerce/orders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),
    
    // Product reviews
    getProductReviews: builder.query({
      query: (productId) => `/ecommerce/${productId}/reviews`,
      providesTags: ['Review'],
    }),
    
    addProductReview: builder.mutation({
      query: ({ productId, ...reviewData }) => ({
        url: `/ecommerce/${productId}/reviews`,
        method: 'POST',
        body: reviewData,
      }),
      invalidatesTags: ['Review', 'Ecommerce'],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
  useGetVendorProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useAddToCartMutation,
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useCreateOrderMutation,
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useGetProductReviewsQuery,
  useAddProductReviewMutation,
} = ecommerceApi;

