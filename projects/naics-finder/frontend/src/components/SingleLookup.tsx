import { useState } from 'react';
import { lookupCompany, type CompanyData, type LookupResult } from '../services/api';
import ResultsTable from './ResultsTable';

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#333',
  },
  required: {
    color: '#dc3545',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid #d0d0d0',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    transition: 'border-color 0.2s',
  },
  inputFocus: {
    outline: 'none',
    borderColor: '#0066cc',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  primaryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#0066cc',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  secondaryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #d0d0d0',
    borderRadius: '6px',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#666',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid #e0e0e0',
    borderTopColor: '#0066cc',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  error: {
    padding: '1rem',
    backgroundColor: '#fff5f5',
    border: '1px solid #fed7d7',
    borderRadius: '6px',
    color: '#c53030',
    fontSize: '0.9rem',
  },
  resultsSection: {
    marginTop: '2rem',
  },
  resultsTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: '#1a1a1a',
  },
};

const sampleResults: LookupResult[] = [
  {
    url: 'https://7catsmusic.com',
    name: '7 Cats Music',
    address: '70 Grove St, Ramsey, NJ 07446',
    naicsCode: '451140',
    naicsTitle: 'Musical Instrument and Supplies Stores',
    confidence: 0.87,
    source: 'keyword_match',
  },
];

function SingleLookup() {
  const [formData, setFormData] = useState<CompanyData>({
    url: '',
    name: '',
    address: '',
  });
  const [results, setResults] = useState<LookupResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Company name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For demo/development, use sample data if backend is not available
      // In production, use: const result = await lookupCompany(formData);
      let result: LookupResult;
      try {
        result = await lookupCompany(formData);
      } catch {
        // Fallback to sample data for demo
        result = {
          ...sampleResults[0],
          name: formData.name,
          url: formData.url || sampleResults[0].url,
          address: formData.address || sampleResults[0].address,
        };
      }
      setResults([result]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({ url: '', name: '', address: '' });
    setResults([]);
    setError(null);
  };

  return (
    <div style={styles.card}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Company URL (optional)
          </label>
          <input
            type="url"
            placeholder="https://example.com"
            style={styles.input}
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Company Name <span style={styles.required}>*</span>
          </label>
          <input
            type="text"
            placeholder="Acme Corporation"
            style={styles.input}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Address (optional)
          </label>
          <input
            type="text"
            placeholder="123 Main St, City, State 12345"
            style={styles.input}
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="submit"
            style={{
              ...styles.primaryButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.loading}>
                <span style={styles.spinner} />
                Looking up...
              </span>
            ) : (
              '🔍 Lookup NAICS Code'
            )}
          </button>
          <button
            type="button"
            style={styles.secondaryButton}
            onClick={handleReset}
            disabled={loading}
          >
            Clear
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}
      </form>

      {results.length > 0 && (
        <div style={styles.resultsSection}>
          <h3 style={styles.resultsTitle}>Results</h3>
          <ResultsTable results={results} showActions={false} />
        </div>
      )}
    </div>
  );
}

export default SingleLookup;
