'use client';

import { useState, useRef } from 'react';

interface CSVImportProps {
  clientId: string;
  onImportComplete: () => void;
}

export default function CSVImport({ clientId, onImportComplete }: CSVImportProps) {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): { date: string; description: string; amount: number }[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row');
    
    const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Find column indices
    const dateIdx = header.findIndex(h => h.includes('date'));
    const descIdx = header.findIndex(h => h.includes('description') || h.includes('desc') || h.includes('memo') || h.includes('payee') || h.includes('name'));
    const amountIdx = header.findIndex(h => h.includes('amount') || h.includes('debit') || h.includes('credit'));

    if (dateIdx === -1 || amountIdx === -1) {
      throw new Error('CSV must have Date and Amount columns. Found headers: ' + header.join(', '));
    }

    const transactions: { date: string; description: string; amount: number }[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Simple CSV parse (handles quoted fields)
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const date = values[dateIdx] || '';
      const description = descIdx !== -1 ? (values[descIdx] || 'Unknown') : 'Unknown';
      
      let amountStr = amountIdx !== -1 ? (values[amountIdx] || '0') : '0';
      // Clean amount - remove $ and parens (negative)
      amountStr = amountStr.replace(/[$,]/g, '').trim();
      if (amountStr.startsWith('(') && amountStr.endsWith(')')) {
        amountStr = '-' + amountStr.slice(1, -1);
      }
      
      const amount = parseFloat(amountStr);
      if (isNaN(amount) || !date) continue;
      
      transactions.push({ date, description, amount });
    }

    if (transactions.length === 0) {
      throw new Error('No valid transactions found in CSV. Check column headers and data format.');
    }

    return transactions;
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setImporting(true);
    setError(null);
    setSuccess(null);

    try {
      const text = await file.text();
      const transactions = parseCSV(text);
      
      const response = await fetch(`/api/clients/${clientId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Import failed');
      }

      const data = await response.json();
      setSuccess(`Successfully imported ${data.imported} transactions!`);
      onImportComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to import CSV');
    } finally {
      setImporting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
        <div className="text-4xl mb-2">📄</div>
        <p className="text-gray-600 font-medium">
          {importing ? 'Importing...' : 'Drop CSV here or click to upload'}
        </p>
        <p className="text-gray-400 text-sm mt-1">
          Must have Date, Description, and Amount columns
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          ✅ {success}
        </div>
      )}
    </div>
  );
}