import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import './ErrorPage.css';
const styles = {
  errorPage: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    color: '#f3f4f6',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    padding: '1rem'
  },
  errorContainer: {
    maxWidth: '600px',
    width: '100%',
    backgroundColor: 'rgb(20,20,20)',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    textAlign: 'center'
  },
  errorIcon: {
    color: '#ef4444',
    marginBottom: '1.5rem',
    animation: 'pulse 2s infinite'
  },
  errorCode: {
    fontSize: '2.5rem',
    fontWeight: 700,
    margin: '0 0 1rem 0',
    background: 'linear-gradient(45deg, #ef4444, #f87171)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  errorMessage: {
    fontSize: '1.125rem',
    color: '#9ca3af',
    marginBottom: '2rem',
    lineHeight: 1.5
  },
  errorStack: {
    backgroundColor: 'rgb(30,30,30)',
    borderRadius: '0.5rem',
    padding: '1rem',
    margin: '1.5rem 0',
    textAlign: 'left',
    cursor: 'pointer'
  },
  errorStackSummary: {
    color: '#d1d5db',
    fontWeight: 500,
    marginBottom: '0.5rem'
  },
  errorStackPre: {
    color: '#9ca3af',
    fontSize: '0.875rem',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
    margin: 0,
    padding: '0.5rem 0'
  },
  errorActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '2rem'
  },
  errorButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: 'rgb(30,30,30)',
    color: '#f3f4f6',
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

const keyframes = `
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.8;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

export default function ErrorPage() {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('code') || '500';
  const errorMessage = searchParams.get('message') || 'An unexpected error occurred';
  const errorStack = searchParams.get('stack');

  const handleRefresh = () => {
    window.location.href = '/';
  };

  const handleGoBack = () => {
    window.history.back();
  };

  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = keyframes;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={styles.errorPage}>
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>
          <AlertCircle size={64} />
        </div>
        
        <h1 style={styles.errorCode}>Error {errorCode}</h1>
        <p style={styles.errorMessage}>{errorMessage}</p>
        
        {errorStack && (
          <details style={styles.errorStack}>
            <summary style={styles.errorStackSummary}>Technical Details</summary>
            <pre style={styles.errorStackPre}>{errorStack}</pre>
          </details>
        )}

        <div style={styles.errorActions}>
          <button 
            onClick={handleGoBack} 
            style={{
              ...styles.errorButton,
              ':hover': {
                backgroundColor: '#4b5563',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
          <button 
            onClick={handleRefresh} 
            style={{
              ...styles.errorButton,
              ':hover': {
                backgroundColor: '#4b5563',
                transform: 'translateY(-2px)'
              }
            }}
          >
            <RefreshCw size={20} />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}