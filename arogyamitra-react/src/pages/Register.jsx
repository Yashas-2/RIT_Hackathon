import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';

const Register = () => {
  const [userType, setUserType] = useState('patient');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
    district: '',
    economic_status: 'APL',
    has_ration_card: false,
    has_aadhaar: false,
    aadhaar_last4: '',
    disease_type: '',
    username: '',
    password: '',
    confirm_password: '',
    hospital_name: '',
    department: '',
    license_number: '',
    specialization: 'General',
    experience_years: '',
    bio: '',
    profile_photo: null,
    photo_preview: null
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  // Karnataka districts
  const districts = [
    'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
    'Bidar', 'Chamarajanagar', 'Chikkaballapur', 'Chikkamagaluru', 'Chitradurga',
    'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri',
    'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur',
    'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada',
    'Vijayapura', 'Yadgir'
  ];

  // Disease types / Specializations
  const diseaseTypes = [
    'General', 'Cardio', 'Neuro', 'Ortho', 'Hematology', 
    'Endocrinology', 'Nephrology', 'Oncology', 'Pulmonology', 
    'Gastro', 'Dermatology', 'Pediatrics', 'Gynecologist', 'Others'
  ];

  const roleThemes = {
    patient: { id: 'patient', label: 'Patient', icon: 'fa-user', gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)', shadow: 'rgba(16, 185, 129, 0.4)' },
    hospital: { id: 'hospital', label: 'Hospital Staff', icon: 'fa-hospital-user', gradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', shadow: 'rgba(245, 158, 11, 0.4)' },
    doctor: { id: 'doctor', label: 'Doctor', icon: 'fa-user-md', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', shadow: 'rgba(139, 92, 246, 0.4)' }
  };
  const theme = roleThemes[userType];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profile_photo: file,
        photo_preview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (formData.password !== formData.confirm_password) {
      alert('Passwords do not match!');
      return;
    }
    
    try {
      const data = new FormData();
      data.append('user_type', userType);
      data.append('username', formData.username);
      data.append('email', formData.email);
      data.append('password', formData.password);
      
      if (formData.profile_photo) {
        data.append('profile_photo', formData.profile_photo);
      }
      
      if (userType === 'patient') {
        data.append('full_name', formData.name);
        data.append('phone_number', formData.phone);
        data.append('age', formData.age);
        data.append('district', formData.district);
        data.append('economic_status', formData.economic_status);
        data.append('has_ration_card', formData.has_ration_card);
        data.append('has_aadhaar', formData.has_aadhaar);
        data.append('aadhaar_last4', formData.aadhaar_last4);
        data.append('disease_type', formData.disease_type);
      } else if (userType === 'hospital') {
        data.append('staff_name', formData.name);
        data.append('hospital_name', formData.hospital_name);
        data.append('department', formData.department);
        data.append('license_number', formData.license_number);
      } else if (userType === 'doctor') {
        data.append('full_name', formData.name);
        data.append('phone', formData.phone);
        data.append('specialization', formData.specialization);
        data.append('license_number', formData.license_number);
        data.append('hospital_affiliation', formData.hospital_name);
        data.append('district', formData.district);
        data.append('bio', formData.bio);
        data.append('experience_years', formData.experience_years);
      }
      
      const response = await register(data);
      
      if (response.success) {
        alert('Registration successful! Please login.');
        navigate('/login');
      } else {
        alert('Registration failed: ' + (response.error || response.message || 'Please try again'));
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed: ' + error.message);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
      <div className="glass-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 className="text-center" style={{ 
          fontFamily: 'Montserrat, sans-serif', 
          fontSize: '2.4rem', 
          fontWeight: '800', 
          marginBottom: '0.75rem', 
          color: '#f8fafc',
          transition: 'all 0.5s ease'
        }}>
          Create Account
        </h1>
        
        <p className="text-center mb-4" style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', fontWeight: '500', maxWidth: '350px', margin: '0 auto 2.5rem', lineHeight: '1.5' }}>
          Select your account type to get started
        </p>
        
        <div style={{ 
          display: 'flex', 
          background: 'rgba(0, 0, 0, 0.2)', 
          padding: '0.5rem', 
          borderRadius: '20px', 
          marginBottom: '3rem',
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
        
        <form onSubmit={handleSubmit}>
          {userType === 'patient' ? (
            <>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <i className="fas fa-user"></i>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <div className="input-wrapper">
                    <i className="fas fa-envelope"></i>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone Number</label>
                  <div className="input-wrapper">
                    <i className="fas fa-phone"></i>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Age</label>
                  <div className="input-wrapper">
                    <i className="fas fa-birthday-cake"></i>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your age"
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">District</label>
                  <div className="input-wrapper">
                    <i className="fas fa-map-marker-alt"></i>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select District</option>
                      {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Economic Status</label>
                  <div className="input-wrapper">
                    <i className="fas fa-rupee-sign"></i>
                    <select
                      name="economic_status"
                      value={formData.economic_status}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="APL">APL (Above Poverty Line)</option>
                      <option value="BPL">BPL (Below Poverty Line)</option>
                    </select>
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Disease Type</label>
                  <div className="input-wrapper">
                    <i className="fas fa-heartbeat"></i>
                    <select
                      name="disease_type"
                      value={formData.disease_type}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Disease</option>
                      {diseaseTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Aadhaar Last 4 Digits</label>
                  <div className="input-wrapper">
                    <i className="fas fa-id-card"></i>
                    <input
                      type="text"
                      name="aadhaar_last4"
                      value={formData.aadhaar_last4}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Last 4 digits of Aadhaar"
                      maxLength="4"
                    />
                  </div>
                </div>
                
                <div className="col-12 mb-3">
                  <label className="form-label">Document Availability</label>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <label className="btn btn-outline">
                      <input
                        type="checkbox"
                        name="has_ration_card"
                        checked={formData.has_ration_card}
                        onChange={handleChange}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Have Ration Card?
                    </label>
                    <label className="btn btn-outline">
                      <input
                        type="checkbox"
                        name="has_aadhaar"
                        checked={formData.has_aadhaar}
                        onChange={handleChange}
                        style={{ marginRight: '0.5rem' }}
                      />
                      Have Aadhaar Card?
                    </label>
                  </div>
                </div>
              </div>
            </>
          ) : userType === 'hospital' ? (
            <>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <i className="fas fa-user"></i>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <div className="input-wrapper">
                    <i className="fas fa-envelope"></i>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Hospital Name</label>
                  <div className="input-wrapper">
                    <i className="fas fa-hospital"></i>
                    <input
                      type="text"
                      name="hospital_name"
                      value={formData.hospital_name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter hospital name"
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Department</label>
                  <div className="input-wrapper">
                    <i className="fas fa-stethoscope"></i>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter department"
                    />
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">License Number</label>
                  <div className="input-wrapper">
                    <i className="fas fa-id-card"></i>
                    <input
                      type="text"
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter license number"
                      required
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="row">
                <div className="col-12 mb-4 text-center">
                  <div className="profile-photo-upload">
                    <div className="photo-preview-container mb-3" style={{ border: '2px dashed var(--neon-blue)', borderRadius: '50%', width: '120px', height: '120px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: 'rgba(0, 243, 255, 0.05)' }}>
                      {formData.photo_preview ? (
                        <img src={formData.photo_preview} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <i className="fas fa-camera fa-2x" style={{ color: 'var(--neon-blue)', opacity: 0.5 }}></i>
                      )}
                    </div>
                    <label className="btn btn-outline-sm" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <i className="fas fa-upload me-2"></i> Upload Profile Photo
                      <input type="file" name="profile_photo" onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <i className="fas fa-user-md"></i>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Dr. Full Name"
                      required
                    />
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <div className="input-wrapper">
                    <i className="fas fa-envelope"></i>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone Number</label>
                  <div className="input-wrapper">
                    <i className="fas fa-phone"></i>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Specialization</label>
                  <div className="input-wrapper">
                    <i className="fas fa-stethoscope"></i>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Specialization</option>
                      {diseaseTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="col-md-6 mb-3">
                  <label className="form-label">Medical License Number</label>
                  <div className="input-wrapper">
                    <i className="fas fa-id-card"></i>
                    <input
                      type="text"
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter license number"
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Experience (Years)</label>
                  <div className="input-wrapper">
                    <i className="fas fa-briefcase-medical"></i>
                    <input
                      type="number"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Years of experience"
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Hospital Affiliation (Optional)</label>
                  <div className="input-wrapper">
                    <i className="fas fa-hospital"></i>
                    <input
                      type="text"
                      name="hospital_name"
                      value={formData.hospital_name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Primary hospital/clinic"
                    />
                  </div>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">District</label>
                  <div className="input-wrapper">
                    <i className="fas fa-map-marker-alt"></i>
                    <select
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Operating District</option>
                      {districts.map(district => (
                        <option key={district} value={district}>{district}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Bio / Profile Summary</label>
                  <div className="input-wrapper" style={{ height: 'auto' }}>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Brief description about your practice and expertise"
                      rows="3"
                      style={{ padding: '0.75rem 1rem' }}
                    ></textarea>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Username</label>
              <div className="input-wrapper">
                <i className="fas fa-user-circle"></i>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Choose a username"
                  required
                />
              </div>
            </div>
            
            <div className="col-md-6 mb-3">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Create a password"
                  required
                />
              </div>
            </div>
            
            <div className="col-md-6 mb-3">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn" 
            style={{ 
              width: '100%', 
              padding: '1.25rem', 
              background: theme.gradient, 
              color: 'white', 
              fontSize: '1.2rem', 
              borderRadius: '18px',
              boxShadow: `0 10px 30px ${theme.shadow}`,
              border: 'none',
              fontWeight: '700'
            }}
          >
            <i className="fas fa-user-plus me-2"></i> Register
          </button>
        </form>
        
        <div className="text-center mt-4" style={{ color: 'var(--gray-300)' }}>
          <p>
            Already have an account? 
            <Link to="/login" className="ms-2" style={{ color: 'var(--primary-emerald)' }}>
              Sign In
            </Link>
          </p>
          <p>
            <Link to="/" style={{ color: 'var(--primary-emerald)' }}>
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;