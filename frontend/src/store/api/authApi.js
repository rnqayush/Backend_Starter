import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // User Authentication
    register: builder.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),
    
    getCurrentUser: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    
    updateProfile: builder.mutation({
      query: (profileData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),
    
    changePassword: builder.mutation({
      query: (passwordData) => ({
        url: '/auth/change-password',
        method: 'PUT',
        body: passwordData,
      }),
    }),
    
    // Vendor Authentication
    vendorRegister: builder.mutation({
      query: (vendorData) => ({
        url: '/vendor/register',
        method: 'POST',
        body: vendorData,
      }),
      invalidatesTags: ['Vendor'],
    }),
    
    vendorLogin: builder.mutation({
      query: (credentials) => ({
        url: '/vendor/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Vendor'],
    }),
    
    getVendorProfile: builder.query({
      query: () => '/vendor/profile',
      providesTags: ['Vendor'],
    }),
    
    updateVendorProfile: builder.mutation({
      query: (profileData) => ({
        url: '/vendor/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['Vendor'],
    }),
    
    getVendorDashboard: builder.query({
      query: () => '/vendor/dashboard',
      providesTags: ['Vendor'],
    }),
    
    // Admin Authentication
    adminLogin: builder.mutation({
      query: (credentials) => ({
        url: '/admin/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Admin'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useVendorRegisterMutation,
  useVendorLoginMutation,
  useGetVendorProfileQuery,
  useUpdateVendorProfileMutation,
  useGetVendorDashboardQuery,
  useAdminLoginMutation,
} = authApi;

