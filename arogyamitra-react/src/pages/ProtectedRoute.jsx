import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user } = useAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and user doesn't have it, redirect to home
  if (requiredRole && user) {
    const userRole = user.role || (user.hospital_name ? 'HOSPITAL_STAFF' : 'PATIENT');
    if (requiredRole !== userRole) {
      // If they are a doctor but tried to access hospital stuff, send them to doctor dashboard
      if (userRole === 'DOCTOR') return <Navigate to="/doctor-dashboard" replace />;
      if (userRole === 'HOSPITAL_STAFF') return <Navigate to="/hospital-dashboard" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;