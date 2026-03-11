import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './components/AuthProvider'
import { LanguageProvider } from './components/LanguageProvider'

// Add CSS variables to root element
const rootElement = document.documentElement;
rootElement.style.setProperty('--primary-dark', '#0a0e27');
rootElement.style.setProperty('--secondary-dark', '#1a1f3a');
rootElement.style.setProperty('--accent-emerald', '#10b981');
rootElement.style.setProperty('--accent-teal', '#06b6d4');
rootElement.style.setProperty('--accent-purple', '#8b5cf6');
rootElement.style.setProperty('--text-primary', '#f8fafc');
rootElement.style.setProperty('--text-secondary', '#94a3b8');
rootElement.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.05)');
rootElement.style.setProperty('--card-border', 'rgba(255, 255, 255, 0.1)');

// Error Boundary to catch render crashes and show them instead of blank screen
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0a0e27, #1a1f3a)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.4)',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            color: '#f8fafc'
          }}>
            <h2 style={{ color: '#f87171', marginBottom: '1rem' }}>
              ⚠️ Application Error
            </h2>
            <pre style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '8px',
              padding: '1rem',
              overflowX: 'auto',
              fontSize: '0.8rem',
              color: '#fca5a5',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {this.state.error?.toString()}
            </pre>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.95rem'
              }}
            >
              Go to Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <AuthProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </AuthProvider>
  </ErrorBoundary>
)