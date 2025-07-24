import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  heroSection: {
    title: '',
    subtitle: '',
    backgroundImage: '',
    ctaText: '',
    ctaLink: '',
  },
  featuredBusinesses: [],
  categories: [],
  testimonials: [],
  stats: {
    totalBusinesses: 0,
    totalCustomers: 0,
    totalBookings: 0,
    totalReviews: 0,
  },
  isLoading: false,
  error: null,
};

const homepageSlice = createSlice({
  name: 'homepage',
  initialState,
  reducers: {
    setHomepageData: (state, action) => {
      const { heroSection, featuredBusinesses, categories, testimonials, stats } = action.payload;
      
      if (heroSection) state.heroSection = heroSection;
      if (featuredBusinesses) state.featuredBusinesses = featuredBusinesses;
      if (categories) state.categories = categories;
      if (testimonials) state.testimonials = testimonials;
      if (stats) state.stats = stats;
      
      state.isLoading = false;
      state.error = null;
    },
    setHeroSection: (state, action) => {
      state.heroSection = action.payload;
    },
    setFeaturedBusinesses: (state, action) => {
      state.featuredBusinesses = action.payload;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setTestimonials: (state, action) => {
      state.testimonials = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
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
  },
});

export const {
  setHomepageData,
  setHeroSection,
  setFeaturedBusinesses,
  setCategories,
  setTestimonials,
  setStats,
  setLoading,
  setError,
  clearError,
} = homepageSlice.actions;

export default homepageSlice.reducer;

// Selectors
export const selectHeroSection = (state) => state.homepage.heroSection;
export const selectFeaturedBusinesses = (state) => state.homepage.featuredBusinesses;
export const selectCategories = (state) => state.homepage.categories;
export const selectTestimonials = (state) => state.homepage.testimonials;
export const selectStats = (state) => state.homepage.stats;
export const selectHomepageLoading = (state) => state.homepage.isLoading;
export const selectHomepageError = (state) => state.homepage.error;

