import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#070B14',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: "'Outfit', sans-serif"
        }}>
          <div style={{
            background: '#0F172A',
            border: '2px solid #F43F5E',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '650px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🚨</div>
            <h2 style={{ color: '#F43F5E', fontSize: '20px', fontWeight: '900', marginBottom: '8px' }}>
              OmniBuild OS™ — Runtime Safety Guard
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '13px', marginBottom: '16px' }}>
              An unexpected render error occurred. Click below to reset state and recover the application:
            </p>
            <div style={{
              background: '#030712',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '12px',
              color: '#FDA4AF',
              fontSize: '12px',
              fontFamily: "'JetBrains Mono', monospace",
              textAlign: 'left',
              overflowX: 'auto',
              maxHeight: '160px',
              marginBottom: '20px'
            }}>
              {this.state.error && this.state.error.toString()}
            </div>
            <button
              onClick={this.handleReset}
              style={{
                background: 'linear-gradient(135deg, #D4AF37, #F59E0B)',
                color: '#000000',
                fontWeight: '900',
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              🔄 1-Click Reload & Reset State
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
