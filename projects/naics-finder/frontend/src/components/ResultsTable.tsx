import { useState, useMemo } from 'react';
import type { LookupResult } from '../services/api';

interface ResultsTableProps {
  results: LookupResult[];
  showActions?: boolean;
}

type SortField = 'confidence' | 'name' | 'naicsCode';
type SortDirection = 'asc' | 'desc';

const styles = {
  tableContainer: {
    overflowX: 'auto' as const,
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.9rem',
  },
  thead: {
    backgroundColor: '#f8f9fa',
  },
  th: {
    padding: '0.75rem',
    textAlign: 'left' as const,
    fontWeight: 600,
    color: '#333',
    borderBottom: '2px solid #e0e0e0',
    cursor: 'pointer',
    userSelect: 'none' as const,
    whiteSpace: 'nowrap' as const,
  },
  thSortable: {
    ':hover': {
      backgroundColor: '#e9ecef',
    },
  },
  td: {
    padding: '0.75rem',
    borderBottom: '1px solid #e0e0e0',
    color: '#333',
  },
  tdMonospace: {
    fontFamily: 'monospace',
    fontSize: '0.85rem',
  },
  confidence: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontWeight: 500,
    fontFamily: 'monospace',
    display: 'inline-block',
  },
  confidenceHigh: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  confidenceMedium: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  confidenceLow: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  url: {
    color: '#0066cc',
    textDecoration: 'none',
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    display: 'inline-block',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  iconButton: {
    padding: '0.25rem 0.5rem',
    border: '1px solid #d0d0d0',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    fontSize: '0.8rem',
    ':hover': {
      backgroundColor: '#e0e0e0',
    },
  },
  exportPanel: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
  },
  exportButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#28a745',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: 500,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  exportButtonSecondary: {
    backgroundColor: '#17a2b8',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '2rem',
    color: '#666',
  },
  sortIndicator: {
    marginLeft: '0.25rem',
    fontSize: '0.75rem',
  },
};

function ResultsTable({ results, showActions = true }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>('confidence');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const sortedResults = useMemo(() => {
    const sorted = [...results];
    sorted.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'confidence':
          comparison = a.confidence - b.confidence;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'naicsCode':
          comparison = a.naicsCode.localeCompare(b.naicsCode);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [results, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getConfidenceStyle = (confidence: number) => {
    if (confidence > 0.8) return styles.confidenceHigh;
    if (confidence >= 0.5) return styles.confidenceMedium;
    return styles.confidenceLow;
  };

  const exportToCSV = () => {
    const headers = ['URL', 'Company Name', 'Address', 'NAICS Code', 'NAICS Title', 'Confidence', 'Source'];
    const rows = results.map((r) => [
      r.url || '',
      r.name,
      r.address || '',
      r.naicsCode,
      r.naicsTitle,
      `${(r.confidence * 100).toFixed(1)}%`,
      r.source,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `naics-results-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    const headers = ['URL', 'Company Name', 'Address', 'NAICS Code', 'NAICS Title', 'Confidence', 'Source'];
    const rows = results.map((r) => [
      r.url || '',
      r.name,
      r.address || '',
      r.naicsCode,
      r.naicsTitle,
      `${(r.confidence * 100).toFixed(1)}%`,
      r.source,
    ]);

    // Create tab-separated values with HTML table for Excel
    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"></head>
      <body>
        <table>
          <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </body>
      </html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `naics-results-${new Date().toISOString().split('T')[0]}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (results.length === 0) {
    return (
      <div style={styles.emptyState}>
        No results yet. Submit a lookup to see results here.
      </div>
    );
  }

  return (
    <>
      <div style={styles.exportPanel}>
        <button style={styles.exportButton} onClick={exportToCSV}>
          📄 Export CSV
        </button>
        <button
          style={{ ...styles.exportButton, ...styles.exportButtonSecondary }}
          onClick={exportToExcel}
        >
          📊 Export Excel
        </button>
        <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#666' }}>
          {results.length} result{results.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead style={styles.thead}>
            <tr>
              <th style={styles.th}>URL</th>
              <th style={styles.th}>Company Name</th>
              <th style={styles.th}>Address</th>
              <th style={{ ...styles.th, ...styles.thSortable }} onClick={() => handleSort('naicsCode')}>
                NAICS Code
                {sortField === 'naicsCode' && (
                  <span style={styles.sortIndicator}>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th style={styles.th}>Title</th>
              <th style={{ ...styles.th, ...styles.thSortable }} onClick={() => handleSort('confidence')}>
                Confidence
                {sortField === 'confidence' && (
                  <span style={styles.sortIndicator}>{sortDirection === 'asc' ? '▲' : '▼'}</span>
                )}
              </th>
              <th style={styles.th}>Source</th>
              {showActions && <th style={styles.th}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((result, index) => (
              <tr key={index}>
                <td style={styles.td}>
                  {result.url ? (
                    <a href={result.url} target="_blank" rel="noopener noreferrer" style={styles.url}>
                      {result.url.replace(/^https?:\/\//, '').substring(0, 30)}...
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td style={styles.td}>{result.name}</td>
                <td style={styles.td}>{result.address || '—'}</td>
                <td style={{ ...styles.td, ...styles.tdMonospace }}>{result.naicsCode}</td>
                <td style={styles.td}>{result.naicsTitle}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.confidence, ...getConfidenceStyle(result.confidence) }}>
                    {(result.confidence * 100).toFixed(0)}%
                  </span>
                </td>
                <td style={{ ...styles.td, ...styles.tdMonospace }}>{result.source}</td>
                {showActions && (
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        style={styles.iconButton}
                        onClick={() => navigator.clipboard.writeText(result.naicsCode)}
                        title="Copy NAICS Code"
                      >
                        📋
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default ResultsTable;
