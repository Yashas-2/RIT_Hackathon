import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import apiService from '../services/apiService';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    total_patients: '—',
    pending_requests: '—',
    completed: '—',
    avg_rating: '—',
  });

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

  const stats = [
    { label: 'Total Patients',   value: statsLoading ? '…' : String(statsData.total_patients),   icon: 'fa-users',        color: '#38bdf8', bg: 'rgba(56,189,248,0.1)'  },
    { label: 'Pending Requests', value: statsLoading ? '…' : String(statsData.pending_requests), icon: 'fa-clock',        color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
    { label: 'Completed',        value: statsLoading ? '…' : String(statsData.completed),        icon: 'fa-check-circle', color: '#34d399', bg: 'rgba(52,211,153,0.1)'  },
    { label: 'Avg. Rating',      value: statsLoading ? '…' : String(statsData.avg_rating),       icon: 'fa-star',         color: '#f472b6', bg: 'rgba(244,114,182,0.1)' },
  ];



  /* ── shared token colours matching index.css ── */
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
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #06b6d4, #10b981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(16,185,129,0.3)',
          }}>
            <i className="fas fa-heartbeat" style={{ color: '#fff', fontSize: '1rem' }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: C.textPrimary, letterSpacing: '-0.3px' }}>
              Arogya<span style={{ background: 'linear-gradient(90deg,#06b6d4,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Mitra AI</span>
            </div>
            <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
              Doctor Portal
            </div>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textSecond, fontSize: '1.05rem', padding: '0.4rem' }}>
            <i className="fas fa-bell" />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: user?.profile_photo ? `url(http://localhost:8000${user.profile_photo}) center/cover no-repeat` : 'linear-gradient(135deg,#06b6d4,#10b981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.9rem',
              boxShadow: '0 0 12px rgba(16,185,129,0.3)',
              overflow: 'hidden'
            }}>
              {!user?.profile_photo && (user?.full_name?.charAt(0) || 'D')}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: C.textPrimary }}>Dr. {user?.full_name?.split(' ')[0] || 'Doctor'}</div>
              <div style={{ fontSize: '0.7rem', color: C.textSecond }}>{user?.specialization || 'Specialist'}</div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              background: 'rgba(239,68,68,0.15)', color: '#f87171',
              border: '1px solid rgba(239,68,68,0.25)',
              padding: '0.45rem 1rem', borderRadius: '10px',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.25)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
          >
            <i className="fas fa-sign-out-alt" /> Logout
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ display: 'flex', flex: 1, paddingTop: '64px' }}>



        {/* Main content */}
        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>

          {/* Page header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: C.textPrimary, margin: '0 0 0.3rem', letterSpacing: '-0.3px' }}>
              Welcome back,{' '}
              <span style={{ background: 'linear-gradient(90deg,#2dd4bf,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Dr. {user?.full_name?.split(' ')[0] || 'Doctor'}
              </span>
            </h1>
            <p style={{ color: C.textSecond, margin: 0, fontSize: '0.95rem' }}>
              Here is what's happening with your practice today.
            </p>
          </div>

          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.75rem' }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                background: C.cardBg, border: `1px solid ${C.cardBorder}`,
                borderRadius: '18px', padding: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
                backdropFilter: 'blur(16px)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
              }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3)`; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '13px',
                  background: s.bg, border: `1px solid ${s.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
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

            {/* Doctor info card */}
            <div style={{
              background: C.cardBg, border: `1px solid ${C.cardBorder}`,
              borderRadius: '20px', padding: '1.5rem', backdropFilter: 'blur(16px)',
            }}>
              <h2 style={{ fontSize: '0.88rem', fontWeight: 700, color: C.textPrimary, marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${C.cardBorder}` }}>
                Doctor Information
              </h2>

              {user?.profile_photo && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                  <div style={{
                    width: '100px', height: '100px', borderRadius: '20px',
                    background: `url(http://localhost:8000${user.profile_photo}) center/cover no-repeat`,
                    border: `2px solid ${C.cardBorder}`,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
                  }} />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {[
                  { icon: 'fa-hospital',       label: 'Affiliation', value: user?.hospital_affiliation || 'Independent Practice' },
                  { icon: 'fa-map-marker-alt', label: 'Location',    value: user?.district || '—' },
                  { icon: 'fa-id-card',        label: 'License No.', value: user?.license_number || '—' },
                  { icon: 'fa-envelope',       label: 'Email',       value: user?.email || '—' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '9px',
                      background: 'rgba(255,255,255,0.04)', border: `1px solid ${C.cardBorder}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <i className={`fas ${item.icon}`} style={{ color: C.textSecond, fontSize: '0.82rem' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{item.label}</div>
                      <div style={{ fontSize: '0.875rem', color: '#e2e8f0', fontWeight: 500, marginTop: '0.1rem' }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button style={{
                marginTop: '1.5rem', width: '100%',
                padding: '0.65rem', borderRadius: '12px',
                border: `1px solid ${C.cardBorder}`, background: 'rgba(255,255,255,0.04)',
                color: C.textSecond, fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = C.textSecond; }}
              >
                <i className="fas fa-pencil-alt" style={{ marginRight: '0.5rem' }} />
                Edit Profile Information
              </button>
            </div>

            {/* Consultation Requests */}
            <div style={{
              background: C.cardBg, border: `1px solid ${C.cardBorder}`,
              borderRadius: '20px', padding: '1.5rem', backdropFilter: 'blur(16px)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: `1px solid ${C.cardBorder}` }}>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: C.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <i className="fas fa-calendar-alt" style={{ color: C.accentTeal }} />
                  Recent Consultation Requests
                </h2>
                <div style={{ fontSize: '0.75rem', color: C.textSecond, background: 'rgba(255,255,255,0.04)', padding: '0.3rem 0.75rem', borderRadius: '8px', border: `1px solid ${C.cardBorder}` }}>
                  Updated 2m ago
                </div>
              </div>

              {/* Empty state */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '4rem 2rem', textAlign: 'center',
                border: '2px dashed rgba(255,255,255,0.06)', borderRadius: '16px',
              }}>
                <div style={{
                  width: '70px', height: '70px', borderRadius: '50%',
                  background: 'rgba(6,182,212,0.07)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem',
                }}>
                  <i className="fas fa-file-signature" style={{ fontSize: '1.75rem', color: C.accentTeal, opacity: 0.55 }} />
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: C.textPrimary, margin: '0 0 0.5rem' }}>
                  No Appointments Found
                </h4>
                <p style={{ color: C.textSecond, fontSize: '0.875rem', maxWidth: '340px', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
                  New patients referred from AI Analysis will appear here. Your queue is currently clear and up to date.
                </p>
                <button style={{
                  background: 'transparent', color: C.accent,
                  border: `1px solid ${C.accent}50`,
                  padding: '0.65rem 1.75rem', borderRadius: '12px',
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s',
                }}
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
      <footer style={{
        padding: '1.25rem 2rem', textAlign: 'center',
        borderTop: `1px solid ${C.cardBorder}`,
        color: '#475569', fontSize: '0.8rem',
      }}>
        © 2026 ArogyaMitra AI &nbsp;•&nbsp; Secure Doctor Portal &nbsp;•&nbsp; End-to-End Encrypted Health Records
      </footer>
    </div>
  );
};

export default DoctorDashboard;
