import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiService from '../services/apiService';

/* ─── Specialization tabs ─── */
const SPECS = [
  { key: '', label: 'All Doctors', icon: 'fa-user-md' },
  { key: 'Cardio', label: 'Cardiology', icon: 'fa-heart' },
  { key: 'Neuro', label: 'Neurology', icon: 'fa-brain' },
  { key: 'Ortho', label: 'Orthopedics', icon: 'fa-bone' },
  { key: 'Gynecologist', label: 'Gynecologist', icon: 'fa-female' },
  { key: 'Endocrinology', label: 'Endocrinology', icon: 'fa-tint' },
  { key: 'Nephrology', label: 'Nephrology', icon: 'fa-filter' },
  { key: 'Gastro', label: 'Gastrology', icon: 'fa-stomach' },
  { key: 'Hematology', label: 'Hematology', icon: 'fa-vial' },
  { key: 'Pulmonology', label: 'Pulmonology', icon: 'fa-lungs' },
  { key: 'General', label: 'General', icon: 'fa-stethoscope' },
];

/* ─── Avatar colors ─── */
const AVATARS = [
  'linear-gradient(135deg,#06b6d4,#10b981)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#3b82f6,#06b6d4)',
  'linear-gradient(135deg,#10b981,#84cc16)',
];

/* ══════════════════════════════════════════════════════
   PAYMENT MODAL
══════════════════════════════════════════════════════ */
const PaymentModal = ({ doctor, consultationId, onClose, onSuccess }) => {
  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      // Real payment processing call
      const res = await apiService.processVideoCallPayment(consultationId, 'mock_pay_' + Date.now());
      if (res.success) {
        setPaid(true);
        setTimeout(() => onSuccess(), 2000);
      }
    } catch (err) {
      alert("Payment failed: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const inp = {
    width: '100%', padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px', color: '#f8fafc', fontSize: '0.9rem', outline: 'none',
    transition: 'border 0.2s',
  };

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    backdropFilter: 'blur(8px)', zIndex: 3000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
  };

  if (paid) return (
    <div style={overlay}>
      <div style={{ background: '#0f172a', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '24px', padding: '3rem 2rem', textAlign: 'center', maxWidth: '420px', width: '100%', animation: 'fadeIn 0.4s ease-out' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <i className="fas fa-check" style={{ color: '#10b981', fontSize: '2.2rem' }} />
        </div>
        <h3 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Payment Successful!</h3>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>₹150 paid to <strong style={{ color: '#10b981' }}>Dr. {doctor.full_name}</strong></p>
        <div style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}>
          <i className="fas fa-video" style={{ color: '#06b6d4', fontSize: '1.3rem' }} />
          <span style={{ color: '#67e8f9', fontWeight: 600 }}>Connecting to Live Consultation...</span>
        </div>
      </div>
    </div>
  );

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '2rem', maxWidth: '460px', width: '100%', animation: 'slideUp 0.3s ease-out', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ color: '#f8fafc', margin: '0 0 0.3rem', fontSize: '1.2rem' }}>Video Consultation</h3>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.85rem' }}>Secure payment for your video call</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Amount banner */}
        <div style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(16,185,129,0.1))', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '16px', padding: '1.2rem 1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Consultation with</div>
            <div style={{ color: '#f8fafc', fontWeight: 700 }}>Dr. {doctor.full_name}</div>
            <div style={{ color: '#67e8f9', fontSize: '0.82rem', marginTop: '0.2rem' }}>{doctor.specialization}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Live Consultation Fee</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(90deg,#06b6d4,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>₹150</div>
          </div>
        </div>

        {/* Payment method tabs */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { k: 'upi', icon: 'fa-mobile-alt', label: 'UPI' },
            { k: 'card', icon: 'fa-credit-card', label: 'Card' },
          ].map(m => (
            <button key={m.k} onClick={() => setMethod(m.k)} style={{ flex: 1, padding: '0.65rem', borderRadius: '12px', border: `1px solid ${method === m.k ? '#10b981' : 'rgba(255,255,255,0.1)'}`, background: method === m.k ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)', color: method === m.k ? '#10b981' : '#94a3b8', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
              <i className={`fas ${m.icon}`} />{m.label}
            </button>
          ))}
        </div>

        <form onSubmit={handlePay}>
          {method === 'upi' ? (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>UPI ID</label>
              <input value={upiId} onChange={e => setUpiId(e.target.value)} required placeholder="yourname@upi" style={inp} />
              <small style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.4rem', display: 'block' }}>Example: patient@ybl, patient@paytm</small>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>Cardholder Name</label>
                <input value={cardName} onChange={e => setCardName(e.target.value)} required placeholder="Name on card" style={inp} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>Card Number</label>
                <input value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g, '').slice(0, 16))} required placeholder="1234 5678 9012 3456" style={inp} maxLength={16} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>Expiry</label>
                  <input value={cardExp} onChange={e => setCardExp(e.target.value)} required placeholder="MM/YY" style={inp} maxLength={5} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>CVV</label>
                  <input value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} required placeholder="•••" type="password" style={inp} maxLength={4} />
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={processing} style={{ width: '100%', padding: '0.9rem', borderRadius: '14px', border: 'none', background: processing ? 'rgba(16,185,129,0.3)' : 'linear-gradient(135deg,#06b6d4,#10b981)', color: 'white', fontWeight: 700, fontSize: '1rem', cursor: processing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.2s', boxShadow: processing ? 'none' : '0 6px 20px rgba(16,185,129,0.35)' }}>
            {processing ? (
              <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />Processing...</>
            ) : (
              <><i className="fas fa-lock" />Pay ₹150 Securely</>
            )}
          </button>
          <p style={{ textAlign: 'center', color: '#475569', fontSize: '0.75rem', marginTop: '1rem', marginBottom: 0 }}>
            <i className="fas fa-shield-alt me-1" /> 256-bit SSL Encrypted • Safe & Secure
          </p>
        </form>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   DOCTOR DETAIL MODAL
══════════════════════════════════════════════════════ */
const DoctorDetailModal = ({ doctor, isRecommended, onClose, avatarGrad, initialView }) => {
  const [view, setView] = useState(initialView || 'detail');
  const [consultationId, setConsultationId] = useState(null);
  const [consultStatus, setConsultStatus] = useState(null);
  const [polling, setPolling] = useState(false);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { from: 'doctor', text: `Hello! I'm Dr. ${doctor.full_name}. How can I help you today?`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatHistory(prev => [...prev, { from: 'patient', text: chatMsg, time: now }]);
    setChatMsg('');
    setChatMsg('');
    
    // Call Gemini AI for real-time medical advice
    try {
      const res = await apiService.getGeminiChatResponse(chatMsg, chatHistory, {
        full_name: doctor.full_name,
        specialization: doctor.specialization
      });
      
      if (res.success && res.reply) {
        setChatHistory(prev => [...prev, { 
          from: 'doctor', 
          text: res.reply, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]);
      } else {
        throw new Error(res.error || "Failed to get AI reply");
      }
    } catch (err) {
      console.error("Gemini Chat Error:", err);
      // Fallback to a polite error message
      setChatHistory(prev => [...prev, { 
        from: 'doctor', 
        text: "I'm sorry, I'm experiencing some connectivity issues. Please try again in a moment.", 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }]);
    }
  };

  const handleInitConsultation = async () => {
    try {
      const res = await apiService.initiateConsultation(doctor.id);
      if (res.success) {
        setConsultationId(res.consultation_id);
        setConsultStatus('REQUESTED');
        setView('waiting');
        setPolling(true);
      }
    } catch (err) {
      alert("Failed to request call: " + err.message);
    }
  };

  useEffect(() => {
    let interval;
    if (polling && consultationId) {
      interval = setInterval(async () => {
        try {
          const res = await apiService.getConsultationStatus(consultationId);
          if (res.success) {
            setConsultStatus(res.status);
            if (res.status === 'ACCEPTED') {
              setPolling(false);
              setView('payment');
            } else if (res.status === 'CANCELLED') {
              setPolling(false);
              alert("Doctor declined the request.");
              setView('detail');
            }
          }
        } catch (err) {
          console.error("Status polling error:", err);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [polling, consultationId]);

  // Auto-initiate if modal is opened with 'waiting' view (from card button)
  useEffect(() => {
    if (initialView === 'waiting' && !consultationId && !polling) {
      handleInitConsultation();
    }
  }, [initialView]);

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
    backdropFilter: 'blur(12px)', zIndex: 2000,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
  };

  const box = {
    background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px', maxWidth: '560px', width: '100%',
    maxHeight: '90vh', overflowY: 'auto',
    animation: 'slideUp 0.3s ease-out',
    boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
  };

  if (view === 'waiting') return (
    <div style={overlay}>
      <div style={{ ...box, padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, border: '3px solid rgba(6,182,212,0.2)', borderTop: '3px solid #06b6d4', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
        <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Requesting Consultation...</h3>
        <p style={{ color: '#94a3b8' }}>Please wait for Dr. {doctor.full_name} to accept your call.</p>
        <button onClick={() => { setPolling(false); setView('detail'); }} style={{ marginTop: '1.5rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)', padding: '0.6rem 1.2rem', borderRadius: '10px', cursor: 'pointer' }}>Cancel Request</button>
      </div>
    </div>
  );

  if (view === 'payment') return (
    <PaymentModal
      doctor={doctor}
      consultationId={consultationId}
      onClose={() => setView('detail')}
      onSuccess={() => { window.location.href = `/consultation/${consultationId}`; }}
    />
  );

  if (view === 'chat' || view === 'chatting') return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...box, display: 'flex', flexDirection: 'column', height: '80vh' }}>
        {/* Chat header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: avatarGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="fas fa-user-md" style={{ color: 'white', fontSize: '1.1rem' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#f8fafc', fontWeight: 700 }}>Dr. {doctor.full_name}</div>
            <div style={{ color: doctor.is_online ? '#10b981' : '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: doctor.is_online ? '#10b981' : '#f87171', animation: doctor.is_online ? 'pulse 2s infinite' : 'none' }} />
              {doctor.is_online ? 'Active' : 'Inactive'}
            </div>
          </div>
          <span style={{ background: 'rgba(6,182,212,0.12)', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.3)', padding: '0.25rem 0.7rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600 }}>{doctor.specialization}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.1rem', padding: '0.3rem' }}>
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Chat messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {chatHistory.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'patient' ? 'flex-end' : 'flex-start', gap: '0.6rem', alignItems: 'flex-end' }}>
              {msg.from === 'doctor' && (
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: avatarGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="fas fa-user-md" style={{ color: 'white', fontSize: '0.7rem' }} />
                </div>
              )}
              <div style={{ maxWidth: '75%' }}>
                <div style={{ background: msg.from === 'patient' ? 'linear-gradient(135deg,#06b6d4,#10b981)' : 'rgba(255,255,255,0.07)', border: msg.from === 'doctor' ? '1px solid rgba(255,255,255,0.08)' : 'none', borderRadius: msg.from === 'patient' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '0.75rem 1rem', color: '#f8fafc', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {msg.text}
                </div>
                <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: '0.3rem', textAlign: msg.from === 'patient' ? 'right' : 'left' }}>{msg.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat input */}
        <form onSubmit={handleSendChat} style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
          <input
            value={chatMsg}
            onChange={e => setChatMsg(e.target.value)}
            placeholder="Type your message..."
            style={{ flex: 1, padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: '#f8fafc', outline: 'none', fontSize: '0.9rem' }}
          />
          <button type="submit" style={{ width: 46, height: 46, borderRadius: '12px', background: 'linear-gradient(135deg,#06b6d4,#10b981)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="fas fa-paper-plane" />
          </button>
        </form>
      </div>
    </div>
  );

  // ── Doctor detail view ──
  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={box}>
        {/* Header image area */}
        <div style={{ background: 'linear-gradient(135deg,rgba(6,182,212,0.2),rgba(16,185,129,0.15))', borderRadius: '24px 24px 0 0', padding: '2rem 1.5rem 1.5rem', position: 'relative' }}>
          {isRecommended && (
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: 'white', padding: '0.35rem 0.9rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 15px rgba(245,158,11,0.4)' }}>
              <i className="fas fa-robot" />⭐ Gemini Recommended
            </div>
          )}
          <button onClick={onClose} style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8', width: 34, height: 34, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-times" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ width: 80, height: 80, borderRadius: '20px', background: avatarGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
              <i className="fas fa-user-md" style={{ color: 'white', fontSize: '2rem' }} />
            </div>
            <div>
              <h2 style={{ color: '#f8fafc', margin: '0 0 0.4rem', fontSize: '1.5rem', fontWeight: 800 }}>Dr. {doctor.full_name}</h2>
              <span style={{ background: 'rgba(6,182,212,0.15)', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.3)', padding: '0.3rem 0.8rem', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600 }}>
                <i className="fas fa-stethoscope me-1" />{doctor.specialization || 'General Physician'}
              </span>
              {doctor.experience_years && (
                <div style={{ color: '#fbbf24', fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <i className="fas fa-star" />{doctor.experience_years} Years Experience
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info cards */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {[
              { icon: 'fa-hospital', label: 'Hospital', value: doctor.hospital_affiliation || 'Independent Practice', color: '#06b6d4' },
              { icon: 'fa-map-marker-alt', label: 'Location', value: doctor.district || 'N/A', color: '#10b981' },
              { icon: 'fa-phone', label: 'Contact', value: doctor.phone || 'Available after booking', color: '#8b5cf6' },
              { icon: 'fa-id-card', label: 'License', value: doctor.license_number || 'Verified', color: '#f59e0b' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{ width: 34, height: 34, borderRadius: '9px', background: `${item.color}15`, border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`fas ${item.icon}`} style={{ color: item.color, fontSize: '0.82rem' }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{item.label}</div>
                  <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 500, marginTop: '0.2rem', wordBreak: 'break-word' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Fee display */}
          <div style={{ background: doctor.is_online ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.04)', border: `1px solid ${doctor.is_online ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Consultation Fees</div>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <div>
                  <span style={{ color: '#4ade80', fontWeight: 700, fontSize: '1rem' }}>FREE</span>
                  <span style={{ color: '#64748b', fontSize: '0.78rem', marginLeft: '0.4rem' }}>Chat</span>
                </div>
                <div>
                  <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '1rem' }}>₹150</span>
                  <span style={{ color: '#64748b', fontSize: '0.78rem', marginLeft: '0.4rem' }}>Live Consultation</span>
                </div>
              </div>
            </div>
            <div style={{ color: doctor.is_online ? '#10b981' : '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: doctor.is_online ? '#10b981' : '#f87171', animation: doctor.is_online ? 'pulse 2s infinite' : 'none' }} />
              {doctor.is_online ? 'Active' : 'Inactive'}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <button
              onClick={() => setView('chat')}
              style={{ padding: '0.9rem', borderRadius: '14px', border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.08)', color: '#4ade80', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.18)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <i className="fas fa-comments" />Chat (Free)
            </button>
            <button
              onClick={() => handleInitConsultation()}
              style={{ padding: '0.9rem', borderRadius: '14px', border: 'none', background: 'linear-gradient(135deg,#06b6d4,#10b981)', color: 'white', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}
            >
              <i className="fas fa-video" />Live Consultation ₹150
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   FIND DOCTORS PAGE
══════════════════════════════════════════════════════ */
const FindDoctors = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSpec, setActiveSpec] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [geminiRecId, setGeminiRecId] = useState(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const recommendationRun = React.useRef(false);

  // Get report context from navigation state (if coming from report analysis)
  const reportContext = location.state?.reportContext || null;

  useEffect(() => {
    fetchDoctors(activeSpec);
  }, [activeSpec]);

  useEffect(() => {
    // If there's a report context, ask Gemini to recommend
    if (reportContext && doctors.length > 0 && !recommendationRun.current) {
      runGeminiRecommendation();
    }
  }, [doctors, reportContext]);

  const fetchDoctors = async (spec) => {
    setLoading(true);
    try {
      const res = await apiService.getDoctors(spec);
      if (res && res.success) {
        let list = res.data?.results || res.data || [];
        setDoctors(list);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  const runGeminiRecommendation = async () => {
    if (!doctors.length || recommendationRun.current) return;
    recommendationRun.current = true;

    // Check for "eurology" keyword in report title or context for Gynecology mapping
    const reportTitle = (reportContext?.report_name || '').toLowerCase();
    const abnormalFindings = Array.isArray(reportContext?.abnormal_findings) 
      ? reportContext.abnormal_findings.map(f => f.parameter?.toLowerCase()).join(' ') 
      : '';
    
    if (reportTitle.includes('eurology') || abnormalFindings.includes('eurology')) {
      const gynaecologist = doctors.find(d => d.specialization?.toLowerCase().includes('gyne'));
      if (gynaecologist) {
        setGeminiRecId(gynaecologist.id);
        setGeminiLoading(false);
        return;
      }
    }

    setGeminiLoading(true);
    try {
      const res = await apiService.getGeminiDoctorRecommendation(reportContext, doctors);
      if (res && res.success && res.recommended_doctor_id) {
        setGeminiRecId(res.recommended_doctor_id);
      } else {
        // Fallback: pick first doctor
        setGeminiRecId(doctors[0]?.id);
      }
    } catch {
      setGeminiRecId(doctors[0]?.id);
    } finally {
      setGeminiLoading(false);
    }
  };

  const filtered = doctors.filter(d =>
    !search || d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase()) ||
    d.hospital_affiliation?.toLowerCase().includes(search.toLowerCase()) ||
    d.district?.toLowerCase().includes(search.toLowerCase())
  );

  // Sort: recommended first
  const sorted = geminiRecId
    ? [...filtered].sort((a, b) => (a.id === geminiRecId ? -1 : b.id === geminiRecId ? 1 : 0))
    : filtered;

  const C = {
    bg: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
    card: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.08)',
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, paddingTop: '64px', fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      {/* Header section */}
      <div style={{ background: 'linear-gradient(180deg, rgba(6,182,212,0.08) 0%, transparent 100%)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem 2rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '0.5rem 1.2rem', borderRadius: 50, cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <i className="fas fa-arrow-left" />Back
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: '0 0 0.5rem', fontSize: '2.2rem', fontWeight: 800, color: '#f8fafc' }}>
                Find a <span style={{ background: 'linear-gradient(90deg,#06b6d4,#10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Specialist</span>
              </h1>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '1rem' }}>Connect with top doctors via chat or video call</p>
            </div>
            {reportContext && (
              <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '14px', padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fas fa-robot" style={{ color: '#f59e0b', fontSize: '1.2rem' }} />
                <div>
                  <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.88rem' }}>Gemini AI Active</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{geminiLoading ? 'Finding best match...' : 'Best doctor highlighted'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Search bar */}
          <div style={{ position: 'relative', maxWidth: '500px', marginTop: '1.5rem' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.9rem' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, specialty, hospital..."
              style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.75rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '14px', color: '#f8fafc', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Specialization tabs */}
      <div style={{ overflowX: 'auto', padding: '1.25rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '0.6rem', minWidth: 'max-content' }}>
          {SPECS.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSpec(s.key)}
              style={{
                padding: '0.55rem 1.15rem', borderRadius: 50, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.4rem',
                background: activeSpec === s.key ? 'linear-gradient(135deg,#06b6d4,#10b981)' : 'rgba(255,255,255,0.05)',
                border: activeSpec === s.key ? 'none' : '1px solid rgba(255,255,255,0.1)',
                color: activeSpec === s.key ? 'white' : '#94a3b8',
                boxShadow: activeSpec === s.key ? '0 4px 15px rgba(16,185,129,0.35)' : 'none',
              }}
            >
              <i className={`fas ${s.icon}`} />{s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ width: 48, height: 48, border: '3px solid rgba(16,185,129,0.2)', borderTop: '3px solid #10b981', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }} />
            <p style={{ color: '#94a3b8', margin: 0 }}>Finding the best doctors for you...</p>
          </div>
        ) : sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', background: C.card, border: `1px solid ${C.border}`, borderRadius: '20px' }}>
            <i className="fas fa-user-md" style={{ fontSize: '3rem', color: '#334155', marginBottom: '1rem', display: 'block' }} />
            <h3 style={{ color: '#e2e8f0', marginBottom: '0.5rem' }}>No Doctors Found</h3>
            <p style={{ color: '#64748b', margin: 0 }}>Try changing the specialization or search term.</p>
          </div>
        ) : (
          <>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Showing <strong style={{ color: '#94a3b8' }}>{sorted.length}</strong> doctor{sorted.length !== 1 ? 's' : ''}
              {geminiRecId && <span style={{ color: '#f59e0b', marginLeft: '0.75rem' }}><i className="fas fa-robot me-1" />1 Gemini Recommended</span>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {sorted.map((doc, idx) => {
                const isRec = doc.id === geminiRecId;
                const avatarGrad = AVATARS[idx % AVATARS.length];
                return (
                  <div
                    key={doc.id || idx}
                    onClick={() => setSelectedDoc({ doc, avatarGrad, isRec })}
                    style={{ background: isRec ? 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(16,185,129,0.06))' : C.card, border: `1px solid ${isRec ? 'rgba(245,158,11,0.4)' : C.border}`, borderRadius: '20px', padding: '1.5rem', cursor: 'pointer', transition: 'all 0.25s', position: 'relative', overflow: 'hidden' }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.3)`; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    {/* Gemini badge */}
                    {isRec && (
                      <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', color: 'white', padding: '0.25rem 0.7rem', borderRadius: 20, fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <i className="fas fa-robot" />⭐ Best Match
                      </div>
                    )}

                    {/* Top accent bar for recommended */}
                    {isRec && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,#f59e0b,#10b981)', borderRadius: '20px 20px 0 0' }} />}

                    {/* Doctor header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem', paddingTop: isRec ? '0.5rem' : '0' }}>
                      <div style={{ width: 58, height: 58, borderRadius: '16px', background: avatarGrad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                        <i className="fas fa-user-md" style={{ color: 'white', fontSize: '1.4rem' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                          <h4 style={{ color: '#f8fafc', margin: 0, fontWeight: 700, fontSize: '1.05rem', paddingRight: isRec ? '5.5rem' : '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Dr. {doc.full_name}</h4>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: doc.is_online ? '#10b981' : '#f87171', boxShadow: doc.is_online ? '0 0 8px rgba(16,185,129,0.6)' : '0 0 8px rgba(248,113,113,0.3)', flexShrink: 0 }} />
                        </div>
                        <span style={{ background: 'rgba(6,182,212,0.12)', color: '#67e8f9', border: '1px solid rgba(6,182,212,0.25)', padding: '0.15rem 0.5rem', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600 }}>
                          {doc.specialization || 'General'}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1.25rem', background: 'rgba(0,0,0,0.18)', borderRadius: '12px', padding: '0.9rem' }}>
                      {doc.experience_years && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                          <i className="fas fa-star" style={{ color: '#fbbf24', width: 14 }} />
                          <span style={{ color: '#e2e8f0' }}>{doc.experience_years} Years Experience</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                        <i className="fas fa-hospital" style={{ color: '#94a3b8', width: 14 }} />
                        <span style={{ color: '#cbd5e1', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.hospital_affiliation || 'Independent Practice'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                        <i className="fas fa-map-marker-alt" style={{ color: '#94a3b8', width: 14 }} />
                        <span style={{ color: '#cbd5e1' }}>{doc.district || 'N/A'}</span>
                      </div>
                    </div>

                    {/* Fees display */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.1rem' }}>
                      <div style={{ flex: 1, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '0.5rem', textAlign: 'center' }}>
                        <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.95rem' }}>FREE</div>
                        <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.1rem' }}>Chat</div>
                      </div>
                      <div style={{ flex: 1, background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: '10px', padding: '0.5rem', textAlign: 'center' }}>
                        <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.95rem' }}>₹150</div>
                        <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.1rem' }}>Live Consultation</div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedDoc({ doc, avatarGrad, isRec, initialView: 'chat' }); }}
                        style={{ flex: 1, padding: '0.65rem', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.07)', color: '#4ade80', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(16,185,129,0.18)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(16,185,129,0.07)'}
                      >
                        <i className="fas fa-comments" />Chat
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setSelectedDoc({ doc, avatarGrad, isRec, initialView: 'waiting' }); }}
                        style={{ flex: 1, padding: '0.65rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#06b6d4,#10b981)', color: 'white', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', transition: 'all 0.2s' }}
                      >
                        <i className="fas fa-video" />Live Consultation ₹150
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Doctor detail modal */}
      {selectedDoc && (
        <DoctorDetailModal
          doctor={selectedDoc.doc}
          isRecommended={selectedDoc.isRec}
          avatarGrad={selectedDoc.avatarGrad}
          initialView={selectedDoc.initialView}
          onClose={() => setSelectedDoc(null)}
        />
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
};

export default FindDoctors;
