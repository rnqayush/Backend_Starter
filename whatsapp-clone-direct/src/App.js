import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import WhatsApp from './pages/WhatsApp';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import VerifyEmail from './components/Auth/VerifyEmail';
import VerifyEmailNotice from './components/Auth/VerifyEmailNotice';
import Profile from './components/Auth/Profile';
import PrivateRoute from './components/Auth/PrivateRoute';
import GlobalStyles from './styles/GlobalStyles';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <GlobalStyles />
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-email-notice" element={<VerifyEmailNotice />} />
            
            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<WhatsApp />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

