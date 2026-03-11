// Service to connect to Django REST Framework APIs

class ApiService {
  constructor(baseUrl = 'http://127.0.0.1:8000') {
    this.baseUrl = baseUrl;
    // Don't initialize token here, let it be set when needed
    this.token = null;
    this.refreshToken = null;
  }

  // Set authentication token
  setAuthToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    // Always fallback to localStorage in case this.token is null
    let authToken = this.token || localStorage.getItem('authToken');
    if (authToken && !authToken.startsWith('Bearer ')) {
      authToken = `Bearer ${authToken}`;
    }

    const { headers: optionHeaders, ...restOptions } = options;

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': authToken }),
        ...optionHeaders,
      },
      ...restOptions,
    };

    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // Handle token expiration
      if (response.status === 401 && data.detail && data.detail.includes('token') && endpoint !== '/api/auth/refresh-token/') {
        // Try to refresh token
        try {
          const refreshResponse = await this.refreshTokenFunc();
          if (refreshResponse.token) {
            // Retry the original request with new token
            let newToken = refreshResponse.token;
            if (!newToken.startsWith('Bearer ')) {
              newToken = `Bearer ${newToken}`;
            }
            config.headers.Authorization = newToken;
            const retryResponse = await fetch(url, config);
            const retryData = await retryResponse.json();

            if (!retryResponse.ok) {
              throw new Error(retryData.detail || retryData.error || 'Something went wrong');
            }

            return retryData;
          }
        } catch (refreshError) {
          // If refresh fails, clear tokens and redirect to login
          this.setAuthToken(null);
          this.refreshToken = null;
          window.location.href = '/login';
        }
      }

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials) {
    let endpoint = '/api/auth/patient-login/';
    if (credentials.user_type === 'hospital') {
      endpoint = '/api/auth/hospital-login/';
    } else if (credentials.user_type === 'doctor') {
      endpoint = '/api/auth/doctor-login/';
    }
    
    const data = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (data.token || data.access_token) {
      // Store token (handle both formats returned by backend)
      const tokenToStore = data.token || data.access_token;
      this.setAuthToken(tokenToStore);
      if (data.refresh) {
        this.refreshToken = data.refresh;
        localStorage.setItem('refreshToken', data.refresh);
      }
    }

    return data;
  }

  async register(userData) {
    let userType;
    if (userData instanceof FormData) {
      userType = userData.get('user_type');
    } else {
      userType = userData.user_type;
    }

    let endpoint = '/api/auth/register-patient/';
    if (userType === 'hospital') {
      endpoint = '/api/auth/register-hospital/';
    } else if (userType === 'doctor') {
      endpoint = '/api/auth/register-doctor/';
    }

    return this.request(endpoint, {
      method: 'POST',
      body: userData instanceof FormData ? userData : JSON.stringify(userData),
    });
  }

  // Doctor API endpoints
  async getDoctors(specialization = '') {
    const queryParams = specialization ? `?specialization=${encodeURIComponent(specialization)}` : '';
    return this.request(`/api/doctors/${queryParams}`, {
      method: 'GET',
    });
  }

  async getDoctorStats() {
    return this.request('/api/doctor/stats/', { method: 'GET' });
  }

  async updateDoctorProfile(formData) {
    let authToken = this.token || localStorage.getItem('authToken');
    if (authToken && !authToken.startsWith('Bearer ')) {
      authToken = `Bearer ${authToken}`;
    }
    return this.request('/api/doctor/update-profile/', {
      method: 'PUT',
      body: formData,
      headers: {
        ...(authToken && { 'Authorization': authToken }),
      },
    });
  }

  async toggleDoctorOnlineStatus() {
    return this.request('/api/doctor/toggle-online/', { method: 'POST' });
  }

  async logout() {
    try {
      await this.request('/api/auth/logout/', {
        method: 'POST',
      });
    } finally {
      this.setAuthToken(null);
      this.refreshToken = null;
    }
  }

  async refreshTokenFunc() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const data = await this.request('/api/auth/refresh-token/', {
      method: 'POST',
      body: JSON.stringify({ refresh: this.refreshToken }),
    });

    if (data.token) {
      // Store token without Bearer prefix
      this.setAuthToken(data.token);
    }

    return data;
  }

  // Scheme endpoints
  async checkSchemeEligibility(patientData) {
    return this.request('/api/check-eligibility/', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  // Report endpoints
  async uploadMedicalReport(formData) {
    // Always fallback to localStorage in case this.token is null
    let authToken = this.token || localStorage.getItem('authToken');
    if (authToken && !authToken.startsWith('Bearer ')) {
      authToken = `Bearer ${authToken}`;
    }

    return this.request('/api/hospital/upload-report/', {
      method: 'POST',
      body: formData,
      headers: {
        ...(authToken && { 'Authorization': authToken }),
        // Remove Content-Type to let browser set it with boundary for file uploads
      },
    });
  }

  async getMedicalReports() {
    return this.request('/api/patient/reports/');
  }

  async analyzeMedicalReport(reportData) {
    return this.request('/api/analyze-report/', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  // Hospital Staff endpoints
  async getHospitalUploadHistory() {
    return this.request('/api/hospital/upload-history/');
  }

  // Patient OTP & Report Access endpoints
  async requestOtp(phoneNumber) {
    return this.request('/api/patient/request-otp/', {
      method: 'POST',
      body: JSON.stringify({ phone_number: phoneNumber }),
    });
  }


  async verifyOtp(otpData) {
    return this.request('/api/patient/verify-otp/', {
      method: 'POST',
      body: JSON.stringify(otpData),
    });
  }

  async viewReport(reportId) {
    // This will return the decrypted report file
    const url = `${this.baseUrl}/api/patient/report/${reportId}/`;

    // Ensure token has Bearer prefix if it exists
    let authToken = this.token;
    if (authToken && !authToken.startsWith('Bearer ')) {
      authToken = `Bearer ${authToken}`;
    }

    const config = {
      headers: {
        ...(authToken && { 'Authorization': authToken }),
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || 'Something went wrong');
      }

      // Check if response is JSON or file
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        // Return blob for PDF file
        return await response.blob();
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getAccessLogs() {
    return this.request('/api/patient/access-logs/');
  }

  // Subscription endpoints
  async getSubscriptionStatus() {
    return this.request('/api/subscription/');
  }

  async upgradeToPremium(paymentData) {
    return this.request('/api/upgrade-premium/', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // ─── Doctor Consultation endpoints ────────────────────────────────────────────

  async getDoctorById(doctorId) {
    return this.request(`/api/doctors/${doctorId}/`, { method: 'GET' });
  }

  async initiateConsultation(doctorId) {
    return this.request('/api/consultations/initiate/', {
      method: 'POST',
      body: JSON.stringify({ doctor_id: doctorId }),
    });
  }

  async acceptConsultation(consultationId) {
    return this.request('/api/consultations/accept/', {
      method: 'POST',
      body: JSON.stringify({ consultation_id: consultationId }),
    });
  }

  async getConsultationStatus(consultationId) {
    return this.request(`/api/consultations/${consultationId}/status/`, { method: 'GET' });
  }

  async processVideoCallPayment(consultationId, paymentId) {
    return this.request('/api/consultations/payment/', {
      method: 'POST',
      body: JSON.stringify({ consultation_id: consultationId, payment_id: paymentId }),
    });
  }

  /**
   * Ask Gemini AI to recommend the best doctor for a patient's report.
   * Sends report analysis context + list of available doctors to the backend.
   * Falls back gracefully if the endpoint isn't available yet.
   */
  async getGeminiDoctorRecommendation(reportContext, doctors) {
    try {
      return await this.request('/api/gemini/recommend-doctor/', {
        method: 'POST',
        body: JSON.stringify({
          report_analysis: reportContext,
          available_doctors: doctors.map(d => ({
            id: d.id,
            full_name: d.full_name,
            specialization: d.specialization,
            experience_years: d.experience_years,
            hospital_affiliation: d.hospital_affiliation,
          })),
        }),
      });
    } catch (err) {
      // Graceful fallback – pick the doctor whose specialization best matches analysis keywords
      if (doctors.length === 0) return { success: false };
      const contextStr = JSON.stringify(reportContext || '').toLowerCase();
      const specMap = {
        heart: 'Cardio', cardio: 'Cardio', cholesterol: 'Cardio', blood_pressure: 'Cardio',
        sugar: 'Endocrinology', glucose: 'Endocrinology', diabetes: 'Endocrinology',
        kidney: 'Nephrology', creatinine: 'Nephrology',
        liver: 'Gastro', sgot: 'Gastro', sgpt: 'Gastro',
        bone: 'Ortho', joint: 'Ortho', fracture: 'Ortho',
        blood: 'Hematology', hemoglobin: 'Hematology',
        lung: 'Pulmonology', breath: 'Pulmonology',
        brain: 'Neuro', nerve: 'Neuro',
      };
      let targetSpec = '';
      for (const [kw, spec] of Object.entries(specMap)) {
        if (contextStr.includes(kw)) { targetSpec = spec; break; }
      }
      const match = targetSpec ? doctors.find(d => d.specialization?.toLowerCase().includes(targetSpec.toLowerCase())) : null;
      return { success: true, recommended_doctor_id: (match || doctors[0]).id };
    }
  }

  async getGeminiChatResponse(message, history = [], doctorContext = null) {
    return this.request('/api/gemini/chat/', {
      method: 'POST',
      body: JSON.stringify({
        message,
        history,
        doctor_context: doctorContext
      }),
    });
  }
}

// Export singleton instance
const apiService = new ApiService();

export default apiService;