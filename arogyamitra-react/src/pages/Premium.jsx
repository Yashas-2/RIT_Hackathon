import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';

const Premium = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e27', color: '#fff', paddingTop: '8rem', paddingBottom: '4rem', position: 'relative', overflow: 'hidden' }}>
      {/* Background Glow */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' }}></div>

      <div className="container" style={{ maxWidth: '1000px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', padding: '0.5rem 1.25rem', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 700, marginBottom: '2rem', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
            <i className="fas fa-crown"></i> PRO FEATURE
          </div>
          
          <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '1.5rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {t('unlockPower')}
          </h1>
          
          <p style={{ fontSize: '1.5rem', color: '#94a3b8', maxWidth: '800px', margin: '0 auto 3rem' }}>
            {t('premiumFeatures')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '6rem', fontWeight: 900, background: 'linear-gradient(135deg, #06b6d4, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              ₹49<span style={{ fontSize: '2rem', color: '#64748b', WebkitTextFillColor: '#64748b' }}>/month</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#10b981', fontWeight: 600, fontSize: '1.125rem' }}>
              <i className="fas fa-fire"></i> {t('revenueText')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '5rem' }}>
          <Link to="/payment" className="btn btn-glow" style={{ padding: '1.5rem 4rem', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
            <i className="fas fa-crown"></i> {t('upgradeToPremium')}
          </Link>
        </div>

        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {[
            { title: 'Unlimited Uploads', desc: 'Securely store all your medical records without any storage limits.', icon: 'fa-cloud-upload-alt', color: '#06b6d4' },
            { title: 'Unlimited AI Analysis', desc: 'Get instant AI analysis for every medical report including MRI, CT, and Blood tests.', icon: 'fa-magic', color: '#10b981' },
            { title: 'Priority Support', desc: 'Get your medical report doubts answered by our priority AI doctor agents.', icon: 'fa-headset', color: '#8b5cf6' },
            { title: 'Ad-Free Experience', desc: 'Focus on your health without any interruptions or distracting advertisements.', icon: 'fa-ban', color: '#f43f5e' }
          ].map((feat, i) => (
            <div key={i} className="glass-card" style={{ padding: '2.5rem', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: `${feat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: feat.color, fontSize: '1.5rem', marginBottom: '1.5rem', border: `1px solid ${feat.color}20` }}>
                <i className={`fas ${feat.icon}`}></i>
              </div>
              <h3 style={{ marginBottom: '1rem' }}>{feat.title}</h3>
              <p style={{ color: '#94a3b8' }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Premium;