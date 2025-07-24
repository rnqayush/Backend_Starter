import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { baseApi } from './api/baseApi';
import authSlice from './slices/authSlice';
import homepageSlice from './slices/homepageSlice';
import businessSlice from './slices/businessSlice';
import uiSlice from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    // API slice
    [baseApi.reducerPath]: baseApi.reducer,
    
    // Feature slices
    auth: authSlice,
    homepage: homepageSlice,
    business: businessSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [baseApi.util.resetApiState.type],
      },
    }).concat(baseApi.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Enable listener behavior for the store
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

