import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const PrivateRoute = ({ requireVerified = false }) => {
  const { currentUser, loading } = useAuth();
  
  // If still loading auth state, show nothing
  if (loading) {
    return null;
  }
  
  // If user is not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // If verification is required and user is not verified, redirect to verification page
  if (requireVerified && !currentUser.emailVerified) {
    return <Navigate to="/verify-email-notice" />;
  }
  
  // Otherwise, render the protected component
  return <Outlet />;
};

export default PrivateRoute;

