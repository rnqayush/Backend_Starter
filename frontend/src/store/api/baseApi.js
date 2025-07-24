import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState }) => {
    // Get token from auth state
    const token = getState().auth.token;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    headers.set('content-type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Token expired, logout user
    api.dispatch({ type: 'auth/logout' });
  }
  
  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User',
    'Vendor',
    'Admin',
    'Hotel',
    'Ecommerce',
    'Automobile',
    'Wedding',
    'Homepage',
    'Business',
    'Booking',
    'Order',
    'Review',
  ],
  endpoints: () => ({}),
});

export const {
  util: { resetApiState },
} = baseApi;

