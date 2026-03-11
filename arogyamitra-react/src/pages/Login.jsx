import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import useTranslation from '../hooks/useTranslation';

const Login = () => {
  const [userType, setUserType] = useState('patient'); // patient, hospital, doctor
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Role-based configuration for "mindblowing" UI
  const roleThemes = {
    patient: {
      id: 'patient',
      label: t('patient'),
      icon: 'fa-user',
      primary: '#10b981', // Emerald
      secondary: '#06b6d4', // Teal
      gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
      shadow: 'rgba(16, 185, 129, 0.4)',
      bgGlow: 'rgba(16, 185, 129, 0.15)',
      description: 'Access your health reports and AI analysis'
    },
    hospital: {
      id: 'hospital',
      label: t('hospitalStaff'),
      icon: 'fa-hospital-user',
      primary: '#f59e0b', // Amber
      secondary: '#ea580c', // Orange
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
      shadow: 'rgba(245, 158, 11, 0.4)',
      bgGlow: 'rgba(245, 158, 11, 0.15)',
      description: 'Secure terminal for clinical data management'
    },
    doctor: {
      id: 'doctor',
      label: t('doctor'),
      icon: 'fa-user-md',
      primary: '#8b5cf6', // Purple
      secondary: '#d946ef', // Fuchsia
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
      shadow: 'rgba(139, 92, 246, 0.4)',
      bgGlow: 'rgba(139, 92, 246, 0.15)',
      description: 'Expert medical portal & patient consultation'
    }
  };

  const theme = roleThemes[userType];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const credentials = {
        username: formData.username,
        password: formData.password,
        user_type: userType
      };

      const response = await login(credentials);

      if (response.success) {
        if (response.role === 'PATIENT') {
          navigate('/report-vault');
        } else if (response.role === 'HOSPITAL_STAFF') {
          navigate('/hospital-dashboard');
        } else if (response.role === 'DOCTOR') {
          navigate('/doctor-dashboard');
        }
      } else {
        alert('Login failed: ' + (response.message || 'Invalid credentials'));
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
    }
  };

  return (
    <div className="container" style={{ 
      paddingTop: '6rem', 
      paddingBottom: '4rem', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.5s ease'
    }}>
      {/* Dynamic Background Glows */}
      <div style={{ 
        position: 'fixed', 
        top: '20%', 
        left: '20%', 
        width: '400px', 
        height: '400px', 
        borderRadius: '50%', 
        background: theme.primary, 
        filter: 'blur(150px)', 
        opacity: '0.15', 
        zIndex: '-1',
        transition: 'all 1s ease'
      }}></div>
      <div style={{ 
        position: 'fixed', 
        bottom: '20%', 
        right: '20%', 
        width: '400px', 
        height: '400px', 
        borderRadius: '50%', 
        background: theme.secondary, 
        filter: 'blur(150px)', 
        opacity: '0.15', 
        zIndex: '-1',
        transition: 'all 1s ease'
      }}></div>

      <div className="glass-card" style={{ 
        maxWidth: '550px', 
        width: '100%',
        margin: '0 auto', 
        padding: '3rem 2.5rem',
        border: `1px solid rgba(255, 255, 255, 0.1)`,
        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px ${theme.bgGlow}`,
        transition: 'all 0.5s cubic-bezier(0.22, 0.61, 0.36, 1)'
      }}>
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 2rem' }}>
            <div style={{ 
              width: '100%', 
              height: '100%', 
              background: theme.gradient, 
              borderRadius: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              boxShadow: `0 12px 30px ${theme.shadow}`,
              position: 'relative', 
              zIndex: '2',
              transition: 'all 0.5s ease'
            }}>
              <i className={`fas ${theme.icon}`} style={{ fontSize: '2.5rem', color: 'white' }}></i>
            </div>
            <div style={{ 
              position: 'absolute', 
              top: '8px', 
              left: '8px', 
              width: '100%', 
              height: '100%', 
              borderRadius: '20px', 
              background: theme.primary, 
              opacity: '0.1', 
              zIndex: '1'
            }}></div>
          </div>
          
          <h1 style={{ 
            fontFamily: 'Montserrat, sans-serif', 
            fontSize: '2.4rem', 
            fontWeight: '800', 
            marginBottom: '0.75rem', 
            color: '#f8fafc',
            transition: 'all 0.5s ease'
          }}>
            {theme.label} Login
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: '500', maxWidth: '350px', margin: '0 auto', lineHeight: '1.5' }}>
            {theme.description}
          </p>
        </div>

        {/* Role Selector (Division) */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(0, 0, 0, 0.2)', 
          padding: '0.5rem', 
          borderRadius: '20px', 
          marginBottom: '2.5rem',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          {Object.values(roleThemes).map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => setUserType(role.id)}
              style={{ 
                flex: '1', 
                padding: '1rem', 
                border: 'none',
                background: userType === role.id ? role.gradient : 'transparent',
                color: userType === role.id ? 'white' : 'var(--text-secondary)',
                borderRadius: '16px', 
                fontWeight: '700', 
                cursor: 'pointer', 
                transition: 'all 0.4s cubic-bezier(0.22, 0.61, 0.36, 1)', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                gap: '0.5rem',
                fontSize: '0.85rem',
                boxShadow: userType === role.id ? `0 8px 20px ${role.shadow}` : 'none',
                transform: userType === role.id ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              <i className={`fas ${role.icon}`} style={{ fontSize: '1.2rem' }}></i>
              {role.label}
            </button>
          ))}
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: '600', fontSize: '0.9rem', paddingLeft: '0.5rem' }}>
              {t('username')}
            </label>
            <div className="input-wrapper">
              <i className="fas fa-at" style={{ transition: 'all 0.3s ease', color: theme.primary }}></i>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                placeholder={t('enterUsername')}
                required
                style={{ 
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  paddingLeft: '3.5rem',
                  fontSize: '1.1rem'
                }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: '600', fontSize: '0.9rem', paddingLeft: '0.5rem' }}>
              {t('password')}
            </label>
            <div className="input-wrapper">
              <i className="fas fa-key" style={{ transition: 'all 0.3s ease', color: theme.primary }}></i>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder={t('enterPassword')}
                required
                style={{ 
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  paddingLeft: '3.5rem',
                  paddingRight: '3.5rem',
                  fontSize: '1.1rem'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{ 
                  position: 'absolute', 
                  right: '1rem', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  background: 'transparent', 
                  border: 'none', 
                  color: showPassword ? theme.primary : 'var(--text-secondary)', 
                  cursor: 'pointer',
                  fontSize: '1.1rem'
                }}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn" 
            style={{ 
              width: '100%', 
              padding: '1.5rem', 
              background: theme.gradient, 
              color: 'white', 
              fontSize: '1.2rem', 
              borderRadius: '18px',
              boxShadow: `0 10px 30px ${theme.shadow}`,
              border: 'none'
            }}
          >
            <span>{t('secureLogin')}</span>
            <i className="fas fa-chevron-right" style={{ marginLeft: '0.5rem', fontSize: '1rem' }}></i>
          </button>
        </form>

        {/* Footer/Navigation Section */}
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            {t('dontHaveAccount')}{' '}
            <Link to="/register" style={{ 
              color: theme.primary, 
              fontWeight: '700', 
              textDecoration: 'none',
              borderBottom: `2px solid ${theme.bgGlow}`
            }}>
              {t('registerNow')}
            </Link>
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <Link to="/" className="btn btn-outline" style={{ 
              padding: '0.75rem 1.5rem', 
              borderRadius: '50px',
              borderColor: 'rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem'
            }}>
              <i className="fas fa-home"></i> {t('backToHome')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;