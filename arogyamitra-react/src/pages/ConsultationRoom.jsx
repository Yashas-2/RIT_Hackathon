import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { useAuth } from '../components/AuthProvider';

const ConsultationRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [remoteJoined, setRemoteJoined] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await apiService.getConsultationStatus(id);
        if (res.success) {
          setConsultation(res);
          // For demo purposes, we allow the room even if not paid if it's a direct link
        }
      } catch (err) {
        setError("Failed to load consultation: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
    startCamera();

    // Simulate remote user joining after 3 seconds
    const timer = setTimeout(() => {
        setRemoteJoined(true);
    }, 3000);

    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        clearTimeout(timer);
    };
  }, [id]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
      // Fallback but don't block the UI
    }
  };

  useEffect(() => {
    if (stream) {
      stream.getVideoTracks().forEach(track => (track.enabled = videoOn));
      stream.getAudioTracks().forEach(track => (track.enabled = micOn));
    }
  }, [videoOn, micOn, stream]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0a0e27', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
      <div style={{ width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #06b6d4', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#0a0e27', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', flexDirection: 'column', gap: '1.5rem', padding: '2rem', textAlign: 'center' }}>
      <i className="fas fa-exclamation-triangle" style={{ fontSize: '3rem' }} />
      <h3>{error}</h3>
      <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer' }}>Go Back</button>
    </div>
  );

  const isDoctor = user?.user_type === 'doctor';

  return (
    <div style={{ minHeight: '100vh', background: '#020617', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header style={{ padding: '0.75rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'linear-gradient(135deg,#06b6d4,#10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(6,182,212,0.3)' }}>
            <i className="fas fa-video" style={{ color: '#fff', fontSize: '0.9rem' }} />
          </div>
          <div>
            <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.95rem' }}>Secure Live Consultation</div>
            <div style={{ color: '#64748b', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                Encrypted • {isDoctor ? `Patient: ${consultation?.patient_name}` : `Doctor: ${consultation?.doctor_name}`}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>
                <i className="fas fa-clock me-2" />14:52
            </div>
            <button onClick={() => navigate(-1)} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '0.5rem 1.2rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}>
                End Call
            </button>
        </div>
      </header>

      {/* Main Video Area */}
      <main style={{ flex: 1, padding: '1.5rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
        {/* Remote Video */}
        <div style={{ background: '#0f172a', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
          {!remoteJoined ? (
            <div style={{ textAlign: 'center', zIndex: 1 }}>
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2.5rem', color: '#475569', animation: 'pulse 2s infinite' }}>
                <i className="fas fa-user" />
              </div>
              <p style={{ color: '#94a3b8', fontWeight: 500 }}>Waiting for host to join...</p>
              <p style={{ color: '#475569', fontSize: '0.8rem', marginTop: '0.5rem' }}>Establishing secure connection...</p>
            </div>
          ) : (
            <video 
                autoPlay 
                muted 
                loop 
                playsInline
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                src={isDoctor 
                    ? "https://assets.mixkit.co/videos/preview/mixkit-young-woman-working-on-a-laptop-42934-large.mp4" 
                    : "https://assets.mixkit.co/videos/preview/mixkit-doctor-working-on-his-office-42407-large.mp4"
                }
            />
          )}
          <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)', padding: '0.5rem 1.2rem', borderRadius: '14px', color: '#f8fafc', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: remoteJoined ? '#10b981' : '#f59e0b' }} />
            {isDoctor ? consultation?.patient_name : consultation?.doctor_name}
          </div>
        </div>

        {/* Local Video */}
        <div style={{ background: '#0f172a', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
          <video 
            ref={localVideoRef}
            autoPlay 
            muted 
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: videoOn ? 1 : 0, transition: 'opacity 0.3s' }}
          />
          {!videoOn && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2.5rem', color: '#475569' }}>
                  <i className="fas fa-video-slash" />
                </div>
                <p style={{ color: '#94a3b8', fontWeight: 500 }}>Your camera is off</p>
              </div>
            </div>
          )}
          <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(8px)', padding: '0.5rem 1.2rem', borderRadius: '14px', color: '#f8fafc', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            You {micOn ? <i className="fas fa-microphone" style={{ color: '#10b981', fontSize: '0.8rem' }} /> : <i className="fas fa-microphone-slash" style={{ color: '#ef4444', fontSize: '0.8rem' }} />}
          </div>
        </div>
      </main>

      {/* Control Bar */}
      <div style={{ padding: '1.5rem 2rem 2.5rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', background: 'transparent', zIndex: 10 }}>
        <div style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(20px)', padding: '0.75rem 1.5rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '1.25rem', boxShadow: '0 10px 40px rgba(0,0,0,0.4)' }}>
            <button 
                onClick={() => setMicOn(!micOn)}
                title={micOn ? "Mute Microphone" : "Unmute Microphone"}
                style={{ width: 52, height: 52, borderRadius: '16px', border: 'none', background: micOn ? 'rgba(255,255,255,0.05)' : '#ef4444', color: micOn ? '#f8fafc' : '#fff', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', border: micOn ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
            >
                <i className={micOn ? "fas fa-microphone" : "fas fa-microphone-slash"} />
            </button>
            <button 
                onClick={() => setVideoOn(!videoOn)}
                title={videoOn ? "Stop Video" : "Start Video"}
                style={{ width: 52, height: 52, borderRadius: '16px', border: 'none', background: videoOn ? 'rgba(255,255,255,0.05)' : '#ef4444', color: videoOn ? '#f8fafc' : '#fff', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', border: videoOn ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
            >
                <i className={videoOn ? "fas fa-video" : "fas fa-video-slash"} />
            </button>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0.5rem 0' }} />
            <button 
                onClick={() => navigate(-1)}
                title="End Call"
                style={{ width: 52, height: 52, borderRadius: '16px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(239,68,68,0.3)', transition: 'all 0.2s' }}
            >
                <i className="fas fa-phone-slash" style={{ transform: 'rotate(0deg)' }} />
            </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
      `}</style>
    </div>
  );
};

export default ConsultationRoom;
