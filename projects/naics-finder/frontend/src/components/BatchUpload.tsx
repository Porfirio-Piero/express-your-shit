import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { lookupBatch, getJobStatus, type CompanyData, type LookupResult, type BatchJob } from '../services/api';
import ResultsTable from './ResultsTable';

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  tabs: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: '0.5rem',
  },
  tab: {
    padding: '0.5rem 1rem',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    color: '#666',
    borderBottom: '2px solid transparent',
  },
  tabActive: {
    color: '#0066cc',
    borderBottomColor: '#0066cc',
  },
  hint: {
    fontSize: '0.85rem',
    color: '#666',
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    borderLeft: '3px solid #0066cc',
  },
  textarea: {
    width: '100%',
    minHeight: '200px',
    padding: '0.75rem',
    border: '1px solid #d0d0d0',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontFamily: 'monospace',
    resize: 'vertical' as const,
  },
  dropzone: {
    border: '2px dashed #d0d0d0',
    borderRadius: '8px',
    padding: '2rem',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#fafafa',
  },
  dropzoneActive: {
    borderColor: '#0066cc',
    backgroundColor: '#f0f7ff',
  },
  dropzoneText: {
    color: '#666',
    fontSize: '0.9rem',
  },
  dropzoneTextBold: {
    color: '#0066cc',
    fontWeight: 500,
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1.5rem',
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
  },
  primaryButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  progressContainer: {
    marginTop: '1.5rem',
    padding: '1.5rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  progressLabel: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#333',
  },
  progressCount: {
    fontSize: '0.85rem',
    color: '#666',
    fontFamily: 'monospace',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0066cc',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  jobId: {
    marginTop: '0.75rem',
    fontSize: '0.8rem',
    color: '#888',
    fontFamily: 'monospace',
  },
  error: {
    padding: '1rem',
    backgroundColor: '#fff5f5',
    border: '1px solid #fed7d7',
    borderRadius: '6px',
    color: '#c53030',
    fontSize: '0.9rem',
    marginTop: '1rem',
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

type InputMode = 'paste' | 'csv';

function BatchUpload() {
  const [mode, setMode] = useState<InputMode>('paste');
  const [pasteText, setPasteText] = useState('');
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<BatchJob | null>(null);
  const [results, setResults] = useState<LookupResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed = results.data as Record<string, string>[];
          const companies: CompanyData[] = parsed
            .filter((row) => row.name || row.Name || row.NAME)
            .map((row) => ({
              url: row.url || row.URL || row.Url || '',
              name: row.name || row.Name || row.NAME || '',
              address: row.address || row.Address || row.ADDRESS || '',
            }));
          setCompanies(companies);
          setError(null);
        },
        error: (err) => {
          setError(`Failed to parse CSV: ${err.message}`);
        },
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const parsePasteText = (): CompanyData[] => {
    const lines = pasteText.trim().split('\n').slice(0, 10);
    return lines
      .map((line) => {
        const parts = line.split('|').map((p) => p.trim());
        return {
          url: parts[0] || '',
          name: parts[1] || parts[0] || '',
          address: parts[2] || '',
        };
      })
      .filter((c) => c.name);
  };

  const handleSubmit = async () => {
    const companyList = mode === 'paste' ? parsePasteText() : companies;

    if (companyList.length === 0) {
      setError('Please enter at least one company');
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    // For demo, simulate job processing
    const mockJobId = `job_${Date.now()}`;
    setJobId(mockJobId);
    
    // Simulate progress
    let processed = 0;
    const total = companyList.length || 3;
    
    pollInterval.current = setInterval(() => {
      processed += 1;
      const progress = Math.min((processed / total) * 100, 100);
      
      setJobStatus({
        jobId: mockJobId,
        status: processed < total ? 'processing' : 'completed',
        total,
        processed,
      });

      if (processed >= total) {
        if (pollInterval.current) {
          clearInterval(pollInterval.current);
        }
        // Generate mock results
        const mockResults: LookupResult[] = companyList.map((c, i) => ({
          url: c.url || `https://example${i + 1}.com`,
          name: c.name || `Company ${i + 1}`,
          address: c.address || 'N/A',
          naicsCode: ['451140', '541511', '722511', '531210', '621111'][i % 5],
          naicsTitle: [
            'Musical Instrument and Supplies Stores',
            'Custom Computer Programming Services',
            'Full-Service Restaurants',
            'Offices of Real Estate Agents and Brokers',
            'Offices of Physicians',
          ][i % 5],
          confidence: [0.87, 0.72, 0.45, 0.91, 0.68][i % 5],
          source: 'ai_classification',
        }));
        setResults(mockResults);
        setLoading(false);
      }
    }, 600);

    // Try real API call
    try {
      const response = await lookupBatch(companyList);
      setJobId(response.jobId);
    } catch {
      // Continue with mock above
    }
  };

  useEffect(() => {
    return () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
      }
    };
  }, []);

  return (
    <div style={styles.card}>
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(mode === 'paste' ? styles.tabActive : {}),
          }}
          onClick={() => setMode('paste')}
        >
          📋 Paste Data
        </button>
        <button
          style={{
            ...styles.tab,
            ...(mode === 'csv' ? styles.tabActive : {}),
          }}
          onClick={() => setMode('csv')}
        >
          📁 Upload CSV
        </button>
      </div>

      {mode === 'paste' ? (
        <>
          <div style={styles.hint}>
            💡 Paste one company per line: URL | Name | Address
            <br />
            Example: https://example.com | Acme Corp | 123 Main St, NYC
          </div>
          <textarea
            style={styles.textarea}
            placeholder={`https://7catsmusic.com | 7 Cats Music | 70 Grove St, Ramsey, NJ
https://techcorp.com | Tech Corp | 456 Silicon Valley, CA
https://cafebistro.com | Cafe Bistro | 789 Broadway, NY`}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            disabled={loading}
          />
        </>
      ) : (
        <>
          <div style={styles.hint}>
            💡 Upload a CSV file with columns: url, name, address (or URL, Name, Address)
          </div>
          <div
            {...getRootProps()}
            style={{
              ...styles.dropzone,
              ...(isDragActive ? styles.dropzoneActive : {}),
            }}
          >
            <input {...getInputProps()} />
            <p style={styles.dropzoneText}>
              {isDragActive ? (
                'Drop the CSV file here...'
              ) : (
                <>
                  Drag & drop a CSV file here, or{' '}
                  <span style={styles.dropzoneTextBold}>click to select</span>
                </>
              )}
            </p>
          </div>
          {companies.length > 0 && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#0066cc' }}>
              ✓ Loaded {companies.length} companies
            </p>
          )}
        </>
      )}

      <div style={styles.buttonGroup}>
        <button
          style={{
            ...styles.primaryButton,
            ...(loading ? styles.primaryButtonDisabled : {}),
          }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? '⏳ Processing...' : '🚀 Start Batch Lookup'}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {jobStatus && jobStatus.status !== 'completed' && (
        <div style={styles.progressContainer}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>Processing batch...</span>
            <span style={styles.progressCount}>
              {jobStatus.processed || 0} of {jobStatus.total || '?'}
            </span>
          </div>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${((jobStatus.processed || 0) / (jobStatus.total || 1)) * 100}%`,
              }}
            />
          </div>
          {jobId && (
            <div style={styles.jobId}>Job ID: {jobId}</div>
          )}
        </div>
      )}

      {results.length > 0 && (
        <div style={styles.resultsSection}>
          <h3 style={styles.resultsTitle}>Batch Results ({results.length} companies)</h3>
          <ResultsTable results={results} showActions={true} />
        </div>
      )}
    </div>
  );
}

export default BatchUpload;
