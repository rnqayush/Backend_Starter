import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetCurrentUserQuery } from './store/api/authApi';
import { setCredentials, selectCurrentToken } from './store/slices/authSlice';

// Layout Components
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import OwnerLayout from './components/layout/OwnerLayout';

// Public Pages
import HomePage from './pages/HomePage';
import SearchResults from './pages/SearchResults';
import BusinessProfile from './pages/BusinessProfile';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VendorRegisterPage from './pages/auth/VendorRegisterPage';

// Category Pages
import HotelsPage from './pages/categories/HotelsPage';
import EcommercePage from './pages/categories/EcommercePage';
import AutomobilesPage from './pages/categories/AutomobilesPage';
import WeddingsPage from './pages/categories/WeddingsPage';

// Owner Dashboard Pages
import HotelDashboard from './pages/owner/HotelDashboard';
import EcommerceDashboard from './pages/owner/EcommerceDashboard';
import AutomobileDashboard from './pages/owner/AutomobileDashboard';
import WeddingDashboard from './pages/owner/WeddingDashboard';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import BusinessManagement from './pages/admin/BusinessManagement';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const token = useSelector(selectCurrentToken);
  const { data: user, isLoading } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Business Route Component (for slug-based routing)
const BusinessRoute = () => {
  return <BusinessProfile />;
};

function App() {
  const dispatch = useDispatch();
  const token = useSelector(selectCurrentToken);
  
  const {
    data: user,
    isLoading,
    isSuccess,
  } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (isSuccess && user && token) {
      dispatch(setCredentials({ user, token }));
    }
  }, [dispatch, user, token, isSuccess]);

  if (isLoading && token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="spinner w-12 h-12 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchResults />} />
          
          {/* Category Routes */}
          <Route path="hotels" element={<HotelsPage />} />
          <Route path="shop" element={<EcommercePage />} />
          <Route path="automobiles" element={<AutomobilesPage />} />
          <Route path="weddings" element={<WeddingsPage />} />
          
          {/* Auth Routes */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="vendor/register" element={<VendorRegisterPage />} />
        </Route>

        {/* Business Profile Routes (slug-based) */}
        <Route path="/:slug" element={<Layout />}>
          <Route index element={<BusinessRoute />} />
        </Route>

        {/* Owner Dashboard Routes */}
        <Route
          path="/owner/*"
          element={
            <ProtectedRoute requiredRole="vendor">
              <OwnerLayout />
            </ProtectedRoute>
          }
        >
          <Route path="hotel" element={<HotelDashboard />} />
          <Route path="ecommerce" element={<EcommerceDashboard />} />
          <Route path="automobile" element={<AutomobileDashboard />} />
          <Route path="wedding" element={<WeddingDashboard />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="businesses" element={<BusinessManagement />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;

