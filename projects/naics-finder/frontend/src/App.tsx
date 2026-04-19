import { useState } from 'react';
import SingleLookup from './components/SingleLookup';
import BatchUpload from './components/BatchUpload';

type Mode = 'single' | 'batch';

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e0e0e0',
    padding: '1.5rem 2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: 600,
    color: '#1a1a1a',
  },
  subtitle: {
    margin: '0.5rem 0 0 0',
    color: '#666',
    fontSize: '0.95rem',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
  },
  modeSelector: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    backgroundColor: '#ffffff',
    padding: '0.5rem',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    width: 'fit-content',
  },
  modeButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  modeButtonActive: {
    backgroundColor: '#0066cc',
    color: '#ffffff',
  },
  modeButtonInactive: {
    backgroundColor: 'transparent',
    color: '#666',
  },
};

function App() {
  const [mode, setMode] = useState<Mode>('single');

  return (
    <div style={styles.container}>
      <GlobalStyles />
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>🔍 NAICS Finder</h1>
          <p style={styles.subtitle}>
            Find NAICS codes for companies using AI-powered classification
          </p>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.modeSelector}>
          <button
            style={{
              ...styles.modeButton,
              ...(mode === 'single' ? styles.modeButtonActive : styles.modeButtonInactive),
            }}
            onClick={() => setMode('single')}
          >
            Single Company
          </button>
          <button
            style={{
              ...styles.modeButton,
              ...(mode === 'batch' ? styles.modeButtonActive : styles.modeButtonInactive),
            }}
            onClick={() => setMode('batch')}
          >
            Batch Upload
          </button>
        </div>

        {mode === 'single' ? <SingleLookup /> : <BatchUpload />}
      </main>
    </div>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      * {
        box-sizing: border-box;
      }
      
      body {
        margin: 0;
        padding: 0;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
      
      button:hover:not(:disabled) {
        opacity: 0.9;
      }
      
      input:focus, textarea:focus {
        outline: none;
        border-color: #0066cc !important;
        box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
      }
    `}</style>
  );
}

export default App;
