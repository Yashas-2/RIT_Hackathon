import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/AuthProvider';
import apiService from '../services/apiService';

/* ──────────────────────────────────────────────
   SPECIALIZATIONS LIST
────────────────────────────────────────────── */
const SPECIALIZATIONS = [
  "Cardiology", "Neurology", "Orthopedics", "Gynecology", "Pediatrics",
  "Dermatology", "Oncology", "Gastroenterology", "Nephrology", "Endocrinology",
  "Psychiatry", "Ophthalmology", "Urology", "ENT", "General Medicine",
  "Pulmonology", "Hematology", "Radiology", "Anesthesiology", "Pathology"
];

/* ──────────────────────────────────────────────
   EDIT PROFILE MODAL
────────────────────────────────────────────── */
const EditProfileModal = ({ isOpen, onClose, user, onSave }) => {
  const [form, setForm] = useState({
    specialization: user?.specialization || '',
    district: user?.district || '',
    hospital_affiliation: user?.hospital || user?.hospital_affiliation || '',
    full_name: user?.full_name || '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.profile_photo ? `http://127.0.0.1:8000${user.profile_photo}` : null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  if (!isOpen) return null;

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Photo size must be less than 5MB");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Photo size must be less than 5MB");
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const fd = new FormData();
    fd.append('specialization', form.specialization);
    fd.append('district', form.district);
    fd.append('hospital_affiliation', form.hospital_affiliation);
    fd.append('full_name', form.full_name);
    if (photoFile) {
      fd.append('profile_photo', photoFile);
    }

    try {
      const res = await apiService.updateDoctorProfile(fd);
      if (res.success) {
        onSave(res.user || { ...user, ...form, profile_photo: res.user?.profile_photo || user.profile_photo });
      } else {
        setError(res.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Save error:", err);
      // More descriptive error for JSON parsing issues
      if (err.message && err.message.includes('Unexpected token')) {
        setError("Server returned an invalid response (HTML instead of JSON). Check backend logs.");
      } else {
        setError(err.message || "An unexpected error occurred");
      }
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
    background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'border 0.2s',
  };

  const initials = (form.full_name || 'D').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', animation: 'slideUp 0.3s ease-out' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: '#fff', margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Edit Profile</h3>
            <p style={{ color: '#94a3b8', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>Update your professional information</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-times" />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ padding: '1.75rem' }}>
          {/* Profile Photo */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
              <i className="fas fa-camera me-2" style={{ color: '#06b6d4' }} />Profile Photo
            </label>
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileRef.current.click()}
              style={{ border: '2px dashed rgba(6,182,212,0.4)', borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', textAlign: 'center', background: 'rgba(6,182,212,0.04)', position: 'relative' }}
            >
              {photoPreview ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', textAlign: 'left' }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: `url(${photoPreview}) center/cover no-repeat`, flexShrink: 0, border: '3px solid rgba(16,185,129,0.5)' }} />
                  <div>
                    <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>{photoFile ? photoFile.name : 'Current Photo'}</div>
                    <div style={{ color: '#06b6d4', fontSize: '0.78rem', marginTop: '0.4rem' }}>Click to change</div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                    {initials}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Click to upload or drag & drop</div>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Full Name</label>
            <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} style={inp} required />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Specialization</label>
            <select value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} required style={inp}>
              <option value="" disabled>Select specialization</option>
              {SPECIALIZATIONS.map(s => <option key={s} value={s} style={{ background: '#1e293b' }}>{s}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Location / District</label>
            <input value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} style={inp} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Hospital / Clinic Name</label>
            <input value={form.hospital_affiliation} onChange={e => setForm(f => ({ ...f, hospital_affiliation: e.target.value }))} style={inp} />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#f87171', fontSize: '0.85rem' }}>
              <i className="fas fa-exclamation-circle me-2" />{error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={saving} style={{ flex: 2, padding: '0.75rem', borderRadius: '12px', border: 'none', background: saving ? 'rgba(16,185,129,0.4)' : 'linear-gradient(135deg,#06b6d4,#10b981)', color: 'white', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────
   MAIN DASHBOARD COMPONENT
────────────────────────────────────────────── */
const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsData, setStatsData] = useState({ total_patients: '—', pending_requests: '—', completed: '—', avg_rating: '—' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [localUser, setLocalUser] = useState(null);
  const [consultations, setConsultations] = useState([]);
  const [isOnline, setIsOnline] = useState(user?.is_online || false);
  const [loadingConsults, setLoadingConsults] = useState(true);

  const profile = localUser || user;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiService.getDoctorStats();
        if (res.success && res.stats) {
          setStatsData(res.stats);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
    
    const fetchConsultations = async () => {
      try {
        const res = await apiService.request('/api/consultations/list/', { method: 'GET' });
        if (res.success) {
          setConsultations(res.data);
        }
      } catch (err) {
        console.error('Failed to load consultations:', err);
      } finally {
        setLoadingConsults(false);
      }
    };
    fetchConsultations();

    const interval = setInterval(fetchConsultations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (localUser && localUser.doctor_profile) {
      setIsOnline(localUser.doctor_profile.is_online);
    }
  }, [localUser]);

  const handleToggleOnline = async () => {
    try {
      const res = await apiService.toggleDoctorOnlineStatus();
      if (res.success) {
        setIsOnline(res.is_online);
      }
    } catch (err) {
      alert("Failed to toggle status: " + err.message);
    }
  };

  const handleAcceptConsultation = async (id) => {
    try {
      const res = await apiService.acceptConsultation(id);
      if (res.success) {
        setConsultations(prev => prev.map(c => c.id === id ? { ...c, status: 'ACCEPTED' } : c));
        alert("Consultation accepted! Waiting for patient to pay.");
      }
    } catch (err) {
      alert("Failed to accept: " + err.message);
    }
  };

  const handleProfileSaved = (updatedUser) => {
    setLocalUser(updatedUser);
    setShowEditModal(false);
  };

  const C = {
    bg: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
    cardBg: 'rgba(255,255,255,0.05)',
    cardBorder: 'rgba(255,255,255,0.1)',
    textPrimary: '#f8fafc',
    textSecond: '#94a3b8',
    accent: '#10b981',
    accentTeal: '#06b6d4',
  };

  const stats = [
    { label: 'Total Patients', value: statsLoading ? '…' : String(statsData.total_patients), icon: 'fa-users', color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
    { label: 'Pending Requests', value: statsLoading ? '…' : String(statsData.pending_requests), icon: 'fa-clock', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    { label: 'Completed', value: statsLoading ? '…' : String(statsData.completed), icon: 'fa-check-circle', color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    { label: 'Avg. Rating', value: statsLoading ? '…' : String(statsData.avg_rating), icon: 'fa-star', color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', fontFamily: "'Inter',sans-serif" }}>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'rgba(10,14,39,0.85)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.cardBorder}`, height: '64px', padding: '0 1.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #06b6d4, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-heartbeat" style={{ color: '#fff' }} />
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem', color: C.textPrimary }}>ArogyaMitra AI</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Active/Inactive Status Switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingRight: '1rem', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isOnline ? '#10b981' : '#f87171', letterSpacing: '0.02em' }}>
              {isOnline ? 'ACTIVE' : 'INACTIVE'}
            </span>
            <div 
              onClick={handleToggleOnline}
              title={isOnline ? "Click to set Inactive" : "Click to set Active"}
              style={{ 
                width: '46px', height: '24px', borderRadius: '20px', 
                background: isOnline ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.15)',
                border: `1px solid ${isOnline ? '#10b981' : '#f87171'}`,
                cursor: 'pointer', position: 'relative', transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isOnline ? '0 0 15px rgba(16,185,129,0.2)' : 'none'
              }}
            >
              <div style={{ 
                position: 'absolute', top: '3px', left: isOnline ? '25px' : '3px',
                width: '16px', height: '16px', borderRadius: '50%',
                background: isOnline ? '#10b981' : '#f87171',
                boxShadow: isOnline ? '0 0 10px rgba(16,185,129,0.5)' : '0 0 10px rgba(248,113,113,0.3)',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: profile?.profile_photo ? `url(http://127.0.0.1:8000${profile.profile_photo}) center/cover no-repeat` : 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
              {!profile?.profile_photo && (profile?.full_name?.charAt(0) || 'D')}
            </div>
            <div style={{ fontSize: '0.85rem', color: C.textPrimary }}>Dr. {profile?.full_name?.split(' ')[0]}</div>
          </div>
          <button onClick={logout} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '6rem 2rem 2rem', overflowY: 'auto' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: C.textPrimary }}>Welcome back, Dr. {profile?.full_name?.split(' ')[0]}</h1>
          <p style={{ color: C.textSecond }}>Here is your professional overview.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: '18px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '13px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fas ${s.icon}`} style={{ color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: C.textPrimary }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: C.textSecond }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
          <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: '20px', padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1rem', color: C.textPrimary, marginBottom: '1.5rem' }}>Professional Profile</h2>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: profile?.profile_photo ? `url(http://127.0.0.1:8000${profile.profile_photo}) center/cover no-repeat` : 'linear-gradient(135deg,#06b6d4,#10b981)', border: '3px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: '#fff', fontWeight: 800, marginBottom: '1rem' }}>
                {!profile?.profile_photo && (profile?.full_name?.charAt(0) || 'D')}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, color: C.textPrimary, fontSize: '1.1rem' }}>Dr. {profile?.full_name}</div>
                <div style={{ color: C.accentTeal, fontSize: '0.85rem' }}>{profile?.specialization || 'General Practice'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: C.textSecond }}><i className="fas fa-hospital me-2" /> {profile?.hospital || profile?.hospital_affiliation || 'N/A'}</div>
              <div style={{ fontSize: '0.85rem', color: C.textSecond }}><i className="fas fa-map-marker-alt me-2" /> {profile?.district || 'Not Set'}</div>
            </div>
            <button onClick={() => setShowEditModal(true)} style={{ marginTop: '1.5rem', width: '100%', padding: '0.75rem', borderRadius: '12px', border: `1px solid ${C.cardBorder}`, background: 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer' }}>Edit Profile</button>
          </div>

          <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: '20px', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1rem', color: C.textPrimary, marginBottom: '1.5rem' }}>Incoming Consultation Requests</h2>
            
            {loadingConsults ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: C.textSecond }}>Loading requests...</div>
            ) : consultations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: C.textSecond }}>
                <i className="fas fa-user-clock" style={{ fontSize: '3rem', opacity: 0.2, marginBottom: '1rem', display: 'block' }} />
                <p>Your incoming patient queue is empty.</p>
                <p style={{ fontSize: '0.8rem' }}>Toggle <b>Online</b> status to receive requests.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {consultations.map(c => (
                  <div key={c.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: C.textPrimary }}>{c.patient_name}</div>
                      <div style={{ fontSize: '0.8rem', color: C.textSecond }}>Requested: {new Date(c.created_at).toLocaleTimeString()}</div>
                      <div style={{ 
                        marginTop: '0.5rem', display: 'inline-block', padding: '0.2rem 0.6rem', 
                        borderRadius: '6px', fontSize: '0.7rem', fontWeight: 700,
                        background: c.status === 'REQUESTED' ? 'rgba(251,191,36,0.1)' : 'rgba(16,185,129,0.1)',
                        color: c.status === 'REQUESTED' ? '#fbbf24' : '#10b981'
                      }}>
                        {c.status}
                      </div>
                    </div>
                    <div>
                      {c.status === 'REQUESTED' && (
                        <button 
                          onClick={() => handleAcceptConsultation(c.id)}
                          style={{ background: 'linear-gradient(135deg,#10b981,#059669)', border: 'none', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          Accept Request
                        </button>
                      )}
                      {c.status === 'PAID' && (
                        <button 
                          onClick={() => window.location.href = `/consultation/${c.id}`}
                          style={{ background: 'linear-gradient(135deg,#06b6d4,#0891b2)', border: 'none', color: '#fff', padding: '0.6rem 1.25rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                        >
                          <i className="fas fa-video me-2" /> Join Live Consultation
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {showEditModal && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          user={profile}
          onSave={handleProfileSaved}
        />
      )}

      <footer style={{ padding: '1.5rem', textAlign: 'center', color: '#444' }}>© 2026 ArogyaMitra AI</footer>
    </div>
  );
};

export default DoctorDashboard;
