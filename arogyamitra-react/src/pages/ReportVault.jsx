import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import apiService from '../services/apiService';

const ReportVault = () => {
  const [phone, setPhone] = useState('');
  const [otpStep, setOtpStep] = useState('phone'); // 'phone' | 'otp'
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [otpSending, setOtpSending] = useState(false);
  const [otpStatus, setOtpStatus] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [showDoctorsPanel, setShowDoctorsPanel] = useState(false);
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth();

  // Load reports on mount - ProtectedRoute handles auth redirect
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getMedicalReports();
      if (response && response.success) {
        setReports(Array.isArray(response.data) ? response.data : []);
        setIsVerified(!!response.otp_verified);
      } else {
        setError((response && response.error) || 'Failed to load reports');
      }
    } catch (err) {
      setError('Failed to load reports: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error('Logout error:', e);
    }
    navigate('/login');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setOtpStatus({ type: 'error', msg: 'Please enter your mobile number.' });
      return;
    }
    setOtpSending(true);
    setOtpStatus(null);
    try {
      const response = await apiService.requestOtp(phone.trim());
      if (response && response.success) {
        setOtpStatus({ type: 'success', msg: `OTP sent to ${phone}. Check your SMS.` });
        setOtpStep('otp');
      } else {
        setOtpStatus({ type: 'error', msg: (response && response.error) || 'Failed to send OTP.' });
      }
    } catch (err) {
      setOtpStatus({ type: 'error', msg: 'Could not send OTP: ' + err.message });
    } finally {
      setOtpSending(false);
    }
  };

  const handleRequestOtp = (e) => {
    e && e.preventDefault();
    setOtpStep('phone');
    setOtpStatus(null);
    setOtp('');
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.verifyOtp({ otp_code: otp });
      if (response && response.success) {
        setIsVerified(true);
        loadReports();
      } else {
        setOtpStatus({ type: 'error', msg: 'Invalid OTP: ' + ((response && response.error) || 'Please try again.') });
      }
    } catch (err) {
      setOtpStatus({ type: 'error', msg: 'Failed to verify OTP: ' + err.message });
    }
  };

  const handleViewReport = async (reportId) => {
    try {
      const blob = await apiService.viewReport(reportId);
      const fileUrl = URL.createObjectURL(blob);
      window.open(fileUrl, '_blank');
      setTimeout(() => URL.revokeObjectURL(fileUrl), 100);
    } catch (err) {
      alert('Failed to view report: ' + err.message);
    }
  };

  const handleAnalyzeReport = async (reportId) => {
    try {
      setAnalyzeLoading(true);
      const response = await apiService.analyzeMedicalReport({ report_id: reportId });
      if (response && response.success) {
        setAnalysisResult(response.data);
        setShowAnalysis(true);
        setReports(prev => prev.map(r =>
          r.id === reportId ? { ...r, is_analyzed: true } : r
        ));
      } else {
        alert('Failed to analyze: ' + ((response && response.error) || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to analyze: ' + err.message);
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const handleViewAnalysis = async (reportId) => {
    try {
      setAnalyzeLoading(true);
      const response = await apiService.analyzeMedicalReport({ report_id: reportId });
      if (response && response.success) {
        setAnalysisResult(response.data);
        setShowAnalysis(true);
      } else {
        alert('Failed to load analysis: ' + ((response && response.error) || 'Unknown error'));
      }
    } catch (err) {
      alert('Failed to load analysis: ' + err.message);
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const handleCloseAnalysis = () => {
    setShowAnalysis(false);
    setAnalysisResult(null);
    setShowDoctorsPanel(false);
  };

  const handleConsultDoctor = async () => {
    // Navigate to Find Doctors page with report analysis context for Gemini AI
    navigate('/find-doctors', {
      state: {
        reportContext: {
          ...analysisResult,
          report_name: reports.find(r => r.id === analysisResult.report_id)?.name || 'Health Report'
        },
      }
    });
  };

  // ─── Render: AI Analysis View ──────────────────────────────────────────────
  if (showAnalysis && analysisResult) {
    const rawFindings = Array.isArray(analysisResult.abnormal_findings)
      ? analysisResult.abnormal_findings : [];

    const recommendations = Array.isArray(analysisResult.lifestyle_recommendations)
      ? analysisResult.lifestyle_recommendations
      : analysisResult.lifestyle_recommendations
        ? [String(analysisResult.lifestyle_recommendations)] : [];

    const risk = analysisResult.risk_level || 'Low';
    const riskMap = {
      High:   { grad: 'linear-gradient(135deg,#ef444480,#b91c1c50)', accent: '#f87171', border: '#ef4444', icon: 'fa-exclamation-triangle', pct: 85 },
      Medium: { grad: 'linear-gradient(135deg,#eab30880,#b4530050)', accent: '#facc15', border: '#eab308', icon: 'fa-exclamation-circle', pct: 50 },
      Low:    { grad: 'linear-gradient(135deg,#22c55e80,#15803d50)', accent: '#4ade80', border: '#22c55e', icon: 'fa-check-circle', pct: 20 },
    };
    const rc = riskMap[risk] || riskMap.Low;

    const sevMap = (sev) => {
      const s = (sev||'').toLowerCase();
      if (s==='high'||s==='critical')   return { color:'#f87171', bg:'rgba(239,68,68,0.12)',  border:'#ef4444', label:'🔴 High' };
      if (s==='medium'||s==='moderate') return { color:'#facc15', bg:'rgba(234,179,8,0.12)',  border:'#eab308', label:'🟡 Moderate' };
      return                                   { color:'#4ade80', bg:'rgba(34,197,94,0.12)',  border:'#22c55e', label:'🟢 Normal' };
    };

    const recIcons = ['🥗','🏃','💧','🛌','🧘','🍎','💊','🩺','🚶','🌿'];

    return (
      <div style={{ paddingTop: '6rem', paddingBottom: '4rem', minHeight: '100vh' }}>
        <div className="container">

          {/* Back button */}
          <button onClick={handleCloseAnalysis} style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', marginBottom:'1.5rem', padding:'0.6rem 1.4rem', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:50, color:'#94a3b8', cursor:'pointer', fontSize:'0.9rem', transition:'all 0.2s', backdropFilter:'blur(10px)' }}>
            <i className="fas fa-arrow-left"></i> Back to Reports
          </button>

          {/* ── Risk Banner ── */}
          <div style={{ background: rc.grad, border:`1px solid ${rc.border}40`, borderRadius:24, padding:'2rem 2.5rem', marginBottom:'1.5rem', position:'relative', overflow:'hidden' }}>
            {/* decorative glow */}
            <div style={{ position:'absolute', top:'-40px', right:'-40px', width:180, height:180, borderRadius:'50%', background:`radial-gradient(circle, ${rc.accent}30, transparent)`, pointerEvents:'none' }}></div>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem' }}>
              <div>
                <div style={{ fontSize:'0.8rem', color:'#94a3b8', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'0.3rem' }}>
                  <i className="fas fa-robot me-2"></i>AI Health Analysis
                </div>
                <h2 style={{ margin:0, fontSize:'2rem', fontWeight:800, color:'#f8fafc' }}>
                  Overall Risk: <span style={{ color: rc.accent }}>{risk}</span>
                </h2>
              </div>
              {/* Risk meter */}
              <div style={{ textAlign:'center' }}>
                <div style={{ position:'relative', width:80, height:80, margin:'0 auto' }}>
                  <svg viewBox="0 0 80 80" style={{ transform:'rotate(-90deg)', width:80, height:80 }}>
                    <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8"/>
                    <circle cx="40" cy="40" r="30" fill="none" stroke={rc.accent} strokeWidth="8"
                      strokeDasharray={`${rc.pct * 1.885} 188.5`} strokeLinecap="round"/>
                  </svg>
                  <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center' }}>
                    <i className={`fas ${rc.icon}`} style={{ color: rc.accent, fontSize:'1.4rem' }}></i>
                  </div>
                </div>
                <div style={{ fontSize:'0.75rem', color: rc.accent, fontWeight:700, marginTop:'0.3rem' }}>{risk} Risk</div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ marginTop:'1.2rem', padding:'1rem 1.2rem', background:'rgba(0,0,0,0.2)', borderRadius:12, borderLeft:`3px solid ${rc.accent}` }}>
              <p style={{ margin:0, color:'#e2e8f0', lineHeight:1.7, fontSize:'0.95rem' }}>
                <strong style={{ color: rc.accent }}>Summary: </strong>
                {analysisResult.patient_summary || 'No summary available.'}
              </p>
            </div>
          </div>

          {/* ── Abnormal Findings ── */}
          {rawFindings.length > 0 && (
            <div style={{ marginBottom:'1.5rem' }}>
              <h4 style={{ color:'#f8fafc', marginBottom:'1.2rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <span style={{ background:'rgba(239,68,68,0.15)', border:'1px solid #ef4444', borderRadius:8, padding:'0.4rem 0.8rem', fontSize:'0.95rem', color:'#f87171' }}>
                  <i className="fas fa-microscope me-2"></i>{rawFindings.length} Abnormal Finding{rawFindings.length > 1 ? 's' : ''}
                </span>
              </h4>
              <div className="row g-4">
                {rawFindings.map((item, idx) => {
                  const isObj = item && typeof item === 'object';
                  const sev = isObj ? sevMap(item.severity) : sevMap('low');
                  return (
                    <div key={idx} className="col-md-6 col-lg-4">
                      <div style={{ background:'rgba(15,23,42,0.6)', border:`1px solid ${sev.border}40`, borderRadius:16, padding:'1.5rem', height:'100%', transition:'transform 0.2s', position:'relative', overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.2)' }}>
                        {/* top accent line */}
                        <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:`linear-gradient(90deg, ${sev.color}, transparent)`, borderRadius:'16px 16px 0 0' }}></div>

                        {isObj ? (
                          <>
                            {/* Parameter + severity */}
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
                              <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                                <div style={{ fontSize:'0.75rem', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.3rem' }}>Parameter</div>
                                <strong style={{ color:'#f8fafc', fontSize:'1.1rem', wordBreak: 'break-word' }}>{item.parameter}</strong>
                              </div>
                              <span style={{ background: sev.bg, color: sev.color, border:`1px solid ${sev.border}`, padding:'0.25rem 0.6rem', borderRadius:50, fontSize:'0.75rem', fontWeight:700, whiteSpace:'nowrap' }}>
                                {sev.label}
                              </span>
                            </div>

                            {/* Value vs Normal visual */}
                            <div style={{ background:'rgba(0,0,0,0.3)', borderRadius:12, padding:'1rem', marginBottom:'1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ display:'flex', flexDirection:'column', gap:'0.4rem', fontSize:'0.85rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color:'#94a3b8' }}>Your value:</span>
                                    <strong style={{ color: sev.color }}>{item.value}</strong>
                                </div>
                                {item.normal_range && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ color:'#94a3b8' }}>Normal:</span>
                                        <span style={{ color:'#4ade80' }}>{item.normal_range}</span>
                                    </div>
                                )}
                              </div>
                              
                              {/* Simple status bar */}
                              <div style={{ height:6, background:'rgba(255,255,255,0.05)', borderRadius:10, overflow:'hidden', marginTop: '0.8rem' }}>
                                <div style={{ height:'100%', width: sev.label.includes('High') ? '90%' : sev.label.includes('Moderate') ? '60%' : '30%', background:`linear-gradient(90deg, ${sev.color}80, ${sev.color})`, borderRadius:10, transition:'width 1s ease' }}></div>
                              </div>
                            </div>

                            {/* Explanation */}
                            {item.simple_explanation && (
                              <div style={{ background: 'rgba(56, 189, 248, 0.05)', padding: '0.8rem', borderRadius: '10px', borderLeft: '3px solid #38bdf8' }}>
                                <p style={{ margin:0, color:'#cbd5e1', fontSize:'0.85rem', lineHeight:1.5 }}>
                                  <i className="fas fa-info-circle me-2" style={{ color:'#38bdf8' }}></i>
                                  {item.simple_explanation}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <p style={{ margin:0, color:'#94a3b8' }}>{String(item)}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Recommendations ── */}
          {recommendations.length > 0 && (
            <div style={{ marginBottom:'2.5rem' }}>
              <h4 style={{ color:'#f8fafc', marginBottom:'1.2rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                <span style={{ background:'rgba(34,197,94,0.12)', border:'1px solid #22c55e', borderRadius:8, padding:'0.4rem 0.8rem', fontSize:'0.95rem', color:'#4ade80' }}>
                  <i className="fas fa-leaf me-2"></i>Lifestyle Recommendations
                </span>
              </h4>
              <div className="row g-3">
                {recommendations.map((item, idx) => (
                  <div key={idx} className="col-md-6">
                    <div style={{ background:'rgba(34,197,94,0.05)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:16, padding:'1.2rem 1.5rem', display:'flex', alignItems:'center', gap:'1rem', height:'100%', transition:'transform 0.2s', cursor:'default' }}
                         onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                         onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(34,197,94,0.3)' }}>
                        <span style={{ fontSize:'1.5rem', lineHeight:1 }}>{(recIcons && recIcons[idx % recIcons.length]) || '🔹'}</span>
                      </div>
                      <span style={{ color:'#e2e8f0', fontSize:'0.95rem', lineHeight:1.6 }}>
                        {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Next Steps ── */}
          <div style={{ background:'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(16,185,129,0.1))', border:'1px solid rgba(6,182,212,0.3)', borderRadius:20, padding:'2rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1.5rem', marginBottom: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, minWidth: '300px' }}>
              <div style={{ width:56, height:56, borderRadius:'50%', background:'linear-gradient(135deg, #06b6d4, #10b981)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>
                <i className="fas fa-stethoscope" style={{ color:'white', fontSize:'1.4rem' }}></i>
              </div>
              <div>
                <h4 style={{ color:'#fff', margin:'0 0 0.5rem', fontWeight: 700 }}>Recommended Next Steps</h4>
                <p style={{ margin:0, color:'#cbd5e1', lineHeight:1.6 }}>
                  {analysisResult.doctor_visit_suggestion || 'Consult a specialist for a detailed review of these findings.'}
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleConsultDoctor}
              className="btn" 
              style={{ background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-emerald))', padding: '0.8rem 1.8rem', fontWeight: 'bold', borderRadius: '12px', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)', transition: 'transform 0.2s', cursor: 'pointer' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <i className="fas fa-user-md"></i> Find a Doctor
            </button>
          </div>

          {/* ── Doctors Panel ── */}
          {showDoctorsPanel && (
            <div style={{ marginBottom: '2rem', animation: 'fadeIn 0.5s ease-out', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '24px', padding: '2rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h4 style={{ color:'#f8fafc', margin: 0, display:'flex', alignItems:'center', gap:'0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                    <i className="fas fa-user-md" style={{ color: '#10b981' }}></i>
                  </div>
                  Recommended Specialists
                </h4>
                <button onClick={() => setShowDoctorsPanel(false)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              {loadingDoctors ? (
                <div className="text-center" style={{ padding: '4rem 2rem' }}>
                  <div style={{ width: 40, height: 40, border: '3px solid rgba(16,185,129,0.2)', borderTop: '3px solid var(--accent-emerald)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
                  <h5 style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>Finding the right specialists...</h5>
                  <p style={{ color: '#94a3b8', margin: 0 }}>Analyzing your results to match you with top doctors.</p>
                </div>
              ) : recommendedDoctors.length > 0 ? (
                <div className="row g-4">
                  {recommendedDoctors.map((doc, idx) => (
                    <div key={idx} className="col-md-6 col-lg-4">
                      <div className="glass-card h-100" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.2rem' }}>
                          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-emerald))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
                            <i className="fas fa-user-md" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                          </div>
                          <div>
                            <h5 style={{ margin: '0 0 0.3rem', color: '#f8fafc', fontWeight: 'bold', fontSize: '1.15rem' }}>Dr. {doc.full_name}</h5>
                            <span style={{ display: 'inline-block', padding: '0.2rem 0.6rem', background: 'rgba(6,182,212,0.15)', color: '#67e8f9', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                              {doc.specialization}
                            </span>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>{doc.experience_years ? <><i className="fas fa-star me-1" style={{color: '#fbbf24'}}></i>{doc.experience_years} Years Experience</> : ''}</p>
                          </div>
                        </div>
                        
                        <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1.5rem', flex: 1, background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.6rem', alignItems: 'center' }}>
                            <i className="fas fa-hospital" style={{ color: '#64748b', width: '16px', textAlign: 'center' }}></i>
                            <span style={{ fontWeight: 500 }}>{doc.hospital_affiliation || 'Independent Practice'}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <i className="fas fa-map-marker-alt" style={{ color: '#64748b', width: '16px', textAlign: 'center' }}></i>
                            <span>{doc.district}</span>
                          </div>
                        </div>
                        
                        <a 
                          href={`tel:${doc.phone}`} 
                          className="btn btn-outline" 
                          style={{ width: '100%', padding: '0.5rem', borderColor: 'var(--accent-emerald)', color: 'var(--accent-emerald)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                        >
                          <i className="fas fa-phone-alt"></i> Contact Details
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4" style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 16 }}>
                  <i className="fas fa-search mb-3" style={{ fontSize: '2rem', color: '#64748b' }}></i>
                  <h5 style={{ color: '#e2e8f0' }}>No Specialists Found Nearby</h5>
                  <p style={{ color: '#94a3b8', margin: 0 }}>Please consult your general physician for advice on these findings.</p>
                </div>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <p style={{ textAlign:'center', marginTop:'1.5rem', fontSize:'0.78rem', color:'#475569' }}>
            <i className="fas fa-shield-alt me-1"></i>
            AI-generated summary for informational purposes only. Always consult a qualified medical professional for diagnosis and treatment.
          </p>

        </div>
      </div>
    );
  }

  // ─── Render: Loading ─────────────────────────────────────────────────────────




  // ─── Render: Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="container text-center" style={{ paddingTop: '10rem' }}>
        <div style={{ width: 48, height: 48, border: '3px solid rgba(16,185,129,0.2)', borderTop: '3px solid var(--accent-emerald)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
        <p style={{ color: '#94a3b8' }}>Loading your secure records…</p>
      </div>
    );
  }

  // ─── Render: Error ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="container" style={{ paddingTop: '6rem' }}>
        <div className="glass-card text-center" style={{ maxWidth: 480, margin: '0 auto' }}>
          <i className="fas fa-exclamation-triangle fa-2x mb-3" style={{ color: '#f87171' }}></i>
          <h3 className="text-white mb-2">Error Loading Reports</h3>
          <p style={{ color: '#94a3b8' }}>{error}</p>
          <button className="btn btn-primary mt-2" onClick={loadReports}>
            <i className="fas fa-redo me-2"></i>Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── Render: OTP Verification ─────────────────────────────────────────────────
  if (!isVerified) {
    return (
      <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
        <div className="glass-card" style={{ maxWidth: 480, margin: '0 auto' }}>
          <h2 className="mb-1 text-white" style={{ fontSize: '1.75rem' }}>
            Secure <span className="gradient-text">Report Access</span>
          </h2>
          <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
            Verify your identity to view your medical records
          </p>

          {/* Step indicator */}
          <div className="d-flex align-items-center mb-4" style={{ gap: '0.5rem' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gradient-emerald)', color: '#fff', fontWeight: 700, fontSize: '0.85rem' }}>1</div>
            <div style={{ flex: 1, height: 2, background: otpStep === 'otp' ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.1)', transition: 'background 0.4s' }} />
            <div style={{ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: otpStep === 'otp' ? 'var(--gradient-emerald)' : 'rgba(255,255,255,0.1)', color: otpStep === 'otp' ? '#fff' : '#64748b', fontWeight: 700, fontSize: '0.85rem', transition: 'all 0.4s' }}>2</div>
          </div>

          {/* Status notice */}
          {otpStatus && (
            <div style={{ background: otpStatus.type === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${otpStatus.type === 'success' ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`, borderRadius: 10, padding: '0.75rem 1rem', marginBottom: '1rem', color: otpStatus.type === 'success' ? '#4ade80' : '#f87171', fontSize: '0.9rem' }}>
              {otpStatus.type === 'success' ? '✅' : '❌'} {otpStatus.msg}
            </div>
          )}

          {otpStep === 'phone' ? (
            <form onSubmit={handleSendOtp}>
              <div className="mb-4">
                <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Mobile Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                  autoFocus
                  style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#f8fafc', fontSize: '1rem', outline: 'none' }}
                />
                <small style={{ color: '#64748b', display: 'block', marginTop: '0.4rem' }}>
                  Include country code (e.g. +91 for India)
                </small>
              </div>
              <button type="submit" className="btn btn-glow" style={{ width: '100%' }} disabled={otpSending}>
                <i className="fas fa-paper-plane me-2"></i>{otpSending ? 'Sending…' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                Enter the 6-digit OTP sent to <strong style={{ color: 'var(--accent-emerald)' }}>{phone}</strong>
              </p>
              <div className="mb-4">
                <label style={{ display: 'block', color: '#e2e8f0', marginBottom: '0.5rem', fontWeight: 500 }}>
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  maxLength="6"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  autoFocus
                  style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#f8fafc', fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center', outline: 'none' }}
                />
              </div>
              <button type="submit" className="btn btn-glow" style={{ width: '100%' }}>
                <i className="fas fa-shield-alt me-2"></i>Verify &amp; Access Reports
              </button>
              <p className="text-center mt-3 mb-0" style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                Didn't receive it?{' '}
                <a href="#resend" onClick={handleRequestOtp} style={{ color: 'var(--accent-emerald)', textDecoration: 'none' }}>
                  Change number / Resend
                </a>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ─── Render: Report List ───────────────────────────────────────────────────────
  return (
    <div className="container" style={{ paddingTop: '6rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{ background: 'var(--gradient-neon)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          My <span className="gradient-text">Medical Reports</span>
        </h1>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={loadReports} disabled={loading}>
            <i className="fas fa-sync-alt me-2"></i>Refresh
          </button>
          <button className="btn" onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', borderRadius: 12, padding: '0.6rem 1.2rem', cursor: 'pointer' }}>
            <i className="fas fa-sign-out-alt me-2"></i>Logout
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="glass-card mb-4">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center', gap: '1rem' }}>
          <div>
            <h3 className="text-white mb-0">{reports.length}</h3>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Total Reports</p>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ color: '#4ade80' }} className="mb-0">{reports.filter(r => r.is_analyzed).length}</h3>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Analyzed</p>
          </div>
          <div>
            <h3 style={{ color: '#facc15' }} className="mb-0">{reports.filter(r => !r.is_analyzed).length}</h3>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.9rem' }}>Pending</p>
          </div>
        </div>
      </div>

      {/* Analyze loading overlay hint */}
      {analyzeLoading && (
        <div className="glass-card text-center mb-4" style={{ padding: '1.5rem' }}>
          <i className="fas fa-brain me-2" style={{ color: 'var(--accent-emerald)' }}></i>
          <span style={{ color: '#94a3b8' }}>AI is analyzing your report…</span>
        </div>
      )}

      {/* ── Contact Doctor Banner ── */}
      <div style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(6,182,212,0.06))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: 52, height: 52, borderRadius: '14px', background: 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 15px rgba(16,185,129,0.35)' }}>
            <i className="fas fa-user-md" style={{ color: 'white', fontSize: '1.3rem' }} />
          </div>
          <div>
            <h4 style={{ color: '#f8fafc', margin: '0 0 0.3rem', fontWeight: 700 }}>Need to Consult a Doctor?</h4>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.88rem' }}>Connect instantly with registered specialists via chat or video call</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/find-doctors')}
          style={{ background: 'linear-gradient(135deg,#06b6d4,#10b981)', border: 'none', color: 'white', padding: '0.75rem 1.6rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 4px 15px rgba(16,185,129,0.3)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(16,185,129,0.45)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(16,185,129,0.3)'; }}
        >
          <i className="fas fa-stethoscope" />Contact Doctor
        </button>
      </div>

      {/* Empty state */}
      {reports.length === 0 ? (
        <div className="text-center" style={{ padding: '4rem 0' }}>
          <i className="fas fa-inbox fa-3x mb-3" style={{ color: 'rgba(255,255,255,0.15)' }}></i>
          <h3 className="text-white">No Reports Found</h3>
          <p style={{ color: '#64748b' }}>Reports uploaded by authorized hospital staff will appear here.</p>
        </div>
      ) : (
        <div className="row">
          {reports.map(report => (
            <div key={report.id} className="col-md-6 col-lg-4 mb-4">
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                {/* Title + badge */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h4 className="text-white mb-0" style={{ fontSize: '1rem', flex: 1, marginRight: '0.5rem' }}>
                    {report.title}
                  </h4>
                  {report.is_analyzed ? (
                    <span style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid #22c55e', color: '#4ade80', padding: '0.2rem 0.6rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      <i className="fas fa-check-circle me-1"></i>Analyzed
                    </span>
                  ) : (
                    <span style={{ background: 'rgba(234,179,8,0.12)', border: '1px solid #eab308', color: '#facc15', padding: '0.2rem 0.6rem', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      <i className="fas fa-clock me-1"></i>Pending
                    </span>
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <p className="mb-2" style={{ color: '#94a3b8' }}>
                    <i className="fas fa-file-medical me-2" style={{ color: 'var(--accent-emerald)', width: 16 }}></i>
                    {report.scan_type}
                  </p>
                  <p className="mb-2" style={{ color: '#94a3b8' }}>
                    <i className="fas fa-hospital me-2" style={{ color: 'var(--accent-emerald)', width: 16 }}></i>
                    {report.hospital_name}
                  </p>
                  <p className="mb-0" style={{ color: '#94a3b8' }}>
                    <i className="fas fa-calendar me-2" style={{ color: 'var(--accent-emerald)', width: 16 }}></i>
                    {new Date(report.uploaded_date || report.test_date).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-outline"
                    style={{ flex: 1, padding: '0.6rem' }}
                    onClick={() => handleViewReport(report.id)}
                  >
                    <i className="fas fa-eye me-1"></i>View
                  </button>
                  {report.is_analyzed ? (
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1, padding: '0.6rem', background: 'var(--gradient-teal)' }}
                      onClick={() => handleViewAnalysis(report.id)}
                      disabled={analyzeLoading}
                    >
                      <i className="fas fa-file-medical-alt me-1"></i>Results
                    </button>
                  ) : (
                    <button
                      className="btn btn-glow"
                      style={{ flex: 1, padding: '0.6rem' }}
                      onClick={() => handleAnalyzeReport(report.id)}
                      disabled={analyzeLoading}
                    >
                      <i className="fas fa-brain me-1"></i>Analyze
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportVault;