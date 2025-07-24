import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentBusiness: null,
  businessType: null,
  businessData: null,
  searchResults: [],
  filters: {
    category: '',
    location: '',
    priceRange: [0, 1000],
    rating: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  },
  isLoading: false,
  error: null,
};

const businessSlice = createSlice({
  name: 'business',
  initialState,
  reducers: {
    setCurrentBusiness: (state, action) => {
      const { business, businessType, businessData } = action.payload;
      state.currentBusiness = business;
      state.businessType = businessType;
      state.businessData = businessData;
      state.error = null;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentBusiness: (state) => {
      state.currentBusiness = null;
      state.businessType = null;
      state.businessData = null;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const {
  setCurrentBusiness,
  setSearchResults,
  setFilters,
  setPagination,
  setLoading,
  setError,
  clearError,
  clearCurrentBusiness,
  resetFilters,
} = businessSlice.actions;

export default businessSlice.reducer;

// Selectors
export const selectCurrentBusiness = (state) => state.business.currentBusiness;
export const selectBusinessType = (state) => state.business.businessType;
export const selectBusinessData = (state) => state.business.businessData;
export const selectSearchResults = (state) => state.business.searchResults;
export const selectFilters = (state) => state.business.filters;
export const selectPagination = (state) => state.business.pagination;
export const selectBusinessLoading = (state) => state.business.isLoading;
export const selectBusinessError = (state) => state.business.error;

