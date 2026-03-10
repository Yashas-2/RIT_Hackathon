import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../components/AuthProvider';
import apiService from '../services/apiService';

/* ──────────────────────────────────────────────
   EDIT PROFILE MODAL
────────────────────────────────────────────── */
const SPECIALIZATIONS = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Endocrinology',
  'Nephrology', 'Gastroenterology', 'Hematology', 'Pulmonology',
  'Dermatology', 'Psychiatry', 'Oncology', 'Ophthalmology',
  'ENT', 'Gynecology', 'Pediatrics', 'General Physician',
  'Urology', 'Rheumatology', 'Radiology', 'Anesthesiology',
];

const EditProfileModal = ({ user, onClose, onSave }) => {
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    specialization: user?.specialization || '',
    district: user?.district || '',
    hospital_affiliation: user?.hospital_affiliation || '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(
    user?.profile_photo ? `http://localhost:8000${user.profile_photo}` : null
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5 MB.');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('specialization', form.specialization);
      fd.append('district', form.district);
      fd.append('hospital_affiliation', form.hospital_affiliation);
      if (photoFile) fd.append('profile_photo', photoFile);

      const res = await apiService.updateDoctorProfile(fd);
      if (res && res.success) {
        setSaved(true);
        onSave(res.data || { ...form, profile_photo: res.profile_photo });
        setTimeout(() => onClose(), 1500);
      } else {
        setError(res?.error || 'Failed to save. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const inp = {
    width: '100%', padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px', color: '#f8fafc',
    fontSize: '0.9rem', outline: 'none',
  };

  const initials = user?.full_name?.charAt(0)?.toUpperCase() || 'D';

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 70px rgba(0,0,0,0.6)', animation: 'slideUp 0.3s ease-out' }}>

        {/* Header */}
        <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: '#f8fafc', margin: '0 0 0.2rem', fontSize: '1.15rem', fontWeight: 800 }}>Edit Profile</h3>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.82rem' }}>Update your specialization, photo & location</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
            <i className="fas fa-times" />
          </button>
        </div>

        {saved ? (
          /* Success state */
          <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
            <div style={{ width: 70, height: 70, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <i className="fas fa-check" style={{ color: '#10b981', fontSize: '1.8rem' }} />
            </div>
            <h4 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Profile Updated!</h4>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.88rem' }}>Your changes have been saved successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ padding: '1.75rem' }}>

            {/* ── Profile Photo Upload ── */}
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                <i className="fas fa-camera me-2" style={{ color: '#06b6d4' }} />Profile Photo
              </label>

              {/* Drop zone / preview */}
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileRef.current.click()}
                style={{ border: '2px dashed rgba(6,182,212,0.4)', borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', textAlign: 'center', background: 'rgba(6,182,212,0.04)', transition: 'border 0.2s', position: 'relative' }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(6,182,212,0.8)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)'}
              >
                {photoPreview ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', textAlign: 'left' }}>
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: `url(${photoPreview}) center/cover no-repeat`, flexShrink: 0, border: '3px solid rgba(16,185,129,0.5)', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }} />
                    <div>
                      <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>{photoFile ? photoFile.name : 'Current Photo'}</div>
                      {photoFile && <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.2rem' }}>{(photoFile.size / 1024).toFixed(1)} KB</div>}
                      <div style={{ color: '#06b6d4', fontSize: '0.78rem', marginTop: '0.4rem' }}>Click to change</div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Placeholder avatar */}
                    <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                      {initials}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                      <strong style={{ color: '#67e8f9' }}>Click to upload</strong> or drag & drop your photo
                    </div>
                    <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.3rem' }}>PNG, JPG, WEBP · Max 5 MB</div>
                  </>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
              </div>
            </div>

            {/* ── Specialization ── */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                <i className="fas fa-stethoscope me-2" style={{ color: '#10b981' }} />Specialization
              </label>
              <select
                value={form.specialization}
                onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))}
                required
                style={{ ...inp, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="" disabled>Select your specialization</option>
                {SPECIALIZATIONS.map(s => (
                  <option key={s} value={s} style={{ background: '#1e293b' }}>{s}</option>
                ))}
              </select>
            </div>

            {/* ── Location / District ── */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                <i className="fas fa-map-marker-alt me-2" style={{ color: '#f59e0b' }} />Location / District
              </label>
              <input
                value={form.district}
                onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                placeholder="e.g. Bengaluru, Hassan, Mysuru…"
                style={inp}
              />
            </div>

            {/* ── Hospital Affiliation ── */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                <i className="fas fa-hospital me-2" style={{ color: '#8b5cf6' }} />Hospital / Clinic Name
              </label>
              <input
                value={form.hospital_affiliation}
                onChange={e => setForm(f => ({ ...f, hospital_affiliation: e.target.value }))}
                placeholder="e.g. City General Hospital"
                style={inp}
              />
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.75rem 1rem', marginBottom: '1.25rem', color: '#f87171', fontSize: '0.85rem' }}>
                <i className="fas fa-exclamation-circle me-2" />{ error }
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} style={{ flex: 2, padding: '0.75rem', borderRadius: '12px', border: 'none', background: saving ? 'rgba(16,185,129,0.4)' : 'linear-gradient(135deg,#06b6d4,#10b981)', color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', boxShadow: saving ? 'none' : '0 4px 15px rgba(16,185,129,0.35)', transition: 'all 0.2s' }}>
                {saving ? (
                  <><div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />Saving…</>
                ) : (
                  <><i className="fas fa-save" />Save Changes</>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin    { from { transform:rotate(0deg); }              to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
};

/* ──────────────────────────────────────────────
   DOCTOR DASHBOARD
────────────────────────────────────────────── */
const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    total_patients: '—', pending_requests: '—', completed: '—', avg_rating: '—',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [localUser, setLocalUser] = useState(null); // overrides after save

  const profile = localUser || user; // use locally-saved if available

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiService.getDoctorStats();
        if (res.success && res.stats) {
          setStatsData({
            total_patients: res.stats.total_patients,
            pending_requests: res.stats.pending_requests,
            completed: res.stats.completed,
            avg_rating: res.stats.avg_rating,
          });
        }
      } catch (err) {
        console.error('Failed to load doctor stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleProfileSaved = (updatedData) => {
    setLocalUser(prev => ({ ...(prev || user), ...updatedData }));
  };

  const stats = [
    { label: 'Total Patients',   value: statsLoading ? '…' : String(statsData.total_patients),   icon: 'fa-users',        color: '#38bdf8', bg: 'rgba(56,189,248,0.1)'  },
    { label: 'Pending Requests', value: statsLoading ? '…' : String(statsData.pending_requests), icon: 'fa-clock',        color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
    { label: 'Completed',        value: statsLoading ? '…' : String(statsData.completed),        icon: 'fa-check-circle', color: '#34d399', bg: 'rgba(52,211,153,0.1)'  },
    { label: 'Avg. Rating',      value: statsLoading ? '…' : String(statsData.avg_rating),       icon: 'fa-star',         color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
  ];

  const C = {
    bg:          'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
    cardBg:      'rgba(255,255,255,0.05)',
    cardBorder:  'rgba(255,255,255,0.1)',
    textPrimary: '#f8fafc',
    textSecond:  '#94a3b8',
    accent:      '#10b981',
    accentTeal:  '#06b6d4',
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column', fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* ── Top Navbar ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'rgba(10,14,39,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.cardBorder}`,
        height: '64px', padding: '0 1.75rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #06b6d4, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>
            <i className="fas fa-heartbeat" style={{ color: '#fff', fontSize: '1rem' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: C.textPrimary, letterSpacing: '-0.3px' }}>
              Arogya<span style={{ background: 'linear-gradient(90deg,#06b6d4,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mitra AI</span>
            </div>
            <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Doctor Portal</div>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSecond, fontSize: '1.05rem', padding: '0.4rem' }}>
            <i className="fas fa-bell" />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* Navbar avatar */}
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: profile?.profile_photo ? `url(http://localhost:8000${profile.profile_photo}) center/cover no-repeat` : 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 0 12px rgba(16,185,129,0.3)', overflow: 'hidden' }}>
              {!profile?.profile_photo && (profile?.full_name?.charAt(0) || 'D')}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: C.textPrimary }}>Dr. {profile?.full_name?.split(' ')[0] || 'Doctor'}</div>
              <div style={{ fontSize: '0.7rem', color: C.textSecond }}>{profile?.specialization || 'Specialist'}</div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', padding: '0.45rem 1rem', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
          >
            <i className="fas fa-sign-out-alt" /> Logout
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, paddingTop: '64px' }}>
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>

          {/* Page header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: C.textPrimary, margin: '0 0 0.3rem', letterSpacing: '-0.3px' }}>
              Welcome back,{' '}
              <span style={{ background: 'linear-gradient(90deg,#2dd4bf,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Dr. {profile?.full_name?.split(' ')[0] || 'Doctor'}
              </span>
            </h1>
            <p style={{ color: C.textSecond, margin: 0, fontSize: '0.95rem' }}>Here is what's happening with your practice today.</p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
            {stats.map((s, i) => (
              <div key={i} style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: '18px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', backdropFilter: 'blur(16px)', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '13px', background: s.bg, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`fas ${s.icon}`} style={{ color: s.color, fontSize: '1.15rem' }} />
                </div>
                <div>
                  <div style={{ fontSize: '1.55rem', fontWeight: 800, color: C.textPrimary, lineHeight: 1.1 }}>{s.value}</div>
                  <div style={{ fontSize: '0.78rem', color: C.textSecond, fontWeight: 500, marginTop: '0.1rem' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>

            {/* ── Doctor info card ── */}
            <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: '20px', padding: '1.5rem', backdropFilter: 'blur(16px)' }}>
              <h2 style={{ fontSize: '0.88rem', fontWeight: 700, color: C.textPrimary, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${C.cardBorder}` }}>
                Doctor Information
              </h2>

              {/* ── Profile Photo ── */}
              <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: profile?.profile_photo ? `url(http://localhost:8000${profile.profile_photo}) center/cover no-repeat` : 'linear-gradient(135deg, #06b6d4, #10b981)', border: '3px solid rgba(16,185,129,0.4)', boxShadow: '0 0 0 4px rgba(16,185,129,0.1), 0 8px 24px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                    {!profile?.profile_photo && (profile?.full_name?.charAt(0)?.toUpperCase() || 'D')}
                  </div>
                  {/* Online dot */}
                  <div style={{ position: 'absolute', bottom: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: '#10b981', border: '2px solid #0a0e27' }} />
                  {/* Camera edit button */}
                  <button
                    onClick={() => setShowEditModal(true)}
                    title="Edit photo"
                    style={{ position: 'absolute', bottom: 2, left: 2, width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#06b6d4,#10b981)', border: '2px solid #0a0e27', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}
                  >
                    <i className="fas fa-camera" />
                  </button>
                </div>

                {/* Name + Specialization */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: C.textPrimary, lineHeight: 1.2 }}>
                    Dr. {profile?.full_name || 'Doctor'}
                  </div>
                  <div style={{ marginTop: '0.35rem' }}>
                    <span style={{ display: 'inline-block', padding: '0.2rem 0.75rem', background: 'rgba(6,182,212,0.12)', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                      <i className="fas fa-stethoscope" style={{ marginRight: '0.35rem' }} />
                      {profile?.specialization || 'Specialist'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {[
                  { icon: 'fa-hospital',       label: 'Affiliation', value: profile?.hospital_affiliation || 'Independent Practice' },
                  { icon: 'fa-map-marker-alt', label: 'Location',    value: profile?.district || '—' },
                  { icon: 'fa-id-card',        label: 'License No.', value: profile?.license_number || '—' },
                  { icon: 'fa-envelope',       label: 'Email',       value: profile?.email || '—' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`fas ${item.icon}`} style={{ color: C.textSecond, fontSize: '0.82rem' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{item.label}</div>
                      <div style={{ fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 500, marginTop: '0.1rem' }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Edit button */}
              <button
                onClick={() => setShowEditModal(true)}
                style={{ marginTop: '1.5rem', width: '100%', padding: '0.65rem', borderRadius: '12px', border: `1px solid ${C.cardBorder}`, background: 'rgba(255,255,255,0.04)', color: C.textSecond, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = C.textSecond; }}
              >
                <i className="fas fa-pencil-alt" />Edit Profile Information
              </button>
            </div>

            {/* ── Consultation Requests ── */}
            <div style={{ background: C.cardBg, border: `1px solid ${C.cardBorder}`, borderRadius: '20px', padding: '1.5rem', backdropFilter: 'blur(16px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${C.cardBorder}` }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: C.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <i className="fas fa-calendar-alt" style={{ color: C.accentTeal }} />Recent Consultation Requests
                </h2>
                <div style={{ fontSize: '0.75rem', color: C.textSecond, background: 'rgba(255,255,255,0.04)', padding: '0.3rem 0.75rem', borderRadius: '8px', border: `1px solid ${C.cardBorder}` }}>
                  Updated 2m ago
                </div>
              </div>

              {/* Empty state */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center', border: '2px dashed rgba(255,255,255,0.06)', borderRadius: '16px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(6,182,212,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <i className="fas fa-file-signature" style={{ fontSize: '1.75rem', color: C.accentTeal, opacity: 0.55 }} />
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: C.textPrimary, margin: '0 0 0.5rem' }}>No Appointments Found</h4>
                <p style={{ color: C.textSecond, fontSize: '0.875rem', maxWidth: '340px', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
                  New patients referred from AI Analysis will appear here. Your queue is currently clear and up to date.
                </p>
                <button style={{ background: 'transparent', color: C.accent, border: `1px solid ${C.accent}50`, padding: '0.65rem 1.75rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(16,185,129,0.08)'}
                  onMouseOut={e => e.currentTarget.style.background = 'transparent'}
                >
                  <i className="fas fa-sync-alt" /> Refresh Patient Queue
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer style={{ padding: '1.25rem 2rem', textAlign: 'center', borderTop: `1px solid ${C.cardBorder}`, color: '#475569', fontSize: '0.8rem' }}>
        © 2026 ArogyaMitra AI &nbsp;•&nbsp; Secure Doctor Portal &nbsp;•&nbsp; End-to-End Encrypted Health Records
      </footer>

      {/* ── Edit Profile Modal ── */}
      {showEditModal && (
        <EditProfileModal
          user={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleProfileSaved}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
