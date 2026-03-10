import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
          try {
            const parsedUser = JSON.parse(userData);
            // Set token in apiService (it will be formatted properly in the service)
            apiService.setAuthToken(token);
            setUser(parsedUser);
          } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            localStorage.removeItem('refreshToken');
            apiService.setAuthToken(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const data = await apiService.login(credentials);
      if (data.success && data.user && data.token) {
        setUser(data.user);
        localStorage.setItem('userData', JSON.stringify(data.user));
        // Token is already stored by apiService.login()
      }
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const data = await apiService.register(userData);
      return data;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('refreshToken');
    }
  };

  // Auth context value
  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    role: user?.role || (user ? (user.hospital_name ? 'HOSPITAL_STAFF' : 'PATIENT') : null)
  };

  if (loading) {
    return (
      <AuthContext.Provider value={value}>
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{
            width: 48,
            height: 48,
            border: '3px solid rgba(16, 185, 129, 0.2)',
            borderTop: '3px solid #10b981',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>Loading ArogyaMitra…</p>
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;